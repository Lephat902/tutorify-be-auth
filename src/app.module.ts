import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/infrastructure/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://johnlee800w:APt5Yey1rgkM@ep-dawn-dust-a1korfya-pooler.ap-southeast-1.aws.neon.tech/db_user?sslmode=require',
      entities: [User],
      synchronize: true,
    }),
    UserModule,
  ],
})
export class AppModule {}
