import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateBaseUserDto, LoginDto } from './dtos';
import MongooseClassSerializerInterceptor from './interceptors/mongoose-class-serializer.interceptor';
import { User } from '../infrastructure/schemas';
import { UserQueryDto } from './dtos';
@Controller()
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UserController {
  constructor(private readonly userService: UserService) { }

  @MessagePattern({ cmd: 'getUserById' })
  getUserById(id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @MessagePattern({ cmd: 'getUsers' })
  getUsers(filters: UserQueryDto): Promise<User[]> {
    return this.userService.getUsers(filters);
  }

  @MessagePattern({ cmd: 'verifyEmail' })
  verifyEmail(token: string) {
    return this.userService.verifyEmail(token);
  }

  @MessagePattern({ cmd: 'createUser' })
  createUser(createUserDto: CreateBaseUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  login(loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
}
