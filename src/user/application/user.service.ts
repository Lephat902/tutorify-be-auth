import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery, GetUsersQuery } from './queries/impl';
import { ApproveTutorCommand, BlockUserCommand, LoginCommand, UnblockUserCommand, VerifyEmailCommand } from './commands/impl';
import { CreateBaseUserDto, LoginDto , UserQueryDto } from './dtos';
import { User } from '../infrastructure/schemas';
import { CreateUserSaga } from './sagas/impl';

@Injectable()
export class UserService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  getUserById(userId: string): Promise<User> {
    return this.queryBus.execute(new GetUserByIdQuery(userId));
  }

  getUsers(filters: UserQueryDto): Promise<User[]> {
    return this.queryBus.execute(new GetUsersQuery(filters));
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

  approveTutor(tutorId: string) {
    return this.commandBus.execute(new ApproveTutorCommand(tutorId));
  }

  blockUser(userId: string) {
    return this.commandBus.execute(new BlockUserCommand(userId));
  }

  unblockUser(userId: string) {
    return this.commandBus.execute(new UnblockUserCommand(userId));
  }
}
