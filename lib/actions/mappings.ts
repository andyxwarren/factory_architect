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

export interface CuratedMapping {
  id: string;
  model_id: string;
  difficulty_param_id: string;
  format: string;
  theme: string;
  weight: number;
  active: boolean;
  created_at: string;
  difficulty_parameters?: {
    difficulty_level: string;
    year_level: number;
    parameters: any;
  };
}

export interface CreateMappingInput {
  model_id: string;
  difficulty_param_id: string;
  format: string;
  theme: string;
  weight?: number;
  active?: boolean;
}

export interface UpdateMappingInput extends CreateMappingInput {
  id: string;
}

export interface BulkGenerateMappingsInput {
  model_id: string;
  formats?: string[];
  themes?: string[];
}

export async function getMappings(): Promise<CuratedMapping[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('curated_mappings')
    .select(`
      *,
      difficulty_parameters (
        difficulty_level,
        year_level,
        parameters
      )
    `)
    .order('model_id', { ascending: true })
    .order('format', { ascending: true });

  if (error) {
    console.error('Failed to fetch mappings:', error);
    throw new Error('Failed to fetch mappings');
  }

  return data as CuratedMapping[];
}

export async function createMapping(input: CreateMappingInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('curated_mappings')
    .insert({
      model_id: input.model_id,
      difficulty_param_id: input.difficulty_param_id,
      format: input.format,
      theme: input.theme,
      weight: input.weight || 1.0,
      active: input.active !== undefined ? input.active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create mapping:', error);
    throw new Error(error.message || 'Failed to create mapping');
  }

  revalidatePath('/admin/curated-mappings');
  return data;
}

export async function updateMapping(input: UpdateMappingInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('curated_mappings')
    .update({
      model_id: input.model_id,
      difficulty_param_id: input.difficulty_param_id,
      format: input.format,
      theme: input.theme,
      weight: input.weight || 1.0,
      active: input.active !== undefined ? input.active : true,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update mapping:', error);
    throw new Error(error.message || 'Failed to update mapping');
  }

  revalidatePath('/admin/curated-mappings');
  return data;
}

export async function deleteMapping(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('curated_mappings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete mapping:', error);
    throw new Error(error.message || 'Failed to delete mapping');
  }

  revalidatePath('/admin/curated-mappings');
}

export async function toggleMappingActive(id: string, active: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('curated_mappings')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle mapping:', error);
    throw new Error(error.message || 'Failed to toggle mapping');
  }

  revalidatePath('/admin/curated-mappings');
}

export async function bulkGenerateMappings(input: BulkGenerateMappingsInput) {
  const supabase = getSupabase();

  // Call the stored procedure
  const { data, error } = await supabase.rpc('generate_default_mappings', {
    p_model_id: input.model_id,
  });

  if (error) {
    console.error('Failed to bulk generate mappings:', error);
    throw new Error(error.message || 'Failed to bulk generate mappings');
  }

  revalidatePath('/admin/curated-mappings');
  return data;
}
