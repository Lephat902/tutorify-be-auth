import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReadRepository, UserWriteRepository } from './repositories';
import { User } from './user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
    ]),
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
