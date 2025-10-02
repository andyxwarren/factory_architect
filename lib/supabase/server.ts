/**
 * Supabase Client for Server-Side Usage
 *
 * This client is used in Next.js Server Components, Server Actions, and API Routes.
 * It respects Row Level Security (RLS) policies and handles auth cookies.
 *
 * Usage (Server Component):
 *   import { createServerClient } from '@/lib/supabase/server';
 *   const supabase = await createServerClient();
 *   const { data } = await supabase.from('generated_questions').select('*');
 *
 * Usage (API Route):
 *   import { createServerClient } from '@/lib/supabase/server';
 *   const supabase = await createServerClient();
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side usage
 * Handles auth cookies automatically
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * **WARNING**: Only use in server-side code where you need full database access
 *
 * Use cases:
 * - Admin operations that need to bypass RLS
 * - Background jobs/cron tasks
 * - Data migrations
 *
 * DO NOT expose this client to client-side code!
 */
export function createServiceRoleClient() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. This is required for service role client.'
    );
  }

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for service role client
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
