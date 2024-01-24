import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoggedInEvent } from '../impl';

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInHandler
  implements IEventHandler<UserLoggedInEvent> {
  handle(event: UserLoggedInEvent) {
    console.log(
      `Handled UserLoggedInEvent with data ${JSON.stringify(event)}`,
    );
  }
}
