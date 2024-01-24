import { IEvent } from '@nestjs/cqrs';
import { UserEventType } from '../../user-event.type';

export class ItemOwnerNotifiedEvent implements IEvent {
  constructor(public readonly event: UserEventType) { }
}
