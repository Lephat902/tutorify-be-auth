import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BroadcastService, UserEmailVerifiedEvent, UserEmailVerifiedEventPayload, VerificationTokenProxy } from '@tutorify/shared';
import { Builder } from 'builder-pattern';
import { Model } from 'mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { VerifyEmailCommand } from '../impl';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
        private readonly verificationTokenProxy: VerificationTokenProxy,
    ) { }

    async execute(command: VerifyEmailCommand) {
        const { token } = command;

        // If verification is successful, userId is returned
        const userId = await this.verificationTokenProxy.verify(token);

        // If successful, set emailVerified of user entity to true
        const user = await this.userModel.findById(userId);
        if (user) {
            user.emailVerified = true;
            await user.save();
        }

        this.dispatchEvent(userId);

        return true;
    }

    private dispatchEvent(userId: string) {
        const eventPayload = Builder<UserEmailVerifiedEventPayload>()
            .userId(userId)
            .build();
        const event = new UserEmailVerifiedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
