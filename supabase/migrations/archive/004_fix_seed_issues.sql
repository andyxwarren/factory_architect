-- ============================================
-- Factory Architect - Fix Seed Script Issues
-- Migration: 004_fix_seed_issues.sql
-- Created: 2025-10-01
-- Description: Fix seed script errors by adding constraints and fixing functions
-- ============================================

-- ============================================
-- FIX 1: Add Unique Constraint to scenario_templates
-- ============================================

-- This allows the seed script's upsert with onConflict to work properly
ALTER TABLE scenario_templates
  ADD CONSTRAINT scenario_templates_unique_template
  UNIQUE (theme, format, template_text);

COMMENT ON CONSTRAINT scenario_templates_unique_template ON scenario_templates
  IS 'Prevents duplicate scenario templates with same theme, format, and text';


-- ============================================
-- FIX 2: Fix Ambiguous Column Reference in generate_default_mappings
-- ============================================

-- Drop the existing function
DROP FUNCTION IF EXISTS generate_default_mappings(TEXT);

-- Recreate with fully qualified column names to avoid ambiguity
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_default_mappings IS 'Auto-generate default DIRECT_CALCULATION + SHOPPING mappings for a model (fixed column ambiguity)';


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that unique constraint was added
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scenario_templates_unique_template'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    RAISE NOTICE '✅ Unique constraint scenario_templates_unique_template added successfully';
  ELSE
    RAISE WARNING '❌ Failed to add unique constraint';
  END IF;
END $$;

-- Check that function was recreated
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'generate_default_mappings'
  ) INTO function_exists;

  IF function_exists THEN
    RAISE NOTICE '✅ Function generate_default_mappings recreated successfully';
  ELSE
    RAISE WARNING '❌ Failed to recreate function';
  END IF;
END $$;


-- ============================================
-- CLEANUP (OPTIONAL)
-- ============================================

-- Uncomment the following lines if you want to clear partial seed data
-- and start fresh after running this migration:

-- DELETE FROM curated_mappings;
-- DELETE FROM scenario_templates;

-- RAISE NOTICE 'Cleared partial seed data. Re-run: npm run seed';


-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 004_fix_seed_issues.sql completed successfully';
  RAISE NOTICE '';
  RAISE NOTICE '📋 FIXES APPLIED:';
  RAISE NOTICE '  1. Added unique constraint to scenario_templates table';
  RAISE NOTICE '  2. Fixed ambiguous column reference in generate_default_mappings function';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '  1. (Optional) Clear partial seed data:';
  RAISE NOTICE '     DELETE FROM curated_mappings;';
  RAISE NOTICE '     DELETE FROM scenario_templates;';
  RAISE NOTICE '  2. Re-run seed script: npm run seed';
  RAISE NOTICE '  3. Verify: SELECT COUNT(*) FROM scenario_templates; (should be 20)';
  RAISE NOTICE '  4. Verify: SELECT COUNT(*) FROM curated_mappings; (should be 300+)';
END $$;
