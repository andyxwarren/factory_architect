# Factory Architect Enhanced Question Generation System
## Product Concept & Implementation Document

**Version:** 1.0  
**Date:** November 2024  
**Document Type:** Technical Specification & Implementation Guide

---

## Executive Summary

This document outlines a comprehensive refactoring strategy for Factory Architect's question generation system. The goal is to evolve from generating repetitive, single-format mathematical questions to producing diverse, pedagogically rich questions that align with UK National Curriculum standards while maintaining the system's existing mathematical accuracy.

The proposed architecture combines a **controller-based pattern** for clear separation of concerns with **rich contextual data structures** for variety, ensuring both maintainability and educational value.

---

## 1. System Architecture Overview

### 1.1 Core Architectural Pattern

The enhanced system adopts a **compositional architecture** with three primary layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Orchestration Layer                   │
│  (Question Format Selection & Flow Management)           │
├─────────────────────────────────────────────────────────┤
│                    Controller Layer                      │
│  (Format-Specific Question Generation Logic)             │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│  (Math Engine | Story Engine | Distractor Engine)        │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Principles

1. **Separation of Concerns**: Each cognitive format has its own controller
2. **Compositional Generation**: Questions are assembled from reusable parts
3. **Backward Compatibility**: Existing Math Engine models remain unchanged
4. **Plugin Architecture**: New formats and scenarios can be added without core changes
5. **Type Safety**: Comprehensive TypeScript interfaces ensure predictable behavior

---

## 2. Core Data Structures

### 2.1 Question Format Definition

```typescript
// lib/types/question-formats.ts

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
```

### 2.2 Enhanced Scenario System

```typescript
// lib/types/scenarios.ts

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
```

### 2.3 Question Definition Structure

```typescript
// lib/types/question-definition.ts

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
```

### 2.4 Distractor Generation System

```typescript
// lib/types/distractors.ts

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
```

---

## 3. Controller Architecture

### 3.1 Base Controller Pattern

```typescript
// lib/controllers/base-question.controller.ts

export abstract class QuestionController {
  protected mathEngine: MathEngine;
  protected scenarioService: ScenarioService;
  protected distractorEngine: DistractorEngine;
  
  constructor(dependencies: ControllerDependencies) {
    this.mathEngine = dependencies.mathEngine;
    this.scenarioService = dependencies.scenarioService;
    this.distractorEngine = dependencies.distractorEngine;
  }
  
  /**
   * Main generation method - must be implemented by each format controller
   */
  abstract generate(params: GenerationParams): Promise<QuestionDefinition>;
  
  /**
   * Common validation logic
   */
  protected validateParams(params: GenerationParams): void {
    if (!params.mathModel || !params.difficulty) {
      throw new Error('Invalid generation parameters');
    }
  }
  
  /**
   * Common scenario selection logic
   */
  protected async selectScenario(
    format: QuestionFormat,
    yearLevel: number,
    theme?: ScenarioTheme
  ): Promise<ScenarioContext> {
    return this.scenarioService.selectScenario({
      format,
      yearLevel,
      theme,
      culturalContext: 'UK'
    });
  }
  
  /**
   * Common distractor generation
   */
  protected async generateDistractors(
    correctAnswer: any,
    context: DistractorContext,
    count: number = 3
  ): Promise<Distractor[]> {
    return this.distractorEngine.generate(correctAnswer, context, count);
  }
}
```

### 3.2 Format-Specific Controllers

#### 3.2.1 Comparison Controller

```typescript
// lib/controllers/comparison-question.controller.ts

export class ComparisonQuestionController extends QuestionController {
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    this.validateParams(params);
    
    // 1. Generate comparison values using math engine
    const comparisonData = await this.generateComparisonData(params);
    
    // 2. Select appropriate scenario
    const scenario = await this.selectScenario(
      QuestionFormat.COMPARISON,
      params.difficulty.year,
      params.preferredTheme
    );
    
    // 3. Calculate the comparison result
    const solution = this.performComparison(comparisonData);
    
    // 4. Generate comparison-specific distractors
    const distractors = await this.generateComparisonDistractors(
      solution,
      comparisonData
    );
    
    // 5. Assemble the question definition
    return this.assembleQuestionDefinition(
      comparisonData,
      scenario,
      solution,
      distractors,
      params
    );
  }
  
  private async generateComparisonData(params: GenerationParams): Promise<ComparisonData> {
    const model = params.mathModel;
    
    if (model === 'UNIT_RATE') {
      // Generate two unit rate problems
      const option1 = await this.mathEngine.generate(model, {
        ...params.difficultyParams,
        comparison_count: 1
      });
      const option2 = await this.mathEngine.generate(model, {
        ...params.difficultyParams,
        comparison_count: 1
      });
      
      return {
        type: 'unit_rate',
        options: [option1, option2],
        comparisonMetric: 'price_per_unit'
      };
    }
    
    // Handle other comparison types...
    throw new Error(`Comparison not supported for model: ${model}`);
  }
  
  private performComparison(data: ComparisonData): ComparisonSolution {
    if (data.type === 'unit_rate') {
      const rates = data.options.map(opt => opt.calculations[0].unit_rate);
      const winnerIndex = rates[0] < rates[1] ? 0 : 1;
      const difference = Math.abs(rates[0] - rates[1]);
      
      return {
        correctAnswer: {
          value: winnerIndex,
          displayText: `Option ${winnerIndex + 1} is better value`,
          metadata: {
            difference,
            rates
          }
        }
      };
    }
    
    throw new Error('Unknown comparison type');
  }
  
  private async generateComparisonDistractors(
    solution: ComparisonSolution,
    data: ComparisonData
  ): Promise<Distractor[]> {
    const distractors: Distractor[] = [];
    
    // Wrong option selected
    distractors.push({
      value: solution.correctAnswer.value === 0 ? 1 : 0,
      displayText: `Option ${solution.correctAnswer.value === 0 ? 2 : 1} is better value`,
      strategy: DistractorStrategy.REVERSED_COMPARISON,
      reasoning: 'Selected the option with lower total price instead of better unit price'
    });
    
    // They're the same
    distractors.push({
      value: -1,
      displayText: 'Both options are equally good value',
      strategy: DistractorStrategy.WRONG_SELECTION,
      reasoning: 'Failed to calculate the difference correctly'
    });
    
    // Calculation error in difference
    if (solution.correctAnswer.metadata?.difference) {
      const wrongDiff = solution.correctAnswer.metadata.difference * 2;
      distractors.push({
        value: solution.correctAnswer.value,
        displayText: `Option ${solution.correctAnswer.value + 1} saves you £${wrongDiff.toFixed(2)}`,
        strategy: DistractorStrategy.CALCULATION_ERROR,
        reasoning: 'Arithmetic error in calculating the difference'
      });
    }
    
    return distractors;
  }
}
```

#### 3.2.2 Estimation Controller

```typescript
// lib/controllers/estimation-question.controller.ts

export class EstimationQuestionController extends QuestionController {
  private benchmarks = {
    capacity: [
      { value: 1, description: 'a teaspoon' },
      { value: 15, description: 'a tablespoon' },
      { value: 250, description: 'a mug' },
      { value: 1000, description: 'a large bottle' },
      { value: 150000, description: 'a bathtub' },
      { value: 500000, description: 'a hot tub' }
    ],
    length: [
      { value: 0.01, description: 'thickness of paper' },
      { value: 0.15, description: 'a pencil' },
      { value: 0.30, description: 'a ruler' },
      { value: 1.0, description: 'a baseball bat' },
      { value: 2.0, description: 'a door' },
      { value: 10.0, description: 'a classroom' }
    ]
  };
  
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    // 1. Determine estimation type and range
    const estimationType = this.selectEstimationType(params);
    const targetValue = this.generateTargetValue(estimationType, params.difficulty);
    
    // 2. Select scenario with real-world context
    const scenario = await this.selectEstimationScenario(
      estimationType,
      params.difficulty.year
    );
    
    // 3. Generate plausible estimates
    const estimates = this.generateEstimates(
      targetValue,
      estimationType,
      params.difficulty
    );
    
    // 4. Create the question definition
    return this.assembleEstimationQuestion(
      targetValue,
      estimates,
      scenario,
      params
    );
  }
  
  private generateEstimates(
    target: number,
    type: EstimationType,
    difficulty: SubDifficultyLevel
  ): EstimateOption[] {
    const benchmarks = this.benchmarks[type.category];
    const closest = this.findClosestBenchmarks(target, benchmarks, 4);
    
    return closest.map(benchmark => ({
      value: benchmark.value,
      displayText: `${benchmark.value} ${type.unit} (about ${benchmark.description})`,
      isCorrect: Math.abs(benchmark.value - target) === 
                 Math.min(...closest.map(b => Math.abs(b.value - target)))
    }));
  }
}
```

#### 3.2.3 Multi-Step Controller

```typescript
// lib/controllers/multi-step-question.controller.ts

export class MultiStepQuestionController extends QuestionController {
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    // 1. Determine step sequence based on difficulty
    const stepSequence = this.planStepSequence(params);
    
    // 2. Generate math outputs for each step
    const stepOutputs = await this.executeSteps(stepSequence, params);
    
    // 3. Select a scenario that naturally requires multiple steps
    const scenario = await this.selectMultiStepScenario(
      stepSequence,
      params.difficulty.year
    );
    
    // 4. Generate distractors based on partial calculations
    const distractors = this.generateMultiStepDistractors(stepOutputs);
    
    // 5. Assemble the complete question
    return this.assembleMultiStepQuestion(
      stepOutputs,
      scenario,
      distractors,
      params
    );
  }
  
  private planStepSequence(params: GenerationParams): StepDefinition[] {
    const { year, subLevel } = params.difficulty;
    
    if (year <= 3) {
      // Simple 2-step problems
      return [
        { model: 'ADDITION', operation: 'gather_items' },
        { model: 'SUBTRACTION', operation: 'calculate_change' }
      ];
    } else if (year <= 5) {
      // 3-step problems with multiplication
      return [
        { model: 'MULTIPLICATION', operation: 'calculate_group_total' },
        { model: 'ADDITION', operation: 'add_extra_items' },
        { model: 'SUBTRACTION', operation: 'apply_discount' }
      ];
    } else {
      // Complex 4+ step problems
      return [
        { model: 'MULTIPLICATION', operation: 'calculate_unit_costs' },
        { model: 'PERCENTAGE', operation: 'apply_tax' },
        { model: 'ADDITION', operation: 'sum_total' },
        { model: 'SUBTRACTION', operation: 'calculate_change' }
      ];
    }
  }
  
  private generateMultiStepDistractors(
    stepOutputs: StepOutput[]
  ): Distractor[] {
    const distractors: Distractor[] = [];
    const finalAnswer = stepOutputs[stepOutputs.length - 1].result;
    
    // Stopped at intermediate step
    if (stepOutputs.length > 1) {
      distractors.push({
        value: stepOutputs[stepOutputs.length - 2].result,
        displayText: this.formatValue(stepOutputs[stepOutputs.length - 2].result),
        strategy: DistractorStrategy.PARTIAL_CALCULATION,
        reasoning: 'Stopped before completing all steps'
      });
    }
    
    // Skipped a step
    if (stepOutputs.length > 2) {
      const skippedStepResult = this.calculateSkippingStep(stepOutputs, 1);
      distractors.push({
        value: skippedStepResult,
        displayText: this.formatValue(skippedStepResult),
        strategy: DistractorStrategy.PARTIAL_CALCULATION,
        reasoning: 'Skipped one of the required steps'
      });
    }
    
    // Wrong operation in final step
    const wrongOpResult = this.applyWrongOperation(
      stepOutputs[stepOutputs.length - 2].result,
      stepOutputs[stepOutputs.length - 1].inputs[1]
    );
    distractors.push({
      value: wrongOpResult,
      displayText: this.formatValue(wrongOpResult),
      strategy: DistractorStrategy.WRONG_OPERATION,
      reasoning: 'Used wrong operation in final step'
    });
    
    return distractors;
  }
}
```

---

## 4. Service Layer Components

### 4.1 Enhanced Distractor Engine

```typescript
// lib/services/distractor-engine.service.ts

export class DistractorEngine {
  private strategies: Map<DistractorStrategy, DistractorRule>;
  private misconceptionLibrary: MisconceptionLibrary;
  
  constructor() {
    this.initializeStrategies();
    this.loadMisconceptionLibrary();
  }
  
  async generate(
    correctAnswer: any,
    context: DistractorContext,
    count: number = 3
  ): Promise<Distractor[]> {
    // 1. Select applicable strategies
    const applicableStrategies = this.selectStrategies(context);
    
    // 2. Generate distractor candidates
    const candidates: Distractor[] = [];
    for (const strategy of applicableStrategies) {
      const distractors = strategy.generator(correctAnswer, context);
      candidates.push(...distractors);
    }
    
    // 3. Filter and select best distractors
    return this.selectBestDistractors(candidates, correctAnswer, count);
  }
  
  private selectStrategies(context: DistractorContext): DistractorRule[] {
    return Array.from(this.strategies.values())
      .filter(rule => 
        rule.applicableFormats.includes(context.format) &&
        (rule.applicableModels.length === 0 || 
         rule.applicableModels.includes(context.mathModel))
      )
      .sort((a, b) => b.probability - a.probability);
  }
  
  private selectBestDistractors(
    candidates: Distractor[],
    correctAnswer: any,
    count: number
  ): Distractor[] {
    // Remove duplicates
    const unique = this.removeDuplicates(candidates);
    
    // Remove too similar to correct answer
    const filtered = unique.filter(d => 
      !this.tooSimilar(d.value, correctAnswer)
    );
    
    // Prioritize by strategy diversity
    const diverse = this.ensureStrategyDiversity(filtered);
    
    // Return requested count
    return diverse.slice(0, count);
  }
  
  private initializeStrategies(): void {
    // Addition/Subtraction misconceptions
    this.strategies.set(DistractorStrategy.WRONG_OPERATION, {
      strategy: DistractorStrategy.WRONG_OPERATION,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['ADDITION', 'SUBTRACTION'],
      generator: (correct, context) => {
        if (context.operation === 'ADDITION' && context.operands) {
          return [{
            value: context.operands[0] - context.operands[1],
            displayText: String(context.operands[0] - context.operands[1]),
            strategy: DistractorStrategy.WRONG_OPERATION,
            reasoning: 'Subtracted instead of added'
          }];
        }
        return [];
      },
      probability: 0.8
    });
    
    // Place value errors
    this.strategies.set(DistractorStrategy.PLACE_VALUE_ERROR, {
      strategy: DistractorStrategy.PLACE_VALUE_ERROR,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION'],
      generator: (correct, context) => {
        const magnitude = Math.pow(10, Math.floor(Math.log10(correct)));
        return [
          {
            value: correct + magnitude,
            displayText: String(correct + magnitude),
            strategy: DistractorStrategy.PLACE_VALUE_ERROR,
            reasoning: 'Carried to wrong column'
          },
          {
            value: correct - magnitude/10,
            displayText: String(correct - magnitude/10),
            strategy: DistractorStrategy.PLACE_VALUE_ERROR,
            reasoning: 'Forgot to carry'
          }
        ];
      },
      probability: 0.7
    });
    
    // Percentage misconceptions
    this.strategies.set(DistractorStrategy.UNIT_CONFUSION, {
      strategy: DistractorStrategy.UNIT_CONFUSION,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['PERCENTAGE'],
      generator: (correct, context) => {
        if (context.operation === 'percentage_of') {
          const base = context.operands?.[0] || 100;
          const percent = context.operands?.[1] || 10;
          return [
            {
              value: base * percent, // Forgot to divide by 100
              displayText: String(base * percent),
              strategy: DistractorStrategy.UNIT_CONFUSION,
              reasoning: 'Multiplied by percentage without converting to decimal'
            },
            {
              value: base + percent, // Added percentage as absolute
              displayText: String(base + percent),
              strategy: DistractorStrategy.UNIT_CONFUSION,
              reasoning: 'Added percentage as absolute value'
            }
          ];
        }
        return [];
      },
      probability: 0.9
    });
  }
}
```

### 4.2 Scenario Service

```typescript
// lib/services/scenario.service.ts

export class ScenarioService {
  private scenarios: Map<string, ScenarioContext>;
  private themeIndex: Map<ScenarioTheme, string[]>;
  
  async selectScenario(criteria: ScenarioCriteria): Promise<ScenarioContext> {
    // 1. Filter by format compatibility
    let candidates = this.filterByFormat(criteria.format);
    
    // 2. Filter by year appropriateness
    candidates = this.filterByYear(candidates, criteria.yearLevel);
    
    // 3. Filter by theme if specified
    if (criteria.theme) {
      candidates = this.filterByTheme(candidates, criteria.theme);
    }
    
    // 4. Score and rank candidates
    const scored = this.scoreScenarios(candidates, criteria);
    
    // 5. Select best match with some randomization
    return this.selectWithRandomization(scored);
  }
  
  private scoreScenarios(
    scenarios: ScenarioContext[],
    criteria: ScenarioCriteria
  ): ScoredScenario[] {
    return scenarios.map(scenario => {
      let score = 0;
      
      // Cultural relevance
      if (scenario.culturalElements.some(e => e.type === 'currency' && e.value === '£')) {
        score += 10;
      }
      
      // Real-world connection strength
      if (scenario.realWorldConnection) {
        score += 15;
      }
      
      // Variety bonus (if not recently used)
      if (!this.recentlyUsed(scenario.id)) {
        score += 20;
      }
      
      // Year alignment
      const yearDistance = Math.abs(
        scenario.yearAppropriate[0] - criteria.yearLevel
      );
      score -= yearDistance * 5;
      
      return { scenario, score };
    });
  }
  
  async generateDynamicScenario(
    theme: ScenarioTheme,
    yearLevel: number
  ): Promise<ScenarioContext> {
    // Dynamic scenario generation for themes like POCKET_MONEY
    if (theme === ScenarioTheme.POCKET_MONEY) {
      return this.generatePocketMoneyScenario(yearLevel);
    }
    
    if (theme === ScenarioTheme.SCHOOL) {
      return this.generateSchoolScenario(yearLevel);
    }
    
    throw new Error(`Dynamic generation not supported for theme: ${theme}`);
  }
  
  private generatePocketMoneyScenario(year: number): ScenarioContext {
    const weeklyAmounts = {
      1: { min: 1, max: 2 },
      2: { min: 2, max: 3 },
      3: { min: 3, max: 5 },
      4: { min: 5, max: 7 },
      5: { min: 7, max: 10 },
      6: { min: 10, max: 15 }
    };
    
    const savingGoals = {
      1: ['toy', 'book', 'sweets'],
      2: ['game', 'toy', 'book'],
      3: ['video game', 'board game', 'sports equipment'],
      4: ['video game', 'clothes', 'hobby supplies'],
      5: ['phone case', 'headphones', 'games'],
      6: ['concert ticket', 'sports equipment', 'tech gadget']
    };
    
    const amount = weeklyAmounts[year] || weeklyAmounts[3];
    const goals = savingGoals[year] || savingGoals[3];
    
    return {
      id: `pocket-money-${year}-${Date.now()}`,
      theme: ScenarioTheme.POCKET_MONEY,
      setting: {
        location: 'home',
        timeContext: 'weekly',
        atmosphere: 'planning'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' }
      ],
      items: goals.map(goal => ({
        name: goal,
        category: ItemCategory.SAVING_GOAL,
        typicalValue: {
          min: amount.min * 4,
          max: amount.max * 8,
          typical: amount.max * 5,
          distribution: 'normal'
        },
        unit: '£',
        attributes: {
          quality: 'standard'
        }
      })),
      culturalElements: [
        {
          type: 'currency',
          value: '£',
          explanation: 'British pounds'
        },
        {
          type: 'custom',
          value: 'pocket money',
          explanation: 'Weekly allowance for children'
        }
      ],
      realWorldConnection: 'Learning to save and budget money',
      yearAppropriate: [year],
      templates: [
        {
          formatCompatibility: [QuestionFormat.ESTIMATION, QuestionFormat.MULTI_STEP],
          template: 'If {character} gets {amount} pocket money each week, how many weeks will it take to save for a {item} that costs {price}?',
          answerTemplate: 'It will take {result} weeks',
          placeholders: [
            { key: 'character', type: 'character' },
            { key: 'amount', type: 'value' },
            { key: 'item', type: 'item' },
            { key: 'price', type: 'value' }
          ]
        }
      ]
    };
  }
}
```

---

## 5. Orchestration Layer

### 5.1 Main Question Orchestrator

```typescript
// lib/orchestrator/question-orchestrator.ts

export class QuestionOrchestrator {
  private controllers: Map<QuestionFormat, QuestionController>;
  private formatSelector: FormatSelector;
  private renderer: QuestionRenderer;
  
  constructor(
    private mathEngine: MathEngine,
    private scenarioService: ScenarioService,
    private distractorEngine: DistractorEngine
  ) {
    this.initializeControllers();
    this.formatSelector = new FormatSelector();
    this.renderer = new QuestionRenderer();
  }
  
  async generateQuestion(request: QuestionRequest): Promise<EnhancedQuestion> {
    // 1. Determine available formats for this model and difficulty
    const availableFormats = this.formatSelector.getAvailableFormats(
      request.model_id,
      request.difficulty_level
    );
    
    // 2. Select format based on weights and pedagogical goals
    const selectedFormat = this.formatSelector.selectFormat(
      availableFormats,
      request.format_preference,
      request.pedagogical_focus
    );
    
    // 3. Get appropriate controller
    const controller = this.controllers.get(selectedFormat);
    if (!controller) {
      throw new Error(`No controller for format: ${selectedFormat}`);
    }
    
    // 4. Generate question definition
    const questionDef = await controller.generate({
      mathModel: request.model_id,
      difficulty: this.parseDifficulty(request.difficulty_level),
      difficultyParams: request.difficulty_params,
      preferredTheme: request.scenario_theme,
      culturalContext: 'UK',
      sessionId: request.session_id
    });
    
    // 5. Render to final format
    const rendered = this.renderer.render(questionDef);
    
    // 6. Enhance with metadata
    return this.enhanceQuestion(rendered, questionDef, request);
  }
  
  private initializeControllers(): void {
    const dependencies = {
      mathEngine: this.mathEngine,
      scenarioService: this.scenarioService,
      distractorEngine: this.distractorEngine
    };
    
    this.controllers.set(
      QuestionFormat.DIRECT_CALCULATION,
      new DirectCalculationController(dependencies)
    );
    
    this.controllers.set(
      QuestionFormat.COMPARISON,
      new ComparisonQuestionController(dependencies)
    );
    
    this.controllers.set(
      QuestionFormat.ESTIMATION,
      new EstimationQuestionController(dependencies)
    );
    
    this.controllers.set(
      QuestionFormat.MULTI_STEP,
      new MultiStepQuestionController(dependencies)
    );
    
    this.controllers.set(
      QuestionFormat.VALIDATION,
      new ValidationQuestionController(dependencies)
    );
    
    // Add more controllers as implemented...
  }
  
  private parseDifficulty(level: number | string): SubDifficultyLevel {
    if (typeof level === 'number') {
      // Legacy integer support (3 -> 3.3)
      return {
        year: Math.floor(level),
        subLevel: 3,
        displayName: `${level}.3`,
        cognitiveLoad: this.calculateCognitiveLoad(level, 3)
      };
    }
    
    const [year, subLevel] = level.split('.').map(Number);
    return {
      year,
      subLevel,
      displayName: level,
      cognitiveLoad: this.calculateCognitiveLoad(year, subLevel)
    };
  }
}
```

### 5.2 Format Selection Logic

```typescript
// lib/orchestrator/format-selector.ts

export class FormatSelector {
  private formatCompatibility: Map<string, FormatCompatibilityRule[]>;
  
  constructor() {
    this.initializeCompatibilityRules();
  }
  
  getAvailableFormats(
    modelId: string,
    difficulty: string
  ): QuestionFormat[] {
    const [year, subLevel] = difficulty.split('.').map(Number);
    const rules = this.formatCompatibility.get(modelId) || [];
    
    return rules
      .filter(rule => 
        year >= rule.minYear && 
        year <= rule.maxYear &&
        subLevel >= rule.minSubLevel
      )
      .map(rule => rule.format);
  }
  
  selectFormat(
    available: QuestionFormat[],
    preference?: QuestionFormat,
    pedagogicalFocus?: string
  ): QuestionFormat {
    // Priority 1: User preference if available
    if (preference && available.includes(preference)) {
      return preference;
    }
    
    // Priority 2: Pedagogical focus alignment
    if (pedagogicalFocus) {
      const aligned = this.getFormatsForPedagogy(pedagogicalFocus);
      const match = available.find(f => aligned.includes(f));
      if (match) return match;
    }
    
    // Priority 3: Weighted random selection
    return this.weightedRandomSelect(available);
  }
  
  private initializeCompatibilityRules(): void {
    // ADDITION model compatibility
    this.formatCompatibility.set('ADDITION', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 1, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.VALIDATION,
        minYear: 2, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.ESTIMATION,
        minYear: 3, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MISSING_VALUE,
        minYear: 3, maxYear: 6, minSubLevel: 3
      }
    ]);
    
    // UNIT_RATE model compatibility
    this.formatCompatibility.set('UNIT_RATE', [
      {
        format: QuestionFormat.DIRECT_CALCULATION,
        minYear: 4, maxYear: 6, minSubLevel: 1
      },
      {
        format: QuestionFormat.COMPARISON,
        minYear: 4, maxYear: 6, minSubLevel: 2
      },
      {
        format: QuestionFormat.MULTI_STEP,
        minYear: 5, maxYear: 6, minSubLevel: 3
      }
    ]);
    
    // Continue for other models...
  }
  
  private weightedRandomSelect(formats: QuestionFormat[]): QuestionFormat {
    const weights = {
      [QuestionFormat.DIRECT_CALCULATION]: 30,
      [QuestionFormat.COMPARISON]: 20,
      [QuestionFormat.ESTIMATION]: 15,
      [QuestionFormat.MULTI_STEP]: 15,
      [QuestionFormat.VALIDATION]: 10,
      [QuestionFormat.MISSING_VALUE]: 5,
      [QuestionFormat.ORDERING]: 3,
      [QuestionFormat.PATTERN_RECOGNITION]: 2
    };
    
    const availableWeights = formats.map(f => weights[f] || 1);
    const totalWeight = availableWeights.reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < formats.length; i++) {
      random -= availableWeights[i];
      if (random <= 0) {
        return formats[i];
      }
    }
    
    return formats[0];
  }
}
```

---

## 6. API Integration

### 6.1 Enhanced API Endpoint

```typescript
// app/api/generate/enhanced/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate request
  const validationResult = validateEnhancedRequest(body);
  if (!validationResult.valid) {
    return NextResponse.json(
      { error: validationResult.error },
      { status: 400 }
    );
  }
  
  try {
    // Initialize orchestrator with dependencies
    const orchestrator = new QuestionOrchestrator(
      mathEngine,
      scenarioService,
      distractorEngine
    );
    
    // Generate enhanced question
    const question = await orchestrator.generateQuestion({
      model_id: body.model_id,
      difficulty_level: body.difficulty_level || body.year_level, // Support both
      difficulty_params: body.difficulty_params,
      format_preference: body.format_preference,
      scenario_theme: body.scenario_theme,
      pedagogical_focus: body.pedagogical_focus,
      session_id: body.session_id
    });
    
    // Track in session if provided
    if (body.session_id) {
      await trackQuestionInSession(body.session_id, question);
    }
    
    return NextResponse.json({
      success: true,
      question: question.text,
      options: question.options,
      correct_answer_index: question.correctIndex,
      metadata: {
        format: question.format,
        cognitive_load: question.cognitiveLoad,
        curriculum_alignment: question.curriculumTags,
        difficulty: question.difficulty.displayName,
        scenario_theme: question.scenario.theme,
        distractor_strategies: question.distractors.map(d => d.strategy)
      },
      math_output: question.mathOutput,
      context: question.scenario,
      session: body.session_id ? await getSessionStats(body.session_id) : null
    });
    
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
```

### 6.2 Request/Response Types

```typescript
// lib/types/api.ts

export interface EnhancedQuestionRequest {
  // Required
  model_id: string;
  
  // Difficulty (support both formats)
  difficulty_level?: string;        // New format: "3.2"
  year_level?: number;              // Legacy format: 3
  
  // Optional enhancements
  format_preference?: QuestionFormat;
  scenario_theme?: ScenarioTheme;
  pedagogical_focus?: string;
  difficulty_params?: Record<string, any>;
  
  // Session tracking
  session_id?: string;
  
  // Options
  include_explanation?: boolean;
  include_working?: boolean;
  distractor_count?: number;
}

export interface EnhancedQuestionResponse {
  success: boolean;
  question: string;
  options: QuestionOption[];
  correct_answer_index: number;
  
  metadata: {
    format: QuestionFormat;
    cognitive_load: number;
    curriculum_alignment: string[];
    difficulty: string;
    scenario_theme: string;
    distractor_strategies: DistractorStrategy[];
  };
  
  math_output?: any;
  context?: ScenarioContext;
  explanation?: string;
  working_steps?: string[];
  session?: SessionStats;
}

export interface QuestionOption {
  text: string;
  value: any;
  index: number;
  isCorrect?: boolean;  // Only included in debug mode
}
```

---

## 7. Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
1. Create new type definitions and interfaces
2. Implement base controller architecture
3. Create format selector and orchestrator skeleton
4. Ensure backward compatibility with existing system

### Phase 2: Core Controllers (Weeks 3-4)
1. Implement DirectCalculationController (simplest)
2. Implement ComparisonQuestionController
3. Implement EstimationQuestionController
4. Implement ValidationQuestionController

### Phase 3: Services (Weeks 5-6)
1. Build comprehensive DistractorEngine
2. Create ScenarioService with initial scenario library
3. Implement QuestionRenderer
4. Create misconception library

### Phase 4: Advanced Features (Weeks 7-8)
1. Implement MultiStepQuestionController
2. Add remaining format controllers
3. Enhance scenario generation
4. Add cultural markers and real-world connections

### Phase 5: Testing & Refinement (Weeks 9-10)
1. Comprehensive unit testing
2. Integration testing with existing Math Engine
3. Performance optimization
4. Teacher/student feedback incorporation

---

## 8. Success Metrics

### Technical Metrics
- **Format Variety**: ≥8 different question formats implemented
- **Scenario Coverage**: ≥10 distinct themes with ≥5 scenarios each
- **Distractor Quality**: ≥90% of distractors pedagogically sound
- **Performance**: <200ms generation time for 95% of requests
- **Backward Compatibility**: 100% of existing API calls still work

### Educational Metrics
- **Curriculum Coverage**: Maintains 100% alignment with UK National Curriculum
- **Cognitive Variety**: Questions span all Bloom's taxonomy levels
- **Real-World Relevance**: ≥80% of questions use practical contexts
- **Difficulty Progression**: Smooth transitions between sub-levels

### User Metrics
- **Teacher Satisfaction**: ≥85% report improved question variety
- **Student Engagement**: ≥70% increase in voluntary practice sessions
- **Error Pattern Detection**: System identifies common misconceptions
- **Adaptive Success**: Students progress through levels 30% faster

---

## 9. Technical Considerations

### Performance Optimization
- Lazy load scenario libraries
- Cache frequently used templates
- Pre-generate distractor pools for common answers
- Use worker threads for complex multi-step generation

### Maintainability
- Comprehensive TypeScript types for all data structures
- Clear separation between business logic and data
- Extensive unit test coverage (>90%)
- Documentation for adding new formats/scenarios

### Scalability
- Database-ready scenario storage structure
- API versioning for backward compatibility
- Feature flags for gradual rollout
- Monitoring and analytics integration

---

## Appendices

### A. Example Scenario Library Structure

```typescript
// data/scenarios/shopping.scenarios.ts
export const shoppingScenarios: ScenarioContext[] = [
  {
    id: 'shop-001-bookfair',
    theme: ScenarioTheme.SHOPPING,
    setting: {
      location: 'school book fair',
      timeContext: 'lunch break',
      atmosphere: 'busy'
    },
    // ... full scenario details
  }
];
```

### B. Misconception Library Sample

```typescript
// data/misconceptions/addition.misconceptions.ts
export const additionMisconceptions: Misconception[] = [
  {
    id: 'add-001-no-carry',
    description: 'Forgets to carry when adding columns',
    example: '47 + 38 = 75 (instead of 85)',
    generateDistractor: (correct, context) => {
      // Implementation
    },
    prevalence: 'common',
    yearRange: { min: 2, max: 4 }
  }
];
```

### C. Migration Guide for Existing Code

1. Existing Math Engine models remain unchanged
2. Current Story Engine becomes a subset of ScenarioService
3. API maintains backward compatibility through adapter layer
4. Gradual migration path for test interface

---

This document provides a comprehensive blueprint for transforming Factory Architect's question generation capabilities while maintaining its strengths and ensuring a smooth implementation path.