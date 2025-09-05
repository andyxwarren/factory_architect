export enum ModelStatus {
  COMPLETE = 'complete',
  WIP = 'wip',
  BROKEN = 'broken',
  PLANNED = 'planned'
}

export interface ModelStatusInfo {
  id: string;
  name: string;
  status: ModelStatus;
  description: string;
  curriculumAreas: string[];
  supportedYears: number[];
  lastTested?: string;
  knownIssues?: string[];
  completionNotes?: string;
}

/**
 * Central tracking of all mathematical model completion status
 * Based on implementation and testing results
 */
export const MODEL_STATUS_REGISTRY: { [modelId: string]: ModelStatusInfo } = {
  // Core Mathematical Models - Fully Working
  'ADDITION': {
    id: 'ADDITION',
    name: 'Addition',
    status: ModelStatus.COMPLETE,
    description: 'Adding numbers together with various difficulty levels',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)'],
    supportedYears: [1, 2, 3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Fully functional with decimal support and carrying'
  },

  'SUBTRACTION': {
    id: 'SUBTRACTION',
    name: 'Subtraction',
    status: ModelStatus.COMPLETE,
    description: 'Subtracting numbers with borrowing support',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)'],
    supportedYears: [1, 2, 3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Fully functional with borrowing and decimal support'
  },

  'MULTIPLICATION': {
    id: 'MULTIPLICATION',
    name: 'Multiplication',
    status: ModelStatus.COMPLETE,
    description: 'Times tables and multiplication problems',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)'],
    supportedYears: [2, 3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Supports times tables and complex multiplication'
  },

  'DIVISION': {
    id: 'DIVISION',
    name: 'Division',
    status: ModelStatus.COMPLETE,
    description: 'Division with quotients and remainders',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Handles remainders and decimal division'
  },

  'PERCENTAGE': {
    id: 'PERCENTAGE',
    name: 'Percentages',
    status: ModelStatus.COMPLETE,
    description: 'Percentage calculations and comparisons',
    curriculumAreas: ['Fractions (including decimals and percentages)'],
    supportedYears: [4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Percentage of amounts, increases, decreases'
  },

  // Extended Mathematical Models - Working
  'FRACTION': {
    id: 'FRACTION',
    name: 'Fractions',
    status: ModelStatus.COMPLETE,
    description: 'Fraction calculations and conversions',
    curriculumAreas: ['Fractions (including decimals and percentages)'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Common fractions with practical applications'
  },

  'COUNTING': {
    id: 'COUNTING',
    name: 'Counting & Coins',
    status: ModelStatus.COMPLETE,
    description: 'Coin counting and combinations',
    curriculumAreas: ['Number and place value', 'Measurement'],
    supportedYears: [1, 2, 3, 4],
    lastTested: '2024-09-04',
    completionNotes: 'UK coin denominations with optimal combinations'
  },

  'TIME_RATE': {
    id: 'TIME_RATE',
    name: 'Time & Rate',
    status: ModelStatus.COMPLETE,
    description: 'Time-based calculations and rates',
    curriculumAreas: ['Measurement'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Savings over time and rate calculations'
  },

  'CONVERSION': {
    id: 'CONVERSION',
    name: 'Unit Conversion',
    status: ModelStatus.COMPLETE,
    description: 'Converting between different units',
    curriculumAreas: ['Measurement'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Common UK unit conversions'
  },

  'COMPARISON': {
    id: 'COMPARISON',
    name: 'Comparisons',
    status: ModelStatus.COMPLETE,
    description: 'Comparing values and determining best deals',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)', 'Measurement'],
    supportedYears: [4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Value comparison with reasoning'
  },

  // Advanced Models - Implementation Issues
  'MULTI_STEP': {
    id: 'MULTI_STEP',
    name: 'Multi-Step Problems',
    status: ModelStatus.COMPLETE,
    description: 'Problems requiring multiple calculations',
    curriculumAreas: ['Addition, subtraction, multiplication and division (calculations)'],
    supportedYears: [4, 5, 6],
    lastTested: '2024-09-04',
    completionNotes: 'Chains multiple operations successfully'
  },

  'LINEAR_EQUATION': {
    id: 'LINEAR_EQUATION',
    name: 'Linear Equations',
    status: ModelStatus.BROKEN,
    description: 'Basic algebra and linear relationships',
    curriculumAreas: ['Algebra'],
    supportedYears: [5, 6],
    lastTested: '2024-09-04',
    knownIssues: [
      'API requests timeout due to infinite loops',
      'generateRandomNumber parameter order issues',
      'Needs debugging of slope generation logic'
    ]
  },

  'UNIT_RATE': {
    id: 'UNIT_RATE',
    name: 'Unit Rates',
    status: ModelStatus.BROKEN,
    description: 'Rate calculations and value comparisons',
    curriculumAreas: ['Ratio and proportion'],
    supportedYears: [5, 6],
    lastTested: '2024-09-04',
    knownIssues: [
      'API requests timeout due to infinite loops',
      'generateRandomNumber parameter order issues',
      'Target quantity generation problems'
    ]
  },

  // Money Models - Newly Implemented
  'COIN_RECOGNITION': {
    id: 'COIN_RECOGNITION',
    name: 'Coin Recognition',
    status: ModelStatus.WIP,
    description: 'Identifying UK coins and notes',
    curriculumAreas: ['Measurement'],
    supportedYears: [1, 2, 3],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  },

  'CHANGE_CALCULATION': {
    id: 'CHANGE_CALCULATION',
    name: 'Change Calculation',
    status: ModelStatus.WIP,
    description: 'Calculating change from purchases',
    curriculumAreas: ['Measurement'],
    supportedYears: [2, 3, 4, 5],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  },

  'MONEY_COMBINATIONS': {
    id: 'MONEY_COMBINATIONS',
    name: 'Money Combinations',
    status: ModelStatus.WIP,
    description: 'Different ways to make the same amount',
    curriculumAreas: ['Measurement'],
    supportedYears: [2, 3, 4],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  },

  'MIXED_MONEY_UNITS': {
    id: 'MIXED_MONEY_UNITS',
    name: 'Mixed Money Units',
    status: ModelStatus.WIP,
    description: 'Working with pounds and pence together',
    curriculumAreas: ['Measurement'],
    supportedYears: [3, 4, 5],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  },

  'MONEY_FRACTIONS': {
    id: 'MONEY_FRACTIONS',
    name: 'Money Fractions',
    status: ModelStatus.WIP,
    description: 'Fractional amounts of money',
    curriculumAreas: ['Fractions (including decimals and percentages)', 'Measurement'],
    supportedYears: [4, 5, 6],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  },

  'MONEY_SCALING': {
    id: 'MONEY_SCALING',
    name: 'Money Scaling',
    status: ModelStatus.WIP,
    description: 'Proportional money problems',
    curriculumAreas: ['Ratio and proportion', 'Measurement'],
    supportedYears: [5, 6],
    lastTested: '2024-09-04',
    knownIssues: ['API timeout issues - needs testing']
  }
};

/**
 * Get models by status
 */
export function getModelsByStatus(status: ModelStatus): ModelStatusInfo[] {
  return Object.values(MODEL_STATUS_REGISTRY).filter(model => model.status === status);
}

/**
 * Get models by year support
 */
export function getModelsByYear(year: number): ModelStatusInfo[] {
  return Object.values(MODEL_STATUS_REGISTRY).filter(
    model => model.supportedYears.includes(year)
  );
}

/**
 * Get models by curriculum area
 */
export function getModelsByCurriculumArea(area: string): ModelStatusInfo[] {
  return Object.values(MODEL_STATUS_REGISTRY).filter(
    model => model.curriculumAreas.some(currArea => 
      currArea.toLowerCase().includes(area.toLowerCase())
    )
  );
}

/**
 * Get completion summary statistics
 */
export function getCompletionStats() {
  const models = Object.values(MODEL_STATUS_REGISTRY);
  const total = models.length;
  const complete = models.filter(m => m.status === ModelStatus.COMPLETE).length;
  const wip = models.filter(m => m.status === ModelStatus.WIP).length;
  const broken = models.filter(m => m.status === ModelStatus.BROKEN).length;
  const planned = models.filter(m => m.status === ModelStatus.PLANNED).length;

  return {
    total,
    complete,
    wip,
    broken,
    planned,
    completionPercentage: Math.round((complete / total) * 100)
  };
}