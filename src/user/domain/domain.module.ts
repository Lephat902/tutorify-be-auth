import { Global, Module } from '@nestjs/common';
import { EventHandlers } from './events/handlers';
import { UserSagas } from './sagas';
import { UserRepository } from './user.repository';

@Global()
@Module({
  providers: [UserRepository, UserSagas, ...EventHandlers],
  exports: [UserRepository],
})
export class DomainModule { }
