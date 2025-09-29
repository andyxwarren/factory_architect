// Missing Value Controller - Generates missing number/value questions
// "What number makes this equation true?" or "Fill in the blank"

import {
  QuestionController,
  GenerationParams,
  ControllerDependencies
} from './base-question.controller';
import {
  QuestionDefinition,
  QuestionFormat,
  DistractorStrategy,
  ScenarioTheme
} from '@/lib/types/question-formats';

/**
 * Missing value specific parameters
 */
interface MissingValueParams {
  missingPosition: 'operand1' | 'operand2' | 'operand3' | 'result' | 'operator';
  equationType: 'simple' | 'balanced' | 'function' | 'word_equation';
  showUnits?: boolean;
  algebraicForm?: boolean;
  providedValues: number[];
  missingValue: number;
}

/**
 * Controller for generating missing value and algebraic thinking questions
 */
export class MissingValueController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate missing value question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    try {
      // 1. Generate base math content
      const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

      // 2. Select appropriate scenario
      const scenario = await this.selectScenario({
        theme: params.preferredTheme || ScenarioTheme.PUZZLE,
        mathModel: params.mathModel,
        difficulty: params.difficulty,
        culturalContext: params.culturalContext
      });

    // 3. Determine missing value parameters
    const missingValueParams = this.determineMissingValueParams(params.mathModel, mathOutput, params.difficulty);

    // 4. Generate question based on equation type
    let questionDef: QuestionDefinition;

    switch (missingValueParams.equationType) {
      case 'simple':
        questionDef = await this.generateSimpleEquation(mathOutput, scenario, missingValueParams, params);
        break;
      case 'balanced':
        questionDef = await this.generateBalancedEquation(mathOutput, scenario, missingValueParams, params);
        break;
      case 'function':
        questionDef = await this.generateFunctionEquation(mathOutput, scenario, missingValueParams, params);
        break;
      case 'word_equation':
        questionDef = await this.generateWordEquation(mathOutput, scenario, missingValueParams, params);
        break;
      default:
        questionDef = await this.generateSimpleEquation(mathOutput, scenario, missingValueParams, params);
    }

    return questionDef;
    } catch (error) {
      console.error('MissingValueController error:', error);
      // Fallback to simple question format
      return this.generateFallbackQuestion(params);
    }
  }

  /**
   * Generate fallback question if missing value fails
   */
  private async generateFallbackQuestion(params: GenerationParams): Promise<QuestionDefinition> {
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);
    const scenario = await this.selectScenario({
      theme: ScenarioTheme.PUZZLE,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    return this.createBaseQuestionDefinition(
      QuestionFormat.MISSING_VALUE,
      params.mathModel,
      params.difficulty,
      scenario
    );
  }

  /**
   * Generate simple missing value equation
   */
  private async generateSimpleEquation(
    mathOutput: any,
    scenario: any,
    missingValueParams: MissingValueParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.MISSING_VALUE,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Validate that we have a proper missing value
    if (missingValueParams.missingValue === undefined || missingValueParams.missingValue === null) {
      throw new Error(`Missing value not properly calculated for ${params.mathModel}: ${missingValueParams.missingValue}`);
    }

    // Create equation with missing value
    const equation = this.buildEquation(mathOutput, missingValueParams);
    const questionText = this.generateSimpleEquationText(scenario, equation, missingValueParams);

    // Generate distractors for missing value
    const distractors = await this.generateMissingValueDistractors(missingValueParams.missingValue, mathOutput, missingValueParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        missingValueParams,
        equation,
        missingValue: missingValueParams.missingValue
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: missingValueParams.missingValue,
          displayText: this.formatValue(missingValueParams.missingValue, ''),
          units: ''
        },
        distractors,
        workingSteps: this.generateSolutionSteps(equation, missingValueParams),
        explanation: this.generateExplanation(equation, missingValueParams),
        solutionStrategy: 'Work backwards from the equation to find the missing value'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate balanced equation (both sides)
   */
  private async generateBalancedEquation(
    mathOutput: any,
    scenario: any,
    missingValueParams: MissingValueParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.MISSING_VALUE,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Validate that we have a proper missing value
    if (missingValueParams.missingValue === undefined || missingValueParams.missingValue === null) {
      throw new Error(`Missing value not properly calculated for ${params.mathModel}: ${missingValueParams.missingValue}`);
    }

    // Create balanced equation like: 15 + ? = 8 + 12
    const leftSide = this.buildEquation(mathOutput, missingValueParams);
    const rightSide = this.buildBalancingEquation(mathOutput, missingValueParams.missingValue);

    const equation = {
      left: leftSide,
      right: rightSide,
      type: 'balanced'
    };

    const questionText = this.generateBalancedEquationText(scenario, equation, missingValueParams);

    const distractors = await this.generateMissingValueDistractors(missingValueParams.missingValue, mathOutput, missingValueParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        missingValueParams,
        equation,
        missingValue: missingValueParams.missingValue
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: missingValueParams.missingValue,
          displayText: this.formatValue(missingValueParams.missingValue, ''),
          units: ''
        },
        distractors,
        workingSteps: this.generateBalancedSolutionSteps(equation, missingValueParams),
        explanation: this.generateBalancedExplanation(equation, missingValueParams),
        solutionStrategy: 'Balance both sides of the equation to find the missing value'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate function-style equation
   */
  private async generateFunctionEquation(
    mathOutput: any,
    scenario: any,
    missingValueParams: MissingValueParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.MISSING_VALUE,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Validate that we have a proper missing value
    if (missingValueParams.missingValue === undefined || missingValueParams.missingValue === null) {
      throw new Error(`Missing value not properly calculated for ${params.mathModel}: ${missingValueParams.missingValue}`);
    }

    // Create function like: f(x) = 3x + 5, if f(?) = 20
    const functionRule = this.buildFunctionRule(mathOutput, missingValueParams);
    const equation = {
      rule: functionRule,
      input: missingValueParams.missingValue,
      output: mathOutput.result,
      type: 'function'
    };

    const questionText = this.generateFunctionEquationText(scenario, equation, missingValueParams);

    const distractors = await this.generateMissingValueDistractors(missingValueParams.missingValue, mathOutput, missingValueParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        missingValueParams,
        equation,
        missingValue: missingValueParams.missingValue
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: missingValueParams.missingValue,
          displayText: this.formatValue(missingValueParams.missingValue, ''),
          units: ''
        },
        distractors,
        workingSteps: this.generateFunctionSolutionSteps(equation, missingValueParams),
        explanation: this.generateFunctionExplanation(equation, missingValueParams),
        solutionStrategy: 'Apply the function rule to find the missing input value'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate word equation
   */
  private async generateWordEquation(
    mathOutput: any,
    scenario: any,
    missingValueParams: MissingValueParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.MISSING_VALUE,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Validate that we have a proper missing value
    if (missingValueParams.missingValue === undefined || missingValueParams.missingValue === null) {
      throw new Error(`Missing value not properly calculated for ${params.mathModel}: ${missingValueParams.missingValue}`);
    }

    // Create word-based equation
    const equation = this.buildWordEquation(mathOutput, missingValueParams, scenario);
    const questionText = this.generateWordEquationText(scenario, equation, missingValueParams);

    const distractors = await this.generateMissingValueDistractors(missingValueParams.missingValue, mathOutput, missingValueParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        missingValueParams,
        equation,
        missingValue: missingValueParams.missingValue
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: missingValueParams.missingValue,
          displayText: this.formatValue(missingValueParams.missingValue, ''),
          units: ''
        },
        distractors,
        workingSteps: this.generateWordSolutionSteps(equation, missingValueParams),
        explanation: this.generateWordExplanation(equation, missingValueParams),
        solutionStrategy: 'Translate the word problem into an equation and solve'
      }
    } as QuestionDefinition;
  }

  /**
   * Determine missing value parameters based on context
   */
  private determineMissingValueParams(mathModel: string, mathOutput: any, difficulty: any): MissingValueParams {
    // Extract operands based on operation type
    let operand1: number | undefined;
    let operand2: number | undefined;
    let result: number | undefined;

    switch (mathOutput.operation) {
      case 'ADDITION':
        if (mathOutput.operands && Array.isArray(mathOutput.operands)) {
          operand1 = mathOutput.operands[0];
          operand2 = mathOutput.operands[1];
        }
        result = mathOutput.result;
        break;
      case 'SUBTRACTION':
        operand1 = mathOutput.minuend;
        operand2 = mathOutput.subtrahend;
        result = mathOutput.result;
        break;
      case 'MULTIPLICATION':
        operand1 = mathOutput.multiplicand;
        operand2 = mathOutput.multiplier;
        result = mathOutput.result;
        break;
      case 'DIVISION':
        operand1 = mathOutput.dividend;
        operand2 = mathOutput.divisor;
        result = mathOutput.quotient;
        break;
      default:
        // Fallback to generic fields
        operand1 = mathOutput.operand1 || mathOutput.operand_1;
        operand2 = mathOutput.operand2 || mathOutput.operand_2;
        result = mathOutput.result;
    }

    // Validate that we have the necessary values
    if (operand1 === undefined || operand2 === undefined || result === undefined) {
      console.warn(`Missing operands for ${mathOutput.operation}: operand1=${operand1}, operand2=${operand2}, result=${result}`);
      // Use fallback values to prevent crashes
      operand1 = operand1 ?? 5;
      operand2 = operand2 ?? 3;
      result = result ?? 8;
    }

    // Determine missing position
    const positions = ['operand1', 'operand2', 'result'];
    const missingPosition = positions[Math.floor(Math.random() * positions.length)] as MissingValueParams['missingPosition'];

    // Determine equation type based on difficulty
    let equationType: MissingValueParams['equationType'];
    if (difficulty.year <= 2) {
      equationType = 'simple';
    } else if (difficulty.year <= 4) {
      equationType = Math.random() > 0.5 ? 'simple' : 'word_equation';
    } else {
      const types: MissingValueParams['equationType'][] = ['simple', 'balanced', 'word_equation'];
      if (difficulty.year >= 6) types.push('function');
      equationType = types[Math.floor(Math.random() * types.length)];
    }

    // Calculate missing value based on position
    let missingValue: number;
    let providedValues: number[] = [];

    switch (missingPosition) {
      case 'operand1':
        missingValue = operand1;
        providedValues = [operand2, result];
        break;
      case 'operand2':
        missingValue = operand2;
        providedValues = [operand1, result];
        break;
      case 'result':
        missingValue = result;
        providedValues = [operand1, operand2];
        break;
      default:
        missingValue = result;
        providedValues = [operand1, operand2];
    }

    return {
      missingPosition,
      equationType,
      showUnits: mathModel.includes('MONEY') || mathModel.includes('MEASUREMENT'),
      algebraicForm: difficulty.year >= 5 && equationType === 'function',
      providedValues,
      missingValue
    };
  }

  /**
   * Build equation structure with missing value
   */
  private buildEquation(mathOutput: any, missingValueParams: MissingValueParams): any {
    const placeholder = '?';

    switch (missingValueParams.missingPosition) {
      case 'operand1':
        return {
          left: placeholder,
          operator: this.getOperatorSymbol(mathOutput.operation),
          right: mathOutput.operand_2,
          result: mathOutput.result,
          missingValue: mathOutput.operand_1
        };

      case 'operand2':
        return {
          left: mathOutput.operand_1,
          operator: this.getOperatorSymbol(mathOutput.operation),
          right: placeholder,
          result: mathOutput.result,
          missingValue: mathOutput.operand_2
        };

      case 'result':
        return {
          left: mathOutput.operand_1,
          operator: this.getOperatorSymbol(mathOutput.operation),
          right: mathOutput.operand_2,
          result: placeholder,
          missingValue: mathOutput.result
        };

      default:
        return {
          left: mathOutput.operand_1,
          operator: this.getOperatorSymbol(mathOutput.operation),
          right: mathOutput.operand_2,
          result: placeholder,
          missingValue: mathOutput.result
        };
    }
  }

  /**
   * Build balancing equation for the right side
   */
  private buildBalancingEquation(mathOutput: any, targetValue: number): any {
    // Create an equation that equals the target value
    // For example, if target is 20, create "15 + 5" or "30 - 10"

    const operations = ['ADDITION', 'SUBTRACTION'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    switch (operation) {
      case 'ADDITION':
        const add1 = Math.floor(targetValue * 0.6) + Math.floor(Math.random() * 5);
        const add2 = targetValue - add1;
        return {
          left: add1,
          operator: '+',
          right: add2,
          result: targetValue
        };

      case 'SUBTRACTION':
        const sub2 = Math.floor(Math.random() * 10) + 1;
        const sub1 = targetValue + sub2;
        return {
          left: sub1,
          operator: '-',
          right: sub2,
          result: targetValue
        };

      default:
        return {
          left: targetValue,
          operator: '+',
          right: 0,
          result: targetValue
        };
    }
  }

  /**
   * Build function rule
   */
  private buildFunctionRule(mathOutput: any, missingValueParams: MissingValueParams): any {
    // Create simple function like f(x) = ax + b
    const coefficient = Math.floor(Math.random() * 5) + 1;
    const constant = Math.floor(Math.random() * 10);

    return {
      coefficient,
      constant,
      operation: 'linear',
      expression: `${coefficient}x + ${constant}`
    };
  }

  /**
   * Build word equation
   */
  private buildWordEquation(mathOutput: any, missingValueParams: MissingValueParams, scenario: any): any {
    const character = scenario.characters[0].name;

    return {
      context: `${character} has some items`,
      action: this.getWordAction(mathOutput.operation),
      values: missingValueParams.providedValues,
      missingValue: missingValueParams.missingValue,
      missingPosition: missingValueParams.missingPosition
    };
  }

  /**
   * Get operator symbol
   */
  private getOperatorSymbol(operation: string): string {
    switch (operation) {
      case 'ADDITION': return '+';
      case 'SUBTRACTION': return '-';
      case 'MULTIPLICATION': return '×';
      case 'DIVISION': return '÷';
      default: return '+';
    }
  }

  /**
   * Get word action for word equations
   */
  private getWordAction(operation: string): string {
    switch (operation) {
      case 'ADDITION': return 'gets more';
      case 'SUBTRACTION': return 'gives away';
      case 'MULTIPLICATION': return 'groups into sets of';
      case 'DIVISION': return 'shares equally among';
      default: return 'calculates with';
    }
  }

  // Question text generation methods
  private generateSimpleEquationText(scenario: any, equation: any, missingValueParams: MissingValueParams): string {
    const equationStr = `${equation.left} ${equation.operator} ${equation.right} = ${equation.result}`;
    return `${scenario.characters[0].name} is working on this equation: ${equationStr}. What number should replace the ? to make this equation true?`;
  }

  private generateBalancedEquationText(scenario: any, equation: any, missingValueParams: MissingValueParams): string {
    const leftStr = `${equation.left.left} ${equation.left.operator} ${equation.left.right}`;
    const rightStr = `${equation.right.left} ${equation.right.operator} ${equation.right.right}`;
    return `${scenario.characters[0].name} needs to balance this equation: ${leftStr} = ${rightStr}. What number should replace the ? to make both sides equal?`;
  }

  private generateFunctionEquationText(scenario: any, equation: any, missingValueParams: MissingValueParams): string {
    const rule = equation.rule.expression;
    return `${scenario.characters[0].name} has a function rule: f(x) = ${rule}. If f(?) = ${equation.output}, what is the input value?`;
  }

  private generateWordEquationText(scenario: any, equation: any, missingValueParams: MissingValueParams): string {
    const character = scenario.characters[0].name;
    const values = missingValueParams.providedValues;

    switch (missingValueParams.missingPosition) {
      case 'operand1':
        return `${character} ${equation.action} ${values[0]} items and ends up with ${values[1]} items total. How many items did ${character} start with?`;
      case 'operand2':
        return `${character} starts with ${values[0]} items and ${equation.action} some more. Now ${character} has ${values[1]} items total. How many items did ${character} ${equation.action}?`;
      case 'result':
        return `${character} starts with ${values[0]} items and ${equation.action} ${values[1]} more items. How many items does ${character} have now?`;
      default:
        return `${character} is working with ${values[0]} and ${values[1]} items. What is the missing number?`;
    }
  }

  // Solution step generation methods
  private generateSolutionSteps(equation: any, missingValueParams: MissingValueParams): string[] {
    const steps = [];

    switch (missingValueParams.missingPosition) {
      case 'operand1':
        steps.push(`Given: ? ${equation.operator} ${equation.right} = ${equation.result}`);
        steps.push(`To find the missing number, we need to work backwards`);
        steps.push(`${equation.result} ${this.getInverseOperator(equation.operator)} ${equation.right} = ${equation.missingValue}`);
        break;

      case 'operand2':
        steps.push(`Given: ${equation.left} ${equation.operator} ? = ${equation.result}`);
        steps.push(`To find the missing number, we need to work backwards`);
        steps.push(`${equation.result} ${this.getInverseOperator(equation.operator)} ${equation.left} = ${equation.missingValue}`);
        break;

      case 'result':
        steps.push(`Given: ${equation.left} ${equation.operator} ${equation.right} = ?`);
        steps.push(`Calculate: ${equation.left} ${equation.operator} ${equation.right}`);
        steps.push(`Answer: ${equation.missingValue}`);
        break;
    }

    return steps;
  }

  private generateBalancedSolutionSteps(equation: any, missingValueParams: MissingValueParams): string[] {
    const steps = [];
    const rightValue = equation.right.result;

    steps.push(`The right side equals: ${equation.right.left} ${equation.right.operator} ${equation.right.right} = ${rightValue}`);
    steps.push(`So the left side must also equal ${rightValue}`);
    steps.push(`Working backwards to find the missing value...`);

    return steps;
  }

  private generateFunctionSolutionSteps(equation: any, missingValueParams: MissingValueParams): string[] {
    const steps = [];
    const rule = equation.rule;

    steps.push(`Given: f(x) = ${rule.expression}`);
    steps.push(`We know: f(?) = ${equation.output}`);
    steps.push(`Substitute: ${rule.coefficient} × ? + ${rule.constant} = ${equation.output}`);
    steps.push(`Solve: ? = (${equation.output} - ${rule.constant}) ÷ ${rule.coefficient}`);
    steps.push(`Answer: ? = ${missingValueParams.missingValue}`);

    return steps;
  }

  private generateWordSolutionSteps(equation: any, missingValueParams: MissingValueParams): string[] {
    const steps = [];

    steps.push(`Identify what we know and what we need to find`);
    steps.push(`Set up the equation based on the word problem`);
    steps.push(`Work backwards to find the missing value`);
    steps.push(`Check: Does our answer make sense in the context?`);

    return steps;
  }

  /**
   * Get inverse operator for working backwards
   */
  private getInverseOperator(operator: string): string {
    switch (operator) {
      case '+': return '-';
      case '-': return '+';
      case '×': return '÷';
      case '÷': return '×';
      default: return '+';
    }
  }

  // Explanation generation methods
  private generateExplanation(equation: any, missingValueParams: MissingValueParams): string {
    return `To find the missing value, we work backwards using the inverse operation. The answer is ${missingValueParams.missingValue}.`;
  }

  private generateBalancedExplanation(equation: any, missingValueParams: MissingValueParams): string {
    return `Both sides of the equation must be equal. By calculating the right side and working backwards on the left side, we find the missing value is ${missingValueParams.missingValue}.`;
  }

  private generateFunctionExplanation(equation: any, missingValueParams: MissingValueParams): string {
    return `Using the function rule and working backwards from the output, we can solve for the input value: ${missingValueParams.missingValue}.`;
  }

  private generateWordExplanation(equation: any, missingValueParams: MissingValueParams): string {
    return `By understanding the word problem and setting up the equation, we can solve for the missing value: ${missingValueParams.missingValue}.`;
  }

  /**
   * Generate distractors for missing value questions
   */
  private async generateMissingValueDistractors(missingValue: number, mathOutput: any, missingValueParams: MissingValueParams): Promise<any[]> {
    const distractors = [];

    // Common errors for missing value problems:

    // 1. Using wrong operation
    const wrongOpValue = this.calculateWithWrongOperation(mathOutput, missingValueParams);
    distractors.push({
      value: wrongOpValue,
      strategy: DistractorStrategy.WRONG_OPERATION,
      rationale: 'Used wrong operation to solve'
    });

    // 2. Arithmetic error (off by small amount)
    const arithError = missingValue + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    distractors.push({
      value: arithError,
      strategy: DistractorStrategy.CALCULATION_ERROR,
      rationale: 'Arithmetic calculation error'
    });

    // 3. Using provided value as answer
    if (missingValueParams.providedValues.length > 0) {
      const confusedValue = missingValueParams.providedValues[0];
      if (confusedValue !== missingValue) {
        distractors.push({
          value: confusedValue,
          strategy: DistractorStrategy.VALUE_CONFUSION,
          rationale: 'Confused given value with missing value'
        });
      }
    }

    // 4. Order of operations error
    const orderError = this.calculateOrderError(mathOutput, missingValueParams);
    if (orderError !== missingValue) {
      distractors.push({
        value: orderError,
        strategy: DistractorStrategy.PROCEDURAL_ERROR,
        rationale: 'Order of operations error'
      });
    }

    return distractors.slice(0, 3);
  }

  /**
   * Calculate what answer would be with wrong operation
   */
  private calculateWithWrongOperation(mathOutput: any, missingValueParams: MissingValueParams): number {
    switch (missingValueParams.missingPosition) {
      case 'operand1':
        // If original was addition, wrong would be subtraction from result
        if (mathOutput.operation === 'ADDITION') {
          return mathOutput.result + mathOutput.operand_2; // Should subtract, but added
        } else if (mathOutput.operation === 'SUBTRACTION') {
          return mathOutput.result - mathOutput.operand_2; // Should add, but subtracted
        }
        break;

      case 'operand2':
        // Similar logic for second operand
        if (mathOutput.operation === 'ADDITION') {
          return mathOutput.result + mathOutput.operand_1;
        } else if (mathOutput.operation === 'SUBTRACTION') {
          return mathOutput.operand_1 - mathOutput.result;
        }
        break;

      case 'result':
        // Wrong operation on the given operands
        if (mathOutput.operation === 'ADDITION') {
          return mathOutput.operand_1 - mathOutput.operand_2;
        } else if (mathOutput.operation === 'SUBTRACTION') {
          return mathOutput.operand_1 + mathOutput.operand_2;
        }
        break;
    }

    return missingValueParams.missingValue + 5; // Fallback
  }

  /**
   * Calculate error from wrong order of operations
   */
  private calculateOrderError(mathOutput: any, missingValueParams: MissingValueParams): number {
    // Simple order error: doing operation in wrong direction
    switch (missingValueParams.missingPosition) {
      case 'operand1':
        if (mathOutput.operation === 'SUBTRACTION') {
          return mathOutput.operand_2 - mathOutput.result; // Backwards subtraction
        }
        break;
      case 'operand2':
        if (mathOutput.operation === 'DIVISION') {
          return mathOutput.result / mathOutput.operand_1; // Backwards division
        }
        break;
    }

    return missingValueParams.missingValue + 2; // Fallback
  }
}