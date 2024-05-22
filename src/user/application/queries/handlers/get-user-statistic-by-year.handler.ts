import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { DataPresentationOption, StatisticTimeIntervalOption, UserRole, getQuarter } from '@tutorify/shared';
import { Model } from 'mongoose';
import { User } from 'src/user/infrastructure/schemas';
import { GetUserStatisticByYearQuery } from '../impl';

@QueryHandler(GetUserStatisticByYearQuery)
export class GetUserStatisticByYearHandler implements IQueryHandler<GetUserStatisticByYearQuery> {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async execute(query: GetUserStatisticByYearQuery) {
        const { year, timeIntervalOption, presentationOption, roles, isApproved } = query.userStatisticByYearDto;

        const matchExpression = this.buildMatchExpression(year, roles, isApproved);
        const groupByExpression = this.buildGroupByExpression(timeIntervalOption);

        return this.getStatistics(matchExpression, groupByExpression, presentationOption);
    }

    private buildMatchExpression(year: number, roles?: UserRole[], isApproved?: boolean) {
        const matchExpression: any = {
            createdAt: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
            },
        };

        if (roles?.length) {
            matchExpression.role = { $in: roles };
        }

        if (typeof isApproved === 'boolean') {
            matchExpression.isApproved = isApproved;
        }

        return matchExpression;
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
        matchExpression: object,
        groupByExpression: object,
        presentationOption: DataPresentationOption,
    ) {
        const rawStatistics = await this.userModel.aggregate([
            { $match: matchExpression },
            { $group: { _id: groupByExpression, count: { $sum: 1 } } },
            { $project: { timeIntervalIndex: '$_id', count: 1, _id: 0 } },
        ]);

        // Initialize an array with the length equal to the number of months or quarters in the year
        const timeIntervalCount = groupByExpression['$dateTrunc'].unit === StatisticTimeIntervalOption.QUARTER ? 4 : 12;
        let statistics = Array(timeIntervalCount).fill({ count: "0", timeIntervalIndex: 0 });

        // Fill in the data where it exists
        for (const stat of rawStatistics) {
            const index = groupByExpression['$dateTrunc'].unit === StatisticTimeIntervalOption.QUARTER 
                ? getQuarter(stat.timeIntervalIndex) - 1 
                : stat.timeIntervalIndex.getMonth();
            statistics[index] = stat;
        }
        
        // Convert timeIntervalIndex to its index in the sequence
        statistics = statistics.map((stat, index) => ({
            ...stat,
            timeIntervalIndex: index,
        }));

        if (presentationOption === DataPresentationOption.ACCUMULATION) {
            statistics = statistics.reduce((acc, cur, i) => {
                const prev = acc[i - 1] ? parseInt(acc[i - 1].count) : 0;
                const current = parseInt(cur.count);
                cur.count = (prev + current).toString();
                acc.push(cur);
                return acc;
            }, []);
        }

        return statistics;
    }
}
