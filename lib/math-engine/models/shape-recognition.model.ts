import {
  IMathModel,
  ShapeRecognitionDifficultyParams,
  ShapeRecognitionOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class ShapeRecognitionModel implements IMathModel<ShapeRecognitionDifficultyParams, ShapeRecognitionOutput> {
  public readonly model_id = "SHAPE_RECOGNITION";

  private static readonly SHAPE_DATA = {
    // 2D Shapes
    circle: {
      type: '2d',
      sides: 0,
      vertices: 0,
      properties: ['curved', 'no_sides', 'no_vertices', 'symmetric'],
      category: 'circle'
    },
    triangle: {
      type: '2d',
      sides: 3,
      vertices: 3,
      properties: ['straight_sides', 'three_sides', 'three_vertices'],
      category: 'polygon'
    },
    square: {
      type: '2d',
      sides: 4,
      vertices: 4,
      properties: ['straight_sides', 'equal_sides', 'four_sides', 'right_angles'],
      category: 'quadrilateral'
    },
    rectangle: {
      type: '2d',
      sides: 4,
      vertices: 4,
      properties: ['straight_sides', 'parallel_sides', 'four_sides', 'right_angles'],
      category: 'quadrilateral'
    },
    pentagon: {
      type: '2d',
      sides: 5,
      vertices: 5,
      properties: ['straight_sides', 'five_sides', 'five_vertices'],
      category: 'polygon'
    },
    hexagon: {
      type: '2d',
      sides: 6,
      vertices: 6,
      properties: ['straight_sides', 'six_sides', 'six_vertices'],
      category: 'polygon'
    },
    // 3D Shapes
    cube: {
      type: '3d',
      faces: 6,
      edges: 12,
      vertices: 8,
      properties: ['square_faces', 'equal_edges', 'six_faces'],
      category: 'polyhedron'
    },
    sphere: {
      type: '3d',
      faces: 1,
      edges: 0,
      vertices: 0,
      properties: ['curved_surface', 'no_edges', 'no_vertices'],
      category: 'curved_3d'
    },
    cylinder: {
      type: '3d',
      faces: 3,
      edges: 2,
      vertices: 0,
      properties: ['curved_surface', 'circular_bases', 'three_faces'],
      category: 'curved_3d'
    },
    cone: {
      type: '3d',
      faces: 2,
      edges: 1,
      vertices: 1,
      properties: ['curved_surface', 'circular_base', 'pointed_top'],
      category: 'curved_3d'
    },
    pyramid: {
      type: '3d',
      faces: 5,
      edges: 8,
      vertices: 5,
      properties: ['triangular_faces', 'square_base', 'pointed_top'],
      category: 'polyhedron'
    }
  } as const;

  generate(params: ShapeRecognitionDifficultyParams): ShapeRecognitionOutput {
    const problemType = randomChoice(params.problem_types);
    const availableShapes = [...params.include_2d_shapes, ...params.include_3d_shapes];
    
    switch (problemType) {
      case 'identify_shape':
        return this.generateIdentifyShapeProblem(availableShapes);
      case 'count_sides':
        return this.generateCountSidesProblem(params);
      case 'count_vertices':
        return this.generateCountVerticesProblem(params);
      case 'compare_shapes':
        return this.generateCompareShapesProblem(availableShapes);
      default:
        return this.generateIdentifyShapeProblem(availableShapes);
    }
  }

  getDefaultParams(year: number): ShapeRecognitionDifficultyParams {
    if (year <= 1) {
      return {
        include_2d_shapes: ['circle', 'triangle', 'square'],
        include_3d_shapes: ['cube', 'sphere'],
        problem_types: ['identify_shape'],
        max_shapes_count: 1,
        include_irregular_shapes: false,
        allow_rotations: false
      } as any;
    } else if (year <= 2) {
      return {
        include_2d_shapes: ['circle', 'triangle', 'square', 'rectangle'],
        include_3d_shapes: ['cube', 'sphere', 'cylinder'],
        problem_types: ['identify_shape', 'count_sides'],
        max_shapes_count: 2,
        include_irregular_shapes: false,
        allow_rotations: false
      } as any;
    } else if (year <= 4) {
      return {
        include_2d_shapes: ['circle', 'triangle', 'square', 'rectangle', 'pentagon'],
        include_3d_shapes: ['cube', 'sphere', 'cylinder', 'cone'],
        problem_types: ['identify_shape', 'count_sides', 'count_vertices'],
        max_shapes_count: 3,
        include_irregular_shapes: false,
        allow_rotations: true
      } as any;
    } else {
      return {
        include_2d_shapes: ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon'],
        include_3d_shapes: ['cube', 'sphere', 'cylinder', 'cone', 'pyramid'],
        problem_types: ['identify_shape', 'count_sides', 'count_vertices', 'compare_shapes'],
        max_shapes_count: 4,
        include_irregular_shapes: true,
        allow_rotations: true
      } as any;
    }
  }

  private generateIdentifyShapeProblem(availableShapes: string[]): ShapeRecognitionOutput {
    const targetShape = randomChoice(availableShapes);
    const shapeInfo = ShapeRecognitionModel.SHAPE_DATA[targetShape as keyof typeof ShapeRecognitionModel.SHAPE_DATA];
    
    // Generate distractors (wrong answers)
    const distractors = availableShapes
      .filter(shape => shape !== targetShape)
      .slice(0, 3);

    return {
      operation: "SHAPE_RECOGNITION",
      problem_type: 'identify_shape',
      shape_data: [{
        name: targetShape,
        type: shapeInfo.type,
        sides: (shapeInfo as any).sides,
        vertices: (shapeInfo as any).vertices,
        properties: [...shapeInfo.properties],
        category: shapeInfo.category
      }],
      target_shape: targetShape,
      correct_answer: targetShape,
      distractors
    } as any;
  }

  private generateCountSidesProblem(params: ShapeRecognitionDifficultyParams): ShapeRecognitionOutput {
    // Focus on 2D shapes for counting sides
    const available2D = params.include_2d_shapes.filter(shape => 
      shape !== 'circle' // Circles don't have sides in the traditional sense
    );
    
    if (available2D.length === 0) {
      // Fallback to identify shape if no suitable shapes
      return this.generateIdentifyShapeProblem([...params.include_2d_shapes, ...params.include_3d_shapes]);
    }

    const targetShape = randomChoice(available2D);
    const shapeInfo = ShapeRecognitionModel.SHAPE_DATA[targetShape as keyof typeof ShapeRecognitionModel.SHAPE_DATA];

    return {
      operation: "SHAPE_RECOGNITION",
      problem_type: 'count_sides',
      shape_data: [{
        name: targetShape,
        type: shapeInfo.type,
        sides: (shapeInfo as any).sides,
        vertices: (shapeInfo as any).vertices,
        properties: [...shapeInfo.properties],
        category: shapeInfo.category
      }],
      target_shape: targetShape,
      correct_answer: (shapeInfo as any).sides || 0
    } as any;
  }

  private generateCountVerticesProblem(params: ShapeRecognitionDifficultyParams): ShapeRecognitionOutput {
    // Focus on shapes that have vertices
    const availableShapes = [...params.include_2d_shapes, ...params.include_3d_shapes]
      .filter(shape => shape !== 'circle' && shape !== 'sphere' && shape !== 'cylinder');
    
    if (availableShapes.length === 0) {
      // Fallback if no suitable shapes
      return this.generateIdentifyShapeProblem([...params.include_2d_shapes, ...params.include_3d_shapes]);
    }

    const targetShape = randomChoice(availableShapes);
    const shapeInfo = ShapeRecognitionModel.SHAPE_DATA[targetShape as keyof typeof ShapeRecognitionModel.SHAPE_DATA];

    return {
      operation: "SHAPE_RECOGNITION",
      problem_type: 'count_vertices',
      shape_data: [{
        name: targetShape,
        type: shapeInfo.type,
        sides: (shapeInfo as any).sides,
        vertices: (shapeInfo as any).vertices,
        properties: [...shapeInfo.properties],
        category: shapeInfo.category
      }],
      target_shape: targetShape,
      correct_answer: (shapeInfo as any).vertices || 0
    } as any;
  }

  private generateCompareShapesProblem(availableShapes: string[]): ShapeRecognitionOutput {
    const shape1 = randomChoice(availableShapes);
    const remainingShapes = availableShapes.filter(s => s !== shape1);
    const shape2 = randomChoice(remainingShapes);
    
    const shape1Info = ShapeRecognitionModel.SHAPE_DATA[shape1 as keyof typeof ShapeRecognitionModel.SHAPE_DATA];
    const shape2Info = ShapeRecognitionModel.SHAPE_DATA[shape2 as keyof typeof ShapeRecognitionModel.SHAPE_DATA];

    // Compare by number of sides
    let comparisonResult: string;
    let correctAnswer: string;
    
    const sides1 = (shape1Info as any).sides || 0;
    const sides2 = (shape2Info as any).sides || 0;
    
    if (sides1 > sides2) {
      comparisonResult = 'first_more_sides';
      correctAnswer = `${shape1} has more sides`;
    } else if (sides2 > sides1) {
      comparisonResult = 'second_more_sides';
      correctAnswer = `${shape2} has more sides`;
    } else {
      comparisonResult = 'equal_sides';
      correctAnswer = 'Both shapes have the same number of sides';
    }

    return {
      operation: "SHAPE_RECOGNITION",
      problem_type: 'compare_shapes',
      shape_data: [
        {
          name: shape1,
          type: shape1Info.type,
          sides: (shape1Info as any).sides,
          vertices: (shape1Info as any).vertices,
          properties: [...shape1Info.properties],
          category: shape1Info.category
        },
        {
          name: shape2,
          type: shape2Info.type,
          sides: (shape2Info as any).sides,
          vertices: (shape2Info as any).vertices,
          properties: [...shape2Info.properties],
          category: shape2Info.category
        }
      ],
      comparison_result: comparisonResult,
      correct_answer: correctAnswer
    } as any;
  }
}