import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../impl/login.command';
import { LoginDto } from '../../dtos';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepository } from 'src/user/domain/user.repository';
import { User, UserDocument } from 'src/user/infrastructure/schemas';

const MAX_LOGIN_FAILURE_ALLOWED = 5;

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly _publisher: EventPublisher,
    ) { }

    async execute(command: LoginCommand) {
        const { loginDto } = command;
        const { email, username, password } = loginDto;

        const existingUser = await this.findUserByEmailOrUsername(email, username);
        this.checkUserStatus(existingUser);

        await this.checkPassword(existingUser, password);

        this.dispatchEvent(loginDto);
        return existingUser;
    }

    private async findUserByEmailOrUsername(email: string, username: string): Promise<UserDocument> {
        const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] }).exec();
    
        if (!existingUser) {
            throw new UnauthorizedException('User not found');
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

    private async checkPassword(user: UserDocument, password: string) {
        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            user.loginFailureCount++;
            await user.save();
            throw new UnauthorizedException('Invalid credentials');
        }

        // Reset login failure count on successful login
        user.loginFailureCount = 0;
        await user.save();
    }

    private dispatchEvent(loginDto: LoginDto) {
        const userContext = this._publisher.mergeObjectContext(
            this.userRepository.loginUser(loginDto),
        );
        userContext.commit();
    }
}
