import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { VerificationTokenProxy } from '@tutorify/shared';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { ResetPasswordCommand } from '../impl';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly verificationTokenProxy: VerificationTokenProxy,
    ) { }

    async execute(command: ResetPasswordCommand) {
        const { resetPasswordDto } = command;
        const { token, newPassword } = resetPasswordDto;

        const userId = await this.verificationTokenProxy.verify(token);

        // If successful, set emailVerified of user entity to true
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        user.password = await argon2.hash(newPassword);
        user.loginFailureCount = 0;
        user.save();

        return true;
    }
}
