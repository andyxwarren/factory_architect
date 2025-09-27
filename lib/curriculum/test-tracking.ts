/**
 * Test Tracking System for Model-Curriculum Combinations
 * Tracks testing of each mathematical model against curriculum areas
 */

import { QuestionFormat } from '@/lib/types/question-formats';

/**
 * Represents a single test result for a model-curriculum combination
 */
export interface TestResult {
  id: string;
  timestamp: Date;

  // Curriculum context
  strand: string;
  substrand: string;
  year: number;

  // Model context
  modelId: string;
  questionFormat?: QuestionFormat;

  // Test details
  questionGenerated: string; // The actual question text
  parameters: Record<string, any>; // Parameters used for generation

  // Results and ratings
  success: boolean; // Did generation succeed?
  rating?: 1 | 2 | 3 | 4 | 5; // User's rating of appropriateness
  notes?: string; // User's notes about this combination

  // Performance metrics
  generationTime?: number; // Time to generate in ms
  errorMessage?: string; // If generation failed

  // Session tracking
  sessionId?: string;
  testerName?: string;
}

/**
 * Summary statistics for a specific combination
 */
export interface TestSummary {
  strand: string;
  substrand: string;
  year: number;
  modelId: string;

  totalTests: number;
  successfulTests: number;
  failedTests: number;
  averageRating: number | null;

  lastTested?: Date;
  recommendedStatus: 'untested' | 'testing' | 'approved' | 'rejected' | 'needs_review';
}

/**
 * Progress tracking for testing coverage
 */
export interface TestingProgress {
  totalCombinations: number;
  testedCombinations: number;
  approvedCombinations: number;
  rejectedCombinations: number;

  byYear: Record<number, {
    total: number;
    tested: number;
    approved: number;
  }>;

  byModel: Record<string, {
    total: number;
    tested: number;
    approved: number;
  }>;

  byStrand: Record<string, {
    total: number;
    tested: number;
    approved: number;
  }>;
}

/**
 * Test tracking storage and management
 */
export class TestTracker {
  private testResults: TestResult[] = [];
  private readonly storageKey = 'curriculum_test_results';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new test result
   */
  addTestResult(result: Omit<TestResult, 'id' | 'timestamp'>): TestResult {
    const newResult: TestResult = {
      ...result,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.testResults.push(newResult);
    this.saveToStorage();

    return newResult;
  }

  /**
   * Get all test results
   */
  getAllResults(): TestResult[] {
    return this.testResults;
  }

  /**
   * Get test results for a specific combination
   */
  getResultsForCombination(
    strand: string,
    substrand: string,
    year: number,
    modelId: string
  ): TestResult[] {
    return this.testResults.filter(
      result =>
        result.strand === strand &&
        result.substrand === substrand &&
        result.year === year &&
        result.modelId === modelId
    );
  }

  /**
   * Get summary for a specific combination
   */
  getSummary(
    strand: string,
    substrand: string,
    year: number,
    modelId: string
  ): TestSummary {
    const results = this.getResultsForCombination(strand, substrand, year, modelId);

    const ratings = results
      .filter(r => r.rating !== undefined)
      .map(r => r.rating!);

    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

    const lastTested = results.length > 0
      ? new Date(Math.max(...results.map(r => r.timestamp.getTime())))
      : undefined;

    // Determine recommended status based on tests and ratings
    let recommendedStatus: TestSummary['recommendedStatus'] = 'untested';
    if (results.length === 0) {
      recommendedStatus = 'untested';
    } else if (results.length < 3) {
      recommendedStatus = 'testing';
    } else if (averageRating !== null) {
      if (averageRating >= 4) {
        recommendedStatus = 'approved';
      } else if (averageRating <= 2) {
        recommendedStatus = 'rejected';
      } else {
        recommendedStatus = 'needs_review';
      }
    }

    return {
      strand,
      substrand,
      year,
      modelId,
      totalTests: results.length,
      successfulTests: results.filter(r => r.success).length,
      failedTests: results.filter(r => !r.success).length,
      averageRating,
      lastTested,
      recommendedStatus
    };
  }

  /**
   * Get overall testing progress
   */
  getProgress(
    allStrands: string[],
    allSubstrands: string[],
    allYears: number[],
    allModels: string[]
  ): TestingProgress {
    const totalCombinations = allStrands.length * allSubstrands.length * allYears.length * allModels.length;

    // Get unique tested combinations
    const testedCombos = new Set<string>();
    const approvedCombos = new Set<string>();
    const rejectedCombos = new Set<string>();

    this.testResults.forEach(result => {
      const key = `${result.strand}|${result.substrand}|${result.year}|${result.modelId}`;
      testedCombos.add(key);

      const summary = this.getSummary(result.strand, result.substrand, result.year, result.modelId);
      if (summary.recommendedStatus === 'approved') {
        approvedCombos.add(key);
      } else if (summary.recommendedStatus === 'rejected') {
        rejectedCombos.add(key);
      }
    });

    // Calculate progress by year
    const byYear: TestingProgress['byYear'] = {};
    allYears.forEach(year => {
      const yearTotal = allStrands.length * allSubstrands.length * allModels.length;
      const yearTested = this.testResults.filter(r => r.year === year).length;
      const yearApproved = Array.from(approvedCombos).filter(key =>
        key.split('|')[2] === year.toString()
      ).length;

      byYear[year] = {
        total: yearTotal,
        tested: yearTested,
        approved: yearApproved
      };
    });

    // Calculate progress by model
    const byModel: TestingProgress['byModel'] = {};
    allModels.forEach(modelId => {
      const modelTotal = allStrands.length * allSubstrands.length * allYears.length;
      const modelTested = this.testResults.filter(r => r.modelId === modelId).length;
      const modelApproved = Array.from(approvedCombos).filter(key =>
        key.split('|')[3] === modelId
      ).length;

      byModel[modelId] = {
        total: modelTotal,
        tested: modelTested,
        approved: modelApproved
      };
    });

    // Calculate progress by strand
    const byStrand: TestingProgress['byStrand'] = {};
    allStrands.forEach(strand => {
      const strandTotal = allSubstrands.length * allYears.length * allModels.length;
      const strandTested = this.testResults.filter(r => r.strand === strand).length;
      const strandApproved = Array.from(approvedCombos).filter(key =>
        key.split('|')[0] === strand
      ).length;

      byStrand[strand] = {
        total: strandTotal,
        tested: strandTested,
        approved: strandApproved
      };
    });

    return {
      totalCombinations,
      testedCombinations: testedCombos.size,
      approvedCombinations: approvedCombos.size,
      rejectedCombinations: rejectedCombos.size,
      byYear,
      byModel,
      byStrand
    };
  }

  /**
   * Update rating for existing test result
   */
  updateRating(testId: string, rating: 1 | 2 | 3 | 4 | 5, notes?: string): void {
    const result = this.testResults.find(r => r.id === testId);
    if (result) {
      result.rating = rating;
      if (notes !== undefined) {
        result.notes = notes;
      }
      this.saveToStorage();
    }
  }

  /**
   * Clear all test results (with confirmation)
   */
  clearAllResults(): void {
    this.testResults = [];
    this.saveToStorage();
  }

  /**
   * Export test results as JSON
   */
  exportResults(): string {
    return JSON.stringify(this.testResults, null, 2);
  }

  /**
   * Import test results from JSON
   */
  importResults(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        // Convert date strings back to Date objects
        const results = imported.map(r => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        this.testResults = results;
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to import test results:', error);
      throw new Error('Invalid test results format');
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        this.testResults = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
          lastTested: r.lastTested ? new Date(r.lastTested) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load test results:', error);
      this.testResults = [];
    }
  }

  /**
   * Save to local storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.testResults));
    } catch (error) {
      console.error('Failed to save test results:', error);
    }
  }
}

// Singleton instance
export const testTracker = new TestTracker();