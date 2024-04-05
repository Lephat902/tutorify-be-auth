import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { UserService } from '../user.service';
import { MongooseClassSerializerInterceptor } from '../interceptors/mongoose-class-serializer.interceptor';
import { TutorRejectedEventPattern, TutorRejectedEventPayload } from '@tutorify/shared';

@Controller()
@UseInterceptors(MongooseClassSerializerInterceptor())
export class EventHandler {
  constructor(private readonly userService: UserService) { }

  @EventPattern(new TutorRejectedEventPattern())
  handleTutorRejected(payload: TutorRejectedEventPayload) {
    const { tutorId } = payload;
    // The tutor account will then be deleted
    return this.userService.deleteUser(tutorId);
  }
}