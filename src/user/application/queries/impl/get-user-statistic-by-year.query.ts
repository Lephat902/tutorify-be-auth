import { IQuery } from '@nestjs/cqrs';
import { UserStatisticByYearDto } from '../../dtos';

export class GetUserStatisticByYearQuery implements IQuery {
    constructor(public readonly userStatisticByYearDto: UserStatisticByYearDto) { }
}