import {
  StoryContext,
  AdditionOutput,
  SubtractionOutput,
  MultiplicationOutput,
  DivisionOutput,
  PercentageOutput,
  FractionOutput,
  CountingOutput,
  TimeRateOutput,
  ConversionOutput,
  ComparisonOutput,
  MultiStepOutput,
  LinearEquationOutput,
  UnitRateOutput,
  isAdditionOutput,
  isSubtractionOutput,
  isMultiplicationOutput,
  isDivisionOutput
} from '@/lib/types';
import { MoneyContextGenerator } from './contexts/money.context';

export class StoryEngine {
  generateQuestion(mathOutput: any, context: StoryContext): string {
    if (isAdditionOutput(mathOutput)) {
      return this.generateAdditionQuestion(mathOutput, context);
    }
    if (isSubtractionOutput(mathOutput)) {
      return this.generateSubtractionQuestion(mathOutput, context);
    }
    if (isMultiplicationOutput(mathOutput)) {
      return this.generateMultiplicationQuestion(mathOutput, context);
    }
    if (isDivisionOutput(mathOutput)) {
      return this.generateDivisionQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'PERCENTAGE') {
      return this.generatePercentageQuestion(mathOutput as PercentageOutput, context);
    }
    if (mathOutput.operation === 'FRACTION') {
      return this.generateFractionQuestion(mathOutput as FractionOutput, context);
    }
    if (mathOutput.operation === 'COUNTING') {
      return this.generateCountingQuestion(mathOutput as CountingOutput, context);
    }
    if (mathOutput.operation === 'TIME_RATE') {
      return this.generateTimeRateQuestion(mathOutput as TimeRateOutput, context);
    }
    if (mathOutput.operation === 'CONVERSION') {
      return this.generateConversionQuestion(mathOutput as ConversionOutput, context);
    }
    if (mathOutput.operation === 'COMPARISON') {
      return this.generateComparisonQuestion(mathOutput as ComparisonOutput, context);
    }
    if (mathOutput.operation === 'MULTI_STEP') {
      return this.generateMultiStepQuestion(mathOutput as MultiStepOutput, context);
    }
    if (mathOutput.operation === 'LINEAR_EQUATION') {
      return this.generateLinearEquationQuestion(mathOutput as LinearEquationOutput, context);
    }
    if (mathOutput.operation === 'UNIT_RATE') {
      return this.generateUnitRateQuestion(mathOutput as UnitRateOutput, context);
    }
    
    // Money-specific models
    if (mathOutput.operation === 'COIN_RECOGNITION') {
      return this.generateCoinRecognitionQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'CHANGE_CALCULATION') {
      return this.generateChangeCalculationQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'MONEY_COMBINATIONS') {
      return this.generateMoneyCombinationsQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'MIXED_MONEY_UNITS') {
      return this.generateMixedMoneyUnitsQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'MONEY_FRACTIONS') {
      return this.generateMoneyFractionsQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'MONEY_SCALING') {
      return this.generateMoneyScalingQuestion(mathOutput, context);
    }
    
    // Geometry models
    if (mathOutput.operation === 'SHAPE_RECOGNITION') {
      return this.generateShapeRecognitionQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'SHAPE_PROPERTIES') {
      return this.generateShapePropertiesQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'ANGLE_MEASUREMENT') {
      return this.generateAngleMeasurementQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'POSITION_DIRECTION') {
      return this.generatePositionDirectionQuestion(mathOutput, context);
    }
    if (mathOutput.operation === 'AREA_PERIMETER') {
      return this.generateAreaPerimeterQuestion(mathOutput, context);
    }
    
    return "Question generation not yet implemented for this model.";
  }

  private generateAdditionQuestion(output: AdditionOutput, context: StoryContext): string {
    const person = context.person || 'Sarah';
    const items = context.item_descriptors || ['item'];
    const symbol = context.unit_symbol || '£';
    
    if (context.unit_type === 'currency' && items.length >= output.operands.length) {
      // Shopping scenario
      const purchases = output.operands.map((value, i) => 
        `a ${items[i]} for ${MoneyContextGenerator.formatMoney(value)}`
      ).join(', ');
      
      return `${person} goes to the shop and buys ${purchases}. How much does ${person} spend in total?`;
    }
    
    // Generic addition
    if (context.unit_type === 'currency') {
      const symbol = context.unit_symbol || '£';
      const values = output.operands.map(value => `${symbol}${output.decimal_formatted?.operands?.[output.operands.indexOf(value)] || value}`).join(', ');
      return `Add together: ${values}. What is the total?`;
    }
    
    const values = output.decimal_formatted.operands?.join(', ') || output.operands.join(', ');
    return `Add together: ${values}. What is the total?`;
  }

  private generateSubtractionQuestion(output: SubtractionOutput, context: StoryContext): string {
    const person = context.person || 'Tom';
    const symbol = context.unit_symbol || '£';
    
    if (context.scenario_type === 'change' && context.unit_type === 'currency') {
      const item = context.item_descriptors?.[0] || 'item';
      return `${person} buys a ${item} for ${MoneyContextGenerator.formatMoney(output.subtrahend)}. ` +
             `${person} pays with ${MoneyContextGenerator.formatMoney(output.minuend)}. ` +
             `How much change does ${person} receive?`;
    }
    
    if (context.scenario_type === 'spending' && context.unit_type === 'currency') {
      return `${person} has ${MoneyContextGenerator.formatMoney(output.minuend)}. ` +
             `${person} spends ${MoneyContextGenerator.formatMoney(output.subtrahend)}. ` +
             `How much money does ${person} have left?`;
    }
    
    // Generic subtraction
    if (context.unit_type === 'currency') {
      const symbol = context.unit_symbol || '£';
      const minuend = `${symbol}${output.decimal_formatted?.minuend || output.minuend}`;
      const subtrahend = `${symbol}${output.decimal_formatted?.subtrahend || output.subtrahend}`;
      return `Subtract: ${minuend} minus ${subtrahend}. What is the difference?`;
    }
    
    return `Subtract: ${output.decimal_formatted.minuend} minus ${output.decimal_formatted.subtrahend}. What is the difference?`;
  }

  private generateMultiplicationQuestion(output: MultiplicationOutput, context: StoryContext): string {
    const person = context.person || 'Emma';
    const symbol = context.unit_symbol || '£';
    
    if (context.unit_type === 'currency') {
      const item = context.item_descriptors?.[0] || 'ticket';
      const quantity = Math.round(output.multiplier);
      
      return `${person} buys ${quantity} ${item}${quantity > 1 ? 's' : ''}. ` +
             `Each ${item} costs ${MoneyContextGenerator.formatMoney(output.multiplicand)}. ` +
             `How much does ${person} pay in total?`;
    }
    
    // Generic multiplication
    if (context.unit_type === 'currency') {
      const symbol = context.unit_symbol || '£';
      const operand1 = `${symbol}${output.decimal_formatted?.operands?.[0] || output.operands?.[0]}`;
      const operand2 = output.decimal_formatted?.operands?.[1] || output.operands?.[1];
      return `Multiply: ${operand1} × ${operand2}. What is the result?`;
    }
    
    return `Multiply: ${output.decimal_formatted.operands?.[0]} × ${output.decimal_formatted.operands?.[1]}. What is the result?`;
  }

  private generateDivisionQuestion(output: DivisionOutput, context: StoryContext): string {
    const person = context.person || 'James';
    
    if (context.scenario_type === 'sharing' && context.unit_type === 'currency') {
      const friends = Math.round(output.divisor);
      return `${friends} friends want to share ${MoneyContextGenerator.formatMoney(output.dividend)} equally. ` +
             `How much does each person get?`;
    }
    
    if (context.unit_type === 'currency') {
      const item = context.item_descriptors?.[0] || 'pen';
      const pack_size = Math.round(output.divisor);
      
      return `A pack of ${pack_size} ${item}s costs ${MoneyContextGenerator.formatMoney(output.dividend)}. ` +
             `What is the cost of one ${item}?`;
    }
    
    // Generic division
    if (context.unit_type === 'currency') {
      const symbol = context.unit_symbol || '£';
      const dividend = `${symbol}${output.decimal_formatted?.operands?.[0] || output.operands?.[0]}`;
      const divisor = output.decimal_formatted?.operands?.[1] || output.operands?.[1];
      const question = `Divide: ${dividend} ÷ ${divisor}. What is the result?`;
      if (output.remainder > 0) {
        return `${question} (Give your answer as a quotient and remainder)`;
      }
      return question;
    }
    
    const question = `Divide: ${output.decimal_formatted.operands?.[0]} ÷ ${output.decimal_formatted.operands?.[1]}. What is the result?`;
    if (output.remainder > 0) {
      return `${question} (Give your answer as a quotient and remainder)`;
    }
    return question;
  }

  private generatePercentageQuestion(output: PercentageOutput, context: StoryContext): string {
    const person = context.person || 'Lucy';
    
    if (context.unit_type === 'currency') {
      const item = context.item_descriptors?.[0] || 'jacket';
      
      switch (output.operation_type) {
        case 'decrease':
          return `A ${item} costs ${MoneyContextGenerator.formatMoney(output.base_value)}. ` +
                 `In a sale, it is reduced by ${output.percentage}%. What is the new price?`;
        
        case 'increase':
          return `${person} has ${MoneyContextGenerator.formatMoney(output.base_value)} in savings. ` +
                 `The bank pays ${output.percentage}% interest. ` +
                 `How much will ${person} have after the interest is added?`;
        
        case 'of':
          return `${person} wants to save ${output.percentage}% of ${MoneyContextGenerator.formatMoney(output.base_value)}. ` +
                 `How much should ${person} save?`;
        
        default:
          return `What is ${output.percentage}% of ${MoneyContextGenerator.formatMoney(output.base_value)}?`;
      }
    }
    
    // Generic percentage
    return `Calculate ${output.percentage}% of ${output.base_value}.`;
  }

  private generateFractionQuestion(output: FractionOutput, context: StoryContext): string {
    const person = context.person || 'Emma';
    const amount = context.unit_type === 'currency' 
      ? MoneyContextGenerator.formatMoney(output.whole_value)
      : String(output.whole_value);
    
    const fractionText = output.fraction.formatted === "1/2" ? "half" : 
                        output.fraction.formatted === "1/3" ? "one third" :
                        output.fraction.formatted === "1/4" ? "one quarter" :
                        output.fraction.formatted === "3/4" ? "three quarters" :
                        output.fraction.formatted;

    if (context.unit_type === 'currency') {
      return `${person} wants to save ${fractionText} of ${amount}. How much should ${person} save?`;
    }
    
    return `What is ${fractionText} of ${amount}?`;
  }

  private generateCountingQuestion(output: CountingOutput, context: StoryContext): string {
    const targetAmount = MoneyContextGenerator.formatMoney(output.target_value / 100);
    
    if (output.solutions.length === 1 && output.is_minimum_solution) {
      return `How many coins do you need to make ${targetAmount} using the smallest number of coins?`;
    } else if (output.solutions.length === 1) {
      const coinType = this.getCoinName(output.solutions[0].denomination);
      return `How many ${coinType} coins do you need to make ${targetAmount}?`;
    } else {
      return `Show two different ways to make ${targetAmount} using coins.`;
    }
  }

  private generateTimeRateQuestion(output: TimeRateOutput, context: StoryContext): string {
    const person = context.person || 'Tom';
    const rateAmount = MoneyContextGenerator.formatMoney(output.rate.value);
    const periodName = this.getPeriodName(output.rate.period, output.calculation.periods);
    
    switch (output.problem_type) {
      case "time_to_target":
        const targetAmount = MoneyContextGenerator.formatMoney(output.calculation.total_value);
        return `${person} saves ${rateAmount} every ${output.rate.period}. How many ${output.rate.period}s will it take to save ${targetAmount}?`;
      
      case "total_after_time":
        return `If ${person} saves ${rateAmount} every ${output.rate.period} for ${output.calculation.periods} ${periodName}, how much will ${person} have saved?`;
      
      case "rate_calculation":
        const totalSaved = MoneyContextGenerator.formatMoney(output.calculation.total_value);
        return `${person} saved ${totalSaved} over ${output.calculation.periods} ${periodName}. How much did ${person} save each ${output.rate.period}?`;
      
      default:
        return `Calculate the savings over time.`;
    }
  }

  private generateConversionQuestion(output: ConversionOutput, context: StoryContext): string {
    if (output.original_unit === "pence" && output.converted_unit === "pounds") {
      return `Convert ${output.original_value}p into pounds and pence.`;
    } else if (output.original_unit === "pounds" && output.converted_unit === "pence") {
      return `How many pence are there in ${MoneyContextGenerator.formatMoney(output.original_value)}?`;
    } else {
      return `Convert ${output.formatted_original} to ${output.converted_unit}.`;
    }
  }

  private generateComparisonQuestion(output: ComparisonOutput, context: StoryContext): string {
    const options = output.options.map((option, index) => {
      const letter = String.fromCharCode(65 + index);
      if (option.quantity && output.comparison_type === "better_value") {
        return `${letter}: ${MoneyContextGenerator.formatMoney(option.value)} for ${option.quantity}ml`;
      } else {
        return `${letter}: ${MoneyContextGenerator.formatMoney(option.value)}`;
      }
    }).join(', ');

    switch (output.comparison_type) {
      case "direct":
        return `Which is worth more? ${options}`;
      
      case "unit_rate":
      case "better_value":
        return `Which is better value? ${options}`;
      
      default:
        return `Compare these options: ${options}`;
    }
  }

  private getCoinName(denomination: number): string {
    const names: { [key: number]: string } = {
      1: "1p", 2: "2p", 5: "5p", 10: "10p", 
      20: "20p", 50: "50p", 100: "£1", 200: "£2"
    };
    return names[denomination] || `${denomination}p`;
  }

  private getPeriodName(period: string, count: number = 1): string {
    const names = {
      day: count === 1 ? 'day' : 'days',
      week: count === 1 ? 'week' : 'weeks',
      month: count === 1 ? 'month' : 'months',
      year: count === 1 ? 'year' : 'years'
    };
    return names[period as keyof typeof names] || period;
  }

  generateAnswer(mathOutput: any, context: StoryContext): string {
    if (context.unit_type === 'currency') {
      let value: number;
      
      if (isAdditionOutput(mathOutput) || isSubtractionOutput(mathOutput)) {
        value = mathOutput.result;
      } else if (isMultiplicationOutput(mathOutput)) {
        value = mathOutput.result;
      } else if (isDivisionOutput(mathOutput)) {
        value = mathOutput.quotient;
        if (mathOutput.remainder > 0) {
          return `${MoneyContextGenerator.formatMoney(value)} with ${MoneyContextGenerator.formatMoney(mathOutput.remainder)} remaining`;
        }
      } else if (mathOutput.operation === 'PERCENTAGE') {
        value = mathOutput.result;
      } else if (mathOutput.operation === 'FRACTION') {
        value = mathOutput.result;
      } else if (mathOutput.operation === 'TIME_RATE') {
        if (mathOutput.problem_type === 'time_to_target') {
          return `${mathOutput.calculation.periods} ${this.getPeriodName(mathOutput.rate.period, mathOutput.calculation.periods)}`;
        }
        value = mathOutput.calculation.total_value;
      } else if (mathOutput.operation === 'COUNTING') {
        const coins = mathOutput.solutions.map((s: any) => 
          `${s.count} × ${this.getCoinName(s.denomination)}`
        ).join(', ');
        return `${coins} (${mathOutput.total_coins} coins total)`;
      } else if (mathOutput.operation === 'CONVERSION') {
        return mathOutput.formatted_converted;
      } else if (mathOutput.operation === 'COMPARISON') {
        const winner = String.fromCharCode(65 + mathOutput.winner_index);
        return `${winner} is ${mathOutput.comparison_type === 'direct' ? 'worth more' : 'better value'}`;
      } else if (mathOutput.operation === 'MULTI_STEP') {
        value = mathOutput.final_result;
      } else if (mathOutput.operation === 'LINEAR_EQUATION') {
        if (mathOutput.problem_type === 'solve_for_x') {
          return `x = ${mathOutput.target_x}`;
        } else if (mathOutput.problem_type === 'solve_for_y') {
          return `y = ${mathOutput.target_y}`;
        } else {
          return mathOutput.equation;
        }
      } else if (mathOutput.operation === 'UNIT_RATE') {
        if (mathOutput.problem_type === 'find_unit_rate') {
          return `${MoneyContextGenerator.formatMoney(mathOutput.unit_rate)} per ${mathOutput.item}`;
        } else if (mathOutput.problem_type === 'compare_rates') {
          const better = mathOutput.comparison_rates.find((r: any) => r.better);
          return better ? `Option with ${better.quantity} ${mathOutput.item}s is better` : 'Base option is better';
        }
        value = mathOutput.scaled_value;
      } else if (mathOutput.operation === 'COIN_RECOGNITION') {
        if (mathOutput.problem_type === 'identify_value') {
          return mathOutput.formatted_value || this.getCoinName(mathOutput.target_denomination);
        } else if (mathOutput.problem_type === 'identify_name') {
          return mathOutput.denomination_name;
        } else if (mathOutput.problem_type === 'compare_values') {
          return mathOutput.comparison_result === 'first_greater' ? 'First collection' : 
                 mathOutput.comparison_result === 'second_greater' ? 'Second collection' : 'Equal value';
        }
        return `${mathOutput.total_value}p`;
      } else if (mathOutput.operation === 'CHANGE_CALCULATION') {
        return this.formatCurrency(mathOutput.change_amount);
      } else if (mathOutput.operation === 'MONEY_COMBINATIONS') {
        const combination = mathOutput.combinations[0];
        const coins = combination.map((coin: any) => `${coin.count} × ${coin.formatted}`).join(', ');
        return `${coins} (one possible way)`;
      } else if (mathOutput.operation === 'MIXED_MONEY_UNITS') {
        return mathOutput.formatted_result;
      } else if (mathOutput.operation === 'MONEY_FRACTIONS') {
        return this.formatCurrency(mathOutput.result_amount);
      } else if (mathOutput.operation === 'MONEY_SCALING') {
        return this.formatCurrency(mathOutput.scaled_cost);
      } else if (mathOutput.operation === 'SHAPE_RECOGNITION') {
        return String(mathOutput.correct_answer);
      } else if (mathOutput.operation === 'SHAPE_PROPERTIES') {
        return String(mathOutput.correct_answer);
      } else if (mathOutput.operation === 'ANGLE_MEASUREMENT') {
        return String(mathOutput.correct_answer);
      } else if (mathOutput.operation === 'POSITION_DIRECTION') {
        return String(mathOutput.correct_answer);
      } else if (mathOutput.operation === 'AREA_PERIMETER') {
        return String(mathOutput.correct_answer);
      } else {
        value = mathOutput.result || mathOutput.final_result || 0;
      }
      
      return MoneyContextGenerator.formatMoney(value);
    }
    
    // Generic answer
    if (mathOutput.result !== undefined) {
      return String(mathOutput.result);
    }
    if (mathOutput.quotient !== undefined) {
      if (mathOutput.remainder > 0) {
        return `${mathOutput.quotient} remainder ${mathOutput.remainder}`;
      }
      return String(mathOutput.quotient);
    }
    
    return String(mathOutput.final_result || 0);
  }

  private generateMultiStepQuestion(output: MultiStepOutput, context: StoryContext): string {
    const person = context.person || 'Sarah';
    const symbol = context.unit_symbol || '£';
    
    const steps = output.steps.map((step, index) => {
      const stepNum = index + 1;
      if (step.operation === 'ADDITION') {
        return `adds ${symbol}${step.inputs.slice(1).join(' + ' + symbol)}`;
      } else if (step.operation === 'SUBTRACTION') {
        return `subtracts ${symbol}${step.inputs[1]}`;
      } else if (step.operation === 'MULTIPLICATION') {
        return `multiplies by ${step.inputs[1]}`;
      } else if (step.operation === 'DIVISION') {
        return `divides by ${step.inputs[1]}`;
      }
      return `performs ${step.operation.toLowerCase()}`;
    });

    const firstStep = output.steps[0];
    let questionText = `${person} starts with ${symbol}${firstStep.inputs[0]}`;
    
    if (steps.length > 1) {
      questionText += `, then ${steps.slice(1).join(', then ')}`;
    }
    
    questionText += '. How much does she have now?';
    
    return questionText;
  }

  private generateLinearEquationQuestion(output: LinearEquationOutput, context: StoryContext): string {
    if (output.problem_type === 'evaluate') {
      return `Using the equation ${output.equation}, what is the value of y when x = ${output.x_values[0]}?`;
    } else if (output.problem_type === 'complete_table') {
      return `Using the equation ${output.equation}, complete the table for x values: ${output.x_values.join(', ')}.`;
    } else if (output.problem_type === 'solve_for_y') {
      return `Using the equation ${output.equation}, find the value of y when x = ${output.target_x}.`;
    } else if (output.problem_type === 'solve_for_x') {
      return `Using the equation ${output.equation}, find the value of x when y = ${output.target_y}.`;
    }
    
    return `Work with the linear equation: ${output.equation}`;
  }

  private generateUnitRateQuestion(output: UnitRateOutput, context: StoryContext): string {
    const symbol = context.unit_symbol || '£';
    
    if (output.problem_type === 'find_unit_rate') {
      return `If ${output.base_quantity} ${output.item}s cost ${symbol}${output.base_rate}, what is the cost per ${output.item}?`;
    } else if (output.problem_type === 'scale_up' || output.problem_type === 'scale_down') {
      return `If ${output.base_quantity} ${output.item}s cost ${symbol}${output.base_rate}, how much would ${output.target_quantity} ${output.item}s cost?`;
    } else if (output.problem_type === 'compare_rates') {
      let question = `Compare these options for buying ${output.item}s:\n`;
      question += `Option A: ${output.base_quantity} for ${symbol}${output.base_rate}\n`;
      output.comparison_rates.forEach((rate, index) => {
        const letter = String.fromCharCode(66 + index); // B, C, D...
        question += `Option ${letter}: ${rate.quantity} for ${symbol}${rate.rate}\n`;
      });
      question += 'Which offers the best value per item?';
      return question;
    } else if (output.problem_type === 'best_value') {
      return `Which is the better deal: ${output.base_quantity} ${output.item}s for ${symbol}${output.base_rate}, or ${output.comparison_rates[0]?.quantity} ${output.item}s for ${symbol}${output.comparison_rates[0]?.rate}?`;
    }
    
    return `Calculate the rate for ${output.item}s at ${symbol}${output.unit_rate} per ${output.item}.`;
  }

  // Money-specific question generators
  private generateCoinRecognitionQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Tom';
    
    switch (output.problem_type) {
      case 'identify_value':
        return `${person} has a ${this.getCoinName(output.target_denomination)} coin. What is the value of this coin?`;
      
      case 'compare_values':
        const coins = output.collection.map((coin: any) => `${coin.count} × ${this.getCoinName(coin.denomination)}`).join(' and ');
        return `${person} has ${coins}. Which coin or collection has greater value?`;
      
      case 'total_value':
        const coinList = output.collection.map((coin: any) => `${coin.count} × ${this.getCoinName(coin.denomination)}`).join(', ');
        return `${person} has ${coinList}. What is the total value?`;
      
      default:
        return `${person} needs to identify the value of the coins.`;
    }
  }

  private generateChangeCalculationQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Sarah';
    
    if (output.problem_type === 'single_item') {
      const item = output.items[0];
      return `${person} buys a ${item.name} for ${this.formatCurrency(item.cost)}. ` +
             `${person} pays with ${output.payment_description}. How much change should ${person} receive?`;
    } else if (output.problem_type === 'multiple_items') {
      const itemList = output.items.map((item: any) => `${item.quantity} ${item.name}${item.quantity > 1 ? 's' : ''} for ${this.formatCurrency(item.cost * item.quantity)}`).join(' and ');
      return `${person} buys ${itemList} (total: ${this.formatCurrency(output.total_cost)}). ` +
             `${person} pays with ${output.payment_description}. How much change should ${person} receive?`;
    }
    
    return `${person} needs to calculate change from a purchase.`;
  }

  private generateMoneyCombinationsQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Emma';
    const targetAmount = output.formatted_target;
    
    switch (output.problem_type) {
      case 'find_combinations':
        return `Show ${output.combinations.length} different ways to make ${targetAmount} using coins.`;
      
      case 'make_amount':
        return `${person} wants to make ${targetAmount}. Show one way to do this using coins.`;
      
      case 'equivalent_amounts':
        return `${person} has ${targetAmount}. Show three different combinations of coins that make this amount.`;
      
      case 'compare_combinations':
        return `${person} wants to make ${targetAmount}. Which combination uses fewer coins?`;
      
      default:
        return `Find different ways to make ${targetAmount} using coins.`;
    }
  }

  private generateMixedMoneyUnitsQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'James';
    
    switch (output.problem_type) {
      case 'convert_units':
        if (output.conversion_type === 'pence_to_pounds') {
          return `${person} has ${output.formatted_source}. How much is this in pounds?`;
        } else if (output.conversion_type === 'pounds_to_pence') {
          return `${person} has ${output.formatted_source}. How much is this in pence?`;
        }
        break;
      
      case 'add_mixed_units':
        const amounts = output.amounts.map((amt: any) => amt.formatted).join(' and ');
        return `${person} has ${amounts}. What is the total amount?`;
      
      case 'subtract_mixed_units':
        return `${person} has ${output.formatted_source} and spends ${output.amount_spent.formatted}. How much is left?`;
      
      default:
        return `${person} needs to work with pounds and pence.`;
    }
    
    return `Convert between pounds and pence.`;
  }

  private generateMoneyFractionsQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Lucy';
    const amount = this.formatCurrency(output.whole_amount);
    const fractionText = this.getFractionText(output.fraction);
    
    switch (output.problem_type) {
      case 'fraction_of_amount':
        return `${person} wants to save ${fractionText} of ${amount}. How much should ${person} save?`;
      
      case 'find_fraction':
        return `${person} has ${amount} and spends ${this.formatCurrency(output.spent_amount)}. What fraction of the money did ${person} spend?`;
      
      case 'compare_fractions':
        return `${person} has ${amount}. Is ${fractionText} of this amount more than ${this.formatCurrency(output.comparison_amount)}?`;
      
      default:
        return `Calculate ${fractionText} of ${amount}.`;
    }
  }

  private generateMoneyScalingQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Alex';
    
    switch (output.problem_type) {
      case 'scale_up':
        return `If ${output.base_quantity} ${output.item}s cost ${this.formatCurrency(output.base_cost)}, ` +
               `how much would ${output.target_quantity} ${output.item}s cost?`;
      
      case 'scale_down':
        return `If ${output.base_quantity} ${output.item}s cost ${this.formatCurrency(output.base_cost)}, ` +
               `how much would ${output.target_quantity} ${output.item}s cost?`;
      
      case 'find_unit_cost':
        return `${output.base_quantity} ${output.item}s cost ${this.formatCurrency(output.base_cost)}. ` +
               `What is the cost of one ${output.item}?`;
      
      default:
        return `${person} needs to calculate proportional costs for ${output.item}s.`;
    }
  }

  private formatCurrency(amount: number): string {
    if (amount >= 100) {
      return `£${(amount / 100).toFixed(2)}`;
    } else {
      return `${amount}p`;
    }
  }

  private getFractionText(fraction: any): string {
    if (fraction.formatted === "1/2") return "half";
    if (fraction.formatted === "1/3") return "one third";
    if (fraction.formatted === "1/4") return "one quarter";
    if (fraction.formatted === "3/4") return "three quarters";
    return fraction.formatted;
  }

  // Geometry question generators
  private generateShapeRecognitionQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Tom';
    
    switch (output.problem_type) {
      case 'identify_shape':
        return `${person} is looking at a shape. What shape is this?`;
      
      case 'count_sides':
        const shapeName = output.target_shape;
        return `${person} is looking at a ${shapeName}. How many sides does this shape have?`;
      
      case 'count_vertices':
        const shapeForVertices = output.target_shape;
        return `${person} is looking at a ${shapeForVertices}. How many vertices (corners) does this shape have?`;
      
      case 'compare_shapes':
        const shape1 = output.shape_data[0]?.name;
        const shape2 = output.shape_data[1]?.name;
        return `${person} has a ${shape1} and a ${shape2}. Which shape has more sides?`;
      
      default:
        return `${person} needs to identify the shape.`;
    }
  }

  private generateShapePropertiesQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Emma';
    const shapeName = output.shape_name;
    const propertyFocus = output.question_focus;
    
    switch (output.problem_type) {
      case 'count_properties':
        const propertyName = this.getPropertyDisplayName(propertyFocus);
        return `${person} is studying a ${shapeName}. How many ${propertyName} does this shape have?`;
      
      case 'identify_property':
        if (propertyFocus === 'right_angles') {
          return `${person} is looking at a ${shapeName}. Does this shape have any right angles?`;
        } else if (propertyFocus === 'parallel_sides') {
          return `${person} is looking at a ${shapeName}. Does this shape have any parallel sides?`;
        } else {
          return `${person} is examining a ${shapeName}. What can you tell about its ${propertyFocus}?`;
        }
      
      case 'compare_properties':
        const shapes = shapeName.split(' vs ');
        const shape1 = shapes[0];
        const shape2 = shapes[1];
        const propertyDisplay = this.getPropertyDisplayName(propertyFocus);
        return `${person} is comparing shapes. Which shape has more ${propertyDisplay}: a ${shape1} or a ${shape2}?`;
      
      case 'classify_shapes':
        const propertyDesc = this.getPropertyDisplayName(propertyFocus);
        return `${person} needs to group shapes. Which of these shapes have ${propertyDesc}?`;
      
      default:
        return `${person} is studying the properties of a ${shapeName}.`;
    }
  }

  private generateAngleMeasurementQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Sophie';
    
    switch (output.problem_type) {
      case 'identify_type':
        return `${person} measures an angle and finds it is ${output.angle_degrees}°. What type of angle is this?`;
      
      case 'measure_angle':
        if (output.context === 'clock') {
          return `${person} is looking at a clock. ${output.visual_description}. What is the measurement of this angle?`;
        } else if (output.context === 'shape') {
          return `${person} is measuring an angle in a polygon. ${output.visual_description}. What is the measurement of this angle?`;
        } else {
          return `${person} needs to measure an angle. ${output.visual_description}. What is the measurement?`;
        }
      
      case 'calculate_missing':
        if (output.context === 'straight_line') {
          return `${person} knows that angles on a straight line add up to 180°. ${output.visual_description}. What is the missing angle?`;
        } else {
          return `${person} knows that angles around a point add up to 360°. ${output.visual_description}. What is the missing angle?`;
        }
      
      case 'convert_units':
        return `${person} measured an angle as ${output.angle_degrees}°. ${output.visual_description}. What is this measurement in the requested unit?`;
      
      default:
        return `${person} is working with angles.`;
    }
  }

  private generatePositionDirectionQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Alex';
    
    switch (output.problem_type) {
      case 'identify_position':
        if (output.coordinate_system === 'coordinate_plane') {
          return `${person} needs to identify the position of an object on a coordinate grid. What are the coordinates of the object?`;
        } else if (output.coordinate_system === 'lettered_grid') {
          return `${person} is looking at a grid with letters and numbers. What is the grid reference for the object?`;
        } else {
          return `${person} needs to describe the position of an object on the grid. What position is it in?`;
        }
      
      case 'follow_directions':
        const startDesc = this.formatPosition(output.start_position, output.coordinate_system);
        return `${person} starts at ${startDesc}. ${output.visual_description}. Where does ${person} end up?`;
      
      case 'give_directions':
        const startPos = this.formatPosition(output.start_position, output.coordinate_system);
        const targetPos = this.formatPosition(output.target_position, output.coordinate_system);
        return `${person} needs to get from ${startPos} to ${targetPos}. What directions should ${person} follow?`;
      
      case 'coordinates':
        if (output.question_focus === 'x_coordinate') {
          return `${person} is looking at a point on the coordinate plane. What is the x-coordinate?`;
        } else if (output.question_focus === 'y_coordinate') {
          return `${person} is looking at a point on the coordinate plane. What is the y-coordinate?`;
        } else {
          return `${person} needs to read the coordinates of a point. What are the coordinates?`;
        }
      
      case 'compass_directions':
        const centerDesc = this.formatPosition(output.start_position, output.coordinate_system);
        return `${person} starts at ${centerDesc} and moves according to compass directions. ${output.visual_description}. Which compass direction did ${person} move?`;
      
      case 'relative_position':
        return `${person} is comparing the positions of two objects on the grid. ${output.visual_description}. How would you describe the position of the second object relative to the first?`;
      
      default:
        return `${person} is working with positions and directions on a grid.`;
    }
  }

  private formatPosition(position: { x: number; y: number }, coordinateSystem: string): string {
    if (coordinateSystem === 'coordinate_plane') {
      return `(${position.x}, ${position.y})`;
    } else if (coordinateSystem === 'lettered_grid') {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const letter = letters[position.x - 1] || 'A';
      return `${letter}${position.y}`;
    } else {
      return `column ${position.x}, row ${position.y}`;
    }
  }

  private generateAreaPerimeterQuestion(output: any, context: StoryContext): string {
    const person = context.person || 'Maya';
    const shapeType = output.shape_type;
    const unit = output.measurement_unit;
    
    switch (output.problem_type) {
      case 'calculate_area':
        return `${person} needs to find the area of a ${shapeType}. ${output.visual_description}. What is the area?`;
      
      case 'calculate_perimeter':
        const perimeterName = shapeType === 'circle' ? 'circumference' : 'perimeter';
        return `${person} needs to find the ${perimeterName} of a ${shapeType}. ${output.visual_description}. What is the ${perimeterName}?`;
      
      case 'calculate_both':
        return `${person} needs to find both the area and perimeter of a ${shapeType}. ${output.visual_description}. What are the area and perimeter?`;
      
      case 'find_missing_dimension':
        const missingDim = output.missing_dimension?.name || 'dimension';
        const knownType = output.area_result ? 'area' : 'perimeter';
        const knownValue = output.area_result || output.perimeter_result;
        const knownUnit = output.area_result ? `${unit}²` : unit;
        return `${person} knows that a ${shapeType} has a ${knownType} of ${knownValue} ${knownUnit}. ${output.visual_description}. What is the missing ${missingDim}?`;
      
      default:
        return `${person} is working with the area and perimeter of a ${shapeType}.`;
    }
  }

  private getPropertyDisplayName(property: string): string {
    const displayNames: { [key: string]: string } = {
      'sides': 'sides',
      'vertices': 'vertices (corners)',
      'angles': 'angles',
      'right_angles': 'right angles',
      'parallel_sides': 'parallel sides',
      'lines_of_symmetry': 'lines of symmetry',
      'rotational_symmetry': 'rotational symmetry'
    };
    
    return displayNames[property] || property;
  }
}