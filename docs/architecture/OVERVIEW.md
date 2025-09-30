# Factory Architect - Architecture Overview

## Executive Summary

Factory Architect is a sophisticated educational question generation system that combines mathematical precision with pedagogical variety through a dual-engine architecture.

## Core Philosophy

### Separation of Concerns
- **Mathematical Logic** (Math Engine) - Pure computation, no narrative
- **Narrative Context** (Story Engine) - Real-world scenarios, no computation
- **Clean Separation** enables infinite variety without compromising accuracy

## System Architecture

### Two-Engine Foundation

```
┌─────────────────────────────────────────────────────────────┐
│                    FACTORY ARCHITECT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────────┐  │
│  │   MATH ENGINE       │      │   STORY ENGINE          │  │
│  │                     │      │                         │  │
│  │ • 25+ Models        │──────│ • 10+ Scenarios         │  │
│  │ • Pure Mathematics  │      │ • Cultural Context      │  │
│  │ • Difficulty Levels │      │ • Real-World Relevance  │  │
│  └─────────────────────┘      └─────────────────────────┘  │
│           │                              │                  │
│           └──────────────┬───────────────┘                  │
│                          │                                  │
│                ┌─────────▼──────────┐                       │
│                │   ORCHESTRATOR     │                       │
│                │                    │                       │
│                │ • Format Selection │                       │
│                │ • Question Assembly│                       │
│                │ • Quality Control  │                       │
│                └────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Enhanced System Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    ENHANCED FEATURES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  8 Question Format Controllers:                             │
│  ┌────────────────┬────────────────┬────────────────────┐   │
│  │ • Direct Calc  │ • Comparison   │ • Estimation       │   │
│  │ • Validation   │ • Multi-Step   │ • Missing Value    │   │
│  │ • Ordering     │ • Pattern      │                    │   │
│  └────────────────┴────────────────┴────────────────────┘   │
│                                                             │
│  Smart Distractor Engine (8 Strategies):                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Wrong Operation    • Place Value Error            │    │
│  │ • Partial Calculation • Unit Confusion              │    │
│  │ • Reversed Comparison • Close Value                 │    │
│  │ • Off by Magnitude   • Common Misconception         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Rich Scenario Service (10+ Themes):                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Shopping • School • Sports • Cooking • Pocket Money │    │
│  │ Transport • Collections • Nature • Household • More │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Principles

### 1. Atomic Models
Each mathematical operation is its own standalone model:
- ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION
- PERCENTAGE, FRACTION, LINEAR_EQUATION
- COIN_RECOGNITION, CHANGE_CALCULATION
- SHAPE_RECOGNITION, AREA_PERIMETER
- 25+ total models

### 2. Progressive Difficulty
Enhanced sub-level system (X.Y format):
- **X** = Year level (1-6)
- **Y** = Sub-level (1-4)
  - X.1 = Introductory
  - X.2 = Developing
  - X.3 = Standard
  - X.4 = Advanced

### 3. Format Flexibility
Same mathematical output can be presented as:
- Direct calculation: "What is 12 + 8?"
- Comparison: "Which costs more, £12 or £8?"
- Validation: "Does Sarah have enough if she has £12 and needs £20?"
- Missing value: "12 + ___ = 20"

### 4. Context Variety
Same calculation wrapped in different scenarios:
- Money: "Sarah buys an apple for £12..."
- Measurement: "A rope is 12 metres long..."
- Counting: "There are 12 children in the class..."

## Component Architecture

### Math Engine (`lib/math-engine/`)
- **Models** (`models/`) - 25+ mathematical models
- **Difficulty** (`difficulty.ts`) - Year-level presets
- **Enhanced Difficulty** (`difficulty-enhanced.ts`) - Sub-level system
- **Progression Tracker** (`progression-tracker.ts`) - Adaptive learning

### Story Engine (`lib/story-engine/`)
- **Story Engine** (`story.engine.ts`) - Template rendering
- **Contexts** (`contexts/`) - Scenario generators

### Enhanced System
- **Controllers** (`lib/controllers/`) - 8 question format controllers
- **Services** (`lib/services/`) - Scenario service, distractor engine
- **Orchestrator** (`lib/orchestrator/`) - Question assembly

### API Layer (`app/api/`)
- **Legacy** (`generate/route.ts`) - Backward compatibility
- **Enhanced** (`generate/enhanced/route.ts`) - Full features
- **Curriculum Bulk** (`curriculum-bulk/route.ts`) - Batch generation

### Frontend (`app/`)
- **Test Interface** (`test/`) - Model testing and development
- **Curriculum Manager** (`curriculum-manager/`) - Enhanced question management
- **Curriculum Tester** (`curriculum-tester/`) - Curriculum-based testing

## Data Flow

### Question Generation Pipeline

```
1. REQUEST
   ↓
2. ORCHESTRATOR
   • Selects question format
   • Routes to appropriate controller
   ↓
3. CONTROLLER
   • Generates mathematical output (Math Engine)
   • Selects scenario (Scenario Service)
   • Generates distractors (Distractor Engine)
   ↓
4. RENDERING
   • Populates question template
   • Formats numerical values
   • Assembles options
   ↓
5. RESPONSE
   • Question text
   • Answer options
   • Correct answer
   • Metadata
```

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Type System**: Comprehensive interfaces (700+ lines in `lib/types.ts`)

## Key Features

### Mathematical Accuracy
- Pure mathematical models ensure correctness
- Comprehensive test coverage
- Type-safe parameter handling
- Floating-point precision controls (2 decimal places)

### Pedagogical Excellence
- 8 cognitive question formats
- Misconception-based distractors
- Cultural awareness (UK curriculum)
- Adaptive difficulty progression

### Developer Experience
- Clear separation of concerns
- Comprehensive TypeScript types
- Modular architecture
- Easy extensibility

### Performance
- <50ms question generation (target: 200ms)
- Efficient scenario caching
- Parallel batch generation
- Optimized template rendering

## Curriculum Coverage

### UK National Curriculum Alignment
- **9 Mathematical Strands** covered
- **56 Substrands** addressed
- **174 Curriculum Requirements** mapped
- **Years 1-6** complete progression

### Coverage Status
- ✅ Number operations (100%)
- ✅ Measurement (95%)
- 🟡 Fractions/Decimals (70%)
- 🟡 Geometry (60%)
- 🔴 Statistics (30%)

## Quality Assurance

### Validation Layers
1. **Input Validation** - API parameter checking
2. **Mathematical Validation** - Correct calculation verification
3. **Content Validation** - Question text quality checks
4. **Format Validation** - Template rendering verification
5. **Output Validation** - Response structure compliance

### Error Handling
- Graceful fallback generation
- Comprehensive error logging
- User-friendly error messages
- Robust recovery mechanisms

## Extensibility

### Adding New Models
1. Create model file in `lib/math-engine/models/`
2. Implement `IMathModel` interface
3. Register in `lib/math-engine/index.ts`
4. Add difficulty presets
5. Test via `/test` interface

### Adding New Formats
1. Create controller in `lib/controllers/`
2. Extend `QuestionController` base class
3. Register in orchestrator
4. Implement format-specific logic
5. Add distractor strategies

### Adding New Scenarios
1. Add theme to `ScenarioService`
2. Create scenario templates
3. Define cultural elements
4. Test compatibility with models

## Documentation

- **[System Architecture](SYSTEM_ARCHITECTURE.md)** - Detailed technical documentation
- **[API Specification](API_SPECIFICATION.md)** - Complete API reference
- **[Architecture Flow](../implementation/ARCHITECTURE_FLOW.md)** - Visual diagrams
- **[User Guide](../guides/USER_GUIDE.md)** - Non-technical guide

## Support & Resources

- **Testing**: `/test` page for interactive testing
- **Curriculum Manager**: `/curriculum-manager` for enhanced features
- **API Documentation**: `GET /api/generate/enhanced` for endpoint docs
- **Changelog**: [See CHANGELOG.md](../status/CHANGELOG.md) for recent updates

---

*For detailed implementation information, see [System Architecture](SYSTEM_ARCHITECTURE.md)*