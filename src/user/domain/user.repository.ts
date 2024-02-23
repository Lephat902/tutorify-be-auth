import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { UserEventType } from './user-event.type';
import { CreateBaseUserDto, LoginDto } from '../application/dtos';

@Injectable()
export class UserRepository {
  public user: User;

  loginUser(loginDto: LoginDto): User {
    this.user = new User();

    this.user.loginUser(loginDto);

    return this.user;
  }

  verifyEmail(userId: string): User {
    this.user = new User();

    this.user.verifyEmail(userId);

    return this.user;
  }

  createUser(createUserDto: CreateBaseUserDto): User {
    this.user = new User();

    this.user.createUser(createUserDto);

    return this.user;
  }

  notifyItemOwner(event: UserEventType): User {
    this.user = new User();

    this.user.notifyItemOwner(event);

    return this.user;
  }
}