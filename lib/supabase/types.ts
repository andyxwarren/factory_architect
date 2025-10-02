/**
 * Supabase Database Types
 *
 * TypeScript interfaces for database tables and their relationships.
 * These types provide compile-time safety when working with Supabase.
 *
 * Note: After running migrations, generate updated types with:
 *   npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/database.types.ts
 */

/**
 * Difficulty Parameters Table
 */
export interface DifficultyParameter {
  id: string; // UUID
  model_id: string;
  difficulty_level: string; // "3.2" format
  year_level: number; // 1-6
  sub_level: number; // 1-4
  parameters: Record<string, any>; // JSONB - model-specific params
  created_at: string;
  updated_at: string;
  created_by: string | null; // UUID
}

/**
 * Characters Table
 */
export interface Character {
  id: string; // UUID
  name: string;
  gender: 'neutral' | 'male' | 'female';
  cultural_context: string;
  active: boolean;
  created_at: string;
  created_by: string | null; // UUID
}

/**
 * Items Table
 */
export interface Item {
  id: string; // UUID
  name: string;
  category: string;
  pricing: {
    min: number;
    max: number;
    typical: number;
    unit?: string;
  };
  themes: string[]; // Array of theme names
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null; // UUID
}

/**
 * Scenario Templates Table
 */
export interface ScenarioTemplate {
  id: string; // UUID
  theme: string;
  format: string;
  template_text: string;
  template_data: Record<string, any> | null; // JSONB
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null; // UUID
}

/**
 * Curated Mappings Table
 */
export interface CuratedMapping {
  id: string; // UUID
  model_id: string;
  difficulty_param_id: string; // UUID - foreign key
  format: string;
  theme: string;
  weight: number; // 0-10
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null; // UUID
}

/**
 * Generated Questions Table
 */
export interface GeneratedQuestion {
  id: string; // UUID
  question_text: string;
  options: QuestionOption[]; // JSONB array
  correct_index: number;
  explanation: string | null;
  curated_mapping_id: string | null; // UUID
  difficulty_param_id: string | null; // UUID
  model_id: string;
  format: string;
  theme: string;
  generation_params: Record<string, any> | null; // JSONB
  math_output: Record<string, any> | null; // JSONB
  approved: boolean;
  approved_at: string | null;
  approved_by: string | null; // UUID
  rejection_reason: string | null;
  cognitive_load: number | null; // 0-100
  distractor_strategies: string[] | null;
  created_at: string;
  generation_time_ms: number | null;
}

/**
 * Question Option (embedded in GeneratedQuestion.options)
 */
export interface QuestionOption {
  text: string;
  value: any;
  index: number;
}

/**
 * Expanded types with relations (for joins)
 */
export interface GeneratedQuestionWithRelations extends GeneratedQuestion {
  difficulty_parameter?: DifficultyParameter;
  curated_mapping?: CuratedMappingWithRelations;
}

export interface CuratedMappingWithRelations extends CuratedMapping {
  difficulty_parameter?: DifficultyParameter;
}

/**
 * Database helper types
 */
export type Tables = {
  difficulty_parameters: DifficultyParameter;
  characters: Character;
  items: Item;
  scenario_templates: ScenarioTemplate;
  curated_mappings: CuratedMapping;
  generated_questions: GeneratedQuestion;
};

export type TableName = keyof Tables;

/**
 * Insert types (omit auto-generated fields)
 */
export type InsertDifficultyParameter = Omit<DifficultyParameter, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type InsertCharacter = Omit<Character, 'id' | 'created_at' | 'created_by'>;
export type InsertItem = Omit<Item, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type InsertScenarioTemplate = Omit<ScenarioTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type InsertCuratedMapping = Omit<CuratedMapping, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type InsertGeneratedQuestion = Omit<GeneratedQuestion, 'id' | 'created_at'>;

/**
 * Update types (all fields optional except id)
 */
export type UpdateDifficultyParameter = Partial<InsertDifficultyParameter> & { id: string };
export type UpdateCharacter = Partial<InsertCharacter> & { id: string };
export type UpdateItem = Partial<InsertItem> & { id: string };
export type UpdateScenarioTemplate = Partial<InsertScenarioTemplate> & { id: string };
export type UpdateCuratedMapping = Partial<InsertCuratedMapping> & { id: string };
export type UpdateGeneratedQuestion = Partial<InsertGeneratedQuestion> & { id: string };

/**
 * View types (for database views)
 */
export interface DifficultySummaryView {
  model_id: string;
  config_count: number;
  min_year: number;
  max_year: number;
  year_levels_covered: number;
}

export interface MappingCoverageView {
  model_id: string;
  format: string;
  theme: string;
  mapping_count: number;
  active_count: number;
}

export interface QuestionApprovalStatsView {
  model_id: string;
  format: string;
  total_generated: number;
  approved_count: number;
  pending_count: number;
  avg_generation_time_ms: number;
  avg_cognitive_load: number;
}
