import {
  IMathModel,
  ShapePropertiesDifficultyParams,
  ShapePropertiesOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class ShapePropertiesModel implements IMathModel<ShapePropertiesDifficultyParams, ShapePropertiesOutput> {
  public readonly model_id = "SHAPE_PROPERTIES";

  private static readonly SHAPE_PROPERTIES = {
    // 2D Shapes
    triangle: {
      sides: 3,
      vertices: 3,
      angles: 3,
      right_angles: 0, // for general triangle
      parallel_sides: 0,
      lines_of_symmetry: 3, // for equilateral
      rotational_symmetry: 3,
      interior_angle_sum: 180
    },
    square: {
      sides: 4,
      vertices: 4,
      angles: 4,
      right_angles: 4,
      parallel_sides: 2, // 2 pairs
      lines_of_symmetry: 4,
      rotational_symmetry: 4,
      interior_angle_sum: 360
    },
    rectangle: {
      sides: 4,
      vertices: 4,
      angles: 4,
      right_angles: 4,
      parallel_sides: 2, // 2 pairs
      lines_of_symmetry: 2,
      rotational_symmetry: 2,
      interior_angle_sum: 360
    },
    pentagon: {
      sides: 5,
      vertices: 5,
      angles: 5,
      right_angles: 0,
      parallel_sides: 0,
      lines_of_symmetry: 5, // for regular pentagon
      rotational_symmetry: 5,
      interior_angle_sum: 540
    },
    hexagon: {
      sides: 6,
      vertices: 6,
      angles: 6,
      right_angles: 0,
      parallel_sides: 3, // 3 pairs
      lines_of_symmetry: 6, // for regular hexagon
      rotational_symmetry: 6,
      interior_angle_sum: 720
    },
    circle: {
      sides: 0,
      vertices: 0,
      angles: 0,
      right_angles: 0,
      parallel_sides: 0,
      lines_of_symmetry: 'infinite',
      rotational_symmetry: 'infinite',
      interior_angle_sum: 0
    },
    rhombus: {
      sides: 4,
      vertices: 4,
      angles: 4,
      right_angles: 0,
      parallel_sides: 2, // 2 pairs
      lines_of_symmetry: 2,
      rotational_symmetry: 2,
      interior_angle_sum: 360
    },
    parallelogram: {
      sides: 4,
      vertices: 4,
      angles: 4,
      right_angles: 0,
      parallel_sides: 2, // 2 pairs
      lines_of_symmetry: 0,
      rotational_symmetry: 2,
      interior_angle_sum: 360
    }
  } as const;

  private static readonly PROPERTY_DESCRIPTIONS = {
    sides: 'straight edges',
    vertices: 'corners or points where sides meet',
    angles: 'corners formed where two sides meet',
    right_angles: 'square corners (90 degrees)',
    parallel_sides: 'pairs of sides that never meet',
    lines_of_symmetry: 'lines where the shape can be folded exactly in half',
    rotational_symmetry: 'number of times the shape looks the same when rotated 360°'
  };

  generate(params: ShapePropertiesDifficultyParams): ShapePropertiesOutput {
    const problemType = this.selectProblemType(params);
    const shapeName = randomChoice(params.shape_types);
    const propertyFocus = randomChoice(params.property_types);
    
    switch (problemType) {
      case 'count_properties':
        return this.generateCountPropertiesProblem(shapeName, propertyFocus, params);
      case 'identify_property':
        return this.generateIdentifyPropertyProblem(shapeName, propertyFocus, params);
      case 'compare_properties':
        return this.generateComparePropertiesProblem(params.shape_types, propertyFocus, params);
      case 'classify_shapes':
        return this.generateClassifyShapesProblem(params);
      default:
        return this.generateCountPropertiesProblem(shapeName, propertyFocus, params);
    }
  }

  getDefaultParams(year: number): ShapePropertiesDifficultyParams {
    if (year <= 2) {
      return {
        shape_types: ['triangle', 'square', 'rectangle', 'circle'],
        property_types: ['sides', 'vertices'],
        max_sides: 6,
        include_angle_types: false,
        include_symmetry: false,
        problem_complexity: 'simple'
      };
    } else if (year <= 4) {
      return {
        shape_types: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'],
        property_types: ['sides', 'vertices', 'angles', 'right_angles'],
        max_sides: 8,
        include_angle_types: true,
        include_symmetry: false,
        problem_complexity: 'medium'
      };
    } else {
      return {
        shape_types: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'rhombus', 'parallelogram'],
        property_types: ['sides', 'vertices', 'angles', 'right_angles', 'parallel_sides', 'lines_of_symmetry'],
        max_sides: 10,
        include_angle_types: true,
        include_symmetry: true,
        problem_complexity: 'complex'
      };
    }
  }

  private selectProblemType(params: ShapePropertiesDifficultyParams): string {
    const problemTypes = ['count_properties', 'identify_property'];
    
    if (params.problem_complexity === 'medium') {
      problemTypes.push('compare_properties');
    }
    
    if (params.problem_complexity === 'complex') {
      problemTypes.push('compare_properties', 'classify_shapes');
    }
    
    return randomChoice(problemTypes);
  }

  private generateCountPropertiesProblem(
    shapeName: string, 
    propertyFocus: string, 
    params: ShapePropertiesDifficultyParams
  ): ShapePropertiesOutput {
    const shapeData = ShapePropertiesModel.SHAPE_PROPERTIES[shapeName as keyof typeof ShapePropertiesModel.SHAPE_PROPERTIES];
    const propertyValue = shapeData[propertyFocus as keyof typeof shapeData];
    
    // Handle special cases
    let correctAnswer: string | number = propertyValue;
    if (propertyValue === 'infinite') {
      correctAnswer = 'infinite';
    } else if (typeof propertyValue === 'number') {
      correctAnswer = propertyValue;
    }

    return {
      operation: "SHAPE_PROPERTIES",
      problem_type: 'count_properties',
      shape_name: shapeName,
      properties: {
        sides: shapeData.sides,
        vertices: shapeData.vertices,
        angles: shapeData.angles,
        right_angles: shapeData.right_angles,
        parallel_sides: shapeData.parallel_sides,
        lines_of_symmetry: shapeData.lines_of_symmetry,
        rotational_symmetry: shapeData.rotational_symmetry
      },
      question_focus: propertyFocus,
      correct_answer: correctAnswer,
      explanation: `A ${shapeName} has ${correctAnswer} ${ShapePropertiesModel.PROPERTY_DESCRIPTIONS[propertyFocus as keyof typeof ShapePropertiesModel.PROPERTY_DESCRIPTIONS] || propertyFocus}.`
    };
  }

  private generateIdentifyPropertyProblem(
    shapeName: string, 
    propertyFocus: string, 
    params: ShapePropertiesDifficultyParams
  ): ShapePropertiesOutput {
    const shapeData = ShapePropertiesModel.SHAPE_PROPERTIES[shapeName as keyof typeof ShapePropertiesModel.SHAPE_PROPERTIES];
    
    // Create a property-based question
    let correctAnswer: string;
    let explanation: string;
    
    switch (propertyFocus) {
      case 'right_angles':
        correctAnswer = shapeData.right_angles > 0 ? 'yes' : 'no';
        explanation = `A ${shapeName} ${shapeData.right_angles > 0 ? 'has' : 'does not have'} right angles.`;
        break;
      case 'parallel_sides':
        correctAnswer = shapeData.parallel_sides > 0 ? 'yes' : 'no';
        explanation = `A ${shapeName} ${shapeData.parallel_sides > 0 ? 'has' : 'does not have'} parallel sides.`;
        break;
      default:
        correctAnswer = String(shapeData[propertyFocus as keyof typeof shapeData]);
        explanation = `A ${shapeName} has ${correctAnswer} ${propertyFocus}.`;
    }

    return {
      operation: "SHAPE_PROPERTIES",
      problem_type: 'identify_property',
      shape_name: shapeName,
      properties: {
        sides: shapeData.sides,
        vertices: shapeData.vertices,
        angles: shapeData.angles,
        right_angles: shapeData.right_angles,
        parallel_sides: shapeData.parallel_sides,
        lines_of_symmetry: shapeData.lines_of_symmetry,
        rotational_symmetry: shapeData.rotational_symmetry
      },
      question_focus: propertyFocus,
      correct_answer: correctAnswer,
      explanation
    };
  }

  private generateComparePropertiesProblem(
    shapeTypes: string[], 
    propertyFocus: string, 
    params: ShapePropertiesDifficultyParams
  ): ShapePropertiesOutput {
    const shape1 = randomChoice(shapeTypes);
    const availableShapes = shapeTypes.filter(s => s !== shape1);
    const shape2 = randomChoice(availableShapes);
    
    const shape1Data = ShapePropertiesModel.SHAPE_PROPERTIES[shape1 as keyof typeof ShapePropertiesModel.SHAPE_PROPERTIES];
    const shape2Data = ShapePropertiesModel.SHAPE_PROPERTIES[shape2 as keyof typeof ShapePropertiesModel.SHAPE_PROPERTIES];
    
    const value1 = shape1Data[propertyFocus as keyof typeof shape1Data];
    const value2 = shape2Data[propertyFocus as keyof typeof shape2Data];
    
    let correctAnswer: string;
    let explanation: string;
    
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      if (value1 > value2) {
        correctAnswer = shape1;
        explanation = `A ${shape1} has ${value1} ${propertyFocus}, while a ${shape2} has ${value2} ${propertyFocus}.`;
      } else if (value2 > value1) {
        correctAnswer = shape2;
        explanation = `A ${shape2} has ${value2} ${propertyFocus}, while a ${shape1} has ${value1} ${propertyFocus}.`;
      } else {
        correctAnswer = 'equal';
        explanation = `Both shapes have ${value1} ${propertyFocus}.`;
      }
    } else {
      correctAnswer = 'cannot compare';
      explanation = `These shapes have different types of ${propertyFocus}.`;
    }

    return {
      operation: "SHAPE_PROPERTIES",
      problem_type: 'compare_properties',
      shape_name: `${shape1} vs ${shape2}`,
      properties: {
        sides: 0,
        vertices: 0,
        angles: 0,
        right_angles: 0,
        parallel_sides: 0
      },
      question_focus: propertyFocus,
      correct_answer: correctAnswer,
      explanation
    };
  }

  private generateClassifyShapesProblem(params: ShapePropertiesDifficultyParams): ShapePropertiesOutput {
    const propertyFocus = randomChoice(params.property_types);
    
    // Find shapes that share a common property
    const shapesWithProperty: string[] = [];
    const shapesWithoutProperty: string[] = [];
    
    for (const shapeName of params.shape_types) {
      const shapeData = ShapePropertiesModel.SHAPE_PROPERTIES[shapeName as keyof typeof ShapePropertiesModel.SHAPE_PROPERTIES];
      const propertyValue = shapeData[propertyFocus as keyof typeof shapeData];
      
      if (propertyFocus === 'right_angles' && typeof propertyValue === 'number' && propertyValue > 0) {
        shapesWithProperty.push(shapeName);
      } else if (propertyFocus === 'parallel_sides' && typeof propertyValue === 'number' && propertyValue > 0) {
        shapesWithProperty.push(shapeName);
      } else if (propertyFocus === 'sides' && typeof propertyValue === 'number' && propertyValue === 4) {
        shapesWithProperty.push(shapeName);
      } else {
        shapesWithoutProperty.push(shapeName);
      }
    }
    
    const correctAnswer = shapesWithProperty.join(', ');
    
    return {
      operation: "SHAPE_PROPERTIES",
      problem_type: 'classify_shapes',
      shape_name: 'multiple shapes',
      properties: {
        sides: 0,
        vertices: 0,
        angles: 0,
        right_angles: 0,
        parallel_sides: 0
      },
      question_focus: propertyFocus,
      correct_answer: correctAnswer,
      explanation: `Shapes with the specified property: ${correctAnswer}`
    };
  }
}