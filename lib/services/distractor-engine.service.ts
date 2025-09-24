// Enhanced Distractor Engine - Generates pedagogically sound wrong answers
// Uses strategy-based approach with misconception library

import {
  DistractorStrategy,
  DistractorRule,
  DistractorGenerator,
  DistractorContext,
  Distractor,
  MisconceptionLibrary,
  QuestionFormat
} from '@/lib/types/question-formats';

/**
 * Enhanced distractor generation engine that creates pedagogically meaningful wrong answers
 * Based on common student misconceptions and error patterns
 */
export class DistractorEngine {
  private strategies: Map<DistractorStrategy, DistractorRule>;
  private misconceptionLibrary: MisconceptionLibrary;

  constructor() {
    this.strategies = new Map();
    this.misconceptionLibrary = {
      byModel: {},
      byYear: {},
      byTopic: {}
    };

    this.initializeStrategies();
    this.loadMisconceptionLibrary();
  }

  /**
   * Generate distractors for a given correct answer and context
   */
  async generate(
    correctAnswer: any,
    context: DistractorContext,
    count: number = 3
  ): Promise<Distractor[]> {
    // 1. Select applicable strategies based on context
    const applicableStrategies = this.selectStrategies(context);

    // 2. Generate distractor candidates from multiple strategies
    const candidates: Distractor[] = [];
    for (const strategy of applicableStrategies) {
      try {
        const distractors = strategy.generator(correctAnswer, context);
        candidates.push(...distractors);
      } catch (error) {
        console.warn(`Failed to generate distractors for strategy ${strategy.strategy}:`, error);
      }
    }

    // 3. Filter and select best distractors
    return this.selectBestDistractors(candidates, correctAnswer, count);
  }

  /**
   * Select applicable distractor strategies based on context
   */
  private selectStrategies(context: DistractorContext): DistractorRule[] {
    return Array.from(this.strategies.values())
      .filter(rule =>
        rule.applicableFormats.includes(context.format) &&
        (rule.applicableModels.length === 0 ||
         rule.applicableModels.includes(context.mathModel))
      )
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 8); // Limit to top 8 strategies to avoid overgeneration
  }

  /**
   * Select the best distractors from candidates
   */
  private selectBestDistractors(
    candidates: Distractor[],
    correctAnswer: any,
    count: number
  ): Distractor[] {
    // Remove duplicates
    const unique = this.removeDuplicates(candidates);

    // Remove distractors too similar to correct answer
    const filtered = unique.filter(d =>
      !this.tooSimilar(d.value, correctAnswer)
    );

    // Prioritize by strategy diversity and pedagogical value
    const diverse = this.ensureStrategyDiversity(filtered);

    // Return requested count
    return diverse.slice(0, count);
  }

  /**
   * Initialize distractor generation strategies
   */
  private initializeStrategies(): void {
    // Wrong Operation Strategy
    this.strategies.set(DistractorStrategy.WRONG_OPERATION, {
      strategy: DistractorStrategy.WRONG_OPERATION,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION'],
      generator: this.createWrongOperationGenerator(),
      probability: 0.8
    });

    // Place Value Error Strategy
    this.strategies.set(DistractorStrategy.PLACE_VALUE_ERROR, {
      strategy: DistractorStrategy.PLACE_VALUE_ERROR,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION'],
      generator: this.createPlaceValueErrorGenerator(),
      probability: 0.7
    });

    // Partial Calculation Strategy
    this.strategies.set(DistractorStrategy.PARTIAL_CALCULATION, {
      strategy: DistractorStrategy.PARTIAL_CALCULATION,
      applicableFormats: [QuestionFormat.MULTI_STEP, QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['MULTI_STEP', 'ADDITION', 'MULTIPLICATION'],
      generator: this.createPartialCalculationGenerator(),
      probability: 0.6
    });

    // Unit Confusion Strategy
    this.strategies.set(DistractorStrategy.UNIT_CONFUSION, {
      strategy: DistractorStrategy.UNIT_CONFUSION,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.COMPARISON],
      applicableModels: ['PERCENTAGE', 'UNIT_RATE', 'CONVERSION'],
      generator: this.createUnitConfusionGenerator(),
      probability: 0.9
    });

    // Reversed Comparison Strategy
    this.strategies.set(DistractorStrategy.REVERSED_COMPARISON, {
      strategy: DistractorStrategy.REVERSED_COMPARISON,
      applicableFormats: [QuestionFormat.COMPARISON],
      applicableModels: ['COMPARISON', 'UNIT_RATE'],
      generator: this.createReversedComparisonGenerator(),
      probability: 0.8
    });

    // Close Value Strategy
    this.strategies.set(DistractorStrategy.CLOSE_VALUE, {
      strategy: DistractorStrategy.CLOSE_VALUE,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.ESTIMATION],
      applicableModels: [],
      generator: this.createCloseValueGenerator(),
      probability: 0.5
    });

    // Off by Magnitude Strategy
    this.strategies.set(DistractorStrategy.OFF_BY_MAGNITUDE, {
      strategy: DistractorStrategy.OFF_BY_MAGNITUDE,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION],
      applicableModels: ['MULTIPLICATION', 'DIVISION', 'PERCENTAGE'],
      generator: this.createOffByMagnitudeGenerator(),
      probability: 0.6
    });

    // Common Misconception Strategy
    this.strategies.set(DistractorStrategy.COMMON_MISCONCEPTION, {
      strategy: DistractorStrategy.COMMON_MISCONCEPTION,
      applicableFormats: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.COMPARISON],
      applicableModels: [],
      generator: this.createMisconceptionGenerator(),
      probability: 0.9
    });
  }

  /**
   * Create wrong operation distractor generator
   */
  private createWrongOperationGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      if (!context.operands || context.operands.length < 2) {
        return distractors;
      }

      const [a, b] = context.operands;

      switch (context.operation) {
        case 'ADDITION':
          if (a - b > 0 && a - b !== correct) {
            distractors.push({
              value: a - b,
              displayText: String(a - b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Subtracted instead of adding'
            });
          }
          if (a * b !== correct) {
            distractors.push({
              value: a * b,
              displayText: String(a * b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Multiplied instead of adding'
            });
          }
          break;

        case 'SUBTRACTION':
          if (a + b !== correct) {
            distractors.push({
              value: a + b,
              displayText: String(a + b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Added instead of subtracting'
            });
          }
          break;

        case 'MULTIPLICATION':
          if (a + b !== correct) {
            distractors.push({
              value: a + b,
              displayText: String(a + b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Added instead of multiplying'
            });
          }
          if (a - b > 0 && a - b !== correct) {
            distractors.push({
              value: a - b,
              displayText: String(a - b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Subtracted instead of multiplying'
            });
          }
          break;

        case 'DIVISION':
          if (a - b > 0 && a - b !== correct) {
            distractors.push({
              value: a - b,
              displayText: String(a - b),
              strategy: DistractorStrategy.WRONG_OPERATION,
              reasoning: 'Subtracted instead of dividing'
            });
          }
          break;
      }

      return distractors;
    };
  }

  /**
   * Create place value error distractor generator
   */
  private createPlaceValueErrorGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      if (correct < 10) return distractors; // Not applicable to single digits

      const magnitude = Math.pow(10, Math.floor(Math.log10(correct)));

      // Carry error - off by one magnitude
      const carryError = correct + magnitude;
      if (carryError !== correct) {
        distractors.push({
          value: carryError,
          displayText: String(carryError),
          strategy: DistractorStrategy.PLACE_VALUE_ERROR,
          reasoning: 'Error in carrying to next column'
        });
      }

      // Forget to carry
      const forgetCarry = correct - magnitude / 10;
      if (forgetCarry > 0 && forgetCarry !== correct) {
        distractors.push({
          value: forgetCarry,
          displayText: String(forgetCarry),
          strategy: DistractorStrategy.PLACE_VALUE_ERROR,
          reasoning: 'Forgot to carry'
        });
      }

      return distractors;
    };
  }

  /**
   * Create partial calculation distractor generator
   */
  private createPartialCalculationGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      if (context.operands && context.operands.length > 2) {
        // Stopped after first two operands
        const [a, b] = context.operands;
        let partial: number;

        switch (context.operation) {
          case 'ADDITION':
            partial = a + b;
            break;
          case 'MULTIPLICATION':
            partial = a * b;
            break;
          default:
            return distractors;
        }

        if (partial !== correct) {
          distractors.push({
            value: partial,
            displayText: String(partial),
            strategy: DistractorStrategy.PARTIAL_CALCULATION,
            reasoning: 'Stopped calculation early'
          });
        }
      }

      return distractors;
    };
  }

  /**
   * Create unit confusion distractor generator
   */
  private createUnitConfusionGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      if (context.mathModel === 'PERCENTAGE' && context.operands) {
        const [base, percent] = context.operands;

        // Forgot to divide by 100
        const wrongMultiply = base * percent;
        if (wrongMultiply !== correct) {
          distractors.push({
            value: wrongMultiply,
            displayText: String(wrongMultiply),
            strategy: DistractorStrategy.UNIT_CONFUSION,
            reasoning: 'Multiplied by percentage without converting to decimal'
          });
        }

        // Added percentage as absolute value
        const wrongAdd = base + percent;
        if (wrongAdd !== correct) {
          distractors.push({
            value: wrongAdd,
            displayText: String(wrongAdd),
            strategy: DistractorStrategy.UNIT_CONFUSION,
            reasoning: 'Added percentage as absolute value'
          });
        }
      }

      return distractors;
    };
  }

  /**
   * Create reversed comparison distractor generator
   */
  private createReversedComparisonGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      // For comparison questions, the opposite choice is always a valid distractor
      const oppositeChoice = correct === 0 ? 1 : 0;

      distractors.push({
        value: oppositeChoice,
        displayText: `Option ${String.fromCharCode(65 + oppositeChoice)}`,
        strategy: DistractorStrategy.REVERSED_COMPARISON,
        reasoning: 'Selected the worse option'
      });

      return distractors;
    };
  }

  /**
   * Create close value distractor generator
   */
  private createCloseValueGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      // Generate values close to the correct answer
      const variations = [1, -1, 2, -2, 5, -5, 10, -10];

      for (const variation of variations) {
        const candidate = correct + variation;
        if (candidate > 0 && candidate !== correct) {
          distractors.push({
            value: candidate,
            displayText: String(candidate),
            strategy: DistractorStrategy.CLOSE_VALUE,
            reasoning: `Off by ${Math.abs(variation)}`
          });

          if (distractors.length >= 3) break;
        }
      }

      return distractors;
    };
  }

  /**
   * Create off by magnitude distractor generator
   */
  private createOffByMagnitudeGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      if (correct >= 10) {
        // Off by factor of 10
        const tenTimes = correct * 10;
        const tenthOf = correct / 10;

        if (tenthOf >= 1 && tenthOf !== correct) {
          distractors.push({
            value: tenthOf,
            displayText: String(tenthOf),
            strategy: DistractorStrategy.OFF_BY_MAGNITUDE,
            reasoning: 'Result is 10 times too small'
          });
        }

        if (tenTimes !== correct) {
          distractors.push({
            value: tenTimes,
            displayText: String(tenTimes),
            strategy: DistractorStrategy.OFF_BY_MAGNITUDE,
            reasoning: 'Result is 10 times too large'
          });
        }
      }

      return distractors;
    };
  }

  /**
   * Create misconception-based distractor generator
   */
  private createMisconceptionGenerator(): DistractorGenerator {
    return (correct: number, context: DistractorContext): Distractor[] => {
      const distractors: Distractor[] = [];

      // Get misconceptions for this model and year level
      const modelMisconceptions = this.misconceptionLibrary.byModel[context.mathModel] || [];
      const yearMisconceptions = this.misconceptionLibrary.byYear[context.yearLevel] || [];

      const applicable = [...modelMisconceptions, ...yearMisconceptions]
        .filter(m =>
          m.yearRange.min <= context.yearLevel &&
          m.yearRange.max >= context.yearLevel
        );

      for (const misconception of applicable.slice(0, 2)) {
        try {
          const generated = misconception.generateDistractor(correct, context);
          distractors.push(...generated);
        } catch (error) {
          console.warn(`Failed to generate distractor for misconception ${misconception.id}:`, error);
        }
      }

      return distractors;
    };
  }

  /**
   * Load the misconception library with common student errors
   */
  private loadMisconceptionLibrary(): void {
    // Addition misconceptions
    this.misconceptionLibrary.byModel['ADDITION'] = [
      {
        id: 'add-001-no-carry',
        description: 'Forgets to carry when adding columns',
        example: '47 + 38 = 75 (instead of 85)',
        generateDistractor: (correct: number, context: DistractorContext): Distractor[] => {
          if (context.operands && context.operands.length === 2) {
            const [a, b] = context.operands;
            const wrongResult = this.simulateNoCarryAddition(a, b);
            if (wrongResult !== correct) {
              return [{
                value: wrongResult,
                displayText: String(wrongResult),
                strategy: DistractorStrategy.COMMON_MISCONCEPTION,
                reasoning: 'Forgot to carry when adding'
              }];
            }
          }
          return [];
        },
        prevalence: 'common',
        yearRange: { min: 2, max: 4 }
      }
    ];

    // Multiplication misconceptions
    this.misconceptionLibrary.byModel['MULTIPLICATION'] = [
      {
        id: 'mult-001-zero-property',
        description: 'Believes any number times zero equals the number',
        example: '5 × 0 = 5 (instead of 0)',
        generateDistractor: (correct: number, context: DistractorContext): Distractor[] => {
          if (context.operands && context.operands.includes(0)) {
            const nonZero = context.operands.find(n => n !== 0);
            if (nonZero && nonZero !== correct) {
              return [{
                value: nonZero,
                displayText: String(nonZero),
                strategy: DistractorStrategy.COMMON_MISCONCEPTION,
                reasoning: 'Incorrectly applied zero property'
              }];
            }
          }
          return [];
        },
        prevalence: 'common',
        yearRange: { min: 2, max: 5 }
      }
    ];

    // Add year-based misconceptions
    this.misconceptionLibrary.byYear[2] = [
      {
        id: 'year2-001-counting-on',
        description: 'Counts on from first number instead of using efficient strategy',
        example: '8 + 5: counts 9, 10, 11, 12, 13 instead of using known facts',
        generateDistractor: (correct: number, context: DistractorContext): Distractor[] => {
          // Generate counting errors
          return [{
            value: correct - 1,
            displayText: String(correct - 1),
            strategy: DistractorStrategy.COMMON_MISCONCEPTION,
            reasoning: 'Counting error'
          }];
        },
        prevalence: 'common',
        yearRange: { min: 1, max: 3 }
      }
    ];
  }

  /**
   * Simulate addition without carrying (common error)
   */
  private simulateNoCarryAddition(a: number, b: number): number {
    const aStr = a.toString();
    const bStr = b.toString();
    const maxLength = Math.max(aStr.length, bStr.length);

    let result = '';
    for (let i = 0; i < maxLength; i++) {
      const digitA = parseInt(aStr[aStr.length - 1 - i] || '0');
      const digitB = parseInt(bStr[bStr.length - 1 - i] || '0');
      const sum = digitA + digitB;
      result = (sum % 10) + result; // No carrying
    }

    return parseInt(result);
  }

  /**
   * Remove duplicate distractors
   */
  private removeDuplicates(distractors: Distractor[]): Distractor[] {
    const seen = new Set<any>();
    return distractors.filter(d => {
      if (seen.has(d.value)) {
        return false;
      }
      seen.add(d.value);
      return true;
    });
  }

  /**
   * Check if distractor value is too similar to correct answer
   */
  private tooSimilar(distractorValue: any, correctValue: any): boolean {
    if (typeof distractorValue === 'number' && typeof correctValue === 'number') {
      // Too similar if within 5% or difference is less than 1
      const difference = Math.abs(distractorValue - correctValue);
      const percentDifference = difference / Math.abs(correctValue);
      return difference < 1 || percentDifference < 0.05;
    }

    return distractorValue === correctValue;
  }

  /**
   * Ensure diversity in distractor strategies
   */
  private ensureStrategyDiversity(distractors: Distractor[]): Distractor[] {
    const strategyCounts = new Map<DistractorStrategy, number>();
    const diverse: Distractor[] = [];

    // Sort by pedagogical value (prioritize common misconceptions)
    const sorted = distractors.sort((a, b) => {
      const priorityOrder = [
        DistractorStrategy.COMMON_MISCONCEPTION,
        DistractorStrategy.WRONG_OPERATION,
        DistractorStrategy.UNIT_CONFUSION,
        DistractorStrategy.REVERSED_COMPARISON,
        DistractorStrategy.PLACE_VALUE_ERROR,
        DistractorStrategy.PARTIAL_CALCULATION,
        DistractorStrategy.CLOSE_VALUE,
        DistractorStrategy.OFF_BY_MAGNITUDE
      ];

      return priorityOrder.indexOf(a.strategy) - priorityOrder.indexOf(b.strategy);
    });

    for (const distractor of sorted) {
      const count = strategyCounts.get(distractor.strategy) || 0;
      if (count < 2) { // Max 2 per strategy
        diverse.push(distractor);
        strategyCounts.set(distractor.strategy, count + 1);
      }
    }

    return diverse;
  }
}