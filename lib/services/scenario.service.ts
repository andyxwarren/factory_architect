// Scenario Service - Provides rich contextual scenarios for question generation
// Expands beyond existing MoneyContextGenerator with diverse themes

import {
  ScenarioContext,
  ScenarioTheme,
  ScenarioCriteria,
  ScoredScenario,
  QuestionFormat,
  ScenarioSetting,
  Character,
  ContextItem,
  ItemCategory,
  CulturalElement,
  ScenarioTemplate,
  PlaceholderDefinition
} from '@/lib/types/question-formats';

/**
 * Enhanced scenario service that provides rich, diverse contexts for questions
 * Maintains compatibility with existing MoneyContextGenerator while adding new themes
 */
export class ScenarioService {
  private scenarios: Map<string, ScenarioContext>;
  private themeIndex: Map<ScenarioTheme, string[]>;
  private recentlyUsed: Set<string>;
  private recentlyUsedMaxSize = 20;

  constructor() {
    this.scenarios = new Map();
    this.themeIndex = new Map();
    this.recentlyUsed = new Set();

    this.initializeScenarios();
    this.buildThemeIndex();
  }

  /**
   * Select the best scenario for given criteria
   */
  async selectScenario(criteria: ScenarioCriteria): Promise<ScenarioContext> {
    // 1. Filter by format compatibility
    let candidates = this.filterByFormat(criteria.format);

    // 2. Filter by year appropriateness
    candidates = this.filterByYear(candidates, criteria.yearLevel);

    // 3. Filter by theme if specified
    if (criteria.theme) {
      candidates = this.filterByTheme(candidates, criteria.theme);
    }

    // 4. If no candidates found, generate dynamic scenario
    if (candidates.length === 0) {
      if (criteria.theme) {
        return this.generateDynamicScenario(criteria.theme, criteria.yearLevel);
      } else {
        // Fall back to a default scenario
        return this.getDefaultScenario(criteria.yearLevel);
      }
    }

    // 5. Score and rank candidates
    const scored = this.scoreScenarios(candidates, criteria);

    // 6. Select best match with some randomization
    return this.selectWithRandomization(scored);
  }

  /**
   * Generate a dynamic scenario for themes with procedural generation
   */
  async generateDynamicScenario(
    theme: ScenarioTheme,
    yearLevel: number
  ): Promise<ScenarioContext> {
    switch (theme) {
      case ScenarioTheme.POCKET_MONEY:
        return this.generatePocketMoneyScenario(yearLevel);
      case ScenarioTheme.SCHOOL:
        return this.generateSchoolScenario(yearLevel);
      case ScenarioTheme.SPORTS:
        return this.generateSportsScenario(yearLevel);
      case ScenarioTheme.COOKING:
        return this.generateCookingScenario(yearLevel);
      default:
        return this.getDefaultScenario(yearLevel);
    }
  }

  /**
   * Filter scenarios by format compatibility
   */
  private filterByFormat(format: QuestionFormat): ScenarioContext[] {
    return Array.from(this.scenarios.values()).filter(scenario =>
      scenario.templates.some(template =>
        template.formatCompatibility.includes(format)
      )
    );
  }

  /**
   * Filter scenarios by year appropriateness
   */
  private filterByYear(scenarios: ScenarioContext[], yearLevel: number): ScenarioContext[] {
    return scenarios.filter(scenario =>
      scenario.yearAppropriate.includes(yearLevel)
    );
  }

  /**
   * Filter scenarios by theme
   */
  private filterByTheme(scenarios: ScenarioContext[], theme: ScenarioTheme): ScenarioContext[] {
    return scenarios.filter(scenario => scenario.theme === theme);
  }

  /**
   * Score scenarios based on various criteria
   */
  private scoreScenarios(
    scenarios: ScenarioContext[],
    criteria: ScenarioCriteria
  ): ScoredScenario[] {
    return scenarios.map(scenario => {
      let score = 0;

      // Cultural relevance (UK specific)
      if (scenario.culturalElements.some(e => e.type === 'currency' && e.value === '£')) {
        score += 10;
      }

      // Real-world connection strength
      if (scenario.realWorldConnection) {
        score += 15;
      }

      // Variety bonus (if not recently used)
      if (!this.recentlyUsed.has(scenario.id)) {
        score += 20;
      }

      // Year alignment (closer to target year gets higher score)
      const yearDistance = Math.abs(
        scenario.yearAppropriate[0] - criteria.yearLevel
      );
      score -= yearDistance * 5;

      // Theme preference bonus
      if (criteria.theme && scenario.theme === criteria.theme) {
        score += 25;
      }

      return { scenario, score };
    });
  }

  /**
   * Select scenario with weighted randomization
   */
  private selectWithRandomization(scored: ScoredScenario[]): ScenarioContext {
    // Sort by score
    const sorted = scored.sort((a, b) => b.score - a.score);

    // Use weighted selection from top 3 candidates
    const topCandidates = sorted.slice(0, 3);
    const totalScore = topCandidates.reduce((sum, s) => sum + Math.max(1, s.score), 0);

    let random = Math.random() * totalScore;
    for (const candidate of topCandidates) {
      random -= Math.max(1, candidate.score);
      if (random <= 0) {
        this.markAsRecentlyUsed(candidate.scenario.id);
        return candidate.scenario;
      }
    }

    // Fallback to first candidate
    const selected = sorted[0].scenario;
    this.markAsRecentlyUsed(selected.id);
    return selected;
  }

  /**
   * Mark scenario as recently used
   */
  private markAsRecentlyUsed(scenarioId: string): void {
    this.recentlyUsed.add(scenarioId);
    if (this.recentlyUsed.size > this.recentlyUsedMaxSize) {
      const first = this.recentlyUsed.values().next().value;
      if (first) {
        this.recentlyUsed.delete(first);
      }
    }
  }

  /**
   * Generate pocket money scenario dynamically
   */
  private generatePocketMoneyScenario(year: number): ScenarioContext {
    const weeklyAmounts = {
      1: { min: 1, max: 2 },
      2: { min: 2, max: 3 },
      3: { min: 3, max: 5 },
      4: { min: 5, max: 7 },
      5: { min: 7, max: 10 },
      6: { min: 10, max: 15 }
    };

    const savingGoals = {
      1: ['toy', 'book', 'sweets'],
      2: ['game', 'toy', 'book'],
      3: ['video game', 'board game', 'sports equipment'],
      4: ['video game', 'clothes', 'hobby supplies'],
      5: ['phone case', 'headphones', 'games'],
      6: ['concert ticket', 'sports equipment', 'tech gadget']
    };

    const amount = weeklyAmounts[year as keyof typeof weeklyAmounts] || weeklyAmounts[3];
    const goals = savingGoals[year as keyof typeof savingGoals] || savingGoals[3];

    return {
      id: `pocket-money-${year}-${Date.now()}`,
      theme: ScenarioTheme.POCKET_MONEY,
      setting: {
        location: 'home',
        timeContext: 'weekly',
        atmosphere: 'planning'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' }
      ],
      items: goals.map(goal => ({
        name: goal,
        category: ItemCategory.SAVING_GOAL,
        typicalValue: {
          min: amount.min * 4,
          max: amount.max * 8,
          typical: amount.max * 5,
          distribution: 'normal' as const
        },
        unit: '£',
        attributes: {
          quality: 'standard' as const
        }
      })),
      culturalElements: [
        {
          type: 'currency' as const,
          value: '£',
          explanation: 'British pounds'
        },
        {
          type: 'custom' as const,
          value: 'pocket money',
          explanation: 'Weekly allowance for children'
        }
      ],
      realWorldConnection: 'Learning to save and budget money',
      yearAppropriate: [year],
      templates: [
        {
          formatCompatibility: [QuestionFormat.ESTIMATION, QuestionFormat.MULTI_STEP],
          template: 'If {character} gets {amount} pocket money each week, how many weeks will it take to save for a {item} that costs {price}?',
          answerTemplate: 'It will take {result} weeks',
          placeholders: [
            { key: 'character', type: 'character' as const },
            { key: 'amount', type: 'value' as const },
            { key: 'item', type: 'item' as const },
            { key: 'price', type: 'value' as const }
          ]
        }
      ]
    };
  }

  /**
   * Generate school scenario dynamically
   */
  private generateSchoolScenario(year: number): ScenarioContext {
    const schoolItems = {
      1: ['pencil', 'rubber', 'ruler', 'colouring pencil'],
      2: ['exercise book', 'pencil case', 'glue stick', 'scissors'],
      3: ['calculator', 'compass', 'protractor', 'highlighter'],
      4: ['folder', 'dividers', 'hole punch', 'stapler'],
      5: ['textbook', 'revision guide', 'ring binder', 'index cards'],
      6: ['laptop case', 'USB stick', 'planner', 'scientific calculator']
    };

    const items = schoolItems[year as keyof typeof schoolItems] || schoolItems[3];

    return {
      id: `school-${year}-${Date.now()}`,
      theme: ScenarioTheme.SCHOOL,
      setting: {
        location: 'school stationery shop',
        timeContext: 'start of term',
        atmosphere: 'busy'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' },
        { name: 'Mrs. Thompson', role: 'teacher' }
      ],
      items: items.map(item => ({
        name: item,
        category: ItemCategory.SCHOOL_SUPPLIES,
        typicalValue: {
          min: 0.50,
          max: 15.00,
          typical: 3.00,
          distribution: 'skewed_low' as const
        },
        unit: '£',
        attributes: {
          quality: 'standard' as const
        }
      })),
      culturalElements: [
        {
          type: 'currency' as const,
          value: '£',
          explanation: 'British pounds'
        },
        {
          type: 'event' as const,
          value: 'start of term',
          explanation: 'When students buy school supplies'
        }
      ],
      realWorldConnection: 'Budgeting for school supplies',
      yearAppropriate: [year],
      templates: [
        {
          formatCompatibility: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.COMPARISON],
          template: '{character} needs to buy {items} for school. How much will it cost in total?',
          answerTemplate: 'The total cost is {result}',
          placeholders: [
            { key: 'character', type: 'character' as const },
            { key: 'items', type: 'item' as const },
            { key: 'result', type: 'value' as const }
          ]
        }
      ]
    };
  }

  /**
   * Generate sports scenario dynamically
   */
  private generateSportsScenario(year: number): ScenarioContext {
    const sportsEquipment = ['football', 'tennis ball', 'cricket bat', 'rugby ball', 'basketball'];
    const venues = ['sports shop', 'leisure centre', 'school sports hall'];

    return {
      id: `sports-${year}-${Date.now()}`,
      theme: ScenarioTheme.SPORTS,
      setting: {
        location: venues[Math.floor(Math.random() * venues.length)],
        timeContext: 'weekend',
        atmosphere: 'energetic'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' },
        { name: this.selectRandomName(), role: 'coach' }
      ],
      items: sportsEquipment.map(item => ({
        name: item,
        category: ItemCategory.SPORTS_EQUIPMENT,
        typicalValue: {
          min: 5.00,
          max: 50.00,
          typical: 20.00,
          distribution: 'normal' as const
        },
        unit: '£',
        attributes: {
          quality: 'standard' as const
        }
      })),
      culturalElements: [
        {
          type: 'currency' as const,
          value: '£',
          explanation: 'British pounds'
        }
      ],
      realWorldConnection: 'Calculating costs for sports activities',
      yearAppropriate: [year],
      templates: [
        {
          formatCompatibility: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.MULTI_STEP],
          template: 'The {item} costs {price}. If {character} buys {quantity}, how much will it cost?',
          answerTemplate: 'The total cost is {result}',
          placeholders: [
            { key: 'character', type: 'character' as const },
            { key: 'item', type: 'item' as const },
            { key: 'price', type: 'value' as const },
            { key: 'quantity', type: 'value' as const },
            { key: 'result', type: 'value' as const }
          ]
        }
      ]
    };
  }

  /**
   * Generate cooking scenario dynamically
   */
  private generateCookingScenario(year: number): ScenarioContext {
    const ingredients = ['flour', 'eggs', 'butter', 'sugar', 'milk', 'chocolate chips'];
    const recipes = ['biscuits', 'cake', 'muffins', 'bread', 'pizza'];

    return {
      id: `cooking-${year}-${Date.now()}`,
      theme: ScenarioTheme.COOKING,
      setting: {
        location: 'kitchen',
        timeContext: 'weekend baking',
        atmosphere: 'creative'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' },
        { name: 'Mum', role: 'parent' }
      ],
      items: ingredients.map(ingredient => ({
        name: ingredient,
        category: ItemCategory.FOOD_ITEMS,
        typicalValue: {
          min: 1.00,
          max: 5.00,
          typical: 2.50,
          distribution: 'normal' as const
        },
        unit: '£',
        attributes: {
          quality: 'standard' as const
        }
      })),
      culturalElements: [
        {
          type: 'currency' as const,
          value: '£',
          explanation: 'British pounds'
        },
        {
          type: 'measurement' as const,
          value: 'grams',
          explanation: 'Weight measurement for ingredients'
        }
      ],
      realWorldConnection: 'Following recipes and calculating ingredient costs',
      yearAppropriate: [year],
      templates: [
        {
          formatCompatibility: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.MULTI_STEP],
          template: '{character} is making {recipe}. The ingredients cost {prices}. What is the total cost?',
          answerTemplate: 'The total cost is {result}',
          placeholders: [
            { key: 'character', type: 'character' as const },
            { key: 'recipe', type: 'item' as const },
            { key: 'prices', type: 'value' as const },
            { key: 'result', type: 'value' as const }
          ]
        }
      ]
    };
  }

  /**
   * Get default scenario for fallback
   */
  private getDefaultScenario(yearLevel: number): ScenarioContext {
    return {
      id: `default-${yearLevel}-${Date.now()}`,
      theme: ScenarioTheme.SHOPPING,
      setting: {
        location: 'shop',
        timeContext: 'afternoon',
        atmosphere: 'friendly'
      },
      characters: [
        { name: this.selectRandomName(), role: 'student' }
      ],
      items: [
        {
          name: 'item',
          category: ItemCategory.HOUSEHOLD_ITEMS,
          typicalValue: {
            min: 1.00,
            max: 10.00,
            typical: 5.00,
            distribution: 'normal' as const
          },
          unit: '£',
          attributes: {
            quality: 'standard' as const
          }
        }
      ],
      culturalElements: [
        {
          type: 'currency' as const,
          value: '£',
          explanation: 'British pounds'
        }
      ],
      realWorldConnection: 'Basic shopping calculations',
      yearAppropriate: [yearLevel],
      templates: [
        {
          formatCompatibility: [QuestionFormat.DIRECT_CALCULATION],
          template: '{character} buys a {item} for {price}. How much does it cost?',
          answerTemplate: 'It costs {result}',
          placeholders: [
            { key: 'character', type: 'character' as const },
            { key: 'item', type: 'item' as const },
            { key: 'price', type: 'value' as const },
            { key: 'result', type: 'value' as const }
          ]
        }
      ]
    };
  }

  /**
   * Select a random name for characters
   */
  private selectRandomName(): string {
    const names = [
      'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia',
      'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Madison',
      'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas',
      'Mason', 'Logan', 'Alexander', 'Ethan', 'Jacob', 'Michael', 'Daniel', 'Henry'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Initialize pre-built scenarios
   */
  private initializeScenarios(): void {
    // Shopping scenarios
    this.addShoppingScenarios();

    // School scenarios
    this.addSchoolScenarios();

    // Celebration scenarios
    this.addCelebrationScenarios();
  }

  /**
   * Add shopping scenarios
   */
  private addShoppingScenarios(): void {
    const bookFairScenario: ScenarioContext = {
      id: 'shop-001-bookfair',
      theme: ScenarioTheme.SHOPPING,
      setting: {
        location: 'school book fair',
        timeContext: 'lunch break',
        atmosphere: 'busy'
      },
      characters: [
        { name: 'Sarah', role: 'student' },
        { name: 'Mr. Johnson', role: 'teacher' }
      ],
      items: [
        {
          name: 'book',
          category: ItemCategory.BOOKS_MEDIA,
          typicalValue: { min: 3.00, max: 12.00, typical: 6.50, distribution: 'normal' },
          unit: '£',
          attributes: { quality: 'standard' }
        },
        {
          name: 'bookmark',
          category: ItemCategory.SCHOOL_SUPPLIES,
          typicalValue: { min: 0.50, max: 2.00, typical: 1.00, distribution: 'normal' },
          unit: '£',
          attributes: { quality: 'standard' }
        }
      ],
      culturalElements: [
        { type: 'currency', value: '£', explanation: 'British pounds' },
        { type: 'event', value: 'book fair', explanation: 'School fundraising event' }
      ],
      realWorldConnection: 'School fundraising and reading promotion',
      yearAppropriate: [2, 3, 4, 5],
      templates: [
        {
          formatCompatibility: [QuestionFormat.DIRECT_CALCULATION, QuestionFormat.COMPARISON],
          template: '{character} wants to buy books at the book fair. Calculate the total cost.',
          answerTemplate: 'The total cost is {result}',
          placeholders: [
            { key: 'character', type: 'character' },
            { key: 'result', type: 'value' }
          ]
        }
      ]
    };

    this.scenarios.set(bookFairScenario.id, bookFairScenario);
  }

  /**
   * Add school scenarios
   */
  private addSchoolScenarios(): void {
    // Implementation for pre-built school scenarios
  }

  /**
   * Add celebration scenarios
   */
  private addCelebrationScenarios(): void {
    // Implementation for celebration scenarios
  }

  /**
   * Build theme index for efficient lookup
   */
  private buildThemeIndex(): void {
    for (const [id, scenario] of this.scenarios) {
      if (!this.themeIndex.has(scenario.theme)) {
        this.themeIndex.set(scenario.theme, []);
      }
      this.themeIndex.get(scenario.theme)!.push(id);
    }
  }
}