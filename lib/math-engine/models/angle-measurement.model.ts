import {
  IMathModel,
  AngleMeasurementDifficultyParams,
  AngleMeasurementOutput
} from '@/lib/types';
import {
  randomChoice,
  generateRandomNumber
} from '@/lib/utils';

export class AngleMeasurementModel implements IMathModel<AngleMeasurementDifficultyParams, AngleMeasurementOutput> {
  public readonly model_id = "ANGLE_MEASUREMENT";

  private static readonly ANGLE_TYPES = {
    acute: { min: 1, max: 89, description: 'less than 90 degrees' },
    right: { min: 90, max: 90, description: 'exactly 90 degrees' },
    obtuse: { min: 91, max: 179, description: 'between 90 and 180 degrees' },
    straight: { min: 180, max: 180, description: 'exactly 180 degrees' },
    reflex: { min: 181, max: 359, description: 'between 180 and 360 degrees' }
  };

  private static readonly COMMON_ANGLES = [30, 45, 60, 90, 120, 135, 150, 180, 270];

  private static readonly CLOCK_ANGLES = {
    '3 o\'clock': 90,
    '6 o\'clock': 180,
    '9 o\'clock': 270,
    '12 o\'clock': 0,
    '1 o\'clock': 30,
    '2 o\'clock': 60,
    '4 o\'clock': 120,
    '5 o\'clock': 150,
    '7 o\'clock': 210,
    '8 o\'clock': 240,
    '10 o\'clock': 300,
    '11 o\'clock': 330
  };

  generate(params: AngleMeasurementDifficultyParams): AngleMeasurementOutput {
    const problemType = randomChoice(params.problem_types);
    
    switch (problemType) {
      case 'identify_type':
        return this.generateIdentifyTypeProblem(params);
      case 'measure_angle':
        return this.generateMeasureAngleProblem(params);
      case 'calculate_missing':
        return this.generateCalculateMissingProblem(params);
      case 'convert_units':
        return this.generateConvertUnitsProblem(params);
      default:
        return this.generateIdentifyTypeProblem(params);
    }
  }

  getDefaultParams(year: number): AngleMeasurementDifficultyParams {
    if (year <= 3) {
      return {
        angle_types: ['right'],
        measurement_units: ['right_angles', 'turns'],
        include_angle_drawing: false,
        include_angle_calculation: false,
        max_angle_degrees: 90,
        problem_types: ['identify_type']
      };
    } else if (year <= 4) {
      return {
        angle_types: ['right', 'acute', 'obtuse'],
        measurement_units: ['degrees', 'right_angles'],
        include_angle_drawing: false,
        include_angle_calculation: false,
        max_angle_degrees: 180,
        problem_types: ['identify_type', 'measure_angle']
      };
    } else if (year <= 5) {
      return {
        angle_types: ['right', 'acute', 'obtuse', 'straight'],
        measurement_units: ['degrees', 'right_angles', 'turns'],
        include_angle_drawing: true,
        include_angle_calculation: true,
        max_angle_degrees: 180,
        problem_types: ['identify_type', 'measure_angle', 'calculate_missing']
      };
    } else {
      return {
        angle_types: ['right', 'acute', 'obtuse', 'straight', 'reflex'],
        measurement_units: ['degrees', 'turns'],
        include_angle_drawing: true,
        include_angle_calculation: true,
        max_angle_degrees: 360,
        problem_types: ['identify_type', 'measure_angle', 'calculate_missing', 'convert_units']
      };
    }
  }

  private generateIdentifyTypeProblem(params: AngleMeasurementDifficultyParams): AngleMeasurementOutput {
    const angleType = randomChoice(params.angle_types);
    const angleData = AngleMeasurementModel.ANGLE_TYPES[angleType as keyof typeof AngleMeasurementModel.ANGLE_TYPES];
    
    let angleDegrees: number;
    if (angleType === 'right' || angleType === 'straight') {
      angleDegrees = angleData.min; // Exact values for these
    } else {
      // Use common angles when possible, otherwise generate random
      const commonAnglesInRange = AngleMeasurementModel.COMMON_ANGLES.filter(
        angle => angle >= angleData.min && angle <= angleData.max
      );
      
      if (commonAnglesInRange.length > 0 && Math.random() > 0.3) {
        angleDegrees = randomChoice(commonAnglesInRange);
      } else {
        angleDegrees = generateRandomNumber(angleData.max, 0, angleData.min);
      }
    }

    const context = this.generateAngleContext(angleDegrees);

    return {
      operation: "ANGLE_MEASUREMENT",
      problem_type: 'identify_type',
      angle_degrees: angleDegrees,
      angle_type: angleType,
      measurement_in_turns: angleDegrees / 360,
      measurement_in_right_angles: angleDegrees / 90,
      context: context.type,
      visual_description: context.description,
      correct_answer: angleType
    };
  }

  private generateMeasureAngleProblem(params: AngleMeasurementDifficultyParams): AngleMeasurementOutput {
    const unit = randomChoice(params.measurement_units);
    const angleType = randomChoice(params.angle_types);
    const angleData = AngleMeasurementModel.ANGLE_TYPES[angleType as keyof typeof AngleMeasurementModel.ANGLE_TYPES];
    
    let angleDegrees: number;
    if (angleType === 'right' || angleType === 'straight') {
      angleDegrees = angleData.min;
    } else {
      // Prefer common angles for measurement problems
      const commonAnglesInRange = AngleMeasurementModel.COMMON_ANGLES.filter(
        angle => angle >= angleData.min && angle <= angleData.max
      );
      
      if (commonAnglesInRange.length > 0) {
        angleDegrees = randomChoice(commonAnglesInRange);
      } else {
        angleDegrees = generateRandomNumber(angleData.max, 0, angleData.min);
      }
    }

    const context = this.generateAngleContext(angleDegrees);
    
    let correctAnswer: string | number;
    switch (unit) {
      case 'degrees':
        correctAnswer = `${angleDegrees}°`;
        break;
      case 'right_angles':
        correctAnswer = angleDegrees / 90;
        break;
      case 'turns':
        correctAnswer = angleDegrees / 360;
        break;
      default:
        correctAnswer = angleDegrees;
    }

    return {
      operation: "ANGLE_MEASUREMENT",
      problem_type: 'measure_angle',
      angle_degrees: angleDegrees,
      angle_type: angleType,
      measurement_in_turns: angleDegrees / 360,
      measurement_in_right_angles: angleDegrees / 90,
      context: context.type,
      visual_description: context.description,
      correct_answer: correctAnswer
    };
  }

  private generateCalculateMissingProblem(params: AngleMeasurementDifficultyParams): AngleMeasurementOutput {
    // Generate problems about angles on a straight line (sum to 180°) or around a point (sum to 360°)
    const problemContext = randomChoice(['straight_line', 'around_point']);
    
    let totalAngle: number;
    let contextDescription: string;
    
    if (problemContext === 'straight_line') {
      totalAngle = 180;
      contextDescription = 'angles on a straight line';
    } else {
      totalAngle = 360;
      contextDescription = 'angles around a point';
    }
    
    // Generate known angles that sum to less than the total
    const knownAngle1 = generateRandomNumber(60, 0, 20);
    const knownAngle2 = generateRandomNumber(80, 0, 30);
    const missingAngle = totalAngle - knownAngle1 - knownAngle2;
    
    // Ensure we have a valid problem
    if (missingAngle <= 0 || missingAngle >= totalAngle) {
      // Fallback to a simpler problem
      const known = generateRandomNumber(120, 0, 30);
      const missing = totalAngle - known;
      
      return {
        operation: "ANGLE_MEASUREMENT",
        problem_type: 'calculate_missing',
        angle_degrees: missing,
        angle_type: this.classifyAngle(missing),
        measurement_in_turns: missing / 360,
        measurement_in_right_angles: missing / 90,
        context: problemContext,
        visual_description: `Two angles: ${known}° and unknown angle on a ${problemContext === 'straight_line' ? 'straight line' : 'around a point'}`,
        correct_answer: `${missing}°`
      };
    }

    return {
      operation: "ANGLE_MEASUREMENT",
      problem_type: 'calculate_missing',
      angle_degrees: missingAngle,
      angle_type: this.classifyAngle(missingAngle),
      measurement_in_turns: missingAngle / 360,
      measurement_in_right_angles: missingAngle / 90,
      context: problemContext,
      visual_description: `Three angles: ${knownAngle1}°, ${knownAngle2}°, and unknown angle ${contextDescription}`,
      correct_answer: `${missingAngle}°`
    };
  }

  private generateConvertUnitsProblem(params: AngleMeasurementDifficultyParams): AngleMeasurementOutput {
    const fromUnit = randomChoice(params.measurement_units);
    const availableToUnits = params.measurement_units.filter(unit => unit !== fromUnit);
    const toUnit = randomChoice(availableToUnits);
    
    // Generate a suitable angle based on the conversion
    let angleDegrees: number;
    if (fromUnit === 'right_angles' || toUnit === 'right_angles') {
      // Use multiples of 90 for right angle conversions
      const rightAngleMultiples = [90, 180, 270, 360];
      angleDegrees = randomChoice(rightAngleMultiples.filter(angle => angle <= params.max_angle_degrees));
    } else if (fromUnit === 'turns' || toUnit === 'turns') {
      // Use fractions of 360 for turn conversions
      const turnFractions = [90, 180, 270, 360];
      angleDegrees = randomChoice(turnFractions.filter(angle => angle <= params.max_angle_degrees));
    } else {
      angleDegrees = randomChoice(AngleMeasurementModel.COMMON_ANGLES.filter(angle => angle <= params.max_angle_degrees));
    }

    let correctAnswer: string | number;
    if (toUnit === 'degrees') {
      correctAnswer = `${angleDegrees}°`;
    } else if (toUnit === 'right_angles') {
      correctAnswer = angleDegrees / 90;
    } else if (toUnit === 'turns') {
      const turns = angleDegrees / 360;
      correctAnswer = turns === 1 ? '1 full turn' : turns < 1 ? `${turns} turn` : `${turns} turns`;
    } else {
      correctAnswer = angleDegrees;
    }

    return {
      operation: "ANGLE_MEASUREMENT",
      problem_type: 'convert_units',
      angle_degrees: angleDegrees,
      angle_type: this.classifyAngle(angleDegrees),
      measurement_in_turns: angleDegrees / 360,
      measurement_in_right_angles: angleDegrees / 90,
      context: 'conversion',
      visual_description: `Converting ${angleDegrees}° from ${fromUnit} to ${toUnit}`,
      correct_answer: correctAnswer
    };
  }

  private generateAngleContext(angleDegrees: number): { type: string; description: string } {
    const contexts = ['clock', 'shape', 'lines'];
    const contextType = randomChoice(contexts);
    
    switch (contextType) {
      case 'clock':
        // Find closest clock position
        const clockEntries = Object.entries(AngleMeasurementModel.CLOCK_ANGLES);
        const closestClock = clockEntries.reduce((closest, [time, angle]) => {
          return Math.abs(angle - angleDegrees) < Math.abs(closest.angle - angleDegrees) 
            ? { time, angle } 
            : closest;
        }, { time: '12 o\'clock', angle: 0 });
        
        return {
          type: 'clock',
          description: `Clock hands at ${closestClock.time} form a ${angleDegrees}° angle`
        };
      
      case 'shape':
        return {
          type: 'shape',
          description: `Interior angle of ${angleDegrees}° in a polygon`
        };
      
      case 'lines':
        return {
          type: 'lines',
          description: `Angle of ${angleDegrees}° formed by two intersecting lines`
        };
      
      default:
        return {
          type: 'general',
          description: `An angle of ${angleDegrees}°`
        };
    }
  }

  private classifyAngle(degrees: number): string {
    if (degrees === 90) return 'right';
    if (degrees === 180) return 'straight';
    if (degrees < 90) return 'acute';
    if (degrees < 180) return 'obtuse';
    return 'reflex';
  }
}