import { ClassSerializerInterceptor, Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDto, LoginDto } from './auth.dto';
import { User } from './user.entity';
import { AuthService } from './auth.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern({ cmd: 'getUser' })
  getUser(id: string): Promise<User> {
    return this.authService.getUser(id);
  }

  @MessagePattern({ cmd: 'createUser' })
  createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.authService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  login(loginDto: LoginDto): Promise<User> {
    return this.authService.login(loginDto);
  }
}
