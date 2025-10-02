# Quick Database Reset Guide

**Use this if you need to start completely fresh.**

---

## Step 1: Reset Database (2 minutes)

Open **Supabase Studio → SQL Editor** and run:

```sql
-- Complete database reset - deletes ALL data and custom objects
DROP TABLE IF EXISTS generated_questions CASCADE;
DROP TABLE IF EXISTS curated_mappings CASCADE;
DROP TABLE IF EXISTS scenario_templates CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS difficulty_parameters CASCADE;

DROP VIEW IF EXISTS v_question_approval_stats CASCADE;
DROP VIEW IF EXISTS v_mapping_coverage CASCADE;
DROP VIEW IF EXISTS v_difficulty_summary CASCADE;
DROP VIEW IF EXISTS v_rls_test_summary CASCADE;
DROP VIEW IF EXISTS v_helper_functions CASCADE;

DROP FUNCTION IF EXISTS generate_default_mappings(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_balanced_questions(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_question_stats_by_model() CASCADE;
DROP FUNCTION IF EXISTS search_questions(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS bulk_approve_questions(UUID[], UUID) CASCADE;
DROP FUNCTION IF EXISTS get_random_question(TEXT, INTEGER, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS validate_difficulty_params(JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_difficulty_progression(TEXT) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_unapproved_questions(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_reviewer() CASCADE;
```

✅ You should see: "DROP TABLE" messages for each object

---

## Step 2: Run Consolidated Migration (2 minutes)

**In Supabase Studio → SQL Editor**, copy/paste and run the single migration file:

### Single Complete Migration (Includes All Fixes!)
```
File: supabase/migrations/001_complete_schema.sql
Copy entire file → Paste → Run
✅ Expect: "COMPLETE SCHEMA MIGRATION SUCCESSFUL"
```

**This migration includes everything:**
- All 6 tables with indexes and triggers
- Row Level Security policies
- 11 helper functions (with FIXED generate_default_mappings)
- Unique constraints for seed compatibility
- All bug fixes applied

---

## Step 3: Verify Migrations (1 minute)

Run in SQL Editor:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should show: difficulty_parameters, characters, items, scenario_templates, curated_mappings, generated_questions

-- Check RLS is enabled
SELECT * FROM v_rls_test_summary;
-- All 6 tables should show rls_enabled = true

-- Check functions exist
SELECT * FROM v_helper_functions;
-- Should show 11 functions (including is_admin, is_reviewer)
```

---

## Step 4: Run Seed Script (2 minutes)

```bash
npm run seed
```

**Expected Output**:
```
✅ Seeded 116 difficulty parameters
✅ Seeded 33 characters
✅ Seeded 42 items
✅ Seeded 19 scenario templates
✅ Seeded 300+ curated mappings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SEED COMPLETE!
✅ Total records seeded: 500+
```

---

## ✅ Success Checklist

- [ ] Database reset completed (all tables dropped)
- [ ] Migration `001_complete_schema.sql` ran successfully
- [ ] Success message showed "COMPLETE SCHEMA MIGRATION SUCCESSFUL"
- [ ] Verification queries show 6 tables, RLS enabled, 11 functions
- [ ] Seed script completed with 500+ records
- [ ] No errors about "ambiguous column" or "unique constraint"

---

**If seed still fails**, check:
1. Did you run the **consolidated migration** `001_complete_schema.sql`?
2. Did you see "COMPLETE SCHEMA MIGRATION SUCCESSFUL" message?
3. Do verification queries show 11 functions (not 9)?

**Note**: The old migration files (001-004) have been archived. Always use `001_complete_schema.sql`.

**Still having issues?** See troubleshooting in `SUPABASE_IMPLEMENTATION_GUIDE.md`.
