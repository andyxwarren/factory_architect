import {
  AdditionDifficultyParams,
  SubtractionDifficultyParams,
  MultiplicationDifficultyParams,
  DivisionDifficultyParams,
  PercentageDifficultyParams
} from '@/lib/types';

type DifficultyParams = 
  | AdditionDifficultyParams
  | SubtractionDifficultyParams
  | MultiplicationDifficultyParams
  | DivisionDifficultyParams
  | PercentageDifficultyParams;

export class DifficultyPresets {
  static getPreset(modelId: string, year: number): DifficultyParams {
    switch (modelId) {
      case 'ADDITION':
        return this.getAdditionPreset(year);
      case 'SUBTRACTION':
        return this.getSubtractionPreset(year);
      case 'MULTIPLICATION':
        return this.getMultiplicationPreset(year);
      case 'DIVISION':
        return this.getDivisionPreset(year);
      case 'PERCENTAGE':
        return this.getPercentagePreset(year);
      default:
        throw new Error(`Unknown model: ${modelId}`);
    }
  }

  private static getAdditionPreset(year: number): AdditionDifficultyParams {
    const presets: Record<number, AdditionDifficultyParams> = {
      1: {
        operand_count: 2,
        max_value: 10,
        decimal_places: 0,
        allow_carrying: false,
        value_constraints: { min: 1, step: 1 }
      },
      2: {
        operand_count: 2,
        max_value: 20,
        decimal_places: 0,
        allow_carrying: false,
        value_constraints: { min: 1, step: 1 }
      },
      3: {
        operand_count: 3,
        max_value: 100,
        decimal_places: 0,
        allow_carrying: true,
        value_constraints: { min: 1, step: 1 }
      },
      4: {
        operand_count: 3,
        max_value: 100,
        decimal_places: 2,
        allow_carrying: true,
        value_constraints: { min: 0.01, step: 0.01 }
      },
      5: {
        operand_count: 4,
        max_value: 1000,
        decimal_places: 2,
        allow_carrying: true,
        value_constraints: { min: 0.01, step: 0.01 }
      },
      6: {
        operand_count: 5,
        max_value: 10000,
        decimal_places: 3,
        allow_carrying: true,
        value_constraints: { min: 0.001, step: 0.001 }
      }
    };
    return presets[year] || presets[6];
  }

  private static getSubtractionPreset(year: number): SubtractionDifficultyParams {
    const presets: Record<number, SubtractionDifficultyParams> = {
      1: {
        minuend_max: 10,
        subtrahend_max: 10,
        decimal_places: 0,
        allow_borrowing: false,
        ensure_positive: true,
        value_constraints: { step: 1 }
      },
      2: {
        minuend_max: 20,
        subtrahend_max: 20,
        decimal_places: 0,
        allow_borrowing: false,
        ensure_positive: true,
        value_constraints: { step: 1 }
      },
      3: {
        minuend_max: 100,
        subtrahend_max: 100,
        decimal_places: 0,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: { step: 1 }
      },
      4: {
        minuend_max: 100,
        subtrahend_max: 100,
        decimal_places: 2,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: { step: 0.01 }
      },
      5: {
        minuend_max: 1000,
        subtrahend_max: 1000,
        decimal_places: 2,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: { step: 0.01 }
      },
      6: {
        minuend_max: 10000,
        subtrahend_max: 10000,
        decimal_places: 3,
        allow_borrowing: true,
        ensure_positive: true,
        value_constraints: { step: 0.001 }
      }
    };
    return presets[year] || presets[6];
  }

  private static getMultiplicationPreset(year: number): MultiplicationDifficultyParams {
    const presets: Record<number, MultiplicationDifficultyParams> = {
      1: {
        multiplicand_max: 5,
        multiplier_max: 2,
        decimal_places: 0,
        operand_count: 2,
        use_fractions: false
      },
      2: {
        multiplicand_max: 10,
        multiplier_max: 5,
        decimal_places: 0,
        operand_count: 2,
        use_fractions: false
      },
      3: {
        multiplicand_max: 10,
        multiplier_max: 10,
        decimal_places: 0,
        operand_count: 2,
        use_fractions: false
      },
      4: {
        multiplicand_max: 100,
        multiplier_max: 10,
        decimal_places: 0,
        operand_count: 2,
        use_fractions: false
      },
      5: {
        multiplicand_max: 100,
        multiplier_max: 100,
        decimal_places: 2,
        operand_count: 2,
        use_fractions: false
      },
      6: {
        multiplicand_max: 1000,
        multiplier_max: 100,
        decimal_places: 3,
        operand_count: 3,
        use_fractions: true
      }
    };
    return presets[year] || presets[6];
  }

  private static getDivisionPreset(year: number): DivisionDifficultyParams {
    const presets: Record<number, DivisionDifficultyParams> = {
      1: {
        dividend_max: 10,
        divisor_max: 2,
        decimal_places: 0,
        allow_remainder: false,
        ensure_whole: true
      },
      2: {
        dividend_max: 20,
        divisor_max: 5,
        decimal_places: 0,
        allow_remainder: false,
        ensure_whole: true
      },
      3: {
        dividend_max: 100,
        divisor_max: 10,
        decimal_places: 0,
        allow_remainder: false,
        ensure_whole: true
      },
      4: {
        dividend_max: 100,
        divisor_max: 10,
        decimal_places: 0,
        allow_remainder: true,
        ensure_whole: false
      },
      5: {
        dividend_max: 1000,
        divisor_max: 100,
        decimal_places: 2,
        allow_remainder: true,
        ensure_whole: false
      },
      6: {
        dividend_max: 10000,
        divisor_max: 100,
        decimal_places: 3,
        allow_remainder: true,
        ensure_whole: false
      }
    };
    return presets[year] || presets[6];
  }

  private static getPercentagePreset(year: number): PercentageDifficultyParams {
    const presets: Record<number, PercentageDifficultyParams> = {
      4: {
        base_value_max: 100,
        percentage_values: [10, 50, 100],
        operation_type: "of",
        decimal_places: 0
      },
      5: {
        base_value_max: 200,
        percentage_values: [10, 20, 25, 50, 75],
        operation_type: "of",
        decimal_places: 2
      },
      6: {
        base_value_max: 500,
        percentage_values: [5, 10, 15, 20, 25, 30, 40, 50, 75],
        operation_type: "decrease",
        decimal_places: 2
      }
    };
    return presets[year] || presets[6];
  }
}