import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { MailerProxy, VerificationTokenProxy } from '@tutorify/shared';
import { Model } from 'mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { RequestResetPasswordCommand } from '../impl';

@CommandHandler(RequestResetPasswordCommand)
export class RequestResetPasswordHandler implements ICommandHandler<RequestResetPasswordCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly mailerProxy: MailerProxy,
        private readonly verificationTokenProxy: VerificationTokenProxy,
    ) { }

    async execute(command: RequestResetPasswordCommand) {
        const { email } = command;

        // If successful, set emailVerified of user entity to true
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const token = await this.verificationTokenProxy.createNewToken(user.id);

        this.mailerProxy.sendResetPassword(user, token);

        return true;
    }
}
