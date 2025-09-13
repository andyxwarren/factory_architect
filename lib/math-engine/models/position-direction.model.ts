import {
  IMathModel,
  PositionDirectionDifficultyParams,
  PositionDirectionOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class PositionDirectionModel implements IMathModel<PositionDirectionDifficultyParams, PositionDirectionOutput> {
  public readonly model_id = "POSITION_DIRECTION";

  private static readonly COMPASS_DIRECTIONS = ['North', 'South', 'East', 'West'];
  private static readonly INTERMEDIATE_DIRECTIONS = ['North-East', 'North-West', 'South-East', 'South-West'];
  private static readonly ALL_DIRECTIONS = [
    ...PositionDirectionModel.COMPASS_DIRECTIONS,
    ...PositionDirectionModel.INTERMEDIATE_DIRECTIONS
  ];

  private static readonly POSITION_WORDS = {
    horizontal: ['left', 'right'],
    vertical: ['above', 'below', 'up', 'down'],
    diagonal: ['above-right', 'above-left', 'below-right', 'below-left'],
    relative: ['next to', 'beside', 'near', 'far from', 'between']
  };

  private static readonly GRID_REFERENCES = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    numbers: [1, 2, 3, 4, 5, 6, 7, 8]
  };

  generate(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const problemType = randomChoice(params.problem_types);
    
    switch (problemType) {
      case 'identify_position':
        return this.generateIdentifyPositionProblem(params);
      case 'follow_directions':
        return this.generateFollowDirectionsProblem(params);
      case 'give_directions':
        return this.generateGiveDirectionsProblem(params);
      case 'coordinates':
        return this.generateCoordinatesProblem(params);
      case 'compass_directions':
        return this.generateCompassDirectionsProblem(params);
      case 'relative_position':
        return this.generateRelativePositionProblem(params);
      default:
        return this.generateIdentifyPositionProblem(params);
    }
  }

  getDefaultParams(year: number): PositionDirectionDifficultyParams {
    if (year <= 1) {
      return {
        coordinate_system: 'simple_grid',
        use_compass_directions: false,
        max_grid_size: 3,
        include_diagonals: false,
        movement_steps: 1,
        problem_types: ['identify_position', 'relative_position']
      };
    } else if (year <= 2) {
      return {
        coordinate_system: 'simple_grid',
        use_compass_directions: false,
        max_grid_size: 4,
        include_diagonals: false,
        movement_steps: 2,
        problem_types: ['identify_position', 'follow_directions', 'relative_position']
      };
    } else if (year <= 3) {
      return {
        coordinate_system: 'lettered_grid',
        use_compass_directions: true,
        max_grid_size: 5,
        include_diagonals: false,
        movement_steps: 3,
        problem_types: ['identify_position', 'follow_directions', 'compass_directions', 'relative_position']
      };
    } else if (year <= 4) {
      return {
        coordinate_system: 'lettered_grid',
        use_compass_directions: true,
        max_grid_size: 6,
        include_diagonals: true,
        movement_steps: 4,
        problem_types: ['identify_position', 'follow_directions', 'give_directions', 'coordinates', 'compass_directions']
      };
    } else if (year <= 5) {
      return {
        coordinate_system: 'coordinate_plane',
        use_compass_directions: true,
        max_grid_size: 8,
        include_diagonals: true,
        movement_steps: 5,
        problem_types: ['follow_directions', 'give_directions', 'coordinates', 'compass_directions', 'relative_position']
      };
    } else {
      return {
        coordinate_system: 'coordinate_plane',
        use_compass_directions: true,
        max_grid_size: 10,
        include_diagonals: true,
        movement_steps: 6,
        problem_types: ['follow_directions', 'give_directions', 'coordinates', 'compass_directions', 'relative_position']
      };
    }
  }

  private generateIdentifyPositionProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const position = this.generateRandomPosition(params.coordinate_system, gridSize);
    
    let correctAnswer: string;
    if (params.coordinate_system === 'coordinate_plane') {
      correctAnswer = `(${position.x}, ${position.y})`;
    } else if (params.coordinate_system === 'lettered_grid') {
      const letter = PositionDirectionModel.GRID_REFERENCES.letters[position.x - 1];
      correctAnswer = `${letter}${position.y}`;
    } else {
      correctAnswer = `Column ${position.x}, Row ${position.y}`;
    }

    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'identify_position',
      start_position: position,
      target_position: position,
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      visual_description: `Object located at position on ${gridSize}×${gridSize} grid`,
      correct_answer: correctAnswer
    };
  }

  private generateFollowDirectionsProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const startPosition = this.generateRandomPosition(params.coordinate_system, gridSize);
    const movements = this.generateMovements(params.movement_steps, params.use_compass_directions, params.include_diagonals);
    const targetPosition = this.calculateFinalPosition(startPosition, movements, gridSize);
    
    let correctAnswer: string;
    if (params.coordinate_system === 'coordinate_plane') {
      correctAnswer = `(${targetPosition.x}, ${targetPosition.y})`;
    } else if (params.coordinate_system === 'lettered_grid') {
      const letter = PositionDirectionModel.GRID_REFERENCES.letters[targetPosition.x - 1];
      correctAnswer = `${letter}${targetPosition.y}`;
    } else {
      correctAnswer = `Column ${targetPosition.x}, Row ${targetPosition.y}`;
    }

    const directionText = movements.map(m => `${m.steps} step${m.steps > 1 ? 's' : ''} ${m.direction}`).join(', then ');

    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'follow_directions',
      start_position: startPosition,
      target_position: targetPosition,
      movements: movements,
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      visual_description: `Starting position and movement instructions: ${directionText}`,
      correct_answer: correctAnswer
    };
  }

  private generateGiveDirectionsProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const startPosition = this.generateRandomPosition(params.coordinate_system, gridSize);
    const targetPosition = this.generateRandomPosition(params.coordinate_system, gridSize);
    
    // Calculate the simplest path
    const movements = this.calculateSimplePath(startPosition, targetPosition, params.use_compass_directions);
    const directionText = movements.map(m => `${m.steps} step${m.steps > 1 ? 's' : ''} ${m.direction}`).join(', then ');

    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'give_directions',
      start_position: startPosition,
      target_position: targetPosition,
      movements: movements,
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      visual_description: `Path from start to target position`,
      correct_answer: directionText
    };
  }

  private generateCoordinatesProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const position = this.generateRandomPosition(params.coordinate_system, gridSize);
    
    let questionFocus: string;
    let correctAnswer: string;
    
    if (params.coordinate_system === 'coordinate_plane') {
      const focusOptions = ['x_coordinate', 'y_coordinate', 'both_coordinates'];
      questionFocus = randomChoice(focusOptions);
      
      if (questionFocus === 'x_coordinate') {
        correctAnswer = String(position.x);
      } else if (questionFocus === 'y_coordinate') {
        correctAnswer = String(position.y);
      } else {
        correctAnswer = `(${position.x}, ${position.y})`;
      }
    } else {
      questionFocus = 'grid_reference';
      const letter = PositionDirectionModel.GRID_REFERENCES.letters[position.x - 1];
      correctAnswer = `${letter}${position.y}`;
    }

    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'coordinates',
      start_position: position,
      target_position: position,
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      question_focus: questionFocus,
      visual_description: `Object on coordinate grid at specific position`,
      correct_answer: correctAnswer
    };
  }

  private generateCompassDirectionsProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const centerPosition = { x: Math.ceil(gridSize / 2), y: Math.ceil(gridSize / 2) };
    
    const directions = params.include_diagonals ? PositionDirectionModel.ALL_DIRECTIONS : PositionDirectionModel.COMPASS_DIRECTIONS;
    const direction = randomChoice(directions);
    const steps = generateRandomNumber(3, 0, 1);
    
    const targetPosition = this.moveInCompassDirection(centerPosition, direction, steps, gridSize);
    
    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'compass_directions',
      start_position: centerPosition,
      target_position: targetPosition,
      movements: [{ direction, steps }],
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      visual_description: `Movement ${steps} step${steps > 1 ? 's' : ''} ${direction} from center`,
      correct_answer: direction
    };
  }

  private generateRelativePositionProblem(params: PositionDirectionDifficultyParams): PositionDirectionOutput {
    const gridSize = Math.min(params.max_grid_size, 8);
    const referencePosition = this.generateRandomPosition(params.coordinate_system, gridSize);
    const targetPosition = this.generateRandomPosition(params.coordinate_system, gridSize);
    
    const relativeDescription = this.getRelativePosition(referencePosition, targetPosition);
    
    return {
      operation: "POSITION_DIRECTION",
      problem_type: 'relative_position',
      start_position: referencePosition,
      target_position: targetPosition,
      coordinate_system: params.coordinate_system,
      grid_size: gridSize,
      visual_description: `Two objects on grid with relative positioning`,
      correct_answer: relativeDescription
    };
  }

  private generateRandomPosition(coordinateSystem: string, gridSize: number): { x: number; y: number } {
    return {
      x: generateRandomNumber(gridSize, 0, 1),
      y: generateRandomNumber(gridSize, 0, 1)
    };
  }

  private generateMovements(maxSteps: number, useCompass: boolean, includeDiagonals: boolean): Array<{ direction: string; steps: number }> {
    const numberOfMoves = generateRandomNumber(Math.min(maxSteps, 3), 0, 1);
    const movements = [];
    
    for (let i = 0; i < numberOfMoves; i++) {
      let direction: string;
      if (useCompass) {
        const directions = includeDiagonals ? PositionDirectionModel.ALL_DIRECTIONS : PositionDirectionModel.COMPASS_DIRECTIONS;
        direction = randomChoice(directions);
      } else {
        const simpleDirections = ['up', 'down', 'left', 'right'];
        direction = randomChoice(simpleDirections);
      }
      
      const steps = generateRandomNumber(3, 0, 1);
      movements.push({ direction, steps });
    }
    
    return movements;
  }

  private calculateFinalPosition(
    start: { x: number; y: number }, 
    movements: Array<{ direction: string; steps: number }>, 
    gridSize: number
  ): { x: number; y: number } {
    let position = { ...start };
    
    for (const movement of movements) {
      position = this.moveInDirection(position, movement.direction, movement.steps, gridSize);
    }
    
    return position;
  }

  private moveInDirection(
    position: { x: number; y: number }, 
    direction: string, 
    steps: number, 
    gridSize: number
  ): { x: number; y: number } {
    let newPos = { ...position };
    
    switch (direction.toLowerCase()) {
      case 'north':
      case 'up':
        newPos.y = Math.min(newPos.y + steps, gridSize);
        break;
      case 'south':
      case 'down':
        newPos.y = Math.max(newPos.y - steps, 1);
        break;
      case 'east':
      case 'right':
        newPos.x = Math.min(newPos.x + steps, gridSize);
        break;
      case 'west':
      case 'left':
        newPos.x = Math.max(newPos.x - steps, 1);
        break;
      case 'north-east':
        newPos.x = Math.min(newPos.x + steps, gridSize);
        newPos.y = Math.min(newPos.y + steps, gridSize);
        break;
      case 'north-west':
        newPos.x = Math.max(newPos.x - steps, 1);
        newPos.y = Math.min(newPos.y + steps, gridSize);
        break;
      case 'south-east':
        newPos.x = Math.min(newPos.x + steps, gridSize);
        newPos.y = Math.max(newPos.y - steps, 1);
        break;
      case 'south-west':
        newPos.x = Math.max(newPos.x - steps, 1);
        newPos.y = Math.max(newPos.y - steps, 1);
        break;
    }
    
    return newPos;
  }

  private moveInCompassDirection(
    position: { x: number; y: number }, 
    direction: string, 
    steps: number, 
    gridSize: number
  ): { x: number; y: number } {
    return this.moveInDirection(position, direction, steps, gridSize);
  }

  private calculateSimplePath(
    start: { x: number; y: number }, 
    target: { x: number; y: number }, 
    useCompass: boolean
  ): Array<{ direction: string; steps: number }> {
    const movements = [];
    const deltaX = target.x - start.x;
    const deltaY = target.y - start.y;
    
    if (deltaX !== 0) {
      const direction = useCompass ? (deltaX > 0 ? 'East' : 'West') : (deltaX > 0 ? 'right' : 'left');
      movements.push({ direction, steps: Math.abs(deltaX) });
    }
    
    if (deltaY !== 0) {
      const direction = useCompass ? (deltaY > 0 ? 'North' : 'South') : (deltaY > 0 ? 'up' : 'down');
      movements.push({ direction, steps: Math.abs(deltaY) });
    }
    
    return movements;
  }

  private getRelativePosition(reference: { x: number; y: number }, target: { x: number; y: number }): string {
    const deltaX = target.x - reference.x;
    const deltaY = target.y - reference.y;
    
    if (deltaX === 0 && deltaY === 0) return 'same position';
    if (deltaX === 0 && deltaY > 0) return 'above';
    if (deltaX === 0 && deltaY < 0) return 'below';
    if (deltaX > 0 && deltaY === 0) return 'to the right';
    if (deltaX < 0 && deltaY === 0) return 'to the left';
    if (deltaX > 0 && deltaY > 0) return 'above and to the right';
    if (deltaX < 0 && deltaY > 0) return 'above and to the left';
    if (deltaX > 0 && deltaY < 0) return 'below and to the right';
    if (deltaX < 0 && deltaY < 0) return 'below and to the left';
    
    return 'near';
  }
}