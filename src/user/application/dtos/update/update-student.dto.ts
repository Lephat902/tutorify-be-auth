import { OmitType } from "@nestjs/mapped-types";
import { CreateStudentDto } from "../create";

export class UpdateStudentDto extends OmitType(
    CreateStudentDto,
    [
        'email',
        'role'
    ] as const
) {
  readonly oldPassword?: string;
}
