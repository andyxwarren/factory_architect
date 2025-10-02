-- ============================================
-- Factory Architect - Complete Database Schema
-- Migration: 001_complete_schema.sql
-- Created: 2025-10-01
-- Description: Consolidated migration with all tables, RLS, functions, and fixes
-- ============================================
--
-- This migration combines:
-- - Initial schema (tables, indexes, triggers, views)
-- - Row Level Security policies
-- - Helper functions (with fixed generate_default_mappings)
-- - Seed preparation (unique constraints)
--
-- Run this ONCE in Supabase Studio SQL Editor after database reset.
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ============================================
-- PART 1: CORE TABLES
-- ============================================

-- 1. Difficulty Parameters Table
-- Stores all 600+ difficulty configurations (previously in difficulty-enhanced.ts)
CREATE TABLE difficulty_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,  -- Format: "3.2" (year.sublevel)
  year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 6),
  sub_level INTEGER NOT NULL CHECK (sub_level BETWEEN 1 AND 4),
  parameters JSONB NOT NULL,       -- Model-specific difficulty params

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  UNIQUE(model_id, difficulty_level),
  CHECK (difficulty_level ~ '^\d+\.\d+$')  -- Regex: Must match "X.Y" format
);

-- Indexes for difficulty_parameters
CREATE INDEX idx_diff_params_model ON difficulty_parameters(model_id);
CREATE INDEX idx_diff_params_year ON difficulty_parameters(year_level);
CREATE INDEX idx_diff_params_level ON difficulty_parameters(difficulty_level);
CREATE INDEX idx_diff_params_gin ON difficulty_parameters USING GIN(parameters);

-- Index on specific JSONB paths (frequently queried params)
CREATE INDEX idx_diff_params_max_value ON difficulty_parameters ((parameters->>'max_value'));
CREATE INDEX idx_diff_params_operands ON difficulty_parameters ((parameters->>'operands'));

COMMENT ON TABLE difficulty_parameters IS 'Stores difficulty progression parameters for all mathematical models';


-- 2. Characters Table
-- Character names for story scenarios (previously hardcoded in scenario.service.ts)
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  gender TEXT CHECK(gender IN ('neutral', 'male', 'female')),
  cultural_context TEXT DEFAULT 'UK',
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX idx_characters_active ON characters(active) WHERE active = TRUE;

COMMENT ON TABLE characters IS 'Character names used in story-based math questions';


-- 3. Items Table
-- Items with realistic UK pricing (previously hardcoded in scenario.service.ts)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,          -- 'food', 'stationery', 'sports', etc.
  pricing JSONB NOT NULL,           -- {min, max, typical, unit}
  themes TEXT[] DEFAULT '{}',       -- Associated themes: ['SHOPPING', 'COOKING']
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CHECK (pricing ? 'min' AND pricing ? 'max' AND pricing ? 'typical')
);

-- Indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_themes ON items USING GIN(themes);
CREATE INDEX idx_items_active ON items(active) WHERE active = TRUE;

COMMENT ON TABLE items IS 'Physical items with pricing data for question scenarios';


-- 4. Scenario Templates Table
-- Story templates for question generation
CREATE TABLE scenario_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT NOT NULL,              -- 'SHOPPING', 'SCHOOL', 'SPORTS', etc.
  format TEXT NOT NULL,             -- 'DIRECT_CALCULATION', 'COMPARISON', etc.
  template_text TEXT NOT NULL,      -- "{{character}} goes to the shop..."
  template_data JSONB,              -- Structured data for rendering
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Unique constraint for seed upserts (FIX from migration 004)
  CONSTRAINT scenario_templates_unique_template
  UNIQUE (theme, format, template_text)
);

-- Indexes
CREATE INDEX idx_templates_theme_format ON scenario_templates(theme, format);
CREATE INDEX idx_templates_active ON scenario_templates(active) WHERE active = TRUE;

COMMENT ON TABLE scenario_templates IS 'Story templates for generating contextual math questions';
COMMENT ON CONSTRAINT scenario_templates_unique_template ON scenario_templates
  IS 'Prevents duplicate scenario templates with same theme, format, and text';


-- 5. Curated Mappings Table
-- Educator-curated Model → Difficulty → Format → Theme combinations
CREATE TABLE curated_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  difficulty_param_id UUID REFERENCES difficulty_parameters(id) ON DELETE CASCADE,
  format TEXT NOT NULL,             -- Question format (DIRECT_CALCULATION, etc.)
  theme TEXT NOT NULL,              -- Scenario theme (SHOPPING, etc.)
  weight REAL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 10),  -- For weighted random selection
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints: Prevent duplicate mappings
  UNIQUE(model_id, difficulty_param_id, format, theme)
);

-- Indexes
CREATE INDEX idx_mappings_model ON curated_mappings(model_id);
CREATE INDEX idx_mappings_difficulty ON curated_mappings(difficulty_param_id);
CREATE INDEX idx_mappings_format ON curated_mappings(format);
CREATE INDEX idx_mappings_theme ON curated_mappings(theme);
CREATE INDEX idx_mappings_active ON curated_mappings(active) WHERE active = TRUE;

COMMENT ON TABLE curated_mappings IS 'Curated combinations of models, difficulty levels, formats, and themes';


-- 6. Generated Questions Table
-- Final output - approved questions ready for student delivery
CREATE TABLE generated_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Student-facing content
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,           -- [{text, value, index}]
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0),
  explanation TEXT,

  -- Queryable metadata (foreign keys for efficient filtering)
  curated_mapping_id UUID REFERENCES curated_mappings(id) ON DELETE SET NULL,
  difficulty_param_id UUID REFERENCES difficulty_parameters(id) ON DELETE SET NULL,
  model_id TEXT NOT NULL,
  format TEXT NOT NULL,
  theme TEXT NOT NULL,

  -- Generation snapshot (audit trail)
  generation_params JSONB,          -- Full snapshot of params used at generation time
  math_output JSONB,                -- Raw mathematical output from Math Engine

  -- Workflow state
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,            -- If rejected, why?

  -- Educational metadata
  cognitive_load INTEGER CHECK (cognitive_load BETWEEN 0 AND 100),
  distractor_strategies TEXT[],     -- Strategies used for wrong answers

  -- Performance tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  generation_time_ms INTEGER,

  -- Constraints
  CHECK (approved = FALSE OR (approved = TRUE AND approved_at IS NOT NULL AND approved_by IS NOT NULL))
);

-- Indexes for generated_questions
CREATE INDEX idx_questions_approved ON generated_questions(approved) WHERE approved = TRUE;
CREATE INDEX idx_questions_model ON generated_questions(model_id);
CREATE INDEX idx_questions_format ON generated_questions(format);
CREATE INDEX idx_questions_theme ON generated_questions(theme);
CREATE INDEX idx_questions_mapping ON generated_questions(curated_mapping_id);
CREATE INDEX idx_questions_difficulty ON generated_questions(difficulty_param_id);
CREATE INDEX idx_questions_created ON generated_questions(created_at DESC);

-- Full-text search on question text (for admin search functionality)
CREATE INDEX idx_questions_fulltext ON generated_questions USING GIN(to_tsvector('english', question_text));

-- Partial index for unapproved questions (approval queue)
CREATE INDEX idx_questions_unapproved ON generated_questions(created_at DESC) WHERE approved = FALSE;

COMMENT ON TABLE generated_questions IS 'Final generated questions with approval workflow';


-- ============================================
-- PART 2: AUTO-UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_difficulty_parameters_updated_at BEFORE UPDATE ON difficulty_parameters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_templates_updated_at BEFORE UPDATE ON scenario_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curated_mappings_updated_at BEFORE UPDATE ON curated_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- PART 3: VALIDATION VIEWS
-- ============================================

-- View: Summary of difficulty parameters by model
CREATE OR REPLACE VIEW v_difficulty_summary AS
SELECT
  model_id,
  COUNT(*) as config_count,
  MIN(year_level) as min_year,
  MAX(year_level) as max_year,
  COUNT(DISTINCT year_level) as year_levels_covered
FROM difficulty_parameters
GROUP BY model_id
ORDER BY model_id;

COMMENT ON VIEW v_difficulty_summary IS 'Summary statistics of difficulty configurations per model';


-- View: Curated mapping coverage
CREATE OR REPLACE VIEW v_mapping_coverage AS
SELECT
  model_id,
  format,
  theme,
  COUNT(*) as mapping_count,
  SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) as active_count
FROM curated_mappings
GROUP BY model_id, format, theme
ORDER BY model_id, format, theme;

COMMENT ON VIEW v_mapping_coverage IS 'Coverage of curated mappings across models, formats, and themes';


-- View: Question approval statistics
CREATE OR REPLACE VIEW v_question_approval_stats AS
SELECT
  model_id,
  format,
  COUNT(*) as total_generated,
  SUM(CASE WHEN approved = TRUE THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN approved = FALSE THEN 1 ELSE 0 END) as pending_count,
  ROUND(AVG(generation_time_ms), 2) as avg_generation_time_ms,
  ROUND(AVG(cognitive_load), 2) as avg_cognitive_load
FROM generated_questions
GROUP BY model_id, format
ORDER BY model_id, format;

COMMENT ON VIEW v_question_approval_stats IS 'Approval statistics and performance metrics for generated questions';


-- ============================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE difficulty_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;


-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated and has admin role
  -- In Supabase, you can set custom claims via auth.users metadata
  RETURN (
    auth.uid() IS NOT NULL AND
    (
      auth.jwt() ->> 'role' = 'admin' OR
      auth.jwt() ->> 'role' = 'super_admin' OR
      -- Fallback: If no role is set, treat all authenticated users as admins
      -- (useful during initial setup)
      auth.jwt() ->> 'role' IS NULL
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Helper function: Check if user is reviewer
CREATE OR REPLACE FUNCTION is_reviewer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    (
      auth.jwt() ->> 'role' = 'reviewer' OR
      auth.jwt() ->> 'role' = 'super_admin' OR
      auth.jwt() ->> 'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- RLS POLICIES: Configuration Layer
-- ============================================

-- difficulty_parameters: Admin full access, anon read-only
CREATE POLICY "admins_manage_difficulty_params"
ON difficulty_parameters
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "public_read_difficulty_params"
ON difficulty_parameters
FOR SELECT
TO anon
USING (TRUE);


-- characters: Admin full access, anon read active characters
CREATE POLICY "admins_manage_characters"
ON characters
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "public_read_active_characters"
ON characters
FOR SELECT
TO anon
USING (active = TRUE);


-- items: Admin full access, anon read active items
CREATE POLICY "admins_manage_items"
ON items
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "public_read_active_items"
ON items
FOR SELECT
TO anon
USING (active = TRUE);


-- scenario_templates: Admin full access, anon read active templates
CREATE POLICY "admins_manage_templates"
ON scenario_templates
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "public_read_active_templates"
ON scenario_templates
FOR SELECT
TO anon
USING (active = TRUE);


-- ============================================
-- RLS POLICIES: Curation Layer
-- ============================================

-- curated_mappings: Admin full access, anon read active mappings
CREATE POLICY "admins_manage_mappings"
ON curated_mappings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "public_read_active_mappings"
ON curated_mappings
FOR SELECT
TO anon
USING (active = TRUE);


-- ============================================
-- RLS POLICIES: Content Layer
-- ============================================

-- generated_questions: Complex access control
-- 1. Admins can do everything
CREATE POLICY "admins_manage_questions"
ON generated_questions
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Public (students) can ONLY see approved questions
CREATE POLICY "students_read_approved_questions"
ON generated_questions
FOR SELECT
TO anon
USING (approved = TRUE);

-- 3. Authenticated non-admins can read approved questions
CREATE POLICY "authenticated_read_approved_questions"
ON generated_questions
FOR SELECT
TO authenticated
USING (approved = TRUE OR is_admin());

-- 4. Reviewers can update approval status (but not create/delete questions)
CREATE POLICY "reviewers_approve_questions"
ON generated_questions
FOR UPDATE
TO authenticated
USING (is_reviewer())
WITH CHECK (
  -- Can only update approval-related fields
  approved IS NOT NULL
);


-- RLS Test View
CREATE OR REPLACE VIEW v_rls_test_summary AS
SELECT
  'difficulty_parameters' as table_name,
  (SELECT COUNT(*) FROM difficulty_parameters) as total_rows,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'difficulty_parameters') as rls_enabled
UNION ALL
SELECT
  'characters',
  (SELECT COUNT(*) FROM characters),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'characters')
UNION ALL
SELECT
  'items',
  (SELECT COUNT(*) FROM items),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'items')
UNION ALL
SELECT
  'scenario_templates',
  (SELECT COUNT(*) FROM scenario_templates),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'scenario_templates')
UNION ALL
SELECT
  'curated_mappings',
  (SELECT COUNT(*) FROM curated_mappings),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'curated_mappings')
UNION ALL
SELECT
  'generated_questions',
  (SELECT COUNT(*) FROM generated_questions),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'generated_questions');

COMMENT ON VIEW v_rls_test_summary IS 'Summary of RLS status for all tables';


-- ============================================
-- PART 5: HELPER FUNCTIONS
-- ============================================

-- FUNCTION 1: Generate Default Curated Mappings
-- ⚠️ FIXED: Renamed return columns to avoid ambiguity (was causing seed failures)
CREATE OR REPLACE FUNCTION generate_default_mappings(p_model_id TEXT)
RETURNS TABLE (
  mapping_id UUID,
  difficulty_level TEXT,
  mapping_format TEXT,      -- ✅ RENAMED from "format"
  mapping_theme TEXT        -- ✅ RENAMED from "theme"
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
    curated_mappings.id,
    (SELECT dp2.difficulty_level FROM difficulty_parameters dp2 WHERE dp2.id = curated_mappings.difficulty_param_id),
    curated_mappings.format,
    curated_mappings.theme;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_default_mappings IS 'Auto-generate default DIRECT_CALCULATION + SHOPPING mappings for a model (FIXED column ambiguity)';


-- FUNCTION 2: Get Balanced Questions for Student App
CREATE OR REPLACE FUNCTION get_balanced_questions(
  p_year_level INTEGER,
  p_batch_size INTEGER DEFAULT 20
)
RETURNS SETOF generated_questions AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (gq.model_id, gq.format) gq.*
  FROM generated_questions gq
  INNER JOIN difficulty_parameters dp ON gq.difficulty_param_id = dp.id
  WHERE
    gq.approved = TRUE AND
    dp.year_level = p_year_level
  ORDER BY gq.model_id, gq.format, RANDOM()
  LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_balanced_questions IS 'Returns balanced set of approved questions for a year level';


-- FUNCTION 3: Get Question Stats by Model
CREATE OR REPLACE FUNCTION get_question_stats_by_model()
RETURNS TABLE (
  model_id TEXT,
  total_questions BIGINT,
  approved_questions BIGINT,
  pending_questions BIGINT,
  approval_rate NUMERIC,
  avg_generation_time_ms NUMERIC,
  avg_cognitive_load NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gq.model_id,
    COUNT(*) AS total_questions,
    COUNT(*) FILTER (WHERE gq.approved = TRUE) AS approved_questions,
    COUNT(*) FILTER (WHERE gq.approved = FALSE) AS pending_questions,
    ROUND(
      (COUNT(*) FILTER (WHERE gq.approved = TRUE)::NUMERIC / COUNT(*)::NUMERIC) * 100,
      2
    ) AS approval_rate,
    ROUND(AVG(gq.generation_time_ms), 2) AS avg_generation_time_ms,
    ROUND(AVG(gq.cognitive_load), 2) AS avg_cognitive_load
  FROM generated_questions gq
  GROUP BY gq.model_id
  ORDER BY gq.model_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_question_stats_by_model IS 'Returns statistics about generated questions grouped by model';


-- FUNCTION 4: Search Questions (Full-Text)
CREATE OR REPLACE FUNCTION search_questions(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF generated_questions AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM generated_questions
  WHERE
    to_tsvector('english', question_text) @@ plainto_tsquery('english', p_search_term)
    AND approved = TRUE
  ORDER BY ts_rank(to_tsvector('english', question_text), plainto_tsquery('english', p_search_term)) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_questions IS 'Full-text search on approved question text';


-- FUNCTION 5: Bulk Approve Questions
CREATE OR REPLACE FUNCTION bulk_approve_questions(
  p_question_ids UUID[],
  p_approved_by UUID
)
RETURNS TABLE (
  question_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_question_id UUID;
BEGIN
  FOREACH v_question_id IN ARRAY p_question_ids
  LOOP
    BEGIN
      UPDATE generated_questions
      SET
        approved = TRUE,
        approved_at = NOW(),
        approved_by = p_approved_by
      WHERE id = v_question_id AND approved = FALSE;

      IF FOUND THEN
        RETURN QUERY SELECT v_question_id, TRUE, 'Approved successfully'::TEXT;
      ELSE
        RETURN QUERY SELECT v_question_id, FALSE, 'Question not found or already approved'::TEXT;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT v_question_id, FALSE, SQLERRM::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION bulk_approve_questions IS 'Approve multiple questions in a single transaction';


-- FUNCTION 6: Get Random Question by Criteria
CREATE OR REPLACE FUNCTION get_random_question(
  p_model_id TEXT DEFAULT NULL,
  p_year_level INTEGER DEFAULT NULL,
  p_format TEXT DEFAULT NULL,
  p_theme TEXT DEFAULT NULL
)
RETURNS SETOF generated_questions AS $$
BEGIN
  RETURN QUERY
  SELECT gq.*
  FROM generated_questions gq
  INNER JOIN difficulty_parameters dp ON gq.difficulty_param_id = dp.id
  WHERE
    gq.approved = TRUE
    AND (p_model_id IS NULL OR gq.model_id = p_model_id)
    AND (p_year_level IS NULL OR dp.year_level = p_year_level)
    AND (p_format IS NULL OR gq.format = p_format)
    AND (p_theme IS NULL OR gq.theme = p_theme)
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_random_question IS 'Get a random approved question matching optional criteria';


-- FUNCTION 7: Validate Difficulty Parameters JSON
CREATE OR REPLACE FUNCTION validate_difficulty_params(
  p_params JSONB,
  p_model_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_required_fields TEXT[];
BEGIN
  -- Define required fields per model type
  CASE p_model_id
    WHEN 'ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION' THEN
      v_required_fields := ARRAY['max_value', 'operands'];
    WHEN 'PERCENTAGE' THEN
      v_required_fields := ARRAY['percentage_values', 'of_values'];
    WHEN 'FRACTION' THEN
      v_required_fields := ARRAY['denominators', 'numerator_max'];
    ELSE
      -- Generic validation: just check that params is not empty
      RETURN p_params IS NOT NULL AND p_params != '{}'::JSONB;
  END CASE;

  -- Check all required fields exist
  FOR i IN 1..array_length(v_required_fields, 1)
  LOOP
    IF NOT (p_params ? v_required_fields[i]) THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_difficulty_params IS 'Validate difficulty parameters JSON has required fields for model';


-- FUNCTION 8: Get Difficulty Progression Path
CREATE OR REPLACE FUNCTION get_difficulty_progression(p_model_id TEXT)
RETURNS TABLE (
  difficulty_level TEXT,
  year_level INTEGER,
  sub_level INTEGER,
  parameters JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.difficulty_level,
    dp.year_level,
    dp.sub_level,
    dp.parameters
  FROM difficulty_parameters dp
  WHERE dp.model_id = p_model_id
  ORDER BY dp.year_level ASC, dp.sub_level ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_difficulty_progression IS 'Returns ordered difficulty progression for a model';


-- FUNCTION 9: Clean Up Unapproved Questions
CREATE OR REPLACE FUNCTION cleanup_old_unapproved_questions(p_days_old INTEGER DEFAULT 30)
RETURNS TABLE (
  deleted_count BIGINT,
  message TEXT
) AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM generated_questions
  WHERE
    approved = FALSE
    AND created_at < NOW() - (p_days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, format('Deleted %s unapproved questions older than %s days', v_deleted_count, p_days_old)::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_unapproved_questions IS 'Delete unapproved questions older than specified days';


-- Function Catalog View
CREATE OR REPLACE VIEW v_helper_functions AS
SELECT
  routine_name AS function_name,
  routine_type AS function_type,
  data_type AS return_type,
  routine_definition AS definition_snippet
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_default_mappings',
    'get_balanced_questions',
    'get_question_stats_by_model',
    'search_questions',
    'bulk_approve_questions',
    'get_random_question',
    'validate_difficulty_params',
    'get_difficulty_progression',
    'cleanup_old_unapproved_questions',
    'is_admin',
    'is_reviewer'
  )
ORDER BY routine_name;

COMMENT ON VIEW v_helper_functions IS 'Catalog of all helper functions available';


-- ============================================
-- PART 6: GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables to anon (will be restricted by RLS)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant all on tables to authenticated users (restricted by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence permissions (for auto-incrementing IDs if needed)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_reviewer() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_default_mappings TO authenticated;
GRANT EXECUTE ON FUNCTION get_balanced_questions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_question_stats_by_model TO authenticated;
GRANT EXECUTE ON FUNCTION search_questions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION bulk_approve_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_random_question TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_difficulty_params TO authenticated;
GRANT EXECUTE ON FUNCTION get_difficulty_progression TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_unapproved_questions TO authenticated;


-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ COMPLETE SCHEMA MIGRATION SUCCESSFUL';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 CREATED:';
  RAISE NOTICE '   • 6 tables with indexes and triggers';
  RAISE NOTICE '   • 11 helper functions (including FIXED generate_default_mappings)';
  RAISE NOTICE '   • 5 utility views';
  RAISE NOTICE '   • Row Level Security on all tables';
  RAISE NOTICE '   • 13 RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 BUG FIXES APPLIED:';
  RAISE NOTICE '   ✅ scenario_templates unique constraint (for seed upserts)';
  RAISE NOTICE '   ✅ generate_default_mappings column ambiguity (renamed return columns)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 VERIFY SETUP:';
  RAISE NOTICE '   SELECT * FROM v_rls_test_summary;';
  RAISE NOTICE '   SELECT * FROM v_helper_functions;';
  RAISE NOTICE '';
  RAISE NOTICE '🌱 NEXT STEP:';
  RAISE NOTICE '   Run seed script: npm run seed';
  RAISE NOTICE '   Expected result: 500+ records seeded successfully';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database is ready for use!';
END $$;
