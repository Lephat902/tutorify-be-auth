import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { DeletePortfolioCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { Tutor, User } from 'src/user/infrastructure/schemas';
import { BroadcastService, QueueNames, UserUpdatedEvent, UserUpdatedEventPayload } from '@tutorify/shared';
import { Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@CommandHandler(DeletePortfolioCommand)
export class DeletePortfolioHandler implements ICommandHandler<DeletePortfolioCommand> {
    constructor(
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        @Inject(QueueNames.FILE) private readonly fileClient: ClientProxy,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: DeletePortfolioCommand) {
        const { tutorId, portfolioId } = command;

        const tutor = await this.tutorModel.findById(tutorId);
        if (!tutor) {
            throw new NotFoundException(`Tutor ${tutorId} not found`);
        }

        tutor.tutorPortfolios = tutor.tutorPortfolios.filter(portfolio => portfolio.id !== portfolioId);
        const savedUser = await tutor.save();

        await firstValueFrom(this.fileClient.send({ cmd: 'deleteSingleFile' }, portfolioId));

        this.dispatchEvent(savedUser);

        return true;
    }

    private dispatchEvent(savedUser: User) {
        let proficienciesIds: string[];
        const eventPayload = Builder<UserUpdatedEventPayload>()
            .userId(savedUser._id.toString())
            .email(savedUser.email)
            .username(savedUser.username)
            .firstName(savedUser.firstName)
            .lastName(savedUser.lastName)
            .role(savedUser.role)
            .proficienciesIds(proficienciesIds)
            .build();
        const event = new UserUpdatedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
