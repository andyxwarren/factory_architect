// Import curriculum data - adjust path as needed
const curriculumData = require('../../context/national_curriculum_framework.json');

export interface CurriculumEntry {
  Strand: string;
  Substrand: string;
  "Content domain reference": string;
  Years: {
    [yearKey: string]: string;
  };
}

export interface CurriculumFilter {
  strand: string;
  substrand: string;
  year: number;
  description: string;
  contentDomainRef: string;
}

export interface ParsedCurriculum {
  strands: string[];
  substrands: { [strand: string]: string[] };
  yearDescriptions: { [key: string]: string };
}

class CurriculumParser {
  private data: CurriculumEntry[];

  constructor() {
    this.data = curriculumData as CurriculumEntry[];
  }

  /**
   * Get all unique strands
   */
  getStrands(): string[] {
    const strands = [...new Set(this.data.map(item => item.Strand))];
    return strands.sort();
  }

  /**
   * Get all substrands for a given strand
   */
  getSubstrands(strand: string): string[] {
    const substrands = this.data
      .filter(item => item.Strand === strand)
      .map(item => item.Substrand);
    return [...new Set(substrands)].sort();
  }

  /**
   * Get available years for a strand/substrand combination
   */
  getAvailableYears(strand: string, substrand: string): number[] {
    const entry = this.data.find(
      item => item.Strand === strand && item.Substrand === substrand
    );
    
    if (!entry) return [];
    
    const years: number[] = [];
    Object.keys(entry.Years).forEach(yearKey => {
      const yearNum = parseInt(yearKey.replace('Year ', ''));
      if (entry.Years[yearKey].trim() !== '') {
        years.push(yearNum);
      }
    });
    
    return years.sort((a, b) => a - b);
  }

  /**
   * Get curriculum description for specific strand/substrand/year
   */
  getCurriculumDescription(strand: string, substrand: string, year: number): CurriculumFilter | null {
    const entry = this.data.find(
      item => item.Strand === strand && item.Substrand === substrand
    );
    
    if (!entry) return null;
    
    const yearKey = `Year ${year}`;
    const description = entry.Years[yearKey];
    
    if (!description || description.trim() === '') return null;
    
    return {
      strand,
      substrand,
      year,
      description: description.trim(),
      contentDomainRef: entry["Content domain reference"]
    };
  }

  /**
   * Get all curriculum entries for easy browsing
   */
  getAllEntries(): CurriculumEntry[] {
    return this.data;
  }

  /**
   * Search curriculum by keywords
   */
  searchCurriculum(searchTerm: string): CurriculumFilter[] {
    const results: CurriculumFilter[] = [];
    const term = searchTerm.toLowerCase();
    
    this.data.forEach(entry => {
      Object.keys(entry.Years).forEach(yearKey => {
        const description = entry.Years[yearKey];
        if (description.toLowerCase().includes(term)) {
          const year = parseInt(yearKey.replace('Year ', ''));
          results.push({
            strand: entry.Strand,
            substrand: entry.Substrand,
            year,
            description: description.trim(),
            contentDomainRef: entry["Content domain reference"]
          });
        }
      });
    });
    
    return results;
  }

  /**
   * Get related curriculum entries (same strand, different substrands)
   */
  getRelatedEntries(strand: string, currentSubstrand?: string): string[] {
    return this.data
      .filter(item => item.Strand === strand && item.Substrand !== currentSubstrand)
      .map(item => item.Substrand);
  }
}

export const curriculumParser = new CurriculumParser();