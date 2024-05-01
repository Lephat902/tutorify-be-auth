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
        const { findOneUserOptions } = command;
        const { id, email, username } = findOneUserOptions;

        let user: UserDocument | null = null;

        if (id || email || username) {
            user = await this.userModel.findOne({
                ...(id && { _id: id }),
                ...(email && { email }),
                ...(username && { username }),
            });
        }

        if (!user) {
            throw new NotFoundException(`User not found`);
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
