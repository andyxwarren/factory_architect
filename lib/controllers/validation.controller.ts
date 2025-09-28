// Validation Controller - Generates validation and verification questions
// "Is this correct?" or "Check the calculation" or "True or False?"

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
 * Validation-specific parameters
 */
interface ValidationParams {
  validationType: 'true_false' | 'check_work' | 'spot_error' | 'verify_answer';
  errorType?: 'computational' | 'conceptual' | 'procedural' | 'none';
  showWorking?: boolean;
  includeExplanation?: boolean;
}

/**
 * Controller for generating validation and verification questions
 */
export class ValidationController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate validation-focused question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    // 1. Generate base math content
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

    // 2. Select appropriate scenario
    const scenario = await this.selectScenario({
      theme: params.preferredTheme || ScenarioTheme.CLASSROOM,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    // 3. Determine validation type and potential errors
    const validationParams = this.determineValidationParams(params.mathModel, mathOutput, params.difficulty);

    // 4. Generate validation question variants
    let questionDef: QuestionDefinition;

    switch (validationParams.validationType) {
      case 'true_false':
        questionDef = await this.generateTrueFalseQuestion(mathOutput, scenario, validationParams, params);
        break;
      case 'check_work':
        questionDef = await this.generateCheckWorkQuestion(mathOutput, scenario, validationParams, params);
        break;
      case 'spot_error':
        questionDef = await this.generateSpotErrorQuestion(mathOutput, scenario, validationParams, params);
        break;
      case 'verify_answer':
        questionDef = await this.generateVerifyAnswerQuestion(mathOutput, scenario, validationParams, params);
        break;
      default:
        questionDef = await this.generateTrueFalseQuestion(mathOutput, scenario, validationParams, params);
    }

    return questionDef;
  }

  /**
   * Generate true/false validation question
   */
  private async generateTrueFalseQuestion(
    mathOutput: any,
    scenario: any,
    validationParams: ValidationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.VALIDATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const correctAnswer = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Randomly decide if presenting correct or incorrect statement
    const isCorrectStatement = Math.random() > 0.5;
    let presentedAnswer: number;
    let statementIsTrue: boolean;

    if (isCorrectStatement) {
      presentedAnswer = correctAnswer;
      statementIsTrue = true;
    } else {
      // Generate a plausible incorrect answer
      presentedAnswer = this.generatePlausibleIncorrectAnswer(mathOutput, validationParams.errorType || 'computational');
      statementIsTrue = false;
    }

    const questionText = this.generateTrueFalseQuestionText(scenario, mathOutput, presentedAnswer);

    // Distractors are "True" or "False"
    const distractors = await this.generateTrueFalseDistractors(statementIsTrue);

    // Create proper QuestionParameters structure
    const parameters = {
      mathValues: {
        ...mathOutput,
        presentedAnswer,
        correctAnswer,
        isTrue: statementIsTrue
      },
      narrativeValues: {
        character: scenario.characters?.[0]?.name || 'Student',
        operation: this.describeOperation(mathOutput),
        presentedAnswer: String(presentedAnswer)
      },
      units: {
        input: '£',
        result: '£'
      },
      formatting: {
        currencyFormat: 'symbol' as const,
        decimalPlaces: 2,
        useGroupingSeparators: correctAnswer > 1000,
        unitPosition: 'before' as const
      }
    };

    return {
      ...baseDefinition,
      parameters,
      questionContent: {
        fullText: questionText,
        components: undefined,
        templateData: {
          character: scenario.characters?.[0]?.name || 'Student',
          operation: this.describeOperation(mathOutput),
          presentedAnswer: String(presentedAnswer),
          correctAnswer: String(correctAnswer)
        }
      },
      solution: {
        correctAnswer: {
          value: correctAnswer,  // Return the actual numeric answer
          displayText: this.formatValue(correctAnswer, '£'),
          units: '£'
        },
        distractors,
        workingSteps: this.generateTrueFalseSteps(mathOutput, presentedAnswer, correctAnswer, statementIsTrue),
        explanation: statementIsTrue
          ? `The calculation is correct: ${presentedAnswer}`
          : `The calculation is incorrect. The correct answer is ${correctAnswer}, not ${presentedAnswer}`,
        solutionStrategy: 'Verify the calculation and determine if the statement is true or false'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate check work validation question
   */
  private async generateCheckWorkQuestion(
    mathOutput: any,
    scenario: any,
    validationParams: ValidationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.VALIDATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const correctAnswer = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Generate working steps (some may contain errors)
    const workingSteps = this.generateWorkingSteps(mathOutput, validationParams.errorType);
    const hasError = validationParams.errorType !== 'none';

    const questionText = this.generateCheckWorkQuestionText(scenario, mathOutput, workingSteps);

    const distractors = await this.generateCheckWorkDistractors(hasError);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        validationParams,
        workingSteps,
        hasError,
        correctAnswer
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: correctAnswer,  // Return the actual numeric answer
          displayText: this.formatValue(correctAnswer, '£'),
          units: '£'
        },
        distractors,
        workingSteps: this.generateCheckWorkExplanation(workingSteps, hasError, correctAnswer),
        explanation: hasError
          ? `The working contains an error. The correct answer should be ${correctAnswer}`
          : `The working is correct and gives the right answer: ${correctAnswer}`,
        solutionStrategy: 'Check each step of the working to verify correctness'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate spot error validation question
   */
  private async generateSpotErrorQuestion(
    mathOutput: any,
    scenario: any,
    validationParams: ValidationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.VALIDATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const correctAnswer = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Generate working with deliberate error
    const { workingSteps, errorStep } = this.generateWorkingWithError(mathOutput, validationParams.errorType || 'procedural');

    const questionText = this.generateSpotErrorQuestionText(scenario, mathOutput, workingSteps);

    const distractors = await this.generateSpotErrorDistractors(workingSteps.length, errorStep);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        validationParams,
        workingSteps,
        errorStep,
        correctAnswer
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: `Step ${errorStep + 1}`,
          displayText: `Step ${errorStep + 1}`,
          units: ''
        },
        distractors,
        workingSteps: [`The error is in step ${errorStep + 1}`, `Correct answer: ${correctAnswer}`],
        explanation: `The error occurs in step ${errorStep + 1}. The correct calculation gives ${correctAnswer}`,
        solutionStrategy: 'Identify which step contains the error'
      }
    } as QuestionDefinition;
  }

  /**
   * Generate verify answer validation question
   */
  private async generateVerifyAnswerQuestion(
    mathOutput: any,
    scenario: any,
    validationParams: ValidationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.VALIDATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const correctAnswer = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Present multiple possible answers, student must choose correct one
    const answerOptions = this.generateAnswerOptions(correctAnswer, mathOutput);

    const questionText = this.generateVerifyAnswerQuestionText(scenario, mathOutput, answerOptions);

    const distractors = await this.generateVerifyAnswerDistractors(answerOptions, correctAnswer);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        validationParams,
        answerOptions,
        correctAnswer
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: correctAnswer,
          displayText: this.formatValue(correctAnswer, '£'),
          units: '£'
        },
        distractors,
        workingSteps: this.generateVerificationSteps(mathOutput, correctAnswer),
        explanation: `The correct answer is ${correctAnswer}`,
        solutionStrategy: 'Verify which of the presented answers is correct'
      }
    } as QuestionDefinition;
  }

  /**
   * Determine validation parameters based on context
   */
  private determineValidationParams(mathModel: string, mathOutput: any, difficulty: any): ValidationParams {
    // Choose validation type based on difficulty and model
    if (difficulty.year <= 2) {
      return {
        validationType: 'true_false',
        errorType: 'computational',
        showWorking: false
      };
    }

    if (difficulty.year <= 4) {
      return {
        validationType: Math.random() > 0.5 ? 'check_work' : 'verify_answer',
        errorType: Math.random() > 0.5 ? 'procedural' : 'computational',
        showWorking: true
      };
    }

    // Higher years get more complex validation tasks
    const types: ValidationParams['validationType'][] = ['check_work', 'spot_error', 'verify_answer'];
    const errors: ValidationParams['errorType'][] = ['computational', 'conceptual', 'procedural'];

    return {
      validationType: types[Math.floor(Math.random() * types.length)],
      errorType: errors[Math.floor(Math.random() * errors.length)],
      showWorking: true,
      includeExplanation: true
    };
  }

  /**
   * Generate plausible incorrect answer
   */
  private generatePlausibleIncorrectAnswer(mathOutput: any, errorType: string): number {
    const correct = mathOutput.result || mathOutput.answer || mathOutput.value;

    switch (errorType) {
      case 'computational':
        // Off by one calculation errors
        return correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);

      case 'procedural':
        // Wrong operation errors
        if (mathOutput.operation === 'ADDITION') {
          return mathOutput.operand_1 - mathOutput.operand_2; // Subtracted instead
        }
        if (mathOutput.operation === 'SUBTRACTION') {
          return mathOutput.operand_1 + mathOutput.operand_2; // Added instead
        }
        if (mathOutput.operation === 'MULTIPLICATION') {
          return mathOutput.operand_1 + mathOutput.operand_2; // Added instead
        }
        break;

      case 'conceptual':
        // Magnitude errors
        return correct * (Math.random() > 0.5 ? 10 : 0.1);

      default:
        return correct + Math.floor(Math.random() * 10) - 5;
    }

    return correct + Math.floor(Math.random() * 10) - 5;
  }

  /**
   * Generate working steps with potential errors
   */
  private generateWorkingSteps(mathOutput: any, errorType?: string): string[] {
    const steps = [];

    switch (mathOutput.operation) {
      case 'ADDITION':
        steps.push(`${mathOutput.operand_1} + ${mathOutput.operand_2}${mathOutput.operand_3 ? ' + ' + mathOutput.operand_3 : ''}`);
        if (errorType && errorType !== 'none') {
          const wrongAddResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`= ${wrongAddResult}`);
        } else {
          steps.push(`= ${mathOutput.result}`);
        }
        break;

      case 'SUBTRACTION':
        steps.push(`${mathOutput.operand_1} - ${mathOutput.operand_2}`);
        if (errorType && errorType !== 'none') {
          const wrongSubResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`= ${wrongSubResult}`);
        } else {
          steps.push(`= ${mathOutput.result}`);
        }
        break;

      case 'MULTIPLICATION':
        steps.push(`${mathOutput.operand_1} × ${mathOutput.operand_2}`);
        if (errorType && errorType !== 'none') {
          const wrongMulResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`= ${wrongMulResult}`);
        } else {
          steps.push(`= ${mathOutput.result}`);
        }
        break;

      case 'DIVISION':
        steps.push(`${mathOutput.operand_1} ÷ ${mathOutput.operand_2}`);
        if (errorType && errorType !== 'none') {
          const wrongDivResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`= ${wrongDivResult}`);
        } else {
          steps.push(`= ${mathOutput.result}`);
        }
        break;

      default:
        steps.push(`Calculation: ${mathOutput.result || 'unknown'}`);
    }

    return steps;
  }

  /**
   * Generate working steps with deliberate error in specific step
   */
  private generateWorkingWithError(mathOutput: any, errorType: string): { workingSteps: string[], errorStep: number } {
    const steps = [];
    let errorStep = -1;

    switch (mathOutput.operation) {
      case 'ADDITION':
        steps.push(`Step 1: ${mathOutput.operand_1} + ${mathOutput.operand_2}${mathOutput.operand_3 ? ' + ' + mathOutput.operand_3 : ''}`);

        // Introduce error in calculation step
        errorStep = 1;
        const wrongCalcResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
        steps.push(`Step 2: = ${wrongCalcResult}`);
        break;

      case 'MULTIPLICATION':
        steps.push(`Step 1: ${mathOutput.operand_1} × ${mathOutput.operand_2}`);

        // Could add intermediate step with error
        if (mathOutput.operand_1 > 10 && mathOutput.operand_2 > 10) {
          steps.push(`Step 2: Break down: ${mathOutput.operand_1} × ${mathOutput.operand_2}`);
          errorStep = 2;
          const wrongBreakdownResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`Step 3: = ${wrongBreakdownResult}`);
        } else {
          errorStep = 1;
          const wrongMultResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
          steps.push(`Step 2: = ${wrongMultResult}`);
        }
        break;

      default:
        steps.push(`Step 1: Calculate ${mathOutput.operation}`);
        errorStep = 1;
        const wrongDefaultResult = this.generatePlausibleIncorrectAnswer(mathOutput, errorType);
        steps.push(`Step 2: = ${wrongDefaultResult}`);
    }

    return { workingSteps: steps, errorStep };
  }

  /**
   * Generate multiple answer options for verification
   */
  private generateAnswerOptions(correctAnswer: number, mathOutput: any): number[] {
    const options = [correctAnswer];

    // Add plausible distractors
    options.push(this.generatePlausibleIncorrectAnswer(mathOutput, 'computational'));
    options.push(this.generatePlausibleIncorrectAnswer(mathOutput, 'procedural'));
    options.push(this.generatePlausibleIncorrectAnswer(mathOutput, 'conceptual'));

    // Shuffle options
    return options.sort(() => Math.random() - 0.5).slice(0, 4);
  }

  // Question text generation methods
  private generateTrueFalseQuestionText(scenario: any, mathOutput: any, presentedAnswer: number): string {
    const operation = this.describeOperation(mathOutput);
    return `${scenario.characters[0].name} says "${operation} equals ${presentedAnswer}." Is this correct? (True/False)`;
  }

  private generateCheckWorkQuestionText(scenario: any, mathOutput: any, workingSteps: string[]): string {
    const workingText = workingSteps.join('\\n');
    return `${scenario.characters[0].name} showed their working:\\n${workingText}\\n\\nIs this working correct?`;
  }

  private generateSpotErrorQuestionText(scenario: any, mathOutput: any, workingSteps: string[]): string {
    const workingText = workingSteps.join('\\n');
    return `${scenario.characters[0].name} made an error in their calculation:\\n${workingText}\\n\\nWhich step contains the error?`;
  }

  private generateVerifyAnswerQuestionText(scenario: any, mathOutput: any, answerOptions: number[]): string {
    const operation = this.describeOperation(mathOutput);
    const optionsText = answerOptions.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('  ');
    return `${scenario.characters[0].name} needs to solve: ${operation}\\n\\nWhich answer is correct?\\n${optionsText}`;
  }

  private describeOperation(mathOutput: any): string {
    switch (mathOutput.operation) {
      case 'ADDITION':
        return `${mathOutput.operand_1} + ${mathOutput.operand_2}${mathOutput.operand_3 ? ' + ' + mathOutput.operand_3 : ''}`;
      case 'SUBTRACTION':
        return `${mathOutput.operand_1} - ${mathOutput.operand_2}`;
      case 'MULTIPLICATION':
        return `${mathOutput.operand_1} × ${mathOutput.operand_2}`;
      case 'DIVISION':
        return `${mathOutput.operand_1} ÷ ${mathOutput.operand_2}`;
      default:
        return `a calculation`;
    }
  }

  // Distractor generation methods
  private async generateTrueFalseDistractors(correctAnswer: boolean): Promise<any[]> {
    return [
      {
        value: !correctAnswer,
        strategy: DistractorStrategy.LOGICAL_OPPOSITE,
        rationale: correctAnswer ? 'Incorrectly identified as false' : 'Incorrectly identified as true'
      }
    ];
  }

  private async generateCheckWorkDistractors(isCorrect: boolean): Promise<any[]> {
    return [
      {
        value: isCorrect ? 'Incorrect' : 'Correct',
        strategy: DistractorStrategy.LOGICAL_OPPOSITE,
        rationale: isCorrect ? 'Incorrectly identified correct work as wrong' : 'Incorrectly identified wrong work as correct'
      }
    ];
  }

  private async generateSpotErrorDistractors(totalSteps: number, errorStep: number): Promise<any[]> {
    const distractors = [];

    // Wrong steps
    for (let i = 0; i < totalSteps; i++) {
      if (i !== errorStep) {
        distractors.push({
          value: `Step ${i + 1}`,
          strategy: DistractorStrategy.CLOSE_BUT_WRONG,
          rationale: `Incorrectly identified step ${i + 1} as containing the error`
        });
      }
    }

    return distractors.slice(0, 3);
  }

  private async generateVerifyAnswerDistractors(answerOptions: number[], correctAnswer: number): Promise<any[]> {
    return answerOptions
      .filter(opt => opt !== correctAnswer)
      .map(opt => ({
        value: opt,
        strategy: DistractorStrategy.CALCULATION_ERROR,
        rationale: 'Common calculation error'
      }))
      .slice(0, 3);
  }

  private generateTrueFalseSteps(mathOutput: any, presentedAnswer: number, correctAnswer: number, isTrue: boolean): string[] {
    if (isTrue) {
      return [
        `Calculate: ${this.describeOperation(mathOutput)}`,
        `Result: ${correctAnswer}`,
        `Statement claims: ${presentedAnswer}`,
        `Since ${correctAnswer} = ${presentedAnswer}, the statement is TRUE`
      ];
    } else {
      return [
        `Calculate: ${this.describeOperation(mathOutput)}`,
        `Correct result: ${correctAnswer}`,
        `Statement claims: ${presentedAnswer}`,
        `Since ${correctAnswer} ≠ ${presentedAnswer}, the statement is FALSE`
      ];
    }
  }

  private generateCheckWorkExplanation(workingSteps: string[], hasError: boolean, correctAnswer: number): string[] {
    if (hasError) {
      return [
        'Check each step of the working',
        'Error found in calculation',
        `Correct answer should be: ${correctAnswer}`
      ];
    } else {
      return [
        'Check each step of the working',
        'All steps are correct',
        `Final answer ${correctAnswer} is correct`
      ];
    }
  }

  private generateVerificationSteps(mathOutput: any, correctAnswer: number): string[] {
    return [
      `Calculate: ${this.describeOperation(mathOutput)}`,
      `Apply correct operation and order`,
      `Result: ${correctAnswer}`
    ];
  }
}