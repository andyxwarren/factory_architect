// Direct Calculation Controller - Handles traditional calculation questions
// This is the simplest format that maps closely to the existing question generation flow

import {
  QuestionController,
  GenerationParams,
  ControllerDependencies
} from './base-question.controller';
import {
  QuestionDefinition,
  QuestionFormat,
  QuestionParameters,
  QuestionSolution,
  DistractorContext,
  DistractorStrategy,
  Distractor,
  FormattingOptions
} from '@/lib/types/question-formats';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';

/**
 * Generates direct calculation questions like "What is 25 + 17?"
 * This format most closely matches the existing system behavior
 */
export class DirectCalculationController extends QuestionController {
  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    this.validateParams(params);

    // 1. Generate mathematical output using existing math engine
    const mathOutput = await this.generateMathOutput(
      params.mathModel,
      params.difficultyParams
    );

    // 2. Select appropriate scenario for this calculation
    const scenario = await this.selectScenario(
      QuestionFormat.DIRECT_CALCULATION,
      params.difficulty.year,
      params.preferredTheme,
      params.mathModel
    );

    // 3. Create question parameters from math output
    const questionParams = this.createQuestionParameters(mathOutput, scenario);

    // 4. Generate the correct answer
    const correctAnswer = this.generateCorrectAnswer(mathOutput, questionParams);

    // 5. Generate distractors using enhanced distractor engine
    const distractors = await this.generateCalculationDistractors(
      correctAnswer,
      mathOutput,
      params
    );

    // 6. Create solution object
    const solution: QuestionSolution = {
      correctAnswer,
      distractors,
      explanation: this.generateExplanation(mathOutput, questionParams),
      workingSteps: this.generateWorkingSteps(mathOutput),
      solutionStrategy: this.getSolutionStrategy(params.mathModel)
    };

    // 7. Assemble complete question definition
    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.DIRECT_CALCULATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    return {
      ...baseDefinition,
      parameters: questionParams,
      solution
    } as QuestionDefinition;
  }

  /**
   * Create question parameters from math output and scenario
   */
  private createQuestionParameters(mathOutput: any, scenario: any): QuestionParameters {
    const mathValues: Record<string, number> = {};
    const narrativeValues: Record<string, any> = {};
    const units: Record<string, string> = {};

    // Extract mathematical values based on operation type
    switch (mathOutput.operation) {
      case 'ADDITION':
        mathOutput.operands.forEach((operand: number, index: number) => {
          mathValues[`operand_${index + 1}`] = operand;
        });
        mathValues.result = mathOutput.result;
        break;

      case 'SUBTRACTION':
        mathValues.minuend = mathOutput.minuend;
        mathValues.subtrahend = mathOutput.subtrahend;
        mathValues.result = mathOutput.result;
        break;

      case 'MULTIPLICATION':
        mathValues.multiplicand = mathOutput.multiplicand;
        mathValues.multiplier = mathOutput.multiplier;
        mathValues.result = mathOutput.result;
        break;

      case 'DIVISION':
        mathValues.dividend = mathOutput.dividend;
        mathValues.divisor = mathOutput.divisor;
        mathValues.quotient = mathOutput.quotient;
        if (mathOutput.remainder) {
          mathValues.remainder = mathOutput.remainder;
        }
        break;

      case 'PERCENTAGE':
        mathValues.base_value = mathOutput.base_value;
        mathValues.percentage = mathOutput.percentage;
        mathValues.result = mathOutput.result;
        break;

      case 'FRACTION':
        mathValues.whole_value = mathOutput.whole_value;
        mathValues.numerator = mathOutput.fraction.numerator;
        mathValues.denominator = mathOutput.fraction.denominator;
        mathValues.result = mathOutput.result;
        break;

      default:
        // Generic handling for other models
        if (mathOutput.result !== undefined) {
          mathValues.result = mathOutput.result;
        }
        if (mathOutput.operands) {
          mathOutput.operands.forEach((operand: number, index: number) => {
            mathValues[`operand_${index + 1}`] = operand;
          });
        }
    }

    // Extract narrative values from scenario
    if (scenario.characters && scenario.characters.length > 0) {
      narrativeValues.character = scenario.characters[0].name;
    }
    if (scenario.items && scenario.items.length > 0) {
      narrativeValues.items = scenario.items.map((item: any) => item.name);
      narrativeValues.item = scenario.items[0]?.name || 'item';
    }
    if (scenario.setting) {
      narrativeValues.location = scenario.setting.location;
      narrativeValues.context = scenario.setting.timeContext;
    }

    // Add template-specific values based on scenario theme
    switch (scenario.theme) {
      case 'SPORTS':
        // For sports scenarios, provide price and quantity
        if (scenario.items && scenario.items.length > 0) {
          const sportItem = scenario.items[0];
          narrativeValues.price = MoneyContextGenerator.formatMoney(sportItem.typicalValue?.typical || 10);
          narrativeValues.quantity = String(mathOutput.operand_2 || mathOutput.multiplier || 2);
        }
        break;

      case 'COOKING':
        // For cooking scenarios, provide recipe and prices
        const recipes = ['biscuits', 'cake', 'muffins', 'bread', 'pizza'];
        narrativeValues.recipe = recipes[Math.floor(Math.random() * recipes.length)];

        if (mathOutput.operands && mathOutput.operands.length > 0) {
          // Create formatted price list for ingredients
          const priceList = mathOutput.operands.map((price: number) =>
            MoneyContextGenerator.formatMoney(price)
          ).join(', ');
          narrativeValues.prices = priceList;
        }
        break;

      case 'SCHOOL':
        // For school scenarios with multiple items, handle pricing
        if (scenario.items && scenario.items.length > 1 && mathOutput.operands) {
          const itemPrices = scenario.items.slice(0, mathOutput.operands.length).map((item: any, index: number) => {
            const price = mathOutput.operands[index] || item.typicalValue?.typical || 5;
            return `${item.name} (${MoneyContextGenerator.formatMoney(price)})`;
          }).join(', ');
          narrativeValues.items = itemPrices;
        }
        break;

      default:
        // Default handling for other scenarios
        if (mathOutput.operands && mathOutput.operands.length > 0) {
          narrativeValues.price = MoneyContextGenerator.formatMoney(mathOutput.operands[0]);
          if (mathOutput.operands.length > 1) {
            narrativeValues.quantity = String(mathOutput.operands[1]);
          }
        }
    }

    // Set units based on scenario context
    if (scenario.culturalElements) {
      const currencyElement = scenario.culturalElements.find((el: any) => el.type === 'currency');
      if (currencyElement) {
        units.currency = currencyElement.value;
        units.result = currencyElement.value;
      }
    }

    const formatting: FormattingOptions = {
      currencyFormat: 'symbol',
      decimalPlaces: this.getDecimalPlaces(mathOutput),
      useGroupingSeparators: mathValues.result > 1000,
      unitPosition: 'before'
    };

    return {
      mathValues,
      narrativeValues,
      units,
      formatting
    };
  }

  /**
   * Generate the correct answer from math output
   */
  private generateCorrectAnswer(mathOutput: any, params: QuestionParameters): any {
    let value: number;
    let displayText: string;
    let units: string | undefined;

    // Get the primary result value
    if (mathOutput.operation === 'DIVISION' && mathOutput.remainder > 0) {
      value = mathOutput.quotient;
      const remainderText = mathOutput.remainder > 0 ? ` remainder ${mathOutput.remainder}` : '';
      displayText = `${this.formatValue(mathOutput.quotient, params.units.result)}${remainderText}`;
    } else {
      value = mathOutput.result || mathOutput.quotient || mathOutput.final_result;
      displayText = this.formatValue(value, params.units.result, params.formatting.decimalPlaces);
    }

    units = params.units.result;

    return {
      value,
      displayText,
      units,
      metadata: {
        mathOutput,
        operationType: mathOutput.operation
      }
    };
  }

  /**
   * Generate distractors specific to calculation questions
   */
  private async generateCalculationDistractors(
    correctAnswer: any,
    mathOutput: any,
    params: GenerationParams
  ): Promise<Distractor[]> {
    const context: DistractorContext = {
      mathModel: params.mathModel,
      format: QuestionFormat.DIRECT_CALCULATION,
      operands: this.extractOperands(mathOutput),
      operation: mathOutput.operation,
      yearLevel: params.difficulty.year,
      existingDistractors: []
    };

    // Use the enhanced distractor engine
    const engineDistractors = await this.generateDistractors(correctAnswer.value, context, 3);

    // Add some format-specific distractors
    const specificDistractors = this.generateSpecificCalculationDistractors(
      correctAnswer,
      mathOutput,
      params
    );

    // Combine and deduplicate
    const allDistractors = [...engineDistractors, ...specificDistractors];
    return this.deduplicateDistractors(allDistractors, correctAnswer.value).slice(0, 3);
  }

  /**
   * Generate format-specific distractors for calculation questions
   */
  private generateSpecificCalculationDistractors(
    correctAnswer: any,
    mathOutput: any,
    params: GenerationParams
  ): Distractor[] {
    const distractors: Distractor[] = [];

    switch (mathOutput.operation) {
      case 'ADDITION':
        // Wrong operation: subtract instead of add
        if (mathOutput.operands && mathOutput.operands.length === 2) {
          const wrongResult = mathOutput.operands[0] - mathOutput.operands[1];
          if (wrongResult !== correctAnswer.value && wrongResult > 0) {
            distractors.push({
              value: wrongResult,
              displayText: this.formatValue(wrongResult, correctAnswer.units),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Subtracted instead of adding'
            });
          }
        }
        break;

      case 'SUBTRACTION':
        // Wrong operation: add instead of subtract
        if (mathOutput.minuend && mathOutput.subtrahend) {
          const wrongResult = mathOutput.minuend + mathOutput.subtrahend;
          if (wrongResult !== correctAnswer.value) {
            distractors.push({
              value: wrongResult,
              displayText: this.formatValue(wrongResult, correctAnswer.units),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Added instead of subtracting'
            });
          }
        }
        break;

      case 'MULTIPLICATION':
        // Wrong operation: add instead of multiply
        if (mathOutput.multiplicand && mathOutput.multiplier) {
          const wrongResult = mathOutput.multiplicand + mathOutput.multiplier;
          if (wrongResult !== correctAnswer.value) {
            distractors.push({
              value: wrongResult,
              displayText: this.formatValue(wrongResult, correctAnswer.units),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Added instead of multiplying'
            });
          }
        }
        break;

      case 'DIVISION':
        // Wrong operation: subtract instead of divide
        if (mathOutput.dividend && mathOutput.divisor) {
          const wrongResult = mathOutput.dividend - mathOutput.divisor;
          if (wrongResult !== correctAnswer.value && wrongResult > 0) {
            distractors.push({
              value: wrongResult,
              displayText: this.formatValue(wrongResult, correctAnswer.units),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Subtracted instead of dividing'
            });
          }
        }
        break;
    }

    return distractors;
  }

  /**
   * Extract operands from math output for distractor generation
   */
  private extractOperands(mathOutput: any): number[] {
    if (mathOutput.operands) {
      return mathOutput.operands;
    }

    const operands: number[] = [];
    if (mathOutput.minuend !== undefined) operands.push(mathOutput.minuend);
    if (mathOutput.subtrahend !== undefined) operands.push(mathOutput.subtrahend);
    if (mathOutput.multiplicand !== undefined) operands.push(mathOutput.multiplicand);
    if (mathOutput.multiplier !== undefined) operands.push(mathOutput.multiplier);
    if (mathOutput.dividend !== undefined) operands.push(mathOutput.dividend);
    if (mathOutput.divisor !== undefined) operands.push(mathOutput.divisor);

    return operands;
  }

  /**
   * Remove duplicate distractors
   */
  private deduplicateDistractors(distractors: Distractor[], correctValue: number): Distractor[] {
    const seen = new Set([correctValue]);
    const unique: Distractor[] = [];

    for (const distractor of distractors) {
      if (!seen.has(distractor.value)) {
        seen.add(distractor.value);
        unique.push(distractor);
      }
    }

    return unique;
  }

  /**
   * Generate explanation for the calculation
   */
  private generateExplanation(mathOutput: any, params: QuestionParameters): string {
    const operation = mathOutput.operation.toLowerCase();

    switch (mathOutput.operation) {
      case 'ADDITION':
        if (mathOutput.operands) {
          const terms = mathOutput.operands.join(' + ');
          return `Add the numbers together: ${terms} = ${mathOutput.result}`;
        }
        break;
      case 'SUBTRACTION':
        return `Subtract: ${mathOutput.minuend} - ${mathOutput.subtrahend} = ${mathOutput.result}`;
      case 'MULTIPLICATION':
        return `Multiply: ${mathOutput.multiplicand} × ${mathOutput.multiplier} = ${mathOutput.result}`;
      case 'DIVISION':
        const remainder = mathOutput.remainder ? ` remainder ${mathOutput.remainder}` : '';
        return `Divide: ${mathOutput.dividend} ÷ ${mathOutput.divisor} = ${mathOutput.quotient}${remainder}`;
      case 'PERCENTAGE':
        return `Calculate ${mathOutput.percentage}% of ${mathOutput.base_value} = ${mathOutput.result}`;
      default:
        return `Perform the ${operation} calculation to get the answer.`;
    }

    return `Perform the ${operation} calculation to get the answer.`;
  }

  /**
   * Generate working steps for the calculation
   */
  private generateWorkingSteps(mathOutput: any): string[] {
    const steps: string[] = [];

    if (mathOutput.intermediate_steps && mathOutput.intermediate_steps.length > 0) {
      mathOutput.intermediate_steps.forEach((step: any, index: number) => {
        steps.push(`Step ${index + 1}: ${step}`);
      });
    } else {
      // Generate basic step based on operation
      switch (mathOutput.operation) {
        case 'ADDITION':
          if (mathOutput.operands && mathOutput.operands.length > 2) {
            let running = mathOutput.operands[0];
            steps.push(`Start with ${running}`);
            for (let i = 1; i < mathOutput.operands.length; i++) {
              running += mathOutput.operands[i];
              steps.push(`Add ${mathOutput.operands[i]}: ${running}`);
            }
          }
          break;
        case 'MULTIPLICATION':
          if (mathOutput.factors && mathOutput.factors.length > 0) {
            steps.push(`Break down: ${mathOutput.factors.join(' × ')}`);
          }
          break;
      }
    }

    return steps;
  }

  /**
   * Get solution strategy description
   */
  private getSolutionStrategy(mathModel: string): string {
    const strategies: Record<string, string> = {
      ADDITION: 'column_addition',
      SUBTRACTION: 'column_subtraction',
      MULTIPLICATION: 'long_multiplication',
      DIVISION: 'long_division',
      PERCENTAGE: 'percentage_calculation',
      FRACTION: 'fraction_arithmetic'
    };

    return strategies[mathModel] || 'standard_algorithm';
  }

  /**
   * Get decimal places from math output
   */
  private getDecimalPlaces(mathOutput: any): number {
    if (mathOutput.decimal_formatted && mathOutput.decimal_formatted.result) {
      const result = mathOutput.decimal_formatted.result;
      const decimalIndex = result.indexOf('.');
      return decimalIndex === -1 ? 0 : result.length - decimalIndex - 1;
    }
    return 0;
  }
}