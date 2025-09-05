import {
  IMathModel,
  PercentageDifficultyParams,
  PercentageOutput
} from '@/lib/types';
import {
  generateRandomNumber,
  randomChoice
} from '@/lib/utils';

export class PercentageModel implements IMathModel<PercentageDifficultyParams, PercentageOutput> {
  public readonly model_id = "PERCENTAGE";

  generate(params: PercentageDifficultyParams): PercentageOutput {
    const baseValue = this.generateBaseValue(params);
    const percentage = this.selectPercentage(params);
    const { percentageAmount, result } = this.calculatePercentage(
      baseValue,
      percentage,
      params.operation_type
    );

    return {
      operation: "PERCENTAGE",
      operation_type: params.operation_type,
      base_value: baseValue,
      percentage,
      percentage_amount: percentageAmount,
      result
    };
  }

  getDefaultParams(year: number): PercentageDifficultyParams {
    if (year <= 4) {
      return {
        base_value_max: 100,
        percentage_values: [10, 50, 100],
        operation_type: "of",
        decimal_places: 0
      };
    } else if (year === 5) {
      return {
        base_value_max: 200,
        percentage_values: [10, 20, 25, 50, 75],
        operation_type: randomChoice(["of", "increase", "decrease"]),
        decimal_places: 2
      };
    } else {
      return {
        base_value_max: 500,
        percentage_values: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80],
        operation_type: randomChoice(["of", "increase", "decrease", "reverse"]),
        decimal_places: 2
      };
    }
  }

  private generateBaseValue(params: PercentageDifficultyParams): number {
    return generateRandomNumber(
      params.base_value_max,
      params.decimal_places,
      10,
      params.decimal_places > 0 ? 0.01 : 1
    );
  }

  private selectPercentage(params: PercentageDifficultyParams): number {
    return randomChoice(params.percentage_values);
  }

  private calculatePercentage(
    baseValue: number,
    percentage: number,
    operationType: string
  ): { percentageAmount: number; result: number } {
    const percentageAmount = (baseValue * percentage) / 100;
    let result: number;

    switch (operationType) {
      case "of":
        result = percentageAmount;
        break;
      case "increase":
        result = baseValue + percentageAmount;
        break;
      case "decrease":
        result = baseValue - percentageAmount;
        break;
      case "reverse":
        // Find original value before percentage was applied
        result = (baseValue * 100) / (100 - percentage);
        break;
      default:
        result = percentageAmount;
    }

    return {
      percentageAmount: Math.round(percentageAmount * 100) / 100,
      result: Math.round(result * 100) / 100
    };
  }
}