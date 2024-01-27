import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReadRepository, UserWriteRepository } from './repositories';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: configService.get('DATABASE_TYPE'),
        url: configService.get('DATABASE_URI'),
        entities: [User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserReadRepository,
    UserWriteRepository,
  ],
  exports: [
    UserReadRepository,
    UserWriteRepository,
  ]
})
export class InfrastructureModule {}
