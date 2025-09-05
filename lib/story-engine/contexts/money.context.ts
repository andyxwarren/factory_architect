import { StoryContext } from '@/lib/types';
import { randomChoice, getRandomName, MONEY_ITEMS } from '@/lib/utils';

export interface MoneyContext extends StoryContext {
  currency: string;
  currency_symbol: string;
  person: string;
  items: string[];
  shop_type?: string;
  payment_method?: string;
}

export class MoneyContextGenerator {
  private static readonly SHOP_TYPES = [
    'shop', 'store', 'market', 'bakery', 'bookshop', 
    'toy shop', 'sweet shop', 'stationery shop'
  ];

  private static readonly PAYMENT_METHODS = [
    'pays with', 'gives the shopkeeper', 'hands over'
  ];

  private static readonly ACTION_VERBS = {
    addition: ['buys', 'purchases', 'gets', 'picks up'],
    subtraction: ['spends', 'pays', 'gives'],
    multiplication: ['buys', 'orders', 'purchases'],
    division: ['shares', 'splits', 'divides equally']
  };

  static generate(operation: string): MoneyContext {
    const person = getRandomName();
    const itemCount = operation === 'ADDITION' ? randomChoice([2, 3, 4]) : 1;
    const items = this.selectItems(itemCount);
    
    return {
      unit_type: 'currency',
      unit_symbol: '£',
      currency: 'pounds',
      currency_symbol: '£',
      person,
      items,
      item_descriptors: items,
      shop_type: randomChoice(this.SHOP_TYPES),
      payment_method: randomChoice(this.PAYMENT_METHODS),
      action_verb: this.getActionVerb(operation),
      scenario_type: this.getScenarioType(operation)
    };
  }

  private static selectItems(count: number): string[] {
    const selected: string[] = [];
    const available = [...MONEY_ITEMS];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length);
      selected.push(available[index]);
      available.splice(index, 1);
    }
    
    return selected;
  }

  private static getActionVerb(operation: string): string {
    const verbs = this.ACTION_VERBS[operation.toLowerCase()] || this.ACTION_VERBS.addition;
    return randomChoice(verbs);
  }

  private static getScenarioType(operation: string): string {
    switch (operation) {
      case 'SUBTRACTION':
        return randomChoice(['change', 'spending', 'saving']);
      case 'DIVISION':
        return 'sharing';
      case 'MULTIPLICATION':
        return 'bulk_purchase';
      case 'PERCENTAGE':
        return 'discount';
      default:
        return 'purchase';
    }
  }

  static formatMoney(value: number, includeSymbol: boolean = true): string {
    const formatted = value.toFixed(2);
    
    // Handle pence only (values less than 1)
    if (value < 1) {
      const pence = Math.round(value * 100);
      return includeSymbol ? `${pence}p` : `${pence} pence`;
    }
    
    // Handle pounds and pence
    const pounds = Math.floor(value);
    const pence = Math.round((value - pounds) * 100);
    
    if (pence === 0) {
      return includeSymbol ? `£${pounds}` : `${pounds} pound${pounds !== 1 ? 's' : ''}`;
    }
    
    if (includeSymbol) {
      return `£${formatted}`;
    }
    
    return `${pounds} pound${pounds !== 1 ? 's' : ''} and ${pence} pence`;
  }

  static generateChangeScenario(): {
    payment_amount: number;
    tendered_amount: number;
    payment_description: string;
  } {
    const payment = randomChoice([5, 10, 20, 50]);
    const costPercentage = randomChoice([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
    const cost = Math.round(payment * costPercentage * 100) / 100;
    
    return {
      payment_amount: cost,
      tendered_amount: payment,
      payment_description: `a £${payment} note`
    };
  }
}