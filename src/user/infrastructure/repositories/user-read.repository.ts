import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';

@Injectable()
export class UserReadRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.findOneBy({ email });
    }

    async findByUsername(username: string): Promise<User | undefined> {
        return this.findOneBy({ username });
    }
}
