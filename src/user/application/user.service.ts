import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from './queries/impl';
import { LoginCommand, VerifyEmailCommand } from './commands/impl';
import { CreateBaseUserDto, LoginDto } from './dtos';
import { User } from '../infrastructure/schemas';
import { CreateUserSaga } from './sagas/impl';

@Injectable()
export class UserService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  getUser(userId: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  verifyEmail(token: string) {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  createUser(createUserDto: CreateBaseUserDto): Promise<User> {
    return this.commandBus.execute(new CreateUserSaga(createUserDto));
  }

  login(loginDto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(loginDto));
  }
}
