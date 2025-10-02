'use server';

import { createClient } from '@supabase/supabase-js';
import { QuestionOrchestratorSupabase } from '@/lib/orchestrator/question-orchestrator-supabase';
import type { EnhancedQuestionRequest } from '@/lib/types/question-formats';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export interface GenerateQuestionInput {
  model_id: string;
  difficulty_level?: string;
  format_preference?: string;
  scenario_theme?: string;
  count?: number;
  saveToDatabase?: boolean;
  autoApprove?: boolean;
}

export interface GeneratedQuestionResult {
  questionId?: string;
  question: any;
  metadata: any;
}

export async function generateQuestions(input: GenerateQuestionInput): Promise<GeneratedQuestionResult[]> {
  const supabase = getSupabase();
  const orchestrator = new QuestionOrchestratorSupabase(supabase);

  const count = input.count || 1;
  const results: GeneratedQuestionResult[] = [];

  for (let i = 0; i < count; i++) {
    const request: EnhancedQuestionRequest = {
      model_id: input.model_id,
      difficulty_level: input.difficulty_level,
      format_preference: input.format_preference as any,
      scenario_theme: input.scenario_theme as any,
      saveToDatabase: input.saveToDatabase !== false,
      autoApprove: input.autoApprove || false,
    };

    try {
      const result = await orchestrator.generateQuestion(request);
      results.push(result);
    } catch (error) {
      console.error('Failed to generate question:', error);
      throw error;
    }
  }

  return results;
}
