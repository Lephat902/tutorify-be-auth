import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto, Gender, UserRole } from '@tutorify/shared';

export class UserQueryDto extends IntersectionType(
    PaginationDto, 
){
    readonly q?: string;
    readonly gender?: Gender;
    readonly emailVerified?: boolean;
    readonly isBlocked?: boolean;
    readonly isApproved?: boolean;
    readonly role?: UserRole;
}