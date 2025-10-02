# Supabase Migration Implementation Plan

## Project: Factory Architect Database-First CMS Architecture

**Document Version:** 1.0
**Created:** 2025-10-01
**Status:** Planning Phase
**Estimated Timeline:** 4-6 weeks

---

## Executive Summary

This plan outlines the migration of Factory Architect from a file-based configuration system to a Supabase-powered database-first CMS architecture. The migration transforms the application from a real-time generator into a professional content management system where education experts configure, curate, preview, approve, and generate mathematical questions that are stored in a database for delivery to student applications.

### Key Benefits
- ✅ **PostgreSQL with JSONB**: Full query power over 600+ difficulty configurations
- ✅ **Row Level Security**: Built-in authorization for admin workflows
- ✅ **Real-Time Collaboration**: Multiple curriculum designers working simultaneously
- ✅ **Supabase Storage**: Future support for diagrams and visual questions
- ✅ **Built-in Admin UI**: Supabase Studio for rapid prototyping
- ✅ **Automatic Scaling**: Production-ready infrastructure from day one

---

## Prerequisites

### User Actions Required (Before Implementation)

#### 1. Create Supabase Project
**Time Required:** 5 minutes

1. Go to [supabase.com](https://supabase.com)
2. Sign in with GitHub (or create account)
3. Click "New Project"
4. Fill in:
   - **Project Name:** `factory-architect` (or your preference)
   - **Database Password:** (save this securely - you'll need it)
   - **Region:** Choose closest to your users (e.g., `eu-west-2` for UK)
   - **Pricing Plan:** Free tier is sufficient for development
5. Click "Create new project" (takes ~2 minutes to provision)

#### 2. Get Supabase Credentials
**Time Required:** 2 minutes

Once project is created:

1. Navigate to **Project Settings** (gear icon) → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys:**
     - `anon` / `public` key (for student app - public access)
     - `service_role` key (for admin/seed scripts - full access) ⚠️ Keep secret!

3. Add to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. Enable Required Supabase Features
**Time Required:** 3 minutes

1. Navigate to **Authentication** → **Providers**
   - Enable **Email** provider (for admin login)
   - Optional: Enable **Google** or **GitHub** OAuth for easier admin access

2. Navigate to **Database** → **Extensions**
   - Ensure `uuid-ossp` is enabled (should be by default)
   - Ensure `pg_trgm` is enabled (for full-text search)

3. Navigate to **Storage**
   - Create bucket named `question-assets` (for future diagram uploads)
   - Set to **Private** (we'll use RLS for access control)

#### 4. Create First Admin User
**Time Required:** 2 minutes

1. Navigate to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email:** your admin email
   - **Password:** secure password
   - **Auto-confirm user:** ✅ Check this
4. Click "Create user"
5. Note down this email - you'll use it to test the admin UI

---

## Implementation Phases

### ✅ **Phase 1: Database Schema Setup** (Week 1 - Days 1-2)

**Goal:** Create database tables, indexes, and RLS policies in Supabase

**Implementation Steps:**

1. **Run Schema SQL Script**
   - Script location: `supabase/migrations/001_initial_schema.sql`
   - Execute in: Supabase Studio → SQL Editor
   - Creates 6 core tables:
     - `difficulty_parameters` (600+ configs)
     - `characters` (32 names)
     - `items` (50+ items with pricing)
     - `scenario_templates` (20+ templates)
     - `curated_mappings` (model-format-theme combinations)
     - `generated_questions` (final output)

2. **Enable Row Level Security**
   - Script location: `supabase/migrations/002_rls_policies.sql`
   - Policies created:
     - Admins can manage all configuration tables
     - Public (anon) can only read approved questions
     - Reviewers can update approval status

3. **Create Database Functions**
   - Script location: `supabase/migrations/003_helper_functions.sql`
   - Functions:
     - `generate_default_mappings(model_id)` - Auto-populate curated mappings
     - `get_balanced_questions(year_level, batch_size)` - Student app sampling

**Deliverables:**
- ✅ Database schema created
- ✅ RLS policies active
- ✅ Helper functions available
- ✅ Verify with Supabase Studio table editor

---

### ✅ **Phase 2: Data Migration (Seed Scripts)** (Week 1 - Days 3-5)

**Goal:** Migrate 600+ hardcoded configurations from TypeScript files to Supabase

**Implementation Steps:**

1. **Seed Difficulty Parameters**
   - Script: `scripts/seed-difficulty-parameters.ts`
   - Source: `lib/math-engine/difficulty-enhanced.ts`
   - Records: ~600 (6 models × 24 sub-levels × 4 variants)
   - Validation: Zod schemas ensure data integrity

2. **Seed Characters**
   - Script: `scripts/seed-characters.ts`
   - Source: `lib/services/scenario.service.ts:867-875`
   - Records: 32 UK names with gender/cultural context

3. **Seed Items**
   - Script: `scripts/seed-items.ts`
   - Source: `lib/services/scenario.service.ts:1076-1107`
   - Records: 50+ items with realistic UK pricing

4. **Seed Scenario Templates**
   - Script: `scripts/seed-scenario-templates.ts`
   - Source: Manual curation (based on current controller logic)
   - Records: 20+ templates for format-theme combinations

5. **Generate Default Curated Mappings**
   - Script: `scripts/seed-curated-mappings.ts`
   - Logic: For each model, create DIRECT_CALCULATION + SHOPPING mappings
   - Records: ~600 default mappings

**Run Commands:**
```bash
# Install dependencies
npm install @supabase/supabase-js tsx zod

# Run all seeds (order matters!)
npx tsx scripts/seed-all.ts
```

**Deliverables:**
- ✅ 600+ difficulty parameters in database
- ✅ 32 characters ready for use
- ✅ 50+ items with pricing data
- ✅ 20+ scenario templates
- ✅ 600+ default curated mappings
- ✅ Verification report showing counts

---

### ✅ **Phase 3: Application Integration** (Week 2 - Days 1-5)

**Goal:** Modify QuestionOrchestrator to read from Supabase instead of hardcoded files

**Implementation Steps:**

1. **Install Supabase Client Libraries**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Create Supabase Client Utilities**
   - File: `lib/supabase/client.ts` (browser client)
   - File: `lib/supabase/server.ts` (server-side client for Next.js)
   - File: `lib/supabase/types.ts` (TypeScript types from database)

3. **Generate TypeScript Types from Database**
   ```bash
   npx supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
   ```

4. **Create Supabase-Powered Orchestrator**
   - File: `lib/orchestrator/question-orchestrator-supabase.ts`
   - Features:
     - Fetch difficulty params from database
     - Fetch curated mappings
     - Generate questions using existing controllers
     - Save generated questions to database
     - Batch generation with balanced sampling

5. **Update API Routes**
   - Modify: `app/api/generate/enhanced/route.ts`
   - Change: Use `QuestionOrchestratorSupabase` instead of hardcoded configs
   - Add: Save generated questions to database (unapproved by default)

6. **Backward Compatibility Layer**
   - File: `lib/adapters/legacy-to-supabase.ts`
   - Purpose: Legacy `/api/generate` endpoint still works
   - Logic: Fetch from Supabase but return same JSON structure

**Deliverables:**
- ✅ Supabase client configured
- ✅ TypeScript types generated
- ✅ QuestionOrchestrator reads from database
- ✅ API endpoints use Supabase
- ✅ Existing API responses unchanged (backward compatible)

---

### ✅ **Phase 4: Admin UI Foundation** (Week 3 - Days 1-5)

**Goal:** Build admin interface for Configure → Curate → Preview → Approve workflow

**Implementation Steps:**

1. **Set Up Supabase Auth in Next.js**
   - File: `app/auth/login/page.tsx` (admin login)
   - File: `app/auth/callback/route.ts` (OAuth callback)
   - File: `middleware.ts` (protect admin routes)
   - Auth: Email/password + optional OAuth

2. **Admin Dashboard Layout**
   - File: `app/admin/layout.tsx`
   - Features:
     - Navigation sidebar
     - User profile dropdown
     - Real-time connection indicator
     - Breadcrumb navigation

3. **Configuration Management Pages**
   - Page: `app/admin/difficulty-parameters/page.tsx`
     - List all difficulty configs
     - Filter by model, year level, sub-level
     - Edit JSON parameters with schema validation
     - Initially use Supabase Studio, migrate to custom UI later

   - Page: `app/admin/characters/page.tsx`
     - CRUD for character names
     - Gender/cultural context management

   - Page: `app/admin/items/page.tsx`
     - CRUD for items with pricing
     - Category and theme assignment

   - Page: `app/admin/scenario-templates/page.tsx`
     - Template text editor with variable substitution
     - Preview template rendering

4. **Curation Interface**
   - Page: `app/admin/curated-mappings/page.tsx`
     - Visual drag-drop interface (optional, v2)
     - Table view: Model → Difficulty → Format → Theme → Weight
     - Bulk create mappings for a model
     - Call `generate_default_mappings()` function

5. **Preview & Generation Interface**
   - Page: `app/admin/generate/page.tsx`
     - Select curated mapping
     - Generate 1-20 sample questions
     - View side-by-side: question text, options, generation params
     - "Approve" or "Regenerate" actions

6. **Approval Queue**
   - Page: `app/admin/approval-queue/page.tsx`
     - List all unapproved questions
     - Batch approval (select multiple, approve all)
     - Filter by model, difficulty, format, theme
     - Real-time updates when other admins approve

**Deliverables:**
- ✅ Admin authentication working
- ✅ CRUD interfaces for all configuration tables
- ✅ Curation UI for creating mappings
- ✅ Preview interface for generating questions
- ✅ Approval queue for quality control

---

### ✅ **Phase 5: Student App Integration** (Week 4 - Days 1-5)

**Goal:** Separate student-facing app that reads approved questions from Supabase

**Implementation Steps:**

1. **Create Public API Endpoint**
   - File: `app/api/student/questions/route.ts`
   - Features:
     - Read-only access (no auth required)
     - Returns only `approved = TRUE` questions
     - Pagination support
     - Filter by year level, model, format
     - RLS enforces approved-only access

2. **Student Question Fetching Logic**
   - File: `app/student/questions/[yearLevel]/page.tsx`
   - Features:
     - Fetch 20 balanced questions for year level
     - Uses `get_balanced_questions()` database function
     - Infinite scroll or pagination
     - Shuffle options on client side

3. **Question Display Component**
   - File: `components/student/QuestionCard.tsx`
   - Features:
     - Display question text
     - Render multiple choice options
     - Handle answer selection
     - Show explanation after answer

4. **Performance Optimization**
   - Enable Supabase caching
   - Create materialized view for frequently accessed questions
   - Add CDN caching headers for approved questions

**Deliverables:**
- ✅ Student API endpoint (public, read-only)
- ✅ Student question display page
- ✅ RLS policies prevent unapproved questions from being accessed
- ✅ Performance optimized for 1000s of questions

---

### ✅ **Phase 6: Real-Time Features** (Week 5 - Optional Enhancement)

**Goal:** Add collaborative features using Supabase real-time subscriptions

**Implementation Steps:**

1. **Real-Time Approval Notifications**
   - File: `app/admin/approval-queue/page.tsx`
   - Feature: Auto-refresh when questions are approved by other admins
   ```typescript
   const subscription = supabase
     .channel('approval_updates')
     .on('postgres_changes', {
       event: 'UPDATE',
       schema: 'public',
       table: 'generated_questions',
       filter: 'approved=eq.true'
     }, (payload) => {
       // Update UI with new approval
     })
     .subscribe();
   ```

2. **Live Configuration Updates**
   - Feature: When Admin A creates new character, Admin B sees it immediately
   - Tables: `characters`, `items`, `scenario_templates`, `curated_mappings`

3. **Collaborative Curation**
   - Feature: Show who is editing which mapping (presence indicators)
   - Use Supabase presence for "Admin B is editing ADDITION mappings"

**Deliverables:**
- ✅ Real-time approval notifications
- ✅ Live configuration updates
- ✅ Presence indicators for collaborative editing

---

## File Structure After Migration

```
factory_architect/
├── app/
│   ├── admin/                          # 🆕 Admin CMS interface
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── difficulty-parameters/page.tsx
│   │   ├── characters/page.tsx
│   │   ├── items/page.tsx
│   │   ├── scenario-templates/page.tsx
│   │   ├── curated-mappings/page.tsx
│   │   ├── generate/page.tsx
│   │   └── approval-queue/page.tsx
│   ├── auth/                           # 🆕 Admin authentication
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── student/                        # 🆕 Student-facing app
│   │   └── questions/[yearLevel]/page.tsx
│   ├── api/
│   │   ├── generate/enhanced/route.ts  # 🔄 Modified to use Supabase
│   │   └── student/questions/route.ts  # 🆕 Public read-only endpoint
│   └── middleware.ts                   # 🆕 Route protection
├── lib/
│   ├── supabase/                       # 🆕 Supabase integration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── types.ts
│   │   └── database.types.ts           # Generated from schema
│   ├── orchestrator/
│   │   ├── question-orchestrator.ts    # Existing (legacy)
│   │   └── question-orchestrator-supabase.ts  # 🆕 Database-powered
│   ├── adapters/
│   │   └── legacy-to-supabase.ts       # 🆕 Backward compatibility
│   └── validation/                     # 🆕 Runtime validation
│       ├── difficulty-params.schema.ts
│       └── question-output.schema.ts
├── scripts/                            # 🆕 Data migration scripts
│   ├── seed-all.ts
│   ├── seed-difficulty-parameters.ts
│   ├── seed-characters.ts
│   ├── seed-items.ts
│   ├── seed-scenario-templates.ts
│   └── seed-curated-mappings.ts
├── supabase/                           # 🆕 Supabase configuration
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_helper_functions.sql
├── components/
│   ├── admin/                          # 🆕 Admin UI components
│   │   ├── DifficultyParamEditor.tsx
│   │   ├── MappingBuilder.tsx
│   │   └── QuestionPreview.tsx
│   └── student/                        # 🆕 Student UI components
│       └── QuestionCard.tsx
├── docs/
│   └── proposals/
│       └── SUPABASE_MIGRATION_PLAN.md  # 📄 This document
├── .env.local                          # 🔄 Add Supabase credentials
└── package.json                        # 🔄 Add @supabase/supabase-js
```

---

## Database Schema Reference

### Configuration Layer

#### `difficulty_parameters`
Stores all 600+ difficulty configurations (previously hardcoded in `difficulty-enhanced.ts`)

```sql
CREATE TABLE difficulty_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,  -- "3.2"
  year_level INTEGER NOT NULL,     -- 3
  sub_level INTEGER NOT NULL,      -- 2
  parameters JSONB NOT NULL,       -- All model-specific params
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(model_id, difficulty_level)
);
```

**Example Record:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "model_id": "ADDITION",
  "difficulty_level": "3.2",
  "year_level": 3,
  "sub_level": 2,
  "parameters": {
    "max_value": 60,
    "operands": 3,
    "carrying": "sometimes",
    "range": "two-digit",
    "decimal_places": 0
  }
}
```

#### `characters`
Character names for story scenarios (previously hardcoded in `scenario.service.ts`)

```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  gender TEXT CHECK(gender IN ('neutral', 'male', 'female')),
  cultural_context TEXT DEFAULT 'UK',
  active BOOLEAN DEFAULT TRUE
);
```

#### `items`
Items with realistic UK pricing (previously hardcoded)

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  pricing JSONB NOT NULL,  -- {min, max, typical, unit}
  themes TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE
);
```

**Example Record:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "apple",
  "category": "food",
  "pricing": {
    "min": 0.20,
    "max": 0.50,
    "typical": 0.35,
    "unit": "each"
  },
  "themes": ["SHOPPING", "COOKING"]
}
```

#### `scenario_templates`
Story templates for question generation

```sql
CREATE TABLE scenario_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT NOT NULL,
  format TEXT NOT NULL,
  template_text TEXT NOT NULL,
  template_data JSONB,
  active BOOLEAN DEFAULT TRUE
);
```

### Curation Layer

#### `curated_mappings`
Educator-curated model → format → theme combinations

```sql
CREATE TABLE curated_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  difficulty_param_id UUID REFERENCES difficulty_parameters(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  theme TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

**Example Record:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "model_id": "ADDITION",
  "difficulty_param_id": "550e8400-e29b-41d4-a716-446655440000",
  "format": "DIRECT_CALCULATION",
  "theme": "SHOPPING",
  "weight": 1.0,
  "active": true
}
```

### Content Layer

#### `generated_questions`
Final output - approved questions ready for student delivery

```sql
CREATE TABLE generated_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Student-facing content
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,

  -- Queryable metadata (foreign keys)
  curated_mapping_id UUID REFERENCES curated_mappings(id),
  difficulty_param_id UUID REFERENCES difficulty_parameters(id),
  model_id TEXT NOT NULL,
  format TEXT NOT NULL,
  theme TEXT NOT NULL,

  -- Audit trail
  generation_params JSONB,
  math_output JSONB,

  -- Workflow
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  generation_time_ms INTEGER,
  cognitive_load INTEGER,
  distractor_strategies TEXT[]
);
```

---

## Row Level Security (RLS) Policies

### Admin Access (Authenticated Users)

```sql
-- Admins can manage all configuration tables
CREATE POLICY "admins_manage_configs"
ON difficulty_parameters
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('admin', 'super_admin')
);

-- Same for characters, items, scenario_templates, curated_mappings
```

### Student Access (Public/Anonymous)

```sql
-- Students can only see approved questions
CREATE POLICY "students_see_approved_only"
ON generated_questions
FOR SELECT
TO anon
USING (approved = TRUE);
```

### Reviewer Access

```sql
-- Reviewers can approve questions
CREATE POLICY "reviewers_approve_questions"
ON generated_questions
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('reviewer', 'super_admin'))
WITH CHECK (approved IS NOT NULL);
```

---

## Migration Validation Checklist

### Pre-Migration Verification
- [ ] Supabase project created
- [ ] Environment variables set in `.env.local`
- [ ] First admin user created
- [ ] Required extensions enabled (`uuid-ossp`, `pg_trgm`)

### Phase 1: Schema Verification
- [ ] All 6 tables created successfully
- [ ] Indexes created (check with `\di` in SQL editor)
- [ ] RLS policies active (check with Supabase Studio → Authentication → Policies)
- [ ] Database functions callable

### Phase 2: Seed Verification
- [ ] 600+ records in `difficulty_parameters`
- [ ] 32 records in `characters`
- [ ] 50+ records in `items`
- [ ] 20+ records in `scenario_templates`
- [ ] 600+ records in `curated_mappings`
- [ ] No duplicate errors during seed
- [ ] Sample queries return expected results

### Phase 3: Integration Verification
- [ ] Supabase TypeScript types generated
- [ ] QuestionOrchestrator can fetch difficulty params
- [ ] API endpoint `/api/generate/enhanced` returns questions
- [ ] Generated questions saved to database
- [ ] Legacy endpoint `/api/generate` still works

### Phase 4: Admin UI Verification
- [ ] Admin login works
- [ ] Protected routes require authentication
- [ ] CRUD operations work for all tables
- [ ] Preview generates valid questions
- [ ] Approval workflow functions correctly

### Phase 5: Student App Verification
- [ ] Public API returns only approved questions
- [ ] Unauthenticated users cannot see unapproved questions
- [ ] RLS policies block direct database access to unapproved content
- [ ] Performance acceptable for 1000+ questions

---

## Performance Optimization Checklist

### Database Indexes
- [ ] GIN index on `difficulty_parameters.parameters`
- [ ] Index on `generated_questions.approved` (partial index WHERE approved = TRUE)
- [ ] Index on `curated_mappings.model_id`
- [ ] Full-text search index on `generated_questions.question_text`

### Caching Strategy
- [ ] Enable Supabase caching (Project Settings → API → Enable caching)
- [ ] Add CDN caching headers for approved questions
- [ ] Materialized view for frequently accessed questions

### Query Optimization
- [ ] Use `select('specific, columns')` instead of `select('*')`
- [ ] Batch inserts for seed scripts (upsert 100 at a time)
- [ ] Use database functions for complex queries
- [ ] Monitor slow queries in Supabase Studio → Database → Query Performance

---

## Rollback Plan

If migration encounters critical issues:

### Rollback to Hardcoded Configs
1. Keep `lib/math-engine/difficulty-enhanced.ts` file (do not delete during migration)
2. Switch API routes to use `QuestionOrchestrator` (legacy) instead of `QuestionOrchestratorSupabase`
3. Re-enable hardcoded scenario service

### Partial Rollback
- Phase 1-2 failure: Delete Supabase tables, re-run schema
- Phase 3 failure: Revert API routes to legacy orchestrator
- Phase 4 failure: Admin UI is optional, core generation still works
- Phase 5 failure: Student app can use legacy API endpoint temporarily

---

## Success Metrics

### Technical Metrics
- ✅ All 600+ difficulty configs migrated without data loss
- ✅ Query response time <100ms for student question fetching
- ✅ Zero downtime during migration (run in parallel with legacy system)
- ✅ 100% backward compatibility with existing API consumers

### Functional Metrics
- ✅ Admin can create/edit configurations in <30 seconds
- ✅ Curation workflow supports 100+ mappings per hour
- ✅ Preview generates questions in <2 seconds
- ✅ Approval queue processes 500+ questions in <5 minutes

### Educational Metrics
- ✅ Question variety increases (8 formats vs 2 previously)
- ✅ Scenario diversity increases (10+ themes vs hardcoded)
- ✅ Curriculum coverage maintained (all 25+ models supported)
- ✅ Quality control improves (human approval before student access)

---

## Next Steps After Migration

### Phase 7: Analytics & Reporting (Month 3)
- Admin dashboard with generation statistics
- Most popular model/format/theme combinations
- Question approval rates
- Student performance analytics (if tracking is added)

### Phase 8: Advanced Features (Month 4+)
- Visual question support (diagrams, charts)
- Multi-language support
- Collaborative question editing
- Version history for configurations
- A/B testing different scenario themes
- Custom curriculum mapping tools

### Phase 9: Production Hardening (Month 5+)
- Database backups and disaster recovery
- Monitoring and alerting
- Performance profiling
- Security audit
- Load testing (1000s of concurrent student users)

---

## Support & Documentation

### Internal Documentation
- **Architecture Overview:** `docs/architecture/OVERVIEW.md`
- **API Specification:** `docs/architecture/API_SPECIFICATION.md`
- **Enhanced System Guide:** `docs/implementation/ENHANCED_QUESTION_SYSTEM.md`
- **This Migration Plan:** `docs/proposals/SUPABASE_MIGRATION_PLAN.md`

### Supabase Resources
- **Official Docs:** https://supabase.com/docs
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **Real-Time Guide:** https://supabase.com/docs/guides/realtime
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

### Community Support
- **Supabase Discord:** https://discord.supabase.com
- **Stack Overflow:** Tag `supabase` for questions

---

## Conclusion

This migration transforms Factory Architect from a code-based generator into a professional CMS for educational content creation. The Supabase-first architecture provides:

1. **Scalability** - Database handles 1000s of questions efficiently
2. **Collaboration** - Multiple curriculum designers work simultaneously
3. **Quality Control** - Human approval before student exposure
4. **Flexibility** - JSONB storage adapts to evolving model parameters
5. **Security** - RLS ensures proper access control
6. **Performance** - PostgreSQL optimization + CDN caching
7. **Developer Experience** - TypeScript types, real-time updates, built-in admin UI

**Estimated Total Time:** 4-6 weeks for full implementation
**Developer Resources:** 1 full-time developer
**Budget:** Free tier sufficient for development, ~$25/month for production

---

*This plan was created on 2025-10-01 as part of the Factory Architect Supabase migration initiative. For questions or clarifications, contact the project maintainer.*
