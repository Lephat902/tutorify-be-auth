import { ItemOwnerNotifiedHandler } from "./item-owner-notified.handler";
import { UserLoggedInHandler } from "./user-loggedin.handler";
import { UserCreatedHandler } from "./user-created.handler";

export const EventHandlers = [
  UserLoggedInHandler,
  UserCreatedHandler,
  ItemOwnerNotifiedHandler,
];
