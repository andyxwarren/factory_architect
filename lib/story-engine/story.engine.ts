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
    const values = output.decimal_formatted.operands?.join(', ') || output.operands.join(', ');
    return `Calculate: ${values}. What is the total?`;
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
    return `What is ${output.decimal_formatted.minuend} minus ${output.decimal_formatted.subtrahend}?`;
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
    return `What is ${output.decimal_formatted.operands?.[0]} × ${output.decimal_formatted.operands?.[1]}?`;
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
    const question = `What is ${output.decimal_formatted.operands?.[0]} ÷ ${output.decimal_formatted.operands?.[1]}?`;
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
}