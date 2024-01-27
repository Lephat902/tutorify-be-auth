import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'mail',
          queueOptions: {
            durable: false
          },
        },
      },
      {
        name: 'VERIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'verification',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers, UserService],
})
export class ApplicationModule { }