import {
  IMathModel,
  MoneyFractionsDifficultyParams,
  MoneyFractionsOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class MoneyFractionsModel implements IMathModel<MoneyFractionsDifficultyParams, MoneyFractionsOutput> {
  public readonly model_id = "MONEY_FRACTIONS";

  private static readonly COMMON_FRACTIONS = [
    { numerator: 1, denominator: 2, decimal: 0.5, name: 'half' },
    { numerator: 1, denominator: 3, decimal: 0.333333, name: 'third' },
    { numerator: 1, denominator: 4, decimal: 0.25, name: 'quarter' },
    { numerator: 1, denominator: 5, decimal: 0.2, name: 'fifth' },
    { numerator: 1, denominator: 10, decimal: 0.1, name: 'tenth' },
    { numerator: 2, denominator: 3, decimal: 0.666667, name: 'two thirds' },
    { numerator: 3, denominator: 4, decimal: 0.75, name: 'three quarters' },
    { numerator: 2, denominator: 5, decimal: 0.4, name: 'two fifths' },
    { numerator: 3, denominator: 5, decimal: 0.6, name: 'three fifths' },
    { numerator: 4, denominator: 5, decimal: 0.8, name: 'four fifths' }
  ];

  generate(params: MoneyFractionsDifficultyParams): MoneyFractionsOutput {
    const problemType = this.selectProblemType(params);
    
    switch (problemType) {
      case 'fraction_of_amount':
        return this.generateFractionOfAmountProblem(params);
      case 'find_whole_from_fraction':
        return this.generateFindWholeFromFractionProblem(params);
      case 'compare_fractional_amounts':
        return this.generateCompareFractionalAmountsProblem(params);
      case 'add_fractional_money':
        return this.generateAddFractionalMoneyProblem(params);
      default:
        return this.generateFractionOfAmountProblem(params);
    }
  }

  getDefaultParams(year: number): MoneyFractionsDifficultyParams {
    if (year <= 3) {
      return {
        amount_range: { min: 4, max: 20 }, // £4 to £20 - easily divisible amounts
        allowed_fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 4 }
        ],
        problem_types: ['fraction_of_amount'],
        decimal_places: 2,
        ensure_whole_results: true,
        include_word_problems: true,
        max_fraction_complexity: 4
      };
    } else if (year <= 4) {
      return {
        amount_range: { min: 6, max: 50 },
        allowed_fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
          { numerator: 1, denominator: 4 },
          { numerator: 1, denominator: 5 },
          { numerator: 3, denominator: 4 }
        ],
        problem_types: ['fraction_of_amount', 'find_whole_from_fraction'],
        decimal_places: 2,
        ensure_whole_results: false,
        include_word_problems: true,
        max_fraction_complexity: 5
      };
    } else {
      return {
        amount_range: { min: 10, max: 100 },
        allowed_fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
          { numerator: 1, denominator: 4 },
          { numerator: 1, denominator: 5 },
          { numerator: 1, denominator: 10 },
          { numerator: 2, denominator: 3 },
          { numerator: 3, denominator: 4 },
          { numerator: 2, denominator: 5 },
          { numerator: 3, denominator: 5 }
        ],
        problem_types: ['fraction_of_amount', 'find_whole_from_fraction', 'compare_fractional_amounts', 'add_fractional_money'],
        decimal_places: 2,
        ensure_whole_results: false,
        include_word_problems: true,
        max_fraction_complexity: 10
      };
    }
  }

  private selectProblemType(params: MoneyFractionsDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateFractionOfAmountProblem(params: MoneyFractionsDifficultyParams): MoneyFractionsOutput {
    const fraction = this.selectFraction(params);
    const wholeAmount = this.generateWholeAmount(params, fraction);
    const result = this.calculateFractionOfAmount(wholeAmount, fraction, params);

    return {
      operation: "MONEY_FRACTIONS",
      problem_type: 'fraction_of_amount',
      whole_amount: wholeAmount,
      fraction: fraction,
      result: result,
      formatted_whole: this.formatMoneyAmount(wholeAmount),
      formatted_fraction: this.formatFraction(fraction),
      formatted_result: this.formatMoneyAmount(result),
      fraction_name: this.getFractionName(fraction),
      calculation_steps: this.getCalculationSteps(wholeAmount, fraction, result)
    };
  }

  private generateFindWholeFromFractionProblem(params: MoneyFractionsDifficultyParams): MoneyFractionsOutput {
    const fraction = this.selectFraction(params);
    const wholeAmount = this.generateWholeAmount(params, fraction);
    const fractionalAmount = this.calculateFractionOfAmount(wholeAmount, fraction, params);

    return {
      operation: "MONEY_FRACTIONS",
      problem_type: 'find_whole_from_fraction',
      whole_amount: wholeAmount,
      fraction: fraction,
      fractional_amount: fractionalAmount,
      result: wholeAmount,
      formatted_whole: this.formatMoneyAmount(wholeAmount),
      formatted_fraction: this.formatFraction(fraction),
      formatted_fractional_amount: this.formatMoneyAmount(fractionalAmount),
      formatted_result: this.formatMoneyAmount(wholeAmount),
      fraction_name: this.getFractionName(fraction)
    };
  }

  private generateCompareFractionalAmountsProblem(params: MoneyFractionsDifficultyParams): MoneyFractionsOutput {
    const baseAmount = this.generateWholeAmount(params);
    const fraction1 = this.selectFraction(params);
    const fraction2 = this.selectFraction(params, [fraction1]);

    const amount1 = this.calculateFractionOfAmount(baseAmount, fraction1, params);
    const amount2 = this.calculateFractionOfAmount(baseAmount, fraction2, params);

    const comparison = amount1 > amount2 ? 'first_greater' : 
                      amount1 < amount2 ? 'second_greater' : 'equal';

    return {
      operation: "MONEY_FRACTIONS",
      problem_type: 'compare_fractional_amounts',
      base_amount: baseAmount,
      fraction1: fraction1,
      fraction2: fraction2,
      amount1: amount1,
      amount2: amount2,
      comparison_result: comparison,
      formatted_base: this.formatMoneyAmount(baseAmount),
      formatted_fraction1: this.formatFraction(fraction1),
      formatted_fraction2: this.formatFraction(fraction2),
      formatted_amount1: this.formatMoneyAmount(amount1),
      formatted_amount2: this.formatMoneyAmount(amount2)
    };
  }

  private generateAddFractionalMoneyProblem(params: MoneyFractionsDifficultyParams): MoneyFractionsOutput {
    const baseAmount = this.generateWholeAmount(params);
    const fraction1 = this.selectFraction(params);
    const fraction2 = this.selectFraction(params);

    const amount1 = this.calculateFractionOfAmount(baseAmount, fraction1, params);
    const amount2 = this.calculateFractionOfAmount(baseAmount, fraction2, params);
    const result = amount1 + amount2;

    return {
      operation: "MONEY_FRACTIONS",
      problem_type: 'add_fractional_money',
      base_amount: baseAmount,
      fraction1: fraction1,
      fraction2: fraction2,
      amount1: amount1,
      amount2: amount2,
      result: result,
      formatted_base: this.formatMoneyAmount(baseAmount),
      formatted_fraction1: this.formatFraction(fraction1),
      formatted_fraction2: this.formatFraction(fraction2),
      formatted_amount1: this.formatMoneyAmount(amount1),
      formatted_amount2: this.formatMoneyAmount(amount2),
      formatted_result: this.formatMoneyAmount(result)
    };
  }

  private selectFraction(
    params: MoneyFractionsDifficultyParams, 
    exclude: Array<{ numerator: number; denominator: number }> = []
  ): { numerator: number; denominator: number } {
    const available = params.allowed_fractions.filter(f => 
      !exclude.some(ex => ex.numerator === f.numerator && ex.denominator === f.denominator)
    );
    
    return available.length > 0 ? randomChoice(available) : params.allowed_fractions[0];
  }

  private generateWholeAmount(
    params: MoneyFractionsDifficultyParams, 
    fraction?: { numerator: number; denominator: number }
  ): number {
    let amount = generateRandomNumber(
      params.amount_range.max,
      params.decimal_places,
      params.amount_range.min
    );

    // If we need whole results and have a fraction, ensure divisibility
    if (params.ensure_whole_results && fraction) {
      // Make sure the amount is divisible by the denominator
      const remainder = amount % fraction.denominator;
      if (remainder !== 0) {
        amount += (fraction.denominator - remainder);
      }
      
      // Ensure it's still within range
      if (amount > params.amount_range.max) {
        amount = params.amount_range.max - (params.amount_range.max % fraction.denominator);
      }
    }

    return amount;
  }

  private calculateFractionOfAmount(
    amount: number, 
    fraction: { numerator: number; denominator: number },
    params: MoneyFractionsDifficultyParams
  ): number {
    const result = (amount * fraction.numerator) / fraction.denominator;
    return Math.round(result * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
  }

  private formatMoneyAmount(amount: number): string {
    if (amount >= 100) {
      return `£${(amount / 100).toFixed(2)}`;
    }
    return `${amount}p`;
  }

  private formatFraction(fraction: { numerator: number; denominator: number }): string {
    return `${fraction.numerator}/${fraction.denominator}`;
  }

  private getFractionName(fraction: { numerator: number; denominator: number }): string {
    const commonFraction = MoneyFractionsModel.COMMON_FRACTIONS.find(f => 
      f.numerator === fraction.numerator && f.denominator === fraction.denominator
    );
    
    return commonFraction ? commonFraction.name : this.formatFraction(fraction);
  }

  private getCalculationSteps(
    wholeAmount: number, 
    fraction: { numerator: number; denominator: number },
    result: number
  ): Array<{ step: string; calculation: string; result: string }> {
    const steps: Array<{ step: string; calculation: string; result: string }> = [];

    if (fraction.denominator !== 1) {
      steps.push({
        step: `Divide by ${fraction.denominator}`,
        calculation: `${this.formatMoneyAmount(wholeAmount)} ÷ ${fraction.denominator}`,
        result: this.formatMoneyAmount(wholeAmount / fraction.denominator)
      });
    }

    if (fraction.numerator !== 1) {
      steps.push({
        step: `Multiply by ${fraction.numerator}`,
        calculation: `${this.formatMoneyAmount(wholeAmount / fraction.denominator)} × ${fraction.numerator}`,
        result: this.formatMoneyAmount(result)
      });
    }

    return steps;
  }

  // Helper method to check if fraction results in whole money amount
  isWholeFraction(amount: number, fraction: { numerator: number; denominator: number }): boolean {
    const result = (amount * fraction.numerator) / fraction.denominator;
    return result === Math.floor(result);
  }

  // Helper method to find suitable amounts for a given fraction
  findSuitableAmounts(
    fraction: { numerator: number; denominator: number },
    range: { min: number; max: number },
    count: number = 5
  ): number[] {
    const amounts: number[] = [];
    
    for (let i = range.min; i <= range.max && amounts.length < count; i++) {
      if (i % fraction.denominator === 0) {
        amounts.push(i);
      }
    }
    
    return amounts;
  }
}