// Question Orchestrator - Main coordinator for enhanced question generation
// Manages format selection, controller routing, and output rendering

import {
  QuestionController,
  ControllerDependencies,
  MathEngine,
  ScenarioService,
  DistractorEngine
} from '@/lib/controllers/base-question.controller';
import { DirectCalculationController } from '@/lib/controllers/direct-calculation.controller';
import { ComparisonController } from '@/lib/controllers/comparison.controller';
import { EstimationController } from '@/lib/controllers/estimation.controller';
import { ValidationController } from '@/lib/controllers/validation.controller';
import { MultiStepController } from '@/lib/controllers/multi-step.controller';
import { MissingValueController } from '@/lib/controllers/missing-value.controller';
import { OrderingController } from '@/lib/controllers/ordering.controller';
import { PatternController } from '@/lib/controllers/pattern.controller';
import {
  QuestionDefinition,
  QuestionFormat,
  ScenarioTheme,
  SubDifficultyLevel,
  FormatCompatibilityRule
} from '@/lib/types/question-formats';

// Import existing types for compatibility
import type { IMathModel } from '@/lib/types';

/**
 * Request structure for enhanced question generation
 */
export interface EnhancedQuestionRequest {
  model_id: string;
  difficulty_level?: string;        // New format: "3.2"
  year_level?: number;              // Legacy format: 3
  format_preference?: QuestionFormat;
  scenario_theme?: ScenarioTheme;
  pedagogical_focus?: string;
  difficulty_params?: Record<string, any>;
  session_id?: string;
  cultural_context?: string;
}

/**
 * Enhancement status tracking
 */
export interface EnhancementStatus {
  level: 'full' | 'partial' | 'fallback';
  requestedFormat: QuestionFormat;
  actualFormat: QuestionFormat;
  reason?: string;
  featuresActive: string[];
  featuresPending: string[];
  isFullyEnhanced: boolean;
}

/**
 * Generated question with enhanced metadata
 */
export interface EnhancedQuestion {
  // Core question content
  text: string;
  options: QuestionOption[];
  correctIndex: number;

  // Enhanced metadata
  format: QuestionFormat;
  difficulty: SubDifficultyLevel;
  cognitiveLoad: number;
  curriculumTags: string[];
  scenario: any;
  distractors: any[];

  // Enhancement status
  enhancementStatus: EnhancementStatus;

  // Original math output for compatibility
  mathOutput: any;

  // Generation metadata
  generationTime: number;
  questionId: string;
}

export interface QuestionOption {
  text: string;
  value: any;
  index: number;
}

/**
 * Main orchestrator that coordinates all enhanced question generation components
 */
export class QuestionOrchestrator {
  private controllers: Map<QuestionFormat, QuestionController>;
  private availableFormats: Set<QuestionFormat>;
  private formatSelector: FormatSelector;
  private renderer: QuestionRenderer;
  private mathEngine: MathEngine;

  constructor(
    mathEngine: MathEngine,
    scenarioService: ScenarioService,
    distractorEngine: DistractorEngine
  ) {
    this.mathEngine = mathEngine;
    this.controllers = new Map();
    this.availableFormats = new Set();
    this.initializeControllers(mathEngine, scenarioService, distractorEngine);
    this.formatSelector = new FormatSelector(this.availableFormats);
    this.renderer = new QuestionRenderer();
  }

  /**
   * Generate an enhanced question from request
   */
  async generateQuestion(request: EnhancedQuestionRequest): Promise<EnhancedQuestion> {
    const startTime = Date.now();

    // 1. Parse and validate difficulty level
    const difficulty = this.parseDifficulty(request.difficulty_level || request.year_level);

    // 2. Determine available formats for this model and difficulty
    const availableFormats = this.formatSelector.getAvailableFormats(
      request.model_id,
      difficulty
    );

    // 3. Select format based on preferences and pedagogical goals
    const selectedFormat = this.formatSelector.selectFormat(
      availableFormats,
      request.format_preference,
      request.pedagogical_focus
    );

    // 4. Get appropriate controller with fallback
    let actualFormat = selectedFormat;
    let controller = this.controllers.get(selectedFormat);
    let enhancementStatus: EnhancementStatus;

    if (!controller) {
      // Fallback to DIRECT_CALCULATION if requested format not available
      actualFormat = QuestionFormat.DIRECT_CALCULATION;
      controller = this.controllers.get(actualFormat);

      if (!controller) {
        throw new Error('Critical error: DIRECT_CALCULATION controller not available');
      }

      enhancementStatus = {
        level: 'fallback',
        requestedFormat: selectedFormat,
        actualFormat,
        reason: `${selectedFormat} format pending implementation`,
        featuresActive: ['enhanced_distractors', 'scenarios'],
        featuresPending: [selectedFormat.toLowerCase() + '_logic'],
        isFullyEnhanced: false
      };
    } else {
      // Determine enhancement level based on format complexity
      let enhancementLevel: 'partial' | 'full';
      if (actualFormat === QuestionFormat.DIRECT_CALCULATION) {
        enhancementLevel = 'partial';
      } else if ([QuestionFormat.COMPARISON, QuestionFormat.ESTIMATION, QuestionFormat.VALIDATION].includes(actualFormat)) {
        enhancementLevel = 'full';
      } else {
        // Advanced formats: MULTI_STEP, MISSING_VALUE, ORDERING, PATTERN_RECOGNITION
        enhancementLevel = 'full';
      }

      enhancementStatus = {
        level: enhancementLevel,
        requestedFormat: selectedFormat,
        actualFormat,
        featuresActive: ['enhanced_distractors', 'rich_scenarios', 'cognitive_load', 'advanced_formats'],
        featuresPending: [],
        isFullyEnhanced: true
      };
    }

    // 5. Generate question definition
    const questionDef = await controller.generate({
      mathModel: request.model_id,
      difficulty,
      difficultyParams: request.difficulty_params,
      preferredTheme: request.scenario_theme,
      culturalContext: request.cultural_context || 'UK',
      sessionId: request.session_id
    });

    // Update format in definition to reflect actual format used
    questionDef.format = actualFormat;

    // 6. Render to final format
    const rendered = this.renderer.render(questionDef);

    // 7. Enhance with metadata and return
    const endTime = Date.now();
    return this.enhanceQuestion(rendered, questionDef, enhancementStatus, endTime - startTime);
  }

  /**
   * Initialize format-specific controllers
   */
  private initializeControllers(
    mathEngine: MathEngine,
    scenarioService: ScenarioService,
    distractorEngine: DistractorEngine
  ): void {
    const dependencies: ControllerDependencies = {
      mathEngine,
      scenarioService,
      distractorEngine
    };

    this.controllers = new Map();
    this.availableFormats = new Set();

    // Initialize available controllers
    this.controllers.set(
      QuestionFormat.DIRECT_CALCULATION,
      new DirectCalculationController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.DIRECT_CALCULATION);

    this.controllers.set(
      QuestionFormat.COMPARISON,
      new ComparisonController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.COMPARISON);

    this.controllers.set(
      QuestionFormat.ESTIMATION,
      new EstimationController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.ESTIMATION);

    this.controllers.set(
      QuestionFormat.VALIDATION,
      new ValidationController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.VALIDATION);

    this.controllers.set(
      QuestionFormat.MULTI_STEP,
      new MultiStepController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.MULTI_STEP);

    this.controllers.set(
      QuestionFormat.MISSING_VALUE,
      new MissingValueController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.MISSING_VALUE);

    this.controllers.set(
      QuestionFormat.ORDERING,
      new OrderingController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.ORDERING);

    this.controllers.set(
      QuestionFormat.PATTERN_RECOGNITION,
      new PatternController(dependencies)
    );
    this.availableFormats.add(QuestionFormat.PATTERN_RECOGNITION);
  }

  /**
   * Parse difficulty level from various input formats
   */
  private parseDifficulty(level: number | string | undefined): SubDifficultyLevel {
    if (!level) {
      // Default to year 4, standard level
      return {
        year: 4,
        subLevel: 3,
        displayName: '4.3',
        cognitiveLoad: this.calculateCognitiveLoad(4, 3)
      };
    }

    if (typeof level === 'number') {
      // Legacy integer support (3 -> 3.3)
      return {
        year: Math.floor(level),
        subLevel: 3,
        displayName: `${level}.3`,
        cognitiveLoad: this.calculateCognitiveLoad(level, 3)
      };
    }

    // Parse string format "X.Y"
    const parts = level.split('.');
    if (parts.length !== 2) {
      throw new Error(`Invalid difficulty format: ${level}. Use "X.Y" format (e.g., "3.2")`);
    }

    const year = parseInt(parts[0]);
    const subLevel = parseInt(parts[1]);

    if (year < 1 || year > 6) {
      throw new Error('Year level must be between 1 and 6');
    }

    if (subLevel < 1 || subLevel > 4) {
      throw new Error('Sub level must be between 1 and 4');
    }

    return {
      year,
      subLevel,
      displayName: level,
      cognitiveLoad: this.calculateCognitiveLoad(year, subLevel)
    };
  }

  /**
   * Calculate cognitive load for a difficulty level
   */
  private calculateCognitiveLoad(year: number, subLevel: number): number {
    // Base load increases with year (10-60)
    const baseLoad = 10 + (year - 1) * 10;

    // Sub-level adjustment (0-15)
    const subLevelBonus = (subLevel - 1) * 5;

    return Math.min(100, baseLoad + subLevelBonus);
  }

  /**
   * Enhance rendered question with metadata
   */
  private enhanceQuestion(
    rendered: RenderedQuestion,
    definition: QuestionDefinition,
    enhancementStatus: EnhancementStatus,
    generationTime: number
  ): EnhancedQuestion {
    return {
      text: rendered.questionText,
      options: rendered.options,
      correctIndex: rendered.correctIndex,
      format: definition.format,
      difficulty: definition.difficulty,
      cognitiveLoad: definition.difficulty.cognitiveLoad,
      curriculumTags: definition.metadata.curriculumAlignment,
      scenario: definition.scenario,
      distractors: definition.solution.distractors,
      enhancementStatus,
      mathOutput: this.extractMathOutput(definition),
      generationTime,
      questionId: definition.id
    };
  }

  /**
   * Extract math output for backward compatibility
   */
  private extractMathOutput(definition: QuestionDefinition): any {
    // Reconstruct math output from question parameters
    return {
      operation: definition.mathModel,
      ...definition.parameters.mathValues,
      // Add any additional fields needed for compatibility
    };
  }
}

/**
 * Format selector - determines which question format to use
 */
export class FormatSelector {
  private formatCompatibility: Map<string, FormatCompatibilityRule[]>;
  private availableFormats: Set<QuestionFormat>;

  constructor(availableFormats: Set<QuestionFormat>) {
    this.availableFormats = availableFormats;
    this.formatCompatibility = new Map();
    this.initializeCompatibilityRules();
  }

  /**
   * Get available formats for a model and difficulty
   */
  getAvailableFormats(
    modelId: string,
    difficulty: SubDifficultyLevel
  ): QuestionFormat[] {
    const rules = this.formatCompatibility.get(modelId) || [];

    return rules
      .filter(rule =>
        difficulty.year >= rule.minYear &&
        difficulty.year <= rule.maxYear &&
        difficulty.subLevel >= rule.minSubLevel &&
        this.availableFormats.has(rule.format) // Only return formats with controllers
      )
      .map(rule => rule.format);
  }

  /**
   * Select best format based on preferences
   */
  selectFormat(
    available: QuestionFormat[],
    preference?: QuestionFormat,
    pedagogicalFocus?: string
  ): QuestionFormat {
    // Priority 1: User preference if available
    if (preference && available.includes(preference)) {
      return preference;
    }

    // Priority 2: Pedagogical focus alignment
    if (pedagogicalFocus) {
      const aligned = this.getFormatsForPedagogy(pedagogicalFocus);
      const match = available.find(f => aligned.includes(f));
      if (match) return match;
    }

    // Priority 3: Weighted random selection
    return this.weightedRandomSelect(available);
  }

  /**
   * Initialize format compatibility rules
   */
  private initializeCompatibilityRules(): void {
    // ADDITION model compatibility
    this.formatCompatibility.set('ADDITION', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 1, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.COMPARISON,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.VALIDATION,
        minYear: 2, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.ESTIMATION,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MULTI_STEP,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MISSING_VALUE,
        minYear: 3, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.ORDERING,
        minYear: 2, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.PATTERN_RECOGNITION,
        minYear: 4, maxYear: 6, minSubLevel: 2
      }
    ]);

    // SUBTRACTION model compatibility
    this.formatCompatibility.set('SUBTRACTION', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 1, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.COMPARISON,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.VALIDATION,
        minYear: 2, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.ESTIMATION,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MULTI_STEP,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MISSING_VALUE,
        minYear: 3, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.ORDERING,
        minYear: 2, maxYear: 6, minSubLevel: 1
      }
    ]);

    // MULTIPLICATION model compatibility
    this.formatCompatibility.set('MULTIPLICATION', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 2, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.ESTIMATION,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.VALIDATION,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MULTI_STEP,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MISSING_VALUE,
        minYear: 3, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.PATTERN_RECOGNITION,
        minYear: 4, maxYear: 6, minSubLevel: 2
      }
    ]);

    // DIVISION model compatibility
    this.formatCompatibility.set('DIVISION', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 3, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.ESTIMATION,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.VALIDATION,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MISSING_VALUE,
        minYear: 4, maxYear: 6, minSubLevel: 1
      }
    ]);

    // UNIT_RATE model compatibility
    this.formatCompatibility.set('UNIT_RATE', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 4, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.COMPARISON,
        minYear: 4, maxYear: 6, minSubLevel: 2
      }
    ]);

    // COMPARISON model compatibility
    this.formatCompatibility.set('COMPARISON', [
      {
        format: QuestionFormat.COMPARISON,
        minYear: 3, maxYear: 6, minSubLevel: 1
      }
    ]);

    // Add compatibility rules for all other models with DIRECT_CALCULATION as default
    const allModels = [
      'PERCENTAGE', 'FRACTION', 'COUNTING', 'TIME_RATE', 'CONVERSION', 'MULTI_STEP',
      'LINEAR_EQUATION', 'COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS',
      'MIXED_MONEY_UNITS', 'MONEY_FRACTIONS', 'MONEY_SCALING',
      'SHAPE_RECOGNITION', 'SHAPE_PROPERTIES', 'ANGLE_MEASUREMENT',
      'POSITION_DIRECTION', 'AREA_PERIMETER'
    ];

    allModels.forEach(modelId => {
      if (!this.formatCompatibility.has(modelId)) {
        this.formatCompatibility.set(modelId, [
          {
            format: QuestionFormat.DIRECT_CALCULATION,
            minYear: 1, maxYear: 6, minSubLevel: 1
          }
        ]);
      }
    });
  }

  /**
   * Get formats aligned with pedagogical focus
   */
  private getFormatsForPedagogy(focus: string): QuestionFormat[] {
    const pedagogyMap: Record<string, QuestionFormat[]> = {
      'fluency': [QuestionFormat.DIRECT_CALCULATION],
      'reasoning': [QuestionFormat.COMPARISON, QuestionFormat.ESTIMATION, QuestionFormat.VALIDATION],
      'problem_solving': [QuestionFormat.MULTI_STEP, QuestionFormat.VALIDATION],
      'number_sense': [QuestionFormat.ESTIMATION, QuestionFormat.ORDERING]
    };

    return pedagogyMap[focus] || [];
  }

  /**
   * Weighted random selection of format
   */
  private weightedRandomSelect(formats: QuestionFormat[]): QuestionFormat {
    if (formats.length === 0) {
      throw new Error('No compatible formats available');
    }

    const weights = {
      [QuestionFormat.DIRECT_CALCULATION]: 40,
      [QuestionFormat.COMPARISON]: 25,
      [QuestionFormat.ESTIMATION]: 15,
      [QuestionFormat.VALIDATION]: 10,
      [QuestionFormat.MULTI_STEP]: 5,
      [QuestionFormat.MISSING_VALUE]: 3,
      [QuestionFormat.ORDERING]: 1,
      [QuestionFormat.PATTERN_RECOGNITION]: 1
    };

    const availableWeights = formats.map(f => weights[f] || 1);
    const totalWeight = availableWeights.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalWeight;
    for (let i = 0; i < formats.length; i++) {
      random -= availableWeights[i];
      if (random <= 0) {
        return formats[i];
      }
    }

    return formats[0];
  }
}

/**
 * Question renderer - converts question definitions to final output
 */
export class QuestionRenderer {
  render(definition: QuestionDefinition): RenderedQuestion {
    // For now, create a simple text rendering
    // This can be enhanced with template systems later

    const questionText = this.renderQuestionText(definition);
    const options = this.renderOptions(definition);
    const correctIndex = this.findCorrectIndex(options, definition.solution.correctAnswer);

    return {
      questionText,
      options,
      correctIndex
    };
  }

  private renderQuestionText(definition: QuestionDefinition): string {
    // Use scenario templates if available
    const template = definition.scenario.templates.find(t =>
      t.formatCompatibility.includes(definition.format)
    );

    if (template) {
      return this.fillTemplate(template.template, definition);
    }

    // Fallback to basic rendering
    return this.generateBasicQuestion(definition);
  }

  private fillTemplate(template: string, definition: QuestionDefinition): string {
    let filled = template;

    // Replace placeholders with actual values
    const placeholders = template.match(/\{(\w+)\}/g) || [];

    for (const placeholder of placeholders) {
      const key = placeholder.slice(1, -1); // Remove { }
      let value = '';

      // Look up value from different sources
      if (definition.parameters.narrativeValues[key]) {
        value = definition.parameters.narrativeValues[key];
      } else if (definition.parameters.mathValues[key]) {
        value = String(definition.parameters.mathValues[key]);
      } else if (key === 'character' && definition.scenario.characters.length > 0) {
        value = definition.scenario.characters[0].name;
      }

      filled = filled.replace(placeholder, value);
    }

    return filled;
  }

  private generateBasicQuestion(definition: QuestionDefinition): string {
    const mathModel = definition.mathModel;
    const values = definition.parameters.mathValues;

    switch (mathModel) {
      case 'ADDITION':
        const operands = Object.keys(values)
          .filter(k => k.startsWith('operand_'))
          .map(k => values[k]);
        return `What is ${operands.join(' + ')}?`;

      case 'SUBTRACTION':
        return `What is ${values.minuend} - ${values.subtrahend}?`;

      case 'MULTIPLICATION':
        return `What is ${values.multiplicand} × ${values.multiplier}?`;

      case 'DIVISION':
        return `What is ${values.dividend} ÷ ${values.divisor}?`;

      default:
        return `Calculate the result for this ${mathModel.toLowerCase()} problem.`;
    }
  }

  private renderOptions(definition: QuestionDefinition): QuestionOption[] {
    const options: QuestionOption[] = [];

    // Add correct answer
    options.push({
      text: definition.solution.correctAnswer.displayText,
      value: definition.solution.correctAnswer.value,
      index: 0
    });

    // Add distractors
    definition.solution.distractors.forEach((distractor, index) => {
      options.push({
        text: distractor.displayText,
        value: distractor.value,
        index: index + 1
      });
    });

    // Shuffle options
    return this.shuffleOptions(options);
  }

  private shuffleOptions(options: QuestionOption[]): QuestionOption[] {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Update indices after shuffle
    shuffled.forEach((option, index) => {
      option.index = index;
    });

    return shuffled;
  }

  private findCorrectIndex(options: QuestionOption[], correctAnswer: any): number {
    return options.findIndex(option => option.value === correctAnswer.value);
  }
}

/**
 * Rendered question structure
 */
interface RenderedQuestion {
  questionText: string;
  options: QuestionOption[];
  correctIndex: number;
}