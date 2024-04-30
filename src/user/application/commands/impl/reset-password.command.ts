import { ICommand } from '@nestjs/cqrs';
import { ResetPasswordDto } from '../../dtos';

export class ResetPasswordCommand implements ICommand {
    constructor(public readonly resetPasswordDto: ResetPasswordDto) { }
}