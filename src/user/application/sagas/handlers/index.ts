import { CreateUserSagaHandler } from './create-user.handler';
import { UpdateUserSagaHandler } from './update-user.handler';

export const SagaHandlers = [
    CreateUserSagaHandler,
    UpdateUserSagaHandler,
];