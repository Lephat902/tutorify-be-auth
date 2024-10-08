import { AddressProxy } from "@tutorify/shared";
import { User } from "src/user/infrastructure/schemas";

export async function getMongoDBGeocode(addressProxy: AddressProxy, address: string, wardId: string): Promise<User['location']> {
    // Get geocode if address is provided
    if (wardId) {
        const geocode = await addressProxy.getGeocodeFromAddressAndWardId(address, wardId);
        if (geocode) {
            return {
                type: 'Point',
                coordinates: [geocode.lon, geocode.lat]
            }
        }
    }

    return null;
}