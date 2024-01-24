import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
  ],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers, UserService],
})
export class ApplicationModule { }