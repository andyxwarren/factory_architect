// Estimation Controller - Generates estimation and rounding questions
// "Estimate the result of..." or "Round to the nearest..."

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
 * Estimation-specific parameters
 */
interface EstimationParams {
  estimationType: 'round' | 'approximate' | 'magnitude' | 'benchmark';
  roundingPlace?: 'ones' | 'tens' | 'hundreds' | 'thousands' | 'tenths' | 'hundredths';
  toleranceRange?: number; // Acceptable range for estimates (e.g., ±10%)
  showWorkingHint?: boolean;
}

/**
 * Controller for generating estimation and rounding questions
 */
export class EstimationController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate estimation-focused question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    // 1. Generate base math content
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

    // 2. Select appropriate scenario
    const scenario = await this.selectScenario({
      theme: params.preferredTheme || ScenarioTheme.REAL_WORLD,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    // 3. Determine estimation type based on math model and difficulty
    const estimationParams = this.determineEstimationParams(params.mathModel, mathOutput, params.difficulty);

    // 4. Generate estimation question variants
    let questionDef: QuestionDefinition;

    switch (estimationParams.estimationType) {
      case 'round':
        questionDef = await this.generateRoundingQuestion(mathOutput, scenario, estimationParams, params);
        break;
      case 'approximate':
        questionDef = await this.generateApproximationQuestion(mathOutput, scenario, estimationParams, params);
        break;
      case 'magnitude':
        questionDef = await this.generateMagnitudeQuestion(mathOutput, scenario, estimationParams, params);
        break;
      case 'benchmark':
        questionDef = await this.generateBenchmarkQuestion(mathOutput, scenario, estimationParams, params);
        break;
      default:
        questionDef = await this.generateApproximationQuestion(mathOutput, scenario, estimationParams, params);
    }

    return questionDef;
  }

  /**
   * Generate rounding-based estimation question
   */
  private async generateRoundingQuestion(
    mathOutput: any,
    scenario: any,
    estimationParams: EstimationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.ESTIMATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Extract the exact result for rounding
    const exactValue = mathOutput.result || mathOutput.answer || mathOutput.value;
    const roundingPlace = estimationParams.roundingPlace || 'tens';

    // Calculate rounded value
    const roundedValue = this.performRounding(exactValue, roundingPlace);

    // Generate question text with scenario context
    const questionText = this.generateRoundingQuestionText(scenario, mathOutput, roundingPlace);

    // Generate distractors for rounding
    const distractors = await this.generateRoundingDistractors(exactValue, roundedValue, roundingPlace);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        estimationParams,
        exactValue,
        roundedValue,
        roundingPlace
      },
      solution: {
        correctAnswer: roundedValue,
        distractors,
        workingSteps: this.generateRoundingSteps(exactValue, roundedValue, roundingPlace),
        explanation: `Rounding ${exactValue} to the nearest ${roundingPlace} gives ${roundedValue}`
      }
    } as QuestionDefinition;
  }

  /**
   * Generate approximation-based estimation question
   */
  private async generateApproximationQuestion(
    mathOutput: any,
    scenario: any,
    estimationParams: EstimationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.ESTIMATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const exactValue = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Generate reasonable estimate based on operation
    const estimatedValue = this.generateReasonableEstimate(mathOutput, estimationParams.toleranceRange || 0.15);

    const questionText = this.generateApproximationQuestionText(scenario, mathOutput);

    // Generate distractors for approximation
    const distractors = await this.generateApproximationDistractors(exactValue, estimatedValue, estimationParams.toleranceRange || 0.15);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        estimationParams,
        exactValue,
        estimatedValue,
        toleranceRange: estimationParams.toleranceRange
      },
      solution: {
        correctAnswer: estimatedValue,
        distractors,
        workingSteps: this.generateEstimationSteps(mathOutput, estimatedValue),
        explanation: `A reasonable estimate for this calculation is approximately ${estimatedValue}`
      }
    } as QuestionDefinition;
  }

  /**
   * Generate magnitude/order of magnitude question
   */
  private async generateMagnitudeQuestion(
    mathOutput: any,
    scenario: any,
    estimationParams: EstimationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.ESTIMATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const exactValue = mathOutput.result || mathOutput.answer || mathOutput.value;
    const magnitude = this.calculateOrderOfMagnitude(exactValue);

    const questionText = this.generateMagnitudeQuestionText(scenario, mathOutput);

    const distractors = await this.generateMagnitudeDistractors(magnitude);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        estimationParams,
        exactValue,
        magnitude
      },
      solution: {
        correctAnswer: magnitude,
        distractors,
        workingSteps: [`The result ${exactValue} is in the order of magnitude of ${magnitude}`],
        explanation: `The order of magnitude is ${magnitude}`
      }
    } as QuestionDefinition;
  }

  /**
   * Generate benchmark-based estimation question
   */
  private async generateBenchmarkQuestion(
    mathOutput: any,
    scenario: any,
    estimationParams: EstimationParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.ESTIMATION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    const exactValue = mathOutput.result || mathOutput.answer || mathOutput.value;
    const benchmark = this.findNearestBenchmark(exactValue);

    const questionText = this.generateBenchmarkQuestionText(scenario, mathOutput, benchmark);

    const distractors = await this.generateBenchmarkDistractors(benchmark);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        estimationParams,
        exactValue,
        benchmark
      },
      solution: {
        correctAnswer: benchmark,
        distractors,
        workingSteps: [`${exactValue} is closest to the benchmark value ${benchmark}`],
        explanation: `The nearest benchmark is ${benchmark}`
      }
    } as QuestionDefinition;
  }

  /**
   * Determine estimation parameters based on context
   */
  private determineEstimationParams(mathModel: string, mathOutput: any, difficulty: any): EstimationParams {
    const result = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Choose estimation type based on model and difficulty
    if (mathModel.includes('MONEY') || mathModel === 'PERCENTAGE') {
      return {
        estimationType: 'round',
        roundingPlace: difficulty.year <= 3 ? 'ones' : 'tens',
        toleranceRange: 0.1
      };
    }

    if (result > 1000) {
      return {
        estimationType: 'round',
        roundingPlace: 'hundreds',
        toleranceRange: 0.15
      };
    }

    if (result > 100) {
      return {
        estimationType: 'round',
        roundingPlace: 'tens',
        toleranceRange: 0.1
      };
    }

    return {
      estimationType: 'approximate',
      toleranceRange: 0.2
    };
  }

  /**
   * Perform rounding to specified place
   */
  private performRounding(value: number, place: string): number {
    const placeValues = {
      'ones': 1,
      'tens': 10,
      'hundreds': 100,
      'thousands': 1000,
      'tenths': 0.1,
      'hundredths': 0.01
    };

    const divisor = placeValues[place as keyof typeof placeValues] || 1;
    return Math.round(value / divisor) * divisor;
  }

  /**
   * Generate reasonable estimate with tolerance
   */
  private generateReasonableEstimate(mathOutput: any, tolerance: number): number {
    const exactValue = mathOutput.result || mathOutput.answer || mathOutput.value;

    // Round to nice numbers for estimation
    if (exactValue < 10) {
      return Math.round(exactValue);
    } else if (exactValue < 100) {
      return Math.round(exactValue / 5) * 5;
    } else if (exactValue < 1000) {
      return Math.round(exactValue / 10) * 10;
    } else {
      return Math.round(exactValue / 100) * 100;
    }
  }

  /**
   * Calculate order of magnitude
   */
  private calculateOrderOfMagnitude(value: number): number {
    if (value === 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    return magnitude;
  }

  /**
   * Find nearest benchmark value
   */
  private findNearestBenchmark(value: number): number {
    const benchmarks = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

    let closest = benchmarks[0];
    let minDiff = Math.abs(value - closest);

    for (const benchmark of benchmarks) {
      const diff = Math.abs(value - benchmark);
      if (diff < minDiff) {
        minDiff = diff;
        closest = benchmark;
      }
    }

    return closest;
  }

  // Question text generation methods
  private generateRoundingQuestionText(scenario: any, mathOutput: any, roundingPlace: string): string {
    const operation = this.describeOperation(mathOutput);
    return `${scenario.characters[0].name} ${operation}. Round the result to the nearest ${roundingPlace}.`;
  }

  private generateApproximationQuestionText(scenario: any, mathOutput: any): string {
    const operation = this.describeOperation(mathOutput);
    return `${scenario.characters[0].name} ${operation}. What is a reasonable estimate?`;
  }

  private generateMagnitudeQuestionText(scenario: any, mathOutput: any): string {
    const operation = this.describeOperation(mathOutput);
    return `${scenario.characters[0].name} ${operation}. What order of magnitude is the result?`;
  }

  private generateBenchmarkQuestionText(scenario: any, mathOutput: any, benchmark: number): string {
    const operation = this.describeOperation(mathOutput);
    return `${scenario.characters[0].name} ${operation}. Which benchmark value is this closest to?`;
  }

  private describeOperation(mathOutput: any): string {
    // Create contextual operation description
    switch (mathOutput.operation) {
      case 'ADDITION':
        return `is adding ${mathOutput.operand_1} + ${mathOutput.operand_2}${mathOutput.operand_3 ? ' + ' + mathOutput.operand_3 : ''}`;
      case 'SUBTRACTION':
        return `is subtracting ${mathOutput.operand_1} - ${mathOutput.operand_2}`;
      case 'MULTIPLICATION':
        return `is multiplying ${mathOutput.operand_1} × ${mathOutput.operand_2}`;
      case 'DIVISION':
        return `is dividing ${mathOutput.operand_1} ÷ ${mathOutput.operand_2}`;
      default:
        return `is calculating a result`;
    }
  }

  // Distractor generation methods
  private async generateRoundingDistractors(exactValue: number, roundedValue: number, roundingPlace: string): Promise<any[]> {
    const distractors = [];

    // Common rounding errors
    const placeValues = { 'ones': 1, 'tens': 10, 'hundreds': 100, 'thousands': 1000, 'tenths': 0.1, 'hundredths': 0.01 };
    const divisor = placeValues[roundingPlace as keyof typeof placeValues] || 1;

    // Wrong place value rounding
    if (roundingPlace !== 'tens') {
      distractors.push({
        value: this.performRounding(exactValue, 'tens'),
        strategy: DistractorStrategy.WRONG_OPERATION,
        rationale: 'Rounded to wrong place value'
      });
    }

    // Truncation instead of rounding
    distractors.push({
      value: Math.floor(exactValue / divisor) * divisor,
      strategy: DistractorStrategy.PROCEDURAL_ERROR,
      rationale: 'Truncated instead of rounded'
    });

    // Always round up
    distractors.push({
      value: Math.ceil(exactValue / divisor) * divisor,
      strategy: DistractorStrategy.PROCEDURAL_ERROR,
      rationale: 'Always rounded up'
    });

    return distractors.slice(0, 3);
  }

  private async generateApproximationDistractors(exactValue: number, estimatedValue: number, tolerance: number): Promise<any[]> {
    const distractors = [];

    // Too precise (exact answer)
    distractors.push({
      value: exactValue,
      strategy: DistractorStrategy.WRONG_OPERATION,
      rationale: 'Used exact calculation instead of estimation'
    });

    // Poor estimates (too high/low)
    distractors.push({
      value: estimatedValue * 1.5,
      strategy: DistractorStrategy.MAGNITUDE_ERROR,
      rationale: 'Overestimated significantly'
    });

    distractors.push({
      value: estimatedValue * 0.6,
      strategy: DistractorStrategy.MAGNITUDE_ERROR,
      rationale: 'Underestimated significantly'
    });

    return distractors.slice(0, 3);
  }

  private async generateMagnitudeDistractors(magnitude: number): Promise<any[]> {
    const distractors = [];

    // One order higher/lower
    distractors.push({
      value: magnitude * 10,
      strategy: DistractorStrategy.MAGNITUDE_ERROR,
      rationale: 'One order of magnitude too high'
    });

    distractors.push({
      value: magnitude / 10,
      strategy: DistractorStrategy.MAGNITUDE_ERROR,
      rationale: 'One order of magnitude too low'
    });

    // Off by factor of 2
    distractors.push({
      value: magnitude * 2,
      strategy: DistractorStrategy.MAGNITUDE_ERROR,
      rationale: 'Doubled the magnitude'
    });

    return distractors.slice(0, 3);
  }

  private async generateBenchmarkDistractors(benchmark: number): Promise<any[]> {
    const allBenchmarks = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const currentIndex = allBenchmarks.indexOf(benchmark);

    const distractors = [];

    // Adjacent benchmarks
    if (currentIndex > 0) {
      distractors.push({
        value: allBenchmarks[currentIndex - 1],
        strategy: DistractorStrategy.CLOSE_BUT_WRONG,
        rationale: 'Adjacent lower benchmark'
      });
    }

    if (currentIndex < allBenchmarks.length - 1) {
      distractors.push({
        value: allBenchmarks[currentIndex + 1],
        strategy: DistractorStrategy.CLOSE_BUT_WRONG,
        rationale: 'Adjacent higher benchmark'
      });
    }

    // Double the benchmark
    if (benchmark * 2 <= 10000) {
      distractors.push({
        value: benchmark * 2,
        strategy: DistractorStrategy.MAGNITUDE_ERROR,
        rationale: 'Doubled the benchmark'
      });
    }

    return distractors.slice(0, 3);
  }

  private generateRoundingSteps(exactValue: number, roundedValue: number, roundingPlace: string): string[] {
    return [
      `Original value: ${exactValue}`,
      `Looking at the ${roundingPlace} place`,
      `Rounded value: ${roundedValue}`
    ];
  }

  private generateEstimationSteps(mathOutput: any, estimatedValue: number): string[] {
    return [
      `Identify the operation: ${mathOutput.operation}`,
      `Round operands to nice numbers`,
      `Calculate estimate: ${estimatedValue}`
    ];
  }
}