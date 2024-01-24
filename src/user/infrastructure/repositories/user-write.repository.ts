import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';

@Injectable()
export class UserWriteRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
}
