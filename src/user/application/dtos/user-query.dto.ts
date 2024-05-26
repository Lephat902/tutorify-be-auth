import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto, SortingDirectionDto, Gender, UserRole, UserOrder } from '@tutorify/shared';

export class UserQueryDto extends IntersectionType(
    PaginationDto,
    SortingDirectionDto
) {
    readonly order?: UserOrder;
    readonly q?: string;
    readonly gender?: Gender;
    readonly emailVerified?: boolean;
    readonly isBlocked?: boolean;
    readonly isApproved?: boolean;
    readonly role?: UserRole;
    readonly createdAtMin: Date;
    readonly createdAtMax: Date;  
}