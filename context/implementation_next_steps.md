### 3. Recommended Next Steps for Implementation

This blueprint is your architectural guide. Here’s a step-by-step plan to turn it into a working application:

#### **Phase 1: Project Setup and Type Definition**

1.  **Create a New TypeScript Project:** Set up your project environment (`npm init`, `tsc --init`, etc.).
2.  **Define the Core Interfaces:** In a dedicated file (e.g., `types.ts`), define the TypeScript interfaces for your models. This is your "single source of truth" for data structures. Use the `difficulty_parameters` and `json_output_contract` sections from the blueprint as your guide.
    ```typescript
    // In types.ts
    export interface AdditionDifficultyParams {
      operand_count: number;
      max_value: number;
      // ...etc.
    }

    export interface AdditionOutput {
      operation: "ADDITION";
      operands: number[];
      result: number;
      // ...etc.
    }
    ```
3.  **Define a Generic Model Interface:** Create a generic interface that all your models will adhere to. This ensures consistency.
    ```typescript
    // In types.ts
    export interface IMathModel<TParams, TOutput> {
      model_id: string;
      generate(params: TParams): TOutput;
    }
    ```

#### **Phase 2: Build the Math Engine**

1.  **Implement Atomic Models First:** Create a separate file for each of the core atomic models (e.g., `addition.model.ts`, `subtraction.model.ts`). Implement each as a class that adheres to the `IMathModel` interface.
    ```typescript
    // In addition.model.ts
    import { IMathModel, AdditionDifficultyParams, AdditionOutput } from './types';

    export class AdditionModel implements IMathModel<AdditionDifficultyParams, AdditionOutput> {
      public readonly model_id = "ADDITION";

      public generate(params: AdditionDifficultyParams): AdditionOutput {
        // 1. Generate random operands based on difficulty params (max_value, etc.)
        // 2. Perform the addition calculation.
        // 3. Format the numbers into the JSON output contract.
        // 4. Return the structured output.
      }
    }
    ```
2.  **Focus on the `generate` Method:** The core logic lives here. This method will take the difficulty parameters, generate random numbers that fit those constraints, perform the calculation, and return the result in the specified JSON format.
3.  **Unit Test Each Model:** As you build each model, write unit tests for it. Test that it produces the correct output and handles edge cases (e.g., division by zero). This is critical for ensuring your Math Engine is reliable.

#### **Phase 3: Build the Difficulty and Story Engines**

1.  **Create a `DifficultyPreset` Module:** This module will contain the `progression_logic`. It can be a simple function or class that returns the correct `difficulty_parameters` for a given model and year group.
    ```typescript
    // In difficulty.ts
    export function getDifficultyParams(model_id: string, year: number): object {
      if (model_id === "ADDITION" && year <= 2) {
        return { operand_count: 2, max_value: 20, decimal_places: 0, ... };
      }
      // ... more rules
    }
    ```
2.  **Create a `StoryEngine` Module:** This module's job is to "render" the question. It will take the JSON output from a Math Engine model and a set of context variables.
3.  **Develop Context Libraries:** Create libraries of context variables. You can have separate files for different themes (e.g., `money_context.ts`, `length_context.ts`).
    ```typescript
    // In money_context.ts
    export const shoppingContext = {
      unit_type: "currency",
      unit_symbol: "£",
      item_descriptors: ["book", "pen", "comic", "magazine"],
      action_verb: "buys"
    };
    ```
4.  **Create Question Templates:** The Story Engine will use template literals or a templating library to combine the math output and the context variables into a final question string.
    ```typescript
    // In story.engine.ts
    function renderAdditionQuestion(mathOutput: AdditionOutput, context: any): string {
      return `If ${context.person} ${context.action_verb} a ${context.item_descriptors[0]} for ${mathOutput.decimal_formatted.operands[0]} and a ${context.item_descriptors[1]} for ${mathOutput.decimal_formatted.operands[1]}, how much is that?`;
    }
    ```

#### **Phase 4: Orchestration and Generation**

1.  **Create a Main Generator Service:** This service will be the top-level orchestrator. It will be responsible for the end-to-end process:
    *   Take a request (e.g., "Generate 100 Year 4 Money Addition questions").
    *   Call the `DifficultyPreset` module to get the correct parameters.
    *   Call the appropriate Math Engine model with those parameters to get the structured math output.
    *   Select a relevant context from your context library.
    *   Pass the math output and context to the Story Engine to render the final question.
    *   Save the question, its answer, and any metadata (like the `model_id` and year level) to your database.
2.  **Generate Your Question Lists:** Run this generator service in a script to pre-curate the large lists of questions you need for your application.

---

## **Next.js TypeScript Tailwind Project Setup**

### **Phase 5: Project Structure and Setup**

1.  **Initialize Next.js Project with TypeScript:**
    ```bash
    npx create-next-app@latest factory-architect --typescript --tailwind --eslint --app
    cd factory-architect
    ```

2.  **Project Structure:**
    ```
    factory-architect/
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── generate/
    │   │   │   │   └── route.ts          # API endpoint for question generation
    │   │   │   ├── test/
    │   │   │   │   └── route.ts          # API endpoint for testing models
    │   │   │   └── models/
    │   │   │       └── route.ts          # API endpoint for model info
    │   │   ├── test/
    │   │   │   └── page.tsx              # Web UI for testing
    │   │   ├── layout.tsx
    │   │   └── page.tsx                  # Main dashboard
    │   ├── components/
    │   │   ├── ui/                       # Reusable UI components
    │   │   ├── TestInterface.tsx         # Main testing interface
    │   │   ├── ModelSelector.tsx         # Model selection component
    │   │   ├── ParameterControls.tsx     # Difficulty parameter controls
    │   │   └── QuestionDisplay.tsx       # Generated question display
    │   ├── lib/
    │   │   ├── math-engine/
    │   │   │   ├── models/
    │   │   │   │   ├── addition.model.ts
    │   │   │   │   ├── subtraction.model.ts
    │   │   │   │   ├── multiplication.model.ts
    │   │   │   │   ├── division.model.ts
    │   │   │   │   └── linear-equation.model.ts
    │   │   │   ├── difficulty.ts         # Difficulty presets
    │   │   │   └── index.ts             # Math engine exports
    │   │   ├── story-engine/
    │   │   │   ├── contexts/
    │   │   │   │   ├── money.context.ts
    │   │   │   │   ├── length.context.ts
    │   │   │   │   └── weight.context.ts
    │   │   │   ├── templates/
    │   │   │   │   └── question.templates.ts
    │   │   │   └── story.engine.ts
    │   │   ├── types.ts                  # TypeScript interfaces
    │   │   └── utils.ts                  # Utility functions
    │   └── styles/
    │       └── globals.css
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── README.md
    ```

3.  **Additional Dependencies:**
    ```bash
    npm install @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-tabs
    npm install lucide-react class-variance-authority clsx tailwind-merge
    npm install @types/node
    ```

### **Phase 6: Web UI for Testing Model Question Generation**

#### **6.1 Testing Interface Components**

1.  **Main Test Page (`src/app/test/page.tsx`):**
    - Interactive dashboard for testing all math models
    - Real-time parameter adjustment
    - Instant question generation and preview
    - Export functionality for generated questions

2.  **Model Selector Component:**
    ```typescript
    interface ModelSelectorProps {
      selectedModel: string;
      onModelChange: (model: string) => void;
      availableModels: string[];
    }
    ```

3.  **Parameter Controls Component:**
    ```typescript
    interface ParameterControlsProps {
      modelId: string;
      parameters: Record<string, any>;
      onParameterChange: (key: string, value: any) => void;
    }
    ```

4.  **Question Display Component:**
    ```typescript
    interface QuestionDisplayProps {
      question: string;
      answer: string | number;
      mathOutput: any;
      context: any;
      metadata: {
        model_id: string;
        year_level: number;
        difficulty_params: Record<string, any>;
      };
    }
    ```

#### **6.2 API Routes for Testing**

1.  **Generate Question API (`/api/generate`):**
    ```typescript
    // POST /api/generate
    interface GenerateRequest {
      model_id: string;
      difficulty_params: Record<string, any>;
      context_type?: string;
      year_level?: number;
    }

    interface GenerateResponse {
      question: string;
      answer: string | number;
      math_output: any;
      context: any;
      metadata: any;
    }
    ```

2.  **Test Model API (`/api/test`):**
    ```typescript
    // POST /api/test
    interface TestRequest {
      model_id: string;
      test_count: number;
      difficulty_params: Record<string, any>;
    }

    interface TestResponse {
      results: Array<{
        question: string;
        answer: string | number;
        generation_time_ms: number;
      }>;
      statistics: {
        avg_generation_time: number;
        success_rate: number;
        unique_questions: number;
      };
    }
    ```

3.  **Model Info API (`/api/models`):**
    ```typescript
    // GET /api/models
    interface ModelInfo {
      model_id: string;
      description: string;
      difficulty_parameters: Array<{
        name: string;
        type: 'number' | 'boolean' | 'string';
        min?: number;
        max?: number;
        default: any;
        description: string;
      }>;
      supported_year_levels: number[];
      context_types: string[];
    }
    ```

#### **6.3 Testing Features**

1.  **Interactive Parameter Testing:**
    - Sliders for numerical parameters (max_value, operand_count, etc.)
    - Toggles for boolean parameters (allow_negatives, require_carrying, etc.)
    - Dropdowns for categorical parameters (context_type, year_level)
    - Real-time validation and parameter constraints

2.  **Batch Testing:**
    - Generate multiple questions with same parameters
    - Statistical analysis of generated content
    - Duplicate detection and uniqueness metrics
    - Performance benchmarking

3.  **Visual Question Preview:**
    - Formatted question display
    - Answer revelation toggle
    - Mathematical working steps (where applicable)
    - Context variable highlighting

4.  **Export and Save:**
    - Export generated questions as JSON/CSV
    - Save parameter presets for reuse
    - Share test configurations via URL parameters
    - Download question banks for offline use

#### **6.4 Advanced Testing Tools**

1.  **Difficulty Progression Tester:**
    - Visualize how questions change across year levels
    - Compare difficulty curves between models
    - Identify gaps in progression logic

2.  **Context Integration Tester:**
    - Test all context types with each model
    - Verify template rendering accuracy
    - Check for grammatical correctness

3.  **Performance Monitor:**
    - Track generation speed per model
    - Memory usage analysis
    - Concurrent generation testing

### **Phase 7: Development Workflow**

1.  **Development Server:**
    ```bash
    npm run dev
    ```
    Access testing interface at `http://localhost:3000/test`

2.  **Testing Workflow:**
    - Select a mathematical model from the dropdown
    - Adjust difficulty parameters using interactive controls
    - Generate single questions for immediate feedback
    - Run batch tests for comprehensive validation
    - Export successful configurations for production use

3.  **Model Development Cycle:**
    - Implement new model in `src/lib/math-engine/models/`
    - Add model to the registry in `src/lib/math-engine/index.ts`
    - Test via web interface with various parameter combinations
    - Refine based on generated output quality
    - Document parameter ranges and constraints

### **Phase 8: Production Deployment**

1.  **Build and Deploy:**
    ```bash
    npm run build
    npm start
    ```

2.  **Environment Configuration:**
    - Set up environment variables for API keys
    - Configure database connections (if needed)
    - Set up logging and monitoring

3.  **Testing in Production:**
    - Smoke tests for all models
    - Performance benchmarking
    - User acceptance testing with educators