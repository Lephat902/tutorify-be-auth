import { PaginationDto, SortingDirectionDto, applyMixins, Gender, UserRole, TutorOrderBy } from '@tutorify/shared';

class UserQueryDto {
    readonly q?: string;
    readonly gender?: Gender;
    readonly includeEmailNotVerified?: boolean;
    readonly includeBlocked?: boolean;
    readonly role?: UserRole;
    // Tutor 
    readonly includeNotApproved?: boolean;
    readonly order?: TutorOrderBy;
}

interface UserQueryDto extends PaginationDto, SortingDirectionDto { }
applyMixins(UserQueryDto, [PaginationDto, SortingDirectionDto]);

export { UserQueryDto };