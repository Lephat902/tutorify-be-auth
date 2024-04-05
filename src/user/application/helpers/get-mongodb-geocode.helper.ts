import { AddressProxy } from "@tutorify/shared";
import { User } from "src/user/infrastructure/schemas";

export async function getMongoDBGeocode(addressProxy: AddressProxy, address: string, wardId: string): Promise<User['location']> {
    // Get geocode if address is provided
    if (address && wardId) {
        const geocode = await addressProxy.getGeocodeFromAddressAndWardId(address, wardId);
        if (geocode) {
            return {
                type: 'Point',
                coordinates: [parseFloat(geocode.lon), parseFloat(geocode.lat)]
            }
        }
    }

    return null;
}