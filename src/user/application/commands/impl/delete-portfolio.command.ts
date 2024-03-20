import { ICommand } from '@nestjs/cqrs';

export class DeletePortfolioCommand implements ICommand {
    constructor(
        public readonly tutorId: string,
        public readonly portfolioId: string,
    ) { }
}