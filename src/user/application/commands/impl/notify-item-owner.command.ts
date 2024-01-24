import { ICommand } from '@nestjs/cqrs';
import { UserEventType } from 'src/user/domain/user-event.type';

export class NotifyItemOwnerCommand implements ICommand {
  constructor(public readonly event: UserEventType) { }
}
