import { ICommand } from '@nestjs/cqrs';

export class RequestResetPasswordCommand implements ICommand {
    constructor(public readonly email: string) { }
}