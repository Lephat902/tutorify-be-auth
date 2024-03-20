import { BadRequestException, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserSaga } from '../impl';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { User, Tutor, UserDocument } from 'src/user/infrastructure/schemas';
import { BroadcastService, FileUploadResponseDto, QueueNames, UserRole, UserUpdatedEvent, UserUpdatedEventPayload } from '@tutorify/shared';
import { Builder as SagaBuilder, Saga } from 'nestjs-saga';
import { UpdateTutorDto } from '../../dtos';
import { Builder } from 'builder-pattern';
import { checkPassword } from '../../helpers';
import { MAX_LOGIN_FAILURE_ALLOWED } from '../../commands/handlers/login.handler';

@Saga(UpdateUserSaga)
export class UpdateUserSagaHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
        @Inject(QueueNames.FILE) private readonly fileClient: ClientProxy,
    ) { }
    private existingUser: UserDocument;
    private avatarUploadResult: FileUploadResponseDto = null;
    private portfoliosUploadResult: FileUploadResponseDto[] = [];
    private savedUser: User;

    saga = new SagaBuilder<UpdateUserSaga, User>()

        .step('Validate user data')
        .invoke(this.step1)

        .step('Upload avatar')
        .invoke(this.step2)
        .withCompensation(this.step2Compensation)

        .step('Upload portfolios if signing up tutor')
        .invoke(this.step3)
        .withCompensation(this.step3Compensation)

        .step('Update user')
        .invoke(this.step4)

        .step('Dispatch user-updated event')
        .invoke(this.step5)

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
                throw new BadRequestException("Username cannot be empty");
            }
            // Check if username already exists
            const existingUsernameUser = await this.userModel.findOne({ username });
            if (existingUsernameUser) {
                throw new BadRequestException('Username already exists');
            }
        }

        if (password) {
            if (!oldPassword) {
                throw new BadRequestException(`You must provide old password to reset password`);
            }
            const oldPasswordValid = await checkPassword(this.existingUser, oldPassword);
            if (!oldPasswordValid) {
                const loginAttemptsLeft = MAX_LOGIN_FAILURE_ALLOWED - this.existingUser.loginFailureCount;
                throw new UnauthorizedException(`You have ${loginAttemptsLeft} login attempts left`);
            }
        }
    }

    private async step2(cmd: UpdateUserSaga) {
        const { avatar } = cmd.updateBaseUserDto;
        if (avatar)
            this.avatarUploadResult = await firstValueFrom(this.fileClient.send({ cmd: 'uploadSingleFile' }, { file: avatar }));
    }

    private async step3(cmd: UpdateUserSaga) {
        const { updateBaseUserDto } = cmd;
        if (this.existingUser.role === UserRole.TUTOR) {
            const updateTutorDto = updateBaseUserDto as UpdateTutorDto;
            const { portfolios } = updateTutorDto;
            if (portfolios)
                this.portfoliosUploadResult = await firstValueFrom(this.fileClient.send({ cmd: 'uploadMultipleFiles' }, { files: portfolios }));
        }
    }

    private async step4(cmd: UpdateUserSaga) {
        const fullUpdateBaseUserDto = cmd.updateBaseUserDto;
        const { password, avatar, ...updateBaseUserDto } = fullUpdateBaseUserDto;

        // Update the existingUser fields
        Object.assign(this.existingUser, updateBaseUserDto);

        if (password) {
            // Hash the provided password using argon2
            const hashedPassword = await argon2.hash(password);
            this.existingUser.password = hashedPassword;
        }

        if (avatar) {
            this.existingUser.avatar = this.avatarUploadResult;
        }

        // Update the user's portfolios if new ones are provided and the user is a tutor
        if (this.existingUser.role === UserRole.TUTOR && this.portfoliosUploadResult) {
            (this.existingUser as unknown as Tutor).tutorPortfolios = this.portfoliosUploadResult;
        }

        // Save the updated user to the database
        this.savedUser = await this.existingUser.save();
    }

    private step5(cmd: UpdateUserSaga) {
        let proficienciesIds: string[];
        if (this.savedUser.role === UserRole.TUTOR) {
            const { updateBaseUserDto } = cmd;
            const updateTutorDto = updateBaseUserDto as UpdateTutorDto;
            proficienciesIds = updateTutorDto.proficienciesIds;
        }
        const eventPayload = Builder<UserUpdatedEventPayload>()
            .userId(this.savedUser._id.toString())
            .email(this.savedUser.email)
            .username(this.savedUser.username)
            .firstName(this.savedUser.firstName)
            .lastName(this.savedUser.lastName)
            .role(this.savedUser.role)
            .proficienciesIds(proficienciesIds)
            .build();
        const event = new UserUpdatedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }

    private async step2Compensation(cmd: UpdateUserSaga) {
        if (this.avatarUploadResult) {
            await firstValueFrom(this.fileClient.send({ cmd: 'deleteSingleFile' }, this.avatarUploadResult.id));
        }
    }

    private async step3Compensation(cmd: UpdateUserSaga) {
        if (this.portfoliosUploadResult?.length) {
            const idsToDelete = this.portfoliosUploadResult.map(portpolio => portpolio.id);
            await firstValueFrom(this.fileClient.send({ cmd: 'deleteMultipleFiles' }, idsToDelete));
        }
    }

    private buildResult(cmd: UpdateUserSaga): User {
        return this.savedUser;
    }
}
