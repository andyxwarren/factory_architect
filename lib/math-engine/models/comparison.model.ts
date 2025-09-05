import {
  IMathModel,
  ComparisonDifficultyParams,
  ComparisonOutput,
  ComparisonOption
} from '@/lib/types';
import {
  generateRandomNumber,
  randomChoice
} from '@/lib/utils';

export class ComparisonModel implements IMathModel<ComparisonDifficultyParams, ComparisonOutput> {
  public readonly model_id = "COMPARISON";

  generate(params: ComparisonDifficultyParams): ComparisonOutput {
    const options = this.generateOptions(params);
    const analysis = this.analyzeOptions(options, params);

    return {
      operation: "COMPARISON",
      options,
      comparison_type: params.comparison_type,
      winner_index: analysis.winner_index,
      difference: analysis.difference,
      explanation: analysis.explanation
    };
  }

  getDefaultParams(year: number): ComparisonDifficultyParams {
    if (year <= 2) {
      return {
        value_count: 2,
        value_max: 50,
        comparison_type: "direct",
        decimal_places: 0,
        include_calculation: false
      };
    } else if (year <= 4) {
      return {
        value_count: 2,
        value_max: 200,
        comparison_type: randomChoice(["direct", "unit_rate"]),
        decimal_places: 2,
        include_calculation: true
      };
    } else {
      return {
        value_count: randomChoice([2, 3]),
        value_max: 1000,
        comparison_type: randomChoice(["direct", "unit_rate", "better_value"]),
        decimal_places: 2,
        include_calculation: true
      };
    }
  }

  private generateOptions(params: ComparisonDifficultyParams): ComparisonOption[] {
    const options: ComparisonOption[] = [];

    for (let i = 0; i < params.value_count; i++) {
      const option = this.generateSingleOption(params, i);
      options.push(option);
    }

    return options;
  }

  private generateSingleOption(params: ComparisonDifficultyParams, index: number): ComparisonOption {
    const value = generateRandomNumber(
      params.value_max,
      params.decimal_places,
      1,
      params.decimal_places > 0 ? 0.01 : 1
    );

    const option: ComparisonOption = {
      value,
      description: this.generateDescription(value, params.comparison_type, index)
    };

    if (params.comparison_type === "unit_rate" || params.comparison_type === "better_value") {
      option.quantity = this.generateQuantity(params);
      option.unit_rate = this.calculateUnitRate(value, option.quantity);
    }

    return option;
  }

  private generateQuantity(params: ComparisonDifficultyParams): number {
    // Generate reasonable quantities for unit rate calculations
    const quantities = [100, 250, 500, 750, 1000, 1500, 2000];
    return randomChoice(quantities.filter(q => q <= params.value_max * 10));
  }

  private calculateUnitRate(totalValue: number, quantity: number): number {
    const rate = totalValue / quantity;
    return Math.round(rate * 1000) / 1000; // Round to 3 decimal places
  }

  private generateDescription(value: number, comparisonType: string, index: number): string {
    const letters = ['A', 'B', 'C', 'D'];
    const letter = letters[index] || `Option ${index + 1}`;

    switch (comparisonType) {
      case "direct":
        return `${letter}: £${value.toFixed(2)}`;
      
      case "unit_rate":
      case "better_value":
        return `${letter}: £${value.toFixed(2)}`;
      
      default:
        return `${letter}: £${value.toFixed(2)}`;
    }
  }

  private analyzeOptions(options: ComparisonOption[], params: ComparisonDifficultyParams): {
    winner_index: number;
    difference?: number;
    explanation: string;
  } {
    switch (params.comparison_type) {
      case "direct":
        return this.analyzeDirectComparison(options, params);
      
      case "unit_rate":
      case "better_value":
        return this.analyzeUnitRateComparison(options, params);
      
      default:
        return this.analyzeDirectComparison(options, params);
    }
  }

  private analyzeDirectComparison(options: ComparisonOption[], params: ComparisonDifficultyParams): {
    winner_index: number;
    difference?: number;
    explanation: string;
  } {
    // Find the option with the highest value
    let maxValue = options[0].value;
    let maxIndex = 0;

    options.forEach((option, index) => {
      if (option.value > maxValue) {
        maxValue = option.value;
        maxIndex = index;
      }
    });

    // Calculate difference from the second highest
    const sortedValues = options.map(o => o.value).sort((a, b) => b - a);
    const difference = sortedValues[0] - sortedValues[1];

    const explanation = params.include_calculation
      ? `Option ${String.fromCharCode(65 + maxIndex)} has the highest value at £${maxValue.toFixed(2)}, which is £${difference.toFixed(2)} more than the next highest.`
      : `Option ${String.fromCharCode(65 + maxIndex)} is worth more.`;

    return {
      winner_index: maxIndex,
      difference: Math.round(difference * 100) / 100,
      explanation
    };
  }

  private analyzeUnitRateComparison(options: ComparisonOption[], params: ComparisonDifficultyParams): {
    winner_index: number;
    difference?: number;
    explanation: string;
  } {
    // Find the option with the best unit rate (lowest cost per unit)
    let bestRate = options[0].unit_rate || Infinity;
    let bestIndex = 0;

    options.forEach((option, index) => {
      const rate = option.unit_rate || Infinity;
      if (rate < bestRate) {
        bestRate = rate;
        bestIndex = index;
      }
    });

    // Calculate rate difference
    const sortedRates = options
      .map(o => o.unit_rate || Infinity)
      .filter(r => r !== Infinity)
      .sort((a, b) => a - b);
    
    const difference = sortedRates.length > 1 ? sortedRates[1] - sortedRates[0] : 0;

    const bestOption = options[bestIndex];
    const explanation = params.include_calculation
      ? `Option ${String.fromCharCode(65 + bestIndex)} offers the best value at £${bestRate.toFixed(3)} per unit (£${bestOption.value.toFixed(2)} for ${bestOption.quantity} units).`
      : `Option ${String.fromCharCode(65 + bestIndex)} is better value.`;

    return {
      winner_index: bestIndex,
      difference: Math.round(difference * 1000) / 1000,
      explanation
    };
  }

  // Helper method to format comparison for display
  static formatComparison(option: ComparisonOption, includeRate: boolean = false): string {
    let formatted = `£${option.value.toFixed(2)}`;
    
    if (option.quantity && includeRate) {
      formatted += ` for ${option.quantity} units`;
      if (option.unit_rate) {
        formatted += ` (£${option.unit_rate.toFixed(3)} per unit)`;
      }
    }
    
    return formatted;
  }
}