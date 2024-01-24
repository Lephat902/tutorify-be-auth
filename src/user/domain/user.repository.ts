import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { UserEventType } from './user-event.type';
import { CreateUserDto, LoginDto } from '../application/dtos';

@Injectable()
export class UserRepository {
  public user: User;

  loginUser(loginDto: LoginDto): User {
    this.user = new User();

    this.user.loginUser(loginDto);

    return this.user;
  }

  createUser(createUserDto: CreateUserDto): User {
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