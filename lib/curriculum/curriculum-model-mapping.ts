import { CurriculumFilter } from './curriculum-parser';
import { MODEL_STATUS_REGISTRY } from '../models/model-status';
import { curatedMappingsManager } from './curated-mappings';

/**
 * Maps curriculum areas to appropriate mathematical models
 */
export interface CurriculumModelMapping {
  strand: string;
  substrand: string;
  year: number;
  suggestedModels: string[];
  primaryModel?: string; // Most relevant model for this curriculum area
}

/**
 * Intelligent mapping between curriculum requirements and mathematical models
 */
class CurriculumModelMapper {
  
  /**
   * Get suggested models for a specific curriculum filter
   * Now integrates with curated mappings when available
   */
  getSuggestedModels(filter: CurriculumFilter): string[] {
    const { strand, substrand, year, description } = filter;

    // First check for curated mappings (takes priority)
    const curated = curatedMappingsManager.getSuggestedModels(filter);
    if (curated.primary || curated.secondary.length > 0) {
      // Return curated suggestions, excluding excluded models
      const suggested: string[] = [];
      if (curated.primary) suggested.push(curated.primary);
      suggested.push(...curated.secondary);

      // Add automatic suggestions that aren't excluded
      const automaticFiltered = curated.automatic.filter(
        model => !curated.excluded.includes(model)
      );
      suggested.push(...automaticFiltered);

      return [...new Set(suggested)];
    }

    // Fall back to automatic mapping if no curated mapping
    return this.getAutomaticSuggestions(filter);
  }

  /**
   * Get automatic model suggestions (legacy behavior)
   */
  getAutomaticSuggestions(filter: CurriculumFilter): string[] {
    const { strand, substrand, year, description } = filter;
    const suggestedModels: Set<string> = new Set();

    // Direct mapping based on strand and substrand patterns
    const mappings = this.getDirectMappings();

    // Find matching mappings
    mappings.forEach(mapping => {
      if (this.matchesMapping(mapping, strand, substrand, year)) {
        mapping.models.forEach(model => suggestedModels.add(model));
      }
    });

    // Keyword-based mapping from description
    const keywordModels = this.getModelsByKeywords(description, year);
    keywordModels.forEach(model => suggestedModels.add(model));

    // Filter by year appropriateness and model availability
    return Array.from(suggestedModels).filter(modelId => {
      const modelInfo = MODEL_STATUS_REGISTRY[modelId];
      return modelInfo && modelInfo.supportedYears.includes(year);
    });
  }

  /**
   * Get the primary (most relevant) model for a curriculum area
   * Now integrates with curated mappings when available
   */
  getPrimaryModel(filter: CurriculumFilter): string | null {
    // First check for curated primary model
    const curated = curatedMappingsManager.getSuggestedModels(filter);
    if (curated.primary) {
      return curated.primary;
    }

    // Fall back to automatic suggestion logic
    const suggested = this.getSuggestedModels(filter);
    if (suggested.length === 0) return null;

    // Priority order for primary model selection
    const priorityOrder = [
      'ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION',
      'COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS',
      'FRACTION', 'PERCENTAGE', 'COUNTING', 'TIME_RATE',
      'CONVERSION', 'COMPARISON', 'MIXED_MONEY_UNITS',
      'MONEY_FRACTIONS', 'MONEY_SCALING', 'MULTI_STEP',
      'LINEAR_EQUATION', 'UNIT_RATE'
    ];

    // Return first match from priority order
    for (const modelId of priorityOrder) {
      if (suggested.includes(modelId)) {
        return modelId;
      }
    }

    return suggested[0];
  }

  /**
   * Direct mappings between curriculum areas and models
   */
  private getDirectMappings(): Array<{
    strand?: string;
    substrand?: string;
    yearRange?: [number, number];
    models: string[];
  }> {
    return [
      // Number and place value
      {
        strand: 'Number and place value',
        substrand: 'counting (in multiples)',
        yearRange: [1, 6],
        models: ['COUNTING', 'ADDITION', 'MULTIPLICATION']
      },
      {
        strand: 'Number and place value',
        substrand: 'read, write, order and compare numbers',
        yearRange: [1, 6],
        models: ['COMPARISON', 'ADDITION', 'SUBTRACTION']
      },

      // Addition, subtraction, multiplication and division
      {
        strand: 'Addition, subtraction, multiplication and division (calculations)',
        substrand: 'add / subtract mentally',
        models: ['ADDITION', 'SUBTRACTION']
      },
      {
        strand: 'Addition, subtraction, multiplication and division (calculations)',
        substrand: 'add / subtract using written methods',
        models: ['ADDITION', 'SUBTRACTION', 'MULTI_STEP']
      },
      {
        strand: 'Addition, subtraction, multiplication and division (calculations)',
        substrand: 'multiply / divide mentally',
        models: ['MULTIPLICATION', 'DIVISION']
      },
      {
        strand: 'Addition, subtraction, multiplication and division (calculations)',
        substrand: 'multiply / divide using written methods',
        models: ['MULTIPLICATION', 'DIVISION', 'MULTI_STEP']
      },

      // Fractions
      {
        strand: 'Fractions (including decimals and percentages)',
        substrand: 'fractions',
        models: ['FRACTION', 'MONEY_FRACTIONS']
      },
      {
        strand: 'Fractions (including decimals and percentages)',
        substrand: 'decimals',
        models: ['CONVERSION', 'MIXED_MONEY_UNITS', 'PERCENTAGE']
      },
      {
        strand: 'Fractions (including decimals and percentages)',
        substrand: 'percentages',
        models: ['PERCENTAGE', 'MONEY_SCALING']
      },

      // Measurement - Money
      {
        strand: 'Measurement',
        substrand: 'money',
        models: ['COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS', 'MIXED_MONEY_UNITS', 'MONEY_FRACTIONS', 'MONEY_SCALING']
      },

      // Measurement - Other
      {
        strand: 'Measurement',
        substrand: 'solve problems (a, money; b, length; c, mass / weight; d, capacity / volume)',
        models: ['CHANGE_CALCULATION', 'CONVERSION', 'MULTI_STEP', 'COMPARISON']
      },

      // Ratio and proportion
      {
        strand: 'Ratio and proportion',
        models: ['UNIT_RATE', 'MONEY_SCALING', 'COMPARISON']
      },

      // Algebra
      {
        strand: 'Algebra',
        models: ['LINEAR_EQUATION', 'MULTI_STEP']
      }
    ];
  }

  /**
   * Get models based on keywords in curriculum description
   */
  private getModelsByKeywords(description: string, year: number): string[] {
    const lowerDesc = description.toLowerCase();
    const models: string[] = [];

    // Keywords mapping
    const keywordMappings = [
      { keywords: ['add', 'adding', 'addition', 'sum', 'total', 'altogether'], models: ['ADDITION'] },
      { keywords: ['subtract', 'subtraction', 'minus', 'take away', 'difference'], models: ['SUBTRACTION'] },
      { keywords: ['multiply', 'multiplication', 'times', 'groups of'], models: ['MULTIPLICATION'] },
      { keywords: ['divide', 'division', 'share', 'sharing', 'split'], models: ['DIVISION'] },
      { keywords: ['fraction', 'half', 'quarter', 'third'], models: ['FRACTION', 'MONEY_FRACTIONS'] },
      { keywords: ['percent', 'percentage', '%'], models: ['PERCENTAGE'] },
      { keywords: ['money', 'pounds', 'pence', 'coin', 'note', 'change'], models: ['COIN_RECOGNITION', 'CHANGE_CALCULATION', 'MONEY_COMBINATIONS'] },
      { keywords: ['count', 'counting'], models: ['COUNTING'] },
      { keywords: ['compare', 'order', 'greater', 'less', 'equal'], models: ['COMPARISON'] },
      { keywords: ['measure', 'measurement', 'convert'], models: ['CONVERSION'] },
      { keywords: ['time', 'rate'], models: ['TIME_RATE'] },
      { keywords: ['problem', 'solve'], models: ['MULTI_STEP'] }
    ];

    keywordMappings.forEach(mapping => {
      if (mapping.keywords.some(keyword => lowerDesc.includes(keyword))) {
        mapping.models.forEach(model => {
          const modelInfo = MODEL_STATUS_REGISTRY[model];
          if (modelInfo && modelInfo.supportedYears.includes(year)) {
            models.push(model);
          }
        });
      }
    });

    return [...new Set(models)];
  }

  /**
   * Check if a mapping matches the given criteria
   */
  private matchesMapping(
    mapping: { strand?: string; substrand?: string; yearRange?: [number, number] },
    strand: string,
    substrand: string,
    year: number
  ): boolean {
    // Check strand match
    if (mapping.strand && !strand.toLowerCase().includes(mapping.strand.toLowerCase())) {
      return false;
    }

    // Check substrand match
    if (mapping.substrand && !substrand.toLowerCase().includes(mapping.substrand.toLowerCase())) {
      return false;
    }

    // Check year range
    if (mapping.yearRange) {
      const [minYear, maxYear] = mapping.yearRange;
      if (year < minYear || year > maxYear) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all models that could be relevant for a curriculum area
   */
  getAllRelevantModels(strand: string): string[] {
    const relevantModels: Set<string> = new Set();
    
    Object.values(MODEL_STATUS_REGISTRY).forEach(model => {
      if (model.curriculumAreas.some(area => 
        area.toLowerCase().includes(strand.toLowerCase()) ||
        strand.toLowerCase().includes(area.toLowerCase())
      )) {
        relevantModels.add(model.id);
      }
    });

    return Array.from(relevantModels);
  }
}

export const curriculumModelMapper = new CurriculumModelMapper();