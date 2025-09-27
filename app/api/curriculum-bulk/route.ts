import { NextRequest, NextResponse } from 'next/server';
import { GeneratedQuestion, GenerationSetup, IMathModel } from '@/lib/types';
import { curriculumParser, CurriculumFilter } from '@/lib/curriculum/curriculum-parser';
import { curriculumModelMapper } from '@/lib/curriculum/curriculum-model-mapping';
import { getModel } from '@/lib/math-engine';
import { MODEL_STATUS_REGISTRY, ModelStatus } from '@/lib/models/model-status';
import { QuestionOrchestrator, EnhancedQuestionRequest } from '@/lib/orchestrator/question-orchestrator';
import { ScenarioService } from '@/lib/services/scenario.service';
import { DistractorEngine } from '@/lib/services/distractor-engine.service';
import { QuestionFormat, ScenarioTheme } from '@/lib/types/question-formats';

const ENHANCED_MODELS = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 'FRACTION'];
const MAX_COMBINATIONS_PER_REQUEST = 500;
const MAX_QUESTIONS_PER_COMBINATION = 10;

// Math engine adapter for orchestrator
class MathEngineAdapter {
  async generate(model: string, params: any): Promise<any> {
    const modelInstance = getModel(model as any);

    // Ensure params have all required properties by merging with defaults
    const defaultParams = modelInstance.getDefaultParams(4);
    const mergedParams = params ? { ...defaultParams, ...params } : defaultParams;

    return modelInstance.generate(mergedParams);
  }

  getModel(modelId: string): IMathModel<any, any> {
    return getModel(modelId as any);
  }
}

// Format distribution weights based on curriculum requirements
const FORMAT_WEIGHTS = {
  [QuestionFormat.DIRECT_CALCULATION]: 0.30,
  [QuestionFormat.COMPARISON]: 0.15,
  [QuestionFormat.ESTIMATION]: 0.15,
  [QuestionFormat.VALIDATION]: 0.10,
  [QuestionFormat.MULTI_STEP]: 0.10,
  [QuestionFormat.MISSING_VALUE]: 0.10,
  [QuestionFormat.ORDERING]: 0.05,
  [QuestionFormat.PATTERN_RECOGNITION]: 0.05
};

// Fine-grained format compatibility matrix for each model
const MODEL_FORMAT_COMPATIBILITY: Record<string, QuestionFormat[]> = {
  // Basic arithmetic - focus on calculation and word problems
  'ADDITION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.COMPARISON
  ],
  'SUBTRACTION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.COMPARISON
  ],
  'MULTIPLICATION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.COMPARISON,
    QuestionFormat.PATTERN_RECOGNITION
  ],
  'DIVISION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.VALIDATION
  ],

  // Advanced arithmetic - can use estimation and validation
  'PERCENTAGE': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.ESTIMATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.VALIDATION,
    QuestionFormat.MULTI_STEP
  ],
  'FRACTION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.ORDERING,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.VALIDATION
  ],

  // Complex models - full range of formats
  'MULTI_STEP': [
    QuestionFormat.MULTI_STEP,
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.VALIDATION
  ],
  'LINEAR_EQUATION': [
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.PATTERN_RECOGNITION,
    QuestionFormat.DIRECT_CALCULATION
  ],
  'COMPARISON': [
    QuestionFormat.COMPARISON,
    QuestionFormat.ORDERING,
    QuestionFormat.VALIDATION
  ],

  // Measurement and conversion
  'CONVERSION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.ESTIMATION,
    QuestionFormat.VALIDATION
  ],
  'TIME_RATE': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.COMPARISON
  ],
  'UNIT_RATE': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP
  ],

  // Counting and patterns
  'COUNTING': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.PATTERN_RECOGNITION,
    QuestionFormat.ORDERING
  ],

  // Money-specific models
  'COIN_RECOGNITION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.ORDERING,
    QuestionFormat.COMPARISON
  ],
  'CHANGE_CALCULATION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE
  ],
  'MONEY_COMBINATIONS': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.PATTERN_RECOGNITION,
    QuestionFormat.VALIDATION
  ],
  'MIXED_MONEY_UNITS': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP
  ],
  'MONEY_FRACTIONS': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MISSING_VALUE
  ],
  'MONEY_SCALING': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.PATTERN_RECOGNITION
  ],

  // Geometry models
  'SHAPE_RECOGNITION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.ORDERING
  ],
  'SHAPE_PROPERTIES': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.VALIDATION
  ],
  'ANGLE_MEASUREMENT': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.ESTIMATION
  ],
  'POSITION_DIRECTION': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.PATTERN_RECOGNITION
  ],
  'AREA_PERIMETER': [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.COMPARISON,
    QuestionFormat.MISSING_VALUE
  ]
};

// Difficulty-based format restrictions
const DIFFICULTY_FORMAT_LIMITS: Record<number, QuestionFormat[]> = {
  1: [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON
  ],
  2: [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP
  ],
  3: [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE
  ],
  4: [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.ESTIMATION,
    QuestionFormat.ORDERING
  ],
  5: [
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.ESTIMATION,
    QuestionFormat.ORDERING,
    QuestionFormat.VALIDATION
  ],
  6: [
    // Year 6 can use all formats
    QuestionFormat.DIRECT_CALCULATION,
    QuestionFormat.COMPARISON,
    QuestionFormat.MULTI_STEP,
    QuestionFormat.MISSING_VALUE,
    QuestionFormat.ESTIMATION,
    QuestionFormat.ORDERING,
    QuestionFormat.VALIDATION,
    QuestionFormat.PATTERN_RECOGNITION
  ]
};

// Theme variety for different contexts
const AVAILABLE_THEMES = [
  ScenarioTheme.SHOPPING,
  ScenarioTheme.SCHOOL,
  ScenarioTheme.SPORTS,
  ScenarioTheme.COOKING,
  ScenarioTheme.POCKET_MONEY,
  ScenarioTheme.NATURE
];

// Map curriculum substrands to appropriate formats
function getPreferredFormats(substrand: string): QuestionFormat[] {
  const formatMap: Record<string, QuestionFormat[]> = {
    'estimate, use inverses and check': [QuestionFormat.ESTIMATION, QuestionFormat.VALIDATION],
    'compare and order decimals': [QuestionFormat.COMPARISON, QuestionFormat.ORDERING],
    'solve problems': [QuestionFormat.MULTI_STEP, QuestionFormat.MISSING_VALUE],
    'add / subtract mentally': [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.ESTIMATION],
    'multiply / divide mentally': [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.VALIDATION],
    'comparing and ordering fractions': [QuestionFormat.COMPARISON, QuestionFormat.ORDERING]
  };

  return formatMap[substrand] || [QuestionFormat.DIRECT_CALCULATION];
}

// Select format based on index and preferences - with enhanced intelligence
function selectFormat(
  questionIndex: number,
  preferredFormats: QuestionFormat[],
  formatVariety: boolean,
  modelId?: string,
  yearLevel?: number
): QuestionFormat {
  // No variety requested - use simplest format
  if (!formatVariety) {
    return QuestionFormat.DIRECT_CALCULATION;
  }

  // User has specific preferences - respect them but validate
  if (preferredFormats.length > 0) {
    const selectedFormat = preferredFormats[questionIndex % preferredFormats.length];

    // Validate against year level restrictions if provided
    if (yearLevel && DIFFICULTY_FORMAT_LIMITS[yearLevel]) {
      const allowedFormats = DIFFICULTY_FORMAT_LIMITS[yearLevel];
      if (!allowedFormats.includes(selectedFormat)) {
        // Fall back to first allowed format
        return allowedFormats[0];
      }
    }

    return selectedFormat;
  }

  // Get compatible formats for the model
  let compatibleFormats: QuestionFormat[] = [];

  if (modelId && MODEL_FORMAT_COMPATIBILITY[modelId]) {
    compatibleFormats = MODEL_FORMAT_COMPATIBILITY[modelId];
  } else {
    // Unknown model - use safe defaults
    compatibleFormats = [
      QuestionFormat.DIRECT_CALCULATION,
      QuestionFormat.MULTI_STEP,
      QuestionFormat.COMPARISON
    ];
  }

  // Apply year level restrictions if provided
  if (yearLevel && DIFFICULTY_FORMAT_LIMITS[yearLevel]) {
    const yearFormats = DIFFICULTY_FORMAT_LIMITS[yearLevel];
    // Intersection of compatible and year-appropriate formats
    compatibleFormats = compatibleFormats.filter(f => yearFormats.includes(f));

    // Ensure we have at least one format
    if (compatibleFormats.length === 0) {
      compatibleFormats = [QuestionFormat.DIRECT_CALCULATION];
    }
  }

  // Select from compatible formats using rotation
  return compatibleFormats[questionIndex % compatibleFormats.length];
}

// Select theme for variety
function selectTheme(
  questionIndex: number,
  preferredThemes: ScenarioTheme[],
  themeVariety: boolean
): ScenarioTheme {
  if (!themeVariety) {
    return ScenarioTheme.SHOPPING;
  }

  const themes = preferredThemes.length > 0 ? preferredThemes : AVAILABLE_THEMES;
  return themes[questionIndex % themes.length];
}


interface BulkGenerationRequest {
  strands: string[];
  substrands?: string[];
  years: number[];
  subLevels: number[];
  questionsPerCombination: number;
  useEnhancedDifficulty?: boolean;
  contextType?: string;
  sessionId?: string;
  // Enhanced system options
  useEnhancedGeneration?: boolean;
  formatVariety?: boolean;
  themeVariety?: boolean;
  preferredFormats?: QuestionFormat[];
  preferredThemes?: ScenarioTheme[];
}

interface CombinationRequest {
  strand: string;
  substrand: string;
  year: number;
  subLevel: number;
  primaryModel: string;
  suggestedModels: string[];
  curriculumFilter: CurriculumFilter;
}

interface CombinationResult {
  strand: string;
  substrand: string;
  year: number;
  subLevel: number;
  primaryModel: string;
  suggestedModels: string[];
  status: 'completed' | 'error';
  questionsGenerated: number;
  questions?: GeneratedQuestion[];
  error?: string;
  generationTimeMs?: number;
}

interface BulkGenerationResponse {
  totalCombinations: number;
  completedCombinations: number;
  totalQuestions: number;
  totalGenerationTimeMs: number;
  averageTimePerCombination: number;
  averageTimePerQuestion: number;
  results: CombinationResult[];
  errors: string[];
  metadata: {
    request: BulkGenerationRequest;
    timestamp: Date;
    configuration: {
      enhancedModelsUsed: string[];
      modelsSkipped: string[];
      combinationsSkipped: number;
    };
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: BulkGenerationRequest = await req.json();
    const {
      strands,
      substrands,
      years,
      subLevels,
      questionsPerCombination,
      useEnhancedDifficulty = true,
      contextType = 'money',
      sessionId,
      // Enhanced generation options
      useEnhancedGeneration = true,
      formatVariety = true,
      themeVariety = true,
      preferredFormats = [],
      preferredThemes = []
    } = body;

    // Validation
    if (!strands || strands.length === 0) {
      return NextResponse.json(
        { error: 'At least one strand must be provided' },
        { status: 400 }
      );
    }

    if (!years || years.length === 0) {
      return NextResponse.json(
        { error: 'At least one year level must be provided' },
        { status: 400 }
      );
    }

    if (!subLevels || subLevels.length === 0) {
      return NextResponse.json(
        { error: 'At least one sub-level must be provided' },
        { status: 400 }
      );
    }

    if (questionsPerCombination < 1 || questionsPerCombination > MAX_QUESTIONS_PER_COMBINATION) {
      return NextResponse.json(
        { error: `Questions per combination must be between 1 and ${MAX_QUESTIONS_PER_COMBINATION}` },
        { status: 400 }
      );
    }

    // Build combinations to generate
    const combinations: CombinationRequest[] = [];
    const skippedCombinations: string[] = [];
    const modelsUsed = new Set<string>();
    const modelsSkipped = new Set<string>();

    for (const strand of strands) {
      // Get substrands for this strand
      const strandSubstrands = substrands || curriculumParser.getSubstrands(strand);

      for (const substrand of strandSubstrands) {
        // Check if this substrand exists for this strand
        const availableSubstrands = curriculumParser.getSubstrands(strand);
        if (!availableSubstrands.includes(substrand)) {
          skippedCombinations.push(`${strand} → ${substrand} (substrand not found)`);
          continue;
        }

        // Get available years for this strand/substrand
        const availableYears = curriculumParser.getAvailableYears(strand, substrand);

        for (const year of years) {
          if (!availableYears.includes(year)) {
            skippedCombinations.push(`${strand} → ${substrand} → Year ${year} (year not available)`);
            continue;
          }

          for (const subLevel of subLevels) {
            // Get curriculum description
            const curriculumFilter = curriculumParser.getCurriculumDescription(strand, substrand, year);

            if (!curriculumFilter) {
              skippedCombinations.push(`${strand} → ${substrand} → Year ${year}.${subLevel} (no curriculum description)`);
              continue;
            }

            // Get suggested models
            const suggestedModels = curriculumModelMapper.getSuggestedModels(curriculumFilter);
            const primaryModel = curriculumModelMapper.getPrimaryModel(curriculumFilter);

            if (!primaryModel || suggestedModels.length === 0) {
              skippedCombinations.push(`${strand} → ${substrand} → Year ${year}.${subLevel} (no suitable models)`);
              continue;
            }

            // Check if model is available and working
            const modelInfo = MODEL_STATUS_REGISTRY[primaryModel];
            if (!modelInfo) {
              skippedCombinations.push(`${strand} → ${substrand} → Year ${year}.${subLevel} (model ${primaryModel} not found)`);
              modelsSkipped.add(primaryModel);
              continue;
            }

            if (modelInfo.status === ModelStatus.BROKEN) {
              skippedCombinations.push(`${strand} → ${substrand} → Year ${year}.${subLevel} (model ${primaryModel} is broken)`);
              modelsSkipped.add(primaryModel);
              continue;
            }

            if (!modelInfo.supportedYears.includes(year)) {
              skippedCombinations.push(`${strand} → ${substrand} → Year ${year}.${subLevel} (model ${primaryModel} doesn't support year ${year})`);
              continue;
            }

            modelsUsed.add(primaryModel);
            combinations.push({
              strand,
              substrand,
              year,
              subLevel,
              primaryModel,
              suggestedModels,
              curriculumFilter
            });
          }
        }
      }
    }

    // Check if we have too many combinations
    if (combinations.length > MAX_COMBINATIONS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Too many combinations requested: ${combinations.length}. Maximum allowed: ${MAX_COMBINATIONS_PER_REQUEST}`,
          estimatedCombinations: combinations.length,
          maxAllowed: MAX_COMBINATIONS_PER_REQUEST
        },
        { status: 400 }
      );
    }

    if (combinations.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid combinations found',
          skippedCombinations,
          totalSkipped: skippedCombinations.length
        },
        { status: 400 }
      );
    }

    // Generate questions for each combination
    const results: CombinationResult[] = [];
    const errors: string[] = [];
    let totalQuestions = 0;

    // Initialize enhanced generation system (always required now)
    const mathEngine = new MathEngineAdapter();
    const scenarioService = new ScenarioService();
    const distractorEngine = new DistractorEngine();
    const orchestrator = new QuestionOrchestrator(mathEngine, scenarioService, distractorEngine);

    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];
      const combinationStartTime = Date.now();

      try {
        const questions: GeneratedQuestion[] = [];

        // Generate the specified number of questions for this combination
        for (let q = 0; q < questionsPerCombination; q++) {
          try {
            let generatedQuestion: GeneratedQuestion;

            // Always use enhanced generation system
            if (!orchestrator) {
              throw new Error('Enhanced generation system not initialized');
            }

            // Determine preferred formats based on curriculum substrand
            const curricularFormats = getPreferredFormats(combination.substrand);
            const availableFormats = preferredFormats.length > 0 ? preferredFormats : curricularFormats;

            // Select format and theme for variety
            const selectedFormat = selectFormat(q, availableFormats, formatVariety, combination.primaryModel, combination.year);
            const selectedTheme = selectTheme(q, preferredThemes, themeVariety);

            // Create enhanced question request
            const enhancedRequest: EnhancedQuestionRequest = {
              model_id: combination.primaryModel,
              difficulty_level: `${combination.year}.${combination.subLevel}`,
              format_preference: selectedFormat,
              scenario_theme: selectedTheme,
              pedagogical_focus: combination.substrand,
              session_id: sessionId
            };

            const enhancedQuestion = await orchestrator.generateQuestion(enhancedRequest);

            // Create enhanced generation setup with bulk API specific information
            const enhancedGenerationSetup: GenerationSetup = {
              ...enhancedQuestion.generationSetup!,
              // Update with bulk API specific settings
              format_weights: FORMAT_WEIGHTS,
              theme_variety: themeVariety,
              format_variety: formatVariety,
              scenario_selection_method: themeVariety ? 'rotation' : 'fixed'
            };

            // Adapt to response format
            generatedQuestion = {
              question: enhancedQuestion.text,
              answer: enhancedQuestion.options[enhancedQuestion.correctIndex].text,
              math_output: enhancedQuestion.mathOutput,
              context: enhancedQuestion.scenario,
              metadata: {
                model_id: combination.primaryModel,
                year_level: combination.year,
                sub_level: `${combination.year}.${combination.subLevel}`,
                difficulty_params: enhancedQuestion.difficulty,
                enhanced_system_used: true,
                session_id: sessionId,
                timestamp: new Date()
              },
              generation_setup: enhancedGenerationSetup
            };

            questions.push(generatedQuestion);

          } catch (questionError) {
            const errorMsg = questionError instanceof Error ? questionError.message : 'Unknown error generating question';
            console.error(`Error generating question ${q + 1} for combination ${i + 1}:`, errorMsg);
            // Continue with next question instead of failing the entire combination
          }
        }

        const combinationEndTime = Date.now();
        const generationTimeMs = combinationEndTime - combinationStartTime;

        if (questions.length > 0) {
          results.push({
            strand: combination.strand,
            substrand: combination.substrand,
            year: combination.year,
            subLevel: combination.subLevel,
            primaryModel: combination.primaryModel,
            suggestedModels: combination.suggestedModels,
            status: 'completed',
            questionsGenerated: questions.length,
            questions,
            generationTimeMs
          });
          totalQuestions += questions.length;
        } else {
          const errorMsg = `Failed to generate any questions for ${combination.strand} → ${combination.substrand} → Year ${combination.year}.${combination.subLevel}`;
          results.push({
            strand: combination.strand,
            substrand: combination.substrand,
            year: combination.year,
            subLevel: combination.subLevel,
            primaryModel: combination.primaryModel,
            suggestedModels: combination.suggestedModels,
            status: 'error',
            questionsGenerated: 0,
            error: errorMsg,
            generationTimeMs
          });
          errors.push(errorMsg);
        }

      } catch (combinationError) {
        const errorMsg = combinationError instanceof Error ? combinationError.message : 'Unknown error';
        const errorDetail = `${combination.strand} → ${combination.substrand} → Year ${combination.year}.${combination.subLevel}: ${errorMsg}`;

        results.push({
          strand: combination.strand,
          substrand: combination.substrand,
          year: combination.year,
          subLevel: combination.subLevel,
          primaryModel: combination.primaryModel,
          suggestedModels: combination.suggestedModels,
          status: 'error',
          questionsGenerated: 0,
          error: errorMsg,
          generationTimeMs: Date.now() - combinationStartTime
        });
        errors.push(errorDetail);
      }

      // Add a small delay to prevent overwhelming the system
      if (i < combinations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const endTime = Date.now();
    const totalGenerationTimeMs = endTime - startTime;
    const completedCombinations = results.filter(r => r.status === 'completed').length;

    const response: BulkGenerationResponse = {
      totalCombinations: combinations.length,
      completedCombinations,
      totalQuestions,
      totalGenerationTimeMs,
      averageTimePerCombination: completedCombinations > 0 ? totalGenerationTimeMs / completedCombinations : 0,
      averageTimePerQuestion: totalQuestions > 0 ? totalGenerationTimeMs / totalQuestions : 0,
      results,
      errors,
      metadata: {
        request: body,
        timestamp: new Date(),
        configuration: {
          enhancedModelsUsed: Array.from(modelsUsed).filter(model => ENHANCED_MODELS.includes(model)),
          modelsSkipped: Array.from(modelsSkipped),
          combinationsSkipped: skippedCombinations.length
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in bulk generation:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate bulk questions',
        details: error instanceof Error ? error.message : 'Unknown error',
        totalGenerationTimeMs: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Curriculum Bulk Generation API',
    endpoints: {
      POST: {
        description: 'Generate questions for multiple curriculum combinations',
        maxCombinations: MAX_COMBINATIONS_PER_REQUEST,
        maxQuestionsPerCombination: MAX_QUESTIONS_PER_COMBINATION,
        body: {
          strands: 'string[] (required) - Curriculum strands to generate for',
          substrands: 'string[] (optional) - Specific substrands, defaults to all for selected strands',
          years: 'number[] (required) - Year levels to generate for (1-6)',
          subLevels: 'number[] (required) - Sub-levels to generate for (1-4)',
          questionsPerCombination: 'number (required) - Questions to generate per combination (1-10)',
          useEnhancedDifficulty: 'boolean (optional) - Use enhanced difficulty system where available',
          contextType: 'string (optional) - Context type for questions (default: money)',
          sessionId: 'string (optional) - Session ID for tracking',
          useEnhancedGeneration: 'boolean (optional) - [DEPRECATED] Enhanced system is now always used (default: true)',
          formatVariety: 'boolean (optional) - Enable question format variety (default: true)',
          themeVariety: 'boolean (optional) - Enable scenario theme variety (default: true)',
          preferredFormats: 'string[] (optional) - Preferred question formats to cycle through',
          preferredThemes: 'string[] (optional) - Preferred scenario themes to cycle through'
        },
        example: {
          strands: ['Number and place value'],
          years: [1, 2, 3],
          subLevels: [2, 3],
          questionsPerCombination: 2,
          useEnhancedDifficulty: true
        }
      }
    },
    limits: {
      maxCombinationsPerRequest: MAX_COMBINATIONS_PER_REQUEST,
      maxQuestionsPerCombination: MAX_QUESTIONS_PER_COMBINATION
    }
  });
}