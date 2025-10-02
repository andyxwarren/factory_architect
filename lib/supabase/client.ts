/**
 * Supabase Client for Browser/Client-Side Usage
 *
 * This client is used in React components and client-side code.
 * It respects Row Level Security (RLS) policies.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client';
 *   const { data, error } = await supabase.from('generated_questions').select('*');
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

/**
 * Browser-side Supabase client
 * - Automatically handles auth state
 * - Respects RLS policies
 * - Safe for client-side usage (uses anon key)
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
