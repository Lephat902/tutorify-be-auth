import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { NotifyItemOwnerCommand } from '../impl/notify-item-owner.command';
import { UserRepository } from 'src/user/domain/user.repository';

@CommandHandler(NotifyItemOwnerCommand)
export class NotifyItemOwnerHandler
  implements ICommandHandler<NotifyItemOwnerCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly publisher: EventPublisher,
  ) { }

  async execute(command: NotifyItemOwnerCommand) {
    const itemModel = this.publisher.mergeObjectContext(
      await this.userRepository.notifyItemOwner(command.event),
    );

    itemModel.commit();
  }
}
