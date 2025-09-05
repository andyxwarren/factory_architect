import {
  IMathModel,
  DivisionDifficultyParams,
  DivisionOutput,
  DecimalFormatted
} from '@/lib/types';
import {
  generateRandomNumber,
  formatDecimal,
  randomInt
} from '@/lib/utils';

export class DivisionModel implements IMathModel<DivisionDifficultyParams, DivisionOutput> {
  public readonly model_id = "DIVISION";

  generate(params: DivisionDifficultyParams): DivisionOutput {
    const { dividend, divisor } = this.generateOperands(params);
    const { quotient, remainder } = this.calculateDivision(dividend, divisor, params);
    const decimalFormatted = this.formatOutput(dividend, divisor, quotient, params.decimal_places);

    return {
      operation: "DIVISION",
      dividend,
      divisor,
      quotient,
      remainder,
      decimal_formatted: decimalFormatted
    };
  }

  getDefaultParams(year: number): DivisionDifficultyParams {
    if (year <= 2) {
      return {
        dividend_max: 20,
        divisor_max: 5,
        decimal_places: 0,
        allow_remainder: false,
        ensure_whole: true
      };
    } else if (year <= 4) {
      return {
        dividend_max: 100,
        divisor_max: 10,
        decimal_places: year === 4 ? 2 : 0,
        allow_remainder: year === 4,
        ensure_whole: year === 3
      };
    } else {
      return {
        dividend_max: 1000,
        divisor_max: 100,
        decimal_places: 3,
        allow_remainder: true,
        ensure_whole: false
      };
    }
  }

  private generateOperands(params: DivisionDifficultyParams): { dividend: number; divisor: number } {
    if (params.ensure_whole) {
      // Generate divisor first, then create dividend as multiple
      const divisor = randomInt(2, params.divisor_max);
      const multiplier = randomInt(1, Math.floor(params.dividend_max / divisor));
      const dividend = divisor * multiplier;
      
      return { dividend, divisor };
    } else {
      // Generate random dividend and divisor
      let dividend = generateRandomNumber(
        params.dividend_max,
        params.decimal_places,
        1,
        params.decimal_places > 0 ? 0.01 : 1
      );
      
      let divisor = generateRandomNumber(
        params.divisor_max,
        0, // Divisor typically whole number
        1,
        1
      );

      // Ensure divisor is not zero
      if (divisor === 0) {
        divisor = 1;
      }

      // If no remainder allowed and decimals are 0, adjust dividend
      if (!params.allow_remainder && params.decimal_places === 0) {
        dividend = Math.floor(dividend / divisor) * divisor;
      }

      return { dividend, divisor };
    }
  }

  private calculateDivision(
    dividend: number,
    divisor: number,
    params: DivisionDifficultyParams
  ): { quotient: number; remainder: number } {
    if (params.decimal_places > 0) {
      const quotient = dividend / divisor;
      return {
        quotient: Math.round(quotient * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places),
        remainder: 0
      };
    } else {
      const quotient = Math.floor(dividend / divisor);
      const remainder = params.allow_remainder ? dividend % divisor : 0;
      return { quotient, remainder };
    }
  }

  private formatOutput(
    dividend: number,
    divisor: number,
    quotient: number,
    decimalPlaces: number
  ): DecimalFormatted {
    return {
      operands: [
        formatDecimal(dividend, decimalPlaces),
        formatDecimal(divisor, 0)
      ],
      quotient: formatDecimal(quotient, decimalPlaces),
      result: formatDecimal(quotient, decimalPlaces)
    };
  }
}