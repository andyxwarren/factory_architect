# Factory Architect - Feature Documentation

## Overview
Factory Architect is an advanced educational question generation system for UK National Curriculum Mathematics. It features a sophisticated two-engine architecture with intelligent format selection, adaptive difficulty, and comprehensive question generation capabilities.

## Core Features

### 1. Two-Engine Architecture
- **Math Engine**: Pure mathematical models operating on numbers and logical parameters
- **Story Engine**: Contextual layer wrapping mathematical output with real-world scenarios
- Complete separation of mathematical logic from narrative context

### 2. Mathematical Models (25+)

#### Basic Arithmetic
- **ADDITION**: Array summation with carrying support
- **SUBTRACTION**: Difference calculations with borrowing
- **MULTIPLICATION**: Products with decimal and fraction support
- **DIVISION**: Quotients and remainders

#### Advanced Mathematics
- **PERCENTAGE**: Percentage calculations and comparisons
- **FRACTION**: Fractional calculations
- **LINEAR_EQUATION**: y = mx + c evaluations
- **UNIT_RATE**: Rate calculations and value comparisons
- **MULTI_STEP**: Sequential operation chains

#### Money-Specific Models (UK Currency)
- **COIN_RECOGNITION**: Identifying and counting UK coins/notes
- **CHANGE_CALCULATION**: Change calculation and breakdown
- **MONEY_COMBINATIONS**: Multiple ways to make amounts
- **MIXED_MONEY_UNITS**: Pounds and pence operations
- **MONEY_FRACTIONS**: Fractional money calculations
- **MONEY_SCALING**: Proportional money reasoning

#### Geometry Models
- **SHAPE_RECOGNITION**: 2D/3D shape identification
- **SHAPE_PROPERTIES**: Counting sides, vertices, angles
- **ANGLE_MEASUREMENT**: Angle types and measurements
- **POSITION_DIRECTION**: Coordinates and directions
- **AREA_PERIMETER**: Area and perimeter calculations

#### Measurement & Time
- **CONVERSION**: Unit conversions
- **TIME_RATE**: Time and rate problems
- **COUNTING**: Pattern counting

### 3. Enhanced Difficulty System

#### Sub-Level Precision
- Format: **X.Y** where X = year level (1-6), Y = sub-level (1-4)
- **X.1**: Introductory
- **X.2**: Developing
- **X.3**: Standard
- **X.4**: Advanced

#### Adaptive Learning Features
- Session tracking for student progress
- Automatic difficulty adjustment based on performance
- Confidence mode for self-assessment
- Progression tracking with learning pathways

### 4. Question Formats (8 Cognitive Types)

1. **DIRECT_CALCULATION**: Standard computation
2. **COMPARISON**: Compare values or quantities
3. **ESTIMATION**: Round or approximate results
4. **VALIDATION**: Check if calculation is correct
5. **MULTI_STEP**: Sequential problem solving
6. **MISSING_VALUE**: Find the unknown variable
7. **ORDERING**: Arrange in sequence
8. **PATTERN_RECOGNITION**: Identify and extend patterns

### 5. Intelligent Format Selection

#### Model-Specific Compatibility Matrix
Each mathematical model has specifically curated compatible formats:
- Basic arithmetic (ADD/SUB/MUL/DIV): Focus on calculation and word problems
- Advanced models (PERCENTAGE/FRACTION): Include estimation and validation
- Complex models (LINEAR_EQUATION): Pattern recognition and missing values

#### Year-Level Format Restrictions
Progressive format availability based on student year:
- **Year 1**: Direct calculation, comparison only
- **Year 2**: Add multi-step problems
- **Year 3**: Include missing value problems
- **Year 4**: Add estimation and ordering
- **Year 5**: Include validation
- **Year 6**: Full range including pattern recognition

### 6. Scenario System

#### Dynamic Themes
- **SHOPPING**: UK shop scenarios with realistic prices
- **SCHOOL**: Classroom and book fair contexts
- **POCKET_MONEY**: Weekly allowance and savings
- **SPORTS**: Sports equipment and activities
- **COOKING**: Recipe and ingredient calculations
- **NATURE**: Outdoor and environmental contexts
- **TRANSPORT**: Travel and journey problems

#### Scenario Features
- Character name randomization (no placeholders)
- Context-appropriate pricing
- UK cultural elements (£, British shops)
- Year-appropriate complexity

### 7. Generation Tracking & Transparency

#### Generation Setup Tracking
Every question includes detailed generation metadata:
- Controller used (DirectCalculation, Estimation, etc.)
- Format selection reasoning
- Scenario theme and selection method
- Distractor strategies employed
- Performance metrics (generation time)
- Enhancement status (full/partial/fallback)

#### Export Capabilities
- **CSV Export**: Full generation setup in 15+ columns
- **JSON Export**: Complete structured data
- **Curriculum Manager UI**: Visual display of generation details

### 8. Robust Error Handling

#### Fallback Mechanisms
- Automatic fallback question generation if rendering fails
- Numeric answer validation (no "undefined" or "NaN")
- Placeholder text detection and replacement
- Template processing with multiple fallback patterns

#### Quality Assurance
- Question text validation (minimum length, no "What is ?")
- Answer format verification (always numeric for math)
- Scenario data population checks
- Controller output structure validation

### 9. Batch Generation

#### Capabilities
- Generate 1-20 questions per request
- Parallel generation for performance
- Format and theme variety options
- Success rate tracking
- Average generation time metrics

#### Configuration Options
- `quantity`: Number of questions (1-20)
- `formatVariety`: Enable diverse formats
- `themeVariety`: Rotate through scenarios
- `preferredFormats`: Specify allowed formats
- `preferredThemes`: Select specific contexts

### 10. API Endpoints

#### POST /api/generate
Single or batch question generation with full parameter control:
```json
{
  "model_id": "ADDITION",
  "year_level": 4,
  "sub_level": "4.2",
  "quantity": 5,
  "context_type": "money",
  "session_id": "student-123"
}
```

#### POST /api/curriculum-bulk
Bulk generation for curriculum strands with enhanced tracking:
```json
{
  "strands": ["number-operations", "fractions"],
  "yearLevel": 3,
  "subLevel": 2,
  "questionsPerCombination": 5,
  "formatVariety": true,
  "themeVariety": true
}
```

### 11. Controller Architecture

#### Specialized Controllers
- **DirectCalculationController**: Standard math problems
- **EstimationController**: Rounding and approximation
- **ValidationController**: True/false and verification
- **ComparisonController**: Greater/less than problems
- **MultiStepController**: Complex word problems
- **MissingValueController**: Algebra-style problems
- **OrderingController**: Sequence and arrangement
- **PatternController**: Pattern identification

Each controller implements:
- Question text generation
- Answer calculation
- Distractor generation
- Scenario integration
- Format-specific logic

### 12. Performance Features

#### Optimization
- Parallel question generation
- Scenario caching with 15-minute TTL
- Efficient template processing
- Lazy controller initialization

#### Monitoring
- Generation time tracking per question
- Controller initialization metrics
- Success rate monitoring
- Error logging with context

## Recent Improvements (Sept 2025)

### Fixed Issues
1. **Placeholder Text**: 79 instances replaced with proper character names
2. **"What is ?" Questions**: Fixed incomplete question generation
3. **Non-numeric Answers**: All answers now properly formatted
4. **Empty Scenarios**: Sports/cooking contexts fully populated
5. **Controller Mismatches**: Format selection now model-aware

### Enhanced Features
1. **Fine-grained Format Compatibility**: Each model has curated compatible formats
2. **Year-Level Restrictions**: Progressive format availability by student year
3. **Fallback Generation**: Automatic recovery from rendering failures
4. **Template Processing**: Multiple pattern support for placeholder replacement
5. **Generation Transparency**: Complete tracking of generation pipeline

## Usage Examples

### Basic Question Generation
```typescript
// Generate a single addition question for Year 3
POST /api/generate
{
  "model_id": "ADDITION",
  "year_level": 3
}
```

### Advanced Batch Generation
```typescript
// Generate 10 varied questions with tracking
POST /api/generate
{
  "model_id": "PERCENTAGE",
  "year_level": 5,
  "sub_level": "5.3",
  "quantity": 10,
  "session_id": "class-2b",
  "formatVariety": true,
  "themeVariety": true
}
```

### Curriculum-Based Generation
```typescript
// Generate questions for specific curriculum strands
POST /api/curriculum-bulk
{
  "strands": ["number-operations", "measurement"],
  "yearLevel": 4,
  "questionsPerCombination": 3,
  "formatVariety": true
}
```

## Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=3000
```

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript checks
```

## Architecture Benefits

1. **Modularity**: Each component (model, controller, scenario) is independent
2. **Extensibility**: Easy to add new models, formats, or scenarios
3. **Type Safety**: Comprehensive TypeScript interfaces throughout
4. **Testability**: Clear separation enables unit testing
5. **Maintainability**: Organized structure with clear responsibilities

## Future Roadmap

- Visual question formats with diagrams
- Student performance analytics
- Custom curriculum mapping
- Multi-language support
- Collaborative problem sets
- Real-time difficulty adaptation
- Parent/teacher dashboards

## Support

For issues or feature requests, please refer to:
- Documentation: `/ARCHITECTURE.md`
- API Reference: `GET /api/generate`
- Test Interface: `http://localhost:3000/test`
- Curriculum Manager: `http://localhost:3000/curriculum-manager`