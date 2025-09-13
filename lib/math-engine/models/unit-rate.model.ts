import {
  IMathModel,
  UnitRateDifficultyParams,
  UnitRateOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class UnitRateModel implements IMathModel<UnitRateDifficultyParams, UnitRateOutput> {
  public readonly model_id = "UNIT_RATE";

  private static readonly RATE_CONTEXTS = {
    speed: { unit: 'km/h', items: ['car', 'bike', 'bus', 'train'] },
    cost: { unit: '£/item', items: ['apple', 'book', 'pencil', 'toy'] },
    production: { unit: 'items/hour', items: ['widget', 'cake', 'bottle', 'box'] },
    consumption: { unit: 'litres/100km', items: ['car', 'van', 'truck', 'motorbike'] },
    wage: { unit: '£/hour', items: ['job', 'work', 'position', 'role'] }
  };

  generate(params: UnitRateDifficultyParams): UnitRateOutput {
    const context = randomChoice(Object.keys(UnitRateModel.RATE_CONTEXTS));
    const contextData = UnitRateModel.RATE_CONTEXTS[context as keyof typeof UnitRateModel.RATE_CONTEXTS];
    
    const item = randomChoice(contextData.items);
    const baseQuantity = this.generateBaseQuantity(params);
    const baseRate = this.generateBaseRate(params);
    const unitRate = this.calculateUnitRate(baseRate, baseQuantity, params);
    
    // Generate target quantity for scaling
    const targetQuantity = this.generateTargetQuantity(params, baseQuantity);
    const scaledValue = this.calculateScaledValue(unitRate, targetQuantity, params);

    // Determine problem type
    const problemType = this.selectProblemType(params);

    return {
      operation: "UNIT_RATE",
      context,
      item,
      unit: contextData.unit,
      base_quantity: baseQuantity,
      base_rate: baseRate,
      unit_rate: unitRate,
      target_quantity: targetQuantity,
      scaled_value: scaledValue,
      problem_type: problemType,
      comparison_rates: this.generateComparisonRates(params, context, unitRate)
    };
  }

  getDefaultParams(year: number): UnitRateDifficultyParams {
    if (year <= 3) {
      return {
        base_quantity_range: { min: 2, max: 10 },
        base_rate_range: { min: 10, max: 50 },
        target_quantity_range: { min: 1, max: 20 },
        decimal_places: 0,
        allow_complex_rates: false,
        problem_types: ['find_unit_rate', 'scale_up'],
        include_comparisons: false,
        comparison_count: 0
      };
    } else if (year <= 4) {
      return {
        base_quantity_range: { min: 2, max: 20 },
        base_rate_range: { min: 5, max: 100 },
        target_quantity_range: { min: 1, max: 50 },
        decimal_places: 1,
        allow_complex_rates: false,
        problem_types: ['find_unit_rate', 'scale_up', 'scale_down'],
        include_comparisons: true,
        comparison_count: 2
      };
    } else {
      return {
        base_quantity_range: { min: 2, max: 50 },
        base_rate_range: { min: 1, max: 200 },
        target_quantity_range: { min: 1, max: 100 },
        decimal_places: 2,
        allow_complex_rates: true,
        problem_types: ['find_unit_rate', 'scale_up', 'scale_down', 'compare_rates', 'best_value'],
        include_comparisons: true,
        comparison_count: 3
      };
    }
  }

  private generateBaseQuantity(params: UnitRateDifficultyParams): number {
    return generateRandomNumber(
      params.base_quantity_range.max,
      0, // Quantities are typically whole numbers
      params.base_quantity_range.min
    );
  }

  private generateBaseRate(params: UnitRateDifficultyParams): number {
    return generateRandomNumber(
      params.base_rate_range.max,
      params.decimal_places,
      params.base_rate_range.min
    );
  }

  private generateTargetQuantity(params: UnitRateDifficultyParams, baseQuantity: number): number {
    let targetQuantity: number;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Calculate available options excluding base quantity
    const availableValues: number[] = [];
    for (let i = params.target_quantity_range.min; i <= params.target_quantity_range.max; i++) {
      if (i !== baseQuantity) {
        availableValues.push(i);
      }
    }
    
    // If no alternatives available, return a safe fallback
    if (availableValues.length === 0) {
      return baseQuantity + 1 <= params.target_quantity_range.max ? 
        baseQuantity + 1 : 
        Math.max(params.target_quantity_range.min, baseQuantity - 1);
    }
    
    do {
      targetQuantity = generateRandomNumber(
        params.target_quantity_range.max,
        0,
        params.target_quantity_range.min
      );
      attempts++;
      
      // Safety valve to prevent infinite loops
      if (attempts > maxAttempts) {
        targetQuantity = randomChoice(availableValues);
        break;
      }
    } while (targetQuantity === baseQuantity);

    return targetQuantity;
  }

  private calculateUnitRate(baseRate: number, baseQuantity: number, params: UnitRateDifficultyParams): number {
    const rate = baseRate / baseQuantity;
    return Math.round(rate * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
  }

  private calculateScaledValue(unitRate: number, targetQuantity: number, params: UnitRateDifficultyParams): number {
    const value = unitRate * targetQuantity;
    return Math.round(value * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
  }

  private selectProblemType(params: UnitRateDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateComparisonRates(
    params: UnitRateDifficultyParams, 
    context: string, 
    baseUnitRate: number
  ): Array<{ quantity: number; rate: number; unit_rate: number; better: boolean }> {
    if (!params.include_comparisons || params.comparison_count === 0) {
      return [];
    }

    const comparisons: Array<{ quantity: number; rate: number; unit_rate: number; better: boolean }> = [];
    
    for (let i = 0; i < params.comparison_count; i++) {
      const quantity = generateRandomNumber(
        params.base_quantity_range.max,
        0,
        params.base_quantity_range.min
      );
      
      // Generate a rate that creates either better or worse unit rate
      const isBetter = Math.random() > 0.5;
      
      // Create multiplier for better/worse rates using proper random float generation
      let rateMultiplier: number;
      if (isBetter) {
        // For better rates: 0.7 to 0.95 (5% to 30% better)
        const min = 0.7;
        const max = 0.95;
        rateMultiplier = Math.random() * (max - min) + min;
      } else {
        // For worse rates: 1.05 to 1.4 (5% to 40% worse)
        const min = 1.05;
        const max = 1.4;
        rateMultiplier = Math.random() * (max - min) + min;
      }
      
      // Round to appropriate decimal places
      rateMultiplier = Math.round(rateMultiplier * 100) / 100;

      const rate = Math.round(baseUnitRate * quantity * rateMultiplier * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
      const unitRate = this.calculateUnitRate(rate, quantity, params);
      
      // Determine if this is better based on context
      let better: boolean;
      if (context === 'cost') {
        better = unitRate < baseUnitRate; // Lower cost per unit is better
      } else if (context === 'consumption') {
        better = unitRate < baseUnitRate; // Lower consumption is better
      } else {
        better = unitRate > baseUnitRate; // Higher rate is generally better
      }

      comparisons.push({
        quantity,
        rate,
        unit_rate: unitRate,
        better
      });
    }

    return comparisons;
  }
}