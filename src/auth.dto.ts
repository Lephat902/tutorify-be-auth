import { Gender, UserRole } from './auth.interfaces';

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

export class LoginDto {
    public readonly email: string;
    public readonly username: string;
    public readonly password: string;
}
