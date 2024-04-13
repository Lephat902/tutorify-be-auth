import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ResetPasswordByAdminCommand } from '../impl';
import { NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { MailerProxy, generateRandomHex } from '@tutorify/shared';

@CommandHandler(ResetPasswordByAdminCommand)
export class ResetPasswordByAdminHandler implements ICommandHandler<ResetPasswordByAdminCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly mailerProxy: MailerProxy,
    ) { }

    async execute(command: ResetPasswordByAdminCommand) {
        const { userId } = command;

        const generatedPassword = generateRandomHex(8);

        // If successful, set emailVerified of user entity to true
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        user.password = await argon2.hash(generatedPassword);
        user.loginFailureCount = 0;
        await user.save();

        await this.mailerProxy.sendNewPassword(user, generatedPassword);

        return true;
    }
}
