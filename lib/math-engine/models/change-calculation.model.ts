import {
  IMathModel,
  ChangeCalculationDifficultyParams,
  ChangeCalculationOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class ChangeCalculationModel implements IMathModel<ChangeCalculationDifficultyParams, ChangeCalculationOutput> {
  public readonly model_id = "CHANGE_CALCULATION";

  private static readonly COMMON_PAYMENTS = [
    100, 200, 500, 1000, 2000, 5000 // 1p, 2p, 5p, £1, £2, £5 etc in pence
  ];

  private static readonly UK_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

  generate(params: ChangeCalculationDifficultyParams): ChangeCalculationOutput {
    const problemType = this.selectProblemType(params);
    
    switch (problemType) {
      case 'simple_change':
        return this.generateSimpleChangeProblem(params);
      case 'exact_payment':
        return this.generateExactPaymentProblem(params);
      case 'multiple_items':
        return this.generateMultipleItemsProblem(params);
      case 'change_breakdown':
        return this.generateChangeBreakdownProblem(params);
      default:
        return this.generateSimpleChangeProblem(params);
    }
  }

  getDefaultParams(year: number): ChangeCalculationDifficultyParams {
    if (year <= 2) {
      return {
        max_item_cost: 50, // Up to 50p
        payment_methods: [100, 200, 500], // £1, £2, £5
        decimal_places: 0,
        problem_types: ['simple_change', 'exact_payment'],
        include_breakdown: false,
        max_items: 1,
        allow_overpayment: true
      };
    } else if (year <= 3) {
      return {
        max_item_cost: 500, // Up to £5
        payment_methods: [100, 200, 500, 1000, 2000], // £1-£20
        decimal_places: 2,
        problem_types: ['simple_change', 'multiple_items', 'change_breakdown'],
        include_breakdown: true,
        max_items: 3,
        allow_overpayment: true
      };
    } else {
      return {
        max_item_cost: 2000, // Up to £20
        payment_methods: [500, 1000, 2000, 5000], // £5-£50
        decimal_places: 2,
        problem_types: ['simple_change', 'multiple_items', 'change_breakdown', 'exact_payment'],
        include_breakdown: true,
        max_items: 5,
        allow_overpayment: true
      };
    }
  }

  private selectProblemType(params: ChangeCalculationDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private generateSimpleChangeProblem(params: ChangeCalculationDifficultyParams): ChangeCalculationOutput {
    // Generate a simple single-item purchase with change
    const itemCost = this.generateItemCost(params);
    const paymentAmount = this.selectPaymentAmount(params, itemCost);
    const changeAmount = paymentAmount - itemCost;

    const changeBreakdown = params.include_breakdown ? 
      this.calculateOptimalChange(changeAmount) : [];

    return {
      operation: "CHANGE_CALCULATION",
      problem_type: 'simple_change',
      items: [{ name: 'item', cost: itemCost, quantity: 1 }],
      total_cost: itemCost,
      payment_amount: paymentAmount,
      change_amount: changeAmount,
      change_breakdown: changeBreakdown,
      payment_description: this.formatPaymentDescription(paymentAmount)
    };
  }

  private generateExactPaymentProblem(params: ChangeCalculationDifficultyParams): ChangeCalculationOutput {
    // Generate a problem where exact payment is needed
    const itemCost = this.generateItemCost(params);
    const paymentAmount = itemCost; // Exact payment
    const changeAmount = 0;

    return {
      operation: "CHANGE_CALCULATION",
      problem_type: 'exact_payment',
      items: [{ name: 'item', cost: itemCost, quantity: 1 }],
      total_cost: itemCost,
      payment_amount: paymentAmount,
      change_amount: changeAmount,
      change_breakdown: [],
      payment_description: this.formatPaymentDescription(paymentAmount)
    };
  }

  private generateMultipleItemsProblem(params: ChangeCalculationDifficultyParams): ChangeCalculationOutput {
    // Generate multiple items with total and change
    const itemCount = generateRandomNumber(Math.min(params.max_items, 4), 0, 2);
    const items: Array<{ name: string; cost: number; quantity: number }> = [];
    let totalCost = 0;

    for (let i = 0; i < itemCount; i++) {
      const cost = this.generateItemCost(params, 0.7); // Slightly smaller items for multiple
      const quantity = 1;
      items.push({
        name: this.getItemName(i),
        cost,
        quantity
      });
      totalCost += cost * quantity;
    }

    const paymentAmount = this.selectPaymentAmount(params, totalCost);
    const changeAmount = paymentAmount - totalCost;
    const changeBreakdown = params.include_breakdown ? 
      this.calculateOptimalChange(changeAmount) : [];

    return {
      operation: "CHANGE_CALCULATION",
      problem_type: 'multiple_items',
      items,
      total_cost: totalCost,
      payment_amount: paymentAmount,
      change_amount: changeAmount,
      change_breakdown: changeBreakdown,
      payment_description: this.formatPaymentDescription(paymentAmount)
    };
  }

  private generateChangeBreakdownProblem(params: ChangeCalculationDifficultyParams): ChangeCalculationOutput {
    // Focus on breaking down change into denominations
    const itemCost = this.generateItemCost(params, 0.6); // Smaller cost to ensure meaningful change
    const paymentAmount = this.selectPaymentAmount(params, itemCost, true); // Force larger payment
    const changeAmount = paymentAmount - itemCost;
    
    const changeBreakdown = this.calculateOptimalChange(changeAmount);

    return {
      operation: "CHANGE_CALCULATION",
      problem_type: 'change_breakdown',
      items: [{ name: 'item', cost: itemCost, quantity: 1 }],
      total_cost: itemCost,
      payment_amount: paymentAmount,
      change_amount: changeAmount,
      change_breakdown: changeBreakdown,
      payment_description: this.formatPaymentDescription(paymentAmount)
    };
  }

  private generateItemCost(params: ChangeCalculationDifficultyParams, multiplier: number = 1): number {
    const maxCost = Math.floor(params.max_item_cost * multiplier);
    let cost = generateRandomNumber(maxCost, params.decimal_places, 5); // Minimum 5p
    
    // Round to appropriate increment based on decimal places
    if (params.decimal_places === 0) {
      cost = Math.round(cost / 5) * 5; // Round to nearest 5p
    } else {
      cost = Math.round(cost * 100) / 100; // Round to nearest penny
    }
    
    return cost;
  }

  private selectPaymentAmount(
    params: ChangeCalculationDifficultyParams, 
    itemCost: number, 
    forceChange: boolean = false
  ): number {
    const availablePayments = params.payment_methods.filter(p => p > itemCost);
    
    if (availablePayments.length === 0 || (!forceChange && Math.random() < 0.2)) {
      // Sometimes allow exact payment or use next denomination up
      const nextUp = ChangeCalculationModel.COMMON_PAYMENTS.find(p => p > itemCost);
      return nextUp || itemCost * 1.5;
    }
    
    return randomChoice(availablePayments);
  }

  private calculateOptimalChange(changeAmount: number): Array<{ denomination: number; count: number; formatted: string }> {
    if (changeAmount <= 0) return [];

    const breakdown: Array<{ denomination: number; count: number; formatted: string }> = [];
    let remaining = Math.round(changeAmount); // Work in pence

    // Use greedy algorithm with UK denominations (in pence)
    const denominations = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
    
    for (const denom of denominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        breakdown.push({
          denomination: denom,
          count,
          formatted: this.formatDenomination(denom)
        });
        remaining -= count * denom;
      }
    }

    return breakdown;
  }

  private formatPaymentDescription(amount: number): string {
    if (amount >= 500) {
      const pounds = Math.floor(amount / 100);
      return `£${pounds} note`;
    } else if (amount >= 100) {
      const pounds = amount / 100;
      return `£${pounds} coin`;
    } else {
      return `${amount}p coin`;
    }
  }

  private formatDenomination(denominationInPence: number): string {
    if (denominationInPence >= 100) {
      const pounds = denominationInPence / 100;
      return `£${pounds}`;
    }
    return `${denominationInPence}p`;
  }

  private getItemName(index: number): string {
    const items = ['apple', 'book', 'pencil', 'rubber', 'sweet', 'toy', 'sticker', 'card'];
    return items[index % items.length];
  }
}