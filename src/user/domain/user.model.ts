import { AggregateRoot } from '@nestjs/cqrs';
import { UserEventType } from './user-event.type';
import { CreateUserDto, LoginDto } from '../application/dtos';
import { ItemOwnerNotifiedEvent, UserCreatedEvent, UserLoggedInEvent } from './events/impl';

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
