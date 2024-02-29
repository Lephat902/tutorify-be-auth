import { ICommand } from '@nestjs/cqrs';

export class BlockUserCommand implements ICommand {
    constructor(public readonly userId: string) { }
}