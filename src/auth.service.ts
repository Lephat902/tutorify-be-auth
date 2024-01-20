import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto, LoginDto } from './auth.dto';
import { RpcException } from '@nestjs/microservices';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly authRepository: Repository<User>,
    ) { }

    async getUser(id: string): Promise<User> {
        const user = await this.authRepository.findOneBy({ id });
        if (!user) {
            throw new RpcException(
                new NotFoundException('User Not Found')
            );
        }
        return user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...otherFields } = createUserDto;

        // Hash the provided password using argon2
        const hashedPassword = await argon2.hash(password);
        const newUser = this.authRepository.create({ password: hashedPassword, ...otherFields });

        // Save the user to the repository
        return await this.authRepository.save(newUser);
    }

    async login(loginDto: LoginDto): Promise<User> {
        const { email, username, password } = loginDto;

        // Find the user by email or username
        const existingUser = await this.authRepository.findOne({
            where: email ? { email } : { username }
        });

        if (!existingUser) {
            throw new RpcException(new NotFoundException('User not found'));
        }

        // Check if the provided password matches the stored password
        const isPasswordValid = await argon2.verify(existingUser.password, password);
        if (!isPasswordValid) {
            throw new RpcException(new UnauthorizedException('Invalid credentials'));
        }

        return existingUser;
    }
}
