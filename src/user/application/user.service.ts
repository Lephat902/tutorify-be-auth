import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery, GetUserStatisticByYearQuery, GetUsersAndTotalCountQuery } from './queries/impl';
import { ApproveTutorCommand, BlockUserCommand, CleanupTestAccountCommand, DeleteUserCommand, LoginCommand, RejectTutorCommand, RequestResetPasswordCommand, ResetPasswordByAdminCommand, ResetPasswordCommand, UnblockUserCommand, VerifyEmailCommand } from './commands/impl';
import { CreateBaseUserDto, FindOneUserOptions, LoginDto, ResetPasswordDto, UpdateBaseUserDto, UserQueryDto, UserStatisticByYearDto } from './dtos';
import { User } from '../infrastructure/schemas';
import { CreateUserSaga, UpdateUserSaga } from './sagas/impl';

@Injectable()
export class UserService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  getUserById(userId: string): Promise<User> {
    return this.queryBus.execute(new GetUserByIdQuery(userId));
  }

  getUsersAndTotalCount(filters: UserQueryDto): Promise<{ totalCount: number, results: User[] }> {
    return this.queryBus.execute(new GetUsersAndTotalCountQuery(filters));
  }

  verifyEmail(token: string) {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  resetPasswordByAdmin(userId: string) {
    return this.commandBus.execute(new ResetPasswordByAdminCommand(userId));
  }

  createUser(createUserDto: CreateBaseUserDto): Promise<User> {
    return this.commandBus.execute(new CreateUserSaga(createUserDto));
  }

  updateUser(id: string, updateUserDto: UpdateBaseUserDto): Promise<User> {
    return this.commandBus.execute(new UpdateUserSaga(id, updateUserDto));
  }

  login(loginDto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(loginDto));
  }

  approveTutor(tutorId: string) {
    return this.commandBus.execute(new ApproveTutorCommand(tutorId));
  }

  rejectTutor(tutorId: string) {
    return this.commandBus.execute(new RejectTutorCommand(tutorId));
  }

  blockUser(userId: string) {
    return this.commandBus.execute(new BlockUserCommand(userId));
  }

  unblockUser(userId: string) {
    return this.commandBus.execute(new UnblockUserCommand(userId));
  }

  deleteUser(findOneUserOptions: FindOneUserOptions) {
    return this.commandBus.execute(new DeleteUserCommand(findOneUserOptions));
  }

  requestResetPassword(email: string) {
    return this.commandBus.execute(new RequestResetPasswordCommand(email));
  }

  resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.commandBus.execute(new ResetPasswordCommand(resetPasswordDto));
  }

  cleanupTestAccount() {
    return this.commandBus.execute(new CleanupTestAccountCommand());
  }

  getUserStatisticByYear(userStatisticByYearDto: UserStatisticByYearDto) {
    return this.queryBus.execute(new GetUserStatisticByYearQuery(userStatisticByYearDto));
  }
}
