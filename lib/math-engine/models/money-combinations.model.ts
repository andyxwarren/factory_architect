import {
  IMathModel,
  MoneyCombinationsDifficultyParams,
  MoneyCombinationsOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class MoneyCombinationsModel implements IMathModel<MoneyCombinationsDifficultyParams, MoneyCombinationsOutput> {
  public readonly model_id = "MONEY_COMBINATIONS";

  private static readonly UK_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200]; // In pence

  generate(params: MoneyCombinationsDifficultyParams): MoneyCombinationsOutput {
    const problemType = this.selectProblemType(params);
    
    switch (problemType) {
      case 'find_combinations':
        return this.generateFindCombinationsProblem(params);
      case 'make_amount':
        return this.generateMakeAmountProblem(params);
      case 'equivalent_amounts':
        return this.generateEquivalentAmountsProblem(params);
      case 'compare_combinations':
        return this.generateCompareCombinationsProblem(params);
      default:
        return this.generateFindCombinationsProblem(params);
    }
  }

  getDefaultParams(year: number): MoneyCombinationsDifficultyParams {
    if (year <= 2) {
      return {
        target_amount_range: { min: 5, max: 20 }, // 5p to 20p
        available_denominations: [1, 2, 5, 10],
        problem_types: ['find_combinations', 'make_amount'],
        max_combinations: 3,
        allow_notes: false,
        require_exact_combinations: true,
        decimal_places: 0
      };
    } else if (year <= 3) {
      return {
        target_amount_range: { min: 10, max: 100 }, // 10p to £1
        available_denominations: [1, 2, 5, 10, 20, 50, 100],
        problem_types: ['find_combinations', 'make_amount', 'equivalent_amounts'],
        max_combinations: 4,
        allow_notes: false,
        require_exact_combinations: true,
        decimal_places: 0
      };
    } else {
      return {
        target_amount_range: { min: 25, max: 500 }, // 25p to £5
        available_denominations: [1, 2, 5, 10, 20, 50, 100, 200],
        problem_types: ['find_combinations', 'equivalent_amounts', 'compare_combinations'],
        max_combinations: 5,
        allow_notes: true,
        require_exact_combinations: false,
        decimal_places: 2
      };
    }
  }

  private selectProblemType(params: MoneyCombinationsDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateFindCombinationsProblem(params: MoneyCombinationsDifficultyParams): MoneyCombinationsOutput {
    const targetAmount = this.generateTargetAmount(params);
    const combinations = this.findAllCombinations(targetAmount, params);
    
    // Limit to max combinations for display
    const displayCombinations = combinations.slice(0, params.max_combinations);

    return {
      operation: "MONEY_COMBINATIONS",
      problem_type: 'find_combinations',
      target_amount: targetAmount,
      available_denominations: params.available_denominations,
      combinations: displayCombinations,
      total_combinations: combinations.length,
      formatted_target: this.formatAmount(targetAmount)
    };
  }

  private generateMakeAmountProblem(params: MoneyCombinationsDifficultyParams): MoneyCombinationsOutput {
    const targetAmount = this.generateTargetAmount(params);
    const combinations = this.findAllCombinations(targetAmount, params);
    
    // Choose one specific combination to present
    const selectedCombination = randomChoice(combinations);

    return {
      operation: "MONEY_COMBINATIONS",
      problem_type: 'make_amount',
      target_amount: targetAmount,
      available_denominations: params.available_denominations,
      combinations: [selectedCombination],
      total_combinations: combinations.length,
      formatted_target: this.formatAmount(targetAmount),
      specific_combination: selectedCombination
    };
  }

  private generateEquivalentAmountsProblem(params: MoneyCombinationsDifficultyParams): MoneyCombinationsOutput {
    const targetAmount = this.generateTargetAmount(params);
    const combinations = this.findAllCombinations(targetAmount, params);
    
    // Show 2-3 different ways to make the same amount
    const equivalentCombinations = combinations.slice(0, 3);

    return {
      operation: "MONEY_COMBINATIONS",
      problem_type: 'equivalent_amounts',
      target_amount: targetAmount,
      available_denominations: params.available_denominations,
      combinations: equivalentCombinations,
      total_combinations: combinations.length,
      formatted_target: this.formatAmount(targetAmount)
    };
  }

  private generateCompareCombinationsProblem(params: MoneyCombinationsDifficultyParams): MoneyCombinationsOutput {
    const targetAmount = this.generateTargetAmount(params);
    const combinations = this.findAllCombinations(targetAmount, params);
    
    // Compare combinations by coin count or other criteria
    const sortedByCount = [...combinations].sort((a, b) => {
      const countA = a.reduce((sum, coin) => sum + coin.count, 0);
      const countB = b.reduce((sum, coin) => sum + coin.count, 0);
      return countA - countB;
    });

    const comparisonCombinations = sortedByCount.slice(0, 2);

    return {
      operation: "MONEY_COMBINATIONS",
      problem_type: 'compare_combinations',
      target_amount: targetAmount,
      available_denominations: params.available_denominations,
      combinations: comparisonCombinations,
      total_combinations: combinations.length,
      formatted_target: this.formatAmount(targetAmount),
      comparison_criteria: 'fewest_coins'
    };
  }

  private generateTargetAmount(params: MoneyCombinationsDifficultyParams): number {
    let amount = generateRandomNumber(
      params.target_amount_range.max,
      params.decimal_places,
      params.target_amount_range.min
    );

    // Ensure the amount can be made with available denominations
    if (params.require_exact_combinations) {
      // Round to a value that can be made with available coins
      const minDenom = Math.min(...params.available_denominations);
      amount = Math.round(amount / minDenom) * minDenom;
    }

    return amount;
  }

  private findAllCombinations(
    targetAmount: number, 
    params: MoneyCombinationsDifficultyParams
  ): Array<Array<{ denomination: number; count: number; formatted: string }>> {
    const denominations = [...params.available_denominations].sort((a, b) => b - a);
    const combinations: Array<Array<{ denomination: number; count: number; formatted: string }>> = [];
    
    this.findCombinationsRecursive(
      Math.round(targetAmount), // Work in pence
      denominations,
      [],
      combinations,
      0
    );

    // Limit combinations to prevent excessive computation
    return combinations.slice(0, 10);
  }

  private findCombinationsRecursive(
    remaining: number,
    denominations: number[],
    currentCombination: Array<{ denomination: number; count: number }>,
    allCombinations: Array<Array<{ denomination: number; count: number; formatted: string }>>,
    denomIndex: number
  ): void {
    if (remaining === 0) {
      // Found a valid combination
      const formattedCombination = currentCombination
        .filter(coin => coin.count > 0)
        .map(coin => ({
          ...coin,
          formatted: this.formatDenomination(coin.denomination)
        }));
      
      if (formattedCombination.length > 0) {
        allCombinations.push(formattedCombination);
      }
      return;
    }

    if (denomIndex >= denominations.length || remaining < 0) {
      return;
    }

    const denom = denominations[denomIndex];
    const maxCount = Math.floor(remaining / denom);

    // Try different counts of this denomination
    for (let count = maxCount; count >= 0; count--) {
      const newCombination = [
        ...currentCombination,
        { denomination: denom, count }
      ];

      this.findCombinationsRecursive(
        remaining - (count * denom),
        denominations,
        newCombination,
        allCombinations,
        denomIndex + 1
      );
    }
  }

  private formatAmount(amount: number): string {
    if (amount >= 100) {
      const pounds = Math.floor(amount / 100);
      const pence = amount % 100;
      if (pence === 0) {
        return `£${pounds}`;
      }
      return `£${pounds}.${pence.toString().padStart(2, '0')}`;
    }
    return `${amount}p`;
  }

  private formatDenomination(denominationInPence: number): string {
    if (denominationInPence >= 100) {
      const pounds = denominationInPence / 100;
      return `£${pounds}`;
    }
    return `${denominationInPence}p`;
  }

  // Helper method to get the most efficient combination (fewest coins)
  getMostEfficientCombination(
    targetAmount: number, 
    params: MoneyCombinationsDifficultyParams
  ): Array<{ denomination: number; count: number; formatted: string }> {
    const combinations = this.findAllCombinations(targetAmount, params);
    
    if (combinations.length === 0) return [];

    // Find combination with fewest total coins
    return combinations.reduce((best, current) => {
      const bestCount = best.reduce((sum, coin) => sum + coin.count, 0);
      const currentCount = current.reduce((sum, coin) => sum + coin.count, 0);
      return currentCount < bestCount ? current : best;
    });
  }
}