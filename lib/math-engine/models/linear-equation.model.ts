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
    
    do {
      slope = generateRandomNumber(
        params.slope_range.max,
        params.decimal_places,
        params.slope_range.min
      );
      attempts++;
      
      // Safety valve to prevent infinite loops
      if (attempts > 100) {
        slope = params.slope_range.min + 1; // Safe fallback
        break;
      }
    } while (
      slope === 0 || // Avoid horizontal lines
      (!params.allow_negative_slope && slope < 0)
    );

    return slope;
  }

  private generateIntercept(params: LinearEquationDifficultyParams): number {
    let intercept = generateRandomNumber(
      params.intercept_range.max,
      params.decimal_places,
      params.intercept_range.min
    );

    if (!params.allow_negative_intercept && intercept < 0) {
      intercept = Math.abs(intercept);
    }

    return intercept;
  }

  private generateXValues(params: LinearEquationDifficultyParams): number[] {
    const xValues: number[] = [];
    const usedValues = new Set<number>();
    let attempts = 0;

    while (xValues.length < params.x_value_count) {
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
      // Safety valve - if we can't generate enough unique values, just fill with sequential values
      if (attempts > 1000) {
        while (xValues.length < params.x_value_count) {
          let nextX = params.x_range.min + xValues.length;
          if (nextX > params.x_range.max) {
            break;
          }
          if (!usedValues.has(nextX)) {
            xValues.push(nextX);
            usedValues.add(nextX);
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