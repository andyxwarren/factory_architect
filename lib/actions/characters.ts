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

export interface Character {
  id: string;
  name: string;
  gender: 'neutral' | 'male' | 'female';
  cultural_context: string;
  active: boolean;
  created_at: string;
}

export interface CreateCharacterInput {
  name: string;
  gender: 'neutral' | 'male' | 'female';
  cultural_context?: string;
  active?: boolean;
}

export interface UpdateCharacterInput extends CreateCharacterInput {
  id: string;
}

export async function getCharacters(): Promise<Character[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch characters:', error);
    throw new Error('Failed to fetch characters');
  }

  return data as Character[];
}

export async function createCharacter(input: CreateCharacterInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('characters')
    .insert({
      name: input.name,
      gender: input.gender,
      cultural_context: input.cultural_context || 'UK',
      active: input.active !== undefined ? input.active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create character:', error);
    throw new Error(error.message || 'Failed to create character');
  }

  revalidatePath('/admin/characters');
  return data;
}

export async function updateCharacter(input: UpdateCharacterInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('characters')
    .update({
      name: input.name,
      gender: input.gender,
      cultural_context: input.cultural_context || 'UK',
      active: input.active !== undefined ? input.active : true,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update character:', error);
    throw new Error(error.message || 'Failed to update character');
  }

  revalidatePath('/admin/characters');
  return data;
}

export async function deleteCharacter(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete character:', error);
    throw new Error(error.message || 'Failed to delete character');
  }

  revalidatePath('/admin/characters');
}

export async function toggleCharacterActive(id: string, active: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('characters')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle character:', error);
    throw new Error(error.message || 'Failed to toggle character');
  }

  revalidatePath('/admin/characters');
}
