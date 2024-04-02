import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { QueueNames } from "@tutorify/shared";
import { catchError, firstValueFrom } from "rxjs";

@Injectable()
export class FileProxy {
    constructor(
        @Inject(QueueNames.FILE) private readonly client: ClientProxy,
    ) { }

    deleteMultipleFiles(fileIds: string[]) {
        return firstValueFrom(this.client.send({ cmd: 'deleteMultipleFiles' }, fileIds)
            .pipe(
                catchError(error => {
                    console.error('Error occurred:', error);
                    return null;
                })
            ));
    }
}