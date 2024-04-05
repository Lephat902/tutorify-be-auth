import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { RejectTutorCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { Tutor } from 'src/user/infrastructure/schemas';
import { BroadcastService, TutorRejectedEvent, TutorRejectedEventPayload } from '@tutorify/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@CommandHandler(RejectTutorCommand)
export class RejectTutorHandler implements ICommandHandler<RejectTutorCommand> {
    constructor(
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: RejectTutorCommand) {
        const { tutorId } = command;

        // If successful, set isRejected of tutor entity to true
        const tutor = await this.tutorModel.findById(tutorId);
        if (!tutor) {
            throw new NotFoundException(`Tutor ${tutorId} not found`);
        }
        if (tutor.isApproved) {
            throw new BadRequestException(`Tutor ${tutorId} already approved`);
        }

        this.dispatchEvent(tutor);

        return true;
    }

    private dispatchEvent(tutor: Tutor) {
        const eventPayload = Builder<TutorRejectedEventPayload>()
            .tutorId(tutor._id.toString())
            .email(tutor.email)
            .firstName(tutor.firstName)
            .middleName(tutor.middleName)
            .lastName(tutor.lastName)
            .build();
        const event = new TutorRejectedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
