import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from '../impl';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { BroadcastService, QueueNames, UserEmailVerifiedEvent, UserEmailVerifiedEventPayload } from '@tutorify/shared';
import { Builder } from 'builder-pattern';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
        @Inject(QueueNames.VERIFICATION_TOKEN) private readonly client: ClientProxy,
    ) { }

    async execute(command: VerifyEmailCommand) {
        const { token } = command;

        // If verification is successful, userId is returned
        const userId = await firstValueFrom(this.client.send<string>({ cmd: 'verify' }, token));

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
