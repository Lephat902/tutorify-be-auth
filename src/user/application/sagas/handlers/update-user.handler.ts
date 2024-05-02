import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserSaga } from '../impl';
import { Tutor, User, UserDocument } from 'src/user/infrastructure/schemas';
import {
  AddressProxy,
  BroadcastService,
  FileProxy,
  UserRole,
  UserUpdatedEvent,
  UserUpdatedEventPayload,
} from '@tutorify/shared';
import { Builder as SagaBuilder, Saga } from 'nestjs-saga';
import { UpdateBaseUserDto, UpdateStudentDto, UpdateTutorDto } from '../../dtos';
import { Builder } from 'builder-pattern';
import { checkPassword, getMongoDBGeocode } from '../../helpers';
import { MAX_LOGIN_FAILURE_ALLOWED } from '../../commands/handlers/login.handler';

@Saga(UpdateUserSaga)
export class UpdateUserSagaHandler {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly broadcastService: BroadcastService,
    private readonly fileProxy: FileProxy,
    private readonly addressProxy: AddressProxy,
  ) { }
  private existingUser: UserDocument;
  private savedUser: User;
  private filesIdsToDelete: string[] = [];

  saga = new SagaBuilder<UpdateUserSaga, User>()

    .step('Validate user data')
    .invoke(this.step1)

    .step('Update user')
    .invoke(this.step2)

    .step('Dispatch user-updated event')
    .invoke(this.step3)

    .step('Clean dangling files (async)')
    .invoke(this.step4)

    .return(this.buildResult)

    .build();

  private async step1(cmd: UpdateUserSaga) {
    const { id, updateBaseUserDto } = cmd;
    const { username, password, oldPassword } = updateBaseUserDto;

    // Fetch the existing user
    this.existingUser = await this.userModel.findById(id);
    if (!this.existingUser) {
      throw new NotFoundException('User not found');
    }

    if (username !== undefined) {
      if (!username) {
        throw new BadRequestException('Username cannot be empty');
      }
      // Not re-submit the same value
      if (username !== this.existingUser.username) {
        // Check if username already exists
        const existingUsernameUser = await this.userModel.findOne({
          username: { $regex: username, $options: 'i' }
        });
        if (existingUsernameUser) {
          throw new BadRequestException('Username already exists');
        }
      }
    }

    if (password) {
      if (!oldPassword) {
        throw new BadRequestException(
          `You must provide old password to reset password`,
        );
      }
      const oldPasswordValid = await checkPassword(
        this.existingUser,
        oldPassword,
      );
      if (!oldPasswordValid) {
        const loginAttemptsLeft =
          MAX_LOGIN_FAILURE_ALLOWED - this.existingUser.loginFailureCount;

        throw new UnauthorizedException(
          `You have ${loginAttemptsLeft} login attempts left`,
        );
      }
    }
  }

  private async step2(cmd: UpdateUserSaga) {
    const { updateBaseUserDto } = cmd;
    const { address, wardId } = updateBaseUserDto;

    // Specify files to delete before updating
    this.filesIdsToDelete = UpdateUserSagaHandler.getFilesToCleanUp(this.existingUser, updateBaseUserDto);

    // There is changes in address
    if (address !== undefined || wardId !== undefined) {
      this.existingUser.location = await getMongoDBGeocode(this.addressProxy, address, wardId);
    }

    // Update the existingUser fields
    Object.assign(this.existingUser, updateBaseUserDto);

    if (updateBaseUserDto.password !== undefined) {
      const hashedPassword = await argon2.hash(updateBaseUserDto.password);
      this.existingUser.password = hashedPassword;
    }

    // Save the updated user to the database
    this.savedUser = await this.existingUser.save();
  }

  private step3(cmd: UpdateUserSaga) {
    const { updateBaseUserDto } = cmd;
    const userRole = this.savedUser.role;
    const eventPayload = Builder<UserUpdatedEventPayload>()
      .userId(this.savedUser._id.toString())
      .email(this.savedUser.email)
      .username(this.savedUser.username)
      .firstName(this.savedUser.firstName)
      .lastName(this.savedUser.lastName)
      .role(userRole)
      .location(this.savedUser.location)
      .proficienciesIds([])
      .interestedClassCategoryIds([])
      .build();

    if (userRole === UserRole.TUTOR) {
      const updateTutorDto = updateBaseUserDto as UpdateTutorDto;
      if (Array.isArray(updateTutorDto.proficienciesIds))
        eventPayload.proficienciesIds.push(...updateTutorDto.proficienciesIds);
    } else if (userRole === UserRole.STUDENT) {
      const updateStudentDto = updateBaseUserDto as UpdateStudentDto;
      if (Array.isArray(updateStudentDto.interestedClassCategoryIds))
        eventPayload.interestedClassCategoryIds.push(...updateStudentDto.interestedClassCategoryIds);
    }

    const event = new UserUpdatedEvent(eventPayload);
    this.broadcastService.broadcastEventToAllMicroservices(
      event.pattern,
      event.payload,
    );
  }

  private step4(cmd: UpdateUserSaga) {
    // do it asynchronously with no await
    this.fileProxy.deleteMultipleFiles(this.filesIdsToDelete);
  }

  private buildResult(cmd: UpdateUserSaga): User {
    return this.savedUser;
  }

  private static getFilesToCleanUp(currentUserState: User, updateBaseUserDto: UpdateBaseUserDto) {
    const filesToCleanUp = [];
    // If new avatar is set and old avatar exist
    if (updateBaseUserDto?.avatar && currentUserState?.avatar) {
      filesToCleanUp.push(currentUserState.avatar.id);
    }
    // If old value is not empty array and new value is defined
    if (
      (currentUserState as Tutor)?.tutorPortfolios?.length
      && (updateBaseUserDto as UpdateTutorDto)?.tutorPortfolios
    ) {
      // Get the one that presents in current one but not in new one
      const portfoliosIdsToCleanUp = (currentUserState as Tutor).tutorPortfolios
        .filter(currentPortfolio =>
          !(updateBaseUserDto as UpdateTutorDto).tutorPortfolios.some(updatedPortfolio =>
            currentPortfolio.id === updatedPortfolio.id
          )
        )
        .map(portfolio => portfolio.id);
      filesToCleanUp.push(...portfoliosIdsToCleanUp);
    }

    return filesToCleanUp;
  }
}
