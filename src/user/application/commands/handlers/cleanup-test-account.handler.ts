import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BroadcastService, UserDeletedEvent, UserDeletedEventPayload } from '@tutorify/shared';
import { Builder } from 'builder-pattern';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/infrastructure/schemas';
import { CleanupTestAccountCommand } from '../impl';

@CommandHandler(CleanupTestAccountCommand)
export class CleanupTestAccountHandler implements ICommandHandler<CleanupTestAccountCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: CleanupTestAccountCommand) {
        const accounts = await this.userModel
            .find({
                emailVerified: false,
                email: {
                    $regex: '^(test(?!Auth)).*@((example|test)\.com)$',
                    $options: 'i'
                }
            })
            .select(['id', 'role']);
        await Promise.allSettled(accounts.map(account => account.deleteOne()));
        accounts.forEach(account => this.dispatchEvent(account));
    }

    private dispatchEvent(user: UserDocument) {
        const eventPayload = Builder<UserDeletedEventPayload>()
            .userId(user.id)
            .role(user.role)
            .build();
        const event = new UserDeletedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
