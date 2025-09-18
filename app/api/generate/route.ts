import { NextRequest, NextResponse } from 'next/server';
import { generateMathQuestion, getModel } from '@/lib/math-engine';
import { StoryEngine } from '@/lib/story-engine/story.engine';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';
import { GenerateRequest, GeneratedQuestion } from '@/lib/types';
import { EnhancedDifficultySystem } from '@/lib/math-engine/difficulty-enhanced';
import { ProgressionTracker } from '@/lib/math-engine/progression-tracker';
import { SubDifficultyLevel, DifficultyProgression } from '@/lib/types-enhanced';

interface EnhancedGenerateRequest extends GenerateRequest {
  sub_level?: string; // e.g., "3.2"
  session_id?: string; // For progression tracking
  adaptive_mode?: boolean; // Enable adaptive difficulty
  confidence_mode?: boolean; // Enable confidence mode
  quantity?: number; // Number of questions to generate in batch
}

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
      quantity = 1
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

    // Determine difficulty level to use
    let actualLevel: SubDifficultyLevel;
    let usedEnhancedSystem = false;
    let actualParams: any = difficulty_params;

    // Setup session if provided
    if (session_id) {
      const session = ProgressionTracker.getSession(session_id);
      if (adaptive_mode) session.adaptiveMode = true;
      if (confidence_mode) session.confidenceMode = true;
    }

    if (sub_level) {
      // Use enhanced difficulty system with sub-levels
      try {
        actualLevel = EnhancedDifficultySystem.parseLevel(sub_level);
        
        // Check if enhanced system supports this model
        const enhancedModels = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 'FRACTION'];
        if (enhancedModels.includes(model_id)) {
          actualParams = EnhancedDifficultySystem.getSubLevelParams(model_id, actualLevel);
          usedEnhancedSystem = true;
        } else {
          // Fall back to traditional system for unsupported models
          actualLevel = EnhancedDifficultySystem.createLevel(Math.floor(parseFloat(sub_level)), 3);
        }
      } catch (error) {
        return NextResponse.json(
          { error: `Invalid sub_level format: ${sub_level}. Use format "X.Y" where X=1-6, Y=1-4` },
          { status: 400 }
        );
      }
    } else if (session_id && adaptive_mode) {
      // Use adaptive difficulty recommendation
      const recommendedLevel = ProgressionTracker.getRecommendedLevel(session_id, model_id);
      actualLevel = recommendedLevel;
      
      const enhancedModels = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 'FRACTION'];
      if (enhancedModels.includes(model_id)) {
        actualParams = EnhancedDifficultySystem.getSubLevelParams(model_id, actualLevel);
        usedEnhancedSystem = true;
      }
    } else {
      // Use traditional integer year level
      actualLevel = EnhancedDifficultySystem.createLevel(year_level, 3); // Default to X.3 (standard level)
    }

    // Generate questions (batch support)
    const questions: GeneratedQuestion[] = [];
    const startTime = Date.now();
    const storyEngine = new StoryEngine();

    for (let i = 0; i < quantity; i++) {
      // Generate math output
      const mathOutput = generateMathQuestion(
        model_id as any,
        actualLevel.year,
        actualParams || getModel(model_id as any).getDefaultParams(actualLevel.year)
      );

      // Generate context based on type
      let context;
      switch (context_type) {
        case 'money':
          context = MoneyContextGenerator.generate(model_id);
          break;
        default:
          context = MoneyContextGenerator.generate(model_id);
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
          model_id,
          year_level: actualLevel.year,
          sub_level: actualLevel.displayName,
          difficulty_params: actualParams,
          enhanced_system_used: usedEnhancedSystem,
          session_id,
          timestamp: new Date(),
          question_index: i + 1
        }
      };

      questions.push(generatedQuestion);

      // Track attempt in session if provided
      if (session_id) {
        ProgressionTracker.recordAttempt(session_id, `q_${i+1}_${Date.now()}`, model_id, actualLevel, true, 0);
      }
    }

    const endTime = Date.now();

    // Return single question for backward compatibility, or batch response
    if (quantity === 1) {
      return NextResponse.json(questions[0]);
    } else {
      // Return batch response with statistics
      const response = {
        questions,
        batch_metadata: {
          quantity,
          total_generation_time_ms: endTime - startTime,
          average_generation_time_ms: (endTime - startTime) / quantity,
          model_id,
          year_level: actualLevel.year,
          sub_level: actualLevel.displayName,
          enhanced_system_used: usedEnhancedSystem,
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