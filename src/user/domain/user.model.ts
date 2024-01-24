import { AggregateRoot } from '@nestjs/cqrs';
import {
  UserCreatedEvent,
  UserLoggedInEvent,
} from './events/impl';
import { UserEventType } from './user-event.type';
import { ItemOwnerNotifiedEvent } from './events/impl/item-owner-notified.event';
import { CreateUserDto, LoginDto } from '../application/dtos';

export class User extends AggregateRoot {
  constructor(private readonly id?: number) {
    super();
  }

  loginUser(loginDto: LoginDto) {
    this.apply(new UserLoggedInEvent(loginDto));
  }

  createUser(createUserDto: CreateUserDto) {
    this.apply(new UserCreatedEvent(createUserDto));
  }

  notifyItemOwner(event: UserEventType) {
    this.apply(new ItemOwnerNotifiedEvent(event));
  }
}
