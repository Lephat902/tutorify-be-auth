import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from '../user.service';
import { CreateBaseUserDto, LoginDto, UpdateBaseUserDto, UserQueryDto } from '../dtos';
import { MongooseClassSerializerInterceptor } from '../interceptors/mongoose-class-serializer.interceptor';
import { User } from '../../infrastructure/schemas';

@Controller()
@UseInterceptors(MongooseClassSerializerInterceptor())
export class UserController {
  constructor(private readonly userService: UserService) { }

  @MessagePattern({ cmd: 'getUserById' })
  getUserById(id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @MessagePattern({ cmd: 'getUsersAndTotalCount' })
  getUsersAndTotalCount(filters: UserQueryDto): Promise<{ totalCount: number, results: User[] }> {
    return this.userService.getUsersAndTotalCount(filters);
  }

  @MessagePattern({ cmd: 'verifyEmail' })
  verifyEmail(token: string) {
    return this.userService.verifyEmail(token);
  }

  @MessagePattern({ cmd: 'resetPasswordByAdmin' })
  resetPasswordByAdmin(userId: string) {
    return this.userService.resetPasswordByAdmin(userId);
  }

  @MessagePattern({ cmd: 'createUser' })
  createUser(createUserDto: CreateBaseUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'updateUser' })
  updateUser(data: {
    id: string,
    updateUserDto: UpdateBaseUserDto,
  }) {
    return this.userService.updateUser(data.id, data.updateUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  login(loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @MessagePattern({ cmd: 'approveTutor' })
  approveTutor(tutorId: string) {
    return this.userService.approveTutor(tutorId);
  }

  @MessagePattern({ cmd: 'rejectTutor' })
  rejectTutor(tutorId: string) {
    return this.userService.rejectTutor(tutorId);
  }

  @MessagePattern({ cmd: 'blockUser' })
  blockUser(userId: string) {
    return this.userService.blockUser(userId);
  }

  @MessagePattern({ cmd: 'unblockUser' })
  unblockUser(userId: string) {
    return this.userService.unblockUser(userId);
  }

  @MessagePattern({ cmd: 'deleteUser' })
  deleteUser(userId: string) {
    return this.userService.deleteUser(userId);
  }
}