import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { QueueNames, GeocodeResponseDto } from "@tutorify/shared";
import { catchError, firstValueFrom, of } from "rxjs";

@Injectable()
export class AddressProxy {
    constructor(
        @Inject(QueueNames.ADDRESS) private readonly client: ClientProxy,
    ) { }

    getGeocodeFromAddressAndWardId(address: string, wardId: string): Promise<GeocodeResponseDto> {
        return firstValueFrom(this.client.send<GeocodeResponseDto>({ cmd: 'getGeocodeFromAddressAndWardId' }, {
            address,
            wardId,
        })
            .pipe(
                catchError(error => {
                    console.error('Error occurred:', error);
                    return of(null);
                })
            ));
    }
}