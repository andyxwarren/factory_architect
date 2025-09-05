import {
  IMathModel,
  CoinRecognitionDifficultyParams,
  CoinRecognitionOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class CoinRecognitionModel implements IMathModel<CoinRecognitionDifficultyParams, CoinRecognitionOutput> {
  public readonly model_id = "COIN_RECOGNITION";

  private static readonly UK_COINS = {
    1: { name: 'penny', plural: 'pennies', format: '1p' },
    2: { name: 'two pence', plural: 'two pence coins', format: '2p' },
    5: { name: 'five pence', plural: 'five pence coins', format: '5p' },
    10: { name: 'ten pence', plural: 'ten pence coins', format: '10p' },
    20: { name: 'twenty pence', plural: 'twenty pence coins', format: '20p' },
    50: { name: 'fifty pence', plural: 'fifty pence coins', format: '50p' }
  };

  private static readonly UK_NOTES = {
    500: { name: 'five pound note', plural: 'five pound notes', format: '£5' },
    1000: { name: 'ten pound note', plural: 'ten pound notes', format: '£10' },
    2000: { name: 'twenty pound note', plural: 'twenty pound notes', format: '£20' },
    5000: { name: 'fifty pound note', plural: 'fifty pound notes', format: '£50' }
  };

  generate(params: CoinRecognitionDifficultyParams): CoinRecognitionOutput {
    const problemType = this.selectProblemType(params);
    const denominations = this.getAvailableDenominations(params);
    
    switch (problemType) {
      case 'identify_value':
        return this.generateIdentifyValueProblem(params, denominations);
      case 'identify_name':
        return this.generateIdentifyNameProblem(params, denominations);
      case 'count_collection':
        return this.generateCountCollectionProblem(params, denominations);
      case 'compare_values':
        return this.generateCompareValuesProblem(params, denominations);
      default:
        return this.generateIdentifyValueProblem(params, denominations);
    }
  }

  getDefaultParams(year: number): CoinRecognitionDifficultyParams {
    if (year <= 1) {
      return {
        include_coins: [1, 2, 5, 10],
        include_notes: [],
        problem_types: ['identify_value', 'identify_name'],
        max_coin_count: 3,
        allow_mixed_denominations: false,
        include_combinations: false
      };
    } else if (year <= 2) {
      return {
        include_coins: [1, 2, 5, 10, 20],
        include_notes: [500], // £5 note
        problem_types: ['identify_value', 'count_collection', 'compare_values'],
        max_coin_count: 5,
        allow_mixed_denominations: true,
        include_combinations: false
      };
    } else {
      return {
        include_coins: [1, 2, 5, 10, 20, 50],
        include_notes: [500, 1000, 2000], // £5, £10, £20
        problem_types: ['identify_value', 'count_collection', 'compare_values'],
        max_coin_count: 8,
        allow_mixed_denominations: true,
        include_combinations: true
      };
    }
  }

  private selectProblemType(params: CoinRecognitionDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private getAvailableDenominations(params: CoinRecognitionDifficultyParams): number[] {
    return [...params.include_coins, ...params.include_notes];
  }

  private generateIdentifyValueProblem(
    params: CoinRecognitionDifficultyParams, 
    denominations: number[]
  ): CoinRecognitionOutput {
    const denomination = randomChoice(denominations);
    const isNote = denomination >= 500;
    const coinData = isNote ? 
      CoinRecognitionModel.UK_NOTES[denomination as keyof typeof CoinRecognitionModel.UK_NOTES] :
      CoinRecognitionModel.UK_COINS[denomination as keyof typeof CoinRecognitionModel.UK_COINS];

    return {
      operation: "COIN_RECOGNITION",
      problem_type: 'identify_value',
      target_denomination: denomination,
      denomination_name: coinData.name,
      formatted_value: coinData.format,
      is_note: isNote,
      collection: [{ denomination, count: 1 }],
      total_value: denomination,
      answer_type: 'value'
    };
  }

  private generateIdentifyNameProblem(
    params: CoinRecognitionDifficultyParams, 
    denominations: number[]
  ): CoinRecognitionOutput {
    const denomination = randomChoice(denominations);
    const isNote = denomination >= 500;
    const coinData = isNote ? 
      CoinRecognitionModel.UK_NOTES[denomination as keyof typeof CoinRecognitionModel.UK_NOTES] :
      CoinRecognitionModel.UK_COINS[denomination as keyof typeof CoinRecognitionModel.UK_COINS];

    return {
      operation: "COIN_RECOGNITION",
      problem_type: 'identify_name',
      target_denomination: denomination,
      denomination_name: coinData.name,
      formatted_value: coinData.format,
      is_note: isNote,
      collection: [{ denomination, count: 1 }],
      total_value: denomination,
      answer_type: 'name'
    };
  }

  private generateCountCollectionProblem(
    params: CoinRecognitionDifficultyParams, 
    denominations: number[]
  ): CoinRecognitionOutput {
    const collection: Array<{ denomination: number; count: number }> = [];
    let totalValue = 0;

    if (params.allow_mixed_denominations) {
      // Use 2-3 different denominations
      const selectedDenoms = this.selectMultipleDenominations(denominations, 2, 3);
      
      for (const denom of selectedDenoms) {
        const count = generateRandomNumber(3, 0, 1);
        if (count > 0) {
          collection.push({ denomination: denom, count });
          totalValue += denom * count;
        }
      }
    } else {
      // Use only one denomination
      const denomination = randomChoice(denominations.filter(d => d < 500)); // Prefer coins for counting
      const count = generateRandomNumber(Math.min(params.max_coin_count, 5), 0, 2);
      collection.push({ denomination, count });
      totalValue = denomination * count;
    }

    return {
      operation: "COIN_RECOGNITION",
      problem_type: 'count_collection',
      collection,
      total_value: totalValue,
      answer_type: 'total_value'
    };
  }

  private generateCompareValuesProblem(
    params: CoinRecognitionDifficultyParams, 
    denominations: number[]
  ): CoinRecognitionOutput {
    // Generate two different amounts to compare
    const denom1 = randomChoice(denominations);
    const denom2 = randomChoice(denominations.filter(d => d !== denom1));

    const collection = [
      { denomination: denom1, count: 1 },
      { denomination: denom2, count: 1 }
    ];

    const comparison_result = denom1 > denom2 ? 'first_greater' : 
                             denom1 < denom2 ? 'second_greater' : 'equal';

    return {
      operation: "COIN_RECOGNITION",
      problem_type: 'compare_values',
      collection,
      total_value: Math.max(denom1, denom2),
      comparison_result,
      answer_type: 'comparison'
    };
  }

  private selectMultipleDenominations(available: number[], min: number, max: number): number[] {
    const count = generateRandomNumber(max, 0, min);
    const selected: number[] = [];
    const remaining = [...available];

    for (let i = 0; i < count && remaining.length > 0; i++) {
      const index = Math.floor(Math.random() * remaining.length);
      selected.push(remaining[index]);
      remaining.splice(index, 1);
    }

    return selected;
  }

  getDenominationName(denomination: number): string {
    if (denomination >= 500) {
      return CoinRecognitionModel.UK_NOTES[denomination as keyof typeof CoinRecognitionModel.UK_NOTES]?.name || 'unknown';
    }
    return CoinRecognitionModel.UK_COINS[denomination as keyof typeof CoinRecognitionModel.UK_COINS]?.name || 'unknown';
  }

  formatDenomination(denomination: number): string {
    if (denomination >= 500) {
      return CoinRecognitionModel.UK_NOTES[denomination as keyof typeof CoinRecognitionModel.UK_NOTES]?.format || `£${denomination/100}`;
    }
    return CoinRecognitionModel.UK_COINS[denomination as keyof typeof CoinRecognitionModel.UK_COINS]?.format || `${denomination}p`;
  }
}