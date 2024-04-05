import { ICommand } from '@nestjs/cqrs';

export class RejectTutorCommand implements ICommand {
    constructor(public readonly tutorId: string) { }
}