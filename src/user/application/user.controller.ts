import { ClassSerializerInterceptor, Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '../infrastructure/user.entity';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dtos';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @MessagePattern({ cmd: 'getUser' })
  getUser(id: string): Promise<User> {
    return this.userService.getUser(id);
  }

  @MessagePattern({ cmd: 'verifyEmail' })
  verifyEmail(token: string) {
    return this.userService.verifyEmail(token);
  }

  @MessagePattern({ cmd: 'createUser' })
  createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  login(loginDto: LoginDto): Promise<User> {
    return this.userService.login(loginDto);
  }
}
