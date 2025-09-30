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
import { getArticle } from '@/lib/utils/grammar';

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

    // Generate custom question content for specific operations
    const questionContent = this.generateCustomQuestionContent(params.mathModel, mathOutput, questionParams);

    return {
      ...baseDefinition,
      parameters: questionParams,
      solution,
      ...(questionContent && { questionContent })
    } as QuestionDefinition;
  }

  /**
   * Generate custom question content for specific operations that need special handling
   */
  private generateCustomQuestionContent(mathModel: string, mathOutput: any, params: QuestionParameters): any {
    switch (mathModel) {
      case 'FRACTION':
        return this.generateFractionQuestionContent(mathOutput, params);
      default:
        return null; // Use default template generation
    }
  }

  /**
   * Generate appropriate question content for FRACTION models
   */
  private generateFractionQuestionContent(mathOutput: any, params: QuestionParameters): any {
    const numerator = params.mathValues.numerator;
    const denominator = params.mathValues.denominator;
    const wholeValue = params.mathValues.whole_value;

    // Convert common fractions to words
    const fractionText = this.formatFractionAsWords(numerator, denominator);

    const questionText = `What is ${fractionText} of ${wholeValue}?`;

    return {
      fullText: questionText,
      components: undefined,
      templateData: {
        numerator,
        denominator,
        whole_value: wholeValue,
        fraction_text: fractionText,
        result: mathOutput.result
      }
    };
  }

  /**
   * Convert fraction to words (e.g., 1/2 -> "one half", 3/4 -> "three quarters")
   */
  private formatFractionAsWords(numerator: number, denominator: number): string {
    // Common fraction mappings
    if (numerator === 1 && denominator === 2) return "one half";
    if (numerator === 1 && denominator === 3) return "one third";
    if (numerator === 2 && denominator === 3) return "two thirds";
    if (numerator === 1 && denominator === 4) return "one quarter";
    if (numerator === 3 && denominator === 4) return "three quarters";
    if (numerator === 1 && denominator === 5) return "one fifth";
    if (numerator === 2 && denominator === 5) return "two fifths";
    if (numerator === 3 && denominator === 5) return "three fifths";
    if (numerator === 4 && denominator === 5) return "four fifths";

    // Fallback to numerical format
    return `${numerator}/${denominator}`;
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
          const realisticPrices: number[] = [];
          mathOutput.operands.forEach((operand: number, index: number) => {
            if (isMoney) {
              // Generate realistic prices based on scenario items instead of using raw math values
              const realisticPrice = this.generateRealisticPrice(scenario, index);
              realisticPrices.push(realisticPrice);
              narrativeValues[`price${index + 1}`] = MoneyContextGenerator.formatMoney(realisticPrice);
              // Update mathValues to match realistic prices for consistency
              mathValues[`operand_${index + 1}`] = realisticPrice;
            } else {
              narrativeValues[`price${index + 1}`] = String(operand);
            }
          });

          // Recalculate result using realistic prices for money scenarios
          if (isMoney && realisticPrices.length > 0) {
            const realisticResult = realisticPrices.reduce((sum, price) => sum + price, 0);
            mathValues.result = Math.round(realisticResult * 100) / 100; // Round to 2 decimal places
            // Update mathOutput for consistency (for distractor generation)
            mathOutput.result = mathValues.result;
            mathOutput.operands = realisticPrices;
          }
        } else {
          // Individual properties format
          const realisticPrices: number[] = [];
          for (let i = 1; i <= 10; i++) {
            const operandKey = `operand_${i}`;
            if (mathOutput[operandKey] !== undefined) {
              if (isMoney) {
                // Generate realistic prices based on scenario items instead of using raw math values
                const realisticPrice = this.generateRealisticPrice(scenario, i - 1);
                realisticPrices.push(realisticPrice);
                narrativeValues[`price${i}`] = MoneyContextGenerator.formatMoney(realisticPrice);
                // Update mathValues to match realistic prices for consistency
                mathValues[operandKey] = realisticPrice;
                // Update mathOutput operand for consistency (for distractor generation)
                mathOutput[operandKey] = realisticPrice;
              } else {
                narrativeValues[`price${i}`] = String(mathOutput[operandKey]);
              }
            }
          }

          // Recalculate result using realistic prices for money scenarios
          if (isMoney && realisticPrices.length > 0) {
            const realisticResult = realisticPrices.reduce((sum, price) => sum + price, 0);
            mathValues.result = Math.round(realisticResult * 100) / 100; // Round to 2 decimal places
            // Update mathOutput for consistency (for distractor generation)
            mathOutput.result = mathValues.result;
            mathOutput.operands = realisticPrices;
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
        // Add formatted placeholders for templates (payment and change scenarios)
        const isMoneySubtraction = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        let realisticPrice: number = mathOutput.subtrahend;
        let realisticPayment: number = mathOutput.minuend;

        if (mathOutput.subtrahend !== undefined) {
          if (isMoneySubtraction) {
            // Generate realistic item price instead of using raw math value
            realisticPrice = this.generateRealisticPrice(scenario, 0);
            narrativeValues['price'] = MoneyContextGenerator.formatMoney(realisticPrice);
            // Update mathValues to match realistic price for consistency
            mathValues.subtrahend = realisticPrice;
          } else {
            narrativeValues['price'] = String(mathOutput.subtrahend);
            mathValues.subtrahend = mathOutput.subtrahend;
          }
        }
        if (mathOutput.minuend !== undefined) {
          if (isMoneySubtraction) {
            // For payment, round to sensible amounts with year-based caps
            const price = parseFloat(narrativeValues['price']?.replace(/[£,]/g, '') || '5');

            // Apply year-based maximum payment logic (same as CHANGE_CALCULATION)
            const yearBasedMax = this.getYearBasedMaxPayment(realisticPrice);
            const maxReasonablePayment = Math.min(price * 5, yearBasedMax);

            // Round up to nearest £5, but cap at year-appropriate maximum
            const roundedPayment = Math.ceil(price / 5) * 5;
            realisticPayment = Math.min(roundedPayment, maxReasonablePayment);

            narrativeValues['payment'] = MoneyContextGenerator.formatMoney(realisticPayment);
            // Update mathValues to match realistic payment for consistency
            mathValues.minuend = realisticPayment;
          } else {
            narrativeValues['payment'] = String(mathOutput.minuend);
            mathValues.minuend = mathOutput.minuend;
          }
        }

        // Recalculate result using realistic prices for money scenarios
        if (isMoneySubtraction) {
          const realisticResult = realisticPayment - realisticPrice;
          mathValues.result = Math.round(realisticResult * 100) / 100; // Round to 2 decimal places
          // Update mathOutput.result as well for consistency
          mathOutput.result = mathValues.result;
        } else {
          mathValues.result = mathOutput.result;
        }
        break;

      case 'MULTIPLICATION':
        // Add formatted placeholders for templates (quantity and unit price scenarios)
        const isMoneyMultiplication = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        let realisticUnitPrice: number = mathOutput.multiplicand;
        let multiplicationQuantity: number = mathOutput.multiplier;

        if (mathOutput.multiplier !== undefined) {
          narrativeValues['quantity'] = String(mathOutput.multiplier);
          mathValues.multiplier = mathOutput.multiplier;
          multiplicationQuantity = mathOutput.multiplier;
        }
        if (mathOutput.multiplicand !== undefined) {
          if (isMoneyMultiplication) {
            // Generate realistic unit price instead of using raw math value
            realisticUnitPrice = this.generateRealisticPrice(scenario, 0);
            narrativeValues['price'] = MoneyContextGenerator.formatMoney(realisticUnitPrice);
            // Update mathValues to match realistic unit price for consistency
            mathValues.multiplicand = realisticUnitPrice;
          } else {
            narrativeValues['price'] = String(mathOutput.multiplicand);
            mathValues.multiplicand = mathOutput.multiplicand;
          }
        }

        // Recalculate result using realistic prices for money scenarios
        if (isMoneyMultiplication) {
          const realisticResult = realisticUnitPrice * multiplicationQuantity;
          mathValues.result = Math.round(realisticResult * 100) / 100; // Round to 2 decimal places
          // Update mathOutput.result as well for consistency
          mathOutput.result = mathValues.result;
        } else {
          mathValues.result = mathOutput.result;
        }
        break;

      case 'DIVISION':
        // Add formatted placeholders for templates (total and quantity scenarios)
        const isMoneyDivision = scenario.theme === 'SHOPPING' || mathOutput.operation.includes('MONEY');
        let realisticTotal: number = mathOutput.dividend;
        let divisionQuantity: number = mathOutput.divisor;

        if (mathOutput.divisor !== undefined) {
          narrativeValues['quantity'] = String(mathOutput.divisor);
          mathValues.divisor = mathOutput.divisor;
          divisionQuantity = mathOutput.divisor;
        }

        if (mathOutput.dividend !== undefined) {
          if (isMoneyDivision) {
            // For division, generate a reasonable total amount to divide
            // Should be larger than individual item prices but still realistic
            const basePrice = this.generateRealisticPrice(scenario, 0);
            realisticTotal = Math.round(basePrice * divisionQuantity * 100) / 100;
            narrativeValues['total'] = MoneyContextGenerator.formatMoney(realisticTotal);
            // Update mathValues to match realistic total for consistency
            mathValues.dividend = realisticTotal;
          } else {
            narrativeValues['total'] = String(mathOutput.dividend);
            mathValues.dividend = mathOutput.dividend;
          }
        }

        // Recalculate result using realistic prices for money scenarios
        if (isMoneyDivision && divisionQuantity > 0) {
          const realisticQuotient = realisticTotal / divisionQuantity;
          mathValues.quotient = Math.round(realisticQuotient * 100) / 100; // Round to 2 decimal places
          // Update mathOutput.quotient as well for consistency
          mathOutput.quotient = mathValues.quotient;
          mathValues.remainder = 0; // For money, usually no remainder
        } else {
          mathValues.quotient = mathOutput.quotient;
          if (mathOutput.remainder) {
            mathValues.remainder = mathOutput.remainder;
          }
        }
        break;

      case 'PERCENTAGE':
        mathValues.base_value = mathOutput.base_value;
        mathValues.percentage = mathOutput.percentage;
        mathValues.result = mathOutput.result;
        break;

      case 'FRACTION':
        mathValues.whole_value = mathOutput.whole_value;
        // Handle both nested format (mathOutput.fraction.numerator) and flattened format (mathOutput.numerator)
        if (mathOutput.fraction) {
          mathValues.numerator = mathOutput.fraction.numerator;
          mathValues.denominator = mathOutput.fraction.denominator;
        } else {
          mathValues.numerator = mathOutput.numerator;
          mathValues.denominator = mathOutput.denominator;
        }
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

      // Generate articles for items
      narrativeValues.article = getArticle(scenario.items[0]?.name || 'item');

      // Generate articles for up to 10 items (for multi-item scenarios)
      for (let i = 0; i < Math.min(scenario.items.length, 10); i++) {
        const itemName = scenario.items[i]?.name || 'item';
        narrativeValues[`article${i + 1}`] = getArticle(itemName);
        narrativeValues[`item${i + 1}`] = itemName;
      }
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
    // Check for operands array format first
    if (mathOutput.operands && Array.isArray(mathOutput.operands)) {
      return mathOutput.operands;
    }

    const operands: number[] = [];

    // Check for specific named operands (subtraction, multiplication, division)
    if (mathOutput.minuend !== undefined) operands.push(mathOutput.minuend);
    if (mathOutput.subtrahend !== undefined) operands.push(mathOutput.subtrahend);
    if (mathOutput.multiplicand !== undefined) operands.push(mathOutput.multiplicand);
    if (mathOutput.multiplier !== undefined) operands.push(mathOutput.multiplier);
    if (mathOutput.dividend !== undefined) operands.push(mathOutput.dividend);
    if (mathOutput.divisor !== undefined) operands.push(mathOutput.divisor);

    // Check for numbered operands (operand_1, operand_2, etc.) - used by ADDITION
    if (operands.length === 0) {
      for (let i = 1; i <= 10; i++) {
        const key = `operand_${i}`;
        if (mathOutput[key] !== undefined) {
          operands.push(mathOutput[key]);
        } else if (i > 2) {
          // Stop if we've checked past operand_2 and found no more
          break;
        }
      }
    }

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
   * Get year-appropriate maximum payment amount based on item cost
   * This ensures realistic payment amounts for different year levels
   * (Same logic as CHANGE_CALCULATION model)
   */
  private getYearBasedMaxPayment(itemCost: number): number {
    // Convert to pence for comparison
    const costInPence = itemCost * 100;

    if (costInPence <= 50) {
      // Year 1-2: Items up to 50p, max payment £2
      return 2; // £2
    } else if (costInPence <= 100) {
      // Year 2-3: Items up to £1, max payment £5
      return 5; // £5
    } else if (costInPence <= 500) {
      // Year 3-4: Items up to £5, max payment £10
      return 10; // £10
    } else if (costInPence <= 1000) {
      // Year 4-5: Items up to £10, max payment £20
      return 20; // £20
    } else {
      // Year 5-6: Items up to £20, max payment £50
      return 50; // £50
    }
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

  /**
   * Generate a realistic price for shopping scenarios using scenario item typicalValue ranges
   */
  private generateRealisticPrice(scenario: any, itemIndex: number): number {
    // Check if scenario has items with typicalValue ranges
    if (scenario?.items && Array.isArray(scenario.items) && scenario.items.length > itemIndex) {
      const item = scenario.items[itemIndex];
      if (item?.typicalValue) {
        let { min, max, typical } = item.typicalValue;
        if (typeof min === 'number' && typeof max === 'number') {
          // Apply reasonable caps based on scenario theme to prevent unrealistic prices
          if (scenario.theme === 'SCHOOL') {
            // School supplies should be capped at reasonable prices
            max = Math.min(max, 5.00); // Cap school supplies at £5 max
            min = Math.max(min, 0.50); // Minimum 50p for school supplies
          } else if (scenario.theme === 'SHOPPING') {
            // General shopping items - cap very high values
            if (item.category === 'FOOD_DRINK') {
              max = Math.min(max, 8.00); // Cap food/drink at £8
            } else if (item.category === 'SCHOOL_SUPPLIES') {
              max = Math.min(max, 4.00); // Cap school supplies at £4
            } else if (item.category === 'TOYS_GAMES') {
              max = Math.min(max, 12.00); // Cap toys/games at £12
            }
          }

          // Use generateRandomNumber but round to 2 decimal places for realistic prices
          const range = max - min;
          const randomValue = min + (Math.random() * range);
          return Math.round(randomValue * 100) / 100; // Round to 2 decimal places
        }
      }
    }

    // Fallback: if no scenario items or typicalValue, use reasonable default ranges
    const fallbackRanges = [
      { min: 0.20, max: 0.80 }, // First item: small food items
      { min: 0.15, max: 0.60 }, // Second item: small food items
      { min: 1.50, max: 6.00 }, // Third item: larger food items
      { min: 0.50, max: 3.00 }, // Fourth+ items: misc items
    ];

    const range = fallbackRanges[Math.min(itemIndex, fallbackRanges.length - 1)];
    const randomValue = range.min + (Math.random() * (range.max - range.min));
    return Math.round(randomValue * 100) / 100; // Round to 2 decimal places
  }
}