/**
 * Supabase-Powered Question Orchestrator
 *
 * Database-first orchestrator that:
 * 1. Fetches difficulty parameters from Supabase
 * 2. Fetches curated mappings from database
 * 3. Generates questions using existing controllers
 * 4. Saves generated questions to database
 *
 * Replaces hardcoded configuration with database-driven approach.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { QuestionOrchestrator, EnhancedQuestionRequest } from './question-orchestrator';
import type { EnhancedQuestion } from '@/lib/types/question-formats';
import type { DifficultyParameter, CuratedMapping, GeneratedQuestion } from '@/lib/supabase/types';
import { mathModels, getModel } from '@/lib/math-engine';
import { ScenarioService } from '@/lib/services/scenario.service';
import { DistractorEngine as DistractorEngineClass } from '@/lib/services/distractor-engine.service';
import type { MathEngine } from '@/lib/controllers/base-question.controller';

export interface SupabaseQuestionRequest extends EnhancedQuestionRequest {
  saveToDatabase?: boolean; // Whether to save generated question to DB
  autoApprove?: boolean; // Auto-approve question (admin only)
}

export interface SupabaseQuestionResponse extends EnhancedQuestion {
  questionId?: string; // UUID of saved question in database
  savedToDatabase?: boolean;
}

export class QuestionOrchestratorSupabase extends QuestionOrchestrator {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    // Initialize dependencies for parent orchestrator
    // Create MathEngine wrapper that conforms to the interface
    const mathEngine: MathEngine = {
      generate: async (model: string, params: any) => {
        const mathModel = getModel(model as any);
        return mathModel.generate(params);
      },
      getModel: (modelId: string) => {
        return getModel(modelId as any);
      }
    };

    const scenarioService = new ScenarioService();
    const distractorEngine = new DistractorEngineClass();

    super(mathEngine, scenarioService, distractorEngine);
    this.supabase = supabase;
  }

  /**
   * Generate question with database-driven configuration
   */
  async generateQuestion(request: SupabaseQuestionRequest): Promise<SupabaseQuestionResponse> {
    const startTime = Date.now();

    // 1. Fetch difficulty parameters from database
    const difficultyParams = await this.fetchDifficultyParameters(
      request.model_id,
      request.difficulty_level || this.getDefaultDifficultyLevel(request.year_level)
    );

    if (!difficultyParams) {
      throw new Error(`No difficulty parameters found for ${request.model_id} at level ${request.difficulty_level}`);
    }

    // 2. Fetch curated mapping (if format/theme specified) or use default
    const mapping = await this.fetchCuratedMapping(
      request.model_id,
      difficultyParams.id,
      request.format_preference,
      request.scenario_theme
    );

    // 3. Generate question using parent orchestrator (uses existing controllers)
    const enhancedRequest: EnhancedQuestionRequest = {
      model_id: request.model_id,
      difficulty_level: difficultyParams.difficulty_level,
      year_level: difficultyParams.year_level,
      format_preference: (mapping?.format as any) || request.format_preference,
      scenario_theme: (mapping?.theme as any) || request.scenario_theme,
      pedagogical_focus: request.pedagogical_focus,
      difficulty_params: difficultyParams.parameters as any,
    };

    const question = await super.generateQuestion(enhancedRequest);

    const generationTime = Date.now() - startTime;

    // 4. Save to database if requested
    let questionId: string | undefined;
    let savedToDatabase = false;

    if (request.saveToDatabase) {
      questionId = await this.saveQuestion(question, {
        difficultyParamId: difficultyParams.id,
        curatedMappingId: mapping?.id,
        generationTimeMs: generationTime,
        autoApprove: request.autoApprove || false,
      });
      savedToDatabase = true;
    }

    return {
      ...question,
      questionId,
      savedToDatabase,
    };
  }

  /**
   * Generate batch of questions
   */
  async generateBatch(
    request: SupabaseQuestionRequest,
    quantity: number = 10
  ): Promise<SupabaseQuestionResponse[]> {
    const questions: SupabaseQuestionResponse[] = [];

    for (let i = 0; i < quantity; i++) {
      const question = await this.generateQuestion(request);
      questions.push(question);
    }

    return questions;
  }

  /**
   * Fetch difficulty parameters from database
   */
  private async fetchDifficultyParameters(
    modelId: string,
    difficultyLevel: string
  ): Promise<DifficultyParameter | null> {
    const { data, error } = await this.supabase
      .from('difficulty_parameters')
      .select('*')
      .eq('model_id', modelId)
      .eq('difficulty_level', difficultyLevel)
      .single();

    if (error) {
      console.error('Failed to fetch difficulty parameters:', error);
      return null;
    }

    return data as DifficultyParameter;
  }

  /**
   * Fetch curated mapping from database
   */
  private async fetchCuratedMapping(
    modelId: string,
    difficultyParamId: string,
    format?: string,
    theme?: string
  ): Promise<CuratedMapping | null> {
    let query = this.supabase
      .from('curated_mappings')
      .select('*')
      .eq('model_id', modelId)
      .eq('difficulty_param_id', difficultyParamId)
      .eq('active', true);

    if (format) {
      query = query.eq('format', format);
    }

    if (theme) {
      query = query.eq('theme', theme);
    }

    const { data, error } = await query.limit(1).single();

    if (error || !data) {
      // Fallback: Get any active mapping for this model/difficulty
      const { data: fallback } = await this.supabase
        .from('curated_mappings')
        .select('*')
        .eq('model_id', modelId)
        .eq('difficulty_param_id', difficultyParamId)
        .eq('active', true)
        .limit(1)
        .single();

      return fallback as CuratedMapping | null;
    }

    return data as CuratedMapping;
  }

  /**
   * Save generated question to database
   */
  private async saveQuestion(
    question: EnhancedQuestion,
    metadata: {
      difficultyParamId: string;
      curatedMappingId?: string;
      generationTimeMs: number;
      autoApprove: boolean;
    }
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('generated_questions')
      .insert({
        question_text: question.text,
        options: question.options as any,
        correct_index: question.correctIndex,
        explanation: question.explanation,
        difficulty_param_id: metadata.difficultyParamId,
        curated_mapping_id: metadata.curatedMappingId || null,
        model_id: question.metadata?.model_id || '',
        format: question.format,
        theme: question.metadata?.scenario_theme || 'GENERIC',
        generation_params: question.metadata?.difficulty_params || null,
        math_output: question.mathOutput || null,
        cognitive_load: question.metadata?.cognitiveLoad || null,
        distractor_strategies: question.metadata?.distractor_strategies || null,
        generation_time_ms: metadata.generationTimeMs,
        approved: metadata.autoApprove,
        approved_at: metadata.autoApprove ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save question to database:', error);
      throw new Error(`Database save failed: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Get default difficulty level from year level
   */
  private getDefaultDifficultyLevel(yearLevel?: number): string {
    if (!yearLevel) return '3.3'; // Default middle difficulty
    return `${yearLevel}.3`; // Year level with sub-level 3 (standard)
  }
}

/**
 * Utility: Get all available models from database
 */
export async function getAvailableModels(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('difficulty_parameters')
    .select('model_id')
    .order('model_id');

  if (error || !data) return [];

  // Return unique model IDs
  return [...new Set(data.map((row: any) => row.model_id))];
}

/**
 * Utility: Get available difficulty levels for a model
 */
export async function getAvailableDifficultyLevels(
  supabase: SupabaseClient,
  modelId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('difficulty_parameters')
    .select('difficulty_level')
    .eq('model_id', modelId)
    .order('year_level', { ascending: true })
    .order('sub_level', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => row.difficulty_level);
}

/**
 * Utility: Approve a question
 */
export async function approveQuestion(
  supabase: SupabaseClient,
  questionId: string,
  approvedBy?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('generated_questions')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: approvedBy || null,
    })
    .eq('id', questionId);

  return !error;
}

/**
 * Utility: Reject a question
 */
export async function rejectQuestion(
  supabase: SupabaseClient,
  questionId: string,
  reason: string
): Promise<boolean> {
  const { error } = await supabase
    .from('generated_questions')
    .update({
      approved: false,
      rejection_reason: reason,
    })
    .eq('id', questionId);

  return !error;
}
