import { FileUploadResponseDto, Gender, UserRole } from "@tutorify/shared";

export class CreateBaseUserDto {
    readonly email: string;
    readonly password: string;
    readonly username: string;
    readonly gender: Gender;
    readonly phoneNumber: string;
    readonly address: string;
    readonly wardId: string;
    readonly firstName: string;
    readonly middleName: string;
    readonly lastName: string;
    readonly role: UserRole;
    readonly avatar: FileUploadResponseDto;
}
