import { IEvent } from '@nestjs/cqrs';
import { CreateUserDto } from 'src/user/application/dtos';

export class UserCreatedEvent implements IEvent {
    constructor(public readonly createUserDto: CreateUserDto) { }
}
