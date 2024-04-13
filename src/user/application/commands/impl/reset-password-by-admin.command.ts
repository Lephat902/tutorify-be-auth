import { ICommand } from '@nestjs/cqrs';

export class ResetPasswordByAdminCommand implements ICommand {
    constructor(public readonly userId: string) { }
}