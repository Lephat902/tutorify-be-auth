import { CreateBaseUserDto } from "./create-base-user.dto";

export class CreateTutorDto extends CreateBaseUserDto {
    readonly biography: string;
    readonly isApproved: boolean;
    readonly approvedAt: Date;
    readonly minimumWage: string;
    readonly currentWorkplace: string;
    readonly currentPosition: string;
    readonly major: string;
    readonly graduationYear: number;
    readonly proficienciesIds: string[];
    readonly portfolios?: Array<Express.Multer.File>;
}