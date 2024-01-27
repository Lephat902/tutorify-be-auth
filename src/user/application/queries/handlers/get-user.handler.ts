import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../impl/get-user.query';
import { UserReadRepository } from 'src/user/infrastructure/repositories';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/user/infrastructure/user.entity';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
    constructor(
        private readonly _repository: UserReadRepository,
    ) { }

    async execute(query: GetUserQuery): Promise<User> {
        const { findData } = query;
        const user = await this._repository.findOne(findData);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
