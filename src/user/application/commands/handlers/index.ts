import { ApproveTutorHandler } from './approve-tutor.handler';
import { BlockUserHandler } from './block-user.handler';
import { DeleteUserHandler } from './delete-user.handler';
import { LoginHandler } from './login.handler';
import { RejectTutorHandler } from './reject-tutor.handler';
import { ResetPasswordByAdminHandler } from './reset-password-by-admin.handler';
import { UnblockUserHandler } from './unblock-user.handler';
import { VerifyEmailHandler } from './verify-email.handler';

export const CommandHandlers = [
    LoginHandler,
    VerifyEmailHandler,
    ApproveTutorHandler,
    BlockUserHandler,
    UnblockUserHandler,
    RejectTutorHandler,
    DeleteUserHandler,
    ResetPasswordByAdminHandler,
];