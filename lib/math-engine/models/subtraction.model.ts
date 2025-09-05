import {
  IMathModel,
  SubtractionDifficultyParams,
  SubtractionOutput,
  DecimalFormatted
} from '@/lib/types';
import {
  generateRandomNumber,
  formatDecimal,
  requiresBorrowing
} from '@/lib/utils';

export class SubtractionModel implements IMathModel<SubtractionDifficultyParams, SubtractionOutput> {
  public readonly model_id = "SUBTRACTION";

  generate(params: SubtractionDifficultyParams): SubtractionOutput {
    const { minuend, subtrahend } = this.generateOperands(params);
    const result = this.calculateDifference(minuend, subtrahend);
    const decimalFormatted = this.formatOutput(minuend, subtrahend, result, params.decimal_places);

    return {
      operation: "SUBTRACTION",
      minuend,
      subtrahend,
      result,
      decimal_formatted: decimalFormatted
    };
  }

  getDefaultParams(year: number): SubtractionDifficultyParams {
    if (year <= 2) {
      return {
        minuend_max: 20,
        subtrahend_max: 10,
        decimal_places: 0,
        allow_borrowing: false,
        ensure_positive: true,
        value_constraints: {
          step: 1
        }
      };
    } else if (year <= 4) {
      return {
        minuend_max: 100,
        subtrahend_max: 100,
        decimal_places: year === 4 ? 2 : 0,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: {
          step: year === 4 ? 0.01 : 1
        }
      };
    } else {
      return {
        minuend_max: 1000,
        subtrahend_max: 1000,
        decimal_places: 3,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: {
          step: 0.001
        }
      };
    }
  }

  private generateOperands(params: SubtractionDifficultyParams): { minuend: number; subtrahend: number } {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      let minuend = generateRandomNumber(
        params.minuend_max,
        params.decimal_places,
        1,
        params.value_constraints.step
      );
      
      let subtrahend = generateRandomNumber(
        params.subtrahend_max,
        params.decimal_places,
        1,
        params.value_constraints.step
      );

      // Ensure positive result if required
      if (params.ensure_positive && subtrahend > minuend) {
        [minuend, subtrahend] = [subtrahend, minuend];
      }

      // Check borrowing requirement
      const needsBorrowing = requiresBorrowing(minuend, subtrahend);
      
      if (params.allow_borrowing || !needsBorrowing) {
        return { minuend, subtrahend };
      }

      attempts++;
    }

    // Fallback: ensure positive result
    let minuend = generateRandomNumber(
      params.minuend_max,
      params.decimal_places,
      1,
      params.value_constraints.step
    );
    
    let subtrahend = generateRandomNumber(
      Math.min(params.subtrahend_max, minuend),
      params.decimal_places,
      1,
      params.value_constraints.step
    );

    if (params.ensure_positive && subtrahend > minuend) {
      [minuend, subtrahend] = [subtrahend, minuend];
    }

    return { minuend, subtrahend };
  }

  private calculateDifference(minuend: number, subtrahend: number): number {
    const difference = minuend - subtrahend;
    // Handle floating point precision
    return Math.round(difference * 1000) / 1000;
  }

  private formatOutput(
    minuend: number,
    subtrahend: number,
    result: number,
    decimalPlaces: number
  ): DecimalFormatted {
    return {
      minuend: formatDecimal(minuend, decimalPlaces),
      subtrahend: formatDecimal(subtrahend, decimalPlaces),
      result: formatDecimal(result, decimalPlaces)
    };
  }
}