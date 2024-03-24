import { BadRequestException, Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserSaga } from '../impl/create-user.saga';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { User, Tutor, Student, UserDocument } from 'src/user/infrastructure/schemas';
import { BroadcastService, FileUploadResponseDto, QueueNames, UserCreatedEvent, UserCreatedEventPayload, UserRole } from '@tutorify/shared';
import { Builder as SagaBuilder, Saga } from 'nestjs-saga';
import { CreateStudentDto, CreateTutorDto } from '../../dtos';
import { Builder } from 'builder-pattern';

@Saga(CreateUserSaga)
export class CreateUserSagaHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        @InjectModel(Student.name) private readonly studentModel: Model<Student>,
        @Inject(QueueNames.MAILER) private readonly mailClient: ClientProxy,
        @Inject(QueueNames.VERIFICATION_TOKEN) private readonly tokenClient: ClientProxy,
        private readonly broadcastService: BroadcastService,
        @Inject(QueueNames.FILE) private readonly fileClient: ClientProxy,
    ) { }
    private avatarUploadResult: FileUploadResponseDto = null;
    private portfoliosUploadResult: FileUploadResponseDto[] = [];
    private savedUser: User;
    private token: string;

    saga = new SagaBuilder<CreateUserSaga, User>()

        .step('Validate user data')
        .invoke(this.step1)

        .step('Upload avatar')
        .invoke(this.step2)
        .withCompensation(this.step2Compensation)

        .step('Upload portfolios if signing up tutor')
        .invoke(this.step3)
        .withCompensation(this.step3Compensation)

        .step('Insert user')
        .invoke(this.step4)
        .withCompensation(this.step4Compensation)

        .step('Create and return new token for verification')
        .invoke(this.step5)
        .withCompensation(this.step5Compensation)

        .step('Send verification email along with token from previous step')
        .invoke(this.step6)

        .step('Dispatch user-created event')
        .invoke(this.step7)

        .return(this.buildResult)

        .build();

    private async step1(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const { email, username } = createBaseUserDto;

        // Check if email already exists
        const existingEmailUser = await this.userModel.findOne({ email });
        if (existingEmailUser) {
            throw new BadRequestException('Email already exists');
        }

        // Check if username already exists
        const existingUsernameUser = await this.userModel.findOne({ username });
        if (existingUsernameUser) {
            throw new BadRequestException('Username already exists');
        }
    }

    private async step2(cmd: CreateUserSaga) {
        const { avatar } = cmd.createBaseUserDto;
        if (avatar)
            this.avatarUploadResult = await firstValueFrom(this.fileClient.send({ cmd: 'uploadSingleFile' }, { file: avatar }));
    }

    private async step3(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const { role } = createBaseUserDto;
        if (role === UserRole.TUTOR) {
            const createTutorDto = createBaseUserDto as CreateTutorDto;
            const { portfolios } = createTutorDto;
            if (portfolios)
                this.portfoliosUploadResult = await firstValueFrom(this.fileClient.send({ cmd: 'uploadMultipleFiles' }, { files: portfolios }));
        }
    }

    private async step4(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const { password, role, gender = null } = createBaseUserDto;

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);
        const userToSave = {
            ...createBaseUserDto,
            password: hashedPassword,
            avatar: this.avatarUploadResult,
            gender
        } as User;
        let newUser: UserDocument;

        // Create a new user instance based on the role
        switch (role) {
            case UserRole.TUTOR:
                newUser = new this.tutorModel({
                    ...userToSave,
                    tutorPortfolios: this.portfoliosUploadResult,
                } as Tutor);
                break;
            case UserRole.STUDENT:
                newUser = new this.studentModel(userToSave);
                break;
            default:
                newUser = new this.userModel(userToSave);
                break;
        }

        // Save the user to the database
        this.savedUser = await newUser.save();
    }

    private async step5(cmd: CreateUserSaga) {
        this.token = await firstValueFrom(
            this.tokenClient.send<string>({ cmd: 'insert' }, this.savedUser._id.toString())
        );
    }

    private async step6(cmd: CreateUserSaga) {
        await firstValueFrom(
            this.mailClient.send<string>({ cmd: 'sendUserConfirmation' }, {
                user: { name: this.savedUser.firstName, email: this.savedUser.email },
                token: this.token,
            })
        );
    }

    private step7(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const userRole = this.savedUser.role;
        const eventPayload = Builder<UserCreatedEventPayload>()
            .userId(this.savedUser._id.toString())
            .email(this.savedUser.email)
            .username(this.savedUser.username)
            .firstName(this.savedUser.firstName)
            .lastName(this.savedUser.lastName)
            .role(userRole)
            .proficienciesIds([])
            .interestedClassCategoryIds([])
            .build();

        if (userRole === UserRole.TUTOR) {
            const createTutorDto = createBaseUserDto as CreateTutorDto;
            eventPayload.proficienciesIds.concat(createTutorDto.proficienciesIds);
        } else if (userRole === UserRole.STUDENT) {
            const createStudentDto = createBaseUserDto as CreateStudentDto;
            eventPayload.interestedClassCategoryIds.concat(createStudentDto.interestedClassCategoryIds);
        }

        const event = new UserCreatedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }

    private async step2Compensation(cmd: CreateUserSaga) {
        if (this.avatarUploadResult) {
            await firstValueFrom(this.fileClient.send({ cmd: 'deleteSingleFile' }, this.avatarUploadResult.id));
        }
    }

    private async step3Compensation(cmd: CreateUserSaga) {
        if (this.portfoliosUploadResult?.length) {
            const idsToDelete = this.portfoliosUploadResult.map(portpolio => portpolio.id);
            await firstValueFrom(this.fileClient.send({ cmd: 'deleteMultipleFiles' }, idsToDelete));
        }
    }

    private async step4Compensation(cmd: CreateUserSaga) {
        await this.userModel.deleteOne(this.savedUser._id);
    }

    private async step5Compensation(cmd: CreateUserSaga) {
        this.token = await firstValueFrom(
            this.tokenClient.send<string>({ cmd: 'deleteAll' }, this.savedUser._id.toString())
        );
    }

    private buildResult(cmd: CreateUserSaga): User {
        return this.savedUser;
    }
}
