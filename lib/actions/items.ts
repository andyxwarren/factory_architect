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

export interface Item {
  id: string;
  name: string;
  category: string;
  themes: string[];
  min_price: number;
  max_price: number;
  typical_price: number;
  active: boolean;
  created_at: string;
}

export interface CreateItemInput {
  name: string;
  category: string;
  themes: string[];
  min_price: number;
  max_price: number;
  typical_price: number;
  active?: boolean;
}

export interface UpdateItemInput extends CreateItemInput {
  id: string;
}

export async function getItems(): Promise<Item[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch items:', error);
    throw new Error('Failed to fetch items');
  }

  return data as Item[];
}

export async function createItem(input: CreateItemInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('items')
    .insert({
      name: input.name,
      category: input.category,
      themes: input.themes,
      min_price: input.min_price,
      max_price: input.max_price,
      typical_price: input.typical_price,
      active: input.active !== undefined ? input.active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create item:', error);
    throw new Error(error.message || 'Failed to create item');
  }

  revalidatePath('/admin/items');
  return data;
}

export async function updateItem(input: UpdateItemInput) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('items')
    .update({
      name: input.name,
      category: input.category,
      themes: input.themes,
      min_price: input.min_price,
      max_price: input.max_price,
      typical_price: input.typical_price,
      active: input.active !== undefined ? input.active : true,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update item:', error);
    throw new Error(error.message || 'Failed to update item');
  }

  revalidatePath('/admin/items');
  return data;
}

export async function deleteItem(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete item:', error);
    throw new Error(error.message || 'Failed to delete item');
  }

  revalidatePath('/admin/items');
}

export async function toggleItemActive(id: string, active: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('items')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle item:', error);
    throw new Error(error.message || 'Failed to toggle item');
  }

  revalidatePath('/admin/items');
}
