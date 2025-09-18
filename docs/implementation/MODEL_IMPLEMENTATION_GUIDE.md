# Factory Model Implementation Guide
## UK National Curriculum Mathematics Coverage Analysis

**Document Version:** 1.0  
**Last Updated:** September 5, 2025  
**Total Curriculum Requirements:** 174 distinct Strand+Substrand+Year combinations  

---

## Executive Summary

This guide provides a comprehensive analysis of mathematical model implementation progress against UK National Curriculum requirements. Factory Architect currently implements **18 mathematical models** covering a subset of the **174 total curriculum requirements** across 9 curriculum strands and 56 substrands.

### Current Implementation Status
- **✅ COMPLETE Models:** 11 (61% of implemented models)
- **🚧 WORK IN PROGRESS:** 6 (33% of implemented models)  
- **❌ BROKEN Models:** 2 (11% of implemented models)
- **📋 PLANNED Models:** 0

---

## Part 1: Mathematical Model View

### ✅ COMPLETE Models (11)

#### Core Arithmetic Operations
1. **ADDITION** ✅
   - **Status:** Complete | **Years:** 1-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/addition.model.ts`](lib/math-engine/models/addition.model.ts)
   - **Registry:** [`lib/models/model-status.ts:26-35`](lib/models/model-status.ts#L26-L35)
   - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations)
   - **Notes:** Fully functional with decimal support and carrying

2. **SUBTRACTION** ✅
   - **Status:** Complete | **Years:** 1-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/subtraction.model.ts`](lib/math-engine/models/subtraction.model.ts)
   - **Registry:** [`lib/models/model-status.ts:37-46`](lib/models/model-status.ts#L37-L46)
   - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations)
   - **Notes:** Fully functional with borrowing and decimal support

3. **MULTIPLICATION** ✅
   - **Status:** Complete | **Years:** 2-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/multiplication.model.ts`](lib/math-engine/models/multiplication.model.ts)
   - **Registry:** [`lib/models/model-status.ts:48-57`](lib/models/model-status.ts#L48-L57)
   - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations)
   - **Notes:** Supports times tables and complex multiplication

4. **DIVISION** ✅
   - **Status:** Complete | **Years:** 3-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/division.model.ts`](lib/math-engine/models/division.model.ts)
   - **Registry:** [`lib/models/model-status.ts:59-68`](lib/models/model-status.ts#L59-L68)
   - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations)
   - **Notes:** Handles remainders and decimal division

#### Advanced Mathematical Operations
5. **PERCENTAGE** ✅
   - **Status:** Complete | **Years:** 4-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/percentage.model.ts`](lib/math-engine/models/percentage.model.ts)
   - **Registry:** [`lib/models/model-status.ts:70-79`](lib/models/model-status.ts#L70-L79)
   - **Curriculum Coverage:** Fractions (including decimals and percentages)
   - **Notes:** Percentage of amounts, increases, decreases

6. **FRACTION** ✅
   - **Status:** Complete | **Years:** 3-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/fraction.model.ts`](lib/math-engine/models/fraction.model.ts)
   - **Registry:** [`lib/models/model-status.ts:82-91`](lib/models/model-status.ts#L82-L91)
   - **Curriculum Coverage:** Fractions (including decimals and percentages)
   - **Notes:** Common fractions with practical applications

7. **MULTI_STEP** ✅
   - **Status:** Complete | **Years:** 4-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/multi-step.model.ts`](lib/math-engine/models/multi-step.model.ts)
   - **Registry:** [`lib/models/model-status.ts:138-147`](lib/models/model-status.ts#L138-L147)
   - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations)
   - **Notes:** Chains multiple operations successfully

#### Practical Applications
8. **COUNTING** ✅
   - **Status:** Complete | **Years:** 1-4 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/counting.model.ts`](lib/math-engine/models/counting.model.ts)
   - **Registry:** [`lib/models/model-status.ts:93-102`](lib/models/model-status.ts#L93-L102)
   - **Curriculum Coverage:** Number and place value, Measurement
   - **Notes:** UK coin denominations with optimal combinations

9. **TIME_RATE** ✅
   - **Status:** Complete | **Years:** 3-6 | **Last Tested:** 2024-09-04
   - **File:** [`lib/math-engine/models/time-rate.model.ts`](lib/math-engine/models/time-rate.model.ts)
   - **Registry:** [`lib/models/model-status.ts:104-113`](lib/models/model-status.ts#L104-L113)
   - **Curriculum Coverage:** Measurement
   - **Notes:** Savings over time and rate calculations

10. **CONVERSION** ✅
    - **Status:** Complete | **Years:** 3-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/conversion.model.ts`](lib/math-engine/models/conversion.model.ts)
    - **Registry:** [`lib/models/model-status.ts:115-124`](lib/models/model-status.ts#L115-L124)
    - **Curriculum Coverage:** Measurement
    - **Notes:** Common UK unit conversions

11. **COMPARISON** ✅
    - **Status:** Complete | **Years:** 4-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/comparison.model.ts`](lib/math-engine/models/comparison.model.ts)
    - **Registry:** [`lib/models/model-status.ts:126-135`](lib/models/model-status.ts#L126-L135)
    - **Curriculum Coverage:** Addition, subtraction, multiplication and division (calculations), Measurement
    - **Notes:** Value comparison with reasoning

---

### 🚧 WORK IN PROGRESS Models (6)

#### Money-Based Models (All Need Testing)
12. **COIN_RECOGNITION** 🚧
    - **Status:** WIP | **Years:** 1-3 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/coin-recognition.model.ts`](lib/math-engine/models/coin-recognition.model.ts)
    - **Registry:** [`lib/models/model-status.ts:180-189`](lib/models/model-status.ts#L180-L189)
    - **Curriculum Coverage:** Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** HIGH - Foundation money skills

13. **CHANGE_CALCULATION** 🚧
    - **Status:** WIP | **Years:** 2-5 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/change-calculation.model.ts`](lib/math-engine/models/change-calculation.model.ts)
    - **Registry:** [`lib/models/model-status.ts:191-200`](lib/models/model-status.ts#L191-L200)
    - **Curriculum Coverage:** Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** HIGH - Essential money skills

14. **MONEY_COMBINATIONS** 🚧
    - **Status:** WIP | **Years:** 2-4 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/money-combinations.model.ts`](lib/math-engine/models/money-combinations.model.ts)
    - **Registry:** [`lib/models/model-status.ts:202-211`](lib/models/model-status.ts#L202-L211)
    - **Curriculum Coverage:** Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** MEDIUM - Different ways to make amounts

15. **MIXED_MONEY_UNITS** 🚧
    - **Status:** WIP | **Years:** 3-5 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/mixed-money-units.model.ts`](lib/math-engine/models/mixed-money-units.model.ts)
    - **Registry:** [`lib/models/model-status.ts:213-222`](lib/models/model-status.ts#L213-L222)
    - **Curriculum Coverage:** Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** HIGH - Pounds and pence together

16. **MONEY_FRACTIONS** 🚧
    - **Status:** WIP | **Years:** 4-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/money-fractions.model.ts`](lib/math-engine/models/money-fractions.model.ts)
    - **Registry:** [`lib/models/model-status.ts:224-233`](lib/models/model-status.ts#L224-L233)
    - **Curriculum Coverage:** Fractions (including decimals and percentages), Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** MEDIUM - Fractional money amounts

17. **MONEY_SCALING** 🚧
    - **Status:** WIP | **Years:** 5-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/money-scaling.model.ts`](lib/math-engine/models/money-scaling.model.ts)
    - **Registry:** [`lib/models/model-status.ts:235-244`](lib/models/model-status.ts#L235-L244)
    - **Curriculum Coverage:** Ratio and proportion, Measurement
    - **Issues:** API timeout issues - needs testing
    - **Priority:** LOW - Advanced proportional problems

---

### ❌ BROKEN Models (2)

18. **LINEAR_EQUATION** ❌
    - **Status:** BROKEN | **Years:** 5-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/linear-equation.model.ts`](lib/math-engine/models/linear-equation.model.ts)
    - **Registry:** [`lib/models/model-status.ts:149-162`](lib/models/model-status.ts#L149-L162)
    - **Curriculum Coverage:** Algebra
    - **Issues:** 
      - API requests timeout due to infinite loops
      - generateRandomNumber parameter order issues
      - Needs debugging of slope generation logic
    - **Priority:** HIGH - Year 6 algebra requirements

19. **UNIT_RATE** ❌
    - **Status:** BROKEN | **Years:** 5-6 | **Last Tested:** 2024-09-04
    - **File:** [`lib/math-engine/models/unit-rate.model.ts`](lib/math-engine/models/unit-rate.model.ts)
    - **Registry:** [`lib/models/model-status.ts:164-177`](lib/models/model-status.ts#L164-L177)
    - **Curriculum Coverage:** Ratio and proportion
    - **Issues:**
      - API requests timeout due to infinite loops
      - generateRandomNumber parameter order issues  
      - Target quantity generation problems
    - **Priority:** HIGH - Year 6 ratio and proportion

---

## Part 2: Curriculum View

**Data Sources:**
- **Curriculum Data:** [`context/national_curriculum_framework.json`](context/national_curriculum_framework.json)
- **Model Mapping:** [`lib/curriculum/curriculum-model-mapping.ts`](lib/curriculum/curriculum-model-mapping.ts)
- **Curriculum Parser:** [`lib/curriculum/curriculum-parser.ts`](lib/curriculum/curriculum-parser.ts)
- **Model Status Registry:** [`lib/models/model-status.ts`](lib/models/model-status.ts)

### Curriculum Coverage Analysis

| **Curriculum Strand** | **Substrands** | **Year-Requirements** | **Models Available** | **Coverage Status** |
|------------------------|----------------|----------------------|---------------------|-------------------|
| Number and place value | 6 | 30 | 3 models | 🟡 PARTIAL |
| Addition, subtraction, multiplication and division (calculations) | 9 | 44 | 5 models | 🟢 GOOD |
| Fractions, decimals and percentages | 12 | 39 | 3 models | 🟡 PARTIAL |
| Ratio and proportion | 4 | 4 | 2 models* | 🔴 BROKEN |
| Algebra | 5 | 5 | 1 model* | 🔴 BROKEN |
| Measurement | 9 | 31 | 9 models | 🟢 EXCELLENT |
| Geometry – properties of shapes | 5 | 19 | 0 models | 🔴 MISSING |
| Geometry - position and direction | 3 | 9 | 0 models | 🔴 MISSING |
| Statistics | 3 | 10 | 0 models | 🔴 MISSING |

*Models are implemented but currently broken

---

### 🔴 CRITICAL GAPS - Missing Curriculum Areas

#### Geometry – Properties of Shapes (0 models, 19 requirements)
**📋 NEEDED MODELS:**
- **SHAPE_RECOGNITION** - Years 1-3 (recognise and name common shapes)
  - *File to create:* `lib/math-engine/models/shape-recognition.model.ts`
- **SHAPE_PROPERTIES** - Years 2-6 (describe properties and classify shapes) 
  - *File to create:* `lib/math-engine/models/shape-properties.model.ts`
- **SHAPE_CONSTRUCTION** - Years 2-3, 5-6 (draw and make shapes, relate 2-D to 3-D)
  - *File to create:* `lib/math-engine/models/shape-construction.model.ts`
- **ANGLE_MEASUREMENT** - Years 3-6 (angles – measuring and properties)
  - *File to create:* `lib/math-engine/models/angle-measurement.model.ts`
- **CIRCLE_PROPERTIES** - Year 6 (circles)
  - *File to create:* `lib/math-engine/models/circle-properties.model.ts`

#### Geometry – Position and Direction (0 models, 9 requirements)
**📋 NEEDED MODELS:**
- **PATTERN_RECOGNITION** - Years 2-3 (patterns)
  - *File to create:* `lib/math-engine/models/pattern-recognition.model.ts`
- **POSITION_DIRECTION** - Years 1-2, 4-6 (describe position, direction and movement)
  - *File to create:* `lib/math-engine/models/position-direction.model.ts`
- **COORDINATE_SYSTEM** - Years 4, 6 (co-ordinates)
  - *File to create:* `lib/math-engine/models/coordinate-system.model.ts`

#### Statistics (0 models, 10 requirements)
**📋 NEEDED MODELS:**
- **DATA_INTERPRETATION** - Years 2-6 (interpret and represent data)
  - *File to create:* `lib/math-engine/models/data-interpretation.model.ts`
- **DATA_PROBLEMS** - Years 2-5 (solve problems involving data)
  - *File to create:* `lib/math-engine/models/data-problems.model.ts`
- **MEAN_AVERAGE** - Year 6 (mean average)
  - *File to create:* `lib/math-engine/models/mean-average.model.ts`

---

### 🟡 PARTIAL COVERAGE - Needs Expansion

#### Number and Place Value (Limited models for 30 requirements)
**📋 NEEDED MODELS:**
- **PLACE_VALUE** - Years 2-6 (place value; roman numerals)
  - *File to create:* `lib/math-engine/models/place-value.model.ts`
- **NUMBER_ESTIMATION** - Years 1-6 (identify, represent and estimate; rounding)
  - *File to create:* `lib/math-engine/models/number-estimation.model.ts`
- **NEGATIVE_NUMBERS** - Years 4-6 (negative numbers)
  - *File to create:* `lib/math-engine/models/negative-numbers.model.ts`
- **NUMBER_SEQUENCES** - Years 1-6 (number problems)
  - *File to create:* `lib/math-engine/models/number-sequences.model.ts`

#### Fractions, Decimals and Percentages (Limited models for 39 requirements)
**📋 NEEDED MODELS:**
- **FRACTION_OPERATIONS** - Years 1-6 (comprehensive fraction operations)
  - *File to create:* `lib/math-engine/models/fraction-operations.model.ts`
- **DECIMAL_OPERATIONS** - Years 4-6 (decimal-specific operations)
  - *File to create:* `lib/math-engine/models/decimal-operations.model.ts`
- **FRACTION_DECIMAL_CONVERSION** - Years 4-6 (conversions and equivalence)
  - *File to create:* `lib/math-engine/models/fraction-decimal-conversion.model.ts`

---

## Part 3: Implementation Priorities

### 🚨 IMMEDIATE PRIORITIES (Next Sprint)

1. **Fix Broken Models**
   - ❌ **LINEAR_EQUATION** - Debug infinite loops and parameter issues
     - *Debug file:* [`lib/math-engine/models/linear-equation.model.ts`](lib/math-engine/models/linear-equation.model.ts)
   - ❌ **UNIT_RATE** - Fix timeout and generation problems
     - *Debug file:* [`lib/math-engine/models/unit-rate.model.ts`](lib/math-engine/models/unit-rate.model.ts)

2. **Complete Money Models Testing**  
   - 🚧 **COIN_RECOGNITION** - Test and resolve API timeouts
     - *Test using:* [Web interface `/test`](app/test/page.tsx) with model selection
   - 🚧 **CHANGE_CALCULATION** - Test and resolve API timeouts
     - *Test using:* [Web interface `/test`](app/test/page.tsx) with model selection
   - 🚧 **MIXED_MONEY_UNITS** - Test and resolve API timeouts
     - *Test using:* [Web interface `/test`](app/test/page.tsx) with model selection

### 🎯 SHORT-TERM GOALS (Next 2-3 Sprints)

3. **Foundation Geometry Models**
   - 📋 **SHAPE_RECOGNITION** - Critical for Years 1-3
   - 📋 **SHAPE_PROPERTIES** - Essential for Years 2-6
   - 📋 **POSITION_DIRECTION** - Basic spatial awareness

4. **Advanced Number Operations**
   - 📋 **PLACE_VALUE** - Year 2-6 place value concepts
   - 📋 **NUMBER_ESTIMATION** - Rounding and estimation skills

### 🚀 MEDIUM-TERM GOALS (Next 3-6 Sprints)

5. **Complete Statistics Coverage**
   - 📋 **DATA_INTERPRETATION** - Years 2-6 data handling
   - 📋 **DATA_PROBLEMS** - Problem-solving with data

6. **Advanced Geometry**
   - 📋 **ANGLE_MEASUREMENT** - Years 3-6 angle concepts
   - 📋 **COORDINATE_SYSTEM** - Years 4, 6 coordinate geometry

### 🌟 LONG-TERM VISION (6+ Sprints)

7. **Complete Curriculum Coverage**
   - Achieve 100% coverage of all 174 curriculum requirements
   - Advanced geometry and measurement models
   - Comprehensive assessment and reporting tools

---

## Part 4: Model Development Guidelines

### Development Standards
1. **Model Structure:** Follow atomic model design principles
2. **Year Scaling:** Implement progressive difficulty 1-6
3. **Testing:** Comprehensive unit tests before marking complete
4. **Documentation:** Clear model documentation and examples
5. **API Stability:** Robust error handling and timeout prevention

### Quality Gates
- ✅ **COMPLETE:** Full functionality, tested, documented
- 🚧 **WIP:** Implemented but needs testing/refinement
- ❌ **BROKEN:** Implemented but has known issues
- 📋 **PLANNED:** Identified need, not yet implemented

### Testing Protocol
1. **Web interface testing** at [`/test`](app/test/page.tsx)
   - **NEW:** Batch question generation (1-20 questions)
   - **NEW:** Export functionality (JSON/CSV formats)
   - **NEW:** Batch statistics and performance metrics
   - Interactive parameter controls and real-time preview
2. **Parameter validation** across year levels
3. **Edge case handling**
4. **Performance benchmarking**
5. **Curriculum alignment verification** using [`lib/curriculum/curriculum-parser.ts`](lib/curriculum/curriculum-parser.ts)

### Key Development Files
- **Model Templates:** Use existing models as templates (e.g., [`lib/math-engine/models/addition.model.ts`](lib/math-engine/models/addition.model.ts))
- **Type Definitions:** [`lib/types.ts`](lib/types.ts)
- **API Routes:** [`app/api/generate/route.ts`](app/api/generate/route.ts)
- **Test Interface:** [`app/test/page.tsx`](app/test/page.tsx)
- **Model Registry:** [`lib/models/model-status.ts`](lib/models/model-status.ts) - *Update when adding new models*

---

## Conclusion

Factory Architect has a solid foundation with **11 complete models** covering core arithmetic and practical applications. The main priorities are:

1. **Fixing broken models** (2 models) - Critical for Year 6 algebra and ratios
2. **Completing money models** (6 WIP models) - Essential practical skills  
3. **Building geometry models** (8-10 new models needed) - Major curriculum gap
4. **Adding statistics models** (3 new models needed) - Data handling skills

**Target:** Achieve 90%+ curriculum coverage within 12 months through systematic model development and testing.

---

## Quick Reference Links

### Core Development Files
- **Project Instructions:** [`CLAUDE.md`](CLAUDE.md)
- **Implementation Guide:** [`FACTORY_MODEL_IMPLEMENTATION_GUIDE.md`](FACTORY_MODEL_IMPLEMENTATION_GUIDE.md) *(this file)*
- **Model Status Registry:** [`lib/models/model-status.ts`](lib/models/model-status.ts)
- **Curriculum Data:** [`context/national_curriculum_framework.json`](context/national_curriculum_framework.json)

### Testing & Development
- **Test Interface:** [`app/test/page.tsx`](app/test/page.tsx) - Access at `localhost:3000/test`
- **API Generation:** [`app/api/generate/route.ts`](app/api/generate/route.ts)
- **Type Definitions:** [`lib/types.ts`](lib/types.ts)

### Model Examples (Use as Templates)
- **Simple Model:** [`lib/math-engine/models/addition.model.ts`](lib/math-engine/models/addition.model.ts)
- **Complex Model:** [`lib/math-engine/models/multi-step.model.ts`](lib/math-engine/models/multi-step.model.ts)
- **Money Model:** [`lib/math-engine/models/coin-recognition.model.ts`](lib/math-engine/models/coin-recognition.model.ts)

*This document should be updated after each model completion or major testing cycle.*