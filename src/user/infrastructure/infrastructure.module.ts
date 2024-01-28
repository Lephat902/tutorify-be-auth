import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema, Tutor, TutorSchema, User, UserSchema } from './schemas';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      // without useFactory and async, SECRET cannot be read by configService
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Tutor.name,
        schema: TutorSchema
      },
      {
        name: Student.name,
        schema: StudentSchema
      },
    ])
  ],
  providers: [
    MongooseModule,
    User,
  ],
  exports: [
    MongooseModule,
    User,
  ]
})
export class InfrastructureModule { }
