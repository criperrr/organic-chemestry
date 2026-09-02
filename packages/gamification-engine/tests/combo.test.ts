import { describe, it, expect, vi } from 'vitest';
import {
  ComboManager,
  getMultiplierForStreak,
  getTierForStreak,
  calculateXP,
  calculateSpeedBonusXP,
  getLevelForXP,
  getXPForLevel,
  getLevelProgress,
  getLevelTitle,
  getLevelTitleInfo,
  LEVEL_THRESHOLDS,
  LEVEL_TITLES,
  MAX_LEVEL,
  MIN_LEVEL,
  DEFAULT_BASE_XP,
  SPEED_BLITZ_THRESHOLD_MS,
  SPEED_BLITZ_MULTIPLIER,
  ALL_BADGES,
  checkNewAchievements,
} from '../src/combo-manager.js';

describe('Multiplier & Tiers', () => {
  it('should return correct multiplier for each streak stage', () => {
    // Streak 0-2: 1.0x
    expect(getMultiplierForStreak(0)).toBe(1.0);
    expect(getMultiplierForStreak(1)).toBe(1.0);
    expect(getMultiplierForStreak(2)).toBe(1.0);

    // Streak 3-5: 1.5x
    expect(getMultiplierForStreak(3)).toBe(1.5);
    expect(getMultiplierForStreak(4)).toBe(1.5);
    expect(getMultiplierForStreak(5)).toBe(1.5);

    // Streak 6-9: 2.0x
    expect(getMultiplierForStreak(6)).toBe(2.0);
    expect(getMultiplierForStreak(8)).toBe(2.0);
    expect(getMultiplierForStreak(9)).toBe(2.0);

    // Streak 10-14: 3.0x
    expect(getMultiplierForStreak(10)).toBe(3.0);
    expect(getMultiplierForStreak(12)).toBe(3.0);
    expect(getMultiplierForStreak(14)).toBe(3.0);

    // Streak 15+: 5.0x
    expect(getMultiplierForStreak(15)).toBe(5.0);
    expect(getMultiplierForStreak(25)).toBe(5.0);
    expect(getMultiplierForStreak(100)).toBe(5.0);
  });

  it('should return correct tier metadata and label for streaks', () => {
    const tier0 = getTierForStreak(0);
    expect(tier0.multiplier).toBe(1.0);
    expect(tier0.label).toBe('NORMAL');
    expect(tier0.isFire).toBe(false);

    const tier3 = getTierForStreak(3);
    expect(tier3.multiplier).toBe(1.5);
    expect(tier3.label).toBe('AQUECENDO');
    expect(tier3.isFire).toBe(false);

    const tier6 = getTierForStreak(6);
    expect(tier6.multiplier).toBe(2.0);
    expect(tier6.label).toBe('REATIVO');
    expect(tier6.isFire).toBe(false);

    const tier10 = getTierForStreak(10);
    expect(tier10.multiplier).toBe(3.0);
    expect(tier10.label).toBe('SUPER REATIVO');
    expect(tier10.isFire).toBe(false);

    const tier15 = getTierForStreak(15);
    expect(tier15.multiplier).toBe(5.0);
    expect(tier15.label).toBe('AROMÁTICO ON FIRE 🔥');
    expect(tier15.isFire).toBe(true);
  });
});

describe('XP & Speed Blitz Calculation', () => {
  it('should calculate XP accurately with multiplier and perfect accuracy', () => {
    const xp = calculateXP(100, 1.5, 1.0);
    expect(xp).toBe(150);
  });

  it('should calculate Speed Blitz bonus correctly', () => {
    // Standard: 100 * 2.0 = 200. Speed blitz: 200 * 1.5 = 300
    const regularXP = calculateXP(100, 2.0, 1.0, false);
    const speedXP = calculateXP(100, 2.0, 1.0, true);
    expect(regularXP).toBe(200);
    expect(speedXP).toBe(300);

    const bonus = calculateSpeedBonusXP(100, 2.0, 1.0);
    expect(bonus).toBe(100);
    expect(SPEED_BLITZ_THRESHOLD_MS).toBe(4000);
    expect(SPEED_BLITZ_MULTIPLIER).toBe(1.5);
  });

  it('should calculate XP with partial credit accuracy score', () => {
    // 100 * 2.0 * 0.75 = 150
    expect(calculateXP(100, 2.0, 0.75)).toBe(150);
    // 100 * 3.0 * 0.5 = 150
    expect(calculateXP(100, 3.0, 0.5)).toBe(150);
    // 100 * 5.0 * 0.33 = 165
    expect(calculateXP(100, 5.0, 0.33)).toBe(165);
  });

  it('should return 0 XP when accuracy or base XP is zero or negative', () => {
    expect(calculateXP(100, 2.0, 0)).toBe(0);
    expect(calculateXP(100, 2.0, -0.5)).toBe(0);
    expect(calculateXP(0, 2.0, 1.0)).toBe(0);
    expect(calculateXP(-50, 2.0, 1.0)).toBe(0);
    expect(calculateXP(100, -1.0, 1.0)).toBe(0);
  });

  it('should clamp accuracy above 1.0 to 1.0', () => {
    expect(calculateXP(100, 2.0, 1.5)).toBe(200);
  });
});

describe('Level Progression & Dynamic Titles (Levels 1 to 50)', () => {
  it('should have 51 threshold entries and level 1 should require 0 XP', () => {
    expect(LEVEL_THRESHOLDS.length).toBe(MAX_LEVEL + 1);
    expect(LEVEL_THRESHOLDS[1]).toBe(0);
    expect(getXPForLevel(1)).toBe(0);
  });

  it('should strictly increase required XP monotonically for each level', () => {
    for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
      expect(LEVEL_THRESHOLDS[lvl]).toBeGreaterThan(LEVEL_THRESHOLDS[lvl - 1]);
    }
  });

  it('should compute the correct level for various XP amounts', () => {
    expect(getLevelForXP(0)).toBe(1);
    expect(getLevelForXP(-100)).toBe(1);
    expect(getLevelForXP(LEVEL_THRESHOLDS[2] - 1)).toBe(1);
    expect(getLevelForXP(LEVEL_THRESHOLDS[2])).toBe(2);
    expect(getLevelForXP(LEVEL_THRESHOLDS[5])).toBe(5);
    expect(getLevelForXP(LEVEL_THRESHOLDS[MAX_LEVEL])).toBe(MAX_LEVEL);
    expect(getLevelForXP(9999999)).toBe(MAX_LEVEL);
  });

  it('should assign appropriate dynamic titles for levels 1 through 50', () => {
    expect(getLevelTitle(1)).toBe('Calouro de Alquimia');
    expect(getLevelTitle(3)).toBe('Aprendiz de Valências');
    expect(getLevelTitle(5)).toBe('Manipulador de Cadeias');
    expect(getLevelTitle(8)).toBe('Domador de Insaturações');
    expect(getLevelTitle(10)).toBe('Mestre dos Orbitais');
    expect(getLevelTitle(20)).toBe('Soberano dos Aromáticos');
    expect(getLevelTitle(30)).toBe('Lorde da Termodinâmica');
    expect(getLevelTitle(50)).toBe('Nobel da Química Orgânica');

    const info = getLevelTitleInfo(50);
    expect(info.badgeEmoji).toBe('🏆');
    expect(LEVEL_TITLES.length).toBeGreaterThanOrEqual(8);
  });

  it('should calculate LevelProgress metrics correctly including title', () => {
    const progressLvl1 = getLevelProgress(0);
    expect(progressLvl1.level).toBe(1);
    expect(progressLvl1.title).toBe('Calouro de Alquimia');
    expect(progressLvl1.currentLevelXP).toBe(0);
    expect(progressLvl1.xpForNextLevel).toBe(LEVEL_THRESHOLDS[2]);
    expect(progressLvl1.progressPercent).toBe(0);
    expect(progressLvl1.isMaxLevel).toBe(false);

    // Halfway between level 1 and level 2
    const halfwayXP = Math.floor(LEVEL_THRESHOLDS[2] / 2);
    const progressHalf = getLevelProgress(halfwayXP);
    expect(progressHalf.level).toBe(1);
    expect(progressHalf.currentLevelXP).toBe(halfwayXP);
    expect(progressHalf.progressPercent).toBeGreaterThanOrEqual(49);
    expect(progressHalf.progressPercent).toBeLessThanOrEqual(51);

    // Max level progress
    const maxProgress = getLevelProgress(LEVEL_THRESHOLDS[50] + 5000);
    expect(maxProgress.level).toBe(50);
    expect(maxProgress.title).toBe('Nobel da Química Orgânica');
    expect(maxProgress.isMaxLevel).toBe(true);
    expect(maxProgress.progressPercent).toBe(100);
    expect(maxProgress.xpRemaining).toBe(0);
  });
});

describe('Achievements & Badges System', () => {
  it('should define at least 8 unique badges', () => {
    expect(ALL_BADGES.length).toBeGreaterThanOrEqual(8);
    const ids = ALL_BADGES.map((b) => b.id);
    expect(ids).toContain('first_blood');
    expect(ids).toContain('streak_5');
    expect(ids).toContain('streak_10');
    expect(ids).toContain('streak_20');
    expect(ids).toContain('speed_demon');
    expect(ids).toContain('priority_master');
    expect(ids).toContain('chaos_survivor');
    expect(ids).toContain('polymath');
  });

  it('should unlock first_blood on first perfect answer', () => {
    const unlocked = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 1,
      maxStreak: 1,
      responseTimeMs: 5000,
      totalXP: 100,
      level: 1,
      unlockedBadgeIds: [],
    });

    const unlockedIds = unlocked.map((b) => b.id);
    expect(unlockedIds).toContain('first_blood');
    expect(unlockedIds).not.toContain('speed_demon');
  });

  it('should unlock speed_demon when answered perfectly in < 3s', () => {
    const unlocked = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 1,
      maxStreak: 1,
      responseTimeMs: 2400,
      totalXP: 100,
      level: 1,
      unlockedBadgeIds: ['first_blood'],
    });

    const unlockedIds = unlocked.map((b) => b.id);
    expect(unlockedIds).toContain('speed_demon');
  });

  it('should unlock streak milestones sequentially', () => {
    const u5 = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 5,
      maxStreak: 5,
      responseTimeMs: 6000,
      totalXP: 500,
      level: 3,
      unlockedBadgeIds: ['first_blood'],
    });
    expect(u5.map((b) => b.id)).toContain('streak_5');

    const u10 = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 10,
      maxStreak: 10,
      responseTimeMs: 6000,
      totalXP: 1500,
      level: 5,
      unlockedBadgeIds: ['first_blood', 'streak_5'],
    });
    expect(u10.map((b) => b.id)).toContain('streak_10');

    const u20 = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 20,
      maxStreak: 20,
      responseTimeMs: 6000,
      totalXP: 4500,
      level: 8,
      unlockedBadgeIds: ['first_blood', 'streak_5', 'streak_10'],
    });
    expect(u20.map((b) => b.id)).toContain('streak_20');
  });

  it('should unlock chaos_survivor and polymath when conditions are met', () => {
    const chaosUnlocked = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 1,
      maxStreak: 1,
      responseTimeMs: 7000,
      difficulty: 'caos',
      isChaos: true,
      totalXP: 200,
      level: 2,
      unlockedBadgeIds: ['first_blood'],
    });
    expect(chaosUnlocked.map((b) => b.id)).toContain('chaos_survivor');

    const polymathUnlocked = checkNewAchievements({
      isPerfect: true,
      score: 1.0,
      streak: 16,
      maxStreak: 16,
      responseTimeMs: 5000,
      totalXP: 3000,
      level: 7,
      uniqueFunctionsCount: 16,
      unlockedBadgeIds: ['first_blood'],
    });
    expect(polymathUnlocked.map((b) => b.id)).toContain('polymath');
  });
});

describe('ComboManager Class', () => {
  it('should initialize with default values', () => {
    const manager = new ComboManager();
    expect(manager.getStreak()).toBe(0);
    expect(manager.getMaxStreak()).toBe(0);
    expect(manager.getTotalXP()).toBe(0);
    expect(manager.getLevel()).toBe(MIN_LEVEL);
    expect(manager.getTitle()).toBe('Calouro de Alquimia');
    expect(manager.getMultiplier()).toBe(1.0);
    expect(manager.isFire()).toBe(false);
  });

  it('should handle speed blitz bonus in recordSuccess', () => {
    const manager = new ComboManager({ baseXP: 100 });
    // Speed blitz under 4s
    const res = manager.recordSuccess(1.0, 100, 2500);
    expect(res.isSpeedBlitz).toBe(true);
    expect(res.speedBonusXP).toBe(50); // 100 * 1.0 * 1.5 = 150 (bonus 50)
    expect(res.xpGained).toBe(150);
  });

  it('should track streaks and compute multipliers and maxStreak', () => {
    const manager = new ComboManager({ baseXP: 100 });

    // Answer 1: streak 1 -> multiplier 1.0 -> xp 100
    const res1 = manager.recordSuccess(1.0);
    expect(res1.streak).toBe(1);
    expect(res1.maxStreak).toBe(1);
    expect(res1.multiplier).toBe(1.0);
    expect(res1.xpGained).toBe(100);
    expect(manager.getStreak()).toBe(1);

    // Answer 2: streak 2 -> multiplier 1.0 -> xp 100
    manager.recordSuccess(1.0);
    expect(manager.getStreak()).toBe(2);

    // Answer 3: streak 3 -> multiplier 1.5 -> xp 150
    const res3 = manager.recordSuccess(1.0);
    expect(res3.streak).toBe(3);
    expect(res3.multiplier).toBe(1.5);
    expect(res3.xpGained).toBe(150);

    // Up to streak 6 -> multiplier 2.0
    manager.recordSuccess(1.0); // 4
    manager.recordSuccess(1.0); // 5
    const res6 = manager.recordSuccess(1.0); // 6
    expect(res6.streak).toBe(6);
    expect(res6.multiplier).toBe(2.0);
    expect(res6.xpGained).toBe(200);

    // Up to streak 10 -> multiplier 3.0 (isFire active)
    manager.recordSuccess(1.0); // 7
    manager.recordSuccess(1.0); // 8
    manager.recordSuccess(1.0); // 9
    const res10 = manager.recordSuccess(1.0); // 10
    expect(res10.streak).toBe(10);
    expect(res10.multiplier).toBe(3.0);
    expect(res10.isFire).toBe(true);
    expect(res10.xpGained).toBe(300);

    // Up to streak 15 -> multiplier 5.0 (AROMÁTICO ON FIRE)
    for (let s = 11; s <= 14; s++) {
      manager.recordSuccess(1.0);
    }
    const res15 = manager.recordSuccess(1.0); // 15
    expect(res15.streak).toBe(15);
    expect(res15.multiplier).toBe(5.0);
    expect(res15.tier.label).toBe('AROMÁTICO ON FIRE 🔥');
    expect(res15.isFire).toBe(true);
    expect(manager.isFire()).toBe(true);
  });

  it('should reset current streak to 0 on failure but preserve maxStreak and totalXP', () => {
    const manager = new ComboManager({ baseXP: 100 });
    manager.recordSuccess(1.0);
    manager.recordSuccess(1.0);
    manager.recordSuccess(1.0); // streak 3, maxStreak 3

    const totalBefore = manager.getTotalXP();
    expect(manager.getStreak()).toBe(3);
    expect(manager.getMaxStreak()).toBe(3);

    const failRes = manager.recordFailure();
    expect(failRes.isCorrect).toBe(false);
    expect(failRes.streak).toBe(0);
    expect(failRes.maxStreak).toBe(3);
    expect(failRes.xpGained).toBe(0);
    expect(manager.getStreak()).toBe(0);
    expect(manager.getMaxStreak()).toBe(3);
    expect(manager.getTotalXP()).toBe(totalBefore);

    // Next success starts streak at 1, maxStreak stays 3
    const nextSuccess = manager.recordSuccess(1.0);
    expect(nextSuccess.streak).toBe(1);
    expect(nextSuccess.maxStreak).toBe(3);
  });

  it('should trigger milestone callbacks at streak 5, 10, 15', () => {
    const milestoneSpy = vi.fn();
    const manager = new ComboManager({ onMilestone: milestoneSpy });

    for (let i = 1; i <= 15; i++) {
      manager.recordSuccess(1.0);
    }

    expect(milestoneSpy).toHaveBeenCalledTimes(3);
    expect(milestoneSpy).toHaveBeenNthCalledWith(1, 5, expect.objectContaining({ multiplier: 1.5 }));
    expect(milestoneSpy).toHaveBeenNthCalledWith(2, 10, expect.objectContaining({ multiplier: 3.0 }));
    expect(milestoneSpy).toHaveBeenNthCalledWith(3, 15, expect.objectContaining({ multiplier: 5.0 }));
  });

  it('should trigger level-up callback when XP crosses level threshold', () => {
    const levelUpSpy = vi.fn();
    const manager = new ComboManager({ baseXP: DEFAULT_BASE_XP, onLevelUp: levelUpSpy });

    const r1 = manager.recordSuccess(1.0);
    expect(r1.leveledUp).toBe(false);
    expect(levelUpSpy).not.toHaveBeenCalled();

    const r2 = manager.recordSuccess(1.0);
    expect(r2.leveledUp).toBe(true);
    expect(r2.newLevel).toBe(2);
    expect(levelUpSpy).toHaveBeenCalledWith(2, 1);
  });

  it('should handle recordAnswer with boolean and accuracy properly', () => {
    const manager = new ComboManager();

    // False answer
    const fRes = manager.recordAnswer(false);
    expect(fRes.isCorrect).toBe(false);
    expect(fRes.streak).toBe(0);

    // True answer with partial accuracy
    const sRes = manager.recordAnswer(true, 0.8, 200);
    expect(sRes.isCorrect).toBe(true);
    expect(sRes.streak).toBe(1);
    expect(sRes.xpGained).toBe(Math.round(200 * 1.0 * 0.8));
  });

  it('should serialize and restore state correctly', () => {
    const manager = new ComboManager();
    manager.recordSuccess(1.0);
    manager.recordSuccess(1.0);
    manager.recordSuccess(1.0);

    const state = manager.getState();
    expect(state.currentStreak).toBe(3);
    expect(state.maxStreak).toBe(3);
    expect(state.totalXP).toBeGreaterThan(0);

    const restoredManager = new ComboManager();
    restoredManager.restoreState(state);

    expect(restoredManager.getStreak()).toBe(3);
    expect(restoredManager.getMaxStreak()).toBe(3);
    expect(restoredManager.getTotalXP()).toBe(state.totalXP);
    expect(restoredManager.getLevel()).toBe(state.level);
  });
});
