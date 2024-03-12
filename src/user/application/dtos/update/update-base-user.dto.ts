import { OmitType } from "@nestjs/mapped-types";
import { CreateBaseUserDto } from "../create";

export class UpdateBaseUserDto extends OmitType(
    CreateBaseUserDto,
    [
        'email',
        'role'
    ] as const
) {
  readonly oldPassword?: string;
}
