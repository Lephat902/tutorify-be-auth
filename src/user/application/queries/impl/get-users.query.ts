import { IQuery } from '@nestjs/cqrs';
import { UserQueryDto } from '../../dtos';

export class GetUsersQuery implements IQuery {
    constructor(public readonly filters: UserQueryDto) { }
}