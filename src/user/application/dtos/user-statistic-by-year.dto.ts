import { DataPresentationOption, StatisticTimeIntervalOption, UserRole } from "@tutorify/shared";

export class UserStatisticByYearDto {
  readonly shortMonthName: boolean;
  readonly year: number;
  readonly timeIntervalOption: StatisticTimeIntervalOption;
  readonly roles: UserRole[];
  readonly isApproved: boolean;
  readonly presentationOption: DataPresentationOption;
}
