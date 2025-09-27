/**
 * Curriculum data utilities and exports
 * Provides structured access to UK National Curriculum data
 */

import { curriculumParser, CurriculumEntry } from '@/lib/curriculum/curriculum-parser';

// Export curriculum parser for detailed access
export { curriculumParser, type CurriculumEntry };

/**
 * Simplified curriculum data structure for UI components
 * Maps strands to their substrands
 */
export const CURRICULUM_DATA: Record<string, Record<string, boolean>> = (() => {
  const data: Record<string, Record<string, boolean>> = {};

  // Get all entries from the parser
  const entries = curriculumParser.getAllEntries();

  entries.forEach(entry => {
    if (!data[entry.Strand]) {
      data[entry.Strand] = {};
    }
    data[entry.Strand][entry.Substrand] = true;
  });

  return data;
})();

/**
 * Get all strands from curriculum data
 */
export const getCurriculumStrands = (): string[] => {
  return Object.keys(CURRICULUM_DATA).sort();
};

/**
 * Get all substrands for a specific strand
 */
export const getCurriculumSubstrands = (strand: string): string[] => {
  return Object.keys(CURRICULUM_DATA[strand] || {}).sort();
};

/**
 * Get all strand-substrand combinations
 */
export const getAllCurriculumCombinations = (): Array<{ strand: string; substrand: string }> => {
  const combinations: Array<{ strand: string; substrand: string }> = [];

  Object.keys(CURRICULUM_DATA).forEach(strand => {
    Object.keys(CURRICULUM_DATA[strand]).forEach(substrand => {
      combinations.push({ strand, substrand });
    });
  });

  return combinations.sort((a, b) => {
    if (a.strand !== b.strand) {
      return a.strand.localeCompare(b.strand);
    }
    return a.substrand.localeCompare(b.substrand);
  });
};

/**
 * Check if a strand-substrand combination exists
 */
export const isValidCurriculumCombination = (strand: string, substrand: string): boolean => {
  return CURRICULUM_DATA[strand]?.[substrand] || false;
};

/**
 * Get curriculum description for a specific combination and year
 */
export const getCurriculumDescription = (strand: string, substrand: string, year: number): string | null => {
  const filter = curriculumParser.getCurriculumDescription(strand, substrand, year);
  return filter?.description || null;
};

/**
 * Get available years for a strand-substrand combination
 */
export const getAvailableYears = (strand: string, substrand: string): number[] => {
  return curriculumParser.getAvailableYears(strand, substrand);
};

/**
 * Search curriculum by keyword
 */
export const searchCurriculum = (searchTerm: string) => {
  return curriculumParser.searchCurriculum(searchTerm);
};

// Export default for convenience
export default {
  CURRICULUM_DATA,
  getCurriculumStrands,
  getCurriculumSubstrands,
  getAllCurriculumCombinations,
  isValidCurriculumCombination,
  getCurriculumDescription,
  getAvailableYears,
  searchCurriculum,
  curriculumParser
};