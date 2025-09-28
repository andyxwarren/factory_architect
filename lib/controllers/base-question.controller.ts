// Base Question Controller - Abstract pattern for format-specific question generation
// Provides common functionality and enforces consistent interface

import {
  QuestionDefinition,
  QuestionFormat,
  ScenarioContext,
  ScenarioTheme,
  SubDifficultyLevel,
  DistractorContext,
  Distractor
} from '@/lib/types/question-formats';

// Import existing types for compatibility
import { IMathModel } from '@/lib/types';

/**
 * Dependencies injected into controllers
 */
export interface ControllerDependencies {
  mathEngine: MathEngine;
  scenarioService: ScenarioService;
  distractorEngine: DistractorEngine;
}

/**
 * Parameters for question generation
 */
export interface GenerationParams {
  mathModel: string;
  difficulty: SubDifficultyLevel;
  difficultyParams?: any;
  preferredTheme?: ScenarioTheme;
  culturalContext?: string;
  sessionId?: string;
}

/**
 * Abstract base class for all question format controllers
 * Provides common functionality while enforcing specific implementation requirements
 */
export abstract class QuestionController {
  protected mathEngine: MathEngine;
  protected scenarioService: ScenarioService;
  protected distractorEngine: DistractorEngine;

  constructor(dependencies: ControllerDependencies) {
    this.mathEngine = dependencies.mathEngine;
    this.scenarioService = dependencies.scenarioService;
    this.distractorEngine = dependencies.distractorEngine;
  }

  /**
   * Main generation method - must be implemented by each format controller
   */
  abstract generate(params: GenerationParams): Promise<QuestionDefinition>;

  /**
   * Common validation logic for all controllers
   */
  protected validateParams(params: GenerationParams): void {
    if (!params.mathModel || !params.difficulty) {
      throw new Error('Invalid generation parameters: mathModel and difficulty are required');
    }

    if (params.difficulty.year < 1 || params.difficulty.year > 6) {
      throw new Error('Year level must be between 1 and 6');
    }

    if (params.difficulty.subLevel < 1 || params.difficulty.subLevel > 4) {
      throw new Error('Sub level must be between 1 and 4');
    }
  }

  /**
   * Common scenario selection logic - object parameter overload
   */
  protected async selectScenario(params: {
    theme?: ScenarioTheme;
    mathModel?: string;
    difficulty?: any;
    culturalContext?: string;
    format?: QuestionFormat;
  }): Promise<ScenarioContext>;

  /**
   * Common scenario selection logic - individual parameters
   */
  protected async selectScenario(
    format: QuestionFormat,
    yearLevel: number,
    theme?: ScenarioTheme,
    mathModel?: string
  ): Promise<ScenarioContext>;

  /**
   * Common scenario selection logic implementation
   */
  protected async selectScenario(
    formatOrParams: QuestionFormat | {
      theme?: ScenarioTheme;
      mathModel?: string;
      difficulty?: any;
      culturalContext?: string;
      format?: QuestionFormat;
    },
    yearLevel?: number,
    theme?: ScenarioTheme,
    mathModel?: string
  ): Promise<ScenarioContext> {
    // Handle object parameter style (new style)
    if (typeof formatOrParams === 'object') {
      const params = formatOrParams;
      return this.scenarioService.selectScenario({
        format: params.format || QuestionFormat.DIRECT_CALCULATION,
        yearLevel: params.difficulty?.year || 3,
        theme: params.theme,
        mathModel: params.mathModel,
        culturalContext: params.culturalContext || 'UK'
      });
    }

    // Handle individual parameters style (original style)
    return this.scenarioService.selectScenario({
      format: formatOrParams,
      yearLevel: yearLevel || 3,
      theme,
      mathModel,
      culturalContext: 'UK'
    });
  }

  /**
   * Common distractor generation
   */
  protected async generateDistractors(
    correctAnswer: any,
    context: DistractorContext,
    count: number = 3
  ): Promise<Distractor[]> {
    return this.distractorEngine.generate(correctAnswer, context, count);
  }

  /**
   * Generate math output using existing math engine
   */
  protected async generateMathOutput(
    model: string,
    params: any
  ): Promise<any> {
    return this.mathEngine.generate(model, params);
  }

  /**
   * Create base question definition structure
   */
  protected createBaseQuestionDefinition(
    format: QuestionFormat,
    mathModel: string,
    difficulty: SubDifficultyLevel,
    scenario: ScenarioContext
  ): Partial<QuestionDefinition> {
    return {
      id: this.generateQuestionId(),
      timestamp: new Date(),
      format,
      mathModel,
      difficulty,
      scenario,
      metadata: {
        curriculumAlignment: this.getCurriculumAlignment(mathModel, difficulty.year),
        pedagogicalTags: this.getPedagogicalTags(format, mathModel),
        cognitiveSkills: this.getCognitiveSkills(format),
        estimatedTime: this.estimateCompletionTime(format, difficulty),
        accessibility: {
          readingLevel: this.getReadingLevel(difficulty.year),
          visualElements: this.hasVisualElements(format),
          assistiveTechFriendly: true
        }
      }
    };
  }

  /**
   * Generate unique question identifier
   */
  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get curriculum alignment tags for a model and year
   */
  private getCurriculumAlignment(mathModel: string, year: number): string[] {
    // Map to UK National Curriculum objectives
    const alignmentMap: Record<string, Record<number, string[]>> = {
      ADDITION: {
        1: ['1N1a', '1N1b'],
        2: ['2N1a', '2N1b', '2N1c'],
        3: ['3N1a', '3N1b'],
        4: ['4N1a', '4N1b'],
        5: ['5N1a', '5N1b'],
        6: ['6N1a', '6N1b']
      },
      SUBTRACTION: {
        1: ['1N1c', '1N1d'],
        2: ['2N1d', '2N1e'],
        3: ['3N1c', '3N1d'],
        4: ['4N1c', '4N1d'],
        5: ['5N1c', '5N1d'],
        6: ['6N1c', '6N1d']
      },
      // Add more models as needed
    };

    return alignmentMap[mathModel]?.[year] || [`${year}N1a`];
  }

  /**
   * Get pedagogical tags for format and model combination
   */
  private getPedagogicalTags(format: QuestionFormat, mathModel: string): string[] {
    const formatTags = {
      [QuestionFormat.DIRECT_CALCULATION]: ['calculation', 'fluency'],
      [QuestionFormat.COMPARISON]: ['reasoning', 'problem_solving'],
      [QuestionFormat.ESTIMATION]: ['reasoning', 'number_sense'],
      [QuestionFormat.VALIDATION]: ['problem_solving', 'reasoning'],
      [QuestionFormat.MULTI_STEP]: ['problem_solving', 'fluency'],
      [QuestionFormat.MISSING_VALUE]: ['reasoning', 'algebra'],
      [QuestionFormat.ORDERING]: ['reasoning', 'number_sense'],
      [QuestionFormat.PATTERN_RECOGNITION]: ['reasoning', 'algebra']
    };

    return [...(formatTags[format] || []), mathModel.toLowerCase()];
  }

  /**
   * Get cognitive skills required for format
   */
  private getCognitiveSkills(format: QuestionFormat): string[] {
    const skillsMap = {
      [QuestionFormat.DIRECT_CALCULATION]: ['procedural_fluency'],
      [QuestionFormat.COMPARISON]: ['critical_thinking', 'analysis'],
      [QuestionFormat.ESTIMATION]: ['number_sense', 'approximation'],
      [QuestionFormat.VALIDATION]: ['logical_reasoning', 'problem_solving'],
      [QuestionFormat.MULTI_STEP]: ['working_memory', 'sequential_processing'],
      [QuestionFormat.MISSING_VALUE]: ['algebraic_thinking', 'pattern_recognition'],
      [QuestionFormat.ORDERING]: ['comparison', 'sequencing'],
      [QuestionFormat.PATTERN_RECOGNITION]: ['pattern_recognition', 'prediction']
    };

    return skillsMap[format] || ['mathematical_reasoning'];
  }

  /**
   * Estimate completion time for different formats and difficulties
   */
  private estimateCompletionTime(format: QuestionFormat, difficulty: SubDifficultyLevel): number {
    const baseTime = {
      [QuestionFormat.DIRECT_CALCULATION]: 30,
      [QuestionFormat.COMPARISON]: 60,
      [QuestionFormat.ESTIMATION]: 45,
      [QuestionFormat.VALIDATION]: 40,
      [QuestionFormat.MULTI_STEP]: 90,
      [QuestionFormat.MISSING_VALUE]: 50,
      [QuestionFormat.ORDERING]: 35,
      [QuestionFormat.PATTERN_RECOGNITION]: 55
    };

    const difficultyMultiplier = 1 + (difficulty.year - 1) * 0.15 + (difficulty.subLevel - 1) * 0.1;
    return Math.round((baseTime[format] || 45) * difficultyMultiplier);
  }

  /**
   * Get reading level for year
   */
  private getReadingLevel(year: number): number {
    // Reading level typically tracks with year level
    return year;
  }

  /**
   * Check if format typically includes visual elements
   */
  private hasVisualElements(format: QuestionFormat): boolean {
    return [
      QuestionFormat.COMPARISON,
      QuestionFormat.ESTIMATION,
      QuestionFormat.ORDERING,
      QuestionFormat.PATTERN_RECOGNITION
    ].includes(format);
  }

  /**
   * Format values according to context
   */
  protected formatValue(value: number, units?: string, decimalPlaces: number = 2): string {
    if (units === '£' || units === 'pounds') {
      return this.formatCurrency(value);
    }

    if (Number.isInteger(value)) {
      return value.toString();
    }

    return value.toFixed(decimalPlaces);
  }

  /**
   * Format currency values
   */
  protected formatCurrency(value: number): string {
    if (value >= 1) {
      return `£${value.toFixed(2)}`;
    } else {
      return `${Math.round(value * 100)}p`;
    }
  }

  /**
   * Format price values (alias for formatCurrency for compatibility)
   */
  protected formatPrice(value: number): string {
    return this.formatCurrency(value);
  }
}

/**
 * Interface definitions for injected dependencies
 * These will be implemented by the actual service classes
 */
export interface MathEngine {
  generate(model: string, params: any): Promise<any>;
  getModel(modelId: string): IMathModel<any, any>;
}

export interface ScenarioService {
  selectScenario(criteria: any): Promise<ScenarioContext>;
  generateDynamicScenario(theme: ScenarioTheme, yearLevel: number): Promise<ScenarioContext>;
}

export interface DistractorEngine {
  generate(correctAnswer: any, context: DistractorContext, count?: number): Promise<Distractor[]>;
}