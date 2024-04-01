import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { QueueNames } from "@tutorify/shared";
import { firstValueFrom } from "rxjs";
import { User } from "src/user/infrastructure/schemas";

@Injectable()
export class MailerProxy {
    constructor(
        @Inject(QueueNames.MAILER) private readonly client: ClientProxy,
    ) { }

    async sendUserConfirmation(newUser: User, token: string) {
        await firstValueFrom(
            this.client.send<string>({ cmd: 'sendUserConfirmation' }, {
                user: { name: newUser.firstName, email: newUser.email },
                token,
            })
        );
    }
}