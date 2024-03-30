import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../impl/login.command';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor, User, UserDocument } from 'src/user/infrastructure/schemas';
import {
  BroadcastService,
  LoginStatus,
  UserLoggedInEvent,
  UserLoggedInEventPayload,
  UserRole,
} from '@tutorify/shared';
import { Builder } from 'builder-pattern';
import { checkPassword } from '../../helpers';

export const MAX_LOGIN_FAILURE_ALLOWED = 5;

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly broadcastService: BroadcastService,
  ) {}

  async execute(command: LoginCommand) {
    const { loginDto } = command;
    const { email, username, password } = loginDto;

    const existingUser = await this.findUserByEmailOrUsername(email, username);
    this.checkUserStatus(existingUser);

    const successfulLogin = await checkPassword(existingUser, password);

    const loginStatus = successfulLogin
      ? LoginStatus.SUCCESSFUL
      : LoginStatus.FAILED;
    this.dispatchEvent(existingUser.id, loginStatus);
    if (!successfulLogin) {
      const loginAttemptsLeft =
        MAX_LOGIN_FAILURE_ALLOWED - existingUser.loginFailureCount;
      throw new UnauthorizedException(
        `You have ${loginAttemptsLeft} login attempts left`,
      );
    }

    return existingUser;
  }

  private async findUserByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({ $or: [{ email }, { username }] })
      .exec();

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
      throw new UnauthorizedException(
        'Account locked due to multiple login failures',
      );
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

  private dispatchEvent(userId: string, status: LoginStatus) {
    const eventPayload = Builder<UserLoggedInEventPayload>()
      .userId(userId)
      .status(status)
      .build();
    const event = new UserLoggedInEvent(eventPayload);
    this.broadcastService.broadcastEventToAllMicroservices(
      event.pattern,
      event.payload,
    );
  }
}
