import { ICommand } from '@nestjs/cqrs';

export class ApproveTutorCommand implements ICommand {
    constructor(public readonly tutorId: string) { }
}