import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { CreateUserCommand } from '../impl/create-user.command';
import { UserReadRepository, UserWriteRepository } from 'src/user/infrastructure/repositories';
import { UserRepository } from 'src/user/domain/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly writeRepository: UserWriteRepository,
        private readonly readRepository: UserReadRepository,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
        @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
        @Inject('VERIFICATION_SERVICE') private readonly tokenClient: ClientProxy,
    ) { }

    async execute(command: CreateUserCommand) {
        const { createUserDto } = command;
        const { email, username, password, ...otherFields } = createUserDto;

        // Check if email already exists
        const existingEmailUser = await this.readRepository.findByEmail(email);
        if (existingEmailUser) {
            throw new BadRequestException('Email already exists');
        }

        // Check if username already exists
        const existingUsernameUser = await this.readRepository.findByUsername(username);
        if (existingUsernameUser) {
            throw new BadRequestException('Username already exists');
        }

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);
        let newUser = this.writeRepository.create({ password: hashedPassword, email, username, ...otherFields });

        newUser = await this.writeRepository.save(newUser);

        // Send confirmation token and email
        const token = await firstValueFrom(
            this.tokenClient.send<string>({ cmd: 'insert' }, newUser.id)
        );

        await firstValueFrom(
            this.mailClient.send<string>({ cmd: 'sendUserConfirmation' }, {
                user: { name: newUser.firstName, email: newUser.email },
                token
            })
        );

        // Dispatch UserCreatedEvent event
        const user = this._publisher.mergeObjectContext(
            this.userRepository.createUser(createUserDto),
        );
        user.commit();

        // Save the user to the repository
        return newUser;
    }
}
