import { ICommand } from '@nestjs/cqrs';
import { UpdateBaseUserDto } from '../../dtos/update';

export class UpdateUserSaga implements ICommand {
    constructor(
        public readonly id: string,
        public readonly updateBaseUserDto: UpdateBaseUserDto,
    ) { }
}
