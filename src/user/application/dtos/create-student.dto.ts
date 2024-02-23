import { CreateBaseUserDto } from "./create-base-user.dto";

export class CreateStudentDto extends CreateBaseUserDto{
    readonly parentFirstName: string;
    readonly parentMiddleName: string;
    readonly parentLastName: string;
}