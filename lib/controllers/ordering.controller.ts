// Ordering Controller - Generates ordering and sequencing questions
// "Put these in order from smallest to largest" or "Arrange these numbers"

import {
  QuestionController,
  GenerationParams,
  ControllerDependencies
} from './base-question.controller';
import {
  QuestionDefinition,
  QuestionFormat,
  DistractorStrategy,
  ScenarioTheme
} from '@/lib/types/question-formats';

/**
 * Ordering specific parameters
 */
interface OrderingParams {
  orderDirection: 'ascending' | 'descending' | 'custom';
  orderCriteria: 'value' | 'magnitude' | 'length' | 'weight' | 'time' | 'alphabetical';
  itemCount: number;
  values: number[];
  correctOrder: number[];
  includeEquivalents: boolean;
  mixedTypes?: boolean; // Mix integers, decimals, fractions
}

/**
 * Controller for generating ordering and sequencing questions
 */
export class OrderingController extends QuestionController {

  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  /**
   * Generate ordering question
   */
  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    try {
      // 1. Generate base math content to get number ranges
      const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);

      // 2. Select appropriate scenario
      const scenario = await this.selectScenario({
        theme: params.preferredTheme || ScenarioTheme.CLASSROOM,
        mathModel: params.mathModel,
        difficulty: params.difficulty,
        culturalContext: params.culturalContext
    });

    // 3. Determine ordering parameters
    const orderingParams = this.determineOrderingParams(params.mathModel, mathOutput, params.difficulty);

    // 4. Generate the ordering question
    const questionDef = await this.generateOrderingQuestion(mathOutput, scenario, orderingParams, params);

    return questionDef;
    } catch (error) {
      console.error('OrderingController error:', error);
      // Fallback to simple question format
      return this.generateFallbackQuestion(params);
    }
  }

  /**
   * Generate fallback question if ordering fails
   */
  private async generateFallbackQuestion(params: GenerationParams): Promise<QuestionDefinition> {
    const mathOutput = await this.generateMathOutput(params.mathModel, params.difficultyParams);
    const scenario = await this.selectScenario({
      theme: ScenarioTheme.CLASSROOM,
      mathModel: params.mathModel,
      difficulty: params.difficulty,
      culturalContext: params.culturalContext
    });

    return this.createBaseQuestionDefinition(
      QuestionFormat.ORDERING,
      params.mathModel,
      params.difficulty,
      scenario
    );
  }

  /**
   * Generate complete ordering question
   */
  private async generateOrderingQuestion(
    mathOutput: any,
    scenario: any,
    orderingParams: OrderingParams,
    params: GenerationParams
  ): Promise<QuestionDefinition> {

    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.ORDERING,
      params.mathModel,
      params.difficulty,
      scenario
    );

    // Generate set of values to order
    const valuesToOrder = this.generateValuesToOrder(mathOutput, orderingParams, params.difficulty);

    // Calculate correct ordering
    const correctOrder = this.calculateCorrectOrder(valuesToOrder, orderingParams);

    // Create question text with scenario
    const questionText = this.generateOrderingQuestionText(scenario, valuesToOrder, orderingParams);

    // Generate distractors (incorrect orderings)
    const distractors = await this.generateOrderingDistractors(valuesToOrder, correctOrder, orderingParams);

    return {
      ...baseDefinition,
      parameters: {
        mathValues: mathOutput,
        orderingParams: {
          ...orderingParams,
          values: valuesToOrder,
          correctOrder
        },
        valuesToOrder
      },
      solution: {
        correctAnswer: {
          value: correctOrder,
          displayText: correctOrder.map(index => valuesToOrder[index]).join(', '),
          units: ''
        },
        distractors,
        workingSteps: this.generateOrderingSteps(valuesToOrder, correctOrder, orderingParams),
        explanation: this.generateOrderingExplanation(valuesToOrder, correctOrder, orderingParams)
      }
    } as QuestionDefinition;
  }

  /**
   * Determine ordering parameters based on context
   */
  private determineOrderingParams(mathModel: string, mathOutput: any, difficulty: any): OrderingParams {
    // Determine order direction
    const orderDirection = Math.random() > 0.3 ? 'ascending' : 'descending';

    // Determine criteria based on model
    let orderCriteria: OrderingParams['orderCriteria'];
    if (mathModel.includes('MONEY')) {
      orderCriteria = 'value';
    } else if (mathModel.includes('TIME')) {
      orderCriteria = 'time';
    } else if (mathModel.includes('MEASUREMENT') || mathModel.includes('LENGTH')) {
      orderCriteria = 'length';
    } else {
      orderCriteria = 'value';
    }

    // Determine item count based on difficulty
    let itemCount = 3; // Default
    if (difficulty.year <= 2) {
      itemCount = 3;
    } else if (difficulty.year <= 4) {
      itemCount = Math.random() > 0.5 ? 4 : 5;
    } else {
      itemCount = Math.floor(Math.random() * 3) + 4; // 4-6 items
    }

    return {
      orderDirection,
      orderCriteria,
      itemCount,
      values: [],
      correctOrder: [],
      includeEquivalents: difficulty.year >= 4 && Math.random() > 0.7,
      mixedTypes: difficulty.year >= 5 && Math.random() > 0.8
    };
  }

  /**
   * Generate set of values to order
   */
  private generateValuesToOrder(mathOutput: any, orderingParams: OrderingParams, difficulty: any): number[] {
    const values = [];
    const baseRange = this.getBaseRange(mathOutput, difficulty);

    // Generate distinct values for ordering
    for (let i = 0; i < orderingParams.itemCount; i++) {
      let newValue;
      let attempts = 0;

      do {
        newValue = this.generateValueInRange(baseRange, orderingParams, i);
        attempts++;
      } while (values.includes(newValue) && attempts < 10);

      values.push(newValue);
    }

    // If including equivalents, replace one value with equivalent form
    if (orderingParams.includeEquivalents && values.length > 3) {
      const replaceIndex = Math.floor(Math.random() * values.length);
      values[replaceIndex] = this.createEquivalentForm(values[replaceIndex], difficulty.year);
    }

    // Shuffle the values so they're not already in order
    return this.shuffleArray(values);
  }

  /**
   * Get base range for values
   */
  private getBaseRange(mathOutput: any, difficulty: any): { min: number, max: number } {
    const result = mathOutput.result || mathOutput.answer || 100;

    if (difficulty.year <= 2) {
      return { min: 1, max: 20 };
    } else if (difficulty.year <= 4) {
      return { min: 1, max: Math.min(100, result * 2) };
    } else {
      return { min: 1, max: Math.min(1000, result * 3) };
    }
  }

  /**
   * Generate value within range
   */
  private generateValueInRange(range: { min: number, max: number }, orderingParams: OrderingParams, index: number): number {
    if (orderingParams.mixedTypes && Math.random() > 0.7) {
      // Generate decimal
      const wholepart = Math.floor(Math.random() * (range.max - range.min)) + range.min;
      const decimal = Math.floor(Math.random() * 9) + 1;
      return parseFloat(`${wholepart}.${decimal}`);
    }

    // Generate integer
    return Math.floor(Math.random() * (range.max - range.min)) + range.min;
  }

  /**
   * Create equivalent form (like 0.5 for 1/2)
   */
  private createEquivalentForm(value: number, year: number): number {
    if (year >= 4 && Number.isInteger(value)) {
      // Convert some integers to decimals
      if (value % 2 === 0) {
        return value + 0.5;
      } else if (value % 4 === 0) {
        return value + 0.25;
      }
    }

    return value; // Return as-is if no conversion
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray(array: number[]): number[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calculate correct order
   */
  private calculateCorrectOrder(values: number[], orderingParams: OrderingParams): number[] {
    const indexed = values.map((value, index) => ({ value, index }));

    switch (orderingParams.orderDirection) {
      case 'ascending':
        indexed.sort((a, b) => a.value - b.value);
        break;
      case 'descending':
        indexed.sort((a, b) => b.value - a.value);
        break;
      default:
        indexed.sort((a, b) => a.value - b.value);
    }

    return indexed.map(item => item.index);
  }

  /**
   * Generate question text with scenario
   */
  private generateOrderingQuestionText(scenario: any, values: number[], orderingParams: OrderingParams): string {
    const character = scenario.characters[0].name;
    const direction = orderingParams.orderDirection === 'ascending' ? 'smallest to largest' : 'largest to smallest';
    const valuesText = values.join(', ');

    // Customize based on scenario theme and criteria
    switch (scenario.theme) {
      case 'SHOPPING':
        if (orderingParams.orderCriteria === 'value') {
          return `${character} is comparing prices: ${valuesText} pence. Arrange these prices from ${direction}.`;
        }
        break;

      case 'SPORTS':
        return `${character} recorded these scores: ${valuesText}. Put them in order from ${direction}.`;

      case 'CLASSROOM':
        return `${character} has these numbers on the board: ${valuesText}. Help arrange them from ${direction}.`;

      case 'REAL_WORLD':
        if (orderingParams.orderCriteria === 'length') {
          return `${character} measured these lengths: ${values.map(v => v + 'cm').join(', ')}. Order them from ${direction}.`;
        }
        if (orderingParams.orderCriteria === 'weight') {
          return `${character} weighed these items: ${values.map(v => v + 'g').join(', ')}. Arrange by weight from ${direction}.`;
        }
        break;

      default:
        return `${character} needs to order these numbers from ${direction}: ${valuesText}`;
    }

    return `${character} needs to order these numbers from ${direction}: ${valuesText}`;
  }

  /**
   * Generate working steps for solution
   */
  private generateOrderingSteps(values: number[], correctOrder: number[], orderingParams: OrderingParams): string[] {
    const steps = [];
    const direction = orderingParams.orderDirection === 'ascending' ? 'smallest to largest' : 'largest to smallest';

    steps.push(`Original numbers: ${values.join(', ')}`);
    steps.push(`We need to arrange from ${direction}`);

    // Show comparison process
    if (values.length <= 4) {
      steps.push(`Compare each number with the others`);
      const sortedValues = values.map((v, i) => ({ value: v, index: i }))
        .sort((a, b) => orderingParams.orderDirection === 'ascending' ? a.value - b.value : b.value - a.value)
        .map(item => item.value);

      steps.push(`Sorted order: ${sortedValues.join(', ')}`);
    } else {
      steps.push(`Find the ${orderingParams.orderDirection === 'ascending' ? 'smallest' : 'largest'} number first`);
      steps.push(`Continue until all numbers are ordered`);
    }

    return steps;
  }

  /**
   * Generate explanation
   */
  private generateOrderingExplanation(values: number[], correctOrder: number[], orderingParams: OrderingParams): string {
    const sortedValues = correctOrder.map(index => values[index]);
    const direction = orderingParams.orderDirection === 'ascending' ? 'smallest to largest' : 'largest to smallest';

    return `When arranged from ${direction}, the correct order is: ${sortedValues.join(', ')}.`;
  }

  /**
   * Generate distractors (incorrect orderings)
   */
  private async generateOrderingDistractors(values: number[], correctOrder: number[], orderingParams: OrderingParams): Promise<any[]> {
    const distractors = [];
    const correctSorted = correctOrder.map(index => values[index]);

    // Common ordering errors:

    // 1. Reverse order
    const reverseOrder = [...correctOrder].reverse();
    const reverseSorted = reverseOrder.map(index => values[index]);
    if (JSON.stringify(reverseSorted) !== JSON.stringify(correctSorted)) {
      distractors.push({
        value: reverseSorted,
        strategy: DistractorStrategy.LOGICAL_OPPOSITE,
        rationale: 'Ordered in opposite direction'
      });
    }

    // 2. Partially correct (first few right, rest wrong)
    if (correctOrder.length > 3) {
      const partialOrder = [...correctOrder];
      // Swap last two elements
      [partialOrder[partialOrder.length - 1], partialOrder[partialOrder.length - 2]] =
      [partialOrder[partialOrder.length - 2], partialOrder[partialOrder.length - 1]];

      const partialSorted = partialOrder.map(index => values[index]);
      distractors.push({
        value: partialSorted,
        strategy: DistractorStrategy.PARTIAL_UNDERSTANDING,
        rationale: 'Partially correct ordering'
      });
    }

    // 3. Random/original order
    if (JSON.stringify(values) !== JSON.stringify(correctSorted)) {
      distractors.push({
        value: values,
        strategy: DistractorStrategy.NO_ATTEMPT,
        rationale: 'Original unsorted order'
      });
    }

    // 4. Nearly correct (one element out of place)
    if (correctOrder.length >= 4) {
      const nearlyCorrect = [...correctOrder];
      const swapIndex = Math.floor(Math.random() * (nearlyCorrect.length - 1));
      [nearlyCorrect[swapIndex], nearlyCorrect[swapIndex + 1]] =
      [nearlyCorrect[swapIndex + 1], nearlyCorrect[swapIndex]];

      const nearlySorted = nearlyCorrect.map(index => values[index]);
      if (JSON.stringify(nearlySorted) !== JSON.stringify(correctSorted)) {
        distractors.push({
          value: nearlySorted,
          strategy: DistractorStrategy.CLOSE_BUT_WRONG,
          rationale: 'One element out of place'
        });
      }
    }

    return distractors.slice(0, 3);
  }
}