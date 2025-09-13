import {
  IMathModel,
  AreaPerimeterDifficultyParams,
  AreaPerimeterOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class AreaPerimeterModel implements IMathModel<AreaPerimeterDifficultyParams, AreaPerimeterOutput> {
  public readonly model_id = "AREA_PERIMETER";

  private static readonly SHAPE_FORMULAS = {
    rectangle: {
      area: (length: number, width: number) => length * width,
      perimeter: (length: number, width: number) => 2 * (length + width)
    },
    square: {
      area: (side: number) => side * side,
      perimeter: (side: number) => 4 * side
    },
    triangle: {
      area: (base: number, height: number) => 0.5 * base * height,
      perimeter: (a: number, b: number, c: number) => a + b + c
    },
    circle: {
      area: (radius: number) => Math.PI * radius * radius,
      perimeter: (radius: number) => 2 * Math.PI * radius
    }
  };

  private static readonly MEASUREMENT_UNITS = {
    'mm': { name: 'millimetres', symbol: 'mm', scale: 0.1 },
    'cm': { name: 'centimetres', symbol: 'cm', scale: 1 },
    'm': { name: 'metres', symbol: 'm', scale: 100 },
    'units': { name: 'units', symbol: 'units', scale: 1 }
  };

  generate(params: AreaPerimeterDifficultyParams): AreaPerimeterOutput {
    const problemType = randomChoice(params.calculation_types);
    const shapeType = randomChoice(params.shape_types);
    
    switch (problemType) {
      case 'area':
        return this.generateAreaProblem(params, shapeType);
      case 'perimeter':
        return this.generatePerimeterProblem(params, shapeType);
      case 'both':
        return this.generateBothProblem(params, shapeType);
      case 'find_missing_dimension':
        return this.generateMissingDimensionProblem(params, shapeType);
      default:
        return this.generateAreaProblem(params, shapeType);
    }
  }

  getDefaultParams(year: number): AreaPerimeterDifficultyParams {
    if (year <= 3) {
      return {
        shape_types: ['rectangle', 'square'],
        measurement_units: ['cm', 'units'],
        max_dimensions: 10,
        include_decimal_measurements: false,
        calculation_types: ['area', 'perimeter'],
        allow_compound_shapes: false
      };
    } else if (year <= 4) {
      return {
        shape_types: ['rectangle', 'square', 'triangle'],
        measurement_units: ['cm', 'm', 'units'],
        max_dimensions: 15,
        include_decimal_measurements: false,
        calculation_types: ['area', 'perimeter', 'both'],
        allow_compound_shapes: true
      };
    } else if (year <= 5) {
      return {
        shape_types: ['rectangle', 'square', 'triangle'],
        measurement_units: ['mm', 'cm', 'm'],
        max_dimensions: 20,
        include_decimal_measurements: true,
        calculation_types: ['area', 'perimeter', 'both', 'find_missing_dimension'],
        allow_compound_shapes: true
      };
    } else {
      return {
        shape_types: ['rectangle', 'square', 'triangle', 'circle'],
        measurement_units: ['mm', 'cm', 'm'],
        max_dimensions: 25,
        include_decimal_measurements: true,
        calculation_types: ['area', 'perimeter', 'both', 'find_missing_dimension'],
        allow_compound_shapes: true
      };
    }
  }

  private generateAreaProblem(params: AreaPerimeterDifficultyParams, shapeType: string): AreaPerimeterOutput {
    const unit = randomChoice(params.measurement_units);
    const dimensions = this.generateDimensions(shapeType, params);
    const area = this.calculateArea(shapeType, dimensions);
    
    return {
      operation: "AREA_PERIMETER",
      problem_type: 'calculate_area',
      shape_type: shapeType,
      dimensions: dimensions,
      measurement_unit: unit,
      area_result: this.formatResult(area, params.include_decimal_measurements),
      perimeter_result: undefined,
      missing_dimension: undefined,
      formula_used: this.getAreaFormula(shapeType),
      visual_description: this.generateShapeDescription(shapeType, dimensions, unit),
      correct_answer: `${this.formatResult(area, params.include_decimal_measurements)} ${unit}²`
    };
  }

  private generatePerimeterProblem(params: AreaPerimeterDifficultyParams, shapeType: string): AreaPerimeterOutput {
    const unit = randomChoice(params.measurement_units);
    const dimensions = this.generateDimensions(shapeType, params);
    const perimeter = this.calculatePerimeter(shapeType, dimensions);
    
    return {
      operation: "AREA_PERIMETER",
      problem_type: 'calculate_perimeter',
      shape_type: shapeType,
      dimensions: dimensions,
      measurement_unit: unit,
      area_result: undefined,
      perimeter_result: this.formatResult(perimeter, params.include_decimal_measurements),
      missing_dimension: undefined,
      formula_used: this.getPerimeterFormula(shapeType),
      visual_description: this.generateShapeDescription(shapeType, dimensions, unit),
      correct_answer: `${this.formatResult(perimeter, params.include_decimal_measurements)} ${unit}`
    };
  }

  private generateBothProblem(params: AreaPerimeterDifficultyParams, shapeType: string): AreaPerimeterOutput {
    const unit = randomChoice(params.measurement_units);
    const dimensions = this.generateDimensions(shapeType, params);
    const area = this.calculateArea(shapeType, dimensions);
    const perimeter = this.calculatePerimeter(shapeType, dimensions);
    
    return {
      operation: "AREA_PERIMETER",
      problem_type: 'calculate_both',
      shape_type: shapeType,
      dimensions: dimensions,
      measurement_unit: unit,
      area_result: this.formatResult(area, params.include_decimal_measurements),
      perimeter_result: this.formatResult(perimeter, params.include_decimal_measurements),
      missing_dimension: undefined,
      formula_used: `${this.getAreaFormula(shapeType)} and ${this.getPerimeterFormula(shapeType)}`,
      visual_description: this.generateShapeDescription(shapeType, dimensions, unit),
      correct_answer: `Area: ${this.formatResult(area, params.include_decimal_measurements)} ${unit}², Perimeter: ${this.formatResult(perimeter, params.include_decimal_measurements)} ${unit}`
    };
  }

  private generateMissingDimensionProblem(params: AreaPerimeterDifficultyParams, shapeType: string): AreaPerimeterOutput {
    const unit = randomChoice(params.measurement_units);
    const calculationType = randomChoice(['area', 'perimeter']);
    
    // Generate complete dimensions first
    const fullDimensions = this.generateDimensions(shapeType, params);
    
    // Choose which dimension to make unknown
    let knownDimensions: any = {};
    let missingDimension: { name: string; value: number } = { name: '', value: 0 };
    let knownValue: number;
    
    if (shapeType === 'rectangle') {
      const makeLengthUnknown = Math.random() > 0.5;
      if (makeLengthUnknown) {
        knownDimensions.width = fullDimensions.width;
        missingDimension = { name: 'length', value: fullDimensions.length };
        knownValue = calculationType === 'area' 
          ? this.calculateArea(shapeType, fullDimensions)
          : this.calculatePerimeter(shapeType, fullDimensions);
      } else {
        knownDimensions.length = fullDimensions.length;
        missingDimension = { name: 'width', value: fullDimensions.width };
        knownValue = calculationType === 'area' 
          ? this.calculateArea(shapeType, fullDimensions)
          : this.calculatePerimeter(shapeType, fullDimensions);
      }
    } else if (shapeType === 'square') {
      knownValue = calculationType === 'area' 
        ? this.calculateArea(shapeType, fullDimensions)
        : this.calculatePerimeter(shapeType, fullDimensions);
      missingDimension = { name: 'side', value: fullDimensions.side };
    } else {
      // For other shapes, default to finding area/perimeter instead
      return this.generateAreaProblem(params, shapeType);
    }
    
    return {
      operation: "AREA_PERIMETER",
      problem_type: 'find_missing_dimension',
      shape_type: shapeType,
      dimensions: knownDimensions,
      measurement_unit: unit,
      area_result: calculationType === 'area' ? this.formatResult(knownValue, params.include_decimal_measurements) : undefined,
      perimeter_result: calculationType === 'perimeter' ? this.formatResult(knownValue, params.include_decimal_measurements) : undefined,
      missing_dimension: missingDimension,
      formula_used: calculationType === 'area' ? this.getAreaFormula(shapeType) : this.getPerimeterFormula(shapeType),
      visual_description: this.generateMissingDimensionDescription(shapeType, knownDimensions, calculationType, knownValue, unit),
      correct_answer: `${this.formatResult(missingDimension.value, params.include_decimal_measurements)} ${unit}`
    };
  }

  private generateDimensions(shapeType: string, params: AreaPerimeterDifficultyParams): any {
    const maxDim = params.max_dimensions;
    const useDecimals = params.include_decimal_measurements;
    
    switch (shapeType) {
      case 'rectangle':
        return {
          length: this.generateMeasurement(maxDim, useDecimals),
          width: this.generateMeasurement(maxDim, useDecimals)
        };
      case 'square':
        return {
          side: this.generateMeasurement(maxDim, useDecimals)
        };
      case 'triangle':
        const base = this.generateMeasurement(maxDim, useDecimals);
        const height = this.generateMeasurement(maxDim, useDecimals);
        // For perimeter, generate three sides that form a valid triangle
        const side1 = base;
        const side2 = this.generateMeasurement(maxDim, useDecimals);
        const side3 = this.generateValidThirdSide(side1, side2, maxDim, useDecimals);
        return {
          base: base,
          height: height,
          side1: side1,
          side2: side2,
          side3: side3
        };
      case 'circle':
        return {
          radius: this.generateMeasurement(Math.min(maxDim, 10), useDecimals)
        };
      default:
        return {
          length: this.generateMeasurement(maxDim, useDecimals),
          width: this.generateMeasurement(maxDim, useDecimals)
        };
    }
  }

  private generateMeasurement(maxValue: number, useDecimals: boolean): number {
    if (useDecimals && Math.random() > 0.6) {
      // Generate decimal value
      const integer = generateRandomNumber(Math.floor(maxValue), 0, 1);
      const decimal = Math.round(Math.random() * 9) / 10;
      return integer + decimal;
    } else {
      return generateRandomNumber(maxValue, 0, 1);
    }
  }

  private generateValidThirdSide(side1: number, side2: number, maxValue: number, useDecimals: boolean): number {
    // Triangle inequality: side3 < side1 + side2 and side3 > |side1 - side2|
    const minSide = Math.abs(side1 - side2) + 0.1;
    const maxSide = Math.min(side1 + side2 - 0.1, maxValue);
    
    if (minSide >= maxSide) {
      return Math.min(side1, side2);
    }
    
    if (useDecimals && Math.random() > 0.6) {
      const range = maxSide - minSide;
      return Math.round((minSide + Math.random() * range) * 10) / 10;
    } else {
      return Math.floor(minSide) + generateRandomNumber(Math.floor(maxSide - minSide), 0, 0);
    }
  }

  private calculateArea(shapeType: string, dimensions: any): number {
    switch (shapeType) {
      case 'rectangle':
        return AreaPerimeterModel.SHAPE_FORMULAS.rectangle.area(dimensions.length, dimensions.width);
      case 'square':
        return AreaPerimeterModel.SHAPE_FORMULAS.square.area(dimensions.side);
      case 'triangle':
        return AreaPerimeterModel.SHAPE_FORMULAS.triangle.area(dimensions.base, dimensions.height);
      case 'circle':
        return AreaPerimeterModel.SHAPE_FORMULAS.circle.area(dimensions.radius);
      default:
        return 0;
    }
  }

  private calculatePerimeter(shapeType: string, dimensions: any): number {
    switch (shapeType) {
      case 'rectangle':
        return AreaPerimeterModel.SHAPE_FORMULAS.rectangle.perimeter(dimensions.length, dimensions.width);
      case 'square':
        return AreaPerimeterModel.SHAPE_FORMULAS.square.perimeter(dimensions.side);
      case 'triangle':
        return AreaPerimeterModel.SHAPE_FORMULAS.triangle.perimeter(dimensions.side1, dimensions.side2, dimensions.side3);
      case 'circle':
        return AreaPerimeterModel.SHAPE_FORMULAS.circle.perimeter(dimensions.radius);
      default:
        return 0;
    }
  }

  private getAreaFormula(shapeType: string): string {
    switch (shapeType) {
      case 'rectangle':
        return 'Area = length × width';
      case 'square':
        return 'Area = side × side';
      case 'triangle':
        return 'Area = ½ × base × height';
      case 'circle':
        return 'Area = π × radius²';
      default:
        return 'Area formula';
    }
  }

  private getPerimeterFormula(shapeType: string): string {
    switch (shapeType) {
      case 'rectangle':
        return 'Perimeter = 2 × (length + width)';
      case 'square':
        return 'Perimeter = 4 × side';
      case 'triangle':
        return 'Perimeter = side1 + side2 + side3';
      case 'circle':
        return 'Circumference = 2 × π × radius';
      default:
        return 'Perimeter formula';
    }
  }

  private generateShapeDescription(shapeType: string, dimensions: any, unit: string): string {
    switch (shapeType) {
      case 'rectangle':
        return `Rectangle with length ${dimensions.length}${unit} and width ${dimensions.width}${unit}`;
      case 'square':
        return `Square with sides of ${dimensions.side}${unit}`;
      case 'triangle':
        return `Triangle with base ${dimensions.base}${unit} and height ${dimensions.height}${unit}`;
      case 'circle':
        return `Circle with radius ${dimensions.radius}${unit}`;
      default:
        return `${shapeType} shape`;
    }
  }

  private generateMissingDimensionDescription(
    shapeType: string, 
    knownDimensions: any, 
    calculationType: string, 
    knownValue: number, 
    unit: string
  ): string {
    const valueType = calculationType === 'area' ? 'area' : 'perimeter';
    const valueUnit = calculationType === 'area' ? `${unit}²` : unit;
    
    if (shapeType === 'rectangle') {
      const knownDim = Object.keys(knownDimensions)[0];
      const knownVal = knownDimensions[knownDim];
      return `Rectangle with ${knownDim} ${knownVal}${unit} and ${valueType} ${knownValue}${valueUnit}`;
    } else if (shapeType === 'square') {
      return `Square with ${valueType} ${knownValue}${valueUnit}`;
    }
    
    return `${shapeType} with ${valueType} ${knownValue}${valueUnit}`;
  }

  private formatResult(value: number, allowDecimals: boolean): number {
    if (allowDecimals) {
      return Math.round(value * 100) / 100;
    } else {
      return Math.round(value);
    }
  }
}