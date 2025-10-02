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

export interface ScenarioTemplate {
  id: string;
  theme: string;
  format: string;
  template_text: string;
  placeholders: string[];
  active: boolean;
  created_at: string;
}

export interface CreateTemplateInput {
  theme: string;
  format: string;
  template_text: string;
  placeholders: string[];
  active?: boolean;
}

export interface UpdateTemplateInput extends CreateTemplateInput {
  id: string;
}

export async function getTemplates(): Promise<ScenarioTemplate[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('scenario_templates')
    .select('*')
    .order('theme', { ascending: true });

  if (error) {
    console.error('Failed to fetch templates:', error);
    throw new Error('Failed to fetch templates');
  }

  return data as ScenarioTemplate[];
}

export async function createTemplate(input: CreateTemplateInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('scenario_templates')
    .insert({
      theme: input.theme,
      format: input.format,
      template_text: input.template_text,
      placeholders: input.placeholders,
      active: input.active !== undefined ? input.active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create template:', error);
    throw new Error(error.message || 'Failed to create template');
  }

  revalidatePath('/admin/scenario-templates');
  return data;
}

export async function updateTemplate(input: UpdateTemplateInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('scenario_templates')
    .update({
      theme: input.theme,
      format: input.format,
      template_text: input.template_text,
      placeholders: input.placeholders,
      active: input.active !== undefined ? input.active : true,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update template:', error);
    throw new Error(error.message || 'Failed to update template');
  }

  revalidatePath('/admin/scenario-templates');
  return data;
}

export async function deleteTemplate(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('scenario_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete template:', error);
    throw new Error(error.message || 'Failed to delete template');
  }

  revalidatePath('/admin/scenario-templates');
}

export async function toggleTemplateActive(id: string, active: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('scenario_templates')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle template:', error);
    throw new Error(error.message || 'Failed to toggle template');
  }

  revalidatePath('/admin/scenario-templates');
}
