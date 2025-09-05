import {
  IMathModel,
  MoneyScalingDifficultyParams,
  MoneyScalingOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class MoneyScalingModel implements IMathModel<MoneyScalingDifficultyParams, MoneyScalingOutput> {
  public readonly model_id = "MONEY_SCALING";

  generate(params: MoneyScalingDifficultyParams): MoneyScalingOutput {
    const problemType = this.selectProblemType(params);
    
    switch (problemType) {
      case 'scale_up':
        return this.generateScaleUpProblem(params);
      case 'scale_down':
        return this.generateScaleDownProblem(params);
      case 'proportional_reasoning':
        return this.generateProportionalReasoningProblem(params);
      case 'rate_problems':
        return this.generateRateProblem(params);
      default:
        return this.generateScaleUpProblem(params);
    }
  }

  getDefaultParams(year: number): MoneyScalingDifficultyParams {
    if (year <= 3) {
      return {
        base_amount_range: { min: 5, max: 50 },
        scale_factor_range: { min: 2, max: 5 },
        problem_types: ['scale_up', 'scale_down'],
        decimal_places: 2,
        include_fractional_scaling: false,
        allow_complex_ratios: false,
        context_types: ['shopping', 'bulk_buying']
      };
    } else if (year <= 4) {
      return {
        base_amount_range: { min: 10, max: 100 },
        scale_factor_range: { min: 2, max: 10 },
        problem_types: ['scale_up', 'scale_down', 'proportional_reasoning'],
        decimal_places: 2,
        include_fractional_scaling: true,
        allow_complex_ratios: false,
        context_types: ['shopping', 'bulk_buying', 'recipe_scaling', 'group_activities']
      };
    } else {
      return {
        base_amount_range: { min: 10, max: 500 },
        scale_factor_range: { min: 1.5, max: 20 },
        problem_types: ['scale_up', 'scale_down', 'proportional_reasoning', 'rate_problems'],
        decimal_places: 2,
        include_fractional_scaling: true,
        allow_complex_ratios: true,
        context_types: ['shopping', 'bulk_buying', 'recipe_scaling', 'group_activities', 'business', 'savings']
      };
    }
  }

  private selectProblemType(params: MoneyScalingDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateScaleUpProblem(params: MoneyScalingDifficultyParams): MoneyScalingOutput {
    const baseAmount = this.generateBaseAmount(params);
    const scaleFactor = this.generateScaleFactor(params);
    const scaledAmount = this.calculateScaledAmount(baseAmount, scaleFactor, params);
    
    const context = this.generateContext(params, 'scale_up');

    return {
      operation: "MONEY_SCALING",
      problem_type: 'scale_up',
      base_amount: baseAmount,
      scale_factor: scaleFactor,
      scaled_amount: scaledAmount,
      context: context,
      formatted_base: this.formatMoneyAmount(baseAmount),
      formatted_scaled: this.formatMoneyAmount(scaledAmount),
      formatted_scale_factor: this.formatScaleFactor(scaleFactor),
      calculation: `${this.formatMoneyAmount(baseAmount)} × ${this.formatScaleFactor(scaleFactor)} = ${this.formatMoneyAmount(scaledAmount)}`
    };
  }

  private generateScaleDownProblem(params: MoneyScalingDifficultyParams): MoneyScalingOutput {
    const scaleFactor = this.generateScaleFactor(params);
    const baseAmount = this.generateBaseAmount(params);
    const originalAmount = this.calculateScaledAmount(baseAmount, scaleFactor, params);
    
    const context = this.generateContext(params, 'scale_down');

    return {
      operation: "MONEY_SCALING",
      problem_type: 'scale_down',
      base_amount: baseAmount,
      scale_factor: 1 / scaleFactor,
      original_amount: originalAmount,
      scaled_amount: baseAmount,
      context: context,
      formatted_base: this.formatMoneyAmount(baseAmount),
      formatted_original: this.formatMoneyAmount(originalAmount),
      formatted_scale_factor: this.formatScaleFactor(1 / scaleFactor),
      calculation: `${this.formatMoneyAmount(originalAmount)} ÷ ${this.formatScaleFactor(scaleFactor)} = ${this.formatMoneyAmount(baseAmount)}`
    };
  }

  private generateProportionalReasoningProblem(params: MoneyScalingDifficultyParams): MoneyScalingOutput {
    const baseQuantity = generateRandomNumber(10, 0, 2);
    const baseAmount = this.generateBaseAmount(params);
    const newQuantity = generateRandomNumber(20, 0, baseQuantity + 1);
    
    const unitCost = baseAmount / baseQuantity;
    const newAmount = unitCost * newQuantity;
    
    const context = this.generateProportionalContext(params);

    return {
      operation: "MONEY_SCALING",
      problem_type: 'proportional_reasoning',
      base_quantity: baseQuantity,
      base_amount: baseAmount,
      new_quantity: newQuantity,
      new_amount: Math.round(newAmount * 100) / 100,
      unit_cost: Math.round(unitCost * 100) / 100,
      context: context,
      formatted_base: this.formatMoneyAmount(baseAmount),
      formatted_new: this.formatMoneyAmount(Math.round(newAmount * 100) / 100),
      formatted_unit_cost: this.formatMoneyAmount(Math.round(unitCost * 100) / 100),
      calculation: `${baseQuantity} items cost ${this.formatMoneyAmount(baseAmount)}, so ${newQuantity} items cost ${this.formatMoneyAmount(Math.round(newAmount * 100) / 100)}`
    };
  }

  private generateRateProblem(params: MoneyScalingDifficultyParams): MoneyScalingOutput {
    const timeUnit = randomChoice(['hour', 'day', 'week']);
    const rate = this.generateBaseAmount(params);
    const timeAmount = generateRandomNumber(10, 0, 2);
    
    const totalAmount = this.calculateScaledAmount(rate, timeAmount, params);
    
    const context = this.generateRateContext(params, timeUnit);

    return {
      operation: "MONEY_SCALING",
      problem_type: 'rate_problems',
      rate: rate,
      time_amount: timeAmount,
      time_unit: timeUnit,
      total_amount: totalAmount,
      context: context,
      formatted_rate: this.formatMoneyAmount(rate),
      formatted_total: this.formatMoneyAmount(totalAmount),
      calculation: `${this.formatMoneyAmount(rate)} per ${timeUnit} × ${timeAmount} ${timeUnit}s = ${this.formatMoneyAmount(totalAmount)}`
    };
  }

  private generateBaseAmount(params: MoneyScalingDifficultyParams): number {
    return generateRandomNumber(
      params.base_amount_range.max,
      params.decimal_places,
      params.base_amount_range.min
    );
  }

  private generateScaleFactor(params: MoneyScalingDifficultyParams): number {
    let factor = generateRandomNumber(
      params.scale_factor_range.max,
      params.include_fractional_scaling ? 1 : 0,
      params.scale_factor_range.min
    );

    // For fractional scaling, sometimes use common fractions
    if (params.include_fractional_scaling && Math.random() < 0.3) {
      const commonFractions = [0.5, 0.25, 0.75, 1.5, 2.5, 3.5];
      factor = randomChoice(commonFractions.filter(f => 
        f >= params.scale_factor_range.min && f <= params.scale_factor_range.max
      ));
    }

    return factor;
  }

  private calculateScaledAmount(baseAmount: number, scaleFactor: number, params: MoneyScalingDifficultyParams): number {
    const result = baseAmount * scaleFactor;
    return Math.round(result * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
  }

  private generateContext(params: MoneyScalingDifficultyParams, problemType: string): string {
    const contextType = randomChoice(params.context_types);
    
    switch (contextType) {
      case 'shopping':
        return problemType === 'scale_up' ? 
          'buying multiple items at the store' : 
          'calculating individual item cost from bulk purchase';
      
      case 'bulk_buying':
        return problemType === 'scale_up' ? 
          'ordering in larger quantities' : 
          'finding single unit cost from bulk price';
      
      case 'recipe_scaling':
        return problemType === 'scale_up' ? 
          'making a bigger batch of the recipe' : 
          'reducing recipe portion size';
      
      case 'group_activities':
        return problemType === 'scale_up' ? 
          'calculating costs for more people' : 
          'finding cost per person';
      
      case 'business':
        return problemType === 'scale_up' ? 
          'increasing production volume' : 
          'calculating unit production costs';
      
      case 'savings':
        return problemType === 'scale_up' ? 
          'saving for longer periods' : 
          'calculating daily saving amounts';
      
      default:
        return 'general scaling calculation';
    }
  }

  private generateProportionalContext(params: MoneyScalingDifficultyParams): string {
    const contexts = [
      'comparing different package sizes',
      'calculating costs for different group sizes',
      'finding the better value deal',
      'determining unit pricing',
      'scaling recipe costs'
    ];
    
    return randomChoice(contexts);
  }

  private generateRateContext(params: MoneyScalingDifficultyParams, timeUnit: string): string {
    const contexts = {
      hour: ['hourly wage calculation', 'parking fee calculation', 'rental cost calculation'],
      day: ['daily expense planning', 'vacation budget calculation', 'subscription cost calculation'],
      week: ['weekly allowance calculation', 'weekly shopping budget', 'weekly activity costs']
    };
    
    return randomChoice(contexts[timeUnit as keyof typeof contexts] || contexts.hour);
  }

  private formatMoneyAmount(amount: number): string {
    if (amount >= 100) {
      return `£${(amount / 100).toFixed(2)}`;
    }
    return `${amount}p`;
  }

  private formatScaleFactor(factor: number): string {
    if (factor === Math.floor(factor)) {
      return factor.toString();
    }
    return factor.toFixed(1);
  }

  // Helper method to find good scaling combinations
  findReasonableScalings(
    baseAmount: number, 
    params: MoneyScalingDifficultyParams
  ): Array<{ factor: number; result: number }> {
    const scalings: Array<{ factor: number; result: number }> = [];
    
    for (let factor = params.scale_factor_range.min; factor <= params.scale_factor_range.max; factor += 0.5) {
      const result = this.calculateScaledAmount(baseAmount, factor, params);
      
      // Check if result is reasonable (not too complex decimals)
      if (result < 1000 && (result === Math.floor(result) || result.toFixed(2) === result.toString())) {
        scalings.push({ factor, result });
      }
    }
    
    return scalings;
  }

  // Helper method to determine if scaling results in "nice" numbers
  isNiceScaling(baseAmount: number, scaleFactor: number): boolean {
    const result = baseAmount * scaleFactor;
    
    // Check if result is a whole number or has at most 2 decimal places
    const rounded = Math.round(result * 100) / 100;
    return Math.abs(result - rounded) < 0.001;
  }
}