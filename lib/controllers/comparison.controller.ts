// Comparison Controller - Handles "Which is better value?" and comparison questions
// Leverages existing UNIT_RATE and COMPARISON models

import {
  QuestionController,
  GenerationParams,
  ControllerDependencies
} from './base-question.controller';
import {
  QuestionDefinition,
  QuestionFormat,
  QuestionParameters,
  QuestionSolution,
  DistractorContext,
  DistractorStrategy,
  Distractor,
  Answer
} from '@/lib/types/question-formats';

/**
 * Data structure for comparison calculations
 */
interface ComparisonData {
  type: 'unit_rate' | 'direct_value' | 'quantity_comparison';
  options: ComparisonOption[];
  comparisonMetric: string;
  context: string;
}

interface ComparisonOption {
  label: string;
  quantity?: number;
  price?: number;
  value: number;
  unitRate?: number;
  displayText: string;
}

interface ComparisonSolution {
  correctAnswer: Answer;
  winner: {
    index: number;
    label: string;
    advantage: string;
    difference?: number;
  };
}

/**
 * Generates comparison questions like "Which is better value?"
 * Works with UNIT_RATE, COMPARISON, and custom comparison scenarios
 */
export class ComparisonController extends QuestionController {
  constructor(dependencies: ControllerDependencies) {
    super(dependencies);
  }

  async generate(params: GenerationParams): Promise<QuestionDefinition> {
    this.validateParams(params);

    // 1. Generate comparison data using math engine
    const comparisonData = await this.generateComparisonData(params);

    // 2. Select appropriate scenario for comparison
    const scenario = await this.selectScenario(
      QuestionFormat.COMPARISON,
      params.difficulty.year,
      params.preferredTheme
    );

    // 3. Calculate the comparison result
    const solution = this.performComparison(comparisonData);

    // 4. Generate comparison-specific distractors
    const distractors = await this.generateComparisonDistractors(
      solution,
      comparisonData,
      params
    );

    // 5. Create question parameters
    const questionParams = this.createComparisonParameters(comparisonData, scenario);

    // 6. Update solution with distractors
    const completeSolution: QuestionSolution = {
      correctAnswer: solution.correctAnswer,
      distractors,
      explanation: this.generateComparisonExplanation(solution, comparisonData),
      workingSteps: this.generateComparisonSteps(solution, comparisonData),
      solutionStrategy: 'comparison_analysis'
    };

    // 7. Generate comparison-specific question text
    const questionText = this.generateComparisonQuestionText(comparisonData, scenario);

    // 8. Assemble complete question definition
    const baseDefinition = this.createBaseQuestionDefinition(
      QuestionFormat.COMPARISON,
      params.mathModel,
      params.difficulty,
      scenario
    );

    return {
      ...baseDefinition,
      parameters: questionParams,
      questionContent: {
        fullText: questionText,
        components: undefined,
        templateData: {
          character: scenario.characters?.[0]?.name || 'Student',
          optionA: comparisonData.options[0].displayText,
          optionB: comparisonData.options[1].displayText,
          context: comparisonData.context,
          comparisonType: comparisonData.comparisonMetric
        }
      },
      solution: completeSolution
    } as QuestionDefinition;
  }

  /**
   * Generate comparison data using the math engine
   */
  private async generateComparisonData(params: GenerationParams): Promise<ComparisonData> {
    const model = params.mathModel;

    if (model === 'UNIT_RATE') {
      return this.generateUnitRateComparison(params);
    } else if (model === 'COMPARISON') {
      return this.generateDirectComparison(params);
    } else if (['ADDITION', 'MULTIPLICATION', 'PERCENTAGE'].includes(model)) {
      return this.generateCalculationComparison(params);
    } else {
      throw new Error(`Comparison not supported for model: ${model}`);
    }
  }

  /**
   * Generate unit rate comparison (e.g., price per unit)
   */
  private async generateUnitRateComparison(params: GenerationParams): Promise<ComparisonData> {
    // Generate two separate unit rate calculations
    const option1Data = await this.generateMathOutput('UNIT_RATE', {
      ...params.difficultyParams,
      base_quantity: this.generateQuantity(params.difficulty.year),
      target_quantity: 1,
      problem_type: 'find_unit_rate'
    });

    const option2Data = await this.generateMathOutput('UNIT_RATE', {
      ...params.difficultyParams,
      base_quantity: this.generateQuantity(params.difficulty.year),
      target_quantity: 1,
      problem_type: 'find_unit_rate'
    });

    const options: ComparisonOption[] = [
      {
        label: 'Option A',
        quantity: option1Data.base_quantity,
        price: option1Data.base_rate,
        value: option1Data.base_rate,
        unitRate: option1Data.unit_rate,
        displayText: `${option1Data.base_quantity} for £${option1Data.base_rate.toFixed(2)}`
      },
      {
        label: 'Option B',
        quantity: option2Data.base_quantity,
        price: option2Data.base_rate,
        value: option2Data.base_rate,
        unitRate: option2Data.unit_rate,
        displayText: `${option2Data.base_quantity} for £${option2Data.base_rate.toFixed(2)}`
      }
    ];

    return {
      type: 'unit_rate',
      options,
      comparisonMetric: 'price_per_unit',
      context: option1Data.item || 'items'
    };
  }

  /**
   * Generate direct value comparison
   */
  private async generateDirectComparison(params: GenerationParams): Promise<ComparisonData> {
    const comparisonOutput = await this.generateMathOutput('COMPARISON', params.difficultyParams);

    const options: ComparisonOption[] = comparisonOutput.options.map((option: any, index: number) => ({
      label: String.fromCharCode(65 + index), // A, B, C...
      quantity: option.quantity,
      value: option.value,
      displayText: option.quantity
        ? `${option.quantity}ml for £${option.value.toFixed(2)}`
        : `£${option.value.toFixed(2)}`
    }));

    return {
      type: 'direct_value',
      options,
      comparisonMetric: comparisonOutput.comparison_type || 'value',
      context: 'general'
    };
  }

  /**
   * Generate comparison from calculation models
   */
  private async generateCalculationComparison(params: GenerationParams): Promise<ComparisonData> {
    // Generate two calculations with different parameters
    const calc1 = await this.generateMathOutput(params.mathModel, params.difficultyParams);
    const calc2 = await this.generateMathOutput(params.mathModel, {
      ...params.difficultyParams,
      // Slightly modify parameters for variation
      ...(params.mathModel === 'ADDITION' && { operand_count: Math.max(2, (params.difficultyParams?.operand_count || 3) - 1) }),
      ...(params.mathModel === 'MULTIPLICATION' && { multiplier_max: Math.max(5, (params.difficultyParams?.multiplier_max || 10) + 2) })
    });

    const options: ComparisonOption[] = [
      {
        label: 'Option A',
        value: calc1.result || calc1.quotient || calc1.final_result,
        displayText: this.formatCalculationForComparison(calc1, 'A')
      },
      {
        label: 'Option B',
        value: calc2.result || calc2.quotient || calc2.final_result,
        displayText: this.formatCalculationForComparison(calc2, 'B')
      }
    ];

    return {
      type: 'direct_value',
      options,
      comparisonMetric: 'calculated_value',
      context: params.mathModel.toLowerCase()
    };
  }

  /**
   * Perform the comparison and determine the winner
   */
  private performComparison(data: ComparisonData): ComparisonSolution {
    let winnerIndex: number;
    let advantage: string;
    let difference: number | undefined;

    if (data.type === 'unit_rate') {
      // For unit rates, lower is better (better value)
      const rates = data.options.map(opt => opt.unitRate!);
      winnerIndex = rates[0] < rates[1] ? 0 : 1;
      difference = Math.abs(rates[0] - rates[1]);
      advantage = `${this.formatCurrency(difference)} per unit cheaper`;
    } else {
      // For direct comparisons, higher is usually better
      const values = data.options.map(opt => opt.value);
      winnerIndex = values[0] > values[1] ? 0 : 1;
      difference = Math.abs(values[0] - values[1]);
      advantage = `${this.formatCurrency(difference)} more`;
    }

    const winner = data.options[winnerIndex];

    return {
      correctAnswer: {
        value: winnerIndex,
        displayText: `${winner.label} is better value`,
        metadata: {
          winnerIndex,
          difference,
          comparisonType: data.type
        }
      },
      winner: {
        index: winnerIndex,
        label: winner.label,
        advantage,
        difference
      }
    };
  }

  /**
   * Generate comparison-specific distractors
   */
  private async generateComparisonDistractors(
    solution: ComparisonSolution,
    data: ComparisonData,
    params: GenerationParams
  ): Promise<Distractor[]> {
    const distractors: Distractor[] = [];

    // Wrong option selected (most common error)
    const wrongIndex = solution.winner.index === 0 ? 1 : 0;
    const wrongOption = data.options[wrongIndex];
    distractors.push({
      value: wrongIndex,
      displayText: `${wrongOption.label} is better value`,
      strategy: DistractorStrategy.REVERSED_COMPARISON,
      reasoning: data.type === 'unit_rate'
        ? 'Selected the option with higher total price instead of better unit price'
        : 'Selected the option with lower value'
    });

    // They're the same (common misconception)
    distractors.push({
      value: -1,
      displayText: 'Both options are equally good value',
      strategy: DistractorStrategy.WRONG_SELECTION,
      reasoning: 'Failed to calculate the difference correctly'
    });

    // Calculation error in difference
    if (solution.winner.difference) {
      const wrongDiff = solution.winner.difference * 2;
      distractors.push({
        value: solution.winner.index,
        displayText: `${solution.winner.label} saves you ${this.formatCurrency(wrongDiff)}`,
        strategy: DistractorStrategy.CALCULATION_ERROR,
        reasoning: 'Arithmetic error in calculating the difference'
      });
    }

    return distractors;
  }

  /**
   * Create question parameters for comparison
   */
  private createComparisonParameters(data: ComparisonData, scenario: any): QuestionParameters {
    const mathValues: Record<string, number> = {};
    const narrativeValues: Record<string, any> = {};
    const units: Record<string, string> = {};

    // Store comparison data
    data.options.forEach((option, index) => {
      mathValues[`option_${index + 1}_value`] = option.value;
      if (option.quantity) mathValues[`option_${index + 1}_quantity`] = option.quantity;
      if (option.price) mathValues[`option_${index + 1}_price`] = option.price;
      if (option.unitRate) mathValues[`option_${index + 1}_unit_rate`] = option.unitRate;
    });

    // Narrative elements
    narrativeValues.options = data.options.map(opt => opt.displayText);
    narrativeValues.context = data.context;
    narrativeValues.comparison_type = data.comparisonMetric;

    if (scenario.characters && scenario.characters.length > 0) {
      narrativeValues.character = scenario.characters[0].name;
    }

    // Units
    units.currency = '£';
    units.comparison_metric = data.comparisonMetric;

    return {
      mathValues,
      narrativeValues,
      units,
      formatting: {
        currencyFormat: 'symbol',
        decimalPlaces: 2,
        useGroupingSeparators: false,
        unitPosition: 'before'
      }
    };
  }

  /**
   * Generate explanation for the comparison
   */
  private generateComparisonExplanation(solution: ComparisonSolution, data: ComparisonData): string {
    if (data.type === 'unit_rate') {
      const winner = data.options[solution.winner.index];
      const loser = data.options[solution.winner.index === 0 ? 1 : 0];

      return `${winner.label} offers better value. ` +
             `${winner.label} costs ${this.formatCurrency(winner.unitRate!)} per unit, ` +
             `while ${loser.label} costs ${this.formatCurrency(loser.unitRate!)} per unit. ` +
             `${winner.label} is ${this.formatCurrency(Math.abs(winner.unitRate! - loser.unitRate!))} cheaper per unit.`;
    } else {
      const winner = data.options[solution.winner.index];
      return `${winner.label} has the higher value at ${this.formatCurrency(winner.value)}.`;
    }
  }

  /**
   * Generate working steps for comparison
   */
  private generateComparisonSteps(solution: ComparisonSolution, data: ComparisonData): string[] {
    const steps: string[] = [];

    if (data.type === 'unit_rate') {
      data.options.forEach((option, index) => {
        const unitRate = option.price! / option.quantity!;
        steps.push(`${option.label}: £${option.price!.toFixed(2)} ÷ ${option.quantity} = ${this.formatCurrency(unitRate)} per unit`);
      });

      const winner = data.options[solution.winner.index];
      steps.push(`${winner.label} has the lowest price per unit, so it's better value.`);
    } else {
      data.options.forEach((option) => {
        steps.push(`${option.label}: ${this.formatCurrency(option.value)}`);
      });

      const winner = data.options[solution.winner.index];
      steps.push(`${winner.label} has the highest value.`);
    }

    return steps;
  }

  /**
   * Generate appropriate quantities based on year level
   */
  private generateQuantity(year: number): number {
    const ranges = {
      1: [2, 5],
      2: [3, 8],
      3: [4, 10],
      4: [5, 15],
      5: [6, 20],
      6: [8, 25]
    };

    const [min, max] = ranges[year as keyof typeof ranges] || [5, 15];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate comparison-specific question text
   */
  private generateComparisonQuestionText(data: ComparisonData, scenario: any): string {
    const character = scenario.characters?.[0]?.name || 'Sarah';
    const optionA = data.options[0];
    const optionB = data.options[1];

    // Create contextual introduction based on scenario theme
    let contextIntro = `${character} is comparing options to find the best value.`;

    if (scenario.theme === 'shopping' || scenario.theme === 'money') {
      contextIntro = `${character} is shopping and wants to get the best value for money.`;
    } else if (scenario.theme === 'school') {
      contextIntro = `${character} needs to choose the most cost-effective option for school.`;
    } else if (scenario.theme === 'sports') {
      contextIntro = `${character} is comparing sports equipment prices.`;
    }

    // Present the two options clearly
    const optionPresentation = `\n\nOption A: ${optionA.displayText}\nOption B: ${optionB.displayText}`;

    // Ask the comparison question
    let questionPrompt = '\n\nWhich option offers better value?';

    if (data.type === 'unit_rate') {
      questionPrompt = '\n\nWhich option offers better value for money?';
    } else if (data.comparisonMetric === 'calculated_value') {
      questionPrompt = '\n\nWhich calculation gives the higher result?';
    }

    return contextIntro + optionPresentation + questionPrompt;
  }

  /**
   * Format a calculation result for comparison display
   */
  private formatCalculationForComparison(calc: any, label: string): string {
    if (calc.operation === 'ADDITION' && calc.operands) {
      return `${label}: ${calc.operands.join(' + ')} = ${calc.result}`;
    } else if (calc.operation === 'MULTIPLICATION') {
      return `${label}: ${calc.multiplicand} × ${calc.multiplier} = ${calc.result}`;
    } else {
      return `${label}: ${calc.result || calc.quotient || calc.final_result}`;
    }
  }
}