# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Factory Architect is a TypeScript-based educational question generator for UK National Curriculum Mathematics. The project implements a sophisticated two-engine architecture:

- **Math Engine**: Pure mathematical models that operate on numbers and logical parameters
- **Story Engine**: Contextual layer that wraps mathematical output with real-world scenarios

## Project Architecture

### Core Design Principles

1. **Separation of Concerns**: Mathematical logic is completely separated from narrative context
2. **Atomic Models**: Each mathematical operation (ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, etc.) is its own standalone model
3. **Difficulty Scaling**: Questions can be incrementally adjusted by manipulating numerical parameters
4. **Context Flexibility**: Same mathematical output can be wrapped with different story contexts (money, measurements, objects, etc.)

### Current Directory Structure

```
lib/
├── math-engine/
│   ├── models/              # Individual mathematical models (25+ models implemented)
│   ├── difficulty.ts        # Basic difficulty progression logic
│   ├── difficulty-enhanced.ts # Enhanced difficulty system with sub-levels
│   ├── progression-tracker.ts # Adaptive learning progression
│   └── index.ts            # Math engine exports
├── story-engine/
│   ├── contexts/           # Story context libraries (money.context.ts)
│   └── story.engine.ts     # Story rendering logic
├── curriculum/             # UK National Curriculum integration
│   ├── curriculum-parser.ts
│   └── curriculum-model-mapping.ts
├── types.ts               # Core TypeScript interfaces (700+ lines)
└── types-enhanced.ts      # Enhanced system types
app/
├── api/
│   └── generate/           # Question generation API with batch support
├── test/                   # Web UI for testing models
├── layout.tsx              # App layout
└── page.tsx               # Main dashboard
context/                   # Curriculum data and documentation
└── CURRICULUM_DATA.md     # UK curriculum framework data
```

## Mathematical Models

The system implements 25+ atomic mathematical models across multiple categories:

**Core Arithmetic Models:**
- **ADDITION** - Array summation with carrying support
- **SUBTRACTION** - Difference calculations with borrowing
- **MULTIPLICATION** - Products with decimal and fraction support
- **DIVISION** - Quotients and remainders
- **MULTI_STEP** - Sequential operation chains

**Advanced Mathematical Models:**
- **LINEAR_EQUATION** - `y = mx + c` evaluations
- **PERCENTAGE** - Percentage calculations and comparisons
- **UNIT_RATE** - Rate calculations and value comparisons
- **FRACTION** - Fractional calculations

**UK Money-Specific Models:**
- **COIN_RECOGNITION** - Identifying and counting UK coins/notes
- **CHANGE_CALCULATION** - Change calculation and breakdown
- **MONEY_COMBINATIONS** - Multiple ways to make amounts
- **MIXED_MONEY_UNITS** - Pounds and pence operations
- **MONEY_FRACTIONS** - Fractional money calculations
- **MONEY_SCALING** - Proportional money reasoning

**Geometry Models:**
- **SHAPE_RECOGNITION** - 2D/3D shape identification
- **SHAPE_PROPERTIES** - Counting sides, vertices, angles
- **ANGLE_MEASUREMENT** - Angle types and measurements
- **POSITION_DIRECTION** - Coordinates and directions
- **AREA_PERIMETER** - Area and perimeter calculations

Each model implements the `IMathModel<TParams, TOutput>` interface with:
- Typed difficulty parameters and outputs (see `lib/types.ts`)
- Year 1-6 progression logic with enhanced sub-level support
- Default parameter generation for each year level
- Comprehensive JSON output contracts for the Story Engine

## Enhanced Difficulty System

The project implements a sophisticated two-tier difficulty system:

1. **Traditional System**: Basic year levels 1-6 for standard progression
2. **Enhanced Sub-Level System**: Granular levels like "3.2" for precise difficulty control

### Sub-Level Format
- **X.Y** where X = year level (1-6), Y = sub-level (1-4)
- **X.1** = Introductory, **X.2** = Developing, **X.3** = Standard, **X.4** = Advanced
- Supported models: ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, PERCENTAGE, FRACTION

### Adaptive Learning Features
- **Session Tracking**: Track student progress across questions (`session_id`)
- **Adaptive Mode**: Automatically adjust difficulty based on performance
- **Confidence Mode**: Factor in student confidence ratings
- **Progression Tracking**: Monitor learning pathways and recommend next steps

## Key Implementation Notes

### Development Framework
- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS 4** for styling
- **Radix UI** components for interactive elements
- **API Routes** with batch generation support (1-20 questions)

### Type Safety
- Comprehensive TypeScript interfaces in `lib/types.ts` (700+ lines)
- Generic `IMathModel<TParams, TOutput>` interface ensures type safety
- Enhanced types in `lib/types-enhanced.ts` for advanced features
- Type guards for runtime type checking

### Context System
The project uses a flexible story context system:
- **MoneyContextGenerator** - UK currency-based scenarios
- **StoryEngine** - Renders mathematical output into natural language questions
- Context libraries provide themed scenarios (money, measurements, objects, etc.)

### API Architecture
- **POST /api/generate** - Generate questions with full parameter control
- Supports both single question and batch generation (1-20 questions)
- Enhanced difficulty system integration
- Session tracking and adaptive difficulty
- Comprehensive error handling and validation

## Development Commands

This is a Next.js project. Common commands:

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking (when available)
```

**Important**: After making changes to mathematical models or type definitions, always run `npm run lint` to ensure code quality and consistency.

## Testing Interface

Access the model testing interface at `/test` when running the development server. This provides:
- Interactive parameter controls for each mathematical model
- Real-time question generation and preview
- Batch testing with statistical analysis
- Export functionality for generated questions

## Key Files & Patterns

### Critical Files
- `lib/types.ts` - Core type definitions (700+ lines) - **READ FIRST** when working with models
- `lib/math-engine/index.ts` - Main engine exports and model registry
- `app/api/generate/route.ts` - Primary API endpoint with full feature set
- `context/CURRICULUM_DATA.md` - UK National Curriculum mapping

### Model Implementation Pattern
All mathematical models follow this structure:
```typescript
export class ModelNameModel implements IMathModel<ModelParams, ModelOutput> {
  model_id = "MODEL_NAME";

  generate(params: ModelParams): ModelOutput {
    // Mathematical logic here
  }

  getDefaultParams(year: number): ModelParams {
    // Year-appropriate default parameters
  }
}
```

### Type-First Development
1. **Always check `lib/types.ts` first** - Contains all interface definitions
2. Use proper TypeScript interfaces for all parameters and outputs
3. Implement type guards for runtime validation
4. Follow existing naming conventions (PascalCase for types, snake_case for properties)

### Testing Strategy
- **Web Interface**: `/test` page for interactive model testing
- **Batch Testing**: Generate 1-20 questions for statistical analysis
- **Parameter Validation**: API validates all inputs with detailed error messages
- **Real-time Feedback**: Immediate generation time and success metrics

## Development Workflow

1. **New Models**: Implement in `lib/math-engine/models/` following the `IMathModel` interface
2. **Type Definitions**: Add interfaces to `lib/types.ts` with proper TypeScript typing
3. **Registration**: Add model to the registry in `lib/math-engine/index.ts`
4. **Testing**: Use `/test` interface for parameter tuning and validation
5. **Story Contexts**: Create context generators in `lib/story-engine/contexts/`
6. **Integration**: Test via API endpoint with various difficulty parameters

### Code Quality Standards
- **Type Safety**: All models must implement proper TypeScript interfaces
- **Error Handling**: Comprehensive validation with descriptive error messages
- **Consistency**: Follow established patterns for parameter naming and output structure
- **Documentation**: Clear JSDoc comments for complex mathematical operations

The project prioritizes educational accuracy, type safety, and scalable question generation to support diverse learning needs across UK primary mathematics education.