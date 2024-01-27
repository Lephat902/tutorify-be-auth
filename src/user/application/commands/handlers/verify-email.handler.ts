import { ICommandHandler, CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UserWriteRepository } from 'src/user/infrastructure/repositories';
import { UserRepository } from 'src/user/domain/user.repository';
import { VerifyEmailCommand } from '../impl';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
    constructor(
        private readonly _repository: UserWriteRepository,
        private readonly userRepository: UserRepository,
        private readonly _publisher: EventPublisher,
        @Inject('VERIFICATION_SERVICE') private readonly client: ClientProxy,
    ) { }

    async execute(command: VerifyEmailCommand) {
        const { token } = command;

        // If verification is successful, userId is returned
        const userId = await firstValueFrom(this.client.send<string>({ cmd: 'verify' }, token))
            .catch((error) => {
                throw new HttpException(error.message, error.error.status);
            });

        // If successful, set emailVerified of user entity to true
        const user = await this._repository.findOne({ where: { id: userId } });
        if (user) {
            user.emailVerified = true;
            await this._repository.save(user);
        }

        this.handleSuccessfulEmailVerified(userId);
    }

    private handleSuccessfulEmailVerified(userId: string) {
        const userContext = this._publisher.mergeObjectContext(
            this.userRepository.verifyEmail(userId),
        );
        userContext.commit();
    }
}
