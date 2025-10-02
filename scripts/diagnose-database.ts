/**
 * Database Diagnostics Script
 *
 * This script checks your Supabase database state to diagnose seed issues.
 * Run: npx tsx scripts/diagnose-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnose() {
  console.log('🔍 SUPABASE DATABASE DIAGNOSTICS');
  console.log('================================\n');

  // 1. Check tables exist
  console.log('1️⃣  CHECKING TABLES...');
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
  }).catch(() => ({ data: null, error: null }));

  // Fallback: try direct query
  const tablesQuery = await supabase
    .from('difficulty_parameters')
    .select('count', { count: 'exact', head: true });

  if (tablesQuery.error) {
    console.log('   ❌ Tables not found. Run migrations first!');
    return;
  } else {
    console.log('   ✅ Tables exist');
  }

  // 2. Check constraints on curated_mappings
  console.log('\n2️⃣  CHECKING CONSTRAINTS ON curated_mappings...');
  const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = 'curated_mappings'::regclass
      ORDER BY conname;
    `
  }).catch(() => ({ data: null, error: 'RPC not available' }));

  if (constraintsError || !constraints) {
    console.log('   ⚠️  Cannot query constraints directly. Trying alternative method...');

    // Try to insert a duplicate to test constraint
    const testInsert = await supabase.from('curated_mappings').insert({
      model_id: 'TEST',
      difficulty_param_id: '00000000-0000-0000-0000-000000000000',
      format: 'TEST_FORMAT',
      theme: 'TEST_THEME',
      weight: 1.0
    });

    const testDuplicate = await supabase.from('curated_mappings').insert({
      model_id: 'TEST',
      difficulty_param_id: '00000000-0000-0000-0000-000000000000',
      format: 'TEST_FORMAT',
      theme: 'TEST_THEME',
      weight: 1.0
    });

    if (testDuplicate.error?.message?.includes('unique') || testDuplicate.error?.message?.includes('duplicate')) {
      console.log('   ✅ Unique constraint EXISTS (duplicate insert blocked)');
      console.log(`   Error message: ${testDuplicate.error.message}`);
    } else {
      console.log('   ❌ Unique constraint MISSING (duplicate insert succeeded)');
      console.log('   🔧 FIX: Run migration 004 again');
    }

    // Clean up test data
    await supabase.from('curated_mappings').delete().eq('model_id', 'TEST');
  } else {
    console.log('   Constraints found:');
    constraints.forEach((c: any) => {
      console.log(`   - ${c.conname} (type: ${c.contype})`);
    });
  }

  // 3. Check the generate_default_mappings function
  console.log('\n3️⃣  CHECKING generate_default_mappings FUNCTION...');

  // Get function definition
  const { data: funcDef, error: funcError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'generate_default_mappings';
    `
  }).catch(() => ({ data: null, error: 'RPC not available' }));

  if (funcError || !funcDef) {
    console.log('   ⚠️  Cannot query function directly. Trying to call it...');

    // Try calling the function with ADDITION model
    const { data: additionParams } = await supabase
      .from('difficulty_parameters')
      .select('id')
      .eq('model_id', 'ADDITION')
      .limit(1)
      .single();

    if (additionParams) {
      console.log('   📞 Calling generate_default_mappings(\'ADDITION\')...');
      const { data: result, error: callError } = await supabase.rpc('generate_default_mappings', {
        p_model_id: 'ADDITION'
      });

      if (callError) {
        console.log(`   ❌ Function call FAILED with error:`);
        console.log(`   ${callError.message}`);
        console.log(`   ${callError.hint || ''}`);
        console.log(`   ${callError.details || ''}`);

        if (callError.message.includes('ambiguous')) {
          console.log('\n   🔧 FIX NEEDED: Function has ambiguous column reference!');
          console.log('   Run this SQL in Supabase Studio:');
          console.log('   ----------------------------------------');
          console.log(`   DROP FUNCTION IF EXISTS generate_default_mappings(TEXT);

   CREATE OR REPLACE FUNCTION generate_default_mappings(p_model_id TEXT)
   RETURNS TABLE (
     mapping_id UUID,
     difficulty_level TEXT,
     format TEXT,
     theme TEXT
   ) AS $$
   BEGIN
     RETURN QUERY
     INSERT INTO curated_mappings (
       model_id,
       difficulty_param_id,
       format,
       theme,
       weight
     )
     SELECT
       p_model_id,
       dp.id AS difficulty_param_id,
       'DIRECT_CALCULATION' AS format,
       'SHOPPING' AS theme,
       1.0 AS weight
     FROM difficulty_parameters dp
     WHERE dp.model_id = p_model_id
     ON CONFLICT (model_id, difficulty_param_id, format, theme) DO NOTHING
     RETURNING
       curated_mappings.id AS mapping_id,
       (SELECT dp2.difficulty_level FROM difficulty_parameters dp2 WHERE dp2.id = curated_mappings.difficulty_param_id) AS difficulty_level,
       curated_mappings.format,
       curated_mappings.theme;
   END;
   $$ LANGUAGE plpgsql;`);
          console.log('   ----------------------------------------');
        }
      } else {
        console.log(`   ✅ Function call succeeded! Generated ${result?.length || 0} mappings`);
      }
    }
  } else {
    console.log('   Function definition retrieved:');
    console.log(funcDef[0]?.definition?.substring(0, 200) + '...');
  }

  // 4. Check data counts
  console.log('\n4️⃣  CHECKING DATA COUNTS...');
  const counts = await Promise.all([
    supabase.from('difficulty_parameters').select('count', { count: 'exact', head: true }),
    supabase.from('characters').select('count', { count: 'exact', head: true }),
    supabase.from('items').select('count', { count: 'exact', head: true }),
    supabase.from('scenario_templates').select('count', { count: 'exact', head: true }),
    supabase.from('curated_mappings').select('count', { count: 'exact', head: true }),
  ]);

  console.log(`   difficulty_parameters: ${counts[0].count || 0} records`);
  console.log(`   characters: ${counts[1].count || 0} records`);
  console.log(`   items: ${counts[2].count || 0} records`);
  console.log(`   scenario_templates: ${counts[3].count || 0} records`);
  console.log(`   curated_mappings: ${counts[4].count || 0} records`);

  // 5. Summary
  console.log('\n📊 DIAGNOSIS SUMMARY');
  console.log('================================');
  console.log('Expected after successful migration 004:');
  console.log('  - curated_mappings has unique constraint');
  console.log('  - generate_default_mappings function works without "ambiguous" error');
  console.log('  - Seed script creates 300+ curated_mappings');
  console.log('\nIf you see errors above, the fix SQL is provided. Run it in Supabase Studio.');
}

diagnose().catch(console.error);
