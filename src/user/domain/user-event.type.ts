import { UserCreatedEvent, UserLoggedInEvent } from "./events/impl";

export type UserEventType =
  | UserLoggedInEvent
  | UserCreatedEvent;
