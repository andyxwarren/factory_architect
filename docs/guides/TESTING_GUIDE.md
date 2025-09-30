# Enhanced Question Generation System - Testing Guide

This guide provides comprehensive instructions for testing the new Enhanced Question Generation System alongside the existing legacy system.

## Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 2. Access Testing Interface
Navigate to [http://localhost:3000/test](http://localhost:3000/test) for the interactive testing interface.

## API Testing

### Legacy API Endpoint (Unchanged)
The original endpoint continues to work exactly as before:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "year_level": 4,
    "difficulty_params": {
      "operand_count": 3,
      "max_value": 100
    }
  }'
```

**Expected Response**: Traditional question format with math output and basic context.

### Enhanced API Endpoint (New)

#### Basic Enhanced Request
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "difficulty_level": "4.2"
  }'
```

#### Advanced Enhanced Request
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "UNIT_RATE",
    "difficulty_level": "5.3",
    "format_preference": "COMPARISON",
    "scenario_theme": "SHOPPING",
    "pedagogical_focus": "reasoning",
    "quantity": 3
  }'
```

#### Batch Generation Request
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "MULTIPLICATION",
    "difficulty_level": "3.4",
    "quantity": 10,
    "scenario_theme": "SCHOOL"
  }'
```

### API Documentation
Get comprehensive API documentation:
```bash
curl http://localhost:3000/api/generate/enhanced
```

## Testing Specific Features

### 1. Question Format Testing

#### Direct Calculation Format (Implemented)
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "format_preference": "DIRECT_CALCULATION",
    "difficulty_level": "3.2"
  }'
```

**Expected**: Traditional calculation question with enhanced distractors.

#### Comparison Format (Implemented)
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "UNIT_RATE",
    "format_preference": "COMPARISON",
    "difficulty_level": "4.3"
  }'
```

**Expected**: "Which is better value?" question with unit rate comparison.

### 2. Scenario Theme Testing

Test different themes to see contextual variety:

#### Shopping Theme
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "scenario_theme": "SHOPPING",
    "difficulty_level": "2.1"
  }'
```

#### School Theme
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "MULTIPLICATION",
    "scenario_theme": "SCHOOL",
    "difficulty_level": "4.2"
  }'
```

#### Pocket Money Theme
```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "SUBTRACTION",
    "scenario_theme": "POCKET_MONEY",
    "difficulty_level": "3.3"
  }'
```

### 3. Enhanced Difficulty Testing

Test the new X.Y difficulty format:

```bash
# Year 3, Level 1 (Introductory)
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{"model_id": "ADDITION", "difficulty_level": "3.1"}'

# Year 3, Level 4 (Advanced)
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{"model_id": "ADDITION", "difficulty_level": "3.4"}'
```

**Expected**: Notice increasing complexity in the same year level.

### 4. Distractor Quality Testing

Look for these distractor strategies in responses:

```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "SUBTRACTION",
    "difficulty_level": "4.2"
  }' | jq '.question.distractors'
```

**Expected Strategies**:
- `WRONG_OPERATION` - Added instead of subtracted
- `PLACE_VALUE_ERROR` - Carrying/borrowing mistakes
- `COMMON_MISCONCEPTION` - Library-based errors

### 5. Mathematical Model Compatibility

Test enhanced system with all model types:

#### Basic Arithmetic
```bash
# Addition
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "ADDITION", "difficulty_level": "2.3"}'

# Subtraction
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "SUBTRACTION", "difficulty_level": "3.2"}'

# Multiplication
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "MULTIPLICATION", "difficulty_level": "4.1"}'

# Division
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "DIVISION", "difficulty_level": "5.2"}'
```

#### Advanced Models
```bash
# Percentages
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "PERCENTAGE", "difficulty_level": "5.4"}'

# Unit Rates (with comparison)
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "UNIT_RATE", "format_preference": "COMPARISON", "difficulty_level": "6.2"}'
```

#### UK Money Models
```bash
# Coin Recognition
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "COIN_RECOGNITION", "difficulty_level": "2.1"}'

# Change Calculation
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "CHANGE_CALCULATION", "scenario_theme": "SHOPPING"}'
```

## Performance Testing

### 1. Single Question Generation Speed
```bash
time curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{"model_id": "ADDITION", "difficulty_level": "3.2"}' > /dev/null
```

**Target**: <200ms response time

### 2. Batch Generation Performance
```bash
time curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{"model_id": "MULTIPLICATION", "quantity": 20, "difficulty_level": "4.3"}' > /dev/null
```

**Target**: <4 seconds for 20 questions (200ms average)

### 3. Memory Usage Testing
Generate multiple questions in sequence to test memory efficiency:

```bash
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/generate/enhanced \
    -H "Content-Type: application/json" \
    -d '{"model_id": "ADDITION", "difficulty_level": "3.2"}' > /dev/null 2>&1
  echo "Generated question $i"
done
```

## Compatibility Testing

### 1. Legacy vs Enhanced Comparison
Generate the same mathematical problem using both systems:

```bash
# Legacy system
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model_id": "ADDITION", "year_level": 4}' > legacy_response.json

# Enhanced system (Direct Calculation format)
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{"model_id": "ADDITION", "difficulty_level": "4.3", "format_preference": "DIRECT_CALCULATION"}' > enhanced_response.json
```

Compare the mathematical accuracy while noting enhanced features.

### 2. Migration Testing
Test the legacy adapter's ability to maintain compatibility:

```bash
# Same parameters, different endpoints
curl -X POST http://localhost:3000/api/generate \
  -d '{"model_id": "UNIT_RATE", "year_level": 5}' | jq '.math_output.result'

curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "UNIT_RATE", "year_level": 5}' | jq '.question.mathOutput.result'
```

**Expected**: Same mathematical results with enhanced presentation.

## Error Testing

### 1. Invalid Requests
Test error handling:

```bash
# Invalid model
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "INVALID_MODEL"}'

# Invalid difficulty format
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "ADDITION", "difficulty_level": "invalid"}'

# Invalid quantity
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "ADDITION", "quantity": 25}'
```

**Expected**: Clear error messages with status codes.

### 2. Edge Cases
```bash
# Minimum difficulty
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "ADDITION", "difficulty_level": "1.1"}'

# Maximum difficulty
curl -X POST http://localhost:3000/api/generate/enhanced \
  -d '{"model_id": "DIVISION", "difficulty_level": "6.4"}'
```

## Web Interface Testing

### 1. Enhanced Testing Interface (Pending Implementation)
When the enhanced UI is implemented, test:

1. **Format Selection**: Switch between question formats and observe changes
2. **Scenario Preview**: Select different themes and see context updates
3. **Difficulty Adjustment**: Use X.Y sliders and observe complexity changes
4. **Batch Generation**: Generate multiple questions and analyze patterns
5. **Comparison Mode**: Side-by-side legacy vs enhanced questions

### 2. Current Testing Interface
The existing interface at `/test` can be used to:

1. Test all mathematical models
2. Adjust traditional difficulty parameters
3. Generate batch questions for statistical analysis
4. Export questions for further analysis

## Validation Checklist

### ✅ Basic Functionality
- [ ] Legacy API continues to work unchanged
- [ ] Enhanced API returns valid responses
- [ ] All 25+ mathematical models work with enhanced system
- [ ] Error handling provides clear messages

### ✅ Enhanced Features
- [ ] Direct Calculation format generates enhanced distractors
- [ ] Comparison format creates "better value" questions
- [ ] Scenario themes create varied contexts
- [ ] Enhanced difficulty (X.Y) provides granular control
- [ ] Batch generation works efficiently

### ✅ Quality Assurance
- [ ] Mathematical accuracy maintained
- [ ] Distractors are pedagogically sound
- [ ] Scenarios are age-appropriate and culturally relevant
- [ ] Difficulty progression is smooth and logical

### ✅ Performance
- [ ] Single question generation <200ms
- [ ] Batch generation scales linearly
- [ ] Memory usage remains stable
- [ ] No performance regression in legacy system

### ✅ Compatibility
- [ ] 100% backward compatibility verified
- [ ] Response formats maintain existing contracts
- [ ] Migration path is smooth and non-disruptive

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run typecheck` to verify types
2. **API Not Responding**: Check server is running on port 3000
3. **Invalid JSON**: Validate request format with JSON linter
4. **Missing Features**: Check `IMPLEMENTATION_STATUS.md` for current completion status

### Debug Mode
Add `debug: true` to requests for additional information:

```bash
curl -X POST http://localhost:3000/api/generate/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ADDITION",
    "difficulty_level": "3.2",
    "debug": true
  }'
```

This testing guide ensures comprehensive validation of the Enhanced Question Generation System while maintaining confidence in the existing legacy functionality.