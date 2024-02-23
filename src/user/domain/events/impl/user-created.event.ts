import { IEvent } from '@nestjs/cqrs';
import { CreateBaseUserDto } from 'src/user/application/dtos';

export class UserCreatedEvent implements IEvent {
    constructor(public readonly createUserDto: CreateBaseUserDto) { }
}
