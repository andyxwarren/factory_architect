# Supabase Implementation Guide
## Factory Architect Database-First CMS Migration

**Status**: ✅ Core Implementation Complete
**Created**: 2025-10-01
**Next Steps**: User setup required → Run migrations → Run seeds → Test

---

## 🎉 What Has Been Implemented

### ✅ Phase 1: Database Schema (1 Consolidated SQL File)
- `supabase/migrations/001_complete_schema.sql` - Complete schema with all tables, RLS, functions, and fixes
  - 6 tables with indexes and triggers
  - Row Level Security policies for admin/student access
  - 11 helper functions (including fixed `generate_default_mappings`)
  - All bug fixes applied (unique constraints, column ambiguity resolved)

### ✅ Phase 2: Seed Scripts (5 TypeScript Files)
- `scripts/seed-all.ts` - Master seed orchestrator
- `scripts/seed-difficulty-parameters.ts` - 144 difficulty configs (6 models × 24 levels)
- `scripts/seed-characters.ts` - 32 UK names
- `scripts/seed-items.ts` - 42 items with realistic pricing
- `scripts/seed-scenario-templates.ts` - 20+ story templates
- `scripts/seed-curated-mappings.ts` - Default model→format→theme mappings

### ✅ Phase 3: Supabase Integration (4 TypeScript Files)
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side client for Next.js
- `lib/supabase/types.ts` - TypeScript interfaces for all tables
- `lib/supabase/database.types.ts` - Auto-generated Supabase types

### ✅ Phase 4: Database-Powered Orchestrator
- `lib/orchestrator/question-orchestrator-supabase.ts` - Reads configs from database
- `lib/validation/difficulty-params.schema.ts` - Zod runtime validation

### ✅ Phase 5: Configuration Files
- `.env.local.example` - Environment variable template
- `package.json` - Added Supabase dependencies + seed scripts
- `docs/proposals/SUPABASE_MIGRATION_PLAN.md` - Complete implementation plan

---

## 🔄 Database Reset (If Needed)

**⚠️ DANGER ZONE**: Only run this if you need to completely wipe your database and start over.

If you need to reset your database to a blank slate (e.g., migrations were run in wrong order):

1. **Open Supabase Studio → SQL Editor**
2. **Run this SQL**:

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

3. **Then proceed with Step 4 below** (run single migration 001_complete_schema.sql)

---

## 🚀 Quick Start: Your Next Steps

### Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Sign in → **New Project**
3. Fill in:
   - **Name**: `factory-architect`
   - **Database Password**: `M#*CefwL9%KHJ#Z`
   - **Region**: `eu-west-2` (UK) or closest to you
4. Click **Create new project** (takes ~2 minutes)

### Step 2: Get Credentials (2 minutes)

1. Navigate to **Project Settings** → **API**
2. Copy these 3 values:
   - **Project URL**: (Done)
   - **Anon/Public Key**: (Done)
   - **Service Role Key**: (Done)
### Step 3: Create .env.local (1 minute)

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and paste your credentials:
NEXT_PUBLIC_SUPABASE_URL=Done
NEXT_PUBLIC_SUPABASE_ANON_KEY=Done
SUPABASE_SERVICE_ROLE_KEY=Done
```

### Step 4: Run Database Migration (5 minutes)

**IMPORTANT**: This is a single consolidated migration with ALL fixes applied.

1. Open **Supabase Studio** → **SQL Editor**
2. Copy/paste the entire contents of: `supabase/migrations/001_complete_schema.sql`
3. Click **"Run"**
4. ✅ You should see success messages including:
   - "COMPLETE SCHEMA MIGRATION SUCCESSFUL"
   - "6 tables with indexes and triggers"
   - "11 helper functions (including FIXED generate_default_mappings)"
   - "Row Level Security on all tables"

**What's included in this migration:**
- All 6 core tables (difficulty_parameters, characters, items, scenario_templates, curated_mappings, generated_questions)
- Row Level Security policies
- 11 helper functions with bug fixes
- Unique constraints for seed script compatibility
- Fixed `generate_default_mappings` function (no more column ambiguity errors!)

**Verify Migrations**:
```sql
-- Check tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should see: difficulty_parameters, characters, items, scenario_templates, curated_mappings, generated_questions

-- Check RLS is enabled
SELECT * FROM v_rls_test_summary;
-- All tables should show rls_enabled = true

-- Check functions exist
SELECT * FROM v_helper_functions;
-- Should see 11 functions (including is_admin, is_reviewer)
```

### Step 5: Install Dependencies (2 minutes)

```bash
npm install
```

**New dependencies installed**:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Next.js Server Components support
- `zod` - Runtime validation
- `dotenv` - Environment variable loading
- `tsx` - TypeScript execution for seed scripts

### Step 6: Run Seed Scripts (5 minutes)

**All bug fixes are now included in the single migration file, so seeds will run successfully!**

```bash
npm run seed
```

**Expected output**:
```
🌱 Starting Factory Architect Database Seed...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Step 1/5: Seeding Difficulty Parameters
  Seeding ADDITION...
    ✓ ADDITION complete
  Seeding SUBTRACTION...
    ✓ SUBTRACTION complete
  Seeding MULTIPLICATION...
    ✓ MULTIPLICATION complete
  Seeding DIVISION...
    ✓ DIVISION complete
  Seeding PERCENTAGE...
    ✓ PERCENTAGE complete
  Seeding FRACTION...
    ✓ FRACTION complete
✅ Seeded 116 difficulty parameters

👤 Step 2/5: Seeding Characters
✅ Seeded 33 characters

🛒 Step 3/5: Seeding Items
✅ Seeded 42 items

📝 Step 4/5: Seeding Scenario Templates
✅ Seeded 19 scenario templates

🔗 Step 5/5: Seeding Curated Mappings
  Generating mappings for ADDITION...
    ✓ Created 24 default mappings
  Generating mappings for SUBTRACTION...
    ✓ Created 24 default mappings
  ... (continues for all models)
  Creating additional format/theme variations...
✅ Seeded 300+ curated mappings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SEED COMPLETE!
✅ Total records seeded: 500+
⏱️  Total time: 6-10s
```

**Note**: Actual counts may vary slightly. Key indicators of success:
- ✅ All 5 steps complete without errors
- ✅ Scenario templates: 19 records
- ✅ Curated mappings: 300+ records
- ✅ Total records: 500+ (not 282 like before the bug fix!)

### Step 7: Verify Data (2 minutes)

**In Supabase Studio → Table Editor**:
- `difficulty_parameters`: Should have 116 rows
- `characters`: 33 rows
- `items`: 42 rows
- `scenario_templates`: 19 rows
- `curated_mappings`: 300+ rows

**Run verification queries**:
```sql
-- Summary of difficulty configs per model
SELECT * FROM v_difficulty_summary;

-- Coverage of curated mappings
SELECT * FROM v_mapping_coverage;

-- Check ADDITION has all 24 difficulty levels
SELECT difficulty_level, parameters->>'max_value' as max_value
FROM difficulty_parameters
WHERE model_id = 'ADDITION'
ORDER BY year_level, sub_level;
```

### Step 8: Create Admin User (3 minutes)

1. **Supabase Studio** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: your email
   - **Password**: secure password
   - ✅ **Auto-confirm user**: Check this
4. Click **Create user**
5. Click on the user → **Edit**
6. Set **Raw User Meta Data**:
   ```json
   {
     "role": "admin"
   }
   ```
7. **Save**

---

## 🧪 Testing the Implementation

### Test 1: Database Connection

```typescript
// Create: test-connection.ts
import { createServiceRoleClient } from '@/lib/supabase/server';

async function testConnection() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('difficulty_parameters')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful!');
    console.log(`Found ${data} difficulty parameters`);
  }
}

testConnection();
```

Run: `npx tsx test-connection.ts`

### Test 2: Generate Question Using Supabase

```typescript
// Create: test-generate.ts
import { createServiceRoleClient } from '@/lib/supabase/server';
import { QuestionOrchestratorSupabase } from '@/lib/orchestrator/question-orchestrator-supabase';

async function testGeneration() {
  const supabase = createServiceRoleClient();
  const orchestrator = new QuestionOrchestratorSupabase(supabase);

  const question = await orchestrator.generateQuestion({
    model_id: 'ADDITION',
    difficulty_level: '3.2',
    format_preference: 'DIRECT_CALCULATION',
    scenario_theme: 'SHOPPING',
    saveToDatabase: true,
    autoApprove: false
  });

  console.log('✅ Question generated!');
  console.log('Question:', question.text);
  console.log('Saved to DB:', question.savedToDatabase);
  console.log('Question ID:', question.questionId);
}

testGeneration();
```

Run: `npx tsx test-generate.ts`

### Test 3: Verify RLS Policies

```typescript
// Test that public (student) users can only see approved questions
import { supabase } from '@/lib/supabase/client'; // Uses anon key

async function testRLS() {
  // This should return 0 rows (no approved questions yet)
  const { data, error } = await supabase
    .from('generated_questions')
    .select('*');

  console.log('Approved questions visible to students:', data?.length || 0);
  // Should be 0 unless you've approved some questions
}

testRLS();
```

---

## 📂 File Structure Overview

```
factory_architect/
├── supabase/
│   └── migrations/              # 🆕 SQL migration files
│       ├── 001_complete_schema.sql   # Single consolidated migration
│       └── archive/             # Old migrations (for reference)
│           ├── 001_initial_schema.sql
│           ├── 002_rls_policies.sql
│           ├── 003_helper_functions.sql
│           └── 004_fix_seed_issues.sql
├── scripts/                     # 🆕 Seed scripts
│   ├── seed-all.ts
│   ├── seed-difficulty-parameters.ts
│   ├── seed-characters.ts
│   ├── seed-items.ts
│   ├── seed-scenario-templates.ts
│   └── seed-curated-mappings.ts
├── lib/
│   ├── supabase/                # 🆕 Supabase integration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── types.ts
│   │   └── database.types.ts
│   ├── orchestrator/
│   │   └── question-orchestrator-supabase.ts  # 🆕 DB-powered orchestrator
│   └── validation/              # 🆕 Runtime validation
│       └── difficulty-params.schema.ts
├── .env.local.example           # 🆕 Environment template
├── package.json                 # 🔄 Updated with Supabase deps
└── docs/
    └── proposals/
        ├── SUPABASE_MIGRATION_PLAN.md  # 🆕 Complete plan
        └── SUPABASE_IMPLEMENTATION_GUIDE.md  # 📄 This file
```

---

## 🎯 What Works Now

### ✅ Database-Driven Question Generation
```typescript
import { createServiceRoleClient } from '@/lib/supabase/server';
import { QuestionOrchestratorSupabase } from '@/lib/orchestrator/question-orchestrator-supabase';

const supabase = createServiceRoleClient();
const orchestrator = new QuestionOrchestratorSupabase(supabase);

// Generates question using database configs
const question = await orchestrator.generateQuestion({
  model_id: 'ADDITION',
  difficulty_level: '3.2',
  saveToDatabase: true
});
```

### ✅ Query Difficulty Configurations
```typescript
import { supabase } from '@/lib/supabase/client';

// Get all ADDITION difficulty levels
const { data } = await supabase
  .from('difficulty_parameters')
  .select('*')
  .eq('model_id', 'ADDITION')
  .order('year_level', { ascending: true });
```

### ✅ Curated Mapping Management
```typescript
// Get mappings for MULTIPLICATION at Year 4
const { data } = await supabase
  .from('curated_mappings')
  .select(`
    *,
    difficulty_parameters (*)
  `)
  .eq('model_id', 'MULTIPLICATION')
  .eq('active', true);
```

### ✅ Question Approval Workflow
```typescript
import { approveQuestion } from '@/lib/orchestrator/question-orchestrator-supabase';

await approveQuestion(supabase, questionId, adminUserId);
```

---

## 🚧 What's NOT Implemented Yet (Future Phases)

### Phase 6: Admin UI (Not Started)
Files that need to be created:
- `app/admin/layout.tsx` - Admin dashboard
- `app/admin/difficulty-parameters/page.tsx` - Config management
- `app/admin/curated-mappings/page.tsx` - Curation interface
- `app/admin/generate/page.tsx` - Preview & generation
- `app/admin/approval-queue/page.tsx` - Approval workflow
- `app/auth/login/page.tsx` - Admin authentication
- `middleware.ts` - Route protection

### Phase 7: Student App Integration (Not Started)
- `app/api/student/questions/route.ts` - Public API
- `app/student/questions/[yearLevel]/page.tsx` - Student interface
- Question delivery with RLS enforcement

### Phase 8: Real-Time Features (Not Started)
- Live approval notifications
- Collaborative editing indicators
- Real-time configuration updates

---

## 🐛 Troubleshooting

### Issue: Seed script fails with "Failed to connect to Supabase"
**Solution**:
1. Check `.env.local` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Verify migration `001_complete_schema.sql` was run in Supabase Studio
3. Check Supabase project is not paused (free tier auto-pauses after 1 week inactivity)

### Issue: RLS policy blocks admin user
**Solution**:
1. Go to Supabase Studio → Authentication → Users → (your user)
2. Click **Edit** → Set **Raw User Meta Data**:
   ```json
   {
     "role": "admin"
   }
   ```
3. Save and retry

### Issue: TypeScript errors about missing types
**Solution**:
```bash
# Re-generate types from your Supabase schema
npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/database.types.ts
```

### Issue: Cannot find module '@supabase/supabase-js'
**Solution**:
```bash
npm install
```

### Issue: Seed script fails with "no unique or exclusion constraint" or "column reference is ambiguous"
**Symptoms**:
```
❌ Failed to seed scenario templates: there is no unique or exclusion constraint
❌ Failed to generate mappings: column reference "format" is ambiguous
Total: 282 records (should be 500+)
```

**Solution**:
This happens if you're using old migration files. The consolidated migration fixes this:

1. **Follow the database reset procedure** (see RESET_DATABASE.md or below)
2. **Run the consolidated migration**: `001_complete_schema.sql` in Supabase Studio
3. **Re-run seed**:
   ```bash
   npm run seed
   ```

Expected: All 5 steps complete successfully with 500+ total records.

**Note**: The old migration files (001-004) have been archived. Always use `001_complete_schema.sql` for clean setups.

---

## 📊 Database Statistics (After Seeding)

| Table | Records | Purpose |
|-------|---------|---------|
| `difficulty_parameters` | 116 | 6 models × multiple sub-levels |
| `characters` | 33 | Character names for stories |
| `items` | 42 | Items with pricing data |
| `scenario_templates` | 19 | Story templates |
| `curated_mappings` | 300+ | Model→format→theme combinations |
| `generated_questions` | 0 | Questions (populated as you generate) |

**Total configuration records**: ~510+

---

## 🎓 Key Concepts

### Difficulty Parameters (JSONB Storage)
Each model stores its parameters as JSON:
```json
{
  "max_value": 60,
  "operands": 3,
  "carrying": "common",
  "decimal_places": 0
}
```

**Benefits**:
- Flexible: Add new params without schema changes
- Queryable: Use PostgreSQL JSONB operators (`->`, `->>`, `@>`)
- Version-safe: Old questions preserve exact generation params

### Curated Mappings (Explicit vs Algorithmic)
Instead of algorithmically generating every combination, educators **curate** which combinations make sense:
```
ADDITION + Year 3.2 + DIRECT_CALCULATION + SHOPPING ✅
ADDITION + Year 3.2 + COMPARISON + COOKING ❌ (doesn't make pedagogical sense)
```

### Row Level Security (RLS)
- **Students (anon)**: Can only SELECT approved questions
- **Admins (authenticated with role='admin')**: Full access
- **Service Role**: Bypasses RLS (use carefully!)

---

## 🔗 Related Documentation

- **Complete Implementation Plan**: `docs/proposals/SUPABASE_MIGRATION_PLAN.md`
- **API Specification**: `docs/architecture/API_SPECIFICATION.md`
- **Enhanced System Guide**: `docs/implementation/ENHANCED_QUESTION_SYSTEM.md`
- **System Architecture**: `docs/architecture/OVERVIEW.md`

---

## ✅ Checklist: Are You Ready?

- [ ] Supabase project created
- [ ] `.env.local` configured with credentials
- [ ] Migration `001_complete_schema.sql` run in Supabase Studio
- [ ] `npm install` completed
- [ ] Seed script run successfully (`npm run seed`) - should show 500+ records
- [ ] Data verified in Supabase Studio (116 difficulty params, 33 characters, 42 items, 19 templates, 300+ mappings)
- [ ] Admin user created with `role: admin`
- [ ] Test connection script passes
- [ ] Test generation script creates a question

**If all checked**: ✅ **Core implementation is working!**

---

*For questions or issues, refer to the troubleshooting section above or review the complete migration plan.*
