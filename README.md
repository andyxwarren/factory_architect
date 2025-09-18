# Factory Architect

Factory Architect is a TypeScript-based educational question generator for UK National Curriculum Mathematics. The project implements a sophisticated two-engine architecture that separates mathematical logic from narrative context.

## Architecture Overview

- **Math Engine**: Pure mathematical models that operate on numbers and logical parameters
- **Story Engine**: Contextual layer that wraps mathematical output with real-world scenarios

This separation allows the same mathematical operation to be presented in different contexts (money, measurements, objects, etc.) while maintaining mathematical accuracy and enabling precise difficulty scaling.

## Core Features

- **Atomic Mathematical Models**: Individual models for each operation (ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, etc.)
- **Difficulty Scaling**: Questions can be incrementally adjusted by manipulating numerical parameters
- **Context Flexibility**: Mathematical output can be wrapped with different story contexts
- **Curriculum Compliance**: Aligned with UK National Curriculum Framework (Years 1-6)
- **Interactive Testing**: Web interface for real-time model testing and parameter adjustment

## Tech Stack

- **Next.js** with TypeScript and Tailwind CSS
- **API Routes** for question generation and testing
- **Web Interface** for interactive model testing and parameter adjustment

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd factory_architect

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the main dashboard.

### Testing Interface

Access the model testing interface at [http://localhost:3000/test](http://localhost:3000/test) when running the development server. This provides:

- Interactive parameter controls for each mathematical model
- Real-time question generation and preview
- Batch testing with statistical analysis
- Export functionality for generated questions

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
npm run test     # Run tests (when implemented)
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

Each model includes:
- Difficulty parameters (max_value, decimal_places, etc.)
- Progression logic (Year 1-6 complexity scaling)
- JSON output contracts for the Story Engine
- Required context variables for story wrapping

## Key Files & Directories

- `src/lib/math-engine/models/` - Individual mathematical models
- `src/lib/story-engine/` - Story contexts and templates
- `src/app/test/` - Web UI for testing models
- `src/app/api/` - API endpoints for generation and testing
- `context/` - UK curriculum data and example questions
- `ARCHITECTURE.md` - Detailed technical architecture
- `CLAUDE.md` - AI assistant instructions

## Development Workflow

1. Implement mathematical models in `src/lib/math-engine/models/`
2. Test models via the web interface at `/test`
3. Create context libraries for different story themes
4. Build story templates and rendering logic
5. Integrate with the main generation service

## Contributing

The project prioritizes educational accuracy, scalable question generation, and flexible difficulty progression to support diverse learning needs across UK primary mathematics education.

For detailed technical architecture and implementation guidance, see `ARCHITECTURE.md`.