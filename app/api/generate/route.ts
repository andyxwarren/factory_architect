import { NextRequest, NextResponse } from 'next/server';
import { generateMathQuestion, getModel } from '@/lib/math-engine';
import { StoryEngine } from '@/lib/story-engine/story.engine';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';
import { GenerateRequest, GeneratedQuestion } from '@/lib/types';
import { EnhancedDifficultySystem } from '@/lib/math-engine/difficulty-enhanced';
import { ProgressionTracker } from '@/lib/math-engine/progression-tracker';
import { SubDifficultyLevel, DifficultyProgression } from '@/lib/types-enhanced';

// Import enhanced system for redirect
import {
  QuestionOrchestrator,
  EnhancedQuestionRequest
} from '@/lib/orchestrator/question-orchestrator';
import { ScenarioService } from '@/lib/services/scenario.service';
import { DistractorEngine } from '@/lib/services/distractor-engine.service';

interface EnhancedGenerateRequest extends GenerateRequest {
  sub_level?: string; // e.g., "3.2"
  session_id?: string; // For progression tracking
  adaptive_mode?: boolean; // Enable adaptive difficulty
  confidence_mode?: boolean; // Enable confidence mode
  quantity?: number; // Number of questions to generate in batch
  scenario_theme?: string; // Theme for scenario selection
}

// Initialize enhanced system components for legacy compatibility
class MathEngineAdapter {
  async generate(model: string, params: any): Promise<any> {
    const modelInstance = getModel(model as any);
    // Always use default params for the model to ensure proper structure
    const defaultParams = modelInstance.getDefaultParams(4);
    // Merge any provided params with defaults
    const finalParams = { ...defaultParams, ...(params || {}) };
    return modelInstance.generate(finalParams);
  }

  getModel(modelId: string) {
    return getModel(modelId as any);
  }
}

const mathEngine = new MathEngineAdapter();
const scenarioService = new ScenarioService();
const distractorEngine = new DistractorEngine();
const orchestrator = new QuestionOrchestrator(mathEngine, scenarioService, distractorEngine);

export async function POST(req: NextRequest) {
  try {
    const body: EnhancedGenerateRequest = await req.json();
    const {
      model_id,
      difficulty_params,
      context_type = 'money',
      year_level = 4,
      sub_level,
      session_id,
      adaptive_mode = false,
      confidence_mode = false,
      quantity = 1,
      scenario_theme
    } = body;

    // Validate model exists
    const modelIds = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE',
                     'FRACTION', 'COUNTING', 'TIME_RATE', 'CONVERSION', 'COMPARISON',
                     'MULTI_STEP', 'LINEAR_EQUATION', 'UNIT_RATE',
                     'COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS',
                     'MIXED_MONEY_UNITS', 'MONEY_FRACTIONS', 'MONEY_SCALING',
                     'SHAPE_RECOGNITION', 'SHAPE_PROPERTIES', 'ANGLE_MEASUREMENT', 'POSITION_DIRECTION', 'AREA_PERIMETER'];
    if (!modelIds.includes(model_id)) {
      return NextResponse.json(
        { error: `Invalid model_id: ${model_id}` },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1 || quantity > 20) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Transform legacy request to enhanced format
    const enhancedRequest: EnhancedQuestionRequest = {
      model_id,
      difficulty_level: sub_level || `${year_level}.3`, // Convert to X.Y format
      format_preference: 'DIRECT_CALCULATION' as any, // Force direct calculation for legacy compatibility
      difficulty_params,
      session_id,
      cultural_context: 'UK',
      scenario_theme
    };

    const startTime = Date.now();

    // Use enhanced system for generation
    if (quantity === 1) {
      // Single question generation
      const enhancedQuestion = await orchestrator.generateQuestion(enhancedRequest);

      // Transform to legacy format for backward compatibility
      const legacyQuestion: GeneratedQuestion = {
        question: enhancedQuestion.text,
        answer: enhancedQuestion.options[enhancedQuestion.correctIndex].text,
        math_output: enhancedQuestion.mathOutput,
        context: enhancedQuestion.scenario,
        metadata: {
          model_id,
          year_level: enhancedQuestion.difficulty.year,
          sub_level: enhancedQuestion.difficulty.displayName,
          difficulty_params,
          enhanced_system_used: true,
          session_id,
          timestamp: new Date()
        },
        generation_setup: enhancedQuestion.generationSetup
      };

      return NextResponse.json(legacyQuestion);
    } else {
      // Batch question generation with retry logic
      const enhancedQuestions = [];
      let successCount = 0;
      const maxAttempts = quantity * 3; // Allow up to 3x attempts to get requested quantity
      let attempts = 0;

      while (successCount < quantity && attempts < maxAttempts) {
        try {
          const enhancedQuestion = await orchestrator.generateQuestion(enhancedRequest);
          enhancedQuestions.push(enhancedQuestion);
          successCount++;
        } catch (error) {
          console.warn(`Failed to generate question (attempt ${attempts + 1}):`, error);
          // Continue attempting to generate more questions
        }
        attempts++;
      }

      // Log final statistics
      if (successCount < quantity) {
        console.warn(`Batch generation incomplete: ${successCount}/${quantity} questions generated after ${attempts} attempts`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Transform to legacy format for backward compatibility
      const legacyQuestions: GeneratedQuestion[] = enhancedQuestions.map((eq, index) => ({
        question: eq.text,
        answer: eq.options[eq.correctIndex].text,
        math_output: eq.mathOutput,
        context: eq.scenario,
        metadata: {
          model_id,
          year_level: eq.difficulty.year,
          sub_level: eq.difficulty.displayName,
          difficulty_params,
          enhanced_system_used: true,
          session_id,
          timestamp: new Date()
        },
        generation_setup: eq.generationSetup
      }));

      const response = {
        questions: legacyQuestions,
        batch_metadata: {
          quantity: successCount,
          requested_quantity: quantity,
          success_rate: successCount / quantity,
          total_attempts: attempts,
          total_generation_time_ms: totalTime,
          average_generation_time_ms: totalTime / Math.max(successCount, 1),
          model_id,
          enhanced_system_used: true,
          enhancement_status: enhancedQuestions[0]?.enhancementStatus.level || 'fallback',
          session_id,
          timestamp: new Date()
        }
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Question Generation API',
    endpoints: {
      POST: {
        description: 'Generate a question or batch of questions',
        body: {
          model_id: 'string (required) - ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, PERCENTAGE',
          year_level: 'number (optional) - 1 to 6',
          sub_level: 'string (optional) - X.Y format (e.g., "3.2") for enhanced difficulty',
          quantity: 'number (optional) - 1 to 20, number of questions to generate',
          session_id: 'string (optional) - For progression tracking',
          adaptive_mode: 'boolean (optional) - Enable adaptive difficulty adjustments',
          confidence_mode: 'boolean (optional) - Enable confidence-based progression',
          difficulty_params: 'object (optional) - Custom difficulty parameters',
          context_type: 'string (optional) - money, measurement, etc.'
        }
      }
    }
  });
}