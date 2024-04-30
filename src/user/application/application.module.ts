import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  BroadcastModule,
  ProxiesModule
} from '@tutorify/shared';
import { SagaModule } from 'nestjs-saga';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CommandHandlers } from './commands/handlers';
import { Controllers } from './controllers';
import { QueryHandlers } from './queries/handlers';
import { SagaHandlers } from './sagas/handlers';
import { UserService } from './user.service';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
    BroadcastModule,
    SagaModule.register({
      imports: [ApplicationModule],
      sagas: SagaHandlers,
    }),
    ProxiesModule,
  ],
  controllers: Controllers,
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    UserService,
  ],
  exports: [
    BroadcastModule,
    ProxiesModule,
  ],
})
export class ApplicationModule { }
