import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UnblockUserCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { User } from 'src/user/infrastructure/schemas';
import { BroadcastService, UserUnblockedEvent, UserUnblockedEventPayload } from '@tutorify/shared';

@CommandHandler(UnblockUserCommand)
export class UnblockUserHandler implements ICommandHandler<UnblockUserCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: UnblockUserCommand) {
        const { userId } = command;

        // If successful, set isBlocked of user entity to false
        const user = await this.userModel.findById(userId);
        if (user) {
            user.isBlocked = false;
            user.save();
        }

        this.dispatchEvent(userId);

        return true;
    }

    private dispatchEvent(userId: string) {
        const eventPayload = Builder<UserUnblockedEventPayload>()
            .userId(userId)
            .build();
        const event = new UserUnblockedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
