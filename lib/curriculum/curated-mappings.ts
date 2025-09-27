/**
 * Curated Model-Curriculum Mappings System
 * Manages user-defined mappings between mathematical models and curriculum areas
 */

import { MODEL_STATUS_REGISTRY } from '@/lib/models/model-status';
import { CurriculumFilter } from './curriculum-parser';

/**
 * Curated mapping between a curriculum area and mathematical models
 */
export interface CuratedMapping {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Curriculum specification
  strand: string;
  substrand: string;
  year: number;

  // Curated model selections
  primaryModel: string; // The best model for this curriculum area
  secondaryModels: string[]; // Alternative models that also work well
  excludedModels: string[]; // Models that should not be used

  // Metadata
  confidence: 'low' | 'medium' | 'high'; // Confidence in this mapping
  notes?: string; // Notes about why these models were chosen
  testedCount: number; // How many tests informed this mapping
  averageRating: number | null; // Average rating from tests

  // Status
  status: 'draft' | 'approved' | 'needs_review';
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Mapping matrix for visualization
 */
export interface MappingMatrix {
  strands: string[];
  substrands: string[];
  years: number[];
  models: string[];

  // 4D matrix: [strand][substrand][year][model] = mapping status
  matrix: Record<string, Record<string, Record<number, Record<string, MappingStatus>>>>;
}

/**
 * Status of a specific model-curriculum combination
 */
export interface MappingStatus {
  isPrimary: boolean;
  isSecondary: boolean;
  isExcluded: boolean;
  isSuggested: boolean; // From automatic suggestions
  testedCount: number;
  averageRating: number | null;
  confidence?: 'low' | 'medium' | 'high';
}

/**
 * Manages curated model-curriculum mappings
 */
export class CuratedMappingsManager {
  private mappings: CuratedMapping[] = [];
  private readonly storageKey = 'curated_curriculum_mappings';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Create or update a curated mapping
   */
  upsertMapping(
    strand: string,
    substrand: string,
    year: number,
    updates: Partial<Omit<CuratedMapping, 'id' | 'strand' | 'substrand' | 'year' | 'createdAt' | 'updatedAt'>>
  ): CuratedMapping {
    const existing = this.getMapping(strand, substrand, year);

    if (existing) {
      // Update existing mapping
      Object.assign(existing, {
        ...updates,
        updatedAt: new Date()
      });
      this.saveToStorage();
      return existing;
    } else {
      // Create new mapping
      const newMapping: CuratedMapping = {
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        strand,
        substrand,
        year,
        primaryModel: updates.primaryModel || '',
        secondaryModels: updates.secondaryModels || [],
        excludedModels: updates.excludedModels || [],
        confidence: updates.confidence || 'low',
        notes: updates.notes,
        testedCount: updates.testedCount || 0,
        averageRating: updates.averageRating || null,
        status: updates.status || 'draft',
        approvedBy: updates.approvedBy,
        approvedAt: updates.approvedAt
      };

      this.mappings.push(newMapping);
      this.saveToStorage();
      return newMapping;
    }
  }

  /**
   * Get a specific mapping
   */
  getMapping(strand: string, substrand: string, year: number): CuratedMapping | undefined {
    return this.mappings.find(
      m => m.strand === strand && m.substrand === substrand && m.year === year
    );
  }

  /**
   * Get all mappings
   */
  getAllMappings(): CuratedMapping[] {
    return this.mappings;
  }

  /**
   * Get suggested models for a curriculum area
   * Combines curated mappings with automatic suggestions
   */
  getSuggestedModels(filter: CurriculumFilter): {
    primary: string | null;
    secondary: string[];
    excluded: string[];
    automatic: string[];
  } {
    const curated = this.getMapping(filter.strand, filter.substrand, filter.year);
    const automatic = this.getAutomaticSuggestions(filter);

    if (curated && curated.status === 'approved') {
      // Use curated mapping if approved
      return {
        primary: curated.primaryModel,
        secondary: curated.secondaryModels,
        excluded: curated.excludedModels,
        automatic: automatic.filter(m =>
          m !== curated.primaryModel &&
          !curated.secondaryModels.includes(m) &&
          !curated.excludedModels.includes(m)
        )
      };
    } else if (curated) {
      // Use curated mapping (draft/review) but include automatic suggestions
      return {
        primary: curated.primaryModel || automatic[0] || null,
        secondary: curated.secondaryModels,
        excluded: curated.excludedModels,
        automatic
      };
    } else {
      // No curated mapping, use automatic suggestions only
      return {
        primary: automatic[0] || null,
        secondary: automatic.slice(1),
        excluded: [],
        automatic
      };
    }
  }

  /**
   * Generate automatic model suggestions (internal implementation)
   */
  private getAutomaticSuggestions(filter: CurriculumFilter): string[] {
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
   * Build mapping matrix for visualization
   */
  buildMappingMatrix(
    strands: string[],
    substrands: string[],
    years: number[],
    models: string[]
  ): MappingMatrix {
    const matrix: MappingMatrix['matrix'] = {};

    strands.forEach(strand => {
      matrix[strand] = {};
      substrands.forEach(substrand => {
        matrix[strand][substrand] = {};
        years.forEach(year => {
          matrix[strand][substrand][year] = {};

          // Get curated mapping if exists
          const curated = this.getMapping(strand, substrand, year);

          // Get automatic suggestions
          const automatic = this.getAutomaticSuggestions({
            strand,
            substrand,
            year,
            description: `${strand} - ${substrand}`
          });

          models.forEach(modelId => {
            const status: MappingStatus = {
              isPrimary: curated?.primaryModel === modelId,
              isSecondary: curated?.secondaryModels.includes(modelId) || false,
              isExcluded: curated?.excludedModels.includes(modelId) || false,
              isSuggested: automatic.includes(modelId),
              testedCount: 0, // Will be populated from test tracker
              averageRating: null,
              confidence: curated?.confidence
            };

            matrix[strand][substrand][year][modelId] = status;
          });
        });
      });
    });

    return {
      strands,
      substrands,
      years,
      models,
      matrix
    };
  }

  /**
   * Approve a mapping
   */
  approveMapping(mappingId: string, approvedBy: string): void {
    const mapping = this.mappings.find(m => m.id === mappingId);
    if (mapping) {
      mapping.status = 'approved';
      mapping.approvedBy = approvedBy;
      mapping.approvedAt = new Date();
      mapping.updatedAt = new Date();
      this.saveToStorage();
    }
  }

  /**
   * Mark mapping for review
   */
  markForReview(mappingId: string): void {
    const mapping = this.mappings.find(m => m.id === mappingId);
    if (mapping) {
      mapping.status = 'needs_review';
      mapping.updatedAt = new Date();
      this.saveToStorage();
    }
  }

  /**
   * Batch update model assignments
   */
  batchUpdateModels(
    updates: Array<{
      strand: string;
      substrand: string;
      year: number;
      modelId: string;
      role: 'primary' | 'secondary' | 'excluded' | 'none';
    }>
  ): void {
    updates.forEach(update => {
      const mapping = this.getMapping(update.strand, update.substrand, update.year);

      if (!mapping) {
        // Create new mapping if doesn't exist
        if (update.role !== 'none') {
          this.upsertMapping(update.strand, update.substrand, update.year, {
            primaryModel: update.role === 'primary' ? update.modelId : '',
            secondaryModels: update.role === 'secondary' ? [update.modelId] : [],
            excludedModels: update.role === 'excluded' ? [update.modelId] : []
          });
        }
      } else {
        // Update existing mapping
        // Remove model from all lists first
        if (mapping.primaryModel === update.modelId) {
          mapping.primaryModel = '';
        }
        mapping.secondaryModels = mapping.secondaryModels.filter(m => m !== update.modelId);
        mapping.excludedModels = mapping.excludedModels.filter(m => m !== update.modelId);

        // Add to appropriate list
        switch (update.role) {
          case 'primary':
            mapping.primaryModel = update.modelId;
            break;
          case 'secondary':
            mapping.secondaryModels.push(update.modelId);
            break;
          case 'excluded':
            mapping.excludedModels.push(update.modelId);
            break;
        }

        mapping.updatedAt = new Date();
      }
    });

    this.saveToStorage();
  }

  /**
   * Get statistics about curated mappings
   */
  getStatistics(): {
    totalMappings: number;
    approvedMappings: number;
    draftMappings: number;
    needsReviewMappings: number;
    highConfidenceMappings: number;
    coverageByYear: Record<number, number>;
    coverageByStrand: Record<string, number>;
  } {
    const stats = {
      totalMappings: this.mappings.length,
      approvedMappings: this.mappings.filter(m => m.status === 'approved').length,
      draftMappings: this.mappings.filter(m => m.status === 'draft').length,
      needsReviewMappings: this.mappings.filter(m => m.status === 'needs_review').length,
      highConfidenceMappings: this.mappings.filter(m => m.confidence === 'high').length,
      coverageByYear: {} as Record<number, number>,
      coverageByStrand: {} as Record<string, number>
    };

    // Calculate coverage by year
    this.mappings.forEach(mapping => {
      if (!stats.coverageByYear[mapping.year]) {
        stats.coverageByYear[mapping.year] = 0;
      }
      stats.coverageByYear[mapping.year]++;

      if (!stats.coverageByStrand[mapping.strand]) {
        stats.coverageByStrand[mapping.strand] = 0;
      }
      stats.coverageByStrand[mapping.strand]++;
    });

    return stats;
  }

  /**
   * Export mappings as JSON
   */
  exportMappings(): string {
    return JSON.stringify(this.mappings, null, 2);
  }

  /**
   * Import mappings from JSON
   */
  importMappings(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        // Convert date strings back to Date objects
        const mappings = imported.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
          approvedAt: m.approvedAt ? new Date(m.approvedAt) : undefined
        }));
        this.mappings = mappings;
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to import mappings:', error);
      throw new Error('Invalid mappings format');
    }
  }

  /**
   * Clear all mappings (with confirmation)
   */
  clearAllMappings(): void {
    this.mappings = [];
    this.saveToStorage();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load from local storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.mappings = parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
          approvedAt: m.approvedAt ? new Date(m.approvedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load curated mappings:', error);
      this.mappings = [];
    }
  }

  /**
   * Save to local storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mappings));
    } catch (error) {
      console.error('Failed to save curated mappings:', error);
    }
  }
}

// Singleton instance
export const curatedMappingsManager = new CuratedMappingsManager();