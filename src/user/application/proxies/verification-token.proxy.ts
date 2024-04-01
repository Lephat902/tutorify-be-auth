import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { QueueNames } from "@tutorify/shared";
import { firstValueFrom } from "rxjs";

@Injectable()
export class VerificationTokenProxy {
    constructor(
        @Inject(QueueNames.VERIFICATION_TOKEN) private readonly client: ClientProxy,
    ) { }

    createNewToken(userId: string) {
        return firstValueFrom(
            this.client.send<string>({ cmd: 'insert' }, userId)
        );
    }

    deleteAllTokenOfUser(userId: string) {
        return firstValueFrom(
            this.client.send<string>({ cmd: 'deleteAll' }, userId)
        );
    }
}