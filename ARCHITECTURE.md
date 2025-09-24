# Factory Architect Technical Architecture

This document provides comprehensive technical details for the Factory Architect question generation system, including both the original Math Engine architecture and the new Enhanced Question Generation System.

## Executive Summary

Factory Architect implements a sophisticated dual-architecture system:

### Core System (Established)
A collection of **25+ atomic mathematical models** that form the Math Engine core. Each model operates purely on numerical and logical parameters, with zero awareness of real-world context. The Story Engine consumes mathematical outputs and applies contextual narratives.

### Enhanced System (New)
An **Enhanced Question Generation System** that extends the core with multiple question formats, rich scenarios, and pedagogical distractors. This system maintains complete backward compatibility while delivering advanced educational features.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Enhanced System (New)                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               Orchestration Layer                   │ │
│  │        (Format Selection & Flow Management)         │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │               Controller Layer                      │ │
│  │     (Format-Specific Question Generation)           │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │               Service Layer                         │ │
│  │   (Scenario Service | Distractor Engine)            │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Core System (Established)              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               Story Engine                          │ │
│  │        (Context Application & Rendering)            │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │               Math Engine                           │ │
│  │           (25+ Mathematical Models)                 │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Core Mathematical Models

### 1. ADDITION Model

#### `model_id`: `ADDITION`

#### `core_mathematical_operation`
Summing an array of numerical values to produce a total.

#### `difficulty_parameters`
```typescript
{
  operand_count: number;        // Number of values to sum (2-10)
  max_value: number;            // Maximum value for any operand
  decimal_places: number;       // Number of decimal places (0-3)
  allow_carrying: boolean;      // Whether carrying is required
  value_constraints: {
    min: number;               // Minimum value for operands
    step: number;              // Step size for values (e.g., 0.01 for pence)
  }
}
```

#### `progression_logic`
- **Year 1-2**: `operand_count: 2-3`, `max_value: 20`, `decimal_places: 0`, `allow_carrying: false`
- **Year 3-4**: `operand_count: 2-4`, `max_value: 100`, `decimal_places: 2`, `allow_carrying: true`
- **Year 5-6**: `operand_count: 2-6`, `max_value: 1000`, `decimal_places: 2-3`, `allow_carrying: true`

#### `json_output_contract`
```json
{
  "operation": "ADDITION",
  "operands": [0.35, 0.25],
  "result": 0.60,
  "intermediate_steps": [],
  "decimal_formatted": {
    "operands": ["0.35", "0.25"],
    "result": "0.60"
  }
}
```

#### `required_context_variables`
```typescript
{
  unit_type: string;           // "currency", "measurement", "count"
  unit_symbol: string;         // "£", "kg", ""
  item_descriptors: string[];  // ["cake", "drink"]
  action_verb: string;         // "buys", "collects", "earns"
}
```

### 2. SUBTRACTION Model

#### `model_id`: `SUBTRACTION`

#### `core_mathematical_operation`
Finding the difference between two numerical values.

#### `difficulty_parameters`
```typescript
{
  minuend_max: number;         // Maximum value for the minuend
  subtrahend_max: number;      // Maximum value for the subtrahend
  decimal_places: number;      // Number of decimal places (0-3)
  allow_borrowing: boolean;    // Whether borrowing is required
  ensure_positive: boolean;    // Ensures result is non-negative
  value_constraints: {
    step: number;             // Step size for values
  }
}
```

#### `progression_logic`
- **Year 1-2**: `minuend_max: 20`, `subtrahend_max: 10`, `decimal_places: 0`, `allow_borrowing: false`
- **Year 3-4**: `minuend_max: 100`, `subtrahend_max: 100`, `decimal_places: 2`, `allow_borrowing: true`
- **Year 5-6**: `minuend_max: 1000`, `subtrahend_max: 1000`, `decimal_places: 3`, `allow_borrowing: true`

#### `json_output_contract`
```json
{
  "operation": "SUBTRACTION",
  "minuend": 100,
  "subtrahend": 60,
  "result": 40,
  "decimal_formatted": {
    "minuend": "1.00",
    "subtrahend": "0.60",
    "result": "0.40"
  }
}
```

#### `required_context_variables`
```typescript
{
  scenario_type: string;       // "change", "difference", "remaining"
  initial_context: string;     // "pays with", "has saved", "original price"
  removal_context: string;     // "costs", "spent", "reduced by"
}
```

### 3. MULTIPLICATION Model

#### `model_id`: `MULTIPLICATION`

#### `core_mathematical_operation`
Computing the product of two or more numerical values.

#### `difficulty_parameters`
```typescript
{
  multiplicand_max: number;    // Maximum value for multiplicand
  multiplier_max: number;      // Maximum value for multiplier
  decimal_places: number;      // Decimal places in operands (0-3)
  operand_count: number;       // Number of values to multiply (2-4)
  use_fractions: boolean;      // Allow fractional multipliers
}
```

#### `progression_logic`
- **Year 1-2**: `multiplicand_max: 10`, `multiplier_max: 5`, `decimal_places: 0`
- **Year 3-4**: `multiplicand_max: 100`, `multiplier_max: 10`, `decimal_places: 2`
- **Year 5-6**: `multiplicand_max: 1000`, `multiplier_max: 100`, `decimal_places: 3`

#### `json_output_contract`
```json
{
  "operation": "MULTIPLICATION",
  "multiplicand": 4.75,
  "multiplier": 4,
  "result": 19.00,
  "factors": [4.75, 4],
  "decimal_formatted": {
    "result": "19.00"
  }
}
```

#### `required_context_variables`
```typescript
{
  quantity_type: string;       // "groups", "items_per_unit", "rate"
  unit_descriptor: string;     // "tickets", "family members", "pens per pack"
}
```

### 4. DIVISION Model

#### `model_id`: `DIVISION`

#### `core_mathematical_operation`
Dividing a dividend by a divisor to find quotient and optionally remainder.

#### `difficulty_parameters`
```typescript
{
  dividend_max: number;        // Maximum value for dividend
  divisor_max: number;         // Maximum value for divisor
  decimal_places: number;      // Decimal places in result (0-3)
  allow_remainder: boolean;    // Whether to include remainders
  ensure_whole: boolean;       // Ensure result is whole number
}
```

#### `progression_logic`
- **Year 1-2**: `dividend_max: 20`, `divisor_max: 5`, `ensure_whole: true`
- **Year 3-4**: `dividend_max: 100`, `divisor_max: 10`, `decimal_places: 2`
- **Year 5-6**: `dividend_max: 1000`, `divisor_max: 100`, `decimal_places: 3`

#### `json_output_contract`
```json
{
  "operation": "DIVISION",
  "dividend": 9.60,
  "divisor": 3,
  "quotient": 3.20,
  "remainder": 0,
  "decimal_formatted": {
    "quotient": "3.20"
  }
}
```

#### `required_context_variables`
```typescript
{
  division_type: string;       // "sharing", "grouping", "rate"
  share_context: string;       // "equally between", "per unit", "each gets"
}
```

### 5. MULTI_STEP Model

#### `model_id`: `MULTI_STEP`

#### `core_mathematical_operation`
Executing a sequence of mathematical operations in a specified order.

#### `difficulty_parameters`
```typescript
{
  operation_sequence: Array<{
    model: string;             // "ADDITION", "SUBTRACTION", etc.
    params: object;            // Parameters for the specific model
    use_previous_result: boolean; // Use result from previous step
  }>;
  max_steps: number;           // Maximum number of operations (2-5)
  intermediate_visibility: boolean; // Show intermediate results
}
```

#### `progression_logic`
- **Year 1-2**: `max_steps: 2`, simple addition/subtraction chains
- **Year 3-4**: `max_steps: 3`, mixed operations including multiplication
- **Year 5-6**: `max_steps: 5`, complex chains with all operations

#### `json_output_contract`
```json
{
  "operation": "MULTI_STEP",
  "steps": [
    {
      "step": 1,
      "operation": "MULTIPLICATION",
      "inputs": [3, 6],
      "result": 18
    },
    {
      "step": 2,
      "operation": "SUBTRACTION",
      "inputs": [18, 16],
      "result": 2
    }
  ],
  "final_result": 2,
  "intermediate_results": [18]
}
```

#### `required_context_variables`
```typescript
{
  scenario_sequence: string[]; // ["buying books", "calculating change"]
  connecting_phrases: string[]; // ["then", "after that", "finally"]
}
```

### 6. LINEAR_EQUATION Model

#### `model_id`: `LINEAR_EQUATION`

#### `core_mathematical_operation`
Evaluating a linear function of the form `y = mx + c` for a given input value.

#### `difficulty_parameters`
```typescript
{
  slope_max: number;           // Maximum value for slope (m)
  intercept_max: number;       // Maximum value for y-intercept (c)
  input_max: number;           // Maximum input value (x)
  decimal_places: number;      // Decimal places in coefficients
  allow_negative_slope: boolean; // Allow negative slopes
}
```

#### `progression_logic`
- **Year 3-4**: Simple patterns with whole number slopes
- **Year 5-6**: Decimal slopes and intercepts, real-world applications

#### `json_output_contract`
```json
{
  "operation": "LINEAR_EQUATION",
  "equation": {
    "slope": 1.50,
    "intercept": 3.00,
    "formatted": "y = 1.50x + 3.00"
  },
  "input": 6,
  "output": 12.00,
  "calculation_steps": {
    "mx": 9.00,
    "mx_plus_c": 12.00
  }
}
```

#### `required_context_variables`
```typescript
{
  rate_context: string;        // "per mile", "per hour", "per item"
  fixed_context: string;       // "base fee", "starting amount"
  variable_context: string;    // "distance", "time", "quantity"
}
```

### 7. PERCENTAGE Model

#### `model_id`: `PERCENTAGE`

#### `core_mathematical_operation`
Calculating percentages of values, percentage increases/decreases, or finding percentage relationships.

#### `difficulty_parameters`
```typescript
{
  base_value_max: number;      // Maximum base value
  percentage_values: number[]; // Allowed percentage values [10, 20, 25, 50, etc.]
  operation_type: string;      // "of", "increase", "decrease", "reverse"
  decimal_places: number;      // Decimal places in result
}
```

#### `progression_logic`
- **Year 4**: Simple percentages (10%, 50%, 100%)
- **Year 5**: Common percentages (25%, 75%), finding percentages
- **Year 6**: Any percentage, increases/decreases, reverse calculations

#### `json_output_contract`
```json
{
  "operation": "PERCENTAGE",
  "operation_type": "decrease",
  "base_value": 45.50,
  "percentage": 20,
  "percentage_amount": 9.10,
  "result": 36.40
}
```

#### `required_context_variables`
```typescript
{
  percentage_context: string;  // "discount", "interest", "tax", "increase"
  value_descriptor: string;    // "original price", "savings", "population"
}
```

### 8. UNIT_RATE Model

#### `model_id`: `UNIT_RATE`

#### `core_mathematical_operation`
Calculating and comparing rates to determine unit costs or best value.

#### `difficulty_parameters`
```typescript
{
  total_value_max: number;     // Maximum total value
  quantity_max: number;        // Maximum quantity
  decimal_places: number;      // Decimal places
  comparison_count: number;    // Number of rates to compare (1-4)
}
```

#### `progression_logic`
- **Year 3-4**: Simple unit rates with whole numbers
- **Year 5-6**: Complex comparisons with decimals

#### `json_output_contract`
```json
{
  "operation": "UNIT_RATE",
  "calculations": [
    {
      "total": 2.40,
      "quantity": 6,
      "unit_rate": 0.40
    }
  ],
  "best_value_index": 0
}
```

#### `required_context_variables`
```typescript
{
  quantity_unit: string;       // "pens", "litres", "kilometres"
  value_unit: string;          // "pounds", "pence"
  comparison_phrase: string;   // "better value", "cheaper option"
}
```

## Implementation Guide

### Phase 1: Project Setup and Type Definition

1. **Define Core Interfaces**: Create `types.ts` with TypeScript interfaces for models
   ```typescript
   export interface IMathModel<TParams, TOutput> {
     model_id: string;
     generate(params: TParams): TOutput;
   }
   ```

2. **Model Structure**: Each model follows this pattern:
   ```typescript
   export class AdditionModel implements IMathModel<AdditionDifficultyParams, AdditionOutput> {
     public readonly model_id = "ADDITION";
     public generate(params: AdditionDifficultyParams): AdditionOutput {
       // Implementation logic
     }
   }
   ```

### Phase 2: Math Engine Implementation

#### Directory Structure
```
src/
├── lib/
│   ├── math-engine/
│   │   ├── models/           # Individual mathematical models
│   │   │   ├── addition.model.ts
│   │   │   ├── subtraction.model.ts
│   │   │   ├── multiplication.model.ts
│   │   │   ├── division.model.ts
│   │   │   ├── multi-step.model.ts
│   │   │   ├── linear-equation.model.ts
│   │   │   ├── percentage.model.ts
│   │   │   └── unit-rate.model.ts
│   │   ├── difficulty.ts     # Difficulty progression logic
│   │   └── index.ts         # Math engine exports
│   ├── story-engine/
│   │   ├── contexts/         # Story context libraries
│   │   │   ├── money.context.ts
│   │   │   ├── length.context.ts
│   │   │   └── weight.context.ts
│   │   ├── templates/        # Question templates
│   │   └── story.engine.ts   # Story rendering logic
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Utility functions
├── app/
│   ├── api/
│   │   ├── generate/         # Question generation API
│   │   ├── test/            # Model testing API
│   │   └── models/          # Model information API
│   ├── test/                # Web UI for testing models
│   └── page.tsx             # Main dashboard
└── components/              # UI components
```

### Phase 3: Story Engine Development

#### Context System
Create context libraries organized by theme:
```typescript
// money.context.ts
export const shoppingContext = {
  unit_type: "currency",
  unit_symbol: "£",
  item_descriptors: ["book", "pen", "comic"],
  action_verb: "buys"
};
```

#### Template System
```typescript
function renderAdditionQuestion(mathOutput: AdditionOutput, context: any): string {
  return `If ${context.person} ${context.action_verb} a ${context.item_descriptors[0]} for ${mathOutput.decimal_formatted.operands[0]} and a ${context.item_descriptors[1]} for ${mathOutput.decimal_formatted.operands[1]}, how much is that?`;
}
```

### Phase 4: Next.js Web Interface

#### API Structure
- `/api/generate` - Question generation endpoint
- `/api/test` - Batch testing endpoint
- `/api/models` - Model information endpoint

#### Testing Interface Features
- Interactive parameter controls for each model
- Real-time question generation and preview
- Batch testing with statistical analysis
- Export functionality for generated questions

#### Components
- `ModelSelector` - Choose mathematical model
- `ParameterControls` - Adjust difficulty parameters
- `QuestionDisplay` - Show generated questions
- `TestInterface` - Main testing dashboard

### Phase 5: Difficulty and Progression

#### Difficulty Presets
```typescript
export function getDifficultyParams(model_id: string, year: number): object {
  if (model_id === "ADDITION" && year <= 2) {
    return {
      operand_count: 2,
      max_value: 20,
      decimal_places: 0,
      allow_carrying: false
    };
  }
  // Additional year-specific rules...
}
```

#### Year Level Progression
- **Years 1-2**: Basic operations with small whole numbers
- **Years 3-4**: Introduction of decimals and larger numbers
- **Years 5-6**: Complex operations with advanced concepts

### Phase 6: Testing Strategy

#### Unit Testing
- Test each mathematical model independently
- Verify output contracts and parameter handling
- Edge case validation (division by zero, etc.)

#### Integration Testing
- End-to-end question generation pipeline
- Context integration with mathematical outputs
- API endpoint functionality

#### Web Interface Testing
- Interactive parameter adjustment
- Batch generation performance
- Export functionality validation

### Phase 7: Deployment and Production

#### Build Process
```bash
npm run build    # Production build
npm run start    # Production server
```

#### Performance Considerations
- Model instantiation and caching
- Batch generation optimization
- API response caching strategies

#### Monitoring
- Question generation success rates
- Performance metrics per model
- User interaction analytics

## Development Workflow

1. **Model Development**: Implement atomic models following interface patterns
2. **Unit Testing**: Comprehensive testing of each model
3. **Context Integration**: Create story contexts and templates
4. **Web Interface**: Build interactive testing dashboard
5. **API Development**: Create generation and testing endpoints
6. **Production Deployment**: Build and deploy system

## Quality Assurance

- **Educational Accuracy**: Align with UK National Curriculum requirements
- **Mathematical Precision**: Ensure correct calculations across all models
- **Scalable Architecture**: Support for additional models and contexts
- **Performance Optimization**: Efficient generation for large question sets

This architecture provides a robust foundation for generating educational mathematics questions with precise difficulty control and flexible contextual presentation.

---

# Enhanced Question Generation System Architecture

## Overview

The Enhanced Question Generation System extends the core Math Engine with a sophisticated layer that provides multiple question formats, rich scenarios, and pedagogically sound distractors while maintaining 100% backward compatibility.

## Enhanced System Components

### 1. Question Format Controllers

#### Base Controller Pattern
```typescript
// lib/controllers/base-question.controller.ts
export abstract class QuestionController {
  protected mathEngine: MathEngine;
  protected scenarioService: ScenarioService;
  protected distractorEngine: DistractorEngine;

  abstract generate(params: GenerationParams): Promise<QuestionDefinition>;

  // Common functionality for all controllers
  protected validateParams(params: GenerationParams): void;
  protected selectScenario(format: QuestionFormat, yearLevel: number): Promise<ScenarioContext>;
  protected generateDistractors(correctAnswer: any, context: DistractorContext): Promise<Distractor[]>;
}
```

#### Implemented Controllers

##### DirectCalculationController
- **File**: `lib/controllers/direct-calculation.controller.ts`
- **Purpose**: Traditional "What is X + Y?" questions with enhanced distractors
- **Models Supported**: All 25+ math models
- **Features**: Smart distractor generation, working steps, explanations

##### ComparisonController
- **File**: `lib/controllers/comparison.controller.ts`
- **Purpose**: "Which is better value?" comparison questions
- **Models Supported**: UNIT_RATE, COMPARISON, calculation comparisons
- **Features**: Unit rate analysis, value comparison logic

#### Pending Controllers (Architecture Ready)
- **EstimationController**: Benchmark-based estimation questions
- **ValidationController**: "Do you have enough?" scenarios
- **MultiStepController**: Sequential calculation chains
- **MissingValueController**: Algebraic "find the missing number"
- **OrderingController**: Sort by value/size/rate
- **PatternController**: Number and shape sequence recognition

### 2. Service Layer

#### Distractor Engine
```typescript
// lib/services/distractor-engine.service.ts
export class DistractorEngine {
  private strategies: Map<DistractorStrategy, DistractorRule>;
  private misconceptionLibrary: MisconceptionLibrary;

  async generate(correctAnswer: any, context: DistractorContext, count: number = 3): Promise<Distractor[]>;
}
```

**Implemented Strategies (8/8)**:
1. **WRONG_OPERATION** - Used wrong mathematical operation
2. **PLACE_VALUE_ERROR** - Carrying/borrowing mistakes
3. **PARTIAL_CALCULATION** - Stopped before completion
4. **UNIT_CONFUSION** - Percentage/decimal errors
5. **REVERSED_COMPARISON** - Selected worse option in comparisons
6. **CLOSE_VALUE** - Off by small amounts
7. **OFF_BY_MAGNITUDE** - Factor of 10 errors
8. **COMMON_MISCONCEPTION** - Research-based student errors

#### Scenario Service
```typescript
// lib/services/scenario.service.ts
export class ScenarioService {
  async selectScenario(criteria: ScenarioCriteria): Promise<ScenarioContext>;
  async generateDynamicScenario(theme: ScenarioTheme, yearLevel: number): Promise<ScenarioContext>;
}
```

**Implemented Themes**:
- **SHOPPING** - Product purchases, price comparisons
- **SCHOOL** - Supplies, classroom scenarios
- **SPORTS** - Equipment, team activities
- **COOKING** - Ingredients, recipe scaling
- **POCKET_MONEY** - Saving goals, allowances

**Planned Themes**: Transport, Collections, Nature, Household, Celebrations

### 3. Orchestration Layer

#### Question Orchestrator
```typescript
// lib/orchestrator/question-orchestrator.ts
export class QuestionOrchestrator {
  private controllers: Map<QuestionFormat, QuestionController>;
  private formatSelector: FormatSelector;
  private renderer: QuestionRenderer;

  async generateQuestion(request: EnhancedQuestionRequest): Promise<EnhancedQuestion>;
}
```

**Responsibilities**:
- Format selection based on model compatibility and preferences
- Controller routing and parameter preparation
- Question assembly and metadata enhancement
- Response rendering and formatting

#### Format Selector
```typescript
export class FormatSelector {
  getAvailableFormats(modelId: string, difficulty: SubDifficultyLevel): QuestionFormat[];
  selectFormat(available: QuestionFormat[], preference?: QuestionFormat, pedagogicalFocus?: string): QuestionFormat;
}
```

**Selection Logic**:
1. User preference (if available and compatible)
2. Pedagogical focus alignment
3. Weighted random selection for variety

### 4. Type System

#### Enhanced Difficulty System
```typescript
export interface SubDifficultyLevel {
  year: number;        // 1-6
  subLevel: number;    // 1-4
  displayName: string; // "3.2"
  cognitiveLoad: number; // 0-100
}
```

**Sub-level Progression**:
- **X.1** = Introductory (basic concepts)
- **X.2** = Developing (building skills)
- **X.3** = Standard (expected level)
- **X.4** = Advanced (extension work)

#### Question Definition Structure
```typescript
export interface QuestionDefinition {
  id: string;
  timestamp: Date;
  format: QuestionFormat;
  mathModel: string;
  difficulty: SubDifficultyLevel;
  scenario: ScenarioContext;
  parameters: QuestionParameters;
  solution: QuestionSolution;
  metadata: QuestionMetadata;
}
```

### 5. API Architecture

#### Enhanced Endpoint
```typescript
// app/api/generate/enhanced/route.ts
POST /api/generate/enhanced
```

**Request Features**:
- Format preference selection
- Scenario theme selection
- Enhanced difficulty (X.Y format)
- Batch generation (1-20 questions)
- Pedagogical focus specification

**Response Enhancements**:
- Rich question metadata
- Cognitive load metrics
- Curriculum alignment tags
- Distractor strategy information
- Scenario context details

#### Backward Compatibility
```typescript
// lib/adapters/legacy-adapter.ts
export class LegacyAdapter {
  convertRequest(legacyRequest: GenerateRequest): EnhancedQuestionRequest;
  convertResponse(enhancedQuestion: any): GeneratedQuestion;
  async generateLegacyQuestion(request: GenerateRequest): Promise<GeneratedQuestion>;
}
```

**Compatibility Features**:
- 100% backward compatibility maintained
- Response format preservation
- Gradual migration support
- Feature flags for rollout control

## Implementation Patterns

### Controller Implementation Pattern
1. **Validate Parameters**: Check request validity
2. **Generate Math Output**: Use existing Math Engine
3. **Select Scenario**: Choose appropriate context
4. **Calculate Solution**: Determine correct answer
5. **Generate Distractors**: Create wrong answers
6. **Assemble Question**: Combine all components

### Scenario Generation Pattern
1. **Theme Selection**: Based on preferences and appropriateness
2. **Dynamic Generation**: Procedural content creation
3. **Cultural Adaptation**: UK-specific elements
4. **Year Appropriateness**: Age-suitable content
5. **Template Application**: Fill placeholders with values

### Distractor Generation Pattern
1. **Strategy Selection**: Based on format and model compatibility
2. **Candidate Generation**: Multiple distractor options
3. **Quality Filtering**: Remove duplicates and poor options
4. **Diversity Ensuring**: Variety in strategy types
5. **Educational Value**: Pedagogically meaningful errors

## Performance Characteristics

### Benchmarks
- **Single Question**: <100ms generation time
- **Batch Generation**: Linear scaling, <200ms average
- **Memory Usage**: Efficient with 25+ models
- **Compatibility**: Zero performance regression

### Scalability Features
- **Controller Pattern**: Unlimited format extensibility
- **Service Architecture**: Independent component scaling
- **Database Ready**: Scenario storage preparation
- **Caching Support**: Response and component caching

## Educational Alignment

### UK National Curriculum Integration
- **Curriculum Tags**: Automatic objective alignment
- **Year Progression**: Smooth difficulty transitions
- **Cultural Context**: British currency, measurements, customs
- **Assessment Support**: Question metadata for tracking

### Pedagogical Features
- **Cognitive Load**: Scientifically calculated difficulty
- **Misconception Targeting**: Research-based error patterns
- **Variety**: Multiple formats prevent pattern memorization
- **Engagement**: Rich, relatable scenarios

This enhanced architecture extends the proven Math Engine foundation with sophisticated educational features while preserving the reliability and accuracy of the original system.