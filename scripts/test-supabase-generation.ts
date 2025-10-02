/**
 * Supabase Integration Test Script
 *
 * This script tests the complete flow:
 * 1. Connect to Supabase
 * 2. Fetch difficulty parameters
 * 3. Fetch curated mappings
 * 4. Generate a question using QuestionOrchestratorSupabase
 * 5. Save question to database
 * 6. Verify the saved question
 *
 * Run: npx tsx scripts/test-supabase-generation.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSupabaseIntegration() {
  console.log('🧪 SUPABASE INTEGRATION TEST');
  console.log('================================\n');

  // Test 1: Database Connection
  console.log('1️⃣  Testing database connection...');
  const { data: diffParams, error: connError } = await supabase
    .from('difficulty_parameters')
    .select('count', { count: 'exact', head: true });

  if (connError) {
    console.error('   ❌ Connection failed:', connError.message);
    return;
  }
  console.log(`   ✅ Connected! Found ${diffParams} difficulty parameters\n`);

  // Test 2: Fetch Difficulty Parameters
  console.log('2️⃣  Testing difficulty parameter fetch...');
  const { data: additionParams, error: paramsError } = await supabase
    .from('difficulty_parameters')
    .select('*')
    .eq('model_id', 'ADDITION')
    .limit(5);

  if (paramsError) {
    console.error('   ❌ Failed to fetch params:', paramsError.message);
    return;
  }
  console.log(`   ✅ Fetched ${additionParams?.length || 0} ADDITION difficulty levels`);
  console.log(`   Sample: ${additionParams?.[0]?.difficulty_level} - ${JSON.stringify(additionParams?.[0]?.parameters).substring(0, 50)}...\n`);

  // Test 3: Fetch Curated Mappings
  console.log('3️⃣  Testing curated mappings fetch...');
  const { data: mappings, error: mappingsError } = await supabase
    .from('curated_mappings')
    .select(`
      *,
      difficulty_parameters (
        difficulty_level,
        year_level,
        parameters
      )
    `)
    .eq('model_id', 'ADDITION')
    .eq('format', 'DIRECT_CALCULATION')
    .eq('theme', 'SHOPPING')
    .limit(1)
    .single();

  if (mappingsError) {
    console.error('   ❌ Failed to fetch mappings:', mappingsError.message);
    return;
  }
  console.log(`   ✅ Found mapping: ADDITION + ${mappings?.format} + ${mappings?.theme}`);
  console.log(`   Difficulty: ${(mappings?.difficulty_parameters as any)?.difficulty_level}\n`);

  // Test 4: Generate Question (using existing orchestrator)
  console.log('4️⃣  Testing question generation...');
  try {
    // Import the orchestrator
    const { QuestionOrchestratorSupabase } = await import('../lib/orchestrator/question-orchestrator-supabase');

    const orchestrator = new QuestionOrchestratorSupabase(supabase);

    const startTime = Date.now();
    const result = await orchestrator.generateQuestion({
      model_id: 'ADDITION',
      difficulty_level: (mappings?.difficulty_parameters as any)?.difficulty_level,
      format_preference: 'DIRECT_CALCULATION',
      scenario_theme: 'SHOPPING',
      saveToDatabase: true,
      autoApprove: false
    });
    const duration = Date.now() - startTime;

    console.log(`   ✅ Question generated in ${duration}ms`);
    console.log(`   Question: ${result.text.substring(0, 80)}...`);
    console.log(`   Options: ${result.options.length} choices`);
    console.log(`   Correct: ${result.options[result.correctIndex].text}`);
    console.log(`   Saved to DB: ${result.savedToDatabase ? 'Yes' : 'No'}`);
    if (result.questionId) {
      console.log(`   Question ID: ${result.questionId}\n`);
    }

    // Test 5: Verify Saved Question
    if (result.questionId) {
      console.log('5️⃣  Verifying saved question...');
      const { data: savedQuestion, error: fetchError } = await supabase
        .from('generated_questions')
        .select('*')
        .eq('id', result.questionId)
        .single();

      if (fetchError) {
        console.error('   ❌ Failed to fetch saved question:', fetchError.message);
        return;
      }

      console.log(`   ✅ Question found in database`);
      console.log(`   Model: ${savedQuestion?.model_id}`);
      console.log(`   Format: ${savedQuestion?.format}`);
      console.log(`   Theme: ${savedQuestion?.theme}`);
      console.log(`   Approved: ${savedQuestion?.approved ? 'Yes' : 'No'}`);
      console.log(`   Cognitive Load: ${savedQuestion?.cognitive_load}\n`);
    }

  } catch (error: any) {
    console.error('   ❌ Generation failed:', error.message);
    console.error('   Stack:', error.stack);
    return;
  }

  // Test 6: Data Counts Summary
  console.log('6️⃣  Database summary...');
  const counts = await Promise.all([
    supabase.from('difficulty_parameters').select('count', { count: 'exact', head: true }),
    supabase.from('characters').select('count', { count: 'exact', head: true }),
    supabase.from('items').select('count', { count: 'exact', head: true }),
    supabase.from('scenario_templates').select('count', { count: 'exact', head: true }),
    supabase.from('curated_mappings').select('count', { count: 'exact', head: true }),
    supabase.from('generated_questions').select('count', { count: 'exact', head: true }),
  ]);

  console.log(`   difficulty_parameters: ${counts[0].count || 0} records`);
  console.log(`   characters: ${counts[1].count || 0} records`);
  console.log(`   items: ${counts[2].count || 0} records`);
  console.log(`   scenario_templates: ${counts[3].count || 0} records`);
  console.log(`   curated_mappings: ${counts[4].count || 0} records`);
  console.log(`   generated_questions: ${counts[5].count || 0} records\n`);

  // Success Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ALL TESTS PASSED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database connection: Working');
  console.log('✅ Data fetching: Working');
  console.log('✅ Question generation: Working');
  console.log('✅ Database saving: Working');
  console.log('✅ Supabase integration: Ready for CMS development');
  console.log('');
  console.log('🚀 Next step: Build admin UI at /admin');
}

// Run the test
testSupabaseIntegration().catch((error) => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
