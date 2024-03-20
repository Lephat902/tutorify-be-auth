import { ApproveTutorHandler } from './approve-tutor.handler';
import { BlockUserHandler } from './block-user.handler';
import { DeletePortfolioHandler } from './delete-portfolio.handler';
import { LoginHandler } from './login.handler';
import { UnblockUserHandler } from './unblock-user.handler';
import { VerifyEmailHandler } from './verify-email.handler';

export const CommandHandlers = [
    LoginHandler,
    VerifyEmailHandler,
    ApproveTutorHandler,
    BlockUserHandler,
    UnblockUserHandler,
    DeletePortfolioHandler,
];