import { Global, Module, OnModuleInit } from '@nestjs/common';
import { EventHandlers } from './events/handlers';
import { UserSagas } from './sagas';
import { UserRepository } from './user.repository';
import { events } from './events/impl';
import { RabbitMQSubscriber } from './messaging/RabbitMQSusbscriber';
import { RabbitMQPublisher } from './messaging/RabbitMQPublisher';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CqrsModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserRepository,
    UserSagas,
    ...EventHandlers,
    {
      provide: 'EVENTS',
      useValue: events,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
  ],
  exports: [UserRepository],
})
export class DomainModule implements OnModuleInit {
  constructor(
    private readonly event$: EventBus,
    private readonly rbmqPublisher: RabbitMQPublisher,
    private readonly rbmqSubscriber: RabbitMQSubscriber,
  ) { }

  async onModuleInit(): Promise<any> {
    this.rbmqSubscriber.connect();
    this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

    this.rbmqPublisher.connect();
    this.event$.publisher = this.rbmqPublisher;
  }
}
