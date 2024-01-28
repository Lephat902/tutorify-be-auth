import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UserRepository } from 'src/user/domain/user.repository';
import { VerifyEmailCommand } from '../impl';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/infrastructure/schemas';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
        @Inject('VERIFICATION_SERVICE') private readonly client: ClientProxy,
    ) { }

    async execute(command: VerifyEmailCommand) {
        const { token } = command;

        // If verification is successful, userId is returned
        const userId = await firstValueFrom(this.client.send<string>({ cmd: 'verify' }, token));

        // If successful, set emailVerified of user entity to true
        const user = await this.userModel.findById(userId);
        if (user) {
            user.emailVerified = true;
            await user.save();
        }

        this.handleSuccessfulEmailVerified(userId);

	return true;
    }

    private handleSuccessfulEmailVerified(userId: string) {
        const userContext = this._publisher.mergeObjectContext(
            this.userRepository.verifyEmail(userId),
        );
        userContext.commit();
    }
}
