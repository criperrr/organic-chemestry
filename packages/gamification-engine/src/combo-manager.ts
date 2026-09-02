/**
 * Combo and streak manager for QuímicaRush.
 * Handles streak multipliers, Speed Blitz bonus, dynamic level titles (1-50),
 * achievement badges, and progressive XP curves.
 */

export interface MultiplierTier {
  readonly multiplier: number;
  readonly label: string;
  readonly minStreak: number;
  readonly maxStreak: number | null;
  readonly isFire: boolean;
}

export const MULTIPLIER_TIERS: readonly MultiplierTier[] = [
  {
    multiplier: 1.0,
    label: 'NORMAL',
    minStreak: 0,
    maxStreak: 2,
    isFire: false,
  },
  {
    multiplier: 1.5,
    label: 'AQUECENDO',
    minStreak: 3,
    maxStreak: 5,
    isFire: false,
  },
  {
    multiplier: 2.0,
    label: 'REATIVO',
    minStreak: 6,
    maxStreak: 9,
    isFire: false,
  },
  {
    multiplier: 3.0,
    label: 'SUPER REATIVO',
    minStreak: 10,
    maxStreak: 14,
    isFire: false,
  },
  {
    multiplier: 5.0,
    label: 'AROMÁTICO ON FIRE 🔥',
    minStreak: 15,
    maxStreak: null,
    isFire: true,
  },
] as const;

export const DEFAULT_BASE_XP = 100;
export const MAX_LEVEL = 50;
export const MIN_LEVEL = 1;

export const SPEED_BLITZ_THRESHOLD_MS = 4000;
export const SPEED_BLITZ_MULTIPLIER = 1.5;

// ==========================================
// Level Titles (Levels 1 to 50)
// ==========================================

export interface LevelTitleInfo {
  readonly minLevel: number;
  readonly title: string;
  readonly badgeEmoji: string;
  readonly description: string;
}

export const LEVEL_TITLES: readonly LevelTitleInfo[] = [
  {
    minLevel: 1,
    title: 'Calouro de Alquimia',
    badgeEmoji: '🧪',
    description: 'Iniciando os primeiros passos nas cadeias carbônicas.',
  },
  {
    minLevel: 3,
    title: 'Aprendiz de Valências',
    badgeEmoji: '⚗️',
    description: 'Compreendendo o carbono tetravalente e hibridizações.',
  },
  {
    minLevel: 5,
    title: 'Manipulador de Cadeias',
    badgeEmoji: '🔗',
    description: 'Identifica prefixos e ramificações com agilidade.',
  },
  {
    minLevel: 8,
    title: 'Domador de Insaturações',
    badgeEmoji: '⚡',
    description: 'Ligações duplas e triplas não escondem segredos.',
  },
  {
    minLevel: 10,
    title: 'Mestre dos Orbitais',
    badgeEmoji: '🪐',
    description: 'Visão tridimensional e reatividade funcional afiada.',
  },
  {
    minLevel: 15,
    title: 'Alquimista da Ressonância',
    badgeEmoji: '🔮',
    description: 'Entende a deslocalização eletrônica pi perfeitamente.',
  },
  {
    minLevel: 20,
    title: 'Soberano dos Aromáticos',
    badgeEmoji: '👑',
    description: 'Domina o benzeno, fenóis e anéis aromáticos conjugados.',
  },
  {
    minLevel: 25,
    title: 'Comandante Eletrofílico',
    badgeEmoji: '🛡️',
    description: 'Nenhum mecanismo de ataque eletrófilo o intimida.',
  },
  {
    minLevel: 30,
    title: 'Lorde da Termodinâmica',
    badgeEmoji: '🔥',
    description: 'Equilíbrio quântico e estabilidade conformacional absoluta.',
  },
  {
    minLevel: 40,
    title: 'Grão-Mestre da Síntese',
    badgeEmoji: '💎',
    description: 'Cria e nomeia compostos polifuncionais complexos.',
  },
  {
    minLevel: 50,
    title: 'Nobel da Química Orgânica',
    badgeEmoji: '🏆',
    description: 'Lenda viva suprema da nomenclatura sistemática IUPAC.',
  },
] as const;

/**
 * Returns detailed title and metadata for a given level (1 to 50).
 */
export function getLevelTitleInfo(level: number): LevelTitleInfo {
  const safeLevel = Math.max(1, Math.floor(level));
  let matched = LEVEL_TITLES[0];
  for (const item of LEVEL_TITLES) {
    if (safeLevel >= item.minLevel) {
      matched = item;
    } else {
      break;
    }
  }
  return matched;
}

/**
 * Returns string title name for a given level.
 */
export function getLevelTitle(level: number): string {
  return getLevelTitleInfo(level).title;
}

// ==========================================
// Badges / Achievements System
// ==========================================

export type BadgeCategory = 'streak' | 'speed' | 'mastery' | 'special';

export interface Badge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: BadgeCategory;
}

export const ALL_BADGES: readonly Badge[] = [
  {
    id: 'first_blood',
    title: 'Primeiro Acerto',
    description: 'Primeiro acerto perfeito na nomenclatura sistemática IUPAC',
    icon: '🎯',
    category: 'mastery',
  },
  {
    id: 'streak_5',
    title: 'Aquecendo',
    description: 'Alcançou uma sequência ininterrupta de 5 acertos',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'streak_10',
    title: 'Fogo Atômico',
    description: 'Atingiu combo de 10 acertos seguidos ("AROMÁTICO ON FIRE")',
    icon: '⚡',
    category: 'streak',
  },
  {
    id: 'streak_20',
    title: 'Aromático Imortal',
    description: 'Atingiu o ápice com 20 acertos perfeitos consecutivos',
    icon: '👑',
    category: 'streak',
  },
  {
    id: 'speed_demon',
    title: 'Demônio da Velocidade',
    description: 'Resposta correta submetida em menos de 3 segundos',
    icon: '⏱️',
    category: 'speed',
  },
  {
    id: 'priority_master',
    title: 'Mestre das Prioridades',
    description: 'Acertou composto polifuncional de alta complexidade',
    icon: '🧠',
    category: 'mastery',
  },
  {
    id: 'chaos_survivor',
    title: 'Sobrevivente do Caos',
    description: 'Dominou com perfeição uma molécula sintética do Modo Caos',
    icon: '☣️',
    category: 'special',
  },
  {
    id: 'polymath',
    title: 'Polímata Orgânico',
    description: 'Acertou pelo menos uma molécula de cada uma das 16 funções',
    icon: '🌟',
    category: 'mastery',
  },
  {
    id: 'level_10',
    title: 'Mestre Ascendente',
    description: 'Evoluiu até o Nível 10 de Mestria Orgânica',
    icon: '🪐',
    category: 'mastery',
  },
  {
    id: 'centurion',
    title: 'Centurião da Síntese',
    description: 'Acumulou mais de 5.000 XP totais na carreira',
    icon: '💯',
    category: 'special',
  },
] as const;

export interface AchievementEvaluationContext {
  isPerfect: boolean;
  score: number;
  streak: number;
  maxStreak: number;
  responseTimeMs: number;
  difficulty?: string;
  primaryFunction?: string;
  isChaos?: boolean;
  totalXP: number;
  level: number;
  uniqueFunctionsCount?: number;
  unlockedBadgeIds: Iterable<string>;
}

/**
 * Checks which achievements should be unlocked given the current session state.
 */
export function checkNewAchievements(
  context: AchievementEvaluationContext
): Badge[] {
  const alreadyUnlocked = new Set(context.unlockedBadgeIds);
  const newlyUnlocked: Badge[] = [];

  const maybeUnlock = (badgeId: string) => {
    if (!alreadyUnlocked.has(badgeId)) {
      const badge = ALL_BADGES.find((b) => b.id === badgeId);
      if (badge) {
        newlyUnlocked.push(badge);
        alreadyUnlocked.add(badgeId);
      }
    }
  };

  const isSuccess = context.isPerfect || context.score >= 0.8;

  // 1. first_blood: first perfect answer
  if (context.isPerfect) {
    maybeUnlock('first_blood');
  }

  // 2. streak_5: streak >= 5
  if (context.streak >= 5 || context.maxStreak >= 5) {
    maybeUnlock('streak_5');
  }

  // 3. streak_10: streak >= 10
  if (context.streak >= 10 || context.maxStreak >= 10) {
    maybeUnlock('streak_10');
  }

  // 4. streak_20: streak >= 20
  if (context.streak >= 20 || context.maxStreak >= 20) {
    maybeUnlock('streak_20');
  }

  // 5. speed_demon: perfect answer in < 3000ms
  if (context.isPerfect && context.responseTimeMs > 0 && context.responseTimeMs < 3000) {
    maybeUnlock('speed_demon');
  }

  // 6. priority_master: complex polyfunctional molecule answered accurately
  if (isSuccess && (context.difficulty === 'avancado' || context.difficulty === 'caos')) {
    maybeUnlock('priority_master');
  }

  // 7. chaos_survivor: perfect score on chaos molecule
  if (context.isPerfect && (context.isChaos || context.difficulty === 'caos')) {
    maybeUnlock('chaos_survivor');
  }

  // 8. polymath: all 16 organic functions mastered
  if (context.uniqueFunctionsCount !== undefined && context.uniqueFunctionsCount >= 16) {
    maybeUnlock('polymath');
  }

  // 9. level_10: reach level 10
  if (context.level >= 10) {
    maybeUnlock('level_10');
  }

  // 10. centurion: >= 5000 XP
  if (context.totalXP >= 5000) {
    maybeUnlock('centurion');
  }

  return newlyUnlocked;
}

// ==========================================
// XP & Level Progression Thresholds
// ==========================================

/**
 * Pre-calculated cumulative XP thresholds for Levels 1 to 50.
 * LEVEL_THRESHOLDS[L] is the total XP needed to reach Level L.
 * Progressive formula: round(75 * (L - 1)^1.65 + 50 * (L - 1))
 */
export const LEVEL_THRESHOLDS: readonly number[] = (() => {
  const thresholds: number[] = [0]; // index 0 unused
  thresholds.push(0); // Level 1 starts at 0 XP
  for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
    const xp = Math.round(75 * Math.pow(lvl - 1, 1.65) + 50 * (lvl - 1));
    thresholds.push(xp);
  }
  return Object.freeze(thresholds);
})();

/**
 * Returns the multiplier value for a given streak count.
 * - Streak 0-2: 1.0x
 * - Streak 3-5: 1.5x
 * - Streak 6-9: 2.0x
 * - Streak 10-14: 3.0x
 * - Streak 15+: 5.0x
 */
export function getMultiplierForStreak(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak <= 5) return 1.5;
  if (streak <= 9) return 2.0;
  if (streak <= 14) return 3.0;
  return 5.0;
}

/**
 * Returns the full MultiplierTier object for a given streak count.
 */
export function getTierForStreak(streak: number): MultiplierTier {
  const mult = getMultiplierForStreak(streak);
  const tier = MULTIPLIER_TIERS.find((t) => t.multiplier === mult);
  return tier ?? MULTIPLIER_TIERS[0];
}

/**
 * Calculates XP earned for an answer:
 * Formula: round(baseXP * multiplier * accuracyScore * speedBlitzMultiplier)
 */
export function calculateXP(
  baseXP: number,
  multiplier: number,
  accuracyScore: number = 1.0,
  isSpeedBlitz: boolean = false
): number {
  if (baseXP <= 0 || accuracyScore <= 0 || multiplier <= 0) return 0;
  const clampedAccuracy = Math.min(1.0, Math.max(0, accuracyScore));
  const speedMult = isSpeedBlitz ? SPEED_BLITZ_MULTIPLIER : 1.0;
  return Math.round(baseXP * multiplier * clampedAccuracy * speedMult);
}

/**
 * Computes isolated speed bonus XP.
 */
export function calculateSpeedBonusXP(
  baseXP: number,
  multiplier: number,
  accuracyScore: number = 1.0
): number {
  const normalXP = calculateXP(baseXP, multiplier, accuracyScore, false);
  const blitzXP = calculateXP(baseXP, multiplier, accuracyScore, true);
  return blitzXP - normalXP;
}

/**
 * Calculates user level (1 to 50) based on total XP.
 */
export function getLevelForXP(totalXP: number): number {
  if (totalXP <= 0) return MIN_LEVEL;
  if (totalXP >= LEVEL_THRESHOLDS[MAX_LEVEL]) return MAX_LEVEL;

  let low = MIN_LEVEL;
  let high = MAX_LEVEL;
  let result = MIN_LEVEL;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (LEVEL_THRESHOLDS[mid] <= totalXP) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, result));
}

/**
 * Gets the total cumulative XP required to achieve a specific level.
 */
export function getXPForLevel(level: number): number {
  const clamped = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level)));
  return LEVEL_THRESHOLDS[clamped];
}

export interface LevelProgress {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  xpRemaining: number;
  progressPercent: number;
  isMaxLevel: boolean;
  title: string;
  titleBadgeEmoji: string;
}

/**
 * Computes detailed progress towards next level.
 */
export function getLevelProgress(totalXP: number): LevelProgress {
  const safeXP = Math.max(0, Math.floor(totalXP));
  const level = getLevelForXP(safeXP);
  const titleInfo = getLevelTitleInfo(level);

  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      totalXP: safeXP,
      currentLevelXP: safeXP - LEVEL_THRESHOLDS[MAX_LEVEL],
      xpForNextLevel: 0,
      xpRemaining: 0,
      progressPercent: 100,
      isMaxLevel: true,
      title: titleInfo.title,
      titleBadgeEmoji: titleInfo.badgeEmoji,
    };
  }

  const currentLevelThreshold = LEVEL_THRESHOLDS[level];
  const nextLevelThreshold = LEVEL_THRESHOLDS[level + 1];
  const currentLevelXP = safeXP - currentLevelThreshold;
  const xpForNextLevel = nextLevelThreshold - currentLevelThreshold;
  const xpRemaining = Math.max(0, nextLevelThreshold - safeXP);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXP / xpForNextLevel) * 100))
  );

  return {
    level,
    totalXP: safeXP,
    currentLevelXP,
    xpForNextLevel,
    xpRemaining,
    progressPercent,
    isMaxLevel: false,
    title: titleInfo.title,
    titleBadgeEmoji: titleInfo.badgeEmoji,
  };
}

export interface ScoreResult {
  isCorrect: boolean;
  accuracy: number;
  streak: number;
  maxStreak: number;
  multiplier: number;
  tier: MultiplierTier;
  xpGained: number;
  speedBonusXP: number;
  isSpeedBlitz: boolean;
  totalXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  isMilestone: boolean;
  isFire: boolean;
}

export interface ComboState {
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
}

export interface ComboManagerOptions {
  baseXP?: number;
  initialStreak?: number;
  initialMaxStreak?: number;
  initialXP?: number;
  onMilestone?: (streak: number, tier: MultiplierTier) => void;
  onLevelUp?: (newLevel: number, oldLevel: number) => void;
}

export class ComboManager {
  private currentStreak: number = 0;
  private maxStreak: number = 0;
  private totalXP: number = 0;
  private defaultBaseXP: number = DEFAULT_BASE_XP;
  private onMilestone?: (streak: number, tier: MultiplierTier) => void;
  private onLevelUp?: (newLevel: number, oldLevel: number) => void;

  constructor(options: ComboManagerOptions = {}) {
    if (options.baseXP !== undefined) {
      this.defaultBaseXP = Math.max(1, options.baseXP);
    }
    if (options.initialStreak !== undefined) {
      this.currentStreak = Math.max(0, options.initialStreak);
    }
    if (options.initialMaxStreak !== undefined) {
      this.maxStreak = Math.max(this.currentStreak, options.initialMaxStreak);
    }
    if (options.initialXP !== undefined) {
      this.totalXP = Math.max(0, options.initialXP);
    }
    this.onMilestone = options.onMilestone;
    this.onLevelUp = options.onLevelUp;
  }

  public getStreak(): number {
    return this.currentStreak;
  }

  public getMaxStreak(): number {
    return this.maxStreak;
  }

  public getTotalXP(): number {
    return this.totalXP;
  }

  public getLevel(): number {
    return getLevelForXP(this.totalXP);
  }

  public getTitle(): string {
    return getLevelTitle(this.getLevel());
  }

  public getMultiplier(): number {
    return getMultiplierForStreak(this.currentStreak);
  }

  public getTier(): MultiplierTier {
    return getTierForStreak(this.currentStreak);
  }

  public isFire(): boolean {
    return this.currentStreak >= 10;
  }

  public getLevelProgress(): LevelProgress {
    return getLevelProgress(this.totalXP);
  }

  /**
   * Checks if a streak constitutes a combo milestone (5, 10, 15, 20, or multiples of 5 thereafter).
   */
  public isMilestoneStreak(streak: number): boolean {
    return (
      streak === 5 ||
      streak === 10 ||
      streak === 15 ||
      streak === 20 ||
      (streak > 20 && streak % 5 === 0)
    );
  }

  /**
   * Records a correct answer.
   * Increments current streak, updates max streak, computes XP (with Speed Blitz bonus)
   * and checks for level-ups.
   */
  public recordSuccess(
    accuracy: number = 1.0,
    baseXP?: number,
    speedIndicator?: number | boolean
  ): ScoreResult {
    const oldLevel = this.getLevel();
    this.currentStreak += 1;

    if (this.currentStreak > this.maxStreak) {
      this.maxStreak = this.currentStreak;
    }

    const isSpeedBlitz =
      typeof speedIndicator === 'boolean'
        ? speedIndicator
        : typeof speedIndicator === 'number'
        ? speedIndicator > 0 && speedIndicator < SPEED_BLITZ_THRESHOLD_MS
        : false;

    const multiplier = this.getMultiplier();
    const tier = this.getTier();
    const xpEffectiveBase = baseXP !== undefined ? Math.max(0, baseXP) : this.defaultBaseXP;
    const xpGained = calculateXP(xpEffectiveBase, multiplier, accuracy, isSpeedBlitz);
    const speedBonusXP = isSpeedBlitz
      ? calculateSpeedBonusXP(xpEffectiveBase, multiplier, accuracy)
      : 0;

    this.totalXP += xpGained;
    const newLevel = this.getLevel();
    const leveledUp = newLevel > oldLevel;
    const isMilestone = this.isMilestoneStreak(this.currentStreak);
    const isFire = this.isFire();

    if (isMilestone && this.onMilestone) {
      this.onMilestone(this.currentStreak, tier);
    }
    if (leveledUp && this.onLevelUp) {
      this.onLevelUp(newLevel, oldLevel);
    }

    return {
      isCorrect: true,
      accuracy,
      streak: this.currentStreak,
      maxStreak: this.maxStreak,
      multiplier,
      tier,
      xpGained,
      speedBonusXP,
      isSpeedBlitz,
      totalXP: this.totalXP,
      oldLevel,
      newLevel,
      leveledUp,
      isMilestone,
      isFire,
    };
  }

  /**
   * Records a failed answer.
   * Resets streak to 0, zero XP gained, preserves max streak and total XP.
   */
  public recordFailure(): ScoreResult {
    this.currentStreak = 0;
    const currentLevel = this.getLevel();
    const multiplier = this.getMultiplier();
    const tier = this.getTier();

    return {
      isCorrect: false,
      accuracy: 0,
      streak: 0,
      maxStreak: this.maxStreak,
      multiplier,
      tier,
      xpGained: 0,
      speedBonusXP: 0,
      isSpeedBlitz: false,
      totalXP: this.totalXP,
      oldLevel: currentLevel,
      newLevel: currentLevel,
      leveledUp: false,
      isMilestone: false,
      isFire: false,
    };
  }

  /**
   * Unified method to record any answer result.
   */
  public recordAnswer(
    isCorrect: boolean,
    accuracy: number = 1.0,
    baseXP?: number,
    speedIndicator?: number | boolean
  ): ScoreResult {
    if (!isCorrect || accuracy <= 0) {
      return this.recordFailure();
    }
    return this.recordSuccess(accuracy, baseXP, speedIndicator);
  }

  /**
   * Resets current streak to 0 without affecting max streak or XP.
   */
  public resetStreak(): void {
    this.currentStreak = 0;
  }

  /**
   * Resets all stats back to zero.
   */
  public reset(): void {
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.totalXP = 0;
  }

  /**
   * Serializes current state to a plain object.
   */
  public getState(): ComboState {
    return {
      currentStreak: this.currentStreak,
      maxStreak: this.maxStreak,
      totalXP: this.totalXP,
      level: this.getLevel(),
    };
  }

  /**
   * Restores state from a serialized object.
   */
  public restoreState(state: Partial<ComboState>): void {
    if (state.currentStreak !== undefined) {
      this.currentStreak = Math.max(0, state.currentStreak);
    }
    if (state.maxStreak !== undefined) {
      this.maxStreak = Math.max(this.currentStreak, state.maxStreak);
    }
    if (state.totalXP !== undefined) {
      this.totalXP = Math.max(0, state.totalXP);
    }
  }
}
