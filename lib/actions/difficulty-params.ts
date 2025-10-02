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

export interface DifficultyParameter {
  id: string;
  model_id: string;
  difficulty_level: string;
  year_level: number;
  parameters: any;
  created_at: string;
}

export interface CreateDifficultyParamInput {
  model_id: string;
  difficulty_level: string;
  year_level: number;
  parameters: any;
}

export interface UpdateDifficultyParamInput extends CreateDifficultyParamInput {
  id: string;
}

export async function getDifficultyParams(): Promise<DifficultyParameter[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('difficulty_parameters')
    .select('*')
    .order('model_id', { ascending: true })
    .order('year_level', { ascending: true });

  if (error) {
    console.error('Failed to fetch difficulty parameters:', error);
    throw new Error('Failed to fetch difficulty parameters');
  }

  return data as DifficultyParameter[];
}

export async function createDifficultyParam(input: CreateDifficultyParamInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('difficulty_parameters')
    .insert({
      model_id: input.model_id,
      difficulty_level: input.difficulty_level,
      year_level: input.year_level,
      parameters: input.parameters,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create difficulty parameter:', error);
    throw new Error(error.message || 'Failed to create difficulty parameter');
  }

  revalidatePath('/admin/difficulty-parameters');
  return data;
}

export async function updateDifficultyParam(input: UpdateDifficultyParamInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('difficulty_parameters')
    .update({
      model_id: input.model_id,
      difficulty_level: input.difficulty_level,
      year_level: input.year_level,
      parameters: input.parameters,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update difficulty parameter:', error);
    throw new Error(error.message || 'Failed to update difficulty parameter');
  }

  revalidatePath('/admin/difficulty-parameters');
  return data;
}

export async function deleteDifficultyParam(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('difficulty_parameters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete difficulty parameter:', error);
    throw new Error(error.message || 'Failed to delete difficulty parameter');
  }

  revalidatePath('/admin/difficulty-parameters');
}
