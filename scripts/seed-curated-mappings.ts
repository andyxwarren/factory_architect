/**
 * Seed Curated Mappings
 *
 * Generates default model → difficulty → format → theme mappings
 * Uses database function to create initial DIRECT_CALCULATION + SHOPPING mappings
 *
 * Target: curated_mappings table
 */

import { SupabaseClient } from '@supabase/supabase-js';

const MODELS_TO_SEED = [
  'ADDITION',
  'SUBTRACTION',
  'MULTIPLICATION',
  'DIVISION',
  'PERCENTAGE',
  'FRACTION'
];

/**
 * Seed curated mappings using database function
 */
export async function seedCuratedMappings(supabase: SupabaseClient): Promise<number> {
  let totalMappings = 0;

  for (const modelId of MODELS_TO_SEED) {
    console.log(`  Generating mappings for ${modelId}...`);

    // Call database function to generate default mappings
    const { data, error } = await supabase.rpc('generate_default_mappings', {
      p_model_id: modelId
    });

    if (error) {
      console.error(`    ❌ Failed to generate mappings for ${modelId}:`, error.message);
      continue;
    }

    // Count how many mappings were created
    const mappingCount = Array.isArray(data) ? data.length : 0;
    totalMappings += mappingCount;
    console.log(`    ✓ Created ${mappingCount} default mappings`);
  }

  // Additionally, create some enhanced mappings for variety
  console.log('  Creating additional format/theme variations...');

  const additionalMappings = await createAdditionalMappings(supabase);
  totalMappings += additionalMappings;

  return totalMappings;
}

/**
 * Create additional curated mappings for format/theme variety
 */
async function createAdditionalMappings(supabase: SupabaseClient): Promise<number> {
  const formats = ['COMPARISON', 'ESTIMATION', 'VALIDATION', 'MULTI_STEP', 'MISSING_VALUE'];
  const themes = ['SCHOOL', 'SPORTS', 'COOKING', 'POCKET_MONEY'];

  const mappingsToCreate: any[] = [];

  // For each model, get some difficulty parameters
  for (const modelId of MODELS_TO_SEED) {
    // Get a few difficulty levels for this model
    const { data: diffParams, error } = await supabase
      .from('difficulty_parameters')
      .select('id, difficulty_level')
      .eq('model_id', modelId)
      .in('sub_level', [2, 3]) // Just create for sub-levels 2 and 3 to keep it manageable
      .limit(12); // 2 sub-levels per year × 6 years = 12

    if (error || !diffParams) continue;

    // Create variety mappings
    for (const diffParam of diffParams) {
      // Add a COMPARISON mapping with SHOPPING theme
      if (['ADDITION', 'MULTIPLICATION', 'PERCENTAGE'].includes(modelId)) {
        mappingsToCreate.push({
          model_id: modelId,
          difficulty_param_id: diffParam.id,
          format: 'COMPARISON',
          theme: 'SHOPPING',
          weight: 0.8
        });
      }

      // Add VALIDATION mapping with POCKET_MONEY theme
      if (['ADDITION', 'SUBTRACTION'].includes(modelId)) {
        mappingsToCreate.push({
          model_id: modelId,
          difficulty_param_id: diffParam.id,
          format: 'VALIDATION',
          theme: 'POCKET_MONEY',
          weight: 0.7
        });
      }

      // Add ESTIMATION mapping with SCHOOL theme
      if (['ADDITION', 'MULTIPLICATION'].includes(modelId)) {
        mappingsToCreate.push({
          model_id: modelId,
          difficulty_param_id: diffParam.id,
          format: 'ESTIMATION',
          theme: 'SCHOOL',
          weight: 0.6
        });
      }
    }
  }

  if (mappingsToCreate.length === 0) {
    console.log('    No additional mappings to create');
    return 0;
  }

  const { error } = await supabase
    .from('curated_mappings')
    .upsert(mappingsToCreate, {
      onConflict: 'model_id,difficulty_param_id,format,theme',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('    ❌ Failed to create additional mappings:', error.message);
    return 0;
  }

  console.log(`    ✓ Created ${mappingsToCreate.length} additional mappings`);
  return mappingsToCreate.length;
}
