import {
  SubDifficultyLevel,
  DifficultyProgression,
  DifficultyInterpolation,
  ProgressionRules,
  TransitionValidation,
  CognitiveDemands,
  EnhancedAdditionParams,
  EnhancedSubtractionParams,
  EnhancedMultiplicationParams,
  EnhancedDivisionParams,
  EnhancedPercentageParams,
  EnhancedFractionParams
} from '@/lib/types-enhanced';

/**
 * Enhanced Difficulty System with 4 sub-levels per year
 * Provides smooth progression and confidence preservation
 */
export class EnhancedDifficultySystem {
  
  private static readonly PROGRESSION_RULES: ProgressionRules = {
    maxParameterIncrease: 0.5,  // 50% max increase
    maxSimultaneousChanges: 2,  // Max 2 parameters change at once
    confidenceThreshold: 0.75,  // 75% success needed for advancement
    adaptiveEnabled: true
  };

  /**
   * Create a SubDifficultyLevel from decimal notation
   */
  static createLevel(year: number, subLevel: number): SubDifficultyLevel {
    if (year < 1 || year > 6) throw new Error('Year must be 1-6');
    if (subLevel < 1 || subLevel > 4) throw new Error('SubLevel must be 1-4');
    
    return {
      year,
      subLevel,
      displayName: `${year}.${subLevel}`
    };
  }

  /**
   * Parse decimal level string (e.g., "3.2") into SubDifficultyLevel
   */
  static parseLevel(levelString: string): SubDifficultyLevel {
    const parts = levelString.split('.');
    if (parts.length !== 2) throw new Error('Level must be in format "X.Y"');
    
    const year = parseInt(parts[0]);
    const subLevel = parseInt(parts[1]);
    
    return this.createLevel(year, subLevel);
  }

  /**
   * Get enhanced parameters for any model at specified sub-level
   */
  static getSubLevelParams(
    modelId: string, 
    level: SubDifficultyLevel
  ): any {
    switch (modelId) {
      case 'ADDITION':
        return this.getAdditionSubLevelParams(level);
      case 'SUBTRACTION':
        return this.getSubtractionSubLevelParams(level);
      case 'MULTIPLICATION':
        return this.getMultiplicationSubLevelParams(level);
      case 'DIVISION':
        return this.getDivisionSubLevelParams(level);
      case 'PERCENTAGE':
        return this.getPercentageSubLevelParams(level);
      case 'FRACTION':
        return this.getFractionSubLevelParams(level);
      default:
        throw new Error(`Enhanced difficulty not yet implemented for ${modelId}`);
    }
  }

  /**
   * Calculate cognitive load for given parameters
   */
  static calculateCognitiveLoad(
    modelId: string,
    parameters: any
  ): CognitiveDemands {
    switch (modelId) {
      case 'ADDITION':
        return this.calculateAdditionCognitive(parameters);
      case 'SUBTRACTION':
        return this.calculateSubtractionCognitive(parameters);
      case 'MULTIPLICATION':
        return this.calculateMultiplicationCognitive(parameters);
      case 'DIVISION':
        return this.calculateDivisionCognitive(parameters);
      default:
        return {
          workingMemoryLoad: 5,
          proceduralComplexity: 5,
          conceptualDepth: 5,
          visualProcessing: 5,
          totalLoad: 50
        };
    }
  }

  /**
   * Validate that transition between levels is smooth
   */
  static validateTransition(
    modelId: string,
    fromLevel: SubDifficultyLevel,
    toLevel: SubDifficultyLevel
  ): TransitionValidation {
    const fromParams = this.getSubLevelParams(modelId, fromLevel);
    const toParams = this.getSubLevelParams(modelId, toLevel);
    
    return this.analyzeParameterChanges(fromParams, toParams);
  }

  /**
   * Get next recommended level based on current performance
   */
  static getNextLevel(
    currentLevel: SubDifficultyLevel,
    isAdvancing: boolean = true
  ): SubDifficultyLevel {
    if (isAdvancing) {
      // Advance to next sub-level or next year
      if (currentLevel.subLevel < 4) {
        return this.createLevel(currentLevel.year, currentLevel.subLevel + 1);
      } else if (currentLevel.year < 6) {
        return this.createLevel(currentLevel.year + 1, 1);
      } else {
        return currentLevel; // At maximum level
      }
    } else {
      // Go back to previous sub-level or previous year
      if (currentLevel.subLevel > 1) {
        return this.createLevel(currentLevel.year, currentLevel.subLevel - 1);
      } else if (currentLevel.year > 1) {
        return this.createLevel(currentLevel.year - 1, 4);
      } else {
        return currentLevel; // At minimum level
      }
    }
  }

  // ADDITION Model Sub-Level Parameters
  private static getAdditionSubLevelParams(level: SubDifficultyLevel): EnhancedAdditionParams {
    const progressionTable = {
      // Year 1 sub-levels
      '1.1': { max_value: 5, operands: 2, carrying: 'never', range: 'single-digit' },
      '1.2': { max_value: 8, operands: 2, carrying: 'never', range: 'single-digit' },
      '1.3': { max_value: 10, operands: 2, carrying: 'never', range: 'single-digit' },
      '1.4': { max_value: 15, operands: 2, carrying: 'never', range: 'teen' },
      
      // Year 2 sub-levels
      '2.1': { max_value: 15, operands: 2, carrying: 'never', range: 'teen' },
      '2.2': { max_value: 18, operands: 2, carrying: 'never', range: 'two-digit' },
      '2.3': { max_value: 20, operands: 2, carrying: 'never', range: 'two-digit' },
      '2.4': { max_value: 30, operands: 2, carrying: 'rare', range: 'two-digit' },
      
      // Year 3 sub-levels
      '3.1': { max_value: 40, operands: [2,3], carrying: 'occasional', range: 'two-digit' },
      '3.2': { max_value: 60, operands: [2,3], carrying: 'common', range: 'two-digit' },
      '3.3': { max_value: 100, operands: 3, carrying: 'common', range: 'three-digit' },
      '3.4': { max_value: 150, operands: 3, carrying: 'always', range: 'three-digit' },
      
      // Year 4 sub-levels (introducing decimals)
      '4.1': { max_value: 150, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 0 },
      '4.2': { max_value: 100, operands: 3, carrying: 'always', range: 'two-digit', decimal_places: 1 },
      '4.3': { max_value: 100, operands: 3, carrying: 'always', range: 'two-digit', decimal_places: 2 },
      '4.4': { max_value: 200, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 2 },
      
      // Year 5 sub-levels
      '5.1': { max_value: 300, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 2 },
      '5.2': { max_value: 500, operands: 4, carrying: 'always', range: 'three-digit', decimal_places: 2 },
      '5.3': { max_value: 1000, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },
      '5.4': { max_value: 1500, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },
      
      // Year 6 sub-levels
      '6.1': { max_value: 2000, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },
      '6.2': { max_value: 5000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 },
      '6.3': { max_value: 10000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 },
      '6.4': { max_value: 15000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    return {
      operand_count: Array.isArray(config.operands) ? config.operands[1] : config.operands,
      max_value: config.max_value,
      decimal_places: config.decimal_places || 0,
      allow_carrying: config.carrying !== 'never',
      value_constraints: {
        min: config.decimal_places ? 0.01 : 1,
        step: config.decimal_places ? Math.pow(10, -config.decimal_places) : 1
      },
      carryingFrequency: config.carrying as any,
      numberRange: config.range as any,
      visualSupport: level.year <= 2
    };
  }

  // SUBTRACTION Model Sub-Level Parameters
  private static getSubtractionSubLevelParams(level: SubDifficultyLevel): EnhancedSubtractionParams {
    const progressionTable = {
      // Year 1 sub-levels
      '1.1': { max: 5, borrowing: 'never', range: 'single-digit' },
      '1.2': { max: 8, borrowing: 'never', range: 'single-digit' },
      '1.3': { max: 10, borrowing: 'never', range: 'single-digit' },
      '1.4': { max: 15, borrowing: 'never', range: 'teen' },
      
      // Year 2 sub-levels
      '2.1': { max: 15, borrowing: 'never', range: 'teen' },
      '2.2': { max: 18, borrowing: 'never', range: 'two-digit' },
      '2.3': { max: 20, borrowing: 'never', range: 'two-digit' },
      '2.4': { max: 30, borrowing: 'rare', range: 'two-digit' },
      
      // Year 3 sub-levels
      '3.1': { max: 40, borrowing: 'occasional', range: 'two-digit' },
      '3.2': { max: 60, borrowing: 'common', range: 'two-digit' },
      '3.3': { max: 100, borrowing: 'common', range: 'three-digit' },
      '3.4': { max: 150, borrowing: 'always', range: 'three-digit' },
      
      // Year 4 sub-levels (introducing decimals)
      '4.1': { max: 150, borrowing: 'always', range: 'three-digit', decimal_places: 0 },
      '4.2': { max: 100, borrowing: 'always', range: 'two-digit', decimal_places: 1 },
      '4.3': { max: 100, borrowing: 'always', range: 'two-digit', decimal_places: 2 },
      '4.4': { max: 200, borrowing: 'always', range: 'three-digit', decimal_places: 2 },
      
      // Year 5 sub-levels
      '5.1': { max: 300, borrowing: 'always', range: 'three-digit', decimal_places: 2 },
      '5.2': { max: 500, borrowing: 'always', range: 'three-digit', decimal_places: 2 },
      '5.3': { max: 1000, borrowing: 'always', range: 'large', decimal_places: 2 },
      '5.4': { max: 1500, borrowing: 'always', range: 'large', decimal_places: 2 },
      
      // Year 6 sub-levels
      '6.1': { max: 2000, borrowing: 'always', range: 'large', decimal_places: 2 },
      '6.2': { max: 5000, borrowing: 'always', range: 'large', decimal_places: 3 },
      '6.3': { max: 10000, borrowing: 'always', range: 'large', decimal_places: 3 },
      '6.4': { max: 15000, borrowing: 'always', range: 'large', decimal_places: 3 }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    return {
      minuend_max: config.max,
      subtrahend_max: config.max,
      decimal_places: config.decimal_places || 0,
      allow_borrowing: config.borrowing !== 'never',
      ensure_positive: true,
      value_constraints: {
        step: config.decimal_places ? Math.pow(10, -config.decimal_places) : 1
      },
      borrowingFrequency: config.borrowing as any,
      numberRange: config.range as any,
      visualSupport: level.year <= 2
    };
  }

  // MULTIPLICATION Model Sub-Level Parameters
  private static getMultiplicationSubLevelParams(level: SubDifficultyLevel): EnhancedMultiplicationParams {
    const progressionTable = {
      // Year 1 sub-levels
      '1.1': { multiplicand_max: 3, multiplier_max: 2, tables: [2], range: 'basic' },
      '1.2': { multiplicand_max: 5, multiplier_max: 2, tables: [2], range: 'basic' },
      '1.3': { multiplicand_max: 5, multiplier_max: 2, tables: [2], range: 'basic' },
      '1.4': { multiplicand_max: 8, multiplier_max: 3, tables: [2, 3], range: 'basic' },
      
      // Year 2 sub-levels
      '2.1': { multiplicand_max: 8, multiplier_max: 3, tables: [2, 3], range: 'basic' },
      '2.2': { multiplicand_max: 10, multiplier_max: 4, tables: [2, 3, 4], range: 'basic' },
      '2.3': { multiplicand_max: 10, multiplier_max: 5, tables: [2, 3, 4, 5], range: 'basic' },
      '2.4': { multiplicand_max: 12, multiplier_max: 6, tables: [2, 3, 4, 5, 6], range: 'extended' },
      
      // Year 3 sub-levels
      '3.1': { multiplicand_max: 12, multiplier_max: 7, tables: [2, 3, 4, 5, 6, 7], range: 'extended' },
      '3.2': { multiplicand_max: 12, multiplier_max: 8, tables: [2, 3, 4, 5, 6, 7, 8], range: 'extended' },
      '3.3': { multiplicand_max: 12, multiplier_max: 10, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], range: 'extended' },
      '3.4': { multiplicand_max: 20, multiplier_max: 10, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], range: 'extended' },
      
      // Year 4 sub-levels
      '4.1': { multiplicand_max: 30, multiplier_max: 10, tables: [], range: 'large' },
      '4.2': { multiplicand_max: 50, multiplier_max: 10, tables: [], range: 'large' },
      '4.3': { multiplicand_max: 100, multiplier_max: 10, tables: [], range: 'large' },
      '4.4': { multiplicand_max: 150, multiplier_max: 12, tables: [], range: 'large' },
      
      // Year 5 sub-levels (introducing decimals)
      '5.1': { multiplicand_max: 150, multiplier_max: 15, tables: [], range: 'large', decimal_places: 0 },
      '5.2': { multiplicand_max: 100, multiplier_max: 20, tables: [], range: 'large', decimal_places: 1 },
      '5.3': { multiplicand_max: 100, multiplier_max: 100, tables: [], range: 'large', decimal_places: 2 },
      '5.4': { multiplicand_max: 200, multiplier_max: 100, tables: [], range: 'large', decimal_places: 2 },
      
      // Year 6 sub-levels
      '6.1': { multiplicand_max: 500, multiplier_max: 100, tables: [], range: 'large', decimal_places: 2, operand_count: 2 },
      '6.2': { multiplicand_max: 800, multiplier_max: 100, tables: [], range: 'large', decimal_places: 3, operand_count: 2 },
      '6.3': { multiplicand_max: 1000, multiplier_max: 100, tables: [], range: 'large', decimal_places: 3, operand_count: 3 },
      '6.4': { multiplicand_max: 1500, multiplier_max: 150, tables: [], range: 'large', decimal_places: 3, operand_count: 3, use_fractions: true }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    return {
      multiplicand_max: config.multiplicand_max,
      multiplier_max: config.multiplier_max,
      decimal_places: config.decimal_places || 0,
      operand_count: config.operand_count || 2,
      use_fractions: config.use_fractions || false,
      tablesFocus: config.tables,
      numberRange: config.range as any,
      conceptualSupport: level.year <= 3
    };
  }

  // DIVISION Model Sub-Level Parameters  
  private static getDivisionSubLevelParams(level: SubDifficultyLevel): EnhancedDivisionParams {
    const progressionTable = {
      // Year 1 sub-levels
      '1.1': { dividend_max: 6, divisor_max: 2, remainder: 'never', tables: [2] },
      '1.2': { dividend_max: 10, divisor_max: 2, remainder: 'never', tables: [2] },
      '1.3': { dividend_max: 10, divisor_max: 2, remainder: 'never', tables: [2] },
      '1.4': { dividend_max: 15, divisor_max: 3, remainder: 'never', tables: [2, 3] },
      
      // Year 2 sub-levels
      '2.1': { dividend_max: 15, divisor_max: 3, remainder: 'never', tables: [2, 3] },
      '2.2': { dividend_max: 20, divisor_max: 4, remainder: 'never', tables: [2, 3, 4] },
      '2.3': { dividend_max: 20, divisor_max: 5, remainder: 'never', tables: [2, 3, 4, 5] },
      '2.4': { dividend_max: 30, divisor_max: 5, remainder: 'rare', tables: [2, 3, 4, 5] },
      
      // Year 3 sub-levels
      '3.1': { dividend_max: 30, divisor_max: 6, remainder: 'rare', tables: [2, 3, 4, 5, 6] },
      '3.2': { dividend_max: 50, divisor_max: 8, remainder: 'occasional', tables: [2, 3, 4, 5, 6, 7, 8] },
      '3.3': { dividend_max: 100, divisor_max: 10, remainder: 'never', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      '3.4': { dividend_max: 100, divisor_max: 10, remainder: 'common', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      
      // Year 4 sub-levels (remainder mastery)
      '4.1': { dividend_max: 100, divisor_max: 10, remainder: 'common', decimal_places: 0 },
      '4.2': { dividend_max: 150, divisor_max: 12, remainder: 'always', decimal_places: 0 },
      '4.3': { dividend_max: 200, divisor_max: 15, remainder: 'always', decimal_places: 0 },
      '4.4': { dividend_max: 300, divisor_max: 20, remainder: 'always', decimal_places: 0 },
      
      // Year 5 sub-levels (introducing decimal results)
      '5.1': { dividend_max: 300, divisor_max: 20, remainder: 'always', decimal_places: 0 },
      '5.2': { dividend_max: 500, divisor_max: 25, remainder: 'always', decimal_places: 1 },
      '5.3': { dividend_max: 1000, divisor_max: 100, remainder: 'always', decimal_places: 2 },
      '5.4': { dividend_max: 1500, divisor_max: 100, remainder: 'always', decimal_places: 2 },
      
      // Year 6 sub-levels
      '6.1': { dividend_max: 2000, divisor_max: 100, remainder: 'always', decimal_places: 2 },
      '6.2': { dividend_max: 5000, divisor_max: 100, remainder: 'always', decimal_places: 3 },
      '6.3': { dividend_max: 10000, divisor_max: 100, remainder: 'always', decimal_places: 3 },
      '6.4': { dividend_max: 15000, divisor_max: 150, remainder: 'always', decimal_places: 3 }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    return {
      dividend_max: config.dividend_max,
      divisor_max: config.divisor_max,
      decimal_places: config.decimal_places || 0,
      allow_remainder: config.remainder !== 'never',
      ensure_whole: config.remainder === 'never',
      remainderFrequency: config.remainder as any,
      tablesFocus: config.tables || [],
      visualSupport: level.year <= 3
    };
  }

  // PERCENTAGE Model Sub-Level Parameters
  private static getPercentageSubLevelParams(level: SubDifficultyLevel): EnhancedPercentageParams {
    // Percentages typically start in Year 4
    if (level.year < 4) {
      throw new Error('Percentage model not appropriate for years below 4');
    }

    const progressionTable = {
      // Year 4 sub-levels
      '4.1': { base_max: 50, percentages: [50, 100], operation: 'of', complexity: 'simple' },
      '4.2': { base_max: 80, percentages: [25, 50, 75], operation: 'of', complexity: 'simple' },
      '4.3': { base_max: 100, percentages: [10, 50, 100], operation: 'of', complexity: 'simple' },
      '4.4': { base_max: 120, percentages: [10, 20, 25, 50], operation: 'of', complexity: 'standard' },
      
      // Year 5 sub-levels
      '5.1': { base_max: 150, percentages: [10, 20, 25, 50], operation: 'of', complexity: 'standard' },
      '5.2': { base_max: 180, percentages: [10, 20, 25, 50, 75], operation: 'of', complexity: 'standard' },
      '5.3': { base_max: 200, percentages: [10, 20, 25, 50, 75], operation: 'of', complexity: 'standard' },
      '5.4': { base_max: 250, percentages: [5, 10, 15, 20, 25, 30], operation: 'mixed', complexity: 'complex' },
      
      // Year 6 sub-levels
      '6.1': { base_max: 300, percentages: [5, 10, 15, 20, 25, 30, 40], operation: 'mixed', complexity: 'complex' },
      '6.2': { base_max: 400, percentages: [5, 10, 15, 20, 25, 30, 40, 50], operation: 'decrease', complexity: 'complex' },
      '6.3': { base_max: 500, percentages: [5, 10, 15, 20, 25, 30, 40, 50, 75], operation: 'decrease', complexity: 'complex' },
      '6.4': { base_max: 750, percentages: [5, 10, 15, 20, 25, 30, 40, 50, 75, 90], operation: 'decrease', complexity: 'complex' }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    return {
      base_value_max: config.base_max,
      percentage_values: config.percentages,
      operation_type: config.operation as any,
      decimal_places: level.year >= 5 ? 2 : 0,
      percentageComplexity: config.complexity as any,
      conceptualContext: ['money', 'measurement', 'statistics'].slice(0, Math.ceil(level.year / 2)),
      visualSupport: level.year <= 4
    };
  }

  // FRACTION Model Sub-Level Parameters
  private static getFractionSubLevelParams(level: SubDifficultyLevel): EnhancedFractionParams {
    // Fractions typically start in Year 3
    if (level.year < 3) {
      throw new Error('Fraction model not appropriate for years below 3');
    }

    const progressionTable = {
      // Year 3 sub-levels
      '3.1': { whole_max: 10, fractions: [{ numerator: 1, denominator: 2 }], complexity: 'basic', numerator_types: 'unit' },
      '3.2': { whole_max: 20, fractions: [{ numerator: 1, denominator: 2 }], complexity: 'basic', numerator_types: 'unit' },
      '3.3': { whole_max: 30, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }], complexity: 'basic', numerator_types: 'unit' },
      '3.4': { whole_max: 50, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }], complexity: 'common', numerator_types: 'simple' },
      
      // Year 4 sub-levels
      '4.1': { whole_max: 60, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }], complexity: 'common', numerator_types: 'simple' },
      '4.2': { whole_max: 80, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }], complexity: 'common', numerator_types: 'simple' },
      '4.3': { whole_max: 100, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }], complexity: 'common', numerator_types: 'simple' },
      '4.4': { whole_max: 150, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }], complexity: 'mixed', numerator_types: 'mixed' },
      
      // Year 5 sub-levels
      '5.1': { whole_max: 200, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 }], complexity: 'mixed', numerator_types: 'mixed' },
      '5.2': { whole_max: 300, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }], complexity: 'mixed', numerator_types: 'mixed' },
      '5.3': { whole_max: 500, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }, { numerator: 3, denominator: 5 }], complexity: 'mixed', numerator_types: 'mixed' },
      '5.4': { whole_max: 750, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }, { numerator: 3, denominator: 5 }, { numerator: 4, denominator: 5 }], complexity: 'complex', numerator_types: 'mixed' },
      
      // Year 6 sub-levels
      '6.1': { whole_max: 1000, fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }, { numerator: 3, denominator: 5 }, { numerator: 4, denominator: 5 }], complexity: 'complex', numerator_types: 'mixed' },
      '6.2': { whole_max: 1200, fractions: 'extended', complexity: 'complex', numerator_types: 'mixed' },
      '6.3': { whole_max: 1500, fractions: 'extended', complexity: 'complex', numerator_types: 'improper' },
      '6.4': { whole_max: 2000, fractions: 'extended', complexity: 'complex', numerator_types: 'improper' }
    };

    const config = progressionTable[level.displayName];
    if (!config) throw new Error(`No progression defined for level ${level.displayName}`);

    // Extended fractions for Year 6
    const extendedFractions = [
      { numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 2, denominator: 3 },
      { numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 }, { numerator: 1, denominator: 5 },
      { numerator: 2, denominator: 5 }, { numerator: 3, denominator: 5 }, { numerator: 4, denominator: 5 },
      { numerator: 1, denominator: 6 }, { numerator: 5, denominator: 6 }, { numerator: 1, denominator: 8 },
      { numerator: 3, denominator: 8 }, { numerator: 5, denominator: 8 }, { numerator: 7, denominator: 8 },
      { numerator: 1, denominator: 10 }, { numerator: 3, denominator: 10 }, { numerator: 7, denominator: 10 }, { numerator: 9, denominator: 10 }
    ];

    return {
      whole_value_max: config.whole_max,
      fraction_types: config.fractions === 'extended' ? extendedFractions : config.fractions,
      decimal_places: level.year >= 4 ? 2 : 0,
      ensure_whole_result: level.year <= 3,
      denominatorComplexity: config.complexity as any,
      numeratorTypes: config.numerator_types as any,
      visualSupport: level.year <= 4
    };
  }

  // Cognitive Load Calculation Methods
  private static calculateAdditionCognitive(params: EnhancedAdditionParams): CognitiveDemands {
    const workingMemory = Math.min(10, Math.ceil(params.operand_count * 2 + (params.max_value > 100 ? 2 : 0)));
    const procedural = Math.min(10, Math.ceil((params.allow_carrying ? 3 : 1) + (params.decimal_places > 0 ? 2 : 0)));
    const conceptual = Math.min(10, Math.ceil(params.decimal_places + (params.allow_carrying ? 2 : 0)));
    const visual = Math.min(10, Math.ceil(Math.log10(params.max_value) + params.operand_count));
    
    return {
      workingMemoryLoad: workingMemory,
      proceduralComplexity: procedural,
      conceptualDepth: conceptual,
      visualProcessing: visual,
      totalLoad: Math.round((workingMemory + procedural + conceptual + visual) * 2.5)
    };
  }

  private static calculateSubtractionCognitive(params: EnhancedSubtractionParams): CognitiveDemands {
    const workingMemory = Math.min(10, Math.ceil(2 + (params.minuend_max > 100 ? 2 : 0)));
    const procedural = Math.min(10, Math.ceil((params.allow_borrowing ? 4 : 1) + (params.decimal_places > 0 ? 2 : 0)));
    const conceptual = Math.min(10, Math.ceil(params.decimal_places + (params.allow_borrowing ? 3 : 0)));
    const visual = Math.min(10, Math.ceil(Math.log10(params.minuend_max) + 1));
    
    return {
      workingMemoryLoad: workingMemory,
      proceduralComplexity: procedural,
      conceptualDepth: conceptual,
      visualProcessing: visual,
      totalLoad: Math.round((workingMemory + procedural + conceptual + visual) * 2.5)
    };
  }

  private static calculateMultiplicationCognitive(params: EnhancedMultiplicationParams): CognitiveDemands {
    const workingMemory = Math.min(10, Math.ceil(3 + (params.multiplicand_max > 100 ? 3 : 0)));
    const procedural = Math.min(10, Math.ceil(3 + (params.decimal_places > 0 ? 3 : 0) + (params.use_fractions ? 2 : 0)));
    const conceptual = Math.min(10, Math.ceil(2 + params.decimal_places + (params.use_fractions ? 3 : 0)));
    const visual = Math.min(10, Math.ceil(Math.log10(params.multiplicand_max) + Math.log10(params.multiplier_max)));
    
    return {
      workingMemoryLoad: workingMemory,
      proceduralComplexity: procedural,
      conceptualDepth: conceptual,
      visualProcessing: visual,
      totalLoad: Math.round((workingMemory + procedural + conceptual + visual) * 2.5)
    };
  }

  private static calculateDivisionCognitive(params: EnhancedDivisionParams): CognitiveDemands {
    const workingMemory = Math.min(10, Math.ceil(4 + (params.dividend_max > 100 ? 3 : 0)));
    const procedural = Math.min(10, Math.ceil(4 + (params.decimal_places > 0 ? 3 : 0) + (params.allow_remainder ? 2 : 0)));
    const conceptual = Math.min(10, Math.ceil(3 + params.decimal_places + (params.allow_remainder ? 2 : 0)));
    const visual = Math.min(10, Math.ceil(Math.log10(params.dividend_max) + 1));
    
    return {
      workingMemoryLoad: workingMemory,
      proceduralComplexity: procedural,
      conceptualDepth: conceptual,
      visualProcessing: visual,
      totalLoad: Math.round((workingMemory + procedural + conceptual + visual) * 2.5)
    };
  }

  private static analyzeParameterChanges(fromParams: any, toParams: any): TransitionValidation {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for parameter changes that are too large
    const paramChanges = this.calculateParameterChanges(fromParams, toParams);
    const maxChange = Math.max(...paramChanges.map(change => change.percentIncrease));
    const simultaneousChanges = paramChanges.filter(change => change.percentIncrease > 0).length;
    
    const isSmooth = maxChange <= 50 && simultaneousChanges <= 2;
    
    if (maxChange > 50) {
      warnings.push(`Parameter change of ${maxChange.toFixed(1)}% exceeds 50% threshold`);
      recommendations.push('Consider adding intermediate sub-level');
    }
    
    if (simultaneousChanges > 2) {
      warnings.push(`${simultaneousChanges} parameters changing simultaneously`);
      recommendations.push('Limit changes to 2 parameters per level');
    }
    
    return {
      isSmooth,
      maxParameterChange: maxChange,
      simultaneousChanges,
      cognitiveLoadIncrease: Math.min(100, maxChange * simultaneousChanges),
      warnings,
      recommendations
    };
  }

  private static calculateParameterChanges(fromParams: any, toParams: any): Array<{
    parameter: string;
    fromValue: any;
    toValue: any;
    percentIncrease: number;
  }> {
    const changes: Array<{
      parameter: string;
      fromValue: any;
      toValue: any;
      percentIncrease: number;
    }> = [];
    
    // Compare numeric parameters
    const numericParams = ['max_value', 'minuend_max', 'subtrahend_max', 'multiplicand_max', 
                          'multiplier_max', 'dividend_max', 'divisor_max', 'operand_count',
                          'base_value_max', 'whole_value_max'];
    
    for (const param of numericParams) {
      if (fromParams[param] !== undefined && toParams[param] !== undefined) {
        const fromVal = fromParams[param];
        const toVal = toParams[param];
        const percentIncrease = fromVal > 0 ? ((toVal - fromVal) / fromVal) * 100 : 0;
        
        if (percentIncrease > 0) {
          changes.push({
            parameter: param,
            fromValue: fromVal,
            toValue: toVal,
            percentIncrease
          });
        }
      }
    }
    
    return changes;
  }
}