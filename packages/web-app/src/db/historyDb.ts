import Dexie, { type Table } from 'dexie';
import type { OrganicFunction, DifficultyTier } from '@quimicarush/chemistry-core';

export interface UserAttempt {
  id?: number;
  moleculeId: string;
  userInput: string;
  targetIupac: string;
  score: number; // 0.0 to 1.0
  isPerfect: boolean;
  timestamp: number;
  functionId: OrganicFunction;
  difficulty: DifficultyTier;
}

export interface FunctionMasteryStat {
  functionId: OrganicFunction;
  totalAttempts: number;
  correctCount: number;
  masteryPercentage: number; // 0 to 100
  averageScore: number; // 0 to 100
  lastTrainedAt: number;
}

export interface HighScoreRecord {
  id?: number;
  streak: number;
  score: number;
  totalQuestions: number;
  achievedAt: number;
}

export interface UnlockedBadgeRecord {
  badgeId: string;
  unlockedAt: number;
}

export class QuimicaRushDatabase extends Dexie {
  attempts!: Table<UserAttempt, number>;
  functionStats!: Table<FunctionMasteryStat, OrganicFunction>;
  highScores!: Table<HighScoreRecord, number>;
  unlockedBadges!: Table<UnlockedBadgeRecord, string>;

  constructor() {
    super('QuimicaRushHistoryDB');
    this.version(1).stores({
      attempts: '++id, moleculeId, timestamp, functionId, difficulty, isPerfect',
      functionStats: 'functionId, masteryPercentage, lastTrainedAt',
      highScores: '++id, streak, score, achievedAt',
    });
    this.version(2).stores({
      unlockedBadges: 'badgeId, unlockedAt',
    });
  }

  /**
   * Records a user attempt and updates functional group mastery aggregate statistics.
   */
  public async recordAttempt(attempt: Omit<UserAttempt, 'id'>): Promise<void> {
    try {
      await this.attempts.add(attempt);

      const current = await this.functionStats.get(attempt.functionId);
      const prevAttempts = current ? current.totalAttempts : 0;
      const prevCorrect = current ? current.correctCount : 0;
      const prevScoreSum = current ? (current.averageScore * prevAttempts) / 100 : 0;

      const newAttempts = prevAttempts + 1;
      const newCorrect = prevCorrect + (attempt.score >= 0.8 ? 1 : 0);
      const newScoreSum = prevScoreSum + attempt.score;
      const newAvg = (newScoreSum / newAttempts) * 100;
      const newMastery = Math.min(100, Math.round((newCorrect / newAttempts) * 100));

      await this.functionStats.put({
        functionId: attempt.functionId,
        totalAttempts: newAttempts,
        correctCount: newCorrect,
        masteryPercentage: newMastery,
        averageScore: Math.round(newAvg),
        lastTrainedAt: attempt.timestamp,
      });
    } catch (err) {
      console.warn('historyDb.recordAttempt encountered an error (e.g. storage disabled):', err);
    }
  }

  /**
   * Retrieves recent user attempts ordered by timestamp descending.
   */
  public async getRecentAttempts(limit: number = 20): Promise<UserAttempt[]> {
    try {
      return await this.attempts.orderBy('timestamp').reverse().limit(limit).toArray();
    } catch (err) {
      console.warn('historyDb.getRecentAttempts encountered an error:', err);
      return [];
    }
  }

  /**
   * Retrieves all functional group mastery statistics.
   */
  public async getFunctionStats(): Promise<FunctionMasteryStat[]> {
    try {
      return await this.functionStats.toArray();
    } catch (err) {
      console.warn('historyDb.getFunctionStats encountered an error:', err);
      return [];
    }
  }

  /**
   * Records a high score milestone.
   */
  public async recordHighScore(record: Omit<HighScoreRecord, 'id'>): Promise<void> {
    try {
      await this.highScores.add(record);
    } catch (err) {
      console.warn('historyDb.recordHighScore encountered an error:', err);
    }
  }

  /**
   * Retrieves top streak records.
   */
  public async getTopHighScores(limit: number = 5): Promise<HighScoreRecord[]> {
    try {
      return await this.highScores.orderBy('streak').reverse().limit(limit).toArray();
    } catch (err) {
      console.warn('historyDb.getTopHighScores encountered an error:', err);
      return [];
    }
  }

  /**
   * Records an unlocked achievement badge.
   */
  public async recordUnlockedBadge(badgeId: string): Promise<void> {
    try {
      await this.unlockedBadges.put({
        badgeId,
        unlockedAt: Date.now(),
      });
    } catch (err) {
      console.warn('historyDb.recordUnlockedBadge encountered an error:', err);
    }
  }

  /**
   * Retrieves all unlocked badges.
   */
  public async getUnlockedBadges(): Promise<UnlockedBadgeRecord[]> {
    try {
      return await this.unlockedBadges.toArray();
    } catch (err) {
      console.warn('historyDb.getUnlockedBadges encountered an error:', err);
      return [];
    }
  }

  /**
   * Clears all historical data (for resetting user profile).
   */
  public async clearAll(): Promise<void> {
    try {
      await this.attempts.clear();
      await this.functionStats.clear();
      await this.highScores.clear();
      await this.unlockedBadges.clear();
    } catch (err) {
      console.warn('historyDb.clearAll encountered an error:', err);
    }
  }
}

export const historyDb = new QuimicaRushDatabase();
