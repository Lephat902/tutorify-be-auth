import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto, Gender, UserRole } from '@tutorify/shared';

export class UserQueryDto extends IntersectionType(
    PaginationDto, 
){
    readonly q?: string;
    readonly gender?: Gender;
    readonly includeEmailNotVerified?: boolean;
    readonly includeBlocked?: boolean;
    readonly role?: UserRole;
}