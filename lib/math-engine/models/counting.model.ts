import {
  IMathModel,
  CountingDifficultyParams,
  CountingOutput
} from '@/lib/types';
import {
  randomChoice
} from '@/lib/utils';

export class CountingModel implements IMathModel<CountingDifficultyParams, CountingOutput> {
  public readonly model_id = "COUNTING";

  // UK coin denominations in pence
  private static readonly UK_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200];

  generate(params: CountingDifficultyParams): CountingOutput {
    const solutions = this.findSolutions(params);
    const selectedSolution = this.selectBestSolution(solutions, params);

    return {
      operation: "COUNTING",
      target_value: params.target_value,
      solutions: selectedSolution.solution,
      total_coins: selectedSolution.total_coins,
      is_minimum_solution: selectedSolution.is_minimum
    };
  }

  getDefaultParams(year: number): CountingDifficultyParams {
    if (year <= 2) {
      return {
        target_value: 50, // 50p or less
        allowed_denominations: [1, 2, 5, 10], // Basic coins
        solution_type: "exact",
        max_coins: 10
      };
    } else if (year <= 4) {
      return {
        target_value: 100, // £1 or less
        allowed_denominations: [1, 2, 5, 10, 20, 50], 
        solution_type: "minimum",
        max_coins: 15
      };
    } else {
      return {
        target_value: 500, // £5 or less
        allowed_denominations: [1, 2, 5, 10, 20, 50, 100, 200],
        solution_type: "multiple",
        max_coins: 20
      };
    }
  }

  private findSolutions(params: CountingDifficultyParams): Array<{
    solution: Array<{ denomination: number; count: number }>;
    total_coins: number;
    is_minimum: boolean;
  }> {
    const solutions: Array<{
      solution: Array<{ denomination: number; count: number }>;
      total_coins: number;
      is_minimum: boolean;
    }> = [];

    // Find minimum coin solution using greedy algorithm
    const minSolution = this.findMinimumCoinSolution(params);
    if (minSolution) {
      solutions.push({ ...minSolution, is_minimum: true });
    }

    // Find alternative solutions if requested
    if (params.solution_type === "multiple") {
      const alternatives = this.findAlternativeSolutions(params, 3);
      solutions.push(...alternatives.map(alt => ({ ...alt, is_minimum: false })));
    }

    return solutions;
  }

  private findMinimumCoinSolution(params: CountingDifficultyParams): {
    solution: Array<{ denomination: number; count: number }>;
    total_coins: number;
  } | null {
    const denominations = [...params.allowed_denominations].sort((a, b) => b - a);
    let remainingValue = params.target_value;
    const solution: Array<{ denomination: number; count: number }> = [];
    let totalCoins = 0;

    for (const denom of denominations) {
      if (remainingValue >= denom) {
        const count = Math.floor(remainingValue / denom);
        if (count > 0 && totalCoins + count <= params.max_coins) {
          solution.push({ denomination: denom, count });
          remainingValue -= denom * count;
          totalCoins += count;
        }
      }
    }

    // Check if we found an exact solution
    if (remainingValue === 0 && totalCoins <= params.max_coins) {
      return { solution, total_coins: totalCoins };
    }

    return null;
  }

  private findAlternativeSolutions(
    params: CountingDifficultyParams,
    maxAlternatives: number
  ): Array<{
    solution: Array<{ denomination: number; count: number }>;
    total_coins: number;
  }> {
    const alternatives: Array<{
      solution: Array<{ denomination: number; count: number }>;
      total_coins: number;
    }> = [];

    // Generate alternative solutions by varying coin usage
    const denominations = params.allowed_denominations.sort((a, b) => b - a);
    
    for (let attempt = 0; attempt < maxAlternatives * 3 && alternatives.length < maxAlternatives; attempt++) {
      const solution = this.generateAlternativeSolution(params, denominations);
      if (solution && !this.isDuplicateSolution(solution, alternatives)) {
        alternatives.push(solution);
      }
    }

    return alternatives;
  }

  private generateAlternativeSolution(
    params: CountingDifficultyParams,
    denominations: number[]
  ): {
    solution: Array<{ denomination: number; count: number }>;
    total_coins: number;
  } | null {
    let remainingValue = params.target_value;
    const solution: Array<{ denomination: number; count: number }> = [];
    let totalCoins = 0;

    // Randomly vary the approach by sometimes using smaller denominations
    for (let i = 0; i < denominations.length; i++) {
      const denom = denominations[i];
      
      if (remainingValue >= denom) {
        const maxCount = Math.floor(remainingValue / denom);
        const remainingCoinBudget = params.max_coins - totalCoins;
        
        // Sometimes use fewer large denominations to create variation
        const useAlternative = Math.random() < 0.4 && i < denominations.length - 1;
        const count = useAlternative 
          ? Math.max(0, Math.floor(maxCount * Math.random()))
          : Math.min(maxCount, remainingCoinBudget);

        if (count > 0) {
          solution.push({ denomination: denom, count });
          remainingValue -= denom * count;
          totalCoins += count;
        }
      }
    }

    if (remainingValue === 0 && totalCoins <= params.max_coins) {
      return { solution, total_coins: totalCoins };
    }

    return null;
  }

  private isDuplicateSolution(
    newSolution: { solution: Array<{ denomination: number; count: number }> },
    existing: Array<{ solution: Array<{ denomination: number; count: number }> }>
  ): boolean {
    return existing.some(existing => 
      this.areSolutionsEqual(newSolution.solution, existing.solution)
    );
  }

  private areSolutionsEqual(
    sol1: Array<{ denomination: number; count: number }>,
    sol2: Array<{ denomination: number; count: number }>
  ): boolean {
    if (sol1.length !== sol2.length) return false;
    
    const sorted1 = [...sol1].sort((a, b) => a.denomination - b.denomination);
    const sorted2 = [...sol2].sort((a, b) => a.denomination - b.denomination);
    
    return sorted1.every((coin, index) => 
      coin.denomination === sorted2[index].denomination &&
      coin.count === sorted2[index].count
    );
  }

  private selectBestSolution(
    solutions: Array<{
      solution: Array<{ denomination: number; count: number }>;
      total_coins: number;
      is_minimum: boolean;
    }>,
    params: CountingDifficultyParams
  ): {
    solution: Array<{ denomination: number; count: number }>;
    total_coins: number;
    is_minimum: boolean;
  } {
    if (solutions.length === 0) {
      // Fallback solution
      return {
        solution: [{ denomination: 1, count: params.target_value }],
        total_coins: params.target_value,
        is_minimum: false
      };
    }

    // For "minimum" type, prefer the solution with fewest coins
    if (params.solution_type === "minimum") {
      return solutions.reduce((best, current) => 
        current.total_coins < best.total_coins ? current : best
      );
    }

    // For other types, return a random valid solution
    return randomChoice(solutions);
  }
}