import { ICommand } from '@nestjs/cqrs';

export class UnblockUserCommand implements ICommand {
    constructor(public readonly userId: string) { }
}