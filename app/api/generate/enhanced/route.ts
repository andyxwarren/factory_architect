// Enhanced Question Generation API - New endpoint with advanced features
// Runs alongside existing /api/generate for backward compatibility

import { NextRequest, NextResponse } from 'next/server';
import {
  QuestionOrchestrator,
  EnhancedQuestionRequest,
  EnhancedQuestion
} from '@/lib/orchestrator/question-orchestrator';
import { ScenarioService } from '@/lib/services/scenario.service';
import { DistractorEngine } from '@/lib/services/distractor-engine.service';
import { generateMathQuestion, getModel } from '@/lib/math-engine';
import { QuestionFormat, ScenarioTheme } from '@/lib/types/question-formats';
import { IMathModel } from '@/lib/types';
import { MODEL_STATUS_REGISTRY, ModelStatus } from '@/lib/models/model-status';

/**
 * Enhanced API request validation
 */
interface ValidatedRequest extends EnhancedQuestionRequest {
  quantity?: number; // Batch generation support
  include_explanation?: boolean;
  include_working?: boolean;
  distractor_count?: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: string;
  reason?: string;
}

/**
 * Enhanced API response
 */
interface EnhancedQuestionResponse {
  success: boolean;
  question?: EnhancedQuestion;
  questions?: EnhancedQuestion[]; // For batch requests
  metadata: {
    format: QuestionFormat;
    cognitive_load: number;
    curriculum_alignment: string[];
    difficulty: string;
    scenario_theme: string;
    distractor_strategies: string[];
    generation_time_ms: number;
    api_version: string;
    enhancement_status: string;
    format_requested?: string;
    format_used: string;
    features_active: string[];
    features_pending: string[];
  };
  context?: any;
  session?: any;
  batch_info?: {
    total_questions: number;
    avg_generation_time: number;
    success_rate: number;
  };
}

/**
 * Math engine adapter for orchestrator
 */
class MathEngineAdapter {
  async generate(model: string, params: any): Promise<any> {
    // Use existing math engine
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

// Initialize services
const mathEngine = new MathEngineAdapter();
const scenarioService = new ScenarioService();
const distractorEngine = new DistractorEngine();
const orchestrator = new QuestionOrchestrator(mathEngine, scenarioService, distractorEngine);

/**
 * POST endpoint for enhanced question generation
 */
export async function POST(req: NextRequest) {
  try {
    const body: ValidatedRequest = await req.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      // Special handling for broken models (503 Service Unavailable)
      if (validation.status === 'broken') {
        return NextResponse.json(
          {
            error: validation.error,
            status: validation.status,
            reason: validation.reason
          },
          { status: 503 }
        );
      }

      // Other validation errors (400 Bad Request)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const quantity = body.quantity || 1;

    // Generate questions
    if (quantity === 1) {
      // Single question generation
      const question = await orchestrator.generateQuestion(body);
      const endTime = Date.now();

      const response: EnhancedQuestionResponse = {
        success: true,
        question,
        metadata: {
          format: question.format,
          cognitive_load: question.cognitiveLoad,
          curriculum_alignment: question.curriculumTags,
          difficulty: question.difficulty.displayName,
          scenario_theme: question.scenario.theme,
          distractor_strategies: question.distractors.map((d: any) => d.strategy),
          generation_time_ms: endTime - startTime,
          api_version: '2.0',
          enhancement_status: question.enhancementStatus.level,
          format_requested: question.enhancementStatus.requestedFormat,
          format_used: question.enhancementStatus.actualFormat,
          features_active: question.enhancementStatus.featuresActive,
          features_pending: question.enhancementStatus.featuresPending
        },
        context: question.scenario
      };

      return NextResponse.json(response);
    } else {
      // Batch question generation
      const questions: EnhancedQuestion[] = [];
      let successCount = 0;

      for (let i = 0; i < quantity; i++) {
        try {
          const question = await orchestrator.generateQuestion(body);
          questions.push(question);
          successCount++;
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}:`, error);
          // Continue with other questions
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const response: EnhancedQuestionResponse = {
        success: successCount > 0,
        questions,
        metadata: {
          format: questions[0]?.format || QuestionFormat.DIRECT_CALCULATION,
          cognitive_load: questions[0]?.cognitiveLoad || 50,
          curriculum_alignment: questions[0]?.curriculumTags || [],
          difficulty: questions[0]?.difficulty.displayName || '4.3',
          scenario_theme: questions[0]?.scenario.theme || ScenarioTheme.SHOPPING,
          distractor_strategies: [],
          generation_time_ms: totalTime,
          enhancement_status: questions[0]?.enhancementStatus.level || 'fallback',
          format_used: questions[0]?.enhancementStatus.actualFormat || QuestionFormat.DIRECT_CALCULATION,
          features_active: questions[0]?.enhancementStatus.featuresActive || [],
          features_pending: questions[0]?.enhancementStatus.featuresPending || [],
          api_version: '2.0'
        },
        batch_info: {
          total_questions: quantity,
          avg_generation_time: totalTime / quantity,
          success_rate: successCount / quantity
        }
      };

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Enhanced question generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate enhanced question',
        details: error instanceof Error ? error.message : 'Unknown error',
        api_version: '2.0'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Enhanced Question Generation API',
    version: '2.0',
    description: 'Advanced question generation with multiple formats, rich scenarios, and pedagogical distractors',
    endpoints: {
      POST: {
        description: 'Generate enhanced questions with advanced features',
        request_body: {
          // Required
          model_id: {
            type: 'string',
            required: true,
            description: 'Mathematical model to use',
            examples: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'UNIT_RATE', 'COMPARISON']
          },

          // Difficulty (one of these)
          difficulty_level: {
            type: 'string',
            description: 'Enhanced difficulty format (X.Y)',
            examples: ['3.2', '4.1', '5.4']
          },
          year_level: {
            type: 'number',
            description: 'Legacy year level (1-6)',
            examples: [3, 4, 5]
          },

          // Optional enhancements
          format_preference: {
            type: 'string',
            description: 'Preferred question format',
            examples: ['DIRECT_CALCULATION', 'COMPARISON', 'ESTIMATION', 'VALIDATION', 'MULTI_STEP']
          },
          scenario_theme: {
            type: 'string',
            description: 'Preferred scenario theme',
            examples: ['SHOPPING', 'SCHOOL', 'SPORTS', 'COOKING', 'POCKET_MONEY']
          },
          pedagogical_focus: {
            type: 'string',
            description: 'Learning objective focus',
            examples: ['fluency', 'reasoning', 'problem_solving', 'number_sense']
          },

          // Batch and customization
          quantity: {
            type: 'number',
            description: 'Number of questions to generate (1-20)',
            default: 1
          },
          difficulty_params: {
            type: 'object',
            description: 'Custom difficulty parameters for math models'
          },

          // Session and tracking
          session_id: {
            type: 'string',
            description: 'Session identifier for tracking'
          },
          cultural_context: {
            type: 'string',
            description: 'Cultural context (default: UK)',
            default: 'UK'
          },

          // Output options
          include_explanation: {
            type: 'boolean',
            description: 'Include solution explanation',
            default: false
          },
          include_working: {
            type: 'boolean',
            description: 'Include working steps',
            default: false
          },
          distractor_count: {
            type: 'number',
            description: 'Number of wrong answer options',
            default: 3
          }
        },

        response: {
          success: 'boolean',
          question: {
            text: 'string - Question text',
            options: 'array - Answer options with distractors',
            correctIndex: 'number - Index of correct answer',
            format: 'string - Question format used',
            difficulty: 'object - Difficulty information',
            scenario: 'object - Rich scenario context',
            mathOutput: 'object - Raw math engine output'
          },
          metadata: {
            format: 'string - Question format',
            cognitive_load: 'number - Estimated cognitive difficulty (0-100)',
            curriculum_alignment: 'array - UK curriculum tags',
            difficulty: 'string - Difficulty level (X.Y format)',
            scenario_theme: 'string - Scenario theme used',
            distractor_strategies: 'array - Distractor generation strategies',
            generation_time_ms: 'number - Generation time',
            api_version: 'string - API version'
          }
        }
      }
    },

    features: [
      'Multiple question formats (8 types)',
      'Rich scenario contexts (10+ themes)',
      'Pedagogically sound distractors',
      'Enhanced difficulty progression (X.Y system)',
      'Batch question generation',
      'Session tracking support',
      'UK National Curriculum alignment',
      'Cultural context awareness',
      'Backward compatibility maintained'
    ],

    compatibility: {
      legacy_endpoint: '/api/generate',
      migration_notes: [
        'All existing requests continue to work unchanged',
        'New features available through /api/generate/enhanced',
        'Response format enhanced but maintains core structure',
        'Math engine models unchanged'
      ]
    },

    examples: {
      basic_request: {
        model_id: 'ADDITION',
        difficulty_level: '3.2'
      },
      advanced_request: {
        model_id: 'UNIT_RATE',
        difficulty_level: '5.3',
        format_preference: 'COMPARISON',
        scenario_theme: 'SHOPPING',
        pedagogical_focus: 'reasoning',
        quantity: 5
      }
    }
  });
}

/**
 * Validate enhanced API request
 */
function validateRequest(body: ValidatedRequest): ValidationResult {
  // Required fields
  if (!body.model_id) {
    return { valid: false, error: 'model_id is required' };
  }

  // Validate model exists
  const supportedModels = [
    'ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE',
    'FRACTION', 'COUNTING', 'TIME_RATE', 'CONVERSION', 'COMPARISON',
    'MULTI_STEP', 'LINEAR_EQUATION', 'UNIT_RATE',
    'COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS',
    'MIXED_MONEY_UNITS', 'MONEY_FRACTIONS', 'MONEY_SCALING',
    'SHAPE_RECOGNITION', 'SHAPE_PROPERTIES', 'ANGLE_MEASUREMENT',
    'POSITION_DIRECTION', 'AREA_PERIMETER'
  ];

  if (!supportedModels.includes(body.model_id)) {
    return {
      valid: false,
      error: `Unsupported model_id: ${body.model_id}. Supported models: ${supportedModels.join(', ')}`
    };
  }

  // Check model status - reject broken models
  const modelStatus = MODEL_STATUS_REGISTRY[body.model_id];
  if (modelStatus && modelStatus.status === ModelStatus.BROKEN) {
    return {
      valid: false,
      error: `Model ${body.model_id} is currently disabled`,
      status: 'broken',
      reason: modelStatus.knownIssues?.join(', ') || 'Model implementation issues'
    };
  }

  // Validate difficulty format
  if (body.difficulty_level) {
    const parts = body.difficulty_level.split('.');
    if (parts.length !== 2) {
      return {
        valid: false,
        error: 'difficulty_level must be in X.Y format (e.g., "3.2")'
      };
    }

    const year = parseInt(parts[0]);
    const subLevel = parseInt(parts[1]);

    if (year < 1 || year > 6 || subLevel < 1 || subLevel > 4) {
      return {
        valid: false,
        error: 'difficulty_level must be X.Y where X=1-6 and Y=1-4'
      };
    }
  } else if (body.year_level) {
    if (body.year_level < 1 || body.year_level > 6) {
      return {
        valid: false,
        error: 'year_level must be between 1 and 6'
      };
    }
  }

  // Validate quantity
  if (body.quantity && (body.quantity < 1 || body.quantity > 20)) {
    return {
      valid: false,
      error: 'quantity must be between 1 and 20'
    };
  }

  // Validate format preference
  if (body.format_preference) {
    const validFormats = Object.values(QuestionFormat);
    if (!validFormats.includes(body.format_preference)) {
      return {
        valid: false,
        error: `Invalid format_preference. Valid options: ${validFormats.join(', ')}`
      };
    }
  }

  // Validate scenario theme
  if (body.scenario_theme) {
    const validThemes = Object.values(ScenarioTheme);
    if (!validThemes.includes(body.scenario_theme)) {
      return {
        valid: false,
        error: `Invalid scenario_theme. Valid options: ${validThemes.join(', ')}`
      };
    }
  }

  return { valid: true };
}