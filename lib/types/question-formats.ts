// Enhanced Question Format Type Definitions
// Defines cognitive tasks, scenarios, and question structures for the enhanced system

/**
 * Defines the cognitive task required of the student.
 * This determines which controller handles the question generation.
 */
export enum QuestionFormat {
  DIRECT_CALCULATION = 'DIRECT_CALCULATION',    // "What is 25 + 17?"
  COMPARISON = 'COMPARISON',                    // "Which is better value?"
  ESTIMATION = 'ESTIMATION',                    // "Estimate the capacity"
  ORDERING = 'ORDERING',                        // "Order from smallest to largest"
  VALIDATION = 'VALIDATION',                    // "Do you have enough money?"
  MULTI_STEP = 'MULTI_STEP',                   // Multiple calculations required
  MISSING_VALUE = 'MISSING_VALUE',              // "Find the missing number"
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',  // "What comes next?"
}

/**
 * Maps question formats to their cognitive demands and year appropriateness
 */
export interface FormatMetadata {
  format: QuestionFormat;
  cognitiveLoad: number;           // Base cognitive demand (0-100)
  minYear: number;                 // Earliest appropriate year
  maxYear: number;                 // Latest appropriate year
  requiredSkills: string[];        // Prerequisite mathematical skills
  pedagogicalObjectives: string[]; // Learning objectives addressed
}

/**
 * Rich contextual framework for question narratives
 */
export interface ScenarioContext {
  id: string;
  theme: ScenarioTheme;
  setting: ScenarioSetting;
  characters: Character[];
  items: ContextItem[];
  culturalElements: CulturalElement[];
  realWorldConnection: string;
  yearAppropriate: number[];
  templates: ScenarioTemplate[];
}

export enum ScenarioTheme {
  SHOPPING = 'SHOPPING',
  COOKING = 'COOKING',
  SPORTS = 'SPORTS',
  SCHOOL = 'SCHOOL',
  TRANSPORT = 'TRANSPORT',
  POCKET_MONEY = 'POCKET_MONEY',
  COLLECTIONS = 'COLLECTIONS',
  NATURE = 'NATURE',
  HOUSEHOLD = 'HOUSEHOLD',
  CELEBRATIONS = 'CELEBRATIONS'
}

export interface ScenarioSetting {
  location: string;           // "school book fair", "local shop", "kitchen"
  timeContext?: string;       // "after school", "weekend", "holiday"
  atmosphere: string;         // "busy", "quiet", "exciting"
}

export interface Character {
  name: string;
  role?: string;              // "student", "parent", "shopkeeper"
  attributes?: string[];      // Age-appropriate descriptors
}

export enum ItemCategory {
  SCHOOL_SUPPLIES = 'SCHOOL_SUPPLIES',
  FOOD_ITEMS = 'FOOD_ITEMS',
  TOYS_GAMES = 'TOYS_GAMES',
  CLOTHING = 'CLOTHING',
  SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT',
  BOOKS_MEDIA = 'BOOKS_MEDIA',
  HOUSEHOLD_ITEMS = 'HOUSEHOLD_ITEMS',
  SAVING_GOAL = 'SAVING_GOAL'
}

export interface ContextItem {
  name: string;
  category: ItemCategory;
  typicalValue: ValueRange;
  unit: string;
  attributes: ItemAttributes;
  realWorldExample?: string;
}

export interface ItemAttributes {
  size?: 'small' | 'medium' | 'large';
  quality?: 'basic' | 'standard' | 'premium';
  quantity?: 'single' | 'pack' | 'bulk';
  brandTier?: 'generic' | 'branded';
  seasonality?: string[];
}

export interface ValueRange {
  min: number;
  max: number;
  typical: number;
  distribution: 'uniform' | 'normal' | 'skewed_low' | 'skewed_high';
}

export interface CulturalElement {
  type: 'currency' | 'measurement' | 'custom' | 'event';
  value: string;
  explanation?: string;
}

export interface ScenarioTemplate {
  formatCompatibility: QuestionFormat[];
  template: string;           // Question template with placeholders
  answerTemplate: string;     // Answer format template
  placeholders: PlaceholderDefinition[];
}

export interface PlaceholderDefinition {
  key: string;
  type: 'character' | 'item' | 'value' | 'unit' | 'action';
  constraints?: any;
  grammaticalForm?: 'singular' | 'plural' | 'possessive';
}

/**
 * Complete definition of a generated question before rendering
 */
export interface QuestionDefinition {
  // Identification
  id: string;
  timestamp: Date;

  // Core structure
  format: QuestionFormat;
  mathModel: string;              // e.g., 'ADDITION', 'UNIT_RATE'
  difficulty: SubDifficultyLevel;

  // Content
  scenario: ScenarioContext;
  parameters: QuestionParameters;

  // Enhanced question content for rich rendering
  questionContent?: QuestionContent;

  // Solution
  solution: QuestionSolution;

  // Metadata
  metadata: QuestionMetadata;
}

export interface SubDifficultyLevel {
  year: number;
  subLevel: number;              // 1-4 (X.1 to X.4)
  displayName: string;           // "3.2"
  cognitiveLoad: number;         // 0-100
}

export interface QuestionParameters {
  mathValues: Record<string, number>;    // Numerical values from math engine
  narrativeValues: Record<string, any>;  // Story elements
  units: Record<string, string>;         // Units for values
  formatting: FormattingOptions;
}

export interface FormattingOptions {
  currencyFormat: 'symbol' | 'words';
  decimalPlaces: number;
  useGroupingSeparators: boolean;
  unitPosition: 'before' | 'after';
}

export interface QuestionSolution {
  correctAnswer: Answer;
  distractors: Distractor[];
  explanation?: string;
  workingSteps?: string[];
  solutionStrategy: string;
}

export interface Answer {
  value: any;                   // The mathematical result
  displayText: string;          // Formatted for display
  units?: string;
  metadata?: any;
}

export interface Distractor extends Answer {
  strategy: DistractorStrategy;
  reasoning: string;            // Why a student might choose this
}

export interface QuestionMetadata {
  curriculumAlignment: string[];
  pedagogicalTags: string[];
  cognitiveSkills: string[];
  estimatedTime: number;        // seconds
  accessibility: AccessibilityInfo;
}

export interface AccessibilityInfo {
  readingLevel: number;         // Year level for reading difficulty
  visualElements: boolean;      // Contains diagrams/charts
  assistiveTechFriendly: boolean;
}

/**
 * Distractor generation system types
 */
export enum DistractorStrategy {
  // Calculation-based
  WRONG_OPERATION = 'WRONG_OPERATION',
  PARTIAL_CALCULATION = 'PARTIAL_CALCULATION',
  CALCULATION_ERROR = 'CALCULATION_ERROR',

  // Conceptual
  COMMON_MISCONCEPTION = 'COMMON_MISCONCEPTION',
  UNIT_CONFUSION = 'UNIT_CONFUSION',
  PLACE_VALUE_ERROR = 'PLACE_VALUE_ERROR',

  // Proximity-based
  OFF_BY_MAGNITUDE = 'OFF_BY_MAGNITUDE',
  CLOSE_VALUE = 'CLOSE_VALUE',
  ROUNDED_VALUE = 'ROUNDED_VALUE',

  // Format-specific
  REVERSED_COMPARISON = 'REVERSED_COMPARISON',
  WRONG_SELECTION = 'WRONG_SELECTION',
  PLAUSIBLE_ESTIMATE = 'PLAUSIBLE_ESTIMATE'
}

export interface DistractorRule {
  strategy: DistractorStrategy;
  applicableFormats: QuestionFormat[];
  applicableModels: string[];
  generator: DistractorGenerator;
  probability: number;          // Likelihood of using this strategy
}

export type DistractorGenerator = (
  correctAnswer: any,
  context: DistractorContext
) => Distractor[];

export interface DistractorContext {
  mathModel: string;
  format: QuestionFormat;
  operands?: number[];
  operation?: string;
  yearLevel: number;
  existingDistractors: any[];  // Avoid duplicates
}

export interface MisconceptionLibrary {
  byModel: Record<string, Misconception[]>;
  byYear: Record<number, Misconception[]>;
  byTopic: Record<string, Misconception[]>;
}

export interface Misconception {
  id: string;
  description: string;
  example: string;
  generateDistractor: DistractorGenerator;
  prevalence: 'rare' | 'uncommon' | 'common' | 'very_common';
  yearRange: { min: number; max: number };
}

/**
 * Format compatibility rules
 */
export interface FormatCompatibilityRule {
  format: QuestionFormat;
  minYear: number;
  maxYear: number;
  minSubLevel: number;
}

/**
 * Scenario selection criteria
 */
export interface ScenarioCriteria {
  format: QuestionFormat;
  yearLevel: number;
  theme?: ScenarioTheme;
  culturalContext?: string;
}

export interface ScoredScenario {
  scenario: ScenarioContext;
  score: number;
}

/**
 * Enhanced question content for rich UI rendering
 */
export interface QuestionContent {
  // Complete rendered text for simple display
  fullText: string;

  // Structured components for rich UI
  components?: QuestionComponents;

  // Template data for custom rendering
  templateData?: QuestionTemplateData;
}

export interface QuestionComponents {
  narrative?: string;           // "Sarah is shopping and needs to calculate:"
  steps?: QuestionStep[];       // For multi-step problems
  prompt?: string;              // "What is the final result?"
  highlightValues?: number[];   // Values to emphasize in UI
  operators?: string[];         // ['+', '-', '×'] for display
  sequence?: (number | string)[];  // For ordering/pattern questions
}

export interface QuestionStep {
  stepNumber: number;
  text: string;
  operation?: string;
  values?: number[];
  result?: number;
  description?: string;
}

export interface QuestionTemplateData {
  character?: string;
  action?: string;
  items?: string[];
  quantities?: number[];
  prices?: number[];
  units?: string[];
  context?: string;
  theme?: string;
}