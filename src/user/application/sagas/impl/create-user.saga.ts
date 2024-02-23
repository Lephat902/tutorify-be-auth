import { ICommand } from '@nestjs/cqrs';
import { CreateBaseUserDto } from '../../dtos';

export class CreateUserSaga implements ICommand {
    constructor(public readonly createBaseUserDto: CreateBaseUserDto) { }
}
