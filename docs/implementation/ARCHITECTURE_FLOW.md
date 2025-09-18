# Factory Architect: Visual Architecture Flow Chart
## Question Generation System Overview

**Document Version:** 1.0  
**Last Updated:** September 5, 2025  

---

## Executive Summary

This document provides a comprehensive visual mapping of how Factory Architect's mathematical models are orchestrated to generate educational questions. The system follows a **two-engine architecture** that separates mathematical computation from narrative storytelling.

---

## 🏗️ High-Level Architecture Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   USER REQUEST  │ ───▶│  API ENDPOINT    │ ───▶│  FINAL QUESTION │
│                 │    │  /api/generate   │    │  WITH ANSWER    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       ▲
         │                       ▼                       │
         │              ┌──────────────────┐              │
         │              │  ORCHESTRATION   │              │
         │              │     LAYER        │              │
         │              └──────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐              │
         │              │   MATH ENGINE    │              │
         │              │   (Pure Logic)   │              │
         │              └──────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐              │
         │              │   STORY ENGINE   │              │
         │              │ (Narrative Wrap) │              │
         │              └──────────────────┘              │
         │                       │                       │
         └───────────────────────┴───────────────────────┘
```

---

## 📊 Detailed System Flow Diagram

### Phase 1: Request Processing
```
┌──────────────────────────────────────────────────────────────┐
│                    API REQUEST PROCESSING                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User/Test Interface                                         │
│  ┌─────────────────┐                                         │
│  │   POST Request  │ ──────┐                                 │
│  │   {             │       │                                 │
│  │   model_id,     │       │                                 │
│  │   year_level,   │       ▼                                 │
│  │   context_type, │  ┌─────────────────┐                   │
│  │   difficulty_   │  │  VALIDATION     │                   │
│  │   params        │  │  - Check model  │                   │
│  │   }             │  │    exists       │                   │
│  └─────────────────┘  │  - Validate     │                   │
│                       │    parameters   │                   │
│                       └─────────────────┘                   │
│                                │                            │
│                                ▼                            │
│                       ┌─────────────────┐                   │
│                       │   ROUTE TO      │                   │
│                       │  MATH ENGINE    │                   │
│                       └─────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Phase 2: Math Engine Processing
```
┌────────────────────────────────────────────────────────────────┐
│                      MATH ENGINE LAYER                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐           ┌─────────────────┐             │
│  │  MODEL REGISTRY │           │ DIFFICULTY      │             │
│  │  [18 Models]    │ ─────────▶│ PRESET SYSTEM   │             │
│  │                 │           │                 │             │
│  │ • ADDITION      │           │ Year 1-6        │             │
│  │ • SUBTRACTION   │           │ Parameters      │             │
│  │ • MULTIPLICATION│           │ • max_value     │             │
│  │ • DIVISION      │           │ • decimal_places│             │
│  │ • PERCENTAGE    │           │ • min_value     │             │
│  │ • FRACTION      │           │ • operations    │             │
│  │ • ... (13 more) │           │                 │             │
│  └─────────────────┘           └─────────────────┘             │
│           │                            │                       │
│           ▼                            ▼                       │
│  ┌─────────────────────────────────────────────┐               │
│  │          INDIVIDUAL MODEL EXECUTION          │               │
│  │                                             │               │
│  │  Example: ADDITION Model                    │               │
│  │  ┌─────────────────────────────────────┐    │               │
│  │  │ 1. Generate random operands         │    │               │
│  │  │ 2. Apply year-level constraints     │    │               │
│  │  │ 3. Perform mathematical operation   │    │               │
│  │  │ 4. Format outputs (decimal, whole)  │    │               │
│  │  │ 5. Create structured result object  │    │               │
│  │  └─────────────────────────────────────┘    │               │
│  └─────────────────────────────────────────────┘               │
│                           │                                    │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────┐               │
│  │          MATH OUTPUT STRUCTURE              │               │
│  │                                             │               │
│  │  {                                          │               │
│  │    operation: "ADDITION",                   │               │
│  │    operands: [12, 8],                       │               │
│  │    result: 20,                              │               │
│  │    decimal_formatted: {                     │               │
│  │      operands: ["12.00", "8.00"],           │               │
│  │      result: "20.00"                        │               │
│  │    },                                       │               │
│  │    difficulty_level: 3,                     │               │
│  │    working: [...steps...]                   │               │
│  │  }                                          │               │
│  └─────────────────────────────────────────────┘               │
└────────────────────────────────────────────────────────────────┘
```

### Phase 3: Story Engine Processing
```
┌──────────────────────────────────────────────────────────────────┐
│                      STORY ENGINE LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Math Output           Context Generator                         │
│  ┌─────────────────┐   ┌─────────────────┐                      │
│  │ Pure Numbers    │──▶│  MONEY CONTEXT  │                      │
│  │ & Operations    │   │                 │                      │
│  │                 │   │ • Random person │                      │
│  │ result: 20      │   │ • Shop scenario │                      │
│  │ operands:[12,8] │   │ • Item types    │                      │
│  │ operation: ADD  │   │ • Currency: £   │                      │
│  └─────────────────┘   └─────────────────┘                      │
│          │                       │                              │
│          └───────────┬───────────┘                              │
│                      ▼                                          │
│  ┌─────────────────────────────────────────────┐                │
│  │          STORY ENGINE PROCESSOR             │                │
│  │                                             │                │
│  │  1. Match Operation to Template             │                │
│  │     - isAdditionOutput() ──▶ Template A    │                │
│  │     - isSubtractionOutput() ──▶ Template B │                │
│  │     - etc.                                  │                │
│  │                                             │                │
│  │  2. Inject Context Variables                │                │
│  │     - Replace {person} with "Sarah"         │                │
│  │     - Replace {items} with ["apple","pen"]  │                │
│  │     - Format money with £ symbol            │                │
│  │                                             │                │
│  │  3. Generate Question Text                  │                │
│  │  4. Generate Answer Text                    │                │
│  └─────────────────────────────────────────────┘                │
│                      │                                          │
│                      ▼                                          │
│  ┌─────────────────────────────────────────────┐                │
│  │            STORY OUTPUT                     │                │
│  │                                             │                │
│  │  Question: "Sarah goes to the shop and     │                │
│  │  buys an apple for £12.00 and a pen for    │                │
│  │  £8.00. How much does Sarah spend in       │                │
│  │  total?"                                    │                │
│  │                                             │                │
│  │  Answer: "£20.00"                           │                │
│  └─────────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

### Phase 4: Response Assembly
```
┌────────────────────────────────────────────────────────────────┐
│                    RESPONSE ASSEMBLY                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Story Output + Math Output + Metadata                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ question:   │ │ math_output:│ │ metadata:   │              │
│  │ "Sarah..."  │ │ {operands,  │ │ {model_id,  │              │
│  │             │ │  result,    │ │  year_level,│              │
│  │ answer:     │ │  working}   │ │  timestamp} │              │
│  │ "£20.00"    │ │             │ │             │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                │                              │
│                                ▼                              │
│              ┌─────────────────────────────────────┐          │
│              │        FINAL JSON RESPONSE          │          │
│              │                                     │          │
│              │  {                                  │          │
│              │    "question": "Sarah goes to...",  │          │
│              │    "answer": "£20.00",              │          │
│              │    "math_output": {...},            │          │
│              │    "context": {...},                │          │
│              │    "metadata": {...}                │          │
│              │  }                                  │          │
│              └─────────────────────────────────────┘          │
│                                │                              │
│                                ▼                              │
│              ┌─────────────────────────────────────┐          │
│              │       RETURN TO USER/UI             │          │
│              └─────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Interaction Map

### File System Mapping
```
📁 Factory Architect Root
│
├── 🌐 API Layer (app/api/generate/route.ts)
│   │
│   ├──▶ 🧮 Math Engine (lib/math-engine/)
│   │   │
│   │   ├── 📋 index.ts (Model Registry & Orchestrator)
│   │   │   ├── mathModels{} ──▶ 18 Model Instances
│   │   │   ├── getModel() ──▶ Retrieve Specific Model
│   │   │   └── generateMathQuestion() ──▶ Execute Model
│   │   │
│   │   ├── 📁 models/ (Individual Model Files)
│   │   │   ├── addition.model.ts
│   │   │   ├── subtraction.model.ts
│   │   │   ├── multiplication.model.ts
│   │   │   ├── division.model.ts
│   │   │   ├── ... (14 more models)
│   │   │   └── money-scaling.model.ts
│   │   │
│   │   └── 📊 difficulty.ts (Year-Level Presets)
│   │
│   └──▶ 📚 Story Engine (lib/story-engine/)
│       │
│       ├── 📝 story.engine.ts (Main Story Processor)
│       │   ├── generateQuestion() ──▶ Text Generation
│       │   ├── generateAnswer() ──▶ Answer Formatting
│       │   └── Operation Type Matching ──▶ Template Selection
│       │
│       └── 📁 contexts/ (Story Context Generators)
│           └── money.context.ts ──▶ Money Scenarios
│
├── 🧪 Testing Interface (app/test/page.tsx)
│   ├── Model Selection UI
│   ├── Parameter Controls
│   ├── Real-time Generation
│   └── Question Preview
│
├── 📊 Status Tracking (lib/models/model-status.ts)
│   └── MODEL_STATUS_REGISTRY ──▶ Completion Tracking
│
└── 🎯 Curriculum Integration (lib/curriculum/)
    ├── curriculum-parser.ts ──▶ UK Curriculum Data
    ├── curriculum-model-mapping.ts ──▶ Curriculum ↔ Model Links
    └── national_curriculum_framework.json ──▶ Raw Curriculum Data
```

---

## ⚙️ Individual Model Architecture

### Model Structure Pattern
All 18 mathematical models follow this standardized interface:

```typescript
┌─────────────────────────────────────────────────────────────────┐
│                    INDIVIDUAL MODEL STRUCTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  export class ExampleModel implements MathModel {               │
│                                                                 │
│    // 1. DIFFICULTY PARAMETERS                                  │
│    getDefaultParams(year: number) {                             │
│      return DifficultyPresets.getPreset('EXAMPLE', year);       │
│    }                                                            │
│                                                                 │
│    // 2. CORE GENERATION LOGIC                                  │
│    generate(params: ExampleParams): ExampleOutput {             │
│      ┌─────────────────────────────────────────┐               │
│      │  Step 1: Generate Random Values        │               │
│      │  - Use params.max_value                 │               │
│      │  - Apply year-level constraints         │               │
│      │  - Ensure educational appropriateness   │               │
│      └─────────────────────────────────────────┘               │
│                            │                                   │
│      ┌─────────────────────▼───────────────────┐               │
│      │  Step 2: Perform Mathematics            │               │
│      │  - Execute core operation               │               │
│      │  - Handle edge cases                    │               │
│      │  - Generate working steps               │               │
│      └─────────────────────────────────────────┘               │
│                            │                                   │
│      ┌─────────────────────▼───────────────────┐               │
│      │  Step 3: Format Outputs                 │               │
│      │  - Create decimal representations       │               │
│      │  - Generate multiple answer formats     │               │
│      │  - Structure return object              │               │
│      └─────────────────────────────────────────┘               │
│                            │                                   │
│                            ▼                                   │
│      return {                                                  │
│        operation: 'EXAMPLE',                                   │
│        inputs: [...],                                          │
│        result: number,                                         │
│        decimal_formatted: {...},                               │
│        working: [...],                                         │
│        difficulty_level: number                                │
│      };                                                        │
│    }                                                           │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Example Model Flow: ADDITION
```
INPUT PARAMETERS          PROCESSING STEPS              OUTPUT STRUCTURE
┌─────────────────┐       ┌─────────────────┐          ┌─────────────────┐
│ {               │       │ 1. Generate     │          │ {               │
│   max_value: 50,│  ────▶│    Random Nums  │ ────────▶│   operation:    │
│   min_value: 1, │       │    [12, 8]      │          │   "ADDITION",   │
│   decimal_      │       │                 │          │   operands:     │
│   places: 0,    │       │ 2. Add Numbers  │          │   [12, 8],      │
│   operands: 2   │       │    12 + 8 = 20  │          │   result: 20,   │
│ }               │       │                 │          │   working: [    │
└─────────────────┘       │ 3. Format       │          │     "12 + 8",   │
                          │    "12.00" +    │          │     "= 20"      │
                          │    "8.00" =     │          │   ],            │
                          │    "20.00"      │          │   decimal_      │
                          └─────────────────┘          │   formatted: {  │
                                                       │     operands:   │
                                                       │     ["12.00",   │
                                                       │      "8.00"],   │
                                                       │     result:     │
                                                       │     "20.00"     │
                                                       │   }             │
                                                       │ }               │
                                                       └─────────────────┘
```

---

## 🎭 Story Engine Template System

### Template Matching Logic
```
┌─────────────────────────────────────────────────────────────────┐
│                    STORY TEMPLATE SELECTION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Math Output Analysis:                                          │
│  ┌─────────────────┐      ┌─────────────────┐                  │
│  │ operation:      │ ────▶│ Template Router │                  │
│  │ "ADDITION"      │      │                 │                  │
│  └─────────────────┘      │ if isAddition() │                  │
│                           │   return        │                  │
│                           │   generateAdd   │                  │
│  ┌─────────────────┐      │   Question()    │                  │
│  │ context:        │ ────▶│                 │                  │
│  │ {               │      │ Templates:      │                  │
│  │   unit_type:    │      │ • Shopping      │                  │
│  │   "currency",   │      │ • Generic Math  │                  │
│  │   person:       │      │ • Measurement   │                  │
│  │   "Sarah"       │      │ • Time-based    │                  │
│  │ }               │      └─────────────────┘                  │
│  └─────────────────┘               │                           │
│                                    ▼                           │
│  ┌─────────────────────────────────────────────┐               │
│  │           TEMPLATE EXECUTION                │               │
│  │                                             │               │
│  │  Currency + Addition = Shopping Template:   │               │
│  │                                             │               │
│  │  `${person} goes to the shop and buys      │               │
│  │   ${purchases.join(', ')}. How much does   │               │
│  │   ${person} spend in total?`               │               │
│  │                                             │               │
│  │  Variable Substitution:                     │               │
│  │  • person ──▶ "Sarah"                       │               │
│  │  • purchases ──▶ ["apple for £12", "pen    │               │
│  │                   for £8"]                  │               │
│  │                                             │               │
│  │  Result:                                    │               │
│  │  "Sarah goes to the shop and buys an       │               │
│  │   apple for £12.00 and a pen for £8.00.    │               │
│  │   How much does Sarah spend in total?"      │               │
│  └─────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Context Generation System
```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTEXT GENERATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MoneyContextGenerator.generate("ADDITION"):                    │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Random Elements │    │  Context Object │                    │
│  │                 │    │                 │                    │
│  │ • Person: from  │───▶│ {               │                    │
│  │   ["Sarah",     │    │   unit_type:    │                    │
│  │    "Tom",       │    │   "currency",   │                    │
│  │    "Emma"]      │    │   unit_symbol:  │                    │
│  │                 │    │   "£",          │                    │
│  │ • Items: from   │    │   person:       │                    │
│  │   ["apple",     │    │   "Sarah",      │                    │
│  │    "pen",       │    │   item_         │                    │
│  │    "book"]      │    │   descriptors:  │                    │
│  │                 │    │   ["apple",     │                    │
│  │ • Scenario:     │    │    "pen"],      │                    │
│  │   "shopping"    │    │   scenario_     │                    │
│  └─────────────────┘    │   type:         │                    │
│                         │   "shopping"    │                    │
│                         │ }               │                    │
│                         └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Testing and Development Flow

### Web Interface Integration (`/test`)
```
┌─────────────────────────────────────────────────────────────────┐
│                      TESTING INTERFACE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Interaction:                                              │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ 1. Select Model │───▶│ 2. Choose Year  │                    │
│  │   "ADDITION"    │    │    Level: 4     │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                       │                            │
│           ▼                       ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ 3. Adjust       │    │ 4. Generate     │                    │
│  │   Parameters    │───▶│   Question      │                    │
│  │   max_value: 50 │    │                 │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                   │                            │
│                                   ▼                            │
│  ┌─────────────────────────────────────────────┐               │
│  │           API CALL TO /api/generate         │               │
│  │                                             │               │
│  │  POST {                                     │               │
│  │    model_id: "ADDITION",                    │               │
│  │    year_level: 4,                           │               │
│  │    difficulty_params: {                     │               │
│  │      max_value: 50,                         │               │
│  │      min_value: 1,                          │               │
│  │      decimal_places: 0                      │               │
│  │    },                                       │               │
│  │    context_type: "money"                    │               │
│  │  }                                          │               │
│  └─────────────────────────────────────────────┘               │
│                                   │                            │
│                                   ▼                            │
│  ┌─────────────────────────────────────────────┐               │
│  │              UI DISPLAY                     │               │
│  │                                             │               │
│  │  Question: "Sarah goes to the shop..."      │               │
│  │  Answer: "£20.00" (Hidden until revealed)   │               │
│  │  Debug Info: Math output, context, timing   │               │
│  │  History: Previous 5 generated questions    │               │
│  └─────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Model Status Integration

### Registry-Based Status Tracking
```
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL STATUS SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODEL_STATUS_REGISTRY (lib/models/model-status.ts):           │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ ADDITION: {     │    │ Status Icons:   │                    │
│  │   status:       │───▶│ ✅ COMPLETE     │                    │
│  │   "complete",   │    │ 🚧 WIP          │                    │
│  │   years: [1-6], │    │ ❌ BROKEN       │                    │
│  │   curriculum:   │    │ 📋 PLANNED      │                    │
│  │   [...areas]    │    └─────────────────┘                    │
│  │ }               │                                           │
│  └─────────────────┘    ┌─────────────────┐                    │
│           │             │ Testing UI      │                    │
│           └────────────▶│ Shows status    │                    │
│                         │ per model       │                    │
│                         │ Color coding    │                    │
│                         │ Issue tracking  │                    │
│                         └─────────────────┘                    │
│                                                                 │
│  Integration Points:                                            │
│  • Test Interface ──▶ Filters by status                        │
│  • API Validation ──▶ Blocks broken models (optional)          │
│  • Documentation ──▶ Auto-generates status reports             │
│  • CI/CD Pipeline ──▶ Tracks completion progress               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Curriculum Integration Flow

### UK National Curriculum Mapping
```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRICULUM INTEGRATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Data Flow:                                                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Raw Curriculum  │───▶│ Curriculum      │                    │
│  │ JSON Data       │    │ Parser          │                    │
│  │                 │    │                 │                    │
│  │ 174 distinct    │    │ • getStrands()  │                    │
│  │ requirements    │    │ • getSubstrands │                    │
│  │ across 9        │    │ • getYearContent│                    │
│  │ strands         │    │ • searchBy      │                    │
│  │                 │    │   Keywords()    │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                   │                            │
│                                   ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Model-Curriculum│───▶│ Test Interface  │                    │
│  │ Mapping         │    │ Curriculum Mode │                    │
│  │                 │    │                 │                    │
│  │ • Direct maps   │    │ 1. Select       │                    │
│  │ • Keyword maps  │    │    Strand       │                    │
│  │ • Suggested     │    │ 2. Pick         │                    │
│  │   models per    │    │    Substrand    │                    │
│  │   curriculum    │    │ 3. Choose Year  │                    │
│  │   area          │    │ 4. Get suggested│                    │
│  └─────────────────┘    │    models       │                    │
│                         │ 5. Generate     │                    │
│                         │    aligned      │                    │
│                         │    questions    │                    │
│                         └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Development and Extension Guidelines

### Adding a New Model
```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW MODEL CREATION FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Create Model File                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ lib/math-engine/models/your-model.model.ts                 │ │
│  │                                                             │ │
│  │ • Implement MathModel interface                             │ │
│  │ • Define parameter types                                    │ │
│  │ • Create generate() method                                  │ │
│  │ • Add getDefaultParams() method                             │ │
│  │ • Follow naming conventions                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  Step 2: Register Model                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ lib/math-engine/index.ts                                    │ │
│  │                                                             │ │
│  │ • Import your model                                         │ │
│  │ • Add to mathModels registry                                │ │
│  │ • Export model class                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  Step 3: Add Story Templates                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ lib/story-engine/story.engine.ts                            │ │
│  │                                                             │ │
│  │ • Add operation detection                                   │ │
│  │ • Create question generation method                         │ │
│  │ • Create answer generation method                           │ │
│  │ • Handle different context types                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  Step 4: Update Status Registry                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ lib/models/model-status.ts                                  │ │
│  │                                                             │ │
│  │ • Add model entry to MODEL_STATUS_REGISTRY                  │ │
│  │ • Define curriculum areas                                   │ │
│  │ • Set initial status (WIP)                                  │ │
│  │ • Add supported years                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  Step 5: Test and Validate                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Use /test interface to:                                     │ │
│  │                                                             │ │
│  │ • Test model generation                                     │ │
│  │ • Validate parameters                                       │ │
│  │ • Check question quality                                    │ │
│  │ • Verify curriculum alignment                               │ │
│  │ • Update status to COMPLETE                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Key Integration Points Summary

| **Component** | **File** | **Primary Function** | **Integration** |
|---------------|----------|---------------------|-----------------|
| **API Layer** | `app/api/generate/route.ts` | Request handling | Orchestrates entire flow |
| **Math Engine** | `lib/math-engine/index.ts` | Model registry | Routes to specific models |
| **Individual Models** | `lib/math-engine/models/*.ts` | Number generation | Pure mathematical logic |
| **Story Engine** | `lib/story-engine/story.engine.ts` | Text generation | Wraps math in narratives |
| **Context System** | `lib/story-engine/contexts/*.ts` | Scenario creation | Provides story variables |
| **Test Interface** | `app/test/page.tsx` | Development UI | Real-time model testing |
| **Status Registry** | `lib/models/model-status.ts` | Completion tracking | Progress monitoring |
| **Curriculum Data** | `context/national_curriculum_framework.json` | UK standards | Educational alignment |
| **Curriculum Parser** | `lib/curriculum/curriculum-parser.ts` | Data processing | Structured access to standards |
| **Curriculum Mapping** | `lib/curriculum/curriculum-model-mapping.ts` | Model suggestions | Links models to standards |

---

## 🎯 Quick Navigation Links

- **API Endpoint:** [`app/api/generate/route.ts`](app/api/generate/route.ts)
- **Math Engine:** [`lib/math-engine/index.ts`](lib/math-engine/index.ts)  
- **Story Engine:** [`lib/story-engine/story.engine.ts`](lib/story-engine/story.engine.ts)
- **Test Interface:** [`app/test/page.tsx`](app/test/page.tsx)
- **Model Registry:** [`lib/models/model-status.ts`](lib/models/model-status.ts)
- **Implementation Guide:** [`FACTORY_MODEL_IMPLEMENTATION_GUIDE.md`](FACTORY_MODEL_IMPLEMENTATION_GUIDE.md)

---

*This flow chart provides a complete technical overview of how Factory Architect's modular architecture creates contextual mathematical questions through the separation of mathematical logic and narrative storytelling.*