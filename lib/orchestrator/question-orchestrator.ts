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
  QuestionContent,
  ScenarioTheme,
  SubDifficultyLevel,
  FormatCompatibilityRule
} from '@/lib/types/question-formats';
import { EnhancedDifficultySystem } from '@/lib/math-engine/difficulty-enhanced';

// Import existing types for compatibility
import type { GenerationSetup } from '@/lib/types';

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

  // Enhanced structured content for rich UI rendering
  questionContent?: QuestionContent;

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

  // Complete generation setup details
  generationSetup?: GenerationSetup;
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

    // 1a. Get curriculum-aligned math parameters for this difficulty
    // This uses the UK National Curriculum framework to define the math problem's constraints
    let curriculumParams: any;
    try {
      curriculumParams = EnhancedDifficultySystem.getSubLevelParams(
        request.model_id,
        difficulty
      );
    } catch (error) {
      // Fallback: Enhanced difficulty not yet implemented for this model
      // Use the model's own default params or the user-provided params
      curriculumParams = request.difficulty_params || this.getModelDefaultParams(request.model_id, difficulty.year);
    }

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
      difficultyParams: curriculumParams,  // Use curriculum-aligned params, NOT request.difficulty_params
      preferredTheme: request.scenario_theme,
      culturalContext: request.cultural_context || 'UK',
      sessionId: request.session_id
    });

    // Update format in definition to reflect actual format used
    questionDef.format = actualFormat;

    // 6. Render to final format
    const rendered = this.renderer.render(questionDef);

    // 7. Create generation setup details
    const endTime = Date.now();
    const generationSetup: GenerationSetup = {
      // Orchestrator details
      controller_used: `${actualFormat}Controller`,
      format_requested: selectedFormat,
      format_actual: actualFormat,
      format_selection_reason: enhancementStatus.reason,

      // Scenario details
      scenario_theme: questionDef.scenario.theme || 'UNKNOWN',
      scenario_id: questionDef.scenario.id || 'UNKNOWN',
      scenario_selection_method: request.scenario_theme ? 'requested' : 'default',

      // Distractor details
      distractor_strategies: questionDef.solution.distractors?.map((d: any) => d.strategy) || [],
      distractor_count: questionDef.solution.distractors?.length || 0,

      // Rules and weights
      format_weights: undefined, // Will be set by bulk API if available
      theme_variety: false, // Will be set by bulk API if available
      format_variety: false, // Will be set by bulk API if available

      // Enhancement tracking
      enhancement_level: enhancementStatus.level,
      features_active: enhancementStatus.featuresActive,
      features_pending: enhancementStatus.featuresPending,

      // Performance
      generation_time_ms: endTime - startTime
    };

    // 8. Enhance with metadata and return
    return this.enhanceQuestion(rendered, questionDef, enhancementStatus, endTime - startTime, generationSetup);
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
    generationTime: number,
    generationSetup?: GenerationSetup
  ): EnhancedQuestion {
    // Ensure we have valid question text
    let questionText = rendered.questionText;
    if (!questionText || questionText === 'What is ?' || questionText.length < 10) {
      console.warn('Invalid question text detected, using fallback generation');
      questionText = this.generateFallbackQuestion(definition);
    }

    // Ensure we have valid options with numeric answers
    const validatedOptions = this.validateOptions(rendered.options, definition);

    return {
      text: questionText,
      options: validatedOptions,
      correctIndex: rendered.correctIndex,
      questionContent: definition.questionContent,
      format: definition.format,
      difficulty: definition.difficulty,
      cognitiveLoad: definition.difficulty.cognitiveLoad,
      curriculumTags: definition.metadata.curriculumAlignment,
      scenario: definition.scenario,
      distractors: definition.solution.distractors,
      enhancementStatus,
      mathOutput: this.extractMathOutput(definition),
      generationTime,
      questionId: definition.id,
      generationSetup
    };
  }

  /**
   * Generate fallback question text when rendering fails
   */
  private generateFallbackQuestion(definition: QuestionDefinition): string {
    const model = definition.mathModel;
    const values = definition.parameters?.mathValues || {};
    const narrative = definition.parameters?.narrativeValues || {};
    const scenario = definition.scenario;

    // Try to generate scenario-aware question first
    if (scenario && scenario.theme) {
      const scenarioQuestion = this.generateScenarioAwareFallback(model, values, narrative, scenario);
      if (scenarioQuestion) {
        return scenarioQuestion;
      }
    }

    // Generate basic question based on model
    switch (model) {
      case 'ADDITION':
        const addends = values.operands || [values.operand_1, values.operand_2, values.operand_3].filter(v => v !== undefined);
        if (addends.length > 0) {
          return `What is ${addends.join(' + ')}?`;
        }
        return 'Add the numbers together.';

      case 'SUBTRACTION':
        const minuend = values.minuend || values.operand_1;
        const subtrahend = values.subtrahend || values.operand_2;
        if (minuend !== undefined && subtrahend !== undefined) {
          return `What is ${minuend} - ${subtrahend}?`;
        }
        return 'Subtract to find the difference.';

      case 'MULTIPLICATION':
        const multiplicand = values.multiplicand || values.operand_1;
        const multiplier = values.multiplier || values.operand_2;
        if (multiplicand !== undefined && multiplier !== undefined) {
          return `What is ${multiplicand} × ${multiplier}?`;
        }
        return 'Multiply to find the product.';

      case 'DIVISION':
        const dividend = values.dividend || values.operand_1;
        const divisor = values.divisor || values.operand_2;
        if (dividend !== undefined && divisor !== undefined) {
          return `What is ${dividend} ÷ ${divisor}?`;
        }
        return 'Divide to find the quotient.';

      case 'PERCENTAGE':
        const percentage = values.percentage;
        const baseValue = values.base_value;
        if (percentage && baseValue) {
          return `What is ${percentage}% of ${baseValue}?`;
        }
        return 'Calculate the percentage.';

      case 'FRACTION':
        const numerator = values.numerator;
        const denominator = values.denominator;
        if (numerator && denominator) {
          return `What is ${numerator}/${denominator} as a decimal?`;
        }
        return 'Calculate the fraction.';

      case 'UNIT_RATE':
        return 'Compare the rates to find which is better value.';

      case 'MONEY_COMBINATIONS':
      case 'COIN_RECOGNITION':
      case 'CHANGE_CALCULATION':
        const amount = values.result || values.operand_1;
        if (amount) {
          return `How much money is this worth?`;
        }
        return 'Calculate the money amount.';

      default:
        // More descriptive default based on result
        if (values.result !== undefined) {
          return `What is the answer to this ${model.toLowerCase().replace('_', ' ')} problem?`;
        }
        return `Solve this ${model.toLowerCase().replace('_', ' ')} problem.`;
    }
  }

  /**
   * Generate scenario-aware fallback questions
   */
  private generateScenarioAwareFallback(
    model: string,
    values: Record<string, any>,
    narrative: Record<string, any>,
    scenario: any
  ): string | null {
    const character = narrative.character || scenario.characters?.[0]?.name || 'Sam';
    const theme = scenario.theme;

    switch (theme) {
      case 'SHOPPING':
        if (model === 'ADDITION' && values.operands) {
          return `${character} buys items costing ${this.formatPrice(values.operands[0])} and ${this.formatPrice(values.operands[1])}. How much does ${character} spend altogether?`;
        }
        if (model === 'CHANGE_CALCULATION' && values.minuend && values.subtrahend) {
          return `${character} pays ${this.formatPrice(values.minuend)} for an item costing ${this.formatPrice(values.subtrahend)}. How much change does ${character} get?`;
        }
        if (values.result) {
          return `${character} goes shopping. What is the total cost?`;
        }
        break;

      case 'SPORTS':
        if (model === 'MULTIPLICATION' && values.multiplicand && values.multiplier) {
          return `${character} buys ${values.multiplier} sports items at ${this.formatPrice(values.multiplicand)} each. How much does ${character} spend?`;
        }
        if (values.result) {
          return `${character} is calculating sports scores. What is the answer?`;
        }
        break;

      case 'COOKING':
        if (model === 'FRACTION' && values.numerator && values.denominator) {
          return `${character} needs ${values.numerator}/${values.denominator} of a recipe. What is this as a decimal?`;
        }
        if (values.result) {
          return `${character} is following a recipe. What is the calculation?`;
        }
        break;

      case 'SCHOOL':
        if (model === 'ADDITION' && values.operands) {
          return `${character} adds up school expenses: ${values.operands.map(v => this.formatPrice(v)).join(' + ')}. What is the total?`;
        }
        if (values.result) {
          return `${character} is doing maths homework. What is the answer?`;
        }
        break;

      case 'HOUSEHOLD':
        if (values.result) {
          return `${character} is calculating household expenses. What is the total?`;
        }
        break;
    }

    return null;
  }

  /**
   * Validate and fix options to ensure numeric answers
   */
  private validateOptions(options: any[], definition: QuestionDefinition): any[] {
    const correctValue = definition.solution?.correctAnswer?.value;

    return options.map((option, index) => {
      // Ensure option has valid numeric value
      if (typeof option.value === 'number' && !isNaN(option.value)) {
        return option;
      }

      // Try to extract numeric value from various fields
      let numericValue: number | undefined;
      if (typeof option === 'object' && option !== null) {
        numericValue = option.value ?? option.answer ?? option.result;
      }

      // If still no valid value, use a fallback based on correct answer
      if (typeof numericValue !== 'number' || isNaN(numericValue)) {
        if (index === 0 && typeof correctValue === 'number') {
          numericValue = correctValue;
        } else {
          // Generate a plausible distractor
          numericValue = correctValue ? correctValue * (0.8 + Math.random() * 0.4) : 0;
        }
        console.warn(`Invalid option value detected, using fallback: ${numericValue}`);
      }

      return {
        value: numericValue,
        text: this.formatValue(numericValue, '£'),
        isCorrect: index === 0
      };
    });
  }

  /**
   * Format values according to context (from QuestionRenderer)
   */
  private formatValue(value: number, units?: string, decimalPlaces: number = 2): string {
    if (units === '£' || units === 'pounds') {
      return this.formatCurrency(value);
    }

    if (Number.isInteger(value)) {
      return value.toString();
    }

    return Number(value.toFixed(decimalPlaces)).toString();
  }

  /**
   * Format currency values (from QuestionRenderer)
   */
  private formatCurrency(value: number): string {
    if (value >= 1) {
      return `£${value.toFixed(2)}`;
    } else {
      return `${Math.round(value * 100)}p`;
    }
  }

  /**
   * Format price values (from QuestionRenderer)
   */
  private formatPrice(value: number): string {
    return this.formatCurrency(value);
  }

  /**
   * Get model's default parameters as fallback when enhanced difficulty not available
   */
  private getModelDefaultParams(modelId: string, year: number): any {
    try {
      const model = this.mathEngine.getModel(modelId);
      if (model && typeof model.getDefaultParams === 'function') {
        return model.getDefaultParams(year);
      }
    } catch (error) {
      console.warn(`Could not get default params for model ${modelId}:`, error);
    }

    // Final fallback: return basic parameters
    return {
      max_value: Math.min(100, year * 20),
      operand_count: Math.min(3, Math.floor(year / 2) + 2),
      decimal_places: year >= 4 ? 2 : 0
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
    // Defensive null checks
    if (!definition) {
      throw new Error('QuestionDefinition is required');
    }

    // Priority 1: Use pre-generated questionContent if available
    if (definition.questionContent?.fullText) {
      return definition.questionContent.fullText;
    }

    // Priority 2: Use scenario templates if available
    if (definition.scenario?.templates && Array.isArray(definition.scenario.templates)) {
      const template = definition.scenario.templates.find(t => {
        // Check format compatibility
        if (!t?.formatCompatibility?.includes(definition.format)) {
          return false;
        }

        // Check model compatibility
        if (t.modelCompatibility && !t.modelCompatibility.includes(definition.mathModel)) {
          return false;
        }

        // Check operand count compatibility if template specifies it
        if (t.operandCount !== undefined) {
          const questionOperandCount = definition.parameters?.narrativeValues?.operandCount;
          if (questionOperandCount !== undefined && t.operandCount !== questionOperandCount) {
            return false;
          }
        }

        return true;
      });

      if (template?.template) {
        return this.fillTemplate(template.template, definition);
      }
    }

    // Priority 3: Fallback to basic rendering
    // When falling back to basic questions, ensure theme alignment
    const basicQuestion = this.generateBasicQuestion(definition);

    // Update scenario theme to reflect that this is a pure math question
    if (definition.scenario) {
      definition.scenario.theme = ScenarioTheme.SCHOOL; // Most appropriate for pure math questions
    }

    return basicQuestion;
  }

  private fillTemplate(template: string, definition: QuestionDefinition): string {
    // Defensive null checks
    if (!template) {
      throw new Error('Template string is required');
    }
    if (!definition) {
      throw new Error('QuestionDefinition is required for template filling');
    }

    let filled = template;

    // Build comprehensive replacement map
    const replacements: Record<string, string> = {};

    // Add narrative values if they exist
    if (definition.parameters?.narrativeValues) {
      Object.assign(replacements, definition.parameters.narrativeValues);
    }

    // Add math values if they exist
    if (definition.parameters?.mathValues) {
      const mathValues = definition.parameters.mathValues;
      Object.entries(mathValues).forEach(([key, value]) => {
        replacements[key] = String(value);
      });

      // Format result based on context (other values now handled in controller)
      const isMoney = definition.scenario.theme === 'SHOPPING' ||
                     definition.mathModel.includes('MONEY');
      if (mathValues.result !== undefined) {
        // Ensure result is a number before formatting
        const resultValue = typeof mathValues.result === 'number' ? mathValues.result :
                           typeof mathValues.result === 'object' && mathValues.result?.total_decimal ? mathValues.result.total_decimal :
                           parseFloat(String(mathValues.result));

        if (!isNaN(resultValue)) {
          replacements['result'] = isMoney ? this.formatPrice(resultValue) : String(resultValue);
        } else {
          console.warn(`Invalid result value for ${definition.mathModel}:`, mathValues.result);
          replacements['result'] = '0';
        }
      }
    }

    // Add character names with multiple keys for flexibility
    if (definition.scenario?.characters?.length > 0) {
      const characterName = definition.scenario.characters[0].name;
      replacements.character = characterName;
      replacements.person = characterName;
      replacements.name = characterName;
      replacements.student = characterName;
    }

    // Add items (only if not already set in narrativeValues)
    if (definition.scenario?.items?.length > 0) {
      // Don't overwrite items if they were explicitly set in narrativeValues (to respect operand count limits)
      if (!replacements.items) {
        replacements.items = definition.scenario.items.map((item: any) => item.name || item).join(', ');
      } else if (Array.isArray(replacements.items)) {
        // Convert array to comma-separated string
        replacements.items = replacements.items.join(', ');
      }

      if (!replacements.item) {
        replacements.item = definition.scenario.items[0]?.name || definition.scenario.items[0] || 'item';
      }

      // Add individual item references (only if not already set)
      definition.scenario.items.forEach((item: any, index: number) => {
        if (!replacements[`item${index + 1}`]) {
          replacements[`item${index + 1}`] = item.name || item;
        }
      });
    }

    // Add location/setting
    if (definition.scenario?.setting) {
      replacements.location = definition.scenario.setting.location || '';
      replacements.place = definition.scenario.setting.location || '';
    }

    // Apply replacements for {placeholder} patterns
    filled = filled.replace(/\{(\w+)\}/g, (match, key) => {
      if (replacements[key] !== undefined && replacements[key] !== '') {
        return replacements[key];
      }

      // Generate intelligent fallbacks for common missing values
      const fallbackValue = this.generateFallbackValue(key, definition);
      if (fallbackValue) {
        console.log(`Generated fallback for ${key}: ${fallbackValue}`);
        return fallbackValue;
      }

      console.warn(`Missing template value for key: ${key} in template: ${template.substring(0, 100)}`);
      return match; // Keep original if no replacement found
    });

    // Handle literal "placeholder" text (fallback for malformed templates)
    if (replacements.character) {
      filled = filled.replace(/\bplaceholder\b/gi, replacements.character);
    }

    return filled;
  }

  /**
   * Generate intelligent fallback values for missing template variables
   */
  private generateFallbackValue(key: string, definition: QuestionDefinition): string | null {
    const mathValues = definition.parameters?.mathValues || {};
    const scenario = definition.scenario;

    switch (key.toLowerCase()) {
      case 'price':
        // Generate a price based on math values or scenario context
        if (mathValues.result && typeof mathValues.result === 'number') {
          return this.formatPrice(mathValues.result);
        }
        if (mathValues.operand_1 && typeof mathValues.operand_1 === 'number') {
          return this.formatPrice(mathValues.operand_1);
        }
        // Default based on theme
        if (scenario?.theme === 'SPORTS') return '£15';
        if (scenario?.theme === 'SCHOOL') return '£3';
        return '£5';

      case 'quantity':
        // Generate a quantity based on math values
        if (mathValues.operand_2 && typeof mathValues.operand_2 === 'number') {
          return String(mathValues.operand_2);
        }
        if (mathValues.multiplier && typeof mathValues.multiplier === 'number') {
          return String(mathValues.multiplier);
        }
        return '2';

      case 'recipe':
        // Generate a random recipe name for cooking scenarios
        const recipes = ['biscuits', 'cake', 'muffins', 'bread', 'pizza', 'cookies', 'scones'];
        return recipes[Math.floor(Math.random() * recipes.length)];

      case 'recipes':
        // Alternative plural form
        const recipeOptions = ['biscuits and cake', 'muffins and bread', 'cookies and scones'];
        return recipeOptions[Math.floor(Math.random() * recipeOptions.length)];

      case 'prices':
        // Generate a list of prices from operands
        if (mathValues.operands && Array.isArray(mathValues.operands)) {
          return mathValues.operands.map((price: number) => this.formatPrice(price)).join(', ');
        }
        // Generate multiple prices from individual operands
        const priceList = [];
        if (mathValues.operand_1) priceList.push(this.formatPrice(mathValues.operand_1));
        if (mathValues.operand_2) priceList.push(this.formatPrice(mathValues.operand_2));
        if (priceList.length > 0) return priceList.join(', ');

        // Default price list based on theme
        if (scenario?.theme === 'COOKING') return '£2.50, £1.80, £3.20';
        if (scenario?.theme === 'SCHOOL') return '£1.50, £2.00, £0.75';
        return '£2, £3, £5';

      case 'ingredient':
      case 'ingredients':
        const cookingItems = ['flour', 'sugar', 'butter', 'eggs', 'milk', 'chocolate chips'];
        if (key === 'ingredients') {
          return `${cookingItems[0]}, ${cookingItems[1]} and ${cookingItems[2]}`;
        }
        return cookingItems[Math.floor(Math.random() * cookingItems.length)];

      case 'sport':
      case 'sports':
        const sports = ['football', 'basketball', 'tennis', 'cricket', 'rugby'];
        return sports[Math.floor(Math.random() * sports.length)];

      case 'total':
      case 'sum':
        if (mathValues.result && typeof mathValues.result === 'number') {
          return this.formatPrice(mathValues.result);
        }
        return '£10';

      case 'change':
        if (mathValues.result && typeof mathValues.result === 'number') {
          return this.formatPrice(mathValues.result);
        }
        return '£2.50';

      default:
        return null;
    }
  }

  /**
   * Format a number as a UK price
   */
  private formatPrice(amount: number): string {
    // Ensure amount is a number
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) {
      console.warn(`Invalid amount passed to formatPrice:`, amount);
      return '£0.00';
    }

    // Proper rounding to 2 decimal places to avoid floating point precision issues
    const rounded = Math.round((numAmount + Number.EPSILON) * 100) / 100;

    if (rounded < 1) {
      const pence = Math.round(rounded * 100);
      return `${pence}p`;
    }

    return `£${rounded.toFixed(2)}`;
  }

  private generateBasicQuestion(definition: QuestionDefinition): string {
    const mathModel = definition.mathModel;
    const values = definition.parameters?.mathValues || {};

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
    if (definition.solution?.correctAnswer) {
      // Round value to 2 decimal places for consistency
      const roundedValue = typeof definition.solution.correctAnswer.value === 'number'
        ? Math.round(definition.solution.correctAnswer.value * 100) / 100
        : definition.solution.correctAnswer.value;

      options.push({
        text: definition.solution.correctAnswer.displayText || this.formatValue(roundedValue),
        value: roundedValue,
        index: 0
      });
    }

    // Add distractors
    if (definition.solution?.distractors && Array.isArray(definition.solution.distractors)) {
      definition.solution.distractors.forEach((distractor, index) => {
        // Round value to 2 decimal places for consistency
        const roundedValue = typeof distractor.value === 'number'
          ? Math.round(distractor.value * 100) / 100
          : distractor.value;

        options.push({
          text: distractor.displayText || this.formatValue(roundedValue),
          value: roundedValue,
          index: index + 1
        });
      });
    }

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

  /**
   * Format values according to context (from base controller)
   */
  private formatValue(value: number, units?: string, decimalPlaces: number = 2): string {
    // Ensure value is a number
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(numValue)) {
      console.warn(`Invalid value passed to formatValue:`, value);
      return '0';
    }

    if (units === '£' || units === 'pounds') {
      return this.formatCurrency(numValue);
    }

    if (Number.isInteger(numValue)) {
      return numValue.toString();
    }

    return numValue.toFixed(decimalPlaces);
  }

  /**
   * Format currency values (from base controller)
   */
  private formatCurrency(value: number): string {
    // Ensure value is a number
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(numValue)) {
      console.warn(`Invalid value passed to formatCurrency:`, value);
      return '£0.00';
    }

    // Proper rounding to 2 decimal places to avoid floating point precision issues
    const rounded = Math.round((numValue + Number.EPSILON) * 100) / 100;

    if (rounded >= 1) {
      return `£${rounded.toFixed(2)}`;
    } else {
      const pence = Math.round(rounded * 100);
      return `${pence}p`;
    }
  }

  /**
   * Format price values (alias for formatCurrency for compatibility)
   */
  private formatPrice(value: number): string {
    return this.formatCurrency(value);
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