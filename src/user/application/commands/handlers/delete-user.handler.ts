import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { User, UserDocument } from 'src/user/infrastructure/schemas';
import { BroadcastService, UserDeletedEvent, UserDeletedEventPayload } from '@tutorify/shared';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: DeleteUserCommand) {
        const { userId } = command;

        // If successful, set isApproved of user entity to true
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }
        await user.deleteOne();

        this.dispatchEvent(user);

        return true;
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
