import { CreateBaseUserDto } from "./create-base-user.dto";

export class CreateTutorDto extends CreateBaseUserDto {
    readonly biography: string;
    readonly minimumWage: number;
    readonly currentWorkplace: string;
    readonly currentPosition: string;
    readonly major: string;
    readonly graduationYear: number;
    readonly proficienciesIds: string[];
    readonly portfolios?: Array<Express.Multer.File>;
    readonly socialProfiles?: SocialProfile[];
}