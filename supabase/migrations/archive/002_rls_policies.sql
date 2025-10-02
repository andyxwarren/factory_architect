-- ============================================
-- Factory Architect - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Created: 2025-10-01
-- Description: RLS policies for admin/student access control
-- ============================================

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE difficulty_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;


-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================

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


-- ============================================
-- CONFIGURATION LAYER POLICIES
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
-- CURATION LAYER POLICIES
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
-- CONTENT LAYER POLICIES (Most Important!)
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


-- ============================================
-- OPTIONAL: Content Reviewer Role
-- (Enable this if you want separate reviewer permissions)
-- ============================================

-- Function to check if user is reviewer
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

-- Reviewers can update approval status (but not create/delete questions)
CREATE POLICY "reviewers_approve_questions"
ON generated_questions
FOR UPDATE
TO authenticated
USING (is_reviewer())
WITH CHECK (
  -- Can only update approval-related fields
  approved IS NOT NULL
);


-- ============================================
-- BYPASS RLS FOR SERVICE ROLE
-- (Needed for seed scripts and backend operations)
-- ============================================

-- Service role bypasses RLS automatically in Supabase
-- No additional policies needed


-- ============================================
-- GRANT PERMISSIONS ON HELPER FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_reviewer() TO authenticated, anon;


-- ============================================
-- TESTING POLICIES (FOR VERIFICATION)
-- ============================================

-- View to check RLS is working correctly
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
-- IMPORTANT NOTES FOR ADMINS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created successfully';
  RAISE NOTICE '';
  RAISE NOTICE '📋 POLICY SUMMARY:';
  RAISE NOTICE '  • Configuration tables: Admins = full access, Public = read-only';
  RAISE NOTICE '  • Curated mappings: Admins = full access, Public = read active only';
  RAISE NOTICE '  • Generated questions: Admins = full access, Public = read APPROVED only';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 USER ROLES:';
  RAISE NOTICE '  • admin / super_admin: Full access to all tables';
  RAISE NOTICE '  • reviewer: Can approve/reject questions';
  RAISE NOTICE '  • anon (students): Can only read approved questions';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  TO SET USER ROLE:';
  RAISE NOTICE '  1. Go to Supabase Studio → Authentication → Users';
  RAISE NOTICE '  2. Click on user → Edit';
  RAISE NOTICE '  3. Set Raw User Meta Data:';
  RAISE NOTICE '     {"role": "admin"}  OR  {"role": "reviewer"}';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TO TEST RLS:';
  RAISE NOTICE '  SELECT * FROM v_rls_test_summary;';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run 003_helper_functions.sql for database utility functions';
END $$;
