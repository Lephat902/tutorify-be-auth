import { OmitType } from "@nestjs/mapped-types";
import { CreateTutorDto } from "../create";

export class UpdateTutorDto extends OmitType(
    CreateTutorDto,
    [
        'email',
        'role'
    ] as const
) { 
  readonly oldPassword?: string;
}
