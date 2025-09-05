import {
  IMathModel,
  FractionDifficultyParams,
  FractionOutput
} from '@/lib/types';
import {
  generateRandomNumber,
  randomChoice
} from '@/lib/utils';

export class FractionModel implements IMathModel<FractionDifficultyParams, FractionOutput> {
  public readonly model_id = "FRACTION";

  generate(params: FractionDifficultyParams): FractionOutput {
    const wholeValue = this.generateWholeValue(params);
    const fraction = this.selectFraction(params, wholeValue);
    const result = this.calculateFraction(wholeValue, fraction, params);

    return {
      operation: "FRACTION",
      whole_value: wholeValue,
      fraction: {
        numerator: fraction.numerator,
        denominator: fraction.denominator,
        formatted: `${fraction.numerator}/${fraction.denominator}`
      },
      result: result.final_result,
      calculation_steps: {
        division_result: result.division_result,
        final_result: result.final_result
      }
    };
  }

  getDefaultParams(year: number): FractionDifficultyParams {
    if (year <= 2) {
      return {
        whole_value_max: 20,
        fraction_types: [
          { numerator: 1, denominator: 2 }
        ],
        decimal_places: 0,
        ensure_whole_result: true
      };
    } else if (year <= 4) {
      return {
        whole_value_max: 100,
        fraction_types: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
          { numerator: 1, denominator: 4 },
          { numerator: 3, denominator: 4 }
        ],
        decimal_places: 2,
        ensure_whole_result: false
      };
    } else {
      return {
        whole_value_max: 1000,
        fraction_types: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
          { numerator: 2, denominator: 3 },
          { numerator: 1, denominator: 4 },
          { numerator: 3, denominator: 4 },
          { numerator: 1, denominator: 5 },
          { numerator: 2, denominator: 5 },
          { numerator: 3, denominator: 5 },
          { numerator: 4, denominator: 5 }
        ],
        decimal_places: 2,
        ensure_whole_result: false
      };
    }
  }

  private generateWholeValue(params: FractionDifficultyParams): number {
    if (params.ensure_whole_result) {
      // Generate values that will result in whole numbers for common fractions
      const fraction = randomChoice(params.fraction_types);
      const multiplier = Math.floor(Math.random() * 10) + 1;
      return fraction.denominator * multiplier;
    } else {
      return generateRandomNumber(
        params.whole_value_max,
        params.decimal_places,
        1,
        params.decimal_places > 0 ? 0.01 : 1
      );
    }
  }

  private selectFraction(
    params: FractionDifficultyParams,
    wholeValue: number
  ): { numerator: number; denominator: number } {
    if (params.ensure_whole_result) {
      // Filter fractions that will give whole results
      const validFractions = params.fraction_types.filter(f => 
        (wholeValue * f.numerator) % f.denominator === 0
      );
      return validFractions.length > 0 
        ? randomChoice(validFractions)
        : params.fraction_types[0];
    }
    
    return randomChoice(params.fraction_types);
  }

  private calculateFraction(
    wholeValue: number,
    fraction: { numerator: number; denominator: number },
    params: FractionDifficultyParams
  ): { division_result: number; final_result: number } {
    const division_result = wholeValue / fraction.denominator;
    const final_result = division_result * fraction.numerator;
    
    // Round to specified decimal places
    const factor = Math.pow(10, params.decimal_places);
    
    return {
      division_result: Math.round(division_result * factor) / factor,
      final_result: Math.round(final_result * factor) / factor
    };
  }
}