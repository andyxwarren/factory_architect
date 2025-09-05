import {
  IMathModel,
  TimeRateDifficultyParams,
  TimeRateOutput
} from '@/lib/types';
import {
  generateRandomNumber,
  randomChoice
} from '@/lib/utils';

export class TimeRateModel implements IMathModel<TimeRateDifficultyParams, TimeRateOutput> {
  public readonly model_id = "TIME_RATE";

  private static readonly PERIOD_MULTIPLIERS = {
    day: 1,
    week: 7,
    month: 30,
    year: 365
  };

  generate(params: TimeRateDifficultyParams): TimeRateOutput {
    const rate = this.generateRate(params);
    const calculation = this.generateCalculation(params, rate);

    return {
      operation: "TIME_RATE",
      rate: {
        value: rate.value,
        period: rate.period
      },
      calculation: {
        periods: calculation.periods,
        total_value: calculation.total_value
      },
      problem_type: params.problem_type
    };
  }

  getDefaultParams(year: number): TimeRateDifficultyParams {
    if (year <= 2) {
      return {
        rate_value_max: 10,
        rate_period: "day",
        target_value_max: 50,
        decimal_places: 0,
        problem_type: "total_after_time"
      };
    } else if (year <= 4) {
      return {
        rate_value_max: 50,
        rate_period: randomChoice(["day", "week"]),
        target_value_max: 200,
        decimal_places: 2,
        problem_type: randomChoice(["time_to_target", "total_after_time"])
      };
    } else {
      return {
        rate_value_max: 100,
        rate_period: randomChoice(["week", "month", "year"]),
        target_value_max: 1000,
        decimal_places: 2,
        problem_type: randomChoice(["time_to_target", "total_after_time", "rate_calculation"])
      };
    }
  }

  private generateRate(params: TimeRateDifficultyParams): {
    value: number;
    period: string;
  } {
    const value = generateRandomNumber(
      params.rate_value_max,
      params.decimal_places,
      0.01,
      params.decimal_places > 0 ? 0.01 : 1
    );

    return {
      value,
      period: params.rate_period
    };
  }

  private generateCalculation(
    params: TimeRateDifficultyParams,
    rate: { value: number; period: string }
  ): { periods: number; total_value: number } {
    switch (params.problem_type) {
      case "time_to_target":
        return this.calculateTimeToTarget(params, rate);
      
      case "total_after_time":
        return this.calculateTotalAfterTime(params, rate);
      
      case "rate_calculation":
        return this.calculateRateFromTotal(params, rate);
      
      default:
        return this.calculateTotalAfterTime(params, rate);
    }
  }

  private calculateTimeToTarget(
    params: TimeRateDifficultyParams,
    rate: { value: number; period: string }
  ): { periods: number; total_value: number } {
    // Generate a target value and calculate time needed
    const targetValue = generateRandomNumber(
      params.target_value_max,
      params.decimal_places,
      rate.value,
      params.decimal_places > 0 ? 0.01 : 1
    );

    const periods = Math.ceil(targetValue / rate.value);
    
    return {
      periods,
      total_value: targetValue
    };
  }

  private calculateTotalAfterTime(
    params: TimeRateDifficultyParams,
    rate: { value: number; period: string }
  ): { periods: number; total_value: number } {
    // Generate a time period and calculate total
    const maxPeriods = Math.floor(params.target_value_max / rate.value);
    const periods = Math.max(1, Math.floor(Math.random() * Math.min(maxPeriods, 52)) + 1);
    
    const totalValue = periods * rate.value;
    
    return {
      periods,
      total_value: Math.round(totalValue * 100) / 100
    };
  }

  private calculateRateFromTotal(
    params: TimeRateDifficultyParams,
    rate: { value: number; period: string }
  ): { periods: number; total_value: number } {
    // Generate total and periods, calculate rate (rate is given in this case)
    const periods = Math.floor(Math.random() * 20) + 2;
    const totalValue = periods * rate.value;
    
    return {
      periods,
      total_value: Math.round(totalValue * 100) / 100
    };
  }

  // Helper method to get period display name
  static getPeriodDisplayName(period: string, count: number = 1): string {
    const names = {
      day: count === 1 ? 'day' : 'days',
      week: count === 1 ? 'week' : 'weeks',
      month: count === 1 ? 'month' : 'months',
      year: count === 1 ? 'year' : 'years'
    };
    
    return names[period as keyof typeof names] || period;
  }

  // Helper method to convert between periods
  static convertPeriods(
    fromPeriod: string,
    toPeriod: string,
    value: number
  ): number {
    const fromDays = TimeRateModel.PERIOD_MULTIPLIERS[fromPeriod as keyof typeof TimeRateModel.PERIOD_MULTIPLIERS];
    const toDays = TimeRateModel.PERIOD_MULTIPLIERS[toPeriod as keyof typeof TimeRateModel.PERIOD_MULTIPLIERS];
    
    if (!fromDays || !toDays) return value;
    
    return Math.round((value * fromDays / toDays) * 100) / 100;
  }
}