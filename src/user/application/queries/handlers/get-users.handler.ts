import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../impl/get-users.query';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { SortingDirection } from '@tutorify/shared';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async execute(query: GetUsersQuery): Promise<User[]> {
        const { filters } = query;
        const { page, limit, dir, role, q, gender, includeEmailNotVerified, includeBlocked, includeNotApproved, order } = filters;

        const options: QueryOptions = {
            limit,
            skip: (page - 1) * limit,
            sort: order ? { [order]: dir === SortingDirection.ASC ? 1 : -1 } : {},
        };

        const userQuery: FilterQuery<User> = {};

        if (q) {
            userQuery.$or = [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
            ];
        }

        if (role) {
            userQuery.role = role;
        }

        if (gender) {
            userQuery.gender = gender;
        }

        if (!includeEmailNotVerified) {
            userQuery.emailVerified = true;
        }

        if (!includeBlocked) {
            userQuery.isBlocked = false;
        }

        if (!includeNotApproved) {
            userQuery.isApproved = true;
        }

        return this.userModel.find(userQuery, null, options).exec();
    }
}