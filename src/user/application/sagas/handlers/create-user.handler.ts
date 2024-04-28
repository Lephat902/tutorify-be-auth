import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserSaga } from '../impl/create-user.saga';
import { User, Tutor, Student, UserDocument } from 'src/user/infrastructure/schemas';
import {
    BroadcastService,
    UserCreatedEvent,
    UserCreatedEventPayload,
    UserRole,
    AddressProxy,
    MailerProxy,
    VerificationTokenProxy,
} from '@tutorify/shared';
import { Builder as SagaBuilder, Saga } from 'nestjs-saga';
import { CreateStudentDto, CreateTutorDto } from '../../dtos';
import { Builder } from 'builder-pattern';
import { getMongoDBGeocode } from '../../helpers';

@Saga(CreateUserSaga)
export class CreateUserSagaHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        @InjectModel(Student.name) private readonly studentModel: Model<Student>,
        private readonly broadcastService: BroadcastService,
        private readonly mailerProxy: MailerProxy,
        private readonly verificationTokenProxy: VerificationTokenProxy,
        private readonly addressProxy: AddressProxy,
    ) { }
    private savedUser: User;
    private token: string;

    saga = new SagaBuilder<CreateUserSaga, User>()

        .step('Validate user data')
        .invoke(this.step1)

        .step('Insert user')
        .invoke(this.step2)
        .withCompensation(this.step2Compensation)

        .step('Create and return new token for verification')
        .invoke(this.step3)
        .withCompensation(this.step3Compensation)

        .step('Send verification email along with token from previous step')
        .invoke(this.step4)

        .step('Dispatch user-created event')
        .invoke(this.step5)

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
        const existingUsernameUser = await this.userModel.findOne({
            username: { $regex: username, $options: 'i' }
        });
        if (existingUsernameUser) {
            throw new BadRequestException('Username already exists');
        }
    }

    private async step2(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const { password, role, gender = null, address, wardId } = createBaseUserDto;

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);
        const location = await getMongoDBGeocode(this.addressProxy, address, wardId);

        const userToSave = {
            ...createBaseUserDto,
            password: hashedPassword,
            gender,
            location,
        } as User;
        let newUser: UserDocument;

        // Create a new user instance based on the role
        switch (role) {
            case UserRole.TUTOR:
                newUser = new this.tutorModel(userToSave);
                break;
            case UserRole.STUDENT:
                const userToSaveAsStudent = userToSave as Student;
                // If parentEmail is not specified, it is default to the account email
                if (!userToSaveAsStudent.parentEmail) {
                    userToSaveAsStudent.parentEmail = userToSave.email;
                }
                newUser = new this.studentModel(userToSave);
                break;
            default:
                newUser = new this.userModel(userToSave);
                break;
        }

        // Save the user to the database
        this.savedUser = await newUser.save();
    }

    private async step3(cmd: CreateUserSaga) {
        this.token = await this.verificationTokenProxy.createNewToken(this.savedUser._id.toString());
    }

    private async step4(cmd: CreateUserSaga) {
        await this.mailerProxy.sendUserConfirmation(this.savedUser, this.token);
    }

    private step5(cmd: CreateUserSaga) {
        const { createBaseUserDto } = cmd;
        const userRole = this.savedUser.role;
        const eventPayload = Builder<UserCreatedEventPayload>()
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
        await this.userModel.deleteOne(this.savedUser._id);
    }

    private async step3Compensation(cmd: CreateUserSaga) {
        this.token = await this.verificationTokenProxy.deleteAllTokenOfUser(this.savedUser._id.toString());
    }

    private buildResult(cmd: CreateUserSaga): User {
        return this.savedUser;
    }
}