import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../impl/login.command';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor, User, UserDocument } from 'src/user/infrastructure/schemas';
import { BroadcastService, LoginStatus, UserLoggedInEvent, UserLoggedInEventPayload, UserRole } from '@tutorify/shared';
import { Builder } from 'builder-pattern';

const MAX_LOGIN_FAILURE_ALLOWED = 5;

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: LoginCommand) {
        const { loginDto } = command;
        const { email, username, password } = loginDto;

        const existingUser = await this.findUserByEmailOrUsername(email, username);
        this.checkUserStatus(existingUser);

        const successfulLogin = await this.checkPassword(existingUser, password);

        const loginStatus = successfulLogin ? LoginStatus.SUCCESSFUL : LoginStatus.FAILED;
        this.dispatchEvent(existingUser.id, loginStatus);
        if (!successfulLogin) {
            throw new UnauthorizedException('Invalid credentials');
        }

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

        this.checkRoleSpecificStatus(user);
    }

    private checkRoleSpecificStatus(user: User) {
        const userRole = user.role;
        if (userRole === UserRole.TUTOR) {
            this.checkTutorStatus(user as Tutor);
        }
    }

    private checkTutorStatus(tutor: Tutor) {
        if (!tutor.isApproved) {
            throw new UnauthorizedException('Tutor account not approved yet');
        }
    }

    private async checkPassword(user: UserDocument, password: string) {
        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            user.loginFailureCount++;
            user.save();
            return false;
        }

        // Reset login failure count on successful login
        user.loginFailureCount = 0;
        user.save();
        return true;
    }

    private dispatchEvent(userId: string, status: LoginStatus) {
        const eventPayload = Builder<UserLoggedInEventPayload>()
            .userId(userId)
            .status(status)
            .build();
        const event = new UserLoggedInEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}