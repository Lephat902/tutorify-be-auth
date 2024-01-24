import { IEvent } from '@nestjs/cqrs';
import { LoginDto } from 'src/user/application/dtos';

export class UserLoggedInEvent implements IEvent {
    constructor(public readonly loginDto: LoginDto) { }
}
