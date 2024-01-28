import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../impl/get-users.query';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

    async execute(): Promise<User[]> {
        return this.userModel.find();
    }
}
