import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/login.command';
import { UserWriteRepository } from 'src/user/infrastructure/repositories';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/domain/user.repository';
import * as argon2 from 'argon2';
import { User } from 'src/user/infrastructure/user.entity';
import { LoginDto } from '../../dtos';

const MAX_LOGIN_FAILURE_ALLOWED = 5;

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

        const existingUser = await this.findUserByEmailOrUsername(email, username);
        this.checkUserStatus(existingUser);

        await this.checkPassword(existingUser, password);

        this.handleSuccessfulLogin(loginDto);

        return existingUser;
    }

    private async findUserByEmailOrUsername(email: string, username: string) {
        const existingUser = await this._repository.findOne({
            where: email ? { email } : { username }
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        return existingUser;
    }

    private checkUserStatus(user: User) {
        if (user.isBlocked) {
            throw new UnauthorizedException('User is blocked');
        }

        if (!user.emailVerified) {
            throw new UnauthorizedException('Email not verified');
        }

        if (user.loginFailureCount > MAX_LOGIN_FAILURE_ALLOWED) {
            throw new UnauthorizedException('Account locked due to multiple login failures');
        }
    }

    private async checkPassword(user: User, password: string) {
        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            user.loginFailureCount++;
            await this._repository.save(user);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Reset login failure count on successful login
        user.loginFailureCount = 0;
        await this._repository.save(user);
    }

    private handleSuccessfulLogin(loginDto: LoginDto) {
        const userContext = this._publisher.mergeObjectContext(
            this.userRepository.loginUser(loginDto),
        );
        userContext.commit();
    }
}
