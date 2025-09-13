import {
  IMathModel,
  LinearEquationDifficultyParams,
  LinearEquationOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class LinearEquationModel implements IMathModel<LinearEquationDifficultyParams, LinearEquationOutput> {
  public readonly model_id = "LINEAR_EQUATION";

  generate(params: LinearEquationDifficultyParams): LinearEquationOutput {
    const m = this.generateSlope(params);
    const c = this.generateIntercept(params);
    
    // Generate x values for evaluation
    const xValues = this.generateXValues(params);
    
    // Calculate corresponding y values
    const evaluations = xValues.map(x => ({
      x,
      y: this.evaluateEquation(m, c, x, params)
    }));

    // Generate coordinate pairs for the equation
    const coordinates = evaluations.map(evaluation => ({ x: evaluation.x, y: evaluation.y }));

    // Determine the problem type
    const problemType = this.selectProblemType(params);
    
    return {
      operation: "LINEAR_EQUATION",
      slope: m,
      intercept: c,
      equation: this.formatEquation(m, c),
      problem_type: problemType,
      x_values: xValues,
      evaluations,
      coordinates,
      target_x: problemType === 'solve_for_x' ? randomChoice(xValues) : undefined,
      target_y: problemType === 'solve_for_y' ? randomChoice(evaluations).y : undefined
    };
  }

  getDefaultParams(year: number): LinearEquationDifficultyParams {
    if (year <= 3) {
      // Simple linear patterns
      return {
        slope_range: { min: 1, max: 3 },
        intercept_range: { min: 0, max: 5 },
        x_range: { min: 0, max: 10 },
        decimal_places: 0,
        allow_negative_slope: false,
        allow_negative_intercept: false,
        problem_types: ['evaluate', 'complete_table'],
        x_value_count: 3
      };
    } else if (year <= 4) {
      return {
        slope_range: { min: 1, max: 5 },
        intercept_range: { min: -5, max: 10 },
        x_range: { min: 0, max: 15 },
        decimal_places: 1,
        allow_negative_slope: false,
        allow_negative_intercept: true,
        problem_types: ['evaluate', 'complete_table', 'solve_for_y'],
        x_value_count: 4
      };
    } else {
      return {
        slope_range: { min: -5, max: 5 },
        intercept_range: { min: -10, max: 10 },
        x_range: { min: -10, max: 20 },
        decimal_places: 2,
        allow_negative_slope: true,
        allow_negative_intercept: true,
        problem_types: ['evaluate', 'complete_table', 'solve_for_y', 'solve_for_x'],
        x_value_count: 5
      };
    }
  }

  private generateSlope(params: LinearEquationDifficultyParams): number {
    let slope: number;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Determine valid range for slopes
    let minSlope = params.slope_range.min;
    let maxSlope = params.slope_range.max;
    
    // Adjust range based on constraints
    if (!params.allow_negative_slope) {
      minSlope = Math.max(minSlope, 1); // Ensure positive and not zero
    }
    
    // Ensure we have a valid range
    if (minSlope >= maxSlope) {
      return minSlope;
    }
    
    do {
      slope = generateRandomNumber(
        maxSlope,
        params.decimal_places,
        minSlope
      );
      attempts++;
      
      // Safety valve to prevent infinite loops
      if (attempts > maxAttempts) {
        slope = minSlope === 0 ? 1 : minSlope; // Safe fallback, never zero
        break;
      }
    } while (
      slope === 0 || // Avoid horizontal lines
      (!params.allow_negative_slope && slope < 0)
    );

    return slope;
  }

  private generateIntercept(params: LinearEquationDifficultyParams): number {
    let minIntercept = params.intercept_range.min;
    let maxIntercept = params.intercept_range.max;
    
    // Adjust range if negative intercepts not allowed
    if (!params.allow_negative_intercept) {
      minIntercept = Math.max(minIntercept, 0);
    }
    
    // Ensure valid range
    if (minIntercept > maxIntercept) {
      return minIntercept;
    }
    
    return generateRandomNumber(
      maxIntercept,
      params.decimal_places,
      minIntercept
    );
  }

  private generateXValues(params: LinearEquationDifficultyParams): number[] {
    const xValues: number[] = [];
    const usedValues = new Set<number>();
    let attempts = 0;
    const maxAttempts = 1000;
    
    // Calculate available range
    const rangeSize = params.x_range.max - params.x_range.min + 1;
    const requestedCount = Math.min(params.x_value_count, rangeSize);

    while (xValues.length < requestedCount) {
      const x = generateRandomNumber(
        params.x_range.max,
        0, // X values are typically integers
        params.x_range.min
      );

      if (!usedValues.has(x)) {
        xValues.push(x);
        usedValues.add(x);
      }
      
      attempts++;
      // Safety valve - if we can't generate enough unique values, fill systematically
      if (attempts > maxAttempts) {
        for (let i = params.x_range.min; i <= params.x_range.max && xValues.length < requestedCount; i++) {
          if (!usedValues.has(i)) {
            xValues.push(i);
            usedValues.add(i);
          }
        }
        break;
      }
    }

    return xValues.sort((a, b) => a - b);
  }

  private evaluateEquation(
    m: number, 
    c: number, 
    x: number, 
    params: LinearEquationDifficultyParams
  ): number {
    const y = m * x + c;
    return Math.round(y * Math.pow(10, params.decimal_places)) / Math.pow(10, params.decimal_places);
  }

  private selectProblemType(params: LinearEquationDifficultyParams): string {
    return randomChoice(params.problem_types);
  }

  private formatEquation(m: number, c: number): string {
    // Handle special cases for slope
    let slopeStr = '';
    if (m === 1) {
      slopeStr = '';
    } else if (m === -1) {
      slopeStr = '-';
    } else {
      slopeStr = m.toString();
    }

    // Handle intercept
    let interceptStr = '';
    if (c > 0) {
      interceptStr = ` + ${c}`;
    } else if (c < 0) {
      interceptStr = ` - ${Math.abs(c)}`;
    }
    // If c = 0, no intercept term

    // Build equation
    if (slopeStr === '' && interceptStr === '') {
      return 'y = x';
    } else if (slopeStr === '' && interceptStr !== '') {
      return `y = x${interceptStr}`;
    } else if (slopeStr !== '' && interceptStr === '') {
      return `y = ${slopeStr}x`;
    } else {
      return `y = ${slopeStr}x${interceptStr}`;
    }
  }
}