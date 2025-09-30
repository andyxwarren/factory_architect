# Difficulty Graduation Analysis Prompt
## For Assessment and Enhancement of Mathematical Question Difficulty System

**Document Version:** 1.0  
**Created:** September 6, 2025  
**Purpose:** Comprehensive prompt for LLM analysis of Factory Architect's difficulty progression system  

---

## **Prompt for LLM Assessment and Enhancement of Mathematical Question Difficulty Graduation System**

### Context
I have a TypeScript-based mathematics question generation system (Factory Architect) that creates questions for UK primary school students (Years 1-6). The system currently uses year levels as difficulty proxies, but lacks fine-grained difficulty progression within each year level. Students experience abrupt difficulty jumps that can damage confidence and impede learning progress.

### Current System Analysis Required

Please analyze the following aspects of the existing difficulty system:

1. **Difficulty Jump Assessment**
   Review the parameter changes between consecutive year levels and identify problematic transitions. Current examples include:
   - ADDITION Year 2: max_value=20 → Year 3: max_value=100 (5x increase)
   - MULTIPLICATION Year 2: multiplier_max=5 → Year 3: multiplier_max=10 (2x increase)  
   - SUBTRACTION Year 2: max=20 → Year 3: max=100 plus borrowing enabled
   - DIVISION Year 3: ensure_whole=true → Year 4: allow_remainder=true
   
   For each model, calculate:
   - Cognitive load increase percentage
   - Parameter change severity (scale 1-10)
   - Student success probability impact

2. **Parameter Sensitivity Analysis**
   - Rank parameters by their impact on perceived difficulty
   - Identify which parameters enable micro-progressions
   - Document parameter interactions that create compound difficulty
   - Find hidden difficulty factors not currently parameterized

3. **Student Experience Gaps**
   - Map where students are most likely to experience failure
   - Identify transitions requiring the most intermediate steps
   - Analyze compound effects when multiple parameters change simultaneously
   - Consider different learning styles and their impact on difficulty perception

### Enhancement Proposal Required

Design a sub-difficulty system with the following specifications:

1. **Naming Convention and Structure**
   - Use decimal notation with 4 sub-levels per year: X.1, X.2, X.3, X.4
   - Level X.1 = Entry level for year X (slightly easier than current)
   - Level X.2 = Below standard for year X
   - Level X.3 = Standard/expected level for year X (current defaults)
   - Level X.4 = Advanced/extension level for year X
   - Level X.4 should smoothly bridge to (X+1).1
   
   Example progression:
   ```
   1.4 → 2.1 (smooth transition)
   2.4 → 3.1 (smooth transition)
   5.4 → 6.1 (smooth transition)
   ```

2. **Implementation Architecture**
   ```typescript
   interface SubDifficultyParams {
     yearLevel: number;      // 1-6
     subLevel: number;       // 1-4 (representing .1 to .4)
     adaptiveMode?: boolean; // For dynamic adjustment
     confidenceMode?: boolean; // Locks difficulty for confidence building
   }
   
   interface DifficultyProgression {
     currentLevel: string;   // e.g., "3.2"
     parameters: DifficultyParams;
     nextLevel: {
       recommended: string;  // Based on performance
       alternative: string;  // For struggling students
     };
     changeDescription: string; // Human-readable change summary
     cognitiveLoadDelta: number; // Estimated difficulty change (-100 to +100)
   }
   
   interface DifficultyInterpolation {
     model: string;
     fromLevel: string;
     toLevel: string;
     parameterChanges: Array<{
       parameter: string;
       fromValue: any;
       toValue: any;
       interpolationType: 'linear' | 'stepped' | 'exponential';
     }>;
   }
   ```

3. **Detailed Parameter Interpolation Strategy**
   
   For each of the 18 models, provide complete sub-level progressions. Example for ADDITION:
   
   ```
   Level 1.1: max_value=5,  operands=2, no carrying, single digit
   Level 1.2: max_value=8,  operands=2, no carrying, single digit
   Level 1.3: max_value=10, operands=2, no carrying, single digit (current Year 1)
   Level 1.4: max_value=15, operands=2, no carrying, teen numbers
   
   Level 2.1: max_value=15, operands=2, no carrying, familiar numbers
   Level 2.2: max_value=18, operands=2, no carrying, variety
   Level 2.3: max_value=20, operands=2, no carrying (current Year 2)
   Level 2.4: max_value=30, operands=2, minimal carrying introduced
   
   Level 3.1: max_value=40, operands=2-3, carrying occasional
   Level 3.2: max_value=60, operands=2-3, carrying common
   Level 3.3: max_value=100, operands=3, carrying expected (current Year 3)
   Level 3.4: max_value=150, operands=3, consistent carrying
   ```

4. **Confidence-Based Adjustment Rules**
   
   ```typescript
   interface AdjustmentRules {
     consecutiveCorrect: {
       3: '+0.1 level suggestion',
       5: '+0.2 level suggestion',
       7: '+0.3 level suggestion (max single jump)'
     };
     consecutiveIncorrect: {
       2: '-0.1 level suggestion',
       3: '-0.2 level suggestion',
       4: 'Lock current level + remedial flag'
     };
     mixedPerformance: {
       above70percent: 'Stay current level',
       below50percent: '-0.1 level suggestion'
     };
     confidenceMode: {
       enabled: 'No automatic progression',
       duration: '10-20 questions at same level',
       exitCriteria: '80% success rate'
     };
   }
   ```

5. **Model-Specific Considerations**
   
   Address unique progression needs for each model type:
   
   - **Money Models (6 models)**: Graduate coin denominations available
     - X.1: Only 1p, 2p, 5p, 10p
     - X.2: Add 20p, 50p
     - X.3: Add £1
     - X.4: Add £2, £5 notes
   
   - **Percentage Model**: Control percentage values offered
     - X.1: Only 50%, 100%
     - X.2: Add 25%, 75%
     - X.3: Add 10%, 20%, 30%, etc.
     - X.4: Add 5%, 15%, custom percentages
   
   - **Fraction Model**: Graduate denominator complexity
     - X.1: Halves only
     - X.2: Halves and quarters
     - X.3: Add thirds and sixths
     - X.4: Add fifths, eighths, tenths
   
   - **Multi-Step Model**: Control operation sequences
     - X.1: 2 steps, same operation
     - X.2: 2 steps, different operations
     - X.3: 3 steps, mixed operations
     - X.4: 3-4 steps, complex sequences

### Deliverables Requested

1. **Comprehensive Assessment Report**
   - Color-coded heat map of current difficulty jumps (Red=severe, Yellow=moderate, Green=smooth)
   - Prioritized list of models needing immediate sub-level implementation
   - Cognitive load analysis with numerical scores for each transition
   - Risk assessment for student confidence at each jump point

2. **Complete Implementation Specification**
   ```typescript
   // Complete TypeScript interfaces
   // Parameter interpolation functions for all 18 models
   // Migration strategy maintaining backward compatibility
   // Configuration system for school-specific adjustments
   ```

3. **Full Model Progression Tables**
   Create detailed tables for all 18 models showing:
   - Every parameter value at each sub-level (1.1 through 6.4)
   - Example questions generated at each level
   - Cognitive load score (0-100) for each level
   - Typical error patterns expected at each level
   - Suggested practice duration at each level

4. **UI/UX Specifications**
   - Teacher dashboard mockup showing sub-level selection
   - Student progress visualization (progress bar, badges, etc.)
   - Parent-friendly difficulty explanations
   - Accessibility considerations for difficulty indicators

5. **Validation and Testing Framework**
   ```typescript
   interface DifficultyValidation {
     smoothnessScore: number; // 0-100, how smooth are transitions
     coverageScore: number;   // 0-100, curriculum coverage maintained
     confidenceImpact: number; // Predicted impact on student confidence
     testingProtocol: {
       sampleSize: number;
       duration: string;
       metrics: string[];
     };
   }
   ```

6. **Adaptive Algorithm Specification**
   - Machine learning approach for personalized progression
   - Pattern recognition for learning difficulties
   - Automatic difficulty adjustment logic
   - Override controls for teachers

### Additional Requirements

1. **Curriculum Alignment**
   Ensure all sub-levels align with UK National Curriculum expectations while providing flexibility for different learning paces.

2. **Special Educational Needs Support**
   Consider students who may need even finer gradations (X.15, X.25, X.35, X.45) or alternative progression paths.

3. **Performance Metrics**
   Define success metrics including:
   - Student completion rates at each level
   - Time spent per question by level
   - Retry attempts before success
   - Confidence self-reporting integration

4. **Implementation Timeline**
   Provide a phased rollout plan:
   - Phase 1: Core arithmetic models (ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION)
   - Phase 2: Advanced computation (PERCENTAGE, FRACTION, MULTI_STEP)
   - Phase 3: Specialized models (all MONEY models, COMPARISON, etc.)
   - Phase 4: Complex models (LINEAR_EQUATION, UNIT_RATE)

### Output Format

Please provide your response in the following structure:

1. **Executive Summary** (500 words)
2. **Current System Analysis** (detailed findings with data)
3. **Proposed Sub-Level System** (complete specification)
4. **Implementation Guide** (step-by-step with code examples)
5. **Model Progression Tables** (all 18 models, all sub-levels)
6. **Risk Analysis and Mitigation** (potential issues and solutions)
7. **Success Metrics and Validation** (how to measure improvement)
8. **Appendices** (additional technical details, references)

Focus particularly on creating smooth, confidence-preserving progressions that support all learners while maintaining curriculum standards. The goal is to eliminate frustrating difficulty spikes while still challenging students appropriately at each level.

---

## Usage Instructions

### How to Use This Prompt

1. **Copy the entire prompt section** (from "Prompt for LLM Assessment..." through the end)
2. **Provide context about your codebase** by including:
   - Current difficulty implementation file (`lib/math-engine/difficulty.ts`)
   - Sample model implementations (e.g., `addition.model.ts`, `counting.model.ts`)
   - Types definition file (`lib/types.ts`)
3. **Paste into your chosen LLM** (GPT-4, Claude, etc.)
4. **Review the generated response** for completeness and technical accuracy
5. **Iterate if needed** by asking for clarification on specific points

### Expected Output

The LLM should provide:
- Detailed analysis of current difficulty jumps
- Complete sub-level system specification
- TypeScript implementation code
- Full progression tables for all 18 models
- Implementation roadmap and validation framework

### File References

This prompt was created based on analysis of:
- **Difficulty System**: [`lib/math-engine/difficulty.ts`](lib/math-engine/difficulty.ts)
- **Model Examples**: [`lib/math-engine/models/`](lib/math-engine/models/)
- **Type Definitions**: [`lib/types.ts`](lib/types.ts)
- **API Implementation**: [`app/api/generate/route.ts`](app/api/generate/route.ts)

### Related Documents

- **Implementation Guide**: [`FACTORY_MODEL_IMPLEMENTATION_GUIDE.md`](FACTORY_MODEL_IMPLEMENTATION_GUIDE.md)
- **Architecture Flow**: [`FACTORY_ARCHITECTURE_FLOW_CHART.md`](FACTORY_ARCHITECTURE_FLOW_CHART.md)
- **Student Interface Proposal**: [`STUDENT_INTERFACE_PROJECT_PROPOSAL.md`](STUDENT_INTERFACE_PROJECT_PROPOSAL.md)

---

*This prompt is designed to generate a comprehensive difficulty graduation system that preserves student confidence while maintaining educational rigor. The resulting analysis will provide a roadmap for implementing smooth difficulty progressions across all mathematical models.*