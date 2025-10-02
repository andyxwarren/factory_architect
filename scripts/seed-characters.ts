/**
 * Seed Characters
 *
 * Migrates character names from scenario.service.ts to Supabase
 *
 * Source: lib/services/scenario.service.ts:867-875
 * Target: characters table
 */

import { SupabaseClient } from '@supabase/supabase-js';

const CHARACTERS = [
  // Female names
  { name: 'Emma', gender: 'female', cultural_context: 'UK' },
  { name: 'Olivia', gender: 'female', cultural_context: 'UK' },
  { name: 'Ava', gender: 'female', cultural_context: 'UK' },
  { name: 'Isabella', gender: 'female', cultural_context: 'UK' },
  { name: 'Sophia', gender: 'female', cultural_context: 'UK' },
  { name: 'Charlotte', gender: 'female', cultural_context: 'UK' },
  { name: 'Mia', gender: 'female', cultural_context: 'UK' },
  { name: 'Amelia', gender: 'female', cultural_context: 'UK' },
  { name: 'Harper', gender: 'female', cultural_context: 'UK' },
  { name: 'Evelyn', gender: 'female', cultural_context: 'UK' },
  { name: 'Abigail', gender: 'female', cultural_context: 'UK' },
  { name: 'Emily', gender: 'female', cultural_context: 'UK' },
  { name: 'Elizabeth', gender: 'female', cultural_context: 'UK' },
  { name: 'Sofia', gender: 'female', cultural_context: 'UK' },
  { name: 'Madison', gender: 'female', cultural_context: 'UK' },

  // Male names
  { name: 'Liam', gender: 'male', cultural_context: 'UK' },
  { name: 'Noah', gender: 'male', cultural_context: 'UK' },
  { name: 'William', gender: 'male', cultural_context: 'UK' },
  { name: 'James', gender: 'male', cultural_context: 'UK' },
  { name: 'Oliver', gender: 'male', cultural_context: 'UK' },
  { name: 'Benjamin', gender: 'male', cultural_context: 'UK' },
  { name: 'Elijah', gender: 'male', cultural_context: 'UK' },
  { name: 'Lucas', gender: 'male', cultural_context: 'UK' },
  { name: 'Mason', gender: 'male', cultural_context: 'UK' },
  { name: 'Logan', gender: 'male', cultural_context: 'UK' },
  { name: 'Alexander', gender: 'male', cultural_context: 'UK' },
  { name: 'Ethan', gender: 'male', cultural_context: 'UK' },
  { name: 'Jacob', gender: 'male', cultural_context: 'UK' },
  { name: 'Michael', gender: 'male', cultural_context: 'UK' },
  { name: 'Daniel', gender: 'male', cultural_context: 'UK' },
  { name: 'Henry', gender: 'male', cultural_context: 'UK' },

  // Gender-neutral names
  { name: 'Sam', gender: 'neutral', cultural_context: 'UK' },
  { name: 'Alex', gender: 'neutral', cultural_context: 'UK' }
];

/**
 * Seed characters table
 */
export async function seedCharacters(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('characters')
    .upsert(CHARACTERS, {
      onConflict: 'name',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('  ❌ Failed to seed characters:', error.message);
    return 0;
  }

  return CHARACTERS.length;
}
