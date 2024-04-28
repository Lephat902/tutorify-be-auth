import { CreateBaseUserDto } from "./create-base-user.dto";

export class CreateStudentDto extends CreateBaseUserDto {
    parentEmail: string;
    readonly parentFirstName: string;
    readonly parentMiddleName: string;
    readonly parentLastName: string;
    readonly interestedClassCategoryIds: string[];
}