import { ICommand } from '@nestjs/cqrs';

export class CleanupTestAccountCommand implements ICommand {
    constructor() { }
}