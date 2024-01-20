import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'postgres_auth',
      // port: 5432,
      // username: 'your_username',
      // password: 'your_password',
      // database: 'user_db',
      url: 'postgresql://johnlee800w:APt5Yey1rgkM@ep-dawn-dust-a1korfya-pooler.ap-southeast-1.aws.neon.tech/db_user?sslmode=require',
      entities: [User],
      synchronize: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
