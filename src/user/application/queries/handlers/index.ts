import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserStatisticByYearHandler } from './get-user-statistic-by-year.handler';
import { GetUsersAndTotalCountHandler } from './get-users-and-total-count.handler';

export const QueryHandlers = [
    GetUserByIdHandler,
    GetUsersAndTotalCountHandler,
    GetUserStatisticByYearHandler,
];