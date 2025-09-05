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

### Planned Directory Structure

```
src/
├── lib/
│   ├── math-engine/
│   │   ├── models/           # Individual mathematical models
│   │   ├── difficulty.ts     # Difficulty progression logic
│   │   └── index.ts         # Math engine exports
│   ├── story-engine/
│   │   ├── contexts/         # Story context libraries
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

## Mathematical Models

The system implements these atomic mathematical models:

1. **ADDITION** - Summing arrays of numerical values
2. **SUBTRACTION** - Finding differences between values
3. **MULTIPLICATION** - Computing products
4. **DIVISION** - Dividing with quotients and remainders
5. **MULTI_STEP** - Sequencing multiple operations
6. **LINEAR_EQUATION** - Evaluating `y = mx + c` functions
7. **PERCENTAGE** - Percentage calculations and comparisons
8. **UNIT_RATE** - Rate calculations and value comparisons

Each model has:
- Difficulty parameters (max_value, decimal_places, etc.)
- Progression logic (Year 1-6 complexity scaling)
- JSON output contracts for the Story Engine
- Required context variables for story wrapping

## Key Implementation Notes

### Development Framework
- **Next.js** with TypeScript and Tailwind CSS
- **API Routes** for question generation and testing
- **Web Interface** for interactive model testing and parameter adjustment

### Testing Strategy
- Each mathematical model should have comprehensive unit tests
- Web interface provides real-time testing and parameter adjustment
- Batch testing capabilities for validation and performance analysis

### Context System
The project uses context libraries organized by theme:
- `money.context.ts` - Currency-based scenarios
- `length.context.ts` - Measurement scenarios  
- `weight.context.ts` - Mass/weight scenarios

### Curriculum Compliance
- Aligned with UK National Curriculum Framework (Years 1-6)
- Question difficulty scales according to year-level expectations
- Comprehensive coverage of mathematical strands and sub-strands

## Development Commands

This is a Next.js project. Common commands:

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests (when implemented)
```

## Testing Interface

Access the model testing interface at `/test` when running the development server. This provides:
- Interactive parameter controls for each mathematical model
- Real-time question generation and preview
- Batch testing with statistical analysis
- Export functionality for generated questions

## Key Files

- `context/national_curriculum_framework.json` - Complete UK maths curriculum data
- `context/example_questions.json` - Example questions by curriculum strand
- `context/factory_blueprint_*.md` - Architectural design documentation
- `context/implementation_next_steps.md` - Detailed implementation guide

## Development Workflow

1. Implement mathematical models in `src/lib/math-engine/models/`
2. Test models via the web interface at `/test`
3. Create context libraries for different story themes
4. Build story templates and rendering logic
5. Integrate with the main generation service

The project prioritizes educational accuracy, scalable question generation, and flexible difficulty progression to support diverse learning needs across UK primary mathematics education.