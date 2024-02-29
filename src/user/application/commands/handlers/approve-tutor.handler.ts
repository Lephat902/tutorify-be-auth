import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ApproveTutorCommand } from '../impl';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Builder } from 'builder-pattern';
import { Tutor } from 'src/user/infrastructure/schemas';
import { BroadcastService, TutorApprovedEvent, TutorApprovedEventPayload } from '@tutorify/shared';
import { BadRequestException } from '@nestjs/common';

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
        if (tutor) {
            if (!tutor.emailVerified) {
                throw new BadRequestException("Tutor's email not verified yet");
            }
            tutor.isApproved = true;
            await tutor.save();
        }

        this.dispatchEvent(tutorId);

        return true;
    }

    private dispatchEvent(tutorId: string) {
        const eventPayload = Builder<TutorApprovedEventPayload>()
            .tutorId(tutorId)
            .build();
        const event = new TutorApprovedEvent(eventPayload);
        this.broadcastService.broadcastEventToAllMicroservices(event.pattern, event.payload);
    }
}
