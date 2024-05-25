import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { DataPresentationOption, StatisticTimeIntervalOption, UserRole, getQuarter } from '@tutorify/shared';
import { FilterQuery, Model } from 'mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { GetUserStatisticByYearQuery } from '../impl';

@QueryHandler(GetUserStatisticByYearQuery)
export class GetUserStatisticByYearHandler implements IQueryHandler<GetUserStatisticByYearQuery> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async execute(query: GetUserStatisticByYearQuery) {
        const { userStatisticByYearDto } = query;
        const { timeIntervalOption, presentationOption, shortMonthName } = query.userStatisticByYearDto;

        const userQuery: FilterQuery<User> = {};
        this.filterByCreationYear(userQuery, userStatisticByYearDto.year);
        this.filterByRoles(userQuery, userStatisticByYearDto.roles);
        this.filterByApprovementStatus(userQuery, userStatisticByYearDto.isApproved);

        const groupByExpression = this.buildGroupByExpression(timeIntervalOption);

        return this.getStatistics(userQuery, groupByExpression, presentationOption, shortMonthName);
    }

    private filterByCreationYear(query: FilterQuery<User>, year: number) {
        if (typeof year === 'number') {
            query.createdAt = {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
            };
        }
    }

    private filterByRoles(query: FilterQuery<User>, roles: UserRole[]) {
        if (roles?.length) {
            query.role = { $in: roles };
        }
    }

    private filterByApprovementStatus(query: FilterQuery<User>, isApproved: boolean) {
        if (typeof isApproved === 'boolean') {
            query.isApproved = isApproved;
        }
    }

    private buildGroupByExpression(timeIntervalOption: StatisticTimeIntervalOption) {
        return {
            $dateTrunc: {
                date: "$createdAt",
                unit: timeIntervalOption === StatisticTimeIntervalOption.QUARTER ?
                    "quarter" :
                    "month",
            }
        };
    }

    private async getStatistics(
        matchExpression: FilterQuery<User>,
        groupByExpression: object,
        presentationOption: DataPresentationOption,
        shortMonthName: boolean,
    ) {
        let rawStatistics = await this.userModel.aggregate([
            { $match: matchExpression },
            { $group: { _id: groupByExpression, count: { $sum: 1 } } },
            { $project: { timeIntervalIndex: '$_id', count: 1, _id: 0 } },
            { $sort: { timeIntervalIndex: 1 } },
        ]);

        // Fill in the data where it exists
        for (const stat of rawStatistics) {
            const monthNameOption = shortMonthName ? 'short' : 'long';
            const index = groupByExpression['$dateTrunc'].unit === StatisticTimeIntervalOption.QUARTER
                ? 'Q' + getQuarter(stat.timeIntervalIndex)
                : (stat.timeIntervalIndex as Date).toLocaleString('en-US', { month: monthNameOption });
            stat.timeIntervalIndex = index;
        }

        if (presentationOption === DataPresentationOption.ACCUMULATION) {
            rawStatistics = this.accumulateResults(rawStatistics);
        }

        return rawStatistics;
    }

    private accumulateResults(results: any[]) {
        return results.reduce((acc, cur, i) => {
            const prev = acc[i - 1] ? parseInt(acc[i - 1].count) : 0;
            const current = parseInt(cur.count);
            cur.count = (prev + current).toString();
            acc.push(cur);
            return acc;
        }, []);
    }
}

