import { ICommand } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dtos';

export class CreateUserCommand implements ICommand {
    constructor(public readonly createUserDto: CreateUserDto) {}
}
