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
    status: ModelStatus.COMPLETE,
    description: 'Basic algebra and linear relationships',
    curriculumAreas: ['Algebra'],
    supportedYears: [5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Fixed parameter bounds checking and infinite loop issues'
  },

  'UNIT_RATE': {
    id: 'UNIT_RATE',
    name: 'Unit Rates',
    status: ModelStatus.COMPLETE,
    description: 'Rate calculations and value comparisons',
    curriculumAreas: ['Ratio and proportion'],
    supportedYears: [5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Fixed infinite loops and parameter generation issues'
  },

  // Money Models - Newly Implemented
  'COIN_RECOGNITION': {
    id: 'COIN_RECOGNITION',
    name: 'Coin Recognition',
    status: ModelStatus.COMPLETE,
    description: 'Identifying UK coins and notes',
    curriculumAreas: ['Measurement'],
    supportedYears: [1, 2, 3],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support and fixed field mapping'
  },

  'CHANGE_CALCULATION': {
    id: 'CHANGE_CALCULATION',
    name: 'Change Calculation',
    status: ModelStatus.COMPLETE,
    description: 'Calculating change from purchases',
    curriculumAreas: ['Measurement'],
    supportedYears: [2, 3, 4, 5],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support for single and multiple item purchases'
  },

  'MONEY_COMBINATIONS': {
    id: 'MONEY_COMBINATIONS',
    name: 'Money Combinations',
    status: ModelStatus.COMPLETE,
    description: 'Different ways to make the same amount',
    curriculumAreas: ['Measurement'],
    supportedYears: [2, 3, 4],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support for multiple combination types'
  },

  'MIXED_MONEY_UNITS': {
    id: 'MIXED_MONEY_UNITS',
    name: 'Mixed Money Units',
    status: ModelStatus.COMPLETE,
    description: 'Working with pounds and pence together',
    curriculumAreas: ['Measurement'],
    supportedYears: [3, 4, 5],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support for unit conversions'
  },

  'MONEY_FRACTIONS': {
    id: 'MONEY_FRACTIONS',
    name: 'Money Fractions',
    status: ModelStatus.COMPLETE,
    description: 'Fractional amounts of money',
    curriculumAreas: ['Fractions (including decimals and percentages)', 'Measurement'],
    supportedYears: [4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support for fractional money calculations'
  },

  'MONEY_SCALING': {
    id: 'MONEY_SCALING',
    name: 'Money Scaling',
    status: ModelStatus.COMPLETE,
    description: 'Proportional money problems',
    curriculumAreas: ['Ratio and proportion', 'Measurement'],
    supportedYears: [5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Added story engine support for proportional scaling problems'
  },

  // Geometry Models - New
  'SHAPE_RECOGNITION': {
    id: 'SHAPE_RECOGNITION',
    name: 'Shape Recognition',
    status: ModelStatus.COMPLETE,
    description: 'Identifying and comparing 2D and 3D shapes',
    curriculumAreas: ['Geometry – properties of shapes'],
    supportedYears: [1, 2, 3, 4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Complete implementation with shape identification, counting properties, and comparisons'
  },

  'SHAPE_PROPERTIES': {
    id: 'SHAPE_PROPERTIES',
    name: 'Shape Properties',
    status: ModelStatus.COMPLETE,
    description: 'Analyzing properties of 2D shapes including sides, vertices, angles, and symmetry',
    curriculumAreas: ['Geometry – properties of shapes'],
    supportedYears: [1, 2, 3, 4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Complete implementation with property counting, identification, comparison, and classification'
  },

  'ANGLE_MEASUREMENT': {
    id: 'ANGLE_MEASUREMENT',
    name: 'Angle Measurement',
    status: ModelStatus.COMPLETE,
    description: 'Identifying, measuring, and calculating angles including type classification and unit conversions',
    curriculumAreas: ['Geometry – properties of shapes'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Complete implementation with angle identification, measurement, missing angle calculations, and unit conversions'
  },

  'POSITION_DIRECTION': {
    id: 'POSITION_DIRECTION',
    name: 'Position & Direction',
    status: ModelStatus.COMPLETE,
    description: 'Working with coordinates, compass directions, and spatial relationships on grids',
    curriculumAreas: ['Geometry – position and direction'],
    supportedYears: [1, 2, 3, 4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Complete implementation with position identification, direction following, coordinate systems, and relative positioning'
  },

  'AREA_PERIMETER': {
    id: 'AREA_PERIMETER',
    name: 'Area & Perimeter',
    status: ModelStatus.COMPLETE,
    description: 'Calculating area and perimeter of 2D shapes including finding missing dimensions',
    curriculumAreas: ['Measurement'],
    supportedYears: [3, 4, 5, 6],
    lastTested: '2024-09-13',
    completionNotes: 'Complete implementation with area/perimeter calculations for rectangles, squares, triangles, and circles, plus missing dimension problems'
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