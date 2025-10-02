/**
 * Master Seed Script for Factory Architect Supabase Migration
 *
 * This script runs all seed migrations in the correct order:
 * 1. Difficulty Parameters (600+ configs from difficulty-enhanced.ts)
 * 2. Characters (32 names from scenario.service.ts)
 * 3. Items (50+ items with pricing)
 * 4. Scenario Templates (story templates for questions)
 * 5. Curated Mappings (default model→format→theme combinations)
 *
 * Usage:
 *   npx tsx scripts/seed-all.ts
 *
 * Prerequisites:
 *   - Supabase project created
 *   - SQL migrations run (001, 002, 003)
 *   - .env.local file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { seedDifficultyParameters } from './seed-difficulty-parameters';
import { seedCharacters } from './seed-characters';
import { seedItems } from './seed-items';
import { seedScenarioTemplates } from './seed-scenario-templates';
import { seedCuratedMappings } from './seed-curated-mappings';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client (service role key bypasses RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Main seed execution
 */
async function main() {
  console.log('🌱 Starting Factory Architect Database Seed...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  const startTime = Date.now();
  let totalRecords = 0;

  try {
    // Test connection
    const { data, error } = await supabase.from('difficulty_parameters').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.error('Ensure migrations 001, 002, 003 have been run in Supabase Studio');
      process.exit(1);
    }

    // Step 1: Seed Difficulty Parameters
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Step 1/5: Seeding Difficulty Parameters');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const diffCount = await seedDifficultyParameters(supabase);
    totalRecords += diffCount;
    console.log(`✅ Seeded ${diffCount} difficulty parameters\n`);

    // Step 2: Seed Characters
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Step 2/5: Seeding Characters');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const charCount = await seedCharacters(supabase);
    totalRecords += charCount;
    console.log(`✅ Seeded ${charCount} characters\n`);

    // Step 3: Seed Items
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 Step 3/5: Seeding Items');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const itemCount = await seedItems(supabase);
    totalRecords += itemCount;
    console.log(`✅ Seeded ${itemCount} items\n`);

    // Step 4: Seed Scenario Templates
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Step 4/5: Seeding Scenario Templates');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const templateCount = await seedScenarioTemplates(supabase);
    totalRecords += templateCount;
    console.log(`✅ Seeded ${templateCount} scenario templates\n`);

    // Step 5: Seed Curated Mappings
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Step 5/5: Seeding Curated Mappings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const mappingCount = await seedCuratedMappings(supabase);
    totalRecords += mappingCount;
    console.log(`✅ Seeded ${mappingCount} curated mappings\n`);

    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Total records seeded: ${totalRecords}`);
    console.log(`⏱️  Total time: ${duration}s`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('  1. Verify data in Supabase Studio → Table Editor');
    console.log('  2. Run: SELECT * FROM v_difficulty_summary;');
    console.log('  3. Run: SELECT * FROM v_mapping_coverage;');
    console.log('  4. Start development: npm run dev');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ SEED FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('  1. Ensure SQL migrations (001, 002, 003) were run in Supabase Studio');
    console.error('  2. Check .env.local has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('  3. Verify Supabase project is not paused');
    console.error('  4. Check Supabase logs in Studio for detailed errors');
    console.error('');
    process.exit(1);
  }
}

// Run seed
main();
