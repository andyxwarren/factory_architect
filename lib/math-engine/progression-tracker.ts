import {
  SubDifficultyLevel,
  PerformanceData,
  DifficultyAdjustment,
  StudentSession
} from '@/lib/types-enhanced';

import { EnhancedDifficultySystem } from './difficulty-enhanced';

/**
 * Tracks student progression and makes adaptive difficulty recommendations
 */
export class ProgressionTracker {
  
  private static sessions: Map<string, StudentSession> = new Map();
  
  /**
   * Create or retrieve a student session
   */
  static getSession(sessionId: string, studentId?: string): StudentSession {
    if (!this.sessions.has(sessionId)) {
      const session: StudentSession = {
        sessionId,
        studentId,
        startTime: new Date(),
        currentModel: 'ADDITION',
        currentLevel: EnhancedDifficultySystem.createLevel(3, 3), // Default to 3.3
        performanceHistory: [],
        adaptiveMode: true,
        confidenceMode: false,
        streakCount: 0,
        totalQuestions: 0,
        correctAnswers: 0
      };
      this.sessions.set(sessionId, session);
    }
    return this.sessions.get(sessionId)!;
  }

  /**
   * Record a student's attempt at a question
   */
  static recordAttempt(
    sessionId: string,
    questionId: string,
    modelId: string,
    level: SubDifficultyLevel,
    isCorrect: boolean,
    timeSpent: number,
    hintUsed: boolean = false,
    attemptsRequired: number = 1
  ): void {
    const session = this.getSession(sessionId);
    
    const performanceData: PerformanceData = {
      questionId,
      modelId,
      level,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
      hintUsed,
      attemptsRequired
    };
    
    session.performanceHistory.push(performanceData);
    session.totalQuestions++;
    session.currentModel = modelId;
    session.currentLevel = level;
    
    if (isCorrect) {
      session.correctAnswers++;
      session.streakCount = Math.max(0, session.streakCount) + 1;
    } else {
      session.streakCount = Math.min(0, session.streakCount) - 1;
    }
    
    // Update session data
    this.sessions.set(sessionId, session);
  }

  /**
   * Get recommended next difficulty level based on performance
   */
  static getRecommendedLevel(
    sessionId: string,
    modelId: string
  ): SubDifficultyLevel {
    const session = this.getSession(sessionId);
    
    if (!session.adaptiveMode) {
      return session.currentLevel; // No automatic progression
    }
    
    const adjustment = this.analyzePerformance(session, modelId);
    return adjustment.toLevel;
  }

  /**
   * Analyze student performance and recommend difficulty adjustment
   */
  static analyzePerformance(
    session: StudentSession,
    modelId: string
  ): DifficultyAdjustment {
    const recentHistory = this.getRecentHistory(session, modelId, 10);
    const currentLevel = session.currentLevel;
    
    // Special handling for confidence mode
    if (session.confidenceMode) {
      return this.handleConfidenceMode(session, currentLevel);
    }
    
    // Analyze performance patterns
    const consecutiveCorrect = this.getConsecutiveCorrect(recentHistory);
    const consecutiveIncorrect = this.getConsecutiveIncorrect(recentHistory);
    const recentAccuracy = this.getAccuracy(recentHistory);
    
    // Apply adjustment rules
    return this.applyAdjustmentRules(
      currentLevel,
      consecutiveCorrect,
      consecutiveIncorrect,
      recentAccuracy,
      session.streakCount
    );
  }

  /**
   * Apply confidence-based adjustment rules
   */
  private static applyAdjustmentRules(
    currentLevel: SubDifficultyLevel,
    consecutiveCorrect: number,
    consecutiveIncorrect: number,
    recentAccuracy: number,
    streakCount: number
  ): DifficultyAdjustment {
    
    // Check for advancement triggers
    if (consecutiveCorrect >= 7) {
      return this.createAdvancement(currentLevel, 0.3, 'Seven consecutive correct answers');
    } else if (consecutiveCorrect >= 5) {
      return this.createAdvancement(currentLevel, 0.2, 'Five consecutive correct answers');
    } else if (consecutiveCorrect >= 3) {
      return this.createAdvancement(currentLevel, 0.1, 'Three consecutive correct answers');
    }
    
    // Check for support triggers  
    if (consecutiveIncorrect >= 4) {
      return this.createReduction(currentLevel, 'lock', 'Four consecutive incorrect - entering confidence mode');
    } else if (consecutiveIncorrect >= 3) {
      return this.createReduction(currentLevel, 0.2, 'Three consecutive incorrect answers');
    } else if (consecutiveIncorrect >= 2) {
      return this.createReduction(currentLevel, 0.1, 'Two consecutive incorrect answers');
    }
    
    // Check accuracy over last 10 questions
    if (recentAccuracy < 0.5) {
      return this.createReduction(currentLevel, 0.1, 'Accuracy below 50% in recent questions');
    } else if (recentAccuracy > 0.8) {
      return this.createAdvancement(currentLevel, 0.1, 'Accuracy above 80% in recent questions');
    }
    
    // Maintain current level
    return {
      action: 'maintain',
      fromLevel: currentLevel,
      toLevel: currentLevel,
      reason: 'Performance indicates appropriate difficulty level',
      confidence: recentAccuracy,
      recommendation: 'Continue at current level'
    };
  }

  /**
   * Handle confidence mode progression
   */
  private static handleConfidenceMode(
    session: StudentSession,
    currentLevel: SubDifficultyLevel
  ): DifficultyAdjustment {
    const recentHistory = this.getRecentHistory(session, session.currentModel, 20);
    const accuracy = this.getAccuracy(recentHistory);
    
    // Exit confidence mode if performing well
    if (accuracy >= 0.8 && recentHistory.length >= 10) {
      return {
        action: 'maintain',
        fromLevel: currentLevel,
        toLevel: currentLevel,
        reason: 'Ready to exit confidence mode',
        confidence: accuracy,
        recommendation: 'Confidence restored - can resume adaptive progression'
      };
    }
    
    // Stay in confidence mode
    return {
      action: 'maintain',
      fromLevel: currentLevel,
      toLevel: currentLevel,
      reason: 'Building confidence at current level',
      confidence: accuracy,
      recommendation: `Continue practicing at ${currentLevel.displayName} until 80% accuracy achieved`
    };
  }

  /**
   * Create advancement adjustment
   */
  private static createAdvancement(
    currentLevel: SubDifficultyLevel,
    increment: number,
    reason: string
  ): DifficultyAdjustment {
    const newLevel = this.incrementLevel(currentLevel, increment);
    
    return {
      action: 'advance',
      fromLevel: currentLevel,
      toLevel: newLevel,
      reason,
      confidence: 0.85, // High confidence for advancement
      recommendation: `Advance from ${currentLevel.displayName} to ${newLevel.displayName}`
    };
  }

  /**
   * Create reduction/support adjustment
   */
  private static createReduction(
    currentLevel: SubDifficultyLevel,
    decrement: number | 'lock',
    reason: string
  ): DifficultyAdjustment {
    if (decrement === 'lock') {
      return {
        action: 'lock',
        fromLevel: currentLevel,
        toLevel: currentLevel,
        reason,
        confidence: 0.3, // Low confidence
        recommendation: 'Enter confidence mode - stay at current level until performance improves'
      };
    }
    
    const newLevel = this.incrementLevel(currentLevel, -decrement);
    
    return {
      action: 'reduce',
      fromLevel: currentLevel,
      toLevel: newLevel,
      reason,
      confidence: 0.4, // Low confidence
      recommendation: `Reduce difficulty from ${currentLevel.displayName} to ${newLevel.displayName}`
    };
  }

  /**
   * Increment difficulty level by decimal amount
   */
  private static incrementLevel(
    level: SubDifficultyLevel,
    increment: number
  ): SubDifficultyLevel {
    // Convert to decimal representation
    const currentDecimal = level.year + (level.subLevel - 1) * 0.1;
    let newDecimal = currentDecimal + increment;
    
    // Clamp to valid ranges
    newDecimal = Math.max(1.1, Math.min(6.4, newDecimal));
    
    // Convert back to year/subLevel
    const newYear = Math.floor(newDecimal);
    const newSubLevel = Math.round((newDecimal - newYear) * 10) + 1;
    
    return EnhancedDifficultySystem.createLevel(newYear, Math.max(1, Math.min(4, newSubLevel)));
  }

  /**
   * Get recent performance history for specific model
   */
  private static getRecentHistory(
    session: StudentSession,
    modelId: string,
    count: number
  ): PerformanceData[] {
    return session.performanceHistory
      .filter(p => p.modelId === modelId)
      .slice(-count);
  }

  /**
   * Count consecutive correct answers from end of history
   */
  private static getConsecutiveCorrect(history: PerformanceData[]): number {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].isCorrect) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Count consecutive incorrect answers from end of history
   */
  private static getConsecutiveIncorrect(history: PerformanceData[]): number {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (!history[i].isCorrect) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Calculate accuracy percentage from performance history
   */
  private static getAccuracy(history: PerformanceData[]): number {
    if (history.length === 0) return 0.5; // Default to 50% when no data
    
    const correct = history.filter(p => p.isCorrect).length;
    return correct / history.length;
  }

  /**
   * Get session statistics for monitoring
   */
  static getSessionStats(sessionId: string) {
    const session = this.getSession(sessionId);
    
    return {
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      accuracy: session.totalQuestions > 0 ? session.correctAnswers / session.totalQuestions : 0,
      currentStreak: session.streakCount,
      sessionDuration: Date.now() - session.startTime.getTime(),
      currentLevel: session.currentLevel.displayName,
      adaptiveMode: session.adaptiveMode,
      confidenceMode: session.confidenceMode
    };
  }

  /**
   * Enable/disable confidence mode
   */
  static setConfidenceMode(sessionId: string, enabled: boolean): void {
    const session = this.getSession(sessionId);
    session.confidenceMode = enabled;
    if (enabled) {
      session.adaptiveMode = false; // Disable adaptive progression in confidence mode
    }
    this.sessions.set(sessionId, session);
  }

  /**
   * Enable/disable adaptive mode
   */
  static setAdaptiveMode(sessionId: string, enabled: boolean): void {
    const session = this.getSession(sessionId);
    session.adaptiveMode = enabled;
    this.sessions.set(sessionId, session);
  }

  /**
   * Reset session (for testing or new student)
   */
  static resetSession(sessionId: string): void {
    const session = this.getSession(sessionId);
    session.performanceHistory = [];
    session.streakCount = 0;
    session.totalQuestions = 0;
    session.correctAnswers = 0;
    session.startTime = new Date();
    this.sessions.set(sessionId, session);
  }

  /**
   * Get all active sessions (for classroom monitoring)
   */
  static getAllSessions(): StudentSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clean up old sessions (call periodically)
   */
  static cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions) {
      if (session.startTime < cutoffTime) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Export session data for analysis
   */
  static exportSessionData(sessionId: string): object {
    const session = this.getSession(sessionId);
    return {
      sessionInfo: {
        sessionId: session.sessionId,
        studentId: session.studentId,
        startTime: session.startTime,
        duration: Date.now() - session.startTime.getTime(),
        currentLevel: session.currentLevel.displayName
      },
      performance: {
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        accuracy: session.totalQuestions > 0 ? session.correctAnswers / session.totalQuestions : 0,
        currentStreak: session.streakCount
      },
      history: session.performanceHistory,
      settings: {
        adaptiveMode: session.adaptiveMode,
        confidenceMode: session.confidenceMode
      }
    };
  }
}