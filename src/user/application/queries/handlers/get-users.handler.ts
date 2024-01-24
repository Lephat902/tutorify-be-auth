import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersQuery } from '../impl/get-users.query';
import { User } from 'src/user/infrastructure/user.entity';
import { UserReadRepository } from 'src/user/infrastructure/repositories';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
    constructor(
        private readonly _repository: UserReadRepository,
    ) {}

    async execute(): Promise<User[]> {
        const users = await this._repository.find();
        return users;
    }
}
