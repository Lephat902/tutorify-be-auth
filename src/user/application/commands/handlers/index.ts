import { LoginHandler } from './login.handler';
import { NotifyItemOwnerHandler } from './notify-item-owner.handler';
import { VerifyEmailHandler } from './verify-email.handler';

export const CommandHandlers = [
    LoginHandler,
    NotifyItemOwnerHandler,
    VerifyEmailHandler,
]