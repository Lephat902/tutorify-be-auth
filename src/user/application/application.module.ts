import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'MAIL_SERVICE',
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: 'mail',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: 'VERIFICATION_SERVICE',
        inject: [ConfigService], // Inject ConfigService
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: 'verification-token',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers, UserService],
})
export class ApplicationModule { }
