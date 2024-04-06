import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersAndTotalCountQuery } from '../impl/get-users-and-total-count.query';
import { FilterQuery, Model, QueryOptions, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';

@QueryHandler(GetUsersAndTotalCountQuery)
export class GetUsersAndTotalCountHandler implements IQueryHandler<GetUsersAndTotalCountQuery> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async execute(query: GetUsersAndTotalCountQuery): Promise<{ totalCount: number, results: User[] }> {
        const { filters } = query;
        const { page, limit, role, q, gender, emailVerified, isBlocked, isApproved } = filters;

        const options: QueryOptions<User> = {
            limit,
            skip: (page - 1) * limit,
        };

        const userQuery: FilterQuery<User> = {};

        if (q) {
            userQuery.$or = [
                { firstName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ];
            if (Types.ObjectId.isValid(q)) {
                userQuery.$or.push({ _id: q });
            }        
        }

        if (role) {
            userQuery.role = role;
        }

        if (gender) {
            userQuery.gender = gender;
        }

        if (typeof emailVerified === 'boolean') {
            userQuery.emailVerified = emailVerified;
        }

        if (typeof isBlocked === 'boolean') {
            userQuery.isBlocked = isBlocked;
        }

        if (typeof isApproved === 'boolean') {
            userQuery.isApproved = isApproved;
        }

        const [results, totalCount] = await Promise.all([
            this.userModel.find(userQuery, null, options).exec(),
            this.userModel.countDocuments(userQuery).exec()
        ]);

        return { totalCount, results };
    }
}