import { Logger } from '@nestjs/common';
import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { CreateUserCommand } from '../impl/create-user.command';
import { UserWriteRepository } from 'src/user/infrastructure/repositories';
import { UserRepository } from 'src/user/domain/user.repository';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly _repository: UserWriteRepository,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
    ) { }

    async execute(command: CreateUserCommand) {
        Logger.log('Async CreateUserHandler...', 'CreateUserCommand');

        const { createUserDto } = command;

        const { password, ...otherFields } = createUserDto;

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);
        const newUser = this._repository.create({ password: hashedPassword, ...otherFields });

        // Dispatch UserCreatedEvent event
        const user = this._publisher.mergeObjectContext(
            this.userRepository.createUser(createUserDto),
        );
        user.commit();

        // Save the user to the repository
        return await this._repository.save(newUser);
    }
}
