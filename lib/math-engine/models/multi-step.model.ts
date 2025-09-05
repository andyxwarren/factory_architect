import {
  IMathModel,
  MultiStepDifficultyParams,
  MultiStepOutput,
  StepResult
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';
import { getModel } from '../index';

export class MultiStepModel implements IMathModel<MultiStepDifficultyParams, MultiStepOutput> {
  public readonly model_id = "MULTI_STEP";

  generate(params: MultiStepDifficultyParams): MultiStepOutput {
    const steps = this.executeSequence(params);
    const finalResult = steps.length > 0 ? steps[steps.length - 1].result : 0;
    const intermediateResults = steps.slice(0, -1).map(step => step.result);

    return {
      operation: "MULTI_STEP",
      steps,
      final_result: finalResult,
      intermediate_results: intermediateResults
    };
  }

  getDefaultParams(year: number): MultiStepDifficultyParams {
    if (year <= 2) {
      return {
        operation_sequence: [
          {
            model: "ADDITION",
            params: { operand_count: 2, max_value: 10, decimal_places: 0, allow_carrying: false, value_constraints: { min: 1, step: 1 } },
            use_previous_result: false
          },
          {
            model: "SUBTRACTION", 
            params: { minuend_max: 20, subtrahend_max: 10, decimal_places: 0, allow_borrowing: false, ensure_positive: true, value_constraints: { step: 1 } },
            use_previous_result: true
          }
        ],
        max_steps: 2,
        intermediate_visibility: true
      };
    } else if (year <= 4) {
      return {
        operation_sequence: [
          {
            model: "MULTIPLICATION",
            params: { multiplicand_max: 10, multiplier_max: 5, decimal_places: year === 4 ? 2 : 0, operand_count: 2, use_fractions: false },
            use_previous_result: false
          },
          {
            model: "ADDITION",
            params: { operand_count: 2, max_value: 50, decimal_places: year === 4 ? 2 : 0, allow_carrying: true, value_constraints: { min: 1, step: year === 4 ? 0.01 : 1 } },
            use_previous_result: true
          },
          {
            model: "SUBTRACTION",
            params: { minuend_max: 100, subtrahend_max: 50, decimal_places: year === 4 ? 2 : 0, allow_borrowing: true, ensure_positive: true, value_constraints: { step: year === 4 ? 0.01 : 1 } },
            use_previous_result: true
          }
        ],
        max_steps: 3,
        intermediate_visibility: true
      };
    } else {
      return {
        operation_sequence: [
          {
            model: "MULTIPLICATION",
            params: { multiplicand_max: 20, multiplier_max: 10, decimal_places: 2, operand_count: 2, use_fractions: false },
            use_previous_result: false
          },
          {
            model: "ADDITION",
            params: { operand_count: 2, max_value: 100, decimal_places: 2, allow_carrying: true, value_constraints: { min: 1, step: 0.01 } },
            use_previous_result: true
          },
          {
            model: "SUBTRACTION", 
            params: { minuend_max: 200, subtrahend_max: 100, decimal_places: 2, allow_borrowing: true, ensure_positive: true, value_constraints: { step: 0.01 } },
            use_previous_result: true
          },
          {
            model: "DIVISION",
            params: { dividend_max: 100, divisor_max: 10, decimal_places: 2, allow_remainder: false, ensure_whole: false },
            use_previous_result: true
          }
        ],
        max_steps: 4,
        intermediate_visibility: true
      };
    }
  }

  private executeSequence(params: MultiStepDifficultyParams): StepResult[] {
    const steps: StepResult[] = [];
    let previousResult: number | null = null;

    const sequence = params.operation_sequence.slice(0, params.max_steps);

    for (let i = 0; i < sequence.length; i++) {
      const operation = sequence[i];
      
      try {
        const model = this.getModelSafe(operation.model);
        if (!model) {
          console.warn(`Model ${operation.model} not found, skipping step ${i + 1}`);
          continue;
        }

        // Modify parameters if using previous result
        let adjustedParams = { ...operation.params };
        if (operation.use_previous_result && previousResult !== null) {
          adjustedParams = this.adjustParamsForPreviousResult(
            operation.model, 
            adjustedParams, 
            previousResult
          );
        }

        const result = model.generate(adjustedParams);
        const stepResult = this.extractStepResult(i + 1, operation.model, result, previousResult);
        
        steps.push(stepResult);
        previousResult = stepResult.result;

      } catch (error) {
        console.warn(`Error in step ${i + 1} (${operation.model}):`, error);
        // Continue with fallback result
        const fallbackResult = previousResult || 10;
        steps.push({
          step: i + 1,
          operation: operation.model,
          inputs: [fallbackResult],
          result: fallbackResult
        });
        previousResult = fallbackResult;
      }
    }

    return steps;
  }

  private getModelSafe(modelId: string): any {
    try {
      return getModel(modelId as any);
    } catch {
      return null;
    }
  }

  private adjustParamsForPreviousResult(
    modelId: string, 
    params: any, 
    previousResult: number
  ): any {
    const roundedResult = Math.round(previousResult * 100) / 100;
    
    switch (modelId) {
      case 'ADDITION':
        // Use previous result as one of the operands
        return {
          ...params,
          operand_count: 2,
          // Generate one additional operand
          fixed_operand: roundedResult
        };
      
      case 'SUBTRACTION':
        // Use previous result as minuend or create a subtraction from it
        return {
          ...params,
          minuend_max: Math.max(roundedResult + 20, params.minuend_max),
          fixed_minuend: roundedResult
        };
      
      case 'MULTIPLICATION':
        // Use previous result as multiplicand
        return {
          ...params,
          multiplier_max: Math.min(params.multiplier_max, 10), // Keep multiplier reasonable
          fixed_multiplicand: roundedResult
        };
      
      case 'DIVISION':
        // Use previous result as dividend
        return {
          ...params,
          fixed_dividend: roundedResult,
          divisor_max: Math.min(Math.max(Math.floor(roundedResult / 2), 2), 10)
        };
      
      default:
        return params;
    }
  }

  private extractStepResult(
    stepNumber: number, 
    operation: string, 
    modelResult: any,
    previousInput: number | null
  ): StepResult {
    let inputs: number[] = [];
    let result: number = 0;

    switch (operation) {
      case 'ADDITION':
        inputs = modelResult.operands || [];
        result = modelResult.result || 0;
        break;
      
      case 'SUBTRACTION':
        inputs = [modelResult.minuend || 0, modelResult.subtrahend || 0];
        result = modelResult.result || 0;
        break;
      
      case 'MULTIPLICATION':
        inputs = [modelResult.multiplicand || 0, modelResult.multiplier || 0];
        result = modelResult.result || 0;
        break;
      
      case 'DIVISION':
        inputs = [modelResult.dividend || 0, modelResult.divisor || 0];
        result = modelResult.quotient || 0;
        break;
      
      default:
        inputs = previousInput !== null ? [previousInput] : [];
        result = modelResult.result || modelResult.final_result || 0;
    }

    return {
      step: stepNumber,
      operation,
      inputs,
      result: Math.round(result * 100) / 100
    };
  }
}