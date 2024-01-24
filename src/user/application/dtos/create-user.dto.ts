import { Gender, UserRole } from "src/user/infrastructure/enums";

export class CreateUserDto {
    readonly email: string;
    readonly password: string;
    readonly username: string;
    readonly firstName: string;
    readonly middleName: string;
    readonly lastName: string;
    readonly gender: Gender;
    readonly phoneNumber: string;
    readonly role: UserRole;
    readonly address: string;
    readonly wardId: number;
}
