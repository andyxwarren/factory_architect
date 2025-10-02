'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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

export interface GeneratedQuestion {
  id: string;
  model_id: string;
  difficulty_level: string;
  format: string;
  theme: string;
  question_text: string;
  correct_answer: any;
  distractors: any[];
  reasoning: string;
  metadata: any;
  approved: boolean;
  created_at: string;
}

export interface QuestionFilters {
  model?: string;
  format?: string;
  theme?: string;
  difficulty?: string;
  approved?: boolean;
  search?: string;
}

export async function getQuestions(filters?: QuestionFilters): Promise<GeneratedQuestion[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('generated_questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.model) {
    query = query.eq('model_id', filters.model);
  }
  if (filters?.format) {
    query = query.eq('format', filters.format);
  }
  if (filters?.theme) {
    query = query.eq('theme', filters.theme);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty_level', filters.difficulty);
  }
  if (filters?.approved !== undefined) {
    query = query.eq('approved', filters.approved);
  }
  if (filters?.search) {
    query = query.ilike('question_text', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch questions:', error);
    throw new Error('Failed to fetch questions');
  }

  return data as GeneratedQuestion[];
}

export async function approveQuestion(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('generated_questions')
    .update({ approved: true })
    .eq('id', id);

  if (error) {
    console.error('Failed to approve question:', error);
    throw new Error(error.message || 'Failed to approve question');
  }

  revalidatePath('/admin/approval-queue');
}

export async function rejectQuestion(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('generated_questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to reject question:', error);
    throw new Error(error.message || 'Failed to reject question');
  }

  revalidatePath('/admin/approval-queue');
}

export async function batchApproveQuestions(ids: string[]) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('generated_questions')
    .update({ approved: true })
    .in('id', ids);

  if (error) {
    console.error('Failed to batch approve questions:', error);
    throw new Error(error.message || 'Failed to batch approve questions');
  }

  revalidatePath('/admin/approval-queue');
}

export async function batchRejectQuestions(ids: string[]) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('generated_questions')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Failed to batch reject questions:', error);
    throw new Error(error.message || 'Failed to batch reject questions');
  }

  revalidatePath('/admin/approval-queue');
}
