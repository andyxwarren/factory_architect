// Pattern Controller - Generates pattern recognition and sequence questions
// "What comes next?" or "Complete the pattern" or "Find the rule"

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
 * Pattern specific parameters
 */
interface PatternParams {
  patternType: 'arithmetic' | 'geometric' | 'fibonacci' | 'quadratic' | 'custom';
  patternRule: string;
  sequence: number[];
  missingPosition: 'next' | 'middle' | 'beginning' | 'multiple';
  difficulty: 'simple' | 'moderate' | 'complex';
  step: number; // For arithmetic sequences
  ratio?: number; // For geometric sequences
  baseValue: number;
  sequenceLength: number;
}

/**
 * Controller for generating pattern recognition questions
 */
export class PatternController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate pattern recognition question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    // 1. Generate base math content for number ranges
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

    // Validate mathOutput
    if (!mathOutput) {
      throw new Error(`Failed to generate math output for model: ${params.mathModel}`);
    }

    // 2. Select appropriate scenario
    const scenario = await this.selectScenario({
      theme: params.preferredTheme || ScenarioTheme.PUZZLE,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    // 3. Determine pattern parameters
    const patternParams = this.determinePatternParams(params.mathModel, mathOutput, params.difficulty);

    // 4. Generate the pattern question
    const questionDef = await this.generatePatternQuestion(mathOutput, scenario, patternParams, params);

    return questionDef;
  }

  /**
   * Generate complete pattern question
   */
  private async generatePatternQuestion(
    mathOutput: any,
    scenario: any,
    patternParams: PatternParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.PATTERN_RECOGNITION,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Generate complete sequence based on pattern
    const fullSequence = this.generateSequence(patternParams);

    // Create the question by hiding some elements
    const questionSequence = this.createQuestionSequence(fullSequence, patternParams);

    // Determine what the student needs to find
    const missingValues = this.findMissingValues(fullSequence, questionSequence, patternParams);

    // Create question text with scenario
    const questionText = this.generatePatternQuestionText(scenario, questionSequence, patternParams);

    // Generate distractors
    const distractors = await this.generatePatternDistractors(missingValues, patternParams, fullSequence);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        patternParams: {
          ...patternParams,
          sequence: fullSequence
        },
        questionSequence,
        missingValues
      },
      questionContent: {
        fullText: questionText,
        components: undefined
      },
      solution: {
        correctAnswer: {
          value: missingValues.length === 1 ? missingValues[0] : missingValues,
          displayText: missingValues.length === 1 ? missingValues[0].toString() : missingValues.join(', '),
          units: ''
        },
        distractors,
        workingSteps: this.generatePatternSteps(fullSequence, patternParams),
        explanation: this.generatePatternExplanation(patternParams, missingValues),
        solutionStrategy: 'Identify the pattern rule and apply it to find missing values'
      }
    } as QuestionDefinition;
  }

  /**
   * Determine pattern parameters based on context
   */
  private determinePatternParams(mathModel: string, mathOutput: any, difficulty: any): PatternParams {
    // Determine pattern type based on difficulty
    let patternType: PatternParams['patternType'];
    let patternDifficulty: PatternParams['difficulty'];

    if (difficulty.year <= 2) {
      patternType = 'arithmetic';
      patternDifficulty = 'simple';
    } else if (difficulty.year <= 4) {
      patternType = Math.random() > 0.7 ? 'geometric' : 'arithmetic';
      patternDifficulty = Math.random() > 0.5 ? 'simple' : 'moderate';
    } else {
      const types: PatternParams['patternType'][] = ['arithmetic', 'geometric', 'quadratic'];
      if (difficulty.year >= 6) types.push('fibonacci', 'custom');
      patternType = types[Math.floor(Math.random() * types.length)];
      patternDifficulty = Math.random() > 0.3 ? 'moderate' : 'complex';
    }

    // Determine sequence length
    const sequenceLength = Math.max(4, Math.min(8, difficulty.year + 2));

    // Determine missing position
    let missingPosition: PatternParams['missingPosition'];
    if (difficulty.year <= 2) {
      missingPosition = 'next';
    } else if (difficulty.year <= 4) {
      missingPosition = Math.random() > 0.5 ? 'next' : 'middle';
    } else {
      const positions: PatternParams['missingPosition'][] = ['next', 'middle', 'multiple'];
      missingPosition = positions[Math.floor(Math.random() * positions.length)];
    }

    // Generate pattern-specific parameters
    const baseValue = this.generateBaseValue(mathOutput, patternDifficulty);
    const step = this.generateStep(patternType, patternDifficulty);
    const ratio = patternType === 'geometric' ? this.generateRatio(patternDifficulty) : undefined;

    return {
      patternType,
      patternRule: '',
      sequence: [],
      missingPosition,
      difficulty: patternDifficulty,
      step,
      ratio,
      baseValue,
      sequenceLength
    };
  }

  /**
   * Generate appropriate base value
   */
  private generateBaseValue(mathOutput: any, difficulty: PatternParams['difficulty']): number {
    switch (difficulty) {
      case 'simple':
        return Math.floor(Math.random() * 10) + 1;
      case 'moderate':
        return Math.floor(Math.random() * 20) + 1;
      case 'complex':
        return Math.floor(Math.random() * 50) + 1;
      default:
        return 2;
    }
  }

  /**
   * Generate step size for arithmetic patterns
   */
  private generateStep(patternType: PatternParams['patternType'], difficulty: PatternParams['difficulty']): number {
    if (patternType !== 'arithmetic') return 1;

    switch (difficulty) {
      case 'simple':
        return Math.floor(Math.random() * 5) + 1; // 1-5
      case 'moderate':
        return Math.floor(Math.random() * 10) + 1; // 1-10
      case 'complex':
        return Math.floor(Math.random() * 15) + 1; // 1-15
      default:
        return 2;
    }
  }

  /**
   * Generate ratio for geometric patterns
   */
  private generateRatio(difficulty: PatternParams['difficulty']): number {
    switch (difficulty) {
      case 'simple':
        return 2; // Always double
      case 'moderate':
        return Math.random() > 0.5 ? 2 : 3; // x2 or x3
      case 'complex':
        const ratios = [2, 3, 4, 0.5]; // Include fractions
        return ratios[Math.floor(Math.random() * ratios.length)];
      default:
        return 2;
    }
  }

  /**
   * Generate complete sequence based on pattern
   */
  private generateSequence(patternParams: PatternParams): number[] {
    const sequence = [];
    let current = patternParams.baseValue;

    switch (patternParams.patternType) {
      case 'arithmetic':
        for (let i = 0; i < patternParams.sequenceLength; i++) {
          sequence.push(current);
          current += patternParams.step;
        }
        patternParams.patternRule = `Add ${patternParams.step} each time`;
        break;

      case 'geometric':
        for (let i = 0; i < patternParams.sequenceLength; i++) {
          sequence.push(Math.round(current * 100) / 100); // Round to 2 decimal places
          current *= patternParams.ratio!;
        }
        patternParams.patternRule = `Multiply by ${patternParams.ratio} each time`;
        break;

      case 'fibonacci':
        // Start with two values
        sequence.push(patternParams.baseValue);
        sequence.push(patternParams.baseValue + 1);
        for (let i = 2; i < patternParams.sequenceLength; i++) {
          sequence.push(sequence[i - 1] + sequence[i - 2]);
        }
        patternParams.patternRule = 'Each number is the sum of the two previous numbers';
        break;

      case 'quadratic':
        for (let i = 0; i < patternParams.sequenceLength; i++) {
          const term = patternParams.baseValue + (i * i * patternParams.step);
          sequence.push(term);
        }
        patternParams.patternRule = `Based on square numbers (n²)`;
        break;

      case 'custom':
        // Alternating pattern or more complex
        for (let i = 0; i < patternParams.sequenceLength; i++) {
          if (i % 2 === 0) {
            sequence.push(current);
            current += patternParams.step;
          } else {
            sequence.push(current - 1);
            current += patternParams.step;
          }
        }
        patternParams.patternRule = 'Alternating pattern with step changes';
        break;

      default:
        // Default arithmetic
        for (let i = 0; i < patternParams.sequenceLength; i++) {
          sequence.push(current);
          current += patternParams.step;
        }
        patternParams.patternRule = `Add ${patternParams.step} each time`;
    }

    return sequence;
  }

  /**
   * Create question sequence by hiding some elements
   */
  private createQuestionSequence(fullSequence: number[], patternParams: PatternParams): (number | string)[] {
    const questionSequence = [...fullSequence] as (number | string)[];

    switch (patternParams.missingPosition) {
      case 'next':
        // Remove the last element(s)
        questionSequence[questionSequence.length - 1] = '?';
        break;

      case 'middle':
        // Remove a middle element
        const middleIndex = Math.floor(questionSequence.length / 2);
        questionSequence[middleIndex] = '?';
        break;

      case 'beginning':
        // Remove first element
        questionSequence[0] = '?';
        break;

      case 'multiple':
        // Remove multiple elements
        const indices = this.selectMultipleIndices(questionSequence.length);
        indices.forEach(index => {
          questionSequence[index] = '?';
        });
        break;
    }

    return questionSequence;
  }

  /**
   * Select multiple indices for missing values
   */
  private selectMultipleIndices(length: number): number[] {
    const count = Math.min(2, Math.floor(length / 3)); // Remove at most 1/3
    const indices = [];

    while (indices.length < count) {
      const index = Math.floor(Math.random() * length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }

    return indices.sort((a, b) => a - b);
  }

  /**
   * Find missing values in the sequence
   */
  private findMissingValues(fullSequence: number[], questionSequence: (number | string)[], patternParams: PatternParams): number[] {
    const missingValues = [];

    for (let i = 0; i < questionSequence.length; i++) {
      if (questionSequence[i] === '?') {
        missingValues.push(fullSequence[i]);
      }
    }

    return missingValues;
  }

  /**
   * Generate question text with scenario
   */
  private generatePatternQuestionText(scenario: any, questionSequence: (number | string)[], patternParams: PatternParams): string {
    const character = scenario.characters?.[0]?.name || 'A student';
    const sequenceText = questionSequence.join(', ');

    switch (scenario.theme) {
      case 'CLASSROOM':
        return `${character} is working on number patterns. Look at this sequence: ${sequenceText}. What number(s) should replace the ? to continue the pattern?`;

      case 'PUZZLE':
        return `${character} found this number puzzle: ${sequenceText}. Can you figure out what number should replace the ?`;

      case 'REAL_WORLD':
        if (patternParams.patternType === 'arithmetic' && patternParams.step > 0) {
          return `${character} is counting by ${patternParams.step}s: ${sequenceText}. What comes next?`;
        }
        break;

      case 'SPORTS':
        return `${character} noticed a pattern in the scores: ${sequenceText}. What number should replace the ?`;

      default:
        return `${character} needs to find the missing number in this pattern: ${sequenceText}`;
    }

    return `Look at this pattern: ${sequenceText}. What number should replace the ?`;
  }

  /**
   * Generate working steps for solution
   */
  private generatePatternSteps(fullSequence: number[], patternParams: PatternParams): string[] {
    const steps = [];

    steps.push(`Look at the sequence: ${fullSequence.slice(0, Math.min(4, fullSequence.length)).join(', ')}...`);

    switch (patternParams.patternType) {
      case 'arithmetic':
        steps.push(`Find the difference between consecutive terms`);
        steps.push(`${fullSequence[1]} - ${fullSequence[0]} = ${patternParams.step}`);
        steps.push(`${fullSequence[2]} - ${fullSequence[1]} = ${patternParams.step}`);
        steps.push(`The pattern adds ${patternParams.step} each time`);
        break;

      case 'geometric':
        steps.push(`Find the ratio between consecutive terms`);
        steps.push(`${fullSequence[1]} ÷ ${fullSequence[0]} = ${patternParams.ratio}`);
        steps.push(`${fullSequence[2]} ÷ ${fullSequence[1]} = ${patternParams.ratio}`);
        steps.push(`The pattern multiplies by ${patternParams.ratio} each time`);
        break;

      case 'fibonacci':
        steps.push(`Look for the relationship between terms`);
        steps.push(`${fullSequence[0]} + ${fullSequence[1]} = ${fullSequence[2]}`);
        steps.push(`${fullSequence[1]} + ${fullSequence[2]} = ${fullSequence[3]}`);
        steps.push(`Each term is the sum of the two previous terms`);
        break;

      case 'quadratic':
        steps.push(`Look at the differences between terms`);
        steps.push(`The pattern is based on square numbers`);
        break;

      default:
        steps.push(`Identify the rule: ${patternParams.patternRule}`);
        steps.push(`Apply the rule to find missing values`);
    }

    return steps;
  }

  /**
   * Generate pattern explanation
   */
  private generatePatternExplanation(patternParams: PatternParams, missingValues: number[]): string {
    const rule = patternParams.patternRule;
    const answer = missingValues.length === 1 ? missingValues[0].toString() : missingValues.join(', ');

    return `The pattern rule is: ${rule}. Therefore, the missing value(s) are: ${answer}.`;
  }

  /**
   * Generate distractors for pattern questions
   */
  private async generatePatternDistractors(missingValues: number[], patternParams: PatternParams, fullSequence: number[]): Promise<any[]> {
    const distractors = [];
    const correctValue = missingValues[0]; // Use first missing value for simplicity

    // Common pattern errors:

    // 1. Wrong step size (arithmetic patterns)
    if (patternParams.patternType === 'arithmetic') {
      const wrongStep = patternParams.step + (Math.random() > 0.5 ? 1 : -1);
      const wrongValue = this.calculateWithWrongStep(fullSequence, correctValue, wrongStep, patternParams);
      if (wrongValue !== correctValue) {
        distractors.push({
          value: wrongValue,
          strategy: DistractorStrategy.PROCEDURAL_ERROR,
          rationale: `Used wrong step size (${wrongStep} instead of ${patternParams.step})`
        });
      }
    }

    // 2. Wrong operation
    const wrongOpValue = this.calculateWithWrongOperation(fullSequence, correctValue, patternParams);
    if (wrongOpValue !== correctValue) {
      distractors.push({
        value: wrongOpValue,
        strategy: DistractorStrategy.WRONG_OPERATION,
        rationale: 'Used wrong operation for pattern'
      });
    }

    // 3. Pattern from wrong starting point
    const wrongStartValue = this.calculateFromWrongStart(fullSequence, patternParams);
    if (wrongStartValue !== correctValue) {
      distractors.push({
        value: wrongStartValue,
        strategy: DistractorStrategy.PATTERN_MISUNDERSTANDING,
        rationale: 'Started pattern from wrong position'
      });
    }

    // 4. Simple counting error
    const countingError = correctValue + (Math.random() > 0.5 ? 1 : -1);
    if (countingError !== correctValue && countingError > 0) {
      distractors.push({
        value: countingError,
        strategy: DistractorStrategy.CALCULATION_ERROR,
        rationale: 'Off by one error'
      });
    }

    // 5. Magnitude error (for geometric patterns)
    if (patternParams.patternType === 'geometric') {
      const magnitudeError = Math.round(correctValue * 1.5);
      if (magnitudeError !== correctValue) {
        distractors.push({
          value: magnitudeError,
          strategy: DistractorStrategy.MAGNITUDE_ERROR,
          rationale: 'Magnitude error in geometric progression'
        });
      }
    }

    return distractors.slice(0, 3);
  }

  /**
   * Calculate value with wrong step size
   */
  private calculateWithWrongStep(fullSequence: number[], correctValue: number, wrongStep: number, patternParams: PatternParams): number {
    // Assume we're finding the next value in sequence
    const lastKnownValue = fullSequence[fullSequence.length - 2];
    return lastKnownValue + wrongStep;
  }

  /**
   * Calculate value with wrong operation
   */
  private calculateWithWrongOperation(fullSequence: number[], correctValue: number, patternParams: PatternParams): number {
    if (patternParams.patternType === 'arithmetic') {
      // Use multiplication instead of addition
      const lastKnownValue = fullSequence[fullSequence.length - 2];
      return lastKnownValue * 2;
    }

    if (patternParams.patternType === 'geometric') {
      // Use addition instead of multiplication
      const lastKnownValue = fullSequence[fullSequence.length - 2];
      return lastKnownValue + patternParams.ratio!;
    }

    return correctValue + 5; // Fallback
  }

  /**
   * Calculate assuming wrong starting point
   */
  private calculateFromWrongStart(fullSequence: number[], patternParams: PatternParams): number {
    // Assume pattern starts from second element instead of first
    if (fullSequence.length < 2) return fullSequence[0];

    const wrongBase = fullSequence[1];
    const position = fullSequence.length - 1; // Position of missing element

    if (patternParams.patternType === 'arithmetic') {
      return wrongBase + (position * patternParams.step);
    }

    return wrongBase * Math.pow(patternParams.ratio || 2, position);
  }
}