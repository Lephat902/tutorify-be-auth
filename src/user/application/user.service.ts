import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { User } from '../infrastructure/user.entity';
import { GetUserQuery } from './queries/impl';
import { CreateUserCommand, LoginCommand } from './commands/impl';
import { CreateUserDto, LoginDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  async getUser(id: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery({ where: { id: id } }));
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  async login(loginDto: LoginDto): Promise<User> {
    return this.commandBus.execute(new LoginCommand(loginDto));
  }
}
