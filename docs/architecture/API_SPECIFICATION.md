# Factory Architect API Specification

## Overview

Factory Architect provides three API endpoints for question generation, each serving different use cases while maintaining complete backward compatibility.

---

## Endpoints

### 1. POST /api/generate
**Purpose**: Legacy question generation endpoint (backward compatibility)

**Status**: ✅ Fully supported - all existing integrations continue to work

#### Request Format

```typescript
POST /api/generate
Content-Type: application/json

{
  // Required
  "model_id": string,           // Mathematical model (e.g., "ADDITION")

  // Optional
  "year_level": number,          // Year level 1-6
  "difficulty_level": string,    // Enhanced format "X.Y" (e.g., "3.2")
  "sub_level": string,           // Sub-level 1-4 (deprecated, use difficulty_level)
  "context_type": string,        // "money" | "generic" | etc.
  "quantity": number,            // Number of questions (1-20, default: 1)
  "difficulty_params": object,   // Model-specific overrides
  "session_id": string,          // For adaptive progression tracking
  "adaptive_mode": boolean,      // Enable adaptive difficulty
  "confidence_mode": boolean     // Enable confidence-building mode
}
```

#### Response Format

```typescript
{
  "success": boolean,
  "question": string,              // Question text
  "answer": string,                // Correct answer (formatted)
  "math_output": {                 // Raw mathematical output
    "operation": string,
    "operands": number[],
    "result": number,
    "working": string[],
    // ... model-specific fields
  },
  "context": {                     // Story context used
    "unit_type": string,
    "person": string,
    "items": any[],
    // ... context-specific fields
  },
  "metadata": {
    "model_id": string,
    "difficulty_level": string,
    "year_level": number,
    "timestamp": string,
    "generation_time_ms": number
  }
}
```

#### Example: Basic Question Generation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "year_level": 3
  }'
```

**Response**:
```json
{
  "success": true,
  "question": "Sarah goes to the shop and buys an apple for £12.00 and a pen for £8.00. How much does Sarah spend in total?",
  "answer": "£20.00",
  "math_output": {
    "operation": "ADDITION",
    "operands": [12, 8],
    "result": 20,
    "decimal_formatted": {
      "operands": ["12.00", "8.00"],
      "result": "20.00"
    }
  },
  "metadata": {
    "model_id": "ADDITION",
    "difficulty_level": "3.3",
    "year_level": 3,
    "generation_time_ms": 45
  }
}
```

#### Example: Enhanced Difficulty with Sub-levels

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "MULTIPLICATION",
    "difficulty_level": "4.2"
  }'
```

#### Example: Batch Generation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "PERCENTAGE",
    "year_level": 5,
    "quantity": 10,
    "context_type": "money"
  }'
```

**Response**:
```json
{
  "success": true,
  "questions": [
    { "question": "...", "answer": "...", ... },
    { "question": "...", "answer": "...", ... }
  ],
  "batch_stats": {
    "total": 10,
    "successful": 10,
    "failed": 0,
    "avg_generation_time_ms": 47
  }
}
```

---

### 2. POST /api/generate/enhanced
**Purpose**: Enhanced question generation with format selection and rich features

**Status**: ✅ Fully implemented - production ready

#### Request Format

```typescript
POST /api/generate/enhanced
Content-Type: application/json

{
  // Required
  "model_id": string,                    // Mathematical model

  // Optional - Difficulty
  "difficulty_level": string,            // "X.Y" format (e.g., "3.2")
  "year_level": number,                  // Fallback if difficulty_level not provided

  // Optional - Format & Scenario
  "format_preference": QuestionFormat,   // Preferred question format
  "scenario_theme": ScenarioTheme,       // Preferred scenario theme
  "pedagogical_focus": string,           // e.g., "reasoning", "calculation"

  // Optional - Batch Generation
  "quantity": number,                    // 1-20 questions (default: 1)
  "formatVariety": boolean,              // Use multiple formats
  "themeVariety": boolean,               // Rotate through themes
  "preferredFormats": QuestionFormat[],  // Allowed formats
  "preferredThemes": ScenarioTheme[],    // Allowed themes

  // Optional - Session & Tracking
  "session_id": string,                  // For progress tracking
  "adaptive_mode": boolean,              // Auto-adjust difficulty
  "confidence_mode": boolean,            // Lock difficulty for confidence

  // Optional - Output Control
  "include_explanation": boolean,        // Include working steps
  "include_working": boolean,            // Include step-by-step solution
  "distractor_count": number,            // Number of wrong answers (default: 3)
  "difficulty_params": object            // Model-specific overrides
}
```

#### Response Format

```typescript
{
  "success": boolean,
  "questions": [
    {
      "question": string,              // Question text
      "options": [                     // Answer options (shuffled)
        {
          "text": string,
          "value": any,
          "index": number
        }
      ],
      "correctIndex": number,          // Index of correct answer
      "metadata": {
        "format": QuestionFormat,      // Actual format used
        "model_id": string,
        "difficulty": string,
        "cognitiveLoad": number,       // 0-100
        "scenario_theme": string,
        "distractor_strategies": string[],
        "generation_time_ms": number,
        "enhancement_status": "full" | "partial" | "fallback"
      },
      "explanation": string,           // Optional: Working steps
      "working_steps": string[],       // Optional: Step-by-step solution
      "generation_setup": {            // Transparency tracking
        "controller_used": string,
        "format_selection_reason": string,
        "scenario_selection_method": string,
        "distractor_strategies_used": string[]
      }
    }
  ],
  "batch_stats": {                     // If quantity > 1
    "total": number,
    "successful": number,
    "failed": number,
    "avg_generation_time_ms": number,
    "formats_used": object,
    "themes_used": object
  },
  "session": {                         // If session_id provided
    "session_id": string,
    "consecutive_correct": number,
    "consecutive_incorrect": number,
    "current_streak": number,
    "recommended_difficulty": string,
    "confidence_mode_active": boolean
  }
}
```

#### Question Formats

```typescript
enum QuestionFormat {
  DIRECT_CALCULATION    // "What is 25 + 17?"
  COMPARISON           // "Which is better value?"
  ESTIMATION           // "Estimate the capacity"
  VALIDATION           // "Do you have enough money?"
  MULTI_STEP           // Multiple calculations required
  MISSING_VALUE        // "Find the missing number"
  ORDERING             // "Order from smallest to largest"
  PATTERN_RECOGNITION  // "What comes next?"
}
```

#### Scenario Themes

```typescript
enum ScenarioTheme {
  SHOPPING             // UK shop scenarios
  SCHOOL               // Classroom contexts
  SPORTS               // Equipment and activities
  COOKING              // Recipe and ingredients
  POCKET_MONEY         // Allowances and savings
  TRANSPORT            // Travel and journeys (planned)
  COLLECTIONS          // Trading and collecting (planned)
  NATURE               // Outdoor contexts (planned)
  HOUSEHOLD            // Chores and family (planned)
  CELEBRATIONS         // Parties and events (planned)
}
```

#### Example: Format-Specific Generation

```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "UNIT_RATE",
    "difficulty_level": "5.3",
    "format_preference": "COMPARISON",
    "scenario_theme": "SHOPPING"
  }'
```

**Response**:
```json
{
  "success": true,
  "questions": [
    {
      "question": "Pack A costs £5.00 for 250g. Pack B costs £3.50 for 200g. Which is better value?",
      "options": [
        {"text": "Pack A", "value": 0, "index": 2},
        {"text": "Pack B", "value": 1, "index": 0},
        {"text": "Both equal", "value": -1, "index": 1}
      ],
      "correctIndex": 0,
      "metadata": {
        "format": "COMPARISON",
        "model_id": "UNIT_RATE",
        "difficulty": "5.3",
        "cognitiveLoad": 75,
        "scenario_theme": "SHOPPING",
        "distractor_strategies": ["REVERSED_COMPARISON", "WRONG_SELECTION"],
        "generation_time_ms": 42,
        "enhancement_status": "full"
      },
      "generation_setup": {
        "controller_used": "ComparisonController",
        "format_selection_reason": "User preference",
        "scenario_selection_method": "Theme match",
        "distractor_strategies_used": ["REVERSED_COMPARISON", "WRONG_SELECTION"]
      }
    }
  ]
}
```

#### Example: Batch with Variety

```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "MULTIPLICATION",
    "difficulty_level": "4.3",
    "quantity": 10,
    "formatVariety": true,
    "themeVariety": true
  }'
```

**Response**:
```json
{
  "success": true,
  "questions": [
    { /* Question 1 - DIRECT_CALCULATION with SHOPPING theme */ },
    { /* Question 2 - ESTIMATION with SCHOOL theme */ },
    { /* Question 3 - MISSING_VALUE with SPORTS theme */ },
    { /* ... 7 more varied questions */ }
  ],
  "batch_stats": {
    "total": 10,
    "successful": 10,
    "failed": 0,
    "avg_generation_time_ms": 48,
    "formats_used": {
      "DIRECT_CALCULATION": 4,
      "ESTIMATION": 3,
      "MISSING_VALUE": 2,
      "VALIDATION": 1
    },
    "themes_used": {
      "SHOPPING": 3,
      "SCHOOL": 3,
      "SPORTS": 2,
      "COOKING": 2
    }
  }
}
```

#### Example: Session-Based Adaptive Learning

```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "DIVISION",
    "difficulty_level": "3.3",
    "session_id": "student-123",
    "adaptive_mode": true
  }'
```

**Response**:
```json
{
  "success": true,
  "questions": [ /* ... */ ],
  "session": {
    "session_id": "student-123",
    "consecutive_correct": 3,
    "consecutive_incorrect": 0,
    "current_streak": 5,
    "recommended_difficulty": "3.4",  // Suggested advancement
    "confidence_mode_active": false
  }
}
```

---

### 3. POST /api/curriculum-bulk
**Purpose**: Bulk generation for curriculum strands with enhanced tracking

**Status**: ✅ Fully implemented

#### Request Format

```typescript
POST /api/curriculum-bulk
Content-Type: application/json

{
  // Required
  "strands": string[],                  // Curriculum strands to cover

  // Optional - Difficulty
  "yearLevel": number,                  // Year level 1-6
  "subLevel": number,                   // Sub-level 1-4

  // Optional - Generation Settings
  "questionsPerCombination": number,    // Questions per strand (default: 1)
  "formatVariety": boolean,             // Use multiple formats
  "themeVariety": boolean,              // Rotate through themes
  "preferredFormats": QuestionFormat[], // Allowed formats
  "preferredThemes": ScenarioTheme[]    // Allowed themes
}
```

#### Response Format

```typescript
{
  "success": boolean,
  "questions": [
    {
      "question": string,
      "options": QuestionOption[],
      "correctIndex": number,
      "metadata": {
        // ... same as enhanced endpoint
        "curriculum_strand": string,
        "curriculum_substrand": string
      }
    }
  ],
  "curriculum_coverage": {
    "strands_covered": string[],
    "substrands_covered": string[],
    "models_used": string[],
    "total_questions": number
  },
  "batch_stats": {
    "total": number,
    "successful": number,
    "failed": number,
    "avg_generation_time_ms": number
  }
}
```

#### Example: Curriculum-Based Generation

```bash
curl -X POST http://localhost:3000/api/curriculum-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "strands": ["number-operations", "measurement"],
    "yearLevel": 4,
    "questionsPerCombination": 3,
    "formatVariety": true
  }'
```

---

## Error Handling

### Error Response Format

```typescript
{
  "success": false,
  "error": string,              // Error message
  "error_code": string,         // Machine-readable code
  "details": object,            // Additional context
  "timestamp": string
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_MODEL` | Model ID not recognized | 400 |
| `INVALID_YEAR` | Year level out of range (1-6) | 400 |
| `INVALID_DIFFICULTY` | Difficulty level format invalid | 400 |
| `INVALID_QUANTITY` | Quantity out of range (1-20) | 400 |
| `GENERATION_FAILED` | Question generation failed | 500 |
| `MODEL_ERROR` | Mathematical model error | 500 |
| `CONTROLLER_ERROR` | Controller error | 500 |

### Example Error Response

```json
{
  "success": false,
  "error": "Invalid model ID",
  "error_code": "INVALID_MODEL",
  "details": {
    "provided": "INVALID_MODEL",
    "available": ["ADDITION", "SUBTRACTION", "..."]
  },
  "timestamp": "2025-09-30T12:34:56Z"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. Recommended client-side limits:
- **Single requests**: No limit
- **Batch requests**: Max 20 questions per request
- **Concurrent requests**: Recommended max 10 concurrent

---

## Best Practices

### 1. Use Enhanced Endpoint for New Features
```typescript
// ✅ Recommended for new integrations
POST /api/generate/enhanced
{
  "model_id": "ADDITION",
  "difficulty_level": "3.2",
  "format_preference": "COMPARISON"
}
```

### 2. Leverage Batch Generation
```typescript
// ✅ Efficient - single request for multiple questions
POST /api/generate/enhanced
{
  "model_id": "MULTIPLICATION",
  "quantity": 10,
  "formatVariety": true
}

// ❌ Inefficient - multiple requests
for (let i = 0; i < 10; i++) {
  POST /api/generate/enhanced { ... }
}
```

### 3. Use Session Tracking for Adaptive Learning
```typescript
// ✅ Enable adaptive progression
POST /api/generate/enhanced
{
  "model_id": "DIVISION",
  "session_id": "student-123",
  "adaptive_mode": true
}
```

### 4. Handle Errors Gracefully
```typescript
try {
  const response = await fetch('/api/generate/enhanced', { ... });
  const data = await response.json();

  if (!data.success) {
    // Handle error based on error_code
    console.error(data.error_code, data.error);
  }
} catch (error) {
  // Handle network errors
}
```

---

## Backward Compatibility

### Legacy Support Guarantee
- `/api/generate` endpoint will remain unchanged
- All existing request formats supported indefinitely
- Response format maintained for compatibility
- New features added as optional parameters

### Migration Path
1. **Start**: Use legacy `/api/generate` endpoint
2. **Test**: Try enhanced endpoint with same parameters
3. **Enhance**: Add format_preference, scenario_theme
4. **Optimize**: Enable batch generation and variety
5. **Adapt**: Implement session tracking and adaptive mode

---

## API Versioning

Current version: **v1** (implied)

Future versions will be indicated in the URL:
- `/api/v2/generate/enhanced`

Version 1 (current) will be maintained indefinitely.

---

## Performance Characteristics

### Response Times (95th percentile)
- **Single question**: <50ms
- **Batch (10 questions)**: <200ms
- **Curriculum bulk (50 questions)**: <500ms

### Optimization Tips
1. Use batch generation instead of multiple requests
2. Enable caching for repeated model/difficulty combinations
3. Specify format_preference to skip selection logic
4. Use session_id for performance benefits in adaptive mode

---

## Support & Documentation

- **Architecture**: [System Architecture](SYSTEM_ARCHITECTURE.md)
- **Features**: [Enhanced Question System](../implementation/ENHANCED_QUESTION_SYSTEM.md)
- **Changelog**: [Recent Updates](../status/CHANGELOG.md)
- **User Guide**: [User Guide](../guides/USER_GUIDE.md)

---

*For detailed system architecture, see [System Architecture](SYSTEM_ARCHITECTURE.md)*