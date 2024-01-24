import { CreateUserHandler } from './create-user.handler';
import { LoginHandler } from './login.handler';
import { NotifyItemOwnerHandler } from './notify-item-owner.handler';

export const CommandHandlers = [
    CreateUserHandler,
    LoginHandler,
    NotifyItemOwnerHandler,
]