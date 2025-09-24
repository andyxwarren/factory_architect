// Legacy Adapter - Ensures backward compatibility with existing system
// Maps old requests to new enhanced system while maintaining identical responses

import { StoryEngine } from '@/lib/story-engine/story.engine';
import { MoneyContextGenerator } from '@/lib/story-engine/contexts/money.context';
import {
  QuestionOrchestrator,
  EnhancedQuestionRequest
} from '@/lib/orchestrator/question-orchestrator';
import { QuestionFormat } from '@/lib/types/question-formats';
import { GenerateRequest, GeneratedQuestion } from '@/lib/types';

/**
 * Adapter that maps legacy API requests to the enhanced system
 * Ensures 100% backward compatibility
 */
export class LegacyAdapter {
  private orchestrator: QuestionOrchestrator;
  private storyEngine: StoryEngine;

  constructor(orchestrator: QuestionOrchestrator) {
    this.orchestrator = orchestrator;
    this.storyEngine = new StoryEngine();
  }

  /**
   * Convert legacy request to enhanced format
   */
  convertRequest(legacyRequest: GenerateRequest): EnhancedQuestionRequest {
    return {
      model_id: legacyRequest.model_id,
      year_level: legacyRequest.year_level,
      difficulty_params: legacyRequest.difficulty_params,
      cultural_context: 'UK',
      format_preference: QuestionFormat.DIRECT_CALCULATION, // Default to existing behavior
      scenario_theme: this.inferScenarioTheme(legacyRequest.context_type)
    };
  }

  /**
   * Convert enhanced response back to legacy format
   */
  convertResponse(enhancedQuestion: any): GeneratedQuestion {
    // Extract original math output or reconstruct it
    const mathOutput = enhancedQuestion.mathOutput || this.reconstructMathOutput(enhancedQuestion);

    // Generate context using original MoneyContextGenerator
    const context = MoneyContextGenerator.generate(enhancedQuestion.mathOutput?.operation || 'ADDITION');

    // Generate question and answer using original StoryEngine
    const question = this.storyEngine.generateQuestion(mathOutput, context);
    const answer = this.storyEngine.generateAnswer(mathOutput, context);

    return {
      question,
      answer,
      math_output: mathOutput,
      context,
      metadata: {
        model_id: enhancedQuestion.mathOutput?.operation || 'UNKNOWN',
        year_level: enhancedQuestion.difficulty?.year || 4,
        sub_level: enhancedQuestion.difficulty?.displayName || '4.3',
        difficulty_params: {},
        enhanced_system_used: true,
        session_id: undefined,
        timestamp: new Date()
      }
    };
  }

  /**
   * Full legacy generation - uses enhanced system but returns legacy format
   */
  async generateLegacyQuestion(request: GenerateRequest): Promise<GeneratedQuestion> {
    try {
      // Convert request to enhanced format
      const enhancedRequest = this.convertRequest(request);

      // Generate using enhanced system
      const enhancedQuestion = await this.orchestrator.generateQuestion(enhancedRequest);

      // Convert back to legacy format
      return this.convertResponse(enhancedQuestion);

    } catch (error) {
      // Fallback to original behavior if enhanced system fails
      console.warn('Enhanced system failed, falling back to legacy generation:', error);
      return this.fallbackToLegacy(request);
    }
  }

  /**
   * Infer scenario theme from legacy context type
   */
  private inferScenarioTheme(contextType?: string): any {
    switch (contextType) {
      case 'money':
        return 'SHOPPING';
      case 'measurement':
        return 'SCHOOL';
      case 'time':
        return 'HOUSEHOLD';
      default:
        return 'SHOPPING'; // Default theme
    }
  }

  /**
   * Reconstruct math output from enhanced question data
   */
  private reconstructMathOutput(enhancedQuestion: any): any {
    const mathValues = enhancedQuestion.parameters?.mathValues || {};
    const operation = enhancedQuestion.mathOutput?.operation || 'ADDITION';

    // Reconstruct based on operation type
    switch (operation) {
      case 'ADDITION':
        return {
          operation: 'ADDITION',
          operands: this.extractOperands(mathValues, 'operand_'),
          result: mathValues.result,
          intermediate_steps: [],
          decimal_formatted: {
            operands: this.extractOperands(mathValues, 'operand_').map(String),
            result: String(mathValues.result)
          }
        };

      case 'SUBTRACTION':
        return {
          operation: 'SUBTRACTION',
          minuend: mathValues.minuend,
          subtrahend: mathValues.subtrahend,
          result: mathValues.result,
          decimal_formatted: {
            minuend: String(mathValues.minuend),
            subtrahend: String(mathValues.subtrahend),
            result: String(mathValues.result)
          }
        };

      case 'MULTIPLICATION':
        return {
          operation: 'MULTIPLICATION',
          multiplicand: mathValues.multiplicand,
          multiplier: mathValues.multiplier,
          result: mathValues.result,
          factors: [mathValues.multiplicand, mathValues.multiplier],
          decimal_formatted: {
            result: String(mathValues.result)
          }
        };

      case 'DIVISION':
        return {
          operation: 'DIVISION',
          dividend: mathValues.dividend,
          divisor: mathValues.divisor,
          quotient: mathValues.quotient,
          remainder: mathValues.remainder || 0,
          decimal_formatted: {
            quotient: String(mathValues.quotient)
          }
        };

      default:
        return {
          operation,
          result: mathValues.result || 0,
          decimal_formatted: {
            result: String(mathValues.result || 0)
          }
        };
    }
  }

  /**
   * Extract operands from math values with prefix
   */
  private extractOperands(mathValues: Record<string, number>, prefix: string): number[] {
    return Object.keys(mathValues)
      .filter(key => key.startsWith(prefix))
      .sort() // Ensure correct order
      .map(key => mathValues[key]);
  }

  /**
   * Fallback to original legacy generation
   */
  private async fallbackToLegacy(request: GenerateRequest): Promise<GeneratedQuestion> {
    // Import original generation function
    const { generateMathQuestion } = await import('@/lib/math-engine');

    const mathOutput = generateMathQuestion(
      request.model_id as any,
      request.year_level || 4,
      request.difficulty_params
    );

    const context = MoneyContextGenerator.generate(request.model_id);
    const question = this.storyEngine.generateQuestion(mathOutput, context);
    const answer = this.storyEngine.generateAnswer(mathOutput, context);

    return {
      question,
      answer,
      math_output: mathOutput,
      context,
      metadata: {
        model_id: request.model_id,
        year_level: request.year_level || 4,
        difficulty_params: request.difficulty_params,
        enhanced_system_used: false,
        timestamp: new Date()
      }
    };
  }
}

/**
 * Enhanced backward compatibility layer
 * Can be used to gradually migrate existing code
 */
export class CompatibilityLayer {
  private adapter: LegacyAdapter;

  constructor(orchestrator: QuestionOrchestrator) {
    this.adapter = new LegacyAdapter(orchestrator);
  }

  /**
   * Drop-in replacement for generateMathQuestion
   */
  async generateMathQuestion(
    modelId: string,
    yearLevel: number,
    difficultyParams?: any
  ): Promise<any> {
    const request: GenerateRequest = {
      model_id: modelId,
      year_level: yearLevel,
      difficulty_params: difficultyParams,
      context_type: 'money'
    };

    const result = await this.adapter.generateLegacyQuestion(request);
    return result.math_output;
  }

  /**
   * Drop-in replacement for StoryEngine.generateQuestion
   */
  generateQuestion(mathOutput: any, context: any): string {
    return this.adapter['storyEngine'].generateQuestion(mathOutput, context);
  }

  /**
   * Drop-in replacement for StoryEngine.generateAnswer
   */
  generateAnswer(mathOutput: any, context: any): string {
    return this.adapter['storyEngine'].generateAnswer(mathOutput, context);
  }

  /**
   * Enhanced generation with fallback
   */
  async generateWithFallback(request: GenerateRequest): Promise<GeneratedQuestion> {
    return this.adapter.generateLegacyQuestion(request);
  }
}

/**
 * Migration utility functions
 */
export class MigrationUtils {
  /**
   * Check if a request can use enhanced features
   */
  static canUseEnhanced(request: any): boolean {
    // Check if request has enhanced-specific fields
    return !!(
      request.format_preference ||
      request.scenario_theme ||
      request.pedagogical_focus ||
      request.difficulty_level?.includes('.')
    );
  }

  /**
   * Convert old difficulty params to enhanced format
   */
  static upgradeRequest(oldRequest: GenerateRequest): EnhancedQuestionRequest {
    return {
      model_id: oldRequest.model_id,
      year_level: oldRequest.year_level,
      difficulty_params: oldRequest.difficulty_params,
      cultural_context: 'UK'
    };
  }

  /**
   * Test compatibility between old and new systems
   */
  static async testCompatibility(
    request: GenerateRequest,
    legacyFunction: Function,
    enhancedAdapter: LegacyAdapter
  ): Promise<{
    legacy: GeneratedQuestion;
    enhanced: GeneratedQuestion;
    compatible: boolean;
    differences: string[];
  }> {
    const legacy = await legacyFunction(request);
    const enhanced = await enhancedAdapter.generateLegacyQuestion(request);

    const differences: string[] = [];

    // Compare key fields
    if (legacy.question !== enhanced.question) {
      differences.push('Question text differs');
    }

    if (legacy.answer !== enhanced.answer) {
      differences.push('Answer differs');
    }

    if (legacy.math_output.operation !== enhanced.math_output.operation) {
      differences.push('Math operation differs');
    }

    if (legacy.math_output.result !== enhanced.math_output.result) {
      differences.push('Math result differs');
    }

    return {
      legacy,
      enhanced,
      compatible: differences.length === 0,
      differences
    };
  }
}

/**
 * Feature flag system for gradual rollout
 */
export class FeatureFlags {
  private static flags: Map<string, boolean> = new Map([
    ['enhanced_distractors', false],
    ['rich_scenarios', false],
    ['comparison_questions', false],
    ['enhanced_difficulty', false],
    ['full_enhanced_system', false]
  ]);

  static isEnabled(flag: string): boolean {
    return this.flags.get(flag) || false;
  }

  static enable(flag: string): void {
    this.flags.set(flag, true);
  }

  static disable(flag: string): void {
    this.flags.set(flag, false);
  }

  static getAll(): Record<string, boolean> {
    return Object.fromEntries(this.flags);
  }

  /**
   * Determine which system to use based on flags and request
   */
  static shouldUseEnhanced(request: any): boolean {
    // Always use enhanced if explicitly requested
    if (MigrationUtils.canUseEnhanced(request)) {
      return true;
    }

    // Use feature flags for gradual rollout
    if (this.isEnabled('full_enhanced_system')) {
      return true;
    }

    // Specific feature flags
    if (request.format_preference && this.isEnabled('comparison_questions')) {
      return true;
    }

    if (request.difficulty_level?.includes('.') && this.isEnabled('enhanced_difficulty')) {
      return true;
    }

    return false;
  }
}