import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { UserCreatedEvent, UserLoggedInEvent } from '../events/impl';
import { NotifyItemOwnerCommand } from 'src/user/application/commands/impl';

@Injectable()
export class UserSagas {
  @Saga()
  userLoggedin = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserLoggedInEvent),
      delay(1000),
      map((event) => {
        console.log(`Inside userLoggedin @Saga: ${event}`);
        return new NotifyItemOwnerCommand(event);
      }),
    );
  };

  @Saga()
  userCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      delay(1000),
      map((event) => {
        console.log(`Inside userCreated @Saga: ${event}`);
        return new NotifyItemOwnerCommand(event);
      }),
    );
  };
}
