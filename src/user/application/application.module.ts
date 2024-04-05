import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { UserService } from './user.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BroadcastModule, QueueNames } from '@tutorify/shared';
import { SagaModule } from 'nestjs-saga';
import { SagaHandlers } from './sagas/handlers';
import { Proxies } from './proxies';
import { Controllers } from './controllers';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
    BroadcastModule,
    SagaModule.register({
      imports: [ApplicationModule],
      sagas: SagaHandlers,
    }),
    ClientsModule.registerAsync([
      {
        name: QueueNames.MAILER,
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: QueueNames.MAILER,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: QueueNames.VERIFICATION_TOKEN,
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: QueueNames.VERIFICATION_TOKEN,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: QueueNames.FILE,
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: QueueNames.FILE,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: QueueNames.ADDRESS,
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: QueueNames.ADDRESS,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: Controllers,
  providers: [...CommandHandlers, ...QueryHandlers, UserService, ...Proxies],
  exports: [ClientsModule, BroadcastModule, ...Proxies],
})
export class ApplicationModule { }
