import {
  IMathModel,
  MixedMoneyUnitsDifficultyParams,
  MixedMoneyUnitsOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class MixedMoneyUnitsModel implements IMathModel<MixedMoneyUnitsDifficultyParams, MixedMoneyUnitsOutput> {
  public readonly model_id = "MIXED_MONEY_UNITS";

  generate(params: MixedMoneyUnitsDifficultyParams): MixedMoneyUnitsOutput {
    const problemType = this.selectProblemType(params);
    
    switch (problemType) {
      case 'convert_units':
        return this.generateConvertUnitsProblem(params);
      case 'add_mixed_units':
        return this.generateAddMixedUnitsProblem(params);
      case 'subtract_mixed_units':
        return this.generateSubtractMixedUnitsProblem(params);
      case 'compare_mixed_amounts':
        return this.generateCompareMixedAmountsProblem(params);
      default:
        return this.generateConvertUnitsProblem(params);
    }
  }

  getDefaultParams(year: number): MixedMoneyUnitsDifficultyParams {
    if (year <= 2) {
      return {
        pounds_range: { min: 1, max: 5 },
        pence_range: { min: 1, max: 99 },
        problem_types: ['convert_units', 'add_mixed_units'],
        decimal_places: 0,
        allow_complex_operations: false,
        include_comparisons: false,
        max_operands: 2
      };
    } else if (year <= 3) {
      return {
        pounds_range: { min: 1, max: 20 },
        pence_range: { min: 1, max: 99 },
        problem_types: ['convert_units', 'add_mixed_units', 'subtract_mixed_units'],
        decimal_places: 2,
        allow_complex_operations: true,
        include_comparisons: true,
        max_operands: 3
      };
    } else {
      return {
        pounds_range: { min: 1, max: 100 },
        pence_range: { min: 1, max: 99 },
        problem_types: ['convert_units', 'add_mixed_units', 'subtract_mixed_units', 'compare_mixed_amounts'],
        decimal_places: 2,
        allow_complex_operations: true,
        include_comparisons: true,
        max_operands: 4
      };
    }
  }

  private selectProblemType(params: MixedMoneyUnitsDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateConvertUnitsProblem(params: MixedMoneyUnitsDifficultyParams): MixedMoneyUnitsOutput {
    const conversionType = randomChoice(['pounds_to_pence', 'pence_to_pounds', 'mixed_to_decimal']);
    
    let sourceAmount: { pounds: number; pence: number };
    let targetFormat: string;
    let result: number;

    switch (conversionType) {
      case 'pounds_to_pence':
        sourceAmount = { 
          pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min), 
          pence: 0 
        };
        targetFormat = 'pence';
        result = sourceAmount.pounds * 100;
        break;
      
      case 'pence_to_pounds':
        const totalPence = generateRandomNumber(params.pence_range.max + 200, 0, 100); // Ensure > 100p
        sourceAmount = { pounds: 0, pence: totalPence };
        targetFormat = 'pounds_decimal';
        result = totalPence / 100;
        break;
      
      case 'mixed_to_decimal':
      default:
        sourceAmount = {
          pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min),
          pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
        };
        targetFormat = 'decimal';
        result = sourceAmount.pounds + (sourceAmount.pence / 100);
        break;
    }

    return {
      operation: "MIXED_MONEY_UNITS",
      problem_type: 'convert_units',
      source_amount: sourceAmount,
      target_format: targetFormat,
      result: result,
      formatted_source: this.formatMixedAmount(sourceAmount),
      formatted_result: this.formatResult(result, targetFormat),
      conversion_type: conversionType
    };
  }

  private generateAddMixedUnitsProblem(params: MixedMoneyUnitsDifficultyParams): MixedMoneyUnitsOutput {
    const operandCount = generateRandomNumber(params.max_operands, 0, 2);
    const operands: Array<{ pounds: number; pence: number }> = [];
    
    for (let i = 0; i < operandCount; i++) {
      operands.push({
        pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min),
        pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
      });
    }

    const result = this.addMixedAmounts(operands);

    return {
      operation: "MIXED_MONEY_UNITS",
      problem_type: 'add_mixed_units',
      operands: operands,
      result: result.total_decimal,
      result_mixed: result,
      formatted_operands: operands.map(op => this.formatMixedAmount(op)),
      formatted_result: this.formatMixedAmount(result)
    };
  }

  private generateSubtractMixedUnitsProblem(params: MixedMoneyUnitsDifficultyParams): MixedMoneyUnitsOutput {
    // Generate minuend and subtrahend
    const minuend = {
      pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min + 2),
      pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
    };

    const subtrahend = {
      pounds: generateRandomNumber(Math.min(minuend.pounds, params.pounds_range.max - 1), 0, params.pounds_range.min),
      pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
    };

    // Ensure positive result
    const minuendDecimal = minuend.pounds + (minuend.pence / 100);
    const subtrahendDecimal = subtrahend.pounds + (subtrahend.pence / 100);
    
    if (minuendDecimal < subtrahendDecimal) {
      // Swap to ensure positive result
      const temp = { ...minuend };
      minuend.pounds = subtrahend.pounds + 1;
      minuend.pence = subtrahend.pence;
      subtrahend.pounds = temp.pounds;
      subtrahend.pence = temp.pence;
    }

    const result = this.subtractMixedAmounts(minuend, subtrahend);

    return {
      operation: "MIXED_MONEY_UNITS",
      problem_type: 'subtract_mixed_units',
      minuend: minuend,
      subtrahend: subtrahend,
      result: result.total_decimal,
      result_mixed: result,
      formatted_minuend: this.formatMixedAmount(minuend),
      formatted_subtrahend: this.formatMixedAmount(subtrahend),
      formatted_result: this.formatMixedAmount(result),
      requires_borrowing: minuend.pence < subtrahend.pence
    };
  }

  private generateCompareMixedAmountsProblem(params: MixedMoneyUnitsDifficultyParams): MixedMoneyUnitsOutput {
    const amount1 = {
      pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min),
      pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
    };

    const amount2 = {
      pounds: generateRandomNumber(params.pounds_range.max, 0, params.pounds_range.min),
      pence: generateRandomNumber(params.pence_range.max, 0, params.pence_range.min)
    };

    const decimal1 = amount1.pounds + (amount1.pence / 100);
    const decimal2 = amount2.pounds + (amount2.pence / 100);
    
    const comparison = decimal1 > decimal2 ? 'greater' : 
                      decimal1 < decimal2 ? 'less' : 'equal';

    return {
      operation: "MIXED_MONEY_UNITS",
      problem_type: 'compare_mixed_amounts',
      amount1: amount1,
      amount2: amount2,
      comparison_result: comparison,
      difference: Math.abs(decimal1 - decimal2),
      formatted_amount1: this.formatMixedAmount(amount1),
      formatted_amount2: this.formatMixedAmount(amount2),
      formatted_difference: this.formatDecimalAmount(Math.abs(decimal1 - decimal2))
    } as any;
  }

  private addMixedAmounts(amounts: Array<{ pounds: number; pence: number }>): { pounds: number; pence: number; total_decimal: number } {
    let totalPounds = 0;
    let totalPence = 0;

    for (const amount of amounts) {
      totalPounds += amount.pounds;
      totalPence += amount.pence;
    }

    // Handle pence overflow
    const extraPounds = Math.floor(totalPence / 100);
    totalPounds += extraPounds;
    totalPence = totalPence % 100;

    return {
      pounds: totalPounds,
      pence: totalPence,
      total_decimal: totalPounds + (totalPence / 100)
    };
  }

  private subtractMixedAmounts(
    minuend: { pounds: number; pence: number }, 
    subtrahend: { pounds: number; pence: number }
  ): { pounds: number; pence: number; total_decimal: number } {
    let resultPounds = minuend.pounds - subtrahend.pounds;
    let resultPence = minuend.pence - subtrahend.pence;

    // Handle borrowing
    if (resultPence < 0) {
      resultPence += 100;
      resultPounds -= 1;
    }

    return {
      pounds: Math.max(0, resultPounds),
      pence: Math.max(0, resultPence),
      total_decimal: Math.max(0, resultPounds + (resultPence / 100))
    };
  }

  private formatMixedAmount(amount: { pounds: number; pence: number }): string {
    if (amount.pounds === 0 && amount.pence > 0) {
      return `${amount.pence}p`;
    }
    if (amount.pence === 0 && amount.pounds > 0) {
      return `£${amount.pounds}`;
    }
    if (amount.pounds > 0 && amount.pence > 0) {
      return `£${amount.pounds} and ${amount.pence}p`;
    }
    return '£0';
  }

  private formatDecimalAmount(amount: number): string {
    return `£${amount.toFixed(2)}`;
  }

  private formatResult(result: number, targetFormat: string): string {
    switch (targetFormat) {
      case 'pence':
        return `${result}p`;
      case 'pounds_decimal':
        return `£${result.toFixed(2)}`;
      case 'decimal':
        return `£${result.toFixed(2)}`;
      default:
        return `£${result.toFixed(2)}`;
    }
  }

  // Helper method to convert mixed amount to decimal
  toDecimal(amount: { pounds: number; pence: number }): number {
    return amount.pounds + (amount.pence / 100);
  }

  // Helper method to convert decimal to mixed amount
  fromDecimal(decimal: number): { pounds: number; pence: number } {
    const pounds = Math.floor(decimal);
    const pence = Math.round((decimal - pounds) * 100);
    
    return { pounds, pence };
  }
}