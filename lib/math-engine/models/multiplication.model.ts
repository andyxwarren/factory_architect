import {
  IMathModel,
  MultiplicationDifficultyParams,
  MultiplicationOutput,
  DecimalFormatted
} from '@/lib/types';
import {
  generateRandomNumber,
  formatDecimal
} from '@/lib/utils';

export class MultiplicationModel implements IMathModel<MultiplicationDifficultyParams, MultiplicationOutput> {
  public readonly model_id = "MULTIPLICATION";

  generate(params: MultiplicationDifficultyParams): MultiplicationOutput {
    const factors = this.generateFactors(params);
    const result = this.calculateProduct(factors);
    const decimalFormatted = this.formatOutput(factors, result, params.decimal_places);

    return {
      operation: "MULTIPLICATION",
      multiplicand: factors[0],
      multiplier: factors.length > 1 ? factors[1] : 1,
      result,
      factors,
      decimal_formatted: decimalFormatted
    };
  }

  getDefaultParams(year: number): MultiplicationDifficultyParams {
    if (year <= 2) {
      return {
        multiplicand_max: 10,
        multiplier_max: 5,
        decimal_places: 0,
        operand_count: 2,
        use_fractions: false
      };
    } else if (year <= 4) {
      return {
        multiplicand_max: 100,
        multiplier_max: 10,
        decimal_places: year === 4 ? 2 : 0,
        operand_count: 2,
        use_fractions: false
      };
    } else {
      return {
        multiplicand_max: 1000,
        multiplier_max: 100,
        decimal_places: 3,
        operand_count: year === 6 ? 3 : 2,
        use_fractions: year === 6
      };
    }
  }

  private generateFactors(params: MultiplicationDifficultyParams): number[] {
    const factors: number[] = [];
    
    // Generate multiplicand
    factors.push(generateRandomNumber(
      params.multiplicand_max,
      params.use_fractions ? params.decimal_places : 0,
      1,
      params.use_fractions ? 0.01 : 1
    ));

    // Generate multiplier(s)
    for (let i = 1; i < params.operand_count; i++) {
      const max = i === 1 ? params.multiplier_max : 10; // Additional factors are smaller
      factors.push(generateRandomNumber(
        max,
        params.use_fractions && i === 1 ? params.decimal_places : 0,
        1,
        params.use_fractions && i === 1 ? 0.01 : 1
      ));
    }

    return factors;
  }

  private calculateProduct(factors: number[]): number {
    const product = factors.reduce((acc, val) => acc * val, 1);
    // Handle floating point precision
    return Math.round(product * 1000) / 1000;
  }

  private formatOutput(
    factors: number[],
    result: number,
    decimalPlaces: number
  ): DecimalFormatted {
    return {
      operands: factors.map(f => formatDecimal(f, decimalPlaces)),
      result: formatDecimal(result, decimalPlaces)
    };
  }
}