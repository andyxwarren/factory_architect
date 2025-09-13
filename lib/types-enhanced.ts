// Enhanced TypeScript interfaces for sub-difficulty system
// Extends existing types.ts with granular difficulty progression

export * from './types'; // Re-export all existing types

// Enhanced Difficulty System Types
export interface SubDifficultyLevel {
  year: number;        // 1-6
  subLevel: number;    // 1-4 
  displayName: string; // "3.2"
}

export interface DifficultyProgression {
  currentLevel: SubDifficultyLevel;
  parameters: any; // DifficultyParams from existing types
  nextLevel: {
    recommended: SubDifficultyLevel;  // Based on performance
    alternative: SubDifficultyLevel;  // For struggling students
  };
  changeDescription: string[]; // Human-readable change summary
  cognitiveLoadDelta: number; // Estimated difficulty change (-100 to +100)
  newSkillsRequired: string[];
  skillsReinforced: string[];
}

export interface DifficultyInterpolation {
  model: string;
  fromLevel: SubDifficultyLevel;
  toLevel: SubDifficultyLevel;
  parameterChanges: Array<{
    parameter: string;
    fromValue: any;
    toValue: any;
    interpolationType: 'linear' | 'stepped' | 'exponential';
    changeReason: string;
  }>;
}

export interface ProgressionRules {
  maxParameterIncrease: number; // 0.5 = 50% max increase
  maxSimultaneousChanges: number; // 2 parameters max
  confidenceThreshold: number; // 0.75 = 75% success needed
  adaptiveEnabled: boolean;
}

export interface PerformanceData {
  questionId: string;
  modelId: string;
  level: SubDifficultyLevel;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  timestamp: Date;
  hintUsed: boolean;
  attemptsRequired: number;
}

export interface DifficultyAdjustment {
  action: 'advance' | 'maintain' | 'reduce' | 'lock' | 'remedial';
  fromLevel: SubDifficultyLevel;
  toLevel: SubDifficultyLevel;
  reason: string;
  confidence: number; // 0-1
  recommendation: string;
}

export interface StudentSession {
  sessionId: string;
  studentId?: string;
  startTime: Date;
  currentModel: string;
  currentLevel: SubDifficultyLevel;
  performanceHistory: PerformanceData[];
  adaptiveMode: boolean;
  confidenceMode: boolean;
  streakCount: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface TransitionValidation {
  isSmooth: boolean;
  maxParameterChange: number;
  simultaneousChanges: number;
  cognitiveLoadIncrease: number;
  warnings: string[];
  recommendations: string[];
}

export interface CognitiveDemands {
  workingMemoryLoad: number; // 1-10
  proceduralComplexity: number; // 1-10
  conceptualDepth: number; // 1-10
  visualProcessing: number; // 1-10
  totalLoad: number; // 0-100
}

// Enhanced model-specific parameters for sub-levels
export interface EnhancedAdditionParams extends AdditionDifficultyParams {
  carryingFrequency: 'never' | 'rare' | 'occasional' | 'common' | 'always';
  numberRange: 'single-digit' | 'teen' | 'two-digit' | 'three-digit' | 'large';
  visualSupport: boolean;
}

export interface EnhancedSubtractionParams extends SubtractionDifficultyParams {
  borrowingFrequency: 'never' | 'rare' | 'occasional' | 'common' | 'always';
  numberRange: 'single-digit' | 'teen' | 'two-digit' | 'three-digit' | 'large';
  visualSupport: boolean;
}

export interface EnhancedMultiplicationParams extends MultiplicationDifficultyParams {
  tablesFocus: number[]; // [2, 5, 10] for specific times tables
  numberRange: 'basic' | 'extended' | 'large';
  conceptualSupport: boolean;
}

export interface EnhancedDivisionParams extends DivisionDifficultyParams {
  remainderFrequency: 'never' | 'rare' | 'occasional' | 'common' | 'always';
  tablesFocus: number[]; // Division facts to focus on
  visualSupport: boolean;
}

export interface EnhancedPercentageParams extends PercentageDifficultyParams {
  percentageComplexity: 'simple' | 'standard' | 'complex';
  conceptualContext: string[];
  visualSupport: boolean;
}

export interface EnhancedFractionParams extends FractionDifficultyParams {
  denominatorComplexity: 'basic' | 'common' | 'mixed' | 'complex';
  numeratorTypes: 'unit' | 'simple' | 'mixed' | 'improper';
  visualSupport: boolean;
}

// Re-export with import alias to avoid conflicts
import { 
  AdditionDifficultyParams,
  SubtractionDifficultyParams, 
  MultiplicationDifficultyParams,
  DivisionDifficultyParams,
  PercentageDifficultyParams,
  FractionDifficultyParams
} from './types';