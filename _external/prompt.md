
```markdown
Hello! I am providing you with a concatenated text document representing a codebase or a portion of it. Each file within this document is formatted as follows:

--- START FILE: path/to/relative/file.ext ---
```[language_hint]
// File content here
```
--- END FILE: path/to/relative/file.ext ---

**Your Task:**

i have attached a CSV file which contains questions generated at the http://localhost:3000/curriculum-manager page.
Can you review these questionsin the context ofmyapplication goal which is to createa varied and real world feeling set of mathematical questions to test children in key stages 1 and 2.

This is a breif overview of my application:
Enhanced Question Generation System - Implementation Summary

  Executive Overview

  We have successfully implemented a comprehensive enhancement to the Factory Architect mathematics question generation system. The system has evolved from generating basic,
  repetitive questions to producing diverse, pedagogically rich questions with multiple cognitive formats.

  Key Achievement: Increased question variety by 400% (from 2 to 8 distinct formats) while maintaining 100% backward compatibility.     

  ---
  Core Improvements Implemented

  1. Architecture Transformation

  - Previous: Direct math-to-question rendering with limited variety
  - New: Three-layer architecture with separation of concerns:
  Orchestration Layer → Controller Layer → Service Layer

  2. Question Format Controllers (8 Types)

  | Format              | Purpose                                                          | Implementation File                        
      |
  |---------------------|------------------------------------------------------------------|--------------------------------------------------|
  | DIRECT_CALCULATION  | Traditional arithmetic questions ("What is 45 + 67?")            | lib/controllers/direct-calculation.controller.ts |
  | COMPARISON          | Value comparison questions ("Which is better value?")            | lib/controllers/comparison.controller.ts         |
  | ESTIMATION          | Rounding and approximation ("Estimate the result to nearest 10") | lib/controllers/estimation.controller.ts         |
  | VALIDATION          | True/false verification ("Is this calculation correct?")         | lib/controllers/validation.controller.ts         |
  | MULTI_STEP          | Sequential problem solving ("First add X, then multiply by Y")   | lib/controllers/multi-step.controller.ts         |
  | MISSING_VALUE       | Algebraic thinking ("? + 45 = 82, find the missing number")      | lib/controllers/missing-value.controller.ts      |
  | ORDERING            | Sequence arrangement ("Order these from smallest to largest")    | lib/controllers/ordering.controller.ts           |
  | PATTERN_RECOGNITION | Pattern completion ("2, 4, 8, 16, ?")                            | lib/controllers/pattern.controller.ts            |

  3. Enhanced Service Components

  ScenarioService (lib/services/scenario.service.ts)
  - Generates rich contextual scenarios with 10+ themes
  - Includes UK-specific cultural elements (pounds, pence, British contexts)
  - Dynamic character and item generation
  - Age-appropriate scenario selection

  DistractorEngine (lib/services/distractor-engine.service.ts)
  - 8 pedagogically-sound distractor strategies:
    - Wrong Operation (used subtraction instead of addition)
    - Place Value Error (decimal point mistakes)
    - Partial Calculation (stopped mid-calculation)
    - Unit Confusion (percentage/decimal errors)
    - Off By Magnitude (factor of 10 errors)
    - Common Misconception (based on known student errors)
    - Close Value (nearly correct answers)
    - Reversed Comparison (selected opposite)

  4. Orchestration System (lib/orchestrator/question-orchestrator.ts)

  - Intelligent format selection based on:
    - Mathematical model compatibility
    - Difficulty level (year and sub-level)
    - Pedagogical focus preferences
    - Cultural context requirements
  - Fallback mechanisms for robust error handling
  - Metadata enrichment with cognitive load calculations

  5. Enhanced Difficulty System

  - Sub-level progression: X.Y format (e.g., "4.2" = Year 4, Developing level)
    - X.1 = Introductory
    - X.2 = Developing
    - X.3 = Standard
    - X.4 = Advanced
  - Cognitive load calculation: 0-100 scale based on complexity factors
  - Adaptive difficulty: Can adjust based on student performance

  6. API Architecture

  Backward Compatible (/api/generate)
  - Original endpoint unchanged
  - All existing integrations continue working
  - Enhanced features available transparently

  Enhanced Endpoint (/api/generate/enhanced)
  - Full control over format selection
  - Batch generation (1-20 questions)
  - Rich metadata and enhancement status
  - Comprehensive error handling

  ---
  Technical Implementation Details

  Type Safety

  - Comprehensive TypeScript interfaces (lib/types/question-formats.ts)
  - Strong typing for all parameters and outputs
  - Runtime validation with detailed error messages

  Error Handling

  - Try-catch blocks in all controllers
  - Graceful fallback to simpler formats
  - Never returns errors to API consumers
  - Detailed logging for debugging

  Performance Optimizations

  - Average generation time: <50ms per question
  - Efficient caching of scenarios
  - Lazy loading of misconception libraries
  - Optimized distractor generation

  Compatibility Matrix

  All 25+ mathematical models now support multiple formats:
  - ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION
  - PERCENTAGE, FRACTION, LINEAR_EQUATION
  - UK Money models (COIN_RECOGNITION, CHANGE_CALCULATION, etc.)
  - Geometry models (SHAPE_RECOGNITION, AREA_PERIMETER, etc.)

  ---
  Key Design Patterns Used

  1. Controller Pattern: Each question format has dedicated controller with consistent interface
  2. Strategy Pattern: Distractor generation strategies selected dynamically
  3. Factory Pattern: Question and scenario generation factories
  4. Adapter Pattern: Math engine adapter for seamless integration
  5. Fallback Pattern: Graceful degradation when advanced features fail

  ---
  Testing & Validation Results

  - API Response Time: <50ms average (target was <200ms)
  - Success Rate: 100% with fallback handling
  - Backward Compatibility: Zero breaking changes
  - Format Coverage: All 8 formats operational
  - Error Recovery: Robust fallback prevents failures

  ---
  Educational Enhancements

  1. Cognitive Diversity: Questions target different thinking skills (calculation, estimation, validation, pattern recognition)
  2. Real-World Context: Scenarios grounded in familiar situations (shopping, school, sports)
  3. Misconception Targeting: Distractors based on documented student errors
  4. Progressive Difficulty: Sub-levels allow fine-grained difficulty control
  5. UK Curriculum Alignment: Tags and content aligned with National Curriculum

  ---
  Files Modified/Created

  New Controllers (8 files)
  - lib/controllers/*.controller.ts

  New Services (2 files)
  - lib/services/scenario.service.ts
  - lib/services/distractor-engine.service.ts

  Orchestration (1 file)
  - lib/orchestrator/question-orchestrator.ts

  Type Definitions (1 file)
  - lib/types/question-formats.ts

  API Endpoints (1 file)
  - app/api/generate/enhanced/route.ts

  Legacy Adapter (1 file)
  - lib/adapters/legacy-adapter.ts

  ---
  Metadata Enhancement

  Each generated question now includes:
  - format: Cognitive question type used
  - cognitive_load: 0-100 difficulty metric
  - curriculum_alignment: UK curriculum tags
  - scenario_theme: Context theme applied
  - distractor_strategies: Methods used for wrong answers
  - enhancement_status: Level of enhancement achieved
  - generation_time_ms: Performance metric

  ---
  Summary for Review

  This implementation represents a significant evolution in educational question generation, moving from simple arithmetic rendering to sophisticated, multi-format questions with
   rich pedagogical features. The system maintains complete backward compatibility while offering dramatically enhanced variety and educational value.

  For External Review Focus:
  1. Evaluate the pedagogical soundness of the 8 question formats
  2. Assess the quality and realism of generated scenarios
  3. Review distractor strategies for educational effectiveness
  4. Check cognitive load calculations for accuracy
  5. Validate UK curriculum alignment
  6. Consider the variety and appropriateness of questions generated

  The system is production-ready with comprehensive error handling, performance optimization, and extensive testing completed.


**End of task**

**Output Format Instructions (Strict Adherence Required):**

When you provide your response with the modified code, it is **ABSOLUTELY CRITICAL** that you follow this specific Markdown format for **EVERY** file that is changed, created, or deleted. This output will be parsed by an automated script.

1.  **For AMENDED (Modified) or NEW (Newly Created) Files:**
    *   You **MUST** provide the **ENTIRE, COMPLETE** content of the file, even if only one line has changed. Do not provide diffs, snippets, or summaries of changes *within* the code block itself.
    *   Each file's content **MUST** be enclosed in the following structure:

        ```markdown
        <!-- FILE_START: path/to/your/file.ext -->
        ```[language_hint]
        // The ENTIRE new or modified content of this file goes here.
        // For example, if it's a JavaScript file:
        function example() {
          console.log("This is the full file content.");
        }
        export default example;
        ```
        <!-- FILE_END: path/to/your/file.ext -->
        ```
    *   Replace `path/to/your/file.ext` with the **exact relative file path** as it was in the input document (for amended files), or the intended path for a new file. This path **MUST** be relative to the root of the provided codebase context.
    *   Replace `[language_hint]` (e.g., `javascript`, `python`, `typescript`, `css`, `html`) with the appropriate language for the code block. If no language hint is appropriate (e.g., for a `.txt` or `.json` file), you can use `text` or omit the language hint (e.g., just ```).
    *   Please **always** use forward slashes in file paths like this `/`.

2.  **For Files to be DELETED:**
    *   Use the following specific comment format:
        ```markdown
        <!-- DELETE_FILE: path/to/obsolete/file.ext -->
        ```
    *   Replace `path/to/obsolete/file.ext` with the **exact relative file path** of the file to be deleted.
    *   Do **NOT** include any code block or `FILE_START`/`FILE_END` markers for deleted files.

**Important Rules for Your Output (Critical for Automation):**

*   **COMPLETE FILES ONLY (FOR AMEND/NEW):** I reiterate, for any file you list using `FILE_START` and `FILE_END`, you must provide the **full and complete source code** for that file, reflecting all your changes.
*   **PATH ACCURACY:** The relative file paths used in `FILE_START:`, `FILE_END:`, and `DELETE_FILE:` must be **identical** to the paths provided in the input document (for existing/deleted files) or the correct intended paths (for new files). Paths are case-sensitive on many systems.
*   **ONLY AFFECTED FILES:** Only include entries (using `FILE_START`/`FILE_END` or `DELETE_FILE`) for files that have actually been modified, created, or need to be deleted. **Do not include files that remain unchanged from the input.**
*   **EXPLANATIONS:** You are welcome to provide explanations, comments, or summaries of your changes *outside* of these structured blocks. For example, you can write text before the first `<!-- FILE_START... -->` or between a `<!-- FILE_END... -->` block and the next `<!-- FILE_START... -->` block. My script will ignore text outside these specific markers and their associated code blocks.
*   **NO EXTRA TEXT WITHIN MARKERS:** Do not add any explanatory text *inside* the `<!-- ... -->` comments themselves, other than the required file path.
*   **NO NESTING:** Do not nest these marker blocks.

**Example of Expected Output Structure:**

```markdown
Okay, I've made the requested changes. Here's the updated code:

Some general explanation about the overall changes can go here.

<!-- FILE_START: src/services/UserService.js -->
```javascript
// ENTIRE content of the AMENDED UserService.js
async function getUser(id) {
  // ... new async/await implementation ...
  return user;
}
// ... other functions ...
export { getUser };
```
<!-- FILE_END: src/services/UserService.js -->

I've refactored `UserService.js` to use async/await. I also created a new utility function.

<!-- FILE_START: src/utils/errorHandler.js -->
```javascript
// ENTIRE content of the NEW errorHandler.js
export function handleGlobalError(error) {
  console.error("Global Error:", error);
  // ... more logic ...
}
```
<!-- FILE_END: src/utils/errorHandler.js -->

And I've removed an old API file.

<!-- DELETE_FILE: src/legacy/api.js -->

Please review these changes.
```

**Confirmation:**
Do you understand these formatting instructions completely? It is vital for my automated workflow that you adhere to them precisely.

---
***CODEBASE FOLLOWS:***
```

**How this `prompt.md` will be used:**

1.  When you run `concatenateCode.js`, it will read this `prompt.md` file.
2.  It will then write the content of `prompt.md` to the *top* of the output file (e.g., `concatenated_code_with_prompt.md`).
3.  Following this prompt, the script will append the header (`# Codebase from...`) and then all your concatenated code files.
4.  You will then open the generated output file (e.g., `concatenated_code_with_prompt.md`), **find the `[<<< IMPORTANT: ... >>>]` placeholder**, and **replace it with your specific instructions for that particular LLM interaction.**
5.  Finally, you copy the *entire content* of that edited file and paste it into the LLM.