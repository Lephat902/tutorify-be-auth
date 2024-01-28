import { BadRequestException, Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserCommand } from '../impl/create-user.command';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from 'src/user/domain/user.repository';
import { User, Tutor, Student, UserDocument } from 'src/user/infrastructure/schemas';
import { UserRole } from 'src/user/infrastructure/enums';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        @InjectModel(Student.name) private readonly studentModel: Model<Student>,
        @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
        @Inject('VERIFICATION_SERVICE') private readonly tokenClient: ClientProxy,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
    ) { }

    async execute(command: CreateUserCommand) {
        const { createUserDto } = command;
        console.log(createUserDto)
        const { email, username, password, role, ...otherFields } = createUserDto;

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

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);

        let newUser: UserDocument;

        // Create a new user instance based on the role
        switch (role) {
            case UserRole.TUTOR:
                newUser = new this.tutorModel({
                    email,
                    username,
                    password: hashedPassword,
                    role,
                    ...otherFields,
                });
                break;
            case UserRole.STUDENT:
                newUser = new this.studentModel({
                    email,
                    username,
                    password: hashedPassword,
                    role,
                    ...otherFields,
                });
                break;
            default:
                newUser = new this.userModel({
                    email,
                    username,
                    password: hashedPassword,
                    role,
                    ...otherFields,
                });
                break;
        }

        // Save the user to the database
        const savedUser = await newUser.save();

        // Send confirmation token and email (example only, adjust as needed)
        const token = await firstValueFrom(
            this.tokenClient.send<string>({ cmd: 'insert' }, savedUser.id)
        );

        await firstValueFrom(
            this.mailClient.send<string>({ cmd: 'sendUserConfirmation' }, {
                user: { name: savedUser.firstName, email: savedUser.email },
                token
            })
        );

        // Dispatch UserCreatedEvent event
        const user = this._publisher.mergeObjectContext(
            this.userRepository.createUser(createUserDto),
        );
        user.commit();

        // Return the saved user
        return savedUser;
    }
}
