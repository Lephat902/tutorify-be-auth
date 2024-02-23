import { AggregateRoot } from '@nestjs/cqrs';
import { UserEventType } from './user-event.type';
import { CreateBaseUserDto, LoginDto } from '../application/dtos';
import { ItemOwnerNotifiedEvent, UserCreatedEvent, UserLoggedInEvent } from './events/impl';
import { EmailVerifiedEvent } from './events/impl/email-verified.event';

export class User extends AggregateRoot {
  constructor(private readonly id?: number) {
    super();
  }

  loginUser(loginDto: LoginDto) {
    this.apply(new UserLoggedInEvent(loginDto));
  }

  verifyEmail(userId: string) {
    this.apply(new EmailVerifiedEvent(userId));
  }

  createUser(createUserDto: CreateBaseUserDto) {
    this.apply(new UserCreatedEvent(createUserDto));
  }

  notifyItemOwner(event: UserEventType) {
    this.apply(new ItemOwnerNotifiedEvent(event));
  }
}
