import { Global, Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Global()
@Module({
  imports: [
    ApplicationModule, 
    DomainModule, 
    InfrastructureModule,
  ],
})
export class UserModule {}
