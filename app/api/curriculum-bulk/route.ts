import { NextRequest, NextResponse } from 'next/server';
import { GeneratedQuestion } from '@/lib/types';
import { curriculumParser, CurriculumFilter } from '@/lib/curriculum/curriculum-parser';
import { curriculumModelMapper } from '@/lib/curriculum/curriculum-model-mapping';
import { generateMathQuestion, getModel } from '@/lib/math-engine';
import { StoryEngine } from '@/lib/story-engine/story.engine';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';
import { MODEL_STATUS_REGISTRY, ModelStatus } from '@/lib/models/model-status';

const ENHANCED_MODELS = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 'FRACTION'];
const MAX_COMBINATIONS_PER_REQUEST = 500;
const MAX_QUESTIONS_PER_COMBINATION = 10;

interface BulkGenerationRequest {
  strands: string[];
  substrands?: string[];
  years: number[];
  subLevels: number[];
  questionsPerCombination: number;
  useEnhancedDifficulty?: boolean;
  contextType?: string;
  sessionId?: string;
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
      sessionId
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
    const storyEngine = new StoryEngine();

    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];
      const combinationStartTime = Date.now();

      try {
        const questions: GeneratedQuestion[] = [];

        // Generate the specified number of questions for this combination
        for (let q = 0; q < questionsPerCombination; q++) {
          try {
            // Determine parameters for generation
            let actualParams: any;
            let usedEnhancedSystem = false;

            if (useEnhancedDifficulty && ENHANCED_MODELS.includes(combination.primaryModel)) {
              // Use enhanced difficulty system
              const { EnhancedDifficultySystem } = await import('@/lib/math-engine/difficulty-enhanced');
              const subLevelObj = EnhancedDifficultySystem.createLevel(combination.year, combination.subLevel);
              actualParams = EnhancedDifficultySystem.getSubLevelParams(combination.primaryModel, subLevelObj);
              usedEnhancedSystem = true;
            } else {
              // Use traditional system
              const model = getModel(combination.primaryModel);
              actualParams = model.getDefaultParams(combination.year);
            }

            // Generate math output
            const mathOutput = generateMathQuestion(
              combination.primaryModel as any,
              combination.year,
              actualParams
            );

            // Generate context
            let context;
            switch (contextType) {
              case 'money':
                context = MoneyContextGenerator.generate(combination.primaryModel);
                break;
              default:
                context = MoneyContextGenerator.generate(combination.primaryModel);
            }

            // Generate question and answer using Story Engine
            const question = storyEngine.generateQuestion(mathOutput, context);
            const answer = storyEngine.generateAnswer(mathOutput, context);

            const generatedQuestion: GeneratedQuestion = {
              question,
              answer,
              math_output: mathOutput,
              context,
              metadata: {
                model_id: combination.primaryModel,
                year_level: combination.year,
                sub_level: `${combination.year}.${combination.subLevel}`,
                difficulty_params: actualParams,
                enhanced_system_used: usedEnhancedSystem,
                session_id: sessionId,
                timestamp: new Date()
              }
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
          sessionId: 'string (optional) - Session ID for tracking'
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