import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/login.command';
import { UserWriteRepository } from 'src/user/infrastructure/repositories';
import { RpcException } from '@nestjs/microservices';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/domain/user.repository';
import * as argon2 from 'argon2';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly _repository: UserWriteRepository,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
    ) { }

    async execute(command: LoginCommand) {
        const { loginDto } = command;

        const { email, username, password } = loginDto;

        // Find the user by email or username
        const existingUser = await this._repository.findOne({
            where: email ? { email } : { username }
        });

        if (!existingUser) {
            throw new RpcException(new NotFoundException('User not found'));
        }

        // Check if the provided password matches the stored password
        const isPasswordValid = await argon2.verify(existingUser.password, password);
        if (!isPasswordValid) {
            throw new RpcException(new UnauthorizedException('Invalid credentials'));
        }

        // Dispatch UserLoggedin event
        const user = this._publisher.mergeObjectContext(
            this.userRepository.loginUser(loginDto),
        );
        user.commit();

        return existingUser;
    }
}
