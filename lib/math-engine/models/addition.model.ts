import {
  IMathModel,
  AdditionDifficultyParams,
  AdditionOutput,
  DecimalFormatted
} from '@/lib/types';
import {
  generateRandomNumber,
  formatDecimal,
  requiresCarrying,
  ensureUnique
} from '@/lib/utils';

export class AdditionModel implements IMathModel<AdditionDifficultyParams, AdditionOutput> {
  public readonly model_id = "ADDITION";

  generate(params: AdditionDifficultyParams): AdditionOutput {
    const operands = this.generateOperands(params);
    const result = this.calculateSum(operands);
    const intermediateSteps = this.calculateIntermediateSteps(operands);
    const decimalFormatted = this.formatOutput(operands, result, params.decimal_places);

    return {
      operation: "ADDITION",
      operands,
      result,
      intermediate_steps: intermediateSteps,
      decimal_formatted: decimalFormatted
    };
  }

  getDefaultParams(year: number): AdditionDifficultyParams {
    if (year <= 2) {
      return {
        operand_count: 2,
        max_value: 20,
        decimal_places: 0,
        allow_carrying: false,
        value_constraints: {
          min: 1,
          step: 1
        }
      };
    } else if (year <= 4) {
      return {
        operand_count: 3,
        max_value: 100,
        decimal_places: year === 4 ? 2 : 0,
        allow_carrying: true,
        value_constraints: {
          min: 1,
          step: year === 4 ? 0.01 : 1
        }
      };
    } else {
      return {
        operand_count: 4,
        max_value: 1000,
        decimal_places: 2,
        allow_carrying: true,
        value_constraints: {
          min: 1,
          step: 0.01
        }
      };
    }
  }

  private generateOperands(params: AdditionDifficultyParams): number[] {
    const operands: number[] = [];
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const tempOperands: number[] = [];
      
      for (let i = 0; i < params.operand_count; i++) {
        const value = generateRandomNumber(
          params.max_value,
          params.decimal_places,
          params.value_constraints.min,
          params.value_constraints.step
        );
        tempOperands.push(value);
      }

      // Check carrying requirement
      if (params.allow_carrying || !requiresCarrying(tempOperands)) {
        return tempOperands;
      }

      attempts++;
    }

    // Fallback: return operands regardless of carrying requirement
    return ensureUnique(
      () => generateRandomNumber(
        params.max_value,
        params.decimal_places,
        params.value_constraints.min,
        params.value_constraints.step
      ),
      params.operand_count
    );
  }

  private calculateSum(operands: number[]): number {
    const sum = operands.reduce((acc, val) => acc + val, 0);
    // Handle floating point precision
    return Math.round(sum * 1000) / 1000;
  }

  private calculateIntermediateSteps(operands: number[]): number[] {
    const steps: number[] = [];
    let runningSum = 0;
    
    for (let i = 0; i < operands.length - 1; i++) {
      runningSum += operands[i];
      steps.push(Math.round(runningSum * 1000) / 1000);
    }
    
    return steps;
  }

  private formatOutput(
    operands: number[],
    result: number,
    decimalPlaces: number
  ): DecimalFormatted {
    return {
      operands: operands.map(op => formatDecimal(op, decimalPlaces)),
      result: formatDecimal(result, decimalPlaces)
    };
  }
}