import { ICommand } from '@nestjs/cqrs';
import { FindOneUserOptions } from '../../dtos';

export class DeleteUserCommand implements ICommand {
    constructor(public readonly findOneUserOptions: FindOneUserOptions) { }
}