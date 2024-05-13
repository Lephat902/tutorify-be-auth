import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ApproveTutorCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { Tutor } from 'src/user/infrastructure/schemas';
import { BroadcastService, TutorApprovedEvent, TutorApprovedEventPayload } from '@tutorify/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@CommandHandler(ApproveTutorCommand)
export class ApproveTutorHandler implements ICommandHandler<ApproveTutorCommand> {
    constructor(
        @InjectModel(Tutor.name) private readonly tutorModel: Model<Tutor>,
        private readonly broadcastService: BroadcastService,
    ) { }

    async execute(command: ApproveTutorCommand) {
        const { tutorId } = command;

        // If successful, set isApproved of tutor entity to true
        const tutor = await this.tutorModel.findById(tutorId);
        if (!tutor) {
            throw new NotFoundException(`Tutor ${tutorId} not found`);
        }
        if (tutor.isApproved) {
            throw new BadRequestException(`Tutor ${tutorId} already approved`);
        }
        tutor.isApproved = true;
        tutor.approvedAt = new Date();
        await tutor.save();

        this.dispatchEvent(tutor);

        return true;
    }

    private dispatchEvent(tutor: Tutor) {
        const eventPayload = Builder<TutorApprovedEventPayload>()
            .tutorId(tutor._id.toString())
            .email(tutor.email)
            .firstName(tutor.firstName)
            .middleName(tutor.middleName)
            .lastName(tutor.lastName)
            .build();
        const event = new TutorApprovedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
