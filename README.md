# Factory Architect

Factory Architect is a TypeScript-based educational question generator for UK National Curriculum Mathematics. The project implements a sophisticated **Enhanced Question Generation System** that combines mathematical accuracy with pedagogical variety.

> 📚 **New Features Documentation**: See [FEATURES.md](./FEATURES.md) for the complete feature list, recent improvements, and usage examples.
>
> 🏗️ **Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and implementation details.

## Architecture Overview

### Core System (Established)
- **Math Engine**: Pure mathematical models that operate on numbers and logical parameters (25+ models)
- **Story Engine**: Contextual layer that wraps mathematical output with real-world scenarios

### Enhanced System (New)
- **Question Format Controllers**: 8 distinct cognitive question formats beyond basic calculation
- **Rich Scenario Service**: 10+ themed contexts with cultural awareness
- **Distractor Engine**: Pedagogically sound wrong answers based on common misconceptions
- **Orchestration Layer**: Intelligent format selection and question assembly

This dual architecture maintains complete backward compatibility while delivering advanced features for varied, engaging mathematical questions.

## Core Features

### Mathematical Foundation
- **25+ Atomic Mathematical Models**: Individual models for each operation (ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, PERCENTAGE, UNIT_RATE, GEOMETRY, etc.)
- **Enhanced Difficulty System**: Sub-level progression (X.Y format) for precise control
- **Curriculum Compliance**: Aligned with UK National Curriculum Framework (Years 1-6)

### Enhanced Question Generation
- **8 Question Formats**:
  - Direct Calculation ("What is 25 + 17?")
  - Comparison ("Which is better value?")
  - Estimation ("Estimate the capacity")
  - Validation ("Do you have enough money?")
  - Multi-Step (Multiple calculations required)
  - Missing Value ("Find the missing number")
  - Ordering ("Order from smallest to largest")
  - Pattern Recognition ("What comes next?")

### Rich Contextual Scenarios
- **10+ Themed Contexts**: Shopping, School, Sports, Cooking, Pocket Money, Transport, Collections, Nature, Household, Celebrations
- **Cultural Awareness**: UK-specific currency, measurements, and cultural references
- **Dynamic Generation**: Procedural scenario creation based on year level and theme

### Pedagogical Enhancements
- **Smart Distractors**: 8 strategies for generating educationally meaningful wrong answers
- **Misconception Library**: Based on common student errors and cognitive patterns
- **Cognitive Load Tracking**: Difficulty scoring from 0-100 for adaptive learning

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

#### Legacy Testing
- Interactive parameter controls for each mathematical model
- Real-time question generation and preview
- Batch testing with statistical analysis
- Export functionality for generated questions

#### Enhanced Testing
- Question format selection and testing
- Scenario theme preview and customization
- Distractor strategy analysis
- Cognitive load assessment
- Enhanced vs legacy comparison

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
npm run test     # Run tests (when implemented)
```

## API Endpoints

### Legacy Endpoint (Maintained)
```
POST /api/generate
```
Original question generation endpoint. Supports all 25+ math models with traditional difficulty parameters.

### Enhanced Endpoint (New)
```
POST /api/generate/enhanced
```
Advanced question generation with format selection, rich scenarios, and smart distractors.

**Example Enhanced Request:**
```json
{
  "model_id": "UNIT_RATE",
  "difficulty_level": "5.3",
  "format_preference": "COMPARISON",
  "scenario_theme": "SHOPPING",
  "pedagogical_focus": "reasoning",
  "quantity": 5
}
```

**Enhanced Response Features:**
- Multiple question formats
- Rich scenario contexts
- Pedagogical distractors
- Cognitive load metrics
- Curriculum alignment tags

### Documentation Endpoint
```
GET /api/generate/enhanced
```
Returns comprehensive API documentation and examples.

## Mathematical Models

The system implements **25+ atomic mathematical models** across multiple categories:

### Core Arithmetic
- **ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION** - Basic operations with enhanced difficulty progression
- **MULTI_STEP** - Sequential operation chains
- **LINEAR_EQUATION** - Function evaluation

### Advanced Mathematics
- **PERCENTAGE** - Percentage calculations and comparisons
- **UNIT_RATE** - Rate calculations and value comparisons
- **FRACTION** - Fractional arithmetic and relationships

### UK Money Models
- **COIN_RECOGNITION, CHANGE_CALCULATION** - Currency identification and transactions
- **MONEY_COMBINATIONS, MIXED_MONEY_UNITS** - Complex money operations
- **MONEY_FRACTIONS, MONEY_SCALING** - Proportional money reasoning

### Geometry Models
- **SHAPE_RECOGNITION, SHAPE_PROPERTIES** - 2D/3D shape analysis
- **ANGLE_MEASUREMENT, POSITION_DIRECTION** - Spatial reasoning
- **AREA_PERIMETER** - Measurement calculations

Each model includes:
- Enhanced difficulty parameters with sub-level progression (X.Y format)
- Year 1-6 complexity scaling with cognitive load calculation
- JSON output contracts compatible with both legacy and enhanced systems
- Multiple question format compatibility

## Key Files & Directories

### Core System
- `lib/math-engine/models/` - Individual mathematical models (25+ models)
- `lib/story-engine/` - Original story contexts and templates
- `app/api/generate/` - Legacy question generation API
- `app/test/` - Web UI for testing models

### Enhanced System
- `lib/types/question-formats.ts` - Enhanced type definitions and interfaces
- `lib/controllers/` - Question format controllers (Direct Calculation, Comparison, etc.)
- `lib/services/` - Enhanced services (Scenario Service, Distractor Engine)
- `lib/orchestrator/` - Question orchestration and format selection
- `app/api/generate/enhanced/` - Enhanced question generation API
- `lib/adapters/` - Backward compatibility and migration tools

### Documentation & Configuration
- `context/` - UK curriculum data and example questions
- `ARCHITECTURE.md` - Detailed technical architecture
- `IMPLEMENTATION_STATUS.md` - Feature implementation tracking
- `TESTING_GUIDE.md` - Testing instructions and examples
- `CLAUDE.md` - AI assistant instructions
- `new_features.md` - Enhanced system specification

## Development Workflow

1. Implement mathematical models in `src/lib/math-engine/models/`
2. Test models via the web interface at `/test`
3. Create context libraries for different story themes
4. Build story templates and rendering logic
5. Integrate with the main generation service

## Contributing

The project prioritizes educational accuracy, scalable question generation, and flexible difficulty progression to support diverse learning needs across UK primary mathematics education.

For detailed technical architecture and implementation guidance, see `ARCHITECTURE.md`.