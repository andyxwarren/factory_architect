import { NextRequest, NextResponse } from 'next/server';
import { generateMathQuestion, getModel } from '@/lib/math-engine';
import { StoryEngine } from '@/lib/story-engine/story.engine';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';
import { GenerateRequest, GeneratedQuestion } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { model_id, difficulty_params, context_type = 'money', year_level = 4 } = body;

    // Validate model exists
    const modelIds = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 
                     'FRACTION', 'COUNTING', 'TIME_RATE', 'CONVERSION', 'COMPARISON',
                     'MULTI_STEP', 'LINEAR_EQUATION', 'UNIT_RATE',
                     'COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS',
                     'MIXED_MONEY_UNITS', 'MONEY_FRACTIONS', 'MONEY_SCALING'];
    if (!modelIds.includes(model_id)) {
      return NextResponse.json(
        { error: `Invalid model_id: ${model_id}` },
        { status: 400 }
      );
    }

    // Generate math output
    const mathOutput = generateMathQuestion(
      model_id as any,
      year_level,
      difficulty_params
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
    const storyEngine = new StoryEngine();
    const question = storyEngine.generateQuestion(mathOutput, context);
    const answer = storyEngine.generateAnswer(mathOutput, context);

    const response: GeneratedQuestion = {
      question,
      answer,
      math_output: mathOutput,
      context,
      metadata: {
        model_id,
        year_level,
        difficulty_params: difficulty_params || getModel(model_id as any).getDefaultParams(year_level),
        timestamp: new Date()
      }
    };

    return NextResponse.json(response);
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
        description: 'Generate a question',
        body: {
          model_id: 'string (required) - ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, PERCENTAGE',
          year_level: 'number (optional) - 1 to 6',
          difficulty_params: 'object (optional) - Custom difficulty parameters',
          context_type: 'string (optional) - money, measurement, etc.'
        }
      }
    }
  });
}