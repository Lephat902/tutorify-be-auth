import { IQuery } from '@nestjs/cqrs';
import { User } from 'src/user/infrastructure/user.entity';
import { FindOneOptions } from 'typeorm';

export class GetUserQuery implements IQuery {
    constructor(public readonly findData: FindOneOptions<User>) { }
}
