import { IQuery } from '@nestjs/cqrs';
import { UserQueryDto } from '../../dtos';

export class GetUsersAndTotalCountQuery implements IQuery {
    constructor(public readonly filters: UserQueryDto) { }
}