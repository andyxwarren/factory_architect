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

    // Defensive null checks
    if (!mathOutput) {
      throw new Error('mathOutput is required');
    }
    if (!scenario) {
      throw new Error('scenario is required');
    }
    if (!mathOutput.operation) {
      throw new Error('mathOutput.operation is required');
    }

    // Extract mathematical values based on operation type
    switch (mathOutput.operation) {
      case 'ADDITION':
        // Handle both operands array format and individual operand properties
        if (mathOutput.operands && Array.isArray(mathOutput.operands)) {
          // Array format: [5, 3, 7] -> operand_1: 5, operand_2: 3, operand_3: 7
          mathOutput.operands.forEach((operand: number, index: number) => {
            mathValues[`operand_${index + 1}`] = operand;
          });
        } else {
          // Individual properties format: operand_1: 5, operand_2: 3, operand_3: 7
          for (let i = 1; i <= 10; i++) { // Check up to 10 operands
            const operandKey = `operand_${i}`;
            if (mathOutput[operandKey] !== undefined) {
              mathValues[operandKey] = mathOutput[operandKey];
            }
          }
        }
        if (mathOutput.result !== undefined) {
          mathValues.result = mathOutput.result;
        }

        // Add formatted placeholders for templates
        const isMoney = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        if (mathOutput.operands && Array.isArray(mathOutput.operands)) {
          // Array format
          mathOutput.operands.forEach((operand: number, index: number) => {
            if (isMoney) {
              narrativeValues[`price${index + 1}`] = MoneyContextGenerator.formatMoney(operand);
            } else {
              narrativeValues[`price${index + 1}`] = String(operand);
            }
          });
        } else {
          // Individual properties format
          for (let i = 1; i <= 10; i++) {
            const operandKey = `operand_${i}`;
            if (mathOutput[operandKey] !== undefined) {
              if (isMoney) {
                narrativeValues[`price${i}`] = MoneyContextGenerator.formatMoney(mathOutput[operandKey]);
              } else {
                narrativeValues[`price${i}`] = String(mathOutput[operandKey]);
              }
            }
          }
        }

        // Add operand count for template selection
        if (mathOutput.operands && Array.isArray(mathOutput.operands)) {
          narrativeValues.operandCount = mathOutput.operands.length;
        } else {
          // Count individual operand properties
          let operandCount = 0;
          for (let i = 1; i <= 10; i++) {
            if (mathOutput[`operand_${i}`] !== undefined) {
              operandCount = i;
            }
          }
          narrativeValues.operandCount = operandCount;
        }
        break;

      case 'SUBTRACTION':
        mathValues.minuend = mathOutput.minuend;
        mathValues.subtrahend = mathOutput.subtrahend;
        mathValues.result = mathOutput.result;

        // Add formatted placeholders for templates (payment and change scenarios)
        const isMoneySubtraction = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        if (mathOutput.subtrahend !== undefined) {
          narrativeValues['price'] = isMoneySubtraction ? MoneyContextGenerator.formatMoney(mathOutput.subtrahend) : String(mathOutput.subtrahend);
        }
        if (mathOutput.minuend !== undefined) {
          narrativeValues['payment'] = isMoneySubtraction ? MoneyContextGenerator.formatMoney(mathOutput.minuend) : String(mathOutput.minuend);
        }
        break;

      case 'MULTIPLICATION':
        mathValues.multiplicand = mathOutput.multiplicand;
        mathValues.multiplier = mathOutput.multiplier;
        mathValues.result = mathOutput.result;

        // Add formatted placeholders for templates (quantity and unit price scenarios)
        const isMoneyMultiplication = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        if (mathOutput.multiplier !== undefined) {
          narrativeValues['quantity'] = String(mathOutput.multiplier);
        }
        if (mathOutput.multiplicand !== undefined) {
          narrativeValues['price'] = isMoneyMultiplication ? MoneyContextGenerator.formatMoney(mathOutput.multiplicand) : String(mathOutput.multiplicand);
        }
        break;

      case 'DIVISION':
        mathValues.dividend = mathOutput.dividend;
        mathValues.divisor = mathOutput.divisor;
        mathValues.quotient = mathOutput.quotient;
        if (mathOutput.remainder) {
          mathValues.remainder = mathOutput.remainder;
        }

        // Add formatted placeholders for templates (total and quantity scenarios)
        const isMoneyDivision = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        if (mathOutput.dividend !== undefined) {
          narrativeValues['total'] = isMoneyDivision ? MoneyContextGenerator.formatMoney(mathOutput.dividend) : String(mathOutput.dividend);
        }
        if (mathOutput.divisor !== undefined) {
          narrativeValues['quantity'] = String(mathOutput.divisor);
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

      case 'COUNTING':
        mathValues.start_value = mathOutput.start_value;
        mathValues.count = mathOutput.count;
        mathValues.step_size = mathOutput.step_size;
        mathValues.result = mathOutput.result;
        if (mathOutput.sequence) {
          mathValues.sequence_length = mathOutput.sequence.length;
        }
        break;

      case 'TIME_RATE':
        mathValues.time = mathOutput.time;
        mathValues.rate = mathOutput.rate;
        mathValues.distance = mathOutput.distance || mathOutput.result;
        mathValues.result = mathOutput.result;
        break;

      case 'CONVERSION':
        mathValues.original_value = mathOutput.original_value;
        mathValues.converted_value = mathOutput.converted_value || mathOutput.result;
        mathValues.conversion_factor = mathOutput.conversion_factor;
        mathValues.result = mathOutput.result;
        units.original = mathOutput.original_unit;
        units.converted = mathOutput.converted_unit;
        break;

      case 'COMPARISON':
        if (mathOutput.values && Array.isArray(mathOutput.values)) {
          mathOutput.values.forEach((value: number, index: number) => {
            mathValues[`value_${index + 1}`] = value;
          });
        }
        mathValues.comparison_type = mathOutput.comparison_type;
        mathValues.result = mathOutput.result;
        break;

      case 'LINEAR_EQUATION':
        mathValues.slope = mathOutput.slope || mathOutput.m;
        mathValues.intercept = mathOutput.intercept || mathOutput.c;
        mathValues.input = mathOutput.input || mathOutput.x;
        mathValues.output = mathOutput.output || mathOutput.y;
        mathValues.result = mathOutput.result;
        break;

      case 'UNIT_RATE':
        mathValues.quantity = mathOutput.quantity;
        mathValues.total_cost = mathOutput.total_cost;
        mathValues.unit_price = mathOutput.unit_price || mathOutput.result;
        mathValues.result = mathOutput.result;
        break;

      case 'COIN_RECOGNITION':
        if (mathOutput.coins && Array.isArray(mathOutput.coins)) {
          mathOutput.coins.forEach((coin: any, index: number) => {
            mathValues[`coin_${index + 1}_value`] = coin.value;
            mathValues[`coin_${index + 1}_count`] = coin.count;
          });
        }
        mathValues.total_value = mathOutput.total_value || mathOutput.result;
        mathValues.result = mathOutput.result;
        units.result = '£';
        break;

      case 'CHANGE_CALCULATION':
        mathValues.purchase_amount = mathOutput.purchase_amount;
        mathValues.payment = mathOutput.payment;
        mathValues.change = mathOutput.change || mathOutput.result;
        mathValues.result = mathOutput.result;
        units.result = '£';
        break;

      case 'MONEY_COMBINATIONS':
        mathValues.target_amount = mathOutput.target_amount;
        if (mathOutput.combinations) {
          mathValues.combination_count = mathOutput.combinations.length;
        }
        if (mathOutput.coins_used && Array.isArray(mathOutput.coins_used)) {
          mathOutput.coins_used.forEach((coin: any, index: number) => {
            mathValues[`coin_${index + 1}`] = coin;
          });
        }
        mathValues.result = mathOutput.result;
        units.result = '£';
        break;

      case 'MONEY_SCALING':
        mathValues.base_amount = mathOutput.base_amount;
        mathValues.scale_factor = mathOutput.scale_factor || mathOutput.multiplier;
        mathValues.result = mathOutput.result;
        units.result = '£';
        break;

      case 'SHAPE_RECOGNITION':
        mathValues.shape_count = mathOutput.shape_count;
        mathValues.sides = mathOutput.sides;
        if (mathOutput.shape_name) {
          narrativeValues.shape_name = mathOutput.shape_name;
        }
        mathValues.result = mathOutput.result;
        break;

      case 'SHAPE_PROPERTIES':
        mathValues.sides = mathOutput.sides;
        mathValues.vertices = mathOutput.vertices;
        mathValues.angles = mathOutput.angles;
        if (mathOutput.shape_name) {
          narrativeValues.shape_name = mathOutput.shape_name;
        }
        mathValues.result = mathOutput.result;
        break;

      case 'ANGLE_MEASUREMENT':
        mathValues.angle_degrees = mathOutput.angle_degrees || mathOutput.angle;
        mathValues.angle_type = mathOutput.angle_type;
        if (mathOutput.complementary) {
          mathValues.complementary = mathOutput.complementary;
        }
        if (mathOutput.supplementary) {
          mathValues.supplementary = mathOutput.supplementary;
        }
        mathValues.result = mathOutput.result;
        units.result = '°';
        break;

      case 'POSITION_DIRECTION':
        mathValues.x_coordinate = mathOutput.x_coordinate || mathOutput.x;
        mathValues.y_coordinate = mathOutput.y_coordinate || mathOutput.y;
        if (mathOutput.direction) {
          narrativeValues.direction = mathOutput.direction;
        }
        if (mathOutput.distance) {
          mathValues.distance = mathOutput.distance;
        }
        mathValues.result = mathOutput.result;
        break;

      case 'AREA_PERIMETER':
        mathValues.length = mathOutput.length;
        mathValues.width = mathOutput.width;
        mathValues.area = mathOutput.area;
        mathValues.perimeter = mathOutput.perimeter;
        mathValues.result = mathOutput.result;
        if (mathOutput.calculation_type === 'area') {
          units.result = 'cm²';
        } else if (mathOutput.calculation_type === 'perimeter') {
          units.result = 'cm';
        }
        break;

      case 'MULTI_STEP':
        if (mathOutput.steps && Array.isArray(mathOutput.steps)) {
          mathOutput.steps.forEach((step: any, index: number) => {
            mathValues[`step_${index + 1}_result`] = step.result;
          });
        }
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