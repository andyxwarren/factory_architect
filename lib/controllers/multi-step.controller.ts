// Multi-Step Controller - Generates multi-step problem solving questions
// "First calculate..., then..." or "Step 1:..., Step 2:..."

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
 * Multi-step specific parameters
 */
interface MultiStepParams {
  stepCount: number;
  operations: string[];
  intermediateValues: number[];
  stepDescriptions: string[];
  requiresSequencing: boolean;
  allowsParallelSteps: boolean;
}

/**
 * Controller for generating multi-step problem solving questions
 */
export class MultiStepController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate multi-step problem solving question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    try {
      // 1. Generate base math content for final result
      const finalMathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

      // 2. Select appropriate scenario that supports multi-step problems
      const scenario = await this.selectScenario({
        theme: params.preferredTheme || ScenarioTheme.REAL_WORLD,
        mathModel: params.mathModel,
        difficulty: params.difficulty,
        culturalContext: params.culturalContext
      });

      // 3. Design multi-step sequence based on difficulty and model
      const multiStepParams = this.designMultiStepSequence(params.mathModel, finalMathOutput, params.difficulty);

      // 4. Generate the multi-step question
      const questionDef = await this.generateMultiStepQuestion(finalMathOutput, scenario, multiStepParams, params);

      return questionDef;
    } catch (error) {
      console.error('MultiStepController error:', error);
      // Fallback to simple question format
      return this.generateFallbackQuestion(params);
    }
  }

  /**
   * Generate fallback question if multi-step fails
   */
  private async generateFallbackQuestion(params: GenerationParams): Promise<QuestionDefinition> {
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);
    const scenario = await this.selectScenario({
      theme: ScenarioTheme.REAL_WORLD,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    return this.createBaseQuestionDefinition(
      QuestionFormat.MULTI_STEP,
      params.mathModel,
      params.difficulty,
      scenario
    );
  }

  /**
   * Generate complete multi-step question
   */
  private async generateMultiStepQuestion(
    finalMathOutput: any,
    scenario: any,
    multiStepParams: MultiStepParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.MULTI_STEP,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Generate intermediate calculations for each step
    const stepCalculations = this.generateStepCalculations(finalMathOutput, multiStepParams);

    // Create the multi-step story problem
    const questionText = this.generateMultiStepQuestionText(scenario, stepCalculations, multiStepParams);

    // Final answer and working
    const finalAnswer = stepCalculations[stepCalculations.length - 1].result;

    // Generate distractors for multi-step problems
    const distractors = await this.generateMultiStepDistractors(stepCalculations, multiStepParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: finalMathOutput,
        multiStepParams,
        stepCalculations,
        finalAnswer
      },
      solution: {
        correctAnswer: finalAnswer,
        distractors,
        workingSteps: this.generateWorkingSteps(stepCalculations, multiStepParams),
        explanation: this.generateStepByStepExplanation(stepCalculations, multiStepParams)
      }
    } as QuestionDefinition;
  }

  /**
   * Design the sequence of steps for the multi-step problem
   */
  private designMultiStepSequence(mathModel: string, finalOutput: any, difficulty: any): MultiStepParams {
    // Determine step count based on difficulty
    const stepCount = this.determineStepCount(difficulty.year, difficulty.subLevel);

    // Design operations sequence
    const operations = this.determineOperationSequence(mathModel, stepCount, difficulty);

    return {
      stepCount,
      operations,
      intermediateValues: [], // Will be filled during calculation generation
      stepDescriptions: [], // Will be generated based on scenario
      requiresSequencing: stepCount > 2,
      allowsParallelSteps: stepCount <= 3 && difficulty.year >= 5
    };
  }

  /**
   * Determine appropriate number of steps
   */
  private determineStepCount(year: number, subLevel: number): number {
    if (year <= 2) return 2;
    if (year <= 4) return Math.random() > 0.5 ? 2 : 3;
    return Math.floor(Math.random() * 3) + 2; // 2-4 steps for higher years
  }

  /**
   * Determine sequence of operations
   */
  private determineOperationSequence(mathModel: string, stepCount: number, difficulty: any): string[] {
    const operations = [];

    // Start with the primary operation
    operations.push(mathModel);

    // Add complementary operations for additional steps
    for (let i = 1; i < stepCount; i++) {
      switch (mathModel) {
        case 'ADDITION':
          operations.push(Math.random() > 0.5 ? 'ADDITION' : 'SUBTRACTION');
          break;
        case 'SUBTRACTION':
          operations.push(Math.random() > 0.5 ? 'SUBTRACTION' : 'ADDITION');
          break;
        case 'MULTIPLICATION':
          operations.push(Math.random() > 0.6 ? 'MULTIPLICATION' : 'ADDITION');
          break;
        case 'DIVISION':
          operations.push(Math.random() > 0.6 ? 'DIVISION' : 'SUBTRACTION');
          break;
        case 'PERCENTAGE':
          operations.push('MULTIPLICATION'); // Often follows percentage calculations
          break;
        default:
          operations.push('ADDITION');
      }
    }

    return operations;
  }

  /**
   * Generate calculations for each step
   */
  private generateStepCalculations(finalOutput: any, multiStepParams: MultiStepParams): any[] {
    const calculations = [];

    // Work backwards from final result to create logical sequence
    const finalResult = finalOutput.result || finalOutput.answer || finalOutput.value;

    // For simplicity, create forward sequence
    // Step 1: Initial operation
    const step1 = this.generateInitialStep(multiStepParams.operations[0], finalResult);
    calculations.push(step1);

    // Subsequent steps
    for (let i = 1; i < multiStepParams.stepCount; i++) {
      const prevResult = calculations[i - 1].result;
      const nextStep = this.generateNextStep(multiStepParams.operations[i], prevResult, i, finalResult);
      calculations.push(nextStep);
    }

    return calculations;
  }

  /**
   * Generate initial step calculation
   */
  private generateInitialStep(operation: string, targetFinalResult: number): any {
    // Generate operands that will lead toward target
    const baseValue = Math.floor(targetFinalResult / 3); // Rough starting point

    switch (operation) {
      case 'ADDITION':
        const add1 = Math.floor(baseValue * 0.4) + Math.floor(Math.random() * 10);
        const add2 = Math.floor(baseValue * 0.6) + Math.floor(Math.random() * 10);
        return {
          operation: 'ADDITION',
          operand_1: add1,
          operand_2: add2,
          result: add1 + add2,
          description: `Add ${add1} and ${add2}`
        };

      case 'SUBTRACTION':
        const sub1 = Math.floor(baseValue * 1.5) + Math.floor(Math.random() * 20);
        const sub2 = Math.floor(baseValue * 0.5) + Math.floor(Math.random() * 10);
        return {
          operation: 'SUBTRACTION',
          operand_1: sub1,
          operand_2: sub2,
          result: sub1 - sub2,
          description: `Subtract ${sub2} from ${sub1}`
        };

      case 'MULTIPLICATION':
        const mult1 = Math.floor(Math.sqrt(baseValue)) + Math.floor(Math.random() * 5);
        const mult2 = Math.floor(baseValue / mult1) + Math.floor(Math.random() * 3);
        return {
          operation: 'MULTIPLICATION',
          operand_1: mult1,
          operand_2: mult2,
          result: mult1 * mult2,
          description: `Multiply ${mult1} by ${mult2}`
        };

      case 'DIVISION':
        const div2 = Math.floor(Math.random() * 8) + 2;
        const div1 = baseValue * div2;
        return {
          operation: 'DIVISION',
          operand_1: div1,
          operand_2: div2,
          result: div1 / div2,
          description: `Divide ${div1} by ${div2}`
        };

      default:
        return {
          operation: 'ADDITION',
          operand_1: 10,
          operand_2: 5,
          result: 15,
          description: 'Add 10 and 5'
        };
    }
  }

  /**
   * Generate next step in sequence
   */
  private generateNextStep(operation: string, previousResult: number, stepIndex: number, targetFinal: number): any {
    // Generate operation that uses previous result
    const modifier = Math.floor(Math.random() * 20) + 1;

    switch (operation) {
      case 'ADDITION':
        return {
          operation: 'ADDITION',
          operand_1: previousResult,
          operand_2: modifier,
          result: previousResult + modifier,
          description: `Add ${modifier} to the previous result`
        };

      case 'SUBTRACTION':
        return {
          operation: 'SUBTRACTION',
          operand_1: previousResult,
          operand_2: modifier,
          result: previousResult - modifier,
          description: `Subtract ${modifier} from the previous result`
        };

      case 'MULTIPLICATION':
        const smallMultiplier = Math.floor(Math.random() * 4) + 2;
        return {
          operation: 'MULTIPLICATION',
          operand_1: previousResult,
          operand_2: smallMultiplier,
          result: previousResult * smallMultiplier,
          description: `Multiply the previous result by ${smallMultiplier}`
        };

      case 'DIVISION':
        const divisor = Math.floor(Math.random() * 4) + 2;
        // Ensure clean division
        const dividend = Math.floor(previousResult / divisor) * divisor;
        return {
          operation: 'DIVISION',
          operand_1: dividend,
          operand_2: divisor,
          result: dividend / divisor,
          description: `Divide ${dividend} by ${divisor}`
        };

      default:
        return {
          operation: 'ADDITION',
          operand_1: previousResult,
          operand_2: 10,
          result: previousResult + 10,
          description: 'Add 10 to the previous result'
        };
    }
  }

  /**
   * Generate multi-step question text with scenario
   */
  private generateMultiStepQuestionText(scenario: any, stepCalculations: any[], multiStepParams: MultiStepParams): string {
    const character = scenario.characters[0].name;
    const setting = scenario.setting.location;

    // Create a story that incorporates all steps
    let storyParts = [];

    switch (scenario.theme) {
      case 'SHOPPING':
        storyParts = this.generateShoppingStory(character, stepCalculations);
        break;
      case 'CLASSROOM':
        storyParts = this.generateClassroomStory(character, stepCalculations);
        break;
      case 'SPORTS':
        storyParts = this.generateSportsStory(character, stepCalculations);
        break;
      default:
        storyParts = this.generateGenericStory(character, stepCalculations);
    }

    // Combine story parts with step structure
    const storyText = storyParts.join(' ');
    return `${storyText} What is the final result?`;
  }

  /**
   * Generate shopping-themed multi-step story
   */
  private generateShoppingStory(character: string, stepCalculations: any[]): string[] {
    const parts = [];

    parts.push(`${character} is shopping and needs to make several calculations.`);

    stepCalculations.forEach((calc, index) => {
      switch (calc.operation) {
        case 'ADDITION':
          if (index === 0) {
            parts.push(`First, ${character} adds the cost of ${calc.operand_1}p and ${calc.operand_2}p items.`);
          } else {
            parts.push(`Then ${character} adds ${calc.operand_2}p more to the total.`);
          }
          break;
        case 'SUBTRACTION':
          if (index === 0) {
            parts.push(`${character} starts with ${calc.operand_1}p and spends ${calc.operand_2}p.`);
          } else {
            parts.push(`Next, ${character} gets a ${calc.operand_2}p discount.`);
          }
          break;
        case 'MULTIPLICATION':
          parts.push(`${character} then buys ${calc.operand_2} items at ${calc.operand_1}p each.`);
          break;
        case 'DIVISION':
          parts.push(`Finally, ${character} splits the ${calc.operand_1}p total equally among ${calc.operand_2} people.`);
          break;
      }
    });

    return parts;
  }

  /**
   * Generate classroom-themed multi-step story
   */
  private generateClassroomStory(character: string, stepCalculations: any[]): string[] {
    const parts = [];

    parts.push(`${character} is solving a math problem step by step.`);

    stepCalculations.forEach((calc, index) => {
      switch (calc.operation) {
        case 'ADDITION':
          parts.push(`Step ${index + 1}: Add ${calc.operand_1} and ${calc.operand_2}.`);
          break;
        case 'SUBTRACTION':
          parts.push(`Step ${index + 1}: Subtract ${calc.operand_2} from ${calc.operand_1}.`);
          break;
        case 'MULTIPLICATION':
          parts.push(`Step ${index + 1}: Multiply ${calc.operand_1} by ${calc.operand_2}.`);
          break;
        case 'DIVISION':
          parts.push(`Step ${index + 1}: Divide ${calc.operand_1} by ${calc.operand_2}.`);
          break;
      }
    });

    return parts;
  }

  /**
   * Generate sports-themed multi-step story
   */
  private generateSportsStory(character: string, stepCalculations: any[]): string[] {
    const parts = [];

    parts.push(`${character} is calculating sports scores and statistics.`);

    stepCalculations.forEach((calc, index) => {
      switch (calc.operation) {
        case 'ADDITION':
          if (index === 0) {
            parts.push(`In round 1, ${character} scores ${calc.operand_1} points, then ${calc.operand_2} more points.`);
          } else {
            parts.push(`In the next round, ${character} adds ${calc.operand_2} bonus points.`);
          }
          break;
        case 'MULTIPLICATION':
          parts.push(`${character} then multiplies the score by ${calc.operand_2} for the multiplier bonus.`);
          break;
        case 'DIVISION':
          parts.push(`Finally, the total is divided by ${calc.operand_2} for the average.`);
          break;
      }
    });

    return parts;
  }

  /**
   * Generate generic multi-step story
   */
  private generateGenericStory(character: string, stepCalculations: any[]): string[] {
    const parts = [];

    parts.push(`${character} needs to solve this step by step:`);

    stepCalculations.forEach((calc, index) => {
      parts.push(`Step ${index + 1}: ${calc.description}.`);
    });

    return parts;
  }

  /**
   * Generate working steps for solution
   */
  private generateWorkingSteps(stepCalculations: any[], multiStepParams: MultiStepParams): string[] {
    const steps = [];

    stepCalculations.forEach((calc, index) => {
      switch (calc.operation) {
        case 'ADDITION':
          steps.push(`Step ${index + 1}: ${calc.operand_1} + ${calc.operand_2} = ${calc.result}`);
          break;
        case 'SUBTRACTION':
          steps.push(`Step ${index + 1}: ${calc.operand_1} - ${calc.operand_2} = ${calc.result}`);
          break;
        case 'MULTIPLICATION':
          steps.push(`Step ${index + 1}: ${calc.operand_1} × ${calc.operand_2} = ${calc.result}`);
          break;
        case 'DIVISION':
          steps.push(`Step ${index + 1}: ${calc.operand_1} ÷ ${calc.operand_2} = ${calc.result}`);
          break;
        default:
          steps.push(`Step ${index + 1}: Calculate = ${calc.result}`);
      }
    });

    const finalResult = stepCalculations[stepCalculations.length - 1].result;
    steps.push(`Final answer: ${finalResult}`);

    return steps;
  }

  /**
   * Generate step-by-step explanation
   */
  private generateStepByStepExplanation(stepCalculations: any[], multiStepParams: MultiStepParams): string {
    const explanations = stepCalculations.map((calc, index) =>
      `Step ${index + 1}: ${calc.description} = ${calc.result}`
    );

    const finalResult = stepCalculations[stepCalculations.length - 1].result;
    explanations.push(`Therefore, the final answer is ${finalResult}.`);

    return explanations.join('. ');
  }

  /**
   * Generate distractors for multi-step problems
   */
  private async generateMultiStepDistractors(stepCalculations: any[], multiStepParams: MultiStepParams): Promise<any[]> {
    const distractors = [];
    const finalResult = stepCalculations[stepCalculations.length - 1].result;

    // Common multi-step errors:

    // 1. Stopped after first step
    if (stepCalculations.length > 1) {
      distractors.push({
        value: stepCalculations[0].result,
        strategy: DistractorStrategy.INCOMPLETE_SOLUTION,
        rationale: 'Stopped after first step'
      });
    }

    // 2. Wrong operation in one step
    const wrongOpStep = Math.floor(Math.random() * stepCalculations.length);
    const wrongResult = this.calculateWithWrongOperation(stepCalculations, wrongOpStep);
    distractors.push({
      value: wrongResult,
      strategy: DistractorStrategy.WRONG_OPERATION,
      rationale: `Used wrong operation in step ${wrongOpStep + 1}`
    });

    // 3. Order of operations error
    const outOfOrderResult = this.calculateOutOfOrder(stepCalculations);
    distractors.push({
      value: outOfOrderResult,
      strategy: DistractorStrategy.PROCEDURAL_ERROR,
      rationale: 'Performed operations in wrong order'
    });

    // 4. Calculation error in final step
    const lastStepError = finalResult + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
    distractors.push({
      value: lastStepError,
      strategy: DistractorStrategy.CALCULATION_ERROR,
      rationale: 'Calculation error in final step'
    });

    return distractors.slice(0, 3);
  }

  /**
   * Calculate result with wrong operation in one step
   */
  private calculateWithWrongOperation(stepCalculations: any[], errorStepIndex: number): number {
    let result = stepCalculations[0].result;

    for (let i = 1; i < stepCalculations.length; i++) {
      const calc = stepCalculations[i];

      if (i === errorStepIndex) {
        // Use wrong operation
        switch (calc.operation) {
          case 'ADDITION':
            result = result - calc.operand_2; // Subtract instead
            break;
          case 'SUBTRACTION':
            result = result + calc.operand_2; // Add instead
            break;
          case 'MULTIPLICATION':
            result = result + calc.operand_2; // Add instead
            break;
          case 'DIVISION':
            result = result - calc.operand_2; // Subtract instead
            break;
        }
      } else {
        // Use correct operation
        result = calc.result;
      }
    }

    return result;
  }

  /**
   * Calculate with steps performed out of order
   */
  private calculateOutOfOrder(stepCalculations: any[]): number {
    // Simple out of order error: reverse last two operations
    if (stepCalculations.length < 2) return stepCalculations[0].result;

    // Start with first calculation
    let result = stepCalculations[0].result;

    // Skip to last operation first
    const lastCalc = stepCalculations[stepCalculations.length - 1];
    const secondLastCalc = stepCalculations[stepCalculations.length - 2];

    // Apply last operation to first result (out of order)
    switch (lastCalc.operation) {
      case 'ADDITION':
        result += lastCalc.operand_2;
        break;
      case 'SUBTRACTION':
        result -= lastCalc.operand_2;
        break;
      case 'MULTIPLICATION':
        result *= lastCalc.operand_2;
        break;
      case 'DIVISION':
        result /= lastCalc.operand_2;
        break;
    }

    return Math.round(result * 100) / 100; // Round to 2 decimal places
  }
}