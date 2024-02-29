import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { BlockUserCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { User } from 'src/user/infrastructure/schemas';
import { BroadcastService, UserBlockedEvent, UserBlockedEventPayload } from '@tutorify/shared';

@CommandHandler(BlockUserCommand)
export class BlockUserHandler implements ICommandHandler<BlockUserCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: BlockUserCommand) {
        const { userId } = command;

        // If successful, set isBlocked of user entity to true
        const user = await this.userModel.findById(userId);
        if (user) {
            user.isBlocked = true;
            await user.save();
        }

        this.dispatchEvent(userId);

        return true;
    }

    private dispatchEvent(userId: string) {
        const eventPayload = Builder<UserBlockedEventPayload>()
            .userId(userId)
            .build();
        const event = new UserBlockedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
