import { create } from 'zustand';
import confetti from 'canvas-confetti';
import {
  evaluateIUPACName,
  type DifficultyTier,
  type EvaluationResult,
  type Molecule,
  type OrganicFunction,
} from '@quimicarush/chemistry-core';
import {
  datasetProvider,
  synthesizeChaosMolecule,
} from '@quimicarush/chemistry-dataset';
import {
  calculateSpeedBonusXP,
  calculateXP,
  checkNewAchievements,
  DEFAULT_BASE_XP,
  FSRSQueue,
  getLevelForXP,
  getLevelProgress,
  getLevelTitle,
  getMultiplierForStreak,
  soundSynth,
  SPEED_BLITZ_THRESHOLD_MS,
  type Badge,
  type LevelProgress,
} from '@quimicarush/gamification-engine';
import { historyDb } from '../db/historyDb.js';
import { haptics } from '../utils/haptics.js';

export type InputMode = 'speedrunner' | 'slotBuilder';
export type ActiveTab = 'arcade' | 'cacar' | 'theory' | 'sandbox';

export type MonetPaletteId = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';

export interface MonetPaletteInfo {
  id: MonetPaletteId;
  name: string;
  seedHex: string;
  tooltip: string;
}

export const MONET_PALETTES: MonetPaletteInfo[] = [
  { id: 'emerald', name: 'Clorofila', seedHex: '#10b981', tooltip: 'Clorofila (Verde Menta)' },
  { id: 'blue', name: 'Oceano', seedHex: '#0284c7', tooltip: 'Oceano (Azul Pixel)' },
  { id: 'purple', name: 'Ametista', seedHex: '#7c3aed', tooltip: 'Ametista (Violeta)' },
  { id: 'amber', name: 'Terracota', seedHex: '#ea580c', tooltip: 'Terracota (Âmbar)' },
  { id: 'rose', name: 'Peônia', seedHex: '#e11d48', tooltip: 'Peônia (Coral / Rosa)' },
  { id: 'slate', name: 'Titânio', seedHex: '#475569', tooltip: 'Titânio (Grafite / Slate)' },
];

function getInitialMonetTheme(): MonetPaletteId {
  return 'slate';
}

export interface RadicalChip {
  id: string;
  locant: string;
  radical: string;
}

export interface SlotBuilderState {
  classPrefix: string;
  radicals: RadicalChip[];
  isRing: boolean;
  chainPrefix: string;
  bondInfix: string;
  bondLocant: string;
  functionSuffix: string;
  suffixLocant: string;
  esterAlkyl: string;
}

export const INITIAL_SLOT_STATE: SlotBuilderState = {
  classPrefix: '',
  radicals: [],
  isRing: false,
  chainPrefix: '',
  bondInfix: 'an',
  bondLocant: '',
  functionSuffix: 'o',
  suffixLocant: '',
  esterAlkyl: '',
};

export interface RewardFloater {
  id: string;
  text: string;
  type: 'xp' | 'speed' | 'combo' | 'level';
  color: string;
}

export interface LevelUpNotice {
  oldLevel: number;
  newLevel: number;
  title: string;
  badgeEmoji: string;
}

export function assembleIUPACFromSlots(slots: SlotBuilderState): string {
  const parts: string[] = [];

  // 1. Class prefix (e.g. "ácido", "anidrido", "cloreto de")
  if (slots.classPrefix.trim()) {
    parts.push(slots.classPrefix.trim());
  }

  // 2. Radicals sorted alphabetically
  if (slots.radicals.length > 0) {
    const sorted = [...slots.radicals].sort((a, b) => {
      const cleanA = a.radical.replace(/[()]/g, '').toLowerCase();
      const cleanB = b.radical.replace(/[()]/g, '').toLowerCase();
      return cleanA.localeCompare(cleanB);
    });

    const radicalStrings = sorted.map((r) => {
      const loc = r.locant.trim();
      return loc ? `${loc}-${r.radical}` : r.radical;
    });

    parts.push(radicalStrings.join('-'));
  }

  // 3. Ring prefix + Chain prefix + Bond infix + Suffix
  let mainPart = '';
  if (slots.isRing) {
    mainPart += 'ciclo';
    if (slots.chainPrefix && slots.chainPrefix.startsWith('h')) {
      mainPart += '-';
    }
  }

  if (slots.chainPrefix) {
    mainPart += slots.chainPrefix;
  }

  // Bonds
  const bondLoc = slots.bondLocant.trim();
  const infix = slots.bondInfix || 'an';
  if (infix === 'an') {
    mainPart += 'an';
  } else {
    if (bondLoc) {
      mainPart += `-${bondLoc}-${infix}`;
    } else {
      mainPart += infix;
    }
  }

  // Suffix
  const sufLoc = slots.suffixLocant.trim();
  const suffix = slots.functionSuffix || 'o';
  if (sufLoc) {
    mainPart += `-${sufLoc}-${suffix}`;
  } else {
    if (suffix.startsWith('o') && mainPart.endsWith('o')) {
      mainPart += suffix.slice(1);
    } else {
      mainPart += suffix;
    }
  }

  if (mainPart) {
    parts.push(mainPart);
  }

  // Ester alkyl part
  if (slots.esterAlkyl.trim()) {
    parts.push(slots.esterAlkyl.trim());
  }

  return parts.join(' ').replace(/-+/g, '-').replace(/ -/g, ' ').replace(/- /g, ' ').trim();
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function loadMoleculesForFilter(
  difficulty: DifficultyTier | 'todos',
  func: OrganicFunction | 'todos'
): Molecule[] {
  if (difficulty === 'caos') {
    const chaosList: Molecule[] = [];
    for (let i = 0; i < 20; i++) {
      chaosList.push(synthesizeChaosMolecule({ targetFunctionCount: 2 + (i % 3) }));
    }
    return chaosList;
  }

  let list = datasetProvider.getAllMolecules();

  if (func !== 'todos') {
    list = list.filter((m) => m.primaryFunction === func);
  }

  if (difficulty !== 'todos') {
    list = list.filter((m) => m.difficulty === difficulty);
  }

  if (list.length === 0) {
    list = datasetProvider.getAllMolecules();
  }

  return shuffleArray(list);
}

export interface GameStore {
  // Session core
  currentMolecule: Molecule | null;
  queue: FSRSQueue<Molecule>;
  score: number;
  streak: number;
  maxStreak: number;
  multiplier: number;
  xp: number;
  level: number;
  levelProgress: LevelProgress;

  // Speed Blitz & Dopamine tracking
  questionStartTime: number;
  lastResponseTimeMs: number;
  lastIsSpeedBlitz: boolean;
  lastSpeedBonusXP: number;
  isFeverActive: boolean;
  /**
   * Variable-ratio reward: roughly one question in twelve is "dourada" and pays
   * triple. Unpredictable jackpots are what keep a practice loop compulsive.
   */
  isGoldenMolecule: boolean;
  /** Correct answers still needed to crack the current session chest. */
  chestGoal: number;
  chestProgress: number;
  chestsOpened: number;

  // Reward floaters & screen shake
  rewardFloaters: RewardFloater[];
  screenShake: boolean;
  nearMissNotice: string | null;

  // Achievements & Level Up notices
  unlockedBadgeIds: string[];
  recentlyUnlockedBadge: Badge | null;
  levelUpNotice: LevelUpNotice | null;
  isAchievementsModalOpen: boolean;
  isCheatsheetOpen: boolean;
  isMobileControlSheetOpen: boolean;
  isMoleculeZoomOpen: boolean;
  quickRadicalMode: { active: boolean; locant?: string };

  // Modality & View
  inputMode: InputMode;
  activeTab: ActiveTab;
  userInput: string;
  slotState: SlotBuilderState;
  isFullscreen: boolean;

  // Evaluation & feedback
  currentEvaluation: EvaluationResult | null;
  isAnswerSubmitted: boolean;
  autoAdvanceTimer: ReturnType<typeof setTimeout> | null;

  // Settings & Filters
  soundEnabled: boolean;
  monetTheme: MonetPaletteId;
  difficultyFilter: DifficultyTier | 'todos';
  functionFilter: OrganicFunction | 'todos';

  // Actions
  initSession: () => void;
  setCurrentMolecule: (mol: Molecule) => void;
  toggleFullscreen: () => void;
  setFullscreen: (val: boolean) => void;
  loadBadgesFromDb: () => Promise<void>;
  setMonetTheme: (theme: MonetPaletteId) => void;
  submitAnswer: () => void;
  retryQuestion: () => void;
  nextQuestion: () => void;
  setUserInput: (input: string) => void;
  setSlotState: (slots: Partial<SlotBuilderState>) => void;
  addRadicalChip: (radical: string, locant?: string) => void;
  removeRadicalChip: (id: string) => void;
  popLastRadicalChip: () => void;
  clearSlotState: () => void;
  toggleInputMode: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  /**
   * Feeds a result from a non-typing game mode (Caça-Funções) into the same
   * XP / streak / combo / badge pipeline the Arcade uses.
   */
  awardModeResult: (input: {
    score: number;
    isPerfect: boolean;
    responseTimeMs: number;
    label: string;
  }) => void;
  setDifficultyFilter: (diff: DifficultyTier | 'todos') => void;
  setFunctionFilter: (func: OrganicFunction | 'todos') => void;
  toggleSound: () => void;
  playSnapSound: () => void;
  playClickSound: () => void;
  playMechanicalKeySound: () => void;
  openAchievementsModal: () => void;
  closeAchievementsModal: () => void;
  toggleCheatsheet: () => void;
  closeCheatsheet: () => void;
  openMobileControlSheet: () => void;
  closeMobileControlSheet: () => void;
  toggleMobileControlSheet: () => void;
  openMoleculeZoom: () => void;
  closeMoleculeZoom: () => void;
  setQuickRadicalMode: (mode: { active: boolean; locant?: string }) => void;
  dismissBadgeToast: () => void;
  /** Rolls the golden-molecule dice for the question being served. */
  rollGoldenMolecule: () => void;
  dismissLevelUpNotice: () => void;
  resetSession: () => void;
}


/**
 * Applies the two variable-reward layers on top of the base XP:
 *  - a golden molecule pays triple;
 *  - every `chestGoal` correct answers cracks a chest worth a flat bonus.
 *
 * Both are deliberately unpredictable: a fixed payout stops feeling like a
 * reward after a dozen repetitions, a variable one does not.
 */
function applyBonusLayers(input: {
  earnedXP: number;
  isSuccess: boolean;
  isGolden: boolean;
  chestProgress: number;
  chestGoal: number;
  chestsOpened: number;
}): {
  finalXP: number;
  goldenBonusXP: number;
  chestBonusXP: number;
  nextChestProgress: number;
  nextChestGoal: number;
  nextChestsOpened: number;
  chestCracked: boolean;
} {
  const goldenActive = input.isGolden && input.isSuccess;
  const goldenBonusXP = goldenActive ? input.earnedXP * 2 : 0;

  const advanced = input.isSuccess ? input.chestProgress + 1 : input.chestProgress;
  const chestCracked = advanced >= input.chestGoal;
  const chestBonusXP = chestCracked ? 40 + input.chestsOpened * 15 : 0;

  return {
    finalXP: input.earnedXP + goldenBonusXP + chestBonusXP,
    goldenBonusXP,
    chestBonusXP,
    nextChestProgress: chestCracked ? 0 : advanced,
    nextChestGoal: chestCracked ? Math.min(12, input.chestGoal + 1) : input.chestGoal,
    nextChestsOpened: chestCracked ? input.chestsOpened + 1 : input.chestsOpened,
    chestCracked,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentMolecule: null,
  queue: new FSRSQueue<Molecule>([], { passThreshold: 0.8, reinsertOffset: 3 }),
  score: 0,
  streak: 0,
  maxStreak: 0,
  multiplier: 1.0,
  xp: 0,
  level: 1,
  levelProgress: getLevelProgress(0),

  questionStartTime: Date.now(),
  lastResponseTimeMs: 0,
  lastIsSpeedBlitz: false,
  lastSpeedBonusXP: 0,
  isFeverActive: false,
  isGoldenMolecule: false,
  chestGoal: 5,
  chestProgress: 0,
  chestsOpened: 0,

  rewardFloaters: [],
  screenShake: false,
  nearMissNotice: null,

  unlockedBadgeIds: [],
  recentlyUnlockedBadge: null,
  levelUpNotice: null,
  isAchievementsModalOpen: false,
  isCheatsheetOpen: false,
  isMobileControlSheetOpen: false,
  isMoleculeZoomOpen: false,
  quickRadicalMode: { active: false },

  inputMode: 'speedrunner',
  activeTab: 'arcade',
  userInput: '',
  slotState: { ...INITIAL_SLOT_STATE },
  isFullscreen: false,

  currentEvaluation: null,
  isAnswerSubmitted: false,
  autoAdvanceTimer: null,

  soundEnabled: true,
  monetTheme: getInitialMonetTheme(),
  difficultyFilter: 'todos',
  functionFilter: 'todos',

  setMonetTheme: (theme: MonetPaletteId) => {
    try {
      localStorage.setItem('quimicarush_theme', theme);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ monetTheme: theme });
  },

  loadBadgesFromDb: async () => {
    try {
      const records = await historyDb.getUnlockedBadges();
      const ids = records.map((r) => r.badgeId);
      set({ unlockedBadgeIds: ids });
    } catch {
      // Fallback
    }
  },

  initSession: () => {
    const { difficultyFilter, functionFilter, monetTheme } = get();

    // Ensure document attribute is set
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', monetTheme);
    }

    const molecules = loadMoleculesForFilter(difficultyFilter, functionFilter);

    const newQueue = new FSRSQueue<Molecule>([], { passThreshold: 0.8, reinsertOffset: 3 });
    newQueue.enqueue(molecules);

    const currentItem = newQueue.getCurrentItem();

    // Load persisted badges
    get().loadBadgesFromDb().catch(() => {});

    set({
      queue: newQueue,
      currentMolecule: currentItem ? currentItem.data : molecules[0] ?? null,
      userInput: '',
      slotState: { ...INITIAL_SLOT_STATE },
      currentEvaluation: null,
      isAnswerSubmitted: false,
      questionStartTime: Date.now(),
      lastIsSpeedBlitz: false,
      lastSpeedBonusXP: 0,
      rewardFloaters: [],
      nearMissNotice: null,
      isGoldenMolecule: Math.random() < 1 / 12,
    });
  },

  submitAnswer: () => {
    const {
      currentMolecule,
      userInput,
      inputMode,
      slotState,
      streak,
      maxStreak,
      xp,
      level,
      score,
      queue,
      soundEnabled,
      isAnswerSubmitted,
      questionStartTime,
      unlockedBadgeIds,
      difficultyFilter,
      isGoldenMolecule,
      chestProgress,
      chestGoal,
      chestsOpened,
    } = get();

    if (!currentMolecule || isAnswerSubmitted) return;

    // Determine final submission string
    const finalAnswer =
      inputMode === 'slotBuilder'
        ? assembleIUPACFromSlots(slotState)
        : userInput.trim();

    if (!finalAnswer) return;

    const responseTimeMs = Math.max(50, Date.now() - questionStartTime);

    // Evaluate against canonical name and accepted synonyms
    const evalResult = evaluateIUPACName(
      finalAnswer,
      currentMolecule.iupacName,
      currentMolecule.commonNames
    );

    // Success criteria
    const isSuccess = evalResult.isPerfect || evalResult.score >= 0.8;
    const isSpeedBlitz = isSuccess && responseTimeMs < SPEED_BLITZ_THRESHOLD_MS;

    // Compute streak and multiplier
    const newStreak = isSuccess ? streak + 1 : 0;
    const newMaxStreak = Math.max(maxStreak, newStreak);
    const multiplier = getMultiplierForStreak(newStreak);
    const isFever = newStreak >= 10;

    // Calculate XP with Speed Blitz bonus
    const baseXP = isSuccess ? DEFAULT_BASE_XP : Math.round(DEFAULT_BASE_XP * 0.2);
    const earnedXP = calculateXP(baseXP, multiplier, evalResult.score, isSpeedBlitz);
    const speedBonusXP = isSpeedBlitz
      ? calculateSpeedBonusXP(baseXP, multiplier, evalResult.score)
      : 0;

    const bonus = applyBonusLayers({
      earnedXP,
      isSuccess,
      isGolden: isGoldenMolecule,
      chestProgress,
      chestGoal,
      chestsOpened,
    });

    const newTotalXP = xp + bonus.finalXP;
    const newLevel = getLevelForXP(newTotalXP);
    const newProgress = getLevelProgress(newTotalXP);
    const newScore = score + bonus.finalXP;
    const leveledUp = newLevel > level;

    // Update FSRS repetition queue
    queue.recordReview(evalResult.score);

    // Sound and haptic feedback
    if (isSuccess) {
      if (leveledUp) {
        haptics.levelUp();
      } else {
        haptics.success();
      }
    } else {
      haptics.error();
    }

    if (soundEnabled) {
      soundSynth.playAnswerFeedback(isSuccess, newStreak, isSpeedBlitz);
      if (leveledUp) {
        soundSynth.playLevelUp();
      }
    }

    // Floating reward pills
    const newFloaters: RewardFloater[] = [];
    if (bonus.finalXP > 0) {
      newFloaters.push({
        id: `xp-${Date.now()}`,
        text: `+${bonus.finalXP} XP`,
        type: 'xp',
        color: '#00f3ff',
      });
    }
    if (bonus.goldenBonusXP > 0) {
      newFloaters.push({
        id: `golden-${Date.now()}`,
        text: `🪙 MOLÉCULA DOURADA — XP TRIPLO!`,
        type: 'combo',
        color: '#ffd700',
      });
    }
    if (bonus.chestCracked) {
      newFloaters.push({
        id: `chest-${Date.now()}`,
        text: `🎁 BAÚ ABERTO (+${bonus.chestBonusXP} XP)!`,
        type: 'level',
        color: '#b537f2',
      });
    }
    if (isSpeedBlitz) {
      newFloaters.push({
        id: `speed-${Date.now()}`,
        text: `⚡ VELOCIDADE TURBO (+${speedBonusXP} XP)!`,
        type: 'speed',
        color: '#ffe600',
      });
    }
    if (multiplier > 1.0 && isSuccess) {
      newFloaters.push({
        id: `combo-${Date.now()}`,
        text: `COMBO x${multiplier.toFixed(1)}!`,
        type: 'combo',
        color: '#ff7700',
      });
    }

    // Screen shake trigger on milestone streaks or perfect answers
    let shouldShake = false;
    if (evalResult.isPerfect || newStreak === 5 || newStreak === 10 || newStreak === 20) {
      shouldShake = true;
      setTimeout(() => {
        set({ screenShake: false });
      }, 350);
    }

    // Confetti celebration on 100% correct or level up
    if (evalResult.isPerfect) {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#00f3ff', '#ffe600', '#00ff88', '#b537f2', '#ff7700'],
      });
    }

    if (leveledUp) {
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff0077', '#00ffff', '#7928ca'],
      });
    }

    if (bonus.chestCracked) {
      shouldShake = true;
      setTimeout(() => set({ screenShake: false }), 350);
      confetti({
        particleCount: 160,
        spread: 110,
        startVelocity: 42,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ffe600', '#b537f2', '#00ff88'],
      });
      if (soundEnabled) soundSynth.playMilestone(6);
    }

    // Check near-miss encouragement for scores between 70% and 95%
    let nearMiss: string | null = null;
    if (!evalResult.isPerfect && evalResult.score >= 0.7 && evalResult.score < 0.95) {
      nearMiss = 'Quase perfeito! Só faltou ajustar um detalhe no localizador ou sufixo. Você está muito perto!';
    }

    // Level-up notice
    const levelUpNoticeData: LevelUpNotice | null = leveledUp
      ? {
          oldLevel: level,
          newLevel: newLevel,
          title: getLevelTitle(newLevel),
          badgeEmoji: newProgress.titleBadgeEmoji,
        }
      : null;

    // Check Achievements & Badges
    const isChaosMolecule = difficultyFilter === 'caos' || currentMolecule.difficulty === 'caos';
    const newlyUnlocked = checkNewAchievements({
      isPerfect: evalResult.isPerfect,
      score: evalResult.score,
      streak: newStreak,
      maxStreak: newMaxStreak,
      responseTimeMs,
      difficulty: currentMolecule.difficulty,
      primaryFunction: currentMolecule.primaryFunction,
      isChaos: isChaosMolecule,
      totalXP: newTotalXP,
      level: newLevel,
      unlockedBadgeIds,
    });

    let updatedBadgeIds = [...unlockedBadgeIds];
    let latestUnlockedBadge: Badge | null = null;

    if (newlyUnlocked.length > 0) {
      latestUnlockedBadge = newlyUnlocked[0];
      for (const badge of newlyUnlocked) {
        if (!updatedBadgeIds.includes(badge.id)) {
          updatedBadgeIds.push(badge.id);
          historyDb.recordUnlockedBadge(badge.id).catch(() => {});
        }
      }
      if (soundEnabled) {
        soundSynth.playBadgeUnlock();
      }
    }

    // Persist attempt to Dexie IndexedDB
    historyDb
      .recordAttempt({
        moleculeId: currentMolecule.id,
        userInput: finalAnswer,
        targetIupac: currentMolecule.iupacName,
        score: evalResult.score,
        isPerfect: evalResult.isPerfect,
        timestamp: Date.now(),
        functionId: currentMolecule.primaryFunction,
        difficulty: currentMolecule.difficulty,
      })
      .catch((err) => {
        console.warn('Failed to record attempt in historyDb:', err);
      });

    // Auto-advance after 850ms if 100% perfect
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (evalResult.isPerfect) {
      timer = setTimeout(() => {
        get().nextQuestion();
      }, 850);
    }

    set({
      currentEvaluation: evalResult,
      isAnswerSubmitted: true,
      streak: newStreak,
      maxStreak: newMaxStreak,
      multiplier,
      xp: newTotalXP,
      level: newLevel,
      levelProgress: newProgress,
      score: newScore,
      lastResponseTimeMs: responseTimeMs,
      lastIsSpeedBlitz: isSpeedBlitz,
      lastSpeedBonusXP: speedBonusXP,
      isFeverActive: isFever,
      rewardFloaters: newFloaters,
      screenShake: shouldShake,
      nearMissNotice: nearMiss,
      unlockedBadgeIds: updatedBadgeIds,
      recentlyUnlockedBadge: latestUnlockedBadge,
      levelUpNotice: levelUpNoticeData,
      autoAdvanceTimer: timer,
      chestProgress: bonus.nextChestProgress,
      chestGoal: bonus.nextChestGoal,
      chestsOpened: bonus.nextChestsOpened,
    });
  },

  retryQuestion: () => {
    const { autoAdvanceTimer } = get();
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);

    set({
      isAnswerSubmitted: false,
      currentEvaluation: null,
      nearMissNotice: null,
      questionStartTime: Date.now(),
      autoAdvanceTimer: null,
    });
  },

  nextQuestion: () => {
    const { autoAdvanceTimer, queue, difficultyFilter, functionFilter } = get();

    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }

    let nextItem = queue.getCurrentItem();

    // If queue is exhausted, fetch more molecules
    if (!nextItem || queue.isFinished()) {
      const moreMolecules = loadMoleculesForFilter(difficultyFilter, functionFilter);
      queue.enqueue(moreMolecules);
      nextItem = queue.getCurrentItem();
    }

    set({
      currentMolecule: nextItem ? nextItem.data : null,
      userInput: '',
      slotState: { ...INITIAL_SLOT_STATE },
      currentEvaluation: null,
      isAnswerSubmitted: false,
      autoAdvanceTimer: null,
      questionStartTime: Date.now(),
      lastIsSpeedBlitz: false,
      lastSpeedBonusXP: 0,
      rewardFloaters: [],
      nearMissNotice: null,
    });
  },

  setUserInput: (input: string) => {
    set({ userInput: input });
  },

  setSlotState: (slots: Partial<SlotBuilderState>) => {
    set((state) => {
      const updated = { ...state.slotState, ...slots };
      return {
        slotState: updated,
        userInput: assembleIUPACFromSlots(updated),
      };
    });
  },

  addRadicalChip: (radical: string, locant: string = '') => {
    const { soundEnabled } = get();
    haptics.tap();
    if (soundEnabled) soundSynth.playSnap();

    set((state) => {
      const newRadical: RadicalChip = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        radical,
        locant,
      };
      const updatedRadicals = [...state.slotState.radicals, newRadical];
      const updated = { ...state.slotState, radicals: updatedRadicals };
      return {
        slotState: updated,
        userInput: assembleIUPACFromSlots(updated),
      };
    });
  },

  removeRadicalChip: (id: string) => {
    const { soundEnabled } = get();
    haptics.tap();
    if (soundEnabled) soundSynth.playSnap();

    set((state) => {
      const updatedRadicals = state.slotState.radicals.filter((r) => r.id !== id);
      const updated = { ...state.slotState, radicals: updatedRadicals };
      return {
        slotState: updated,
        userInput: assembleIUPACFromSlots(updated),
      };
    });
  },

  popLastRadicalChip: () => {
    const { soundEnabled } = get();
    haptics.tap();
    if (soundEnabled) soundSynth.playMechanicalSwitch();
    set((state) => {
      if (state.slotState.radicals.length === 0) return {};
      const updatedRadicals = state.slotState.radicals.slice(0, -1);
      const updated = { ...state.slotState, radicals: updatedRadicals };
      return {
        slotState: updated,
        userInput: assembleIUPACFromSlots(updated),
      };
    });
  },

  clearSlotState: () => {
    set({
      slotState: { ...INITIAL_SLOT_STATE },
      userInput: '',
      quickRadicalMode: { active: false },
    });
  },

  toggleInputMode: () => {
    const { inputMode, soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ inputMode: inputMode === 'speedrunner' ? 'slotBuilder' : 'speedrunner' });
  },

  awardModeResult: ({ score: resultScore, isPerfect, responseTimeMs, label }) => {
    const {
      streak,
      maxStreak,
      xp,
      level,
      score,
      soundEnabled,
      currentMolecule,
      unlockedBadgeIds,
      difficultyFilter,
      chestProgress,
      chestGoal,
      chestsOpened,
    } = get();

    const isSuccess = isPerfect || resultScore >= 0.8;
    const isSpeedBlitz = isSuccess && responseTimeMs < SPEED_BLITZ_THRESHOLD_MS;

    const newStreak = isSuccess ? streak + 1 : 0;
    const newMaxStreak = Math.max(maxStreak, newStreak);
    const multiplier = getMultiplierForStreak(newStreak);
    const isFever = newStreak >= 10;

    const baseXP = isSuccess ? DEFAULT_BASE_XP : Math.round(DEFAULT_BASE_XP * 0.2);
    const earnedXP = calculateXP(baseXP, multiplier, resultScore, isSpeedBlitz);
    const speedBonusXP = isSpeedBlitz
      ? calculateSpeedBonusXP(baseXP, multiplier, resultScore)
      : 0;

    const bonus = applyBonusLayers({
      earnedXP,
      isSuccess,
      isGolden: false,
      chestProgress,
      chestGoal,
      chestsOpened,
    });

    const newTotalXP = xp + bonus.finalXP;
    const newLevel = getLevelForXP(newTotalXP);
    const newProgress = getLevelProgress(newTotalXP);
    const leveledUp = newLevel > level;

    if (isSuccess) {
      if (leveledUp) haptics.levelUp();
      else haptics.success();
    } else {
      haptics.error();
    }

    if (soundEnabled) {
      soundSynth.playAnswerFeedback(isSuccess, newStreak, isSpeedBlitz);
      if (leveledUp) soundSynth.playLevelUp();
    }

    const newFloaters: RewardFloater[] = [];
    if (bonus.finalXP > 0) {
      newFloaters.push({
        id: `xp-${Date.now()}`,
        text: `+${bonus.finalXP} XP · ${label}`,
        type: 'xp',
        color: '#00f3ff',
      });
    }
    if (bonus.chestCracked) {
      newFloaters.push({
        id: `chest-${Date.now()}`,
        text: `🎁 BAÚ ABERTO (+${bonus.chestBonusXP} XP)!`,
        type: 'level',
        color: '#b537f2',
      });
    }
    if (isSpeedBlitz) {
      newFloaters.push({
        id: `speed-${Date.now()}`,
        text: `⚡ NO REFLEXO (+${speedBonusXP} XP)!`,
        type: 'speed',
        color: '#ffe600',
      });
    }
    if (multiplier > 1.0 && isSuccess) {
      newFloaters.push({
        id: `combo-${Date.now()}`,
        text: `COMBO x${multiplier.toFixed(1)}!`,
        type: 'combo',
        color: '#ff7700',
      });
    }

    let shouldShake = false;
    if (isPerfect || newStreak === 5 || newStreak === 10 || newStreak === 20) {
      shouldShake = true;
      setTimeout(() => set({ screenShake: false }), 350);
    }

    if (isPerfect) {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#00f3ff', '#ffe600', '#00ff88', '#b537f2', '#ff7700'],
      });
    }
    if (leveledUp) {
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff0077', '#00ffff', '#7928ca'],
      });
    }
    if (bonus.chestCracked) {
      shouldShake = true;
      setTimeout(() => set({ screenShake: false }), 350);
      confetti({
        particleCount: 160,
        spread: 110,
        startVelocity: 42,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ffe600', '#b537f2', '#00ff88'],
      });
      if (soundEnabled) soundSynth.playMilestone(6);
    }

    const newlyUnlocked = currentMolecule
      ? checkNewAchievements({
          isPerfect,
          score: resultScore,
          streak: newStreak,
          maxStreak: newMaxStreak,
          responseTimeMs,
          difficulty: currentMolecule.difficulty,
          primaryFunction: currentMolecule.primaryFunction,
          isChaos: difficultyFilter === 'caos' || currentMolecule.difficulty === 'caos',
          totalXP: newTotalXP,
          level: newLevel,
          unlockedBadgeIds,
        })
      : [];

    const updatedBadgeIds = [...unlockedBadgeIds];
    let latestUnlockedBadge: Badge | null = null;
    if (newlyUnlocked.length > 0) {
      latestUnlockedBadge = newlyUnlocked[0];
      for (const badge of newlyUnlocked) {
        if (!updatedBadgeIds.includes(badge.id)) {
          updatedBadgeIds.push(badge.id);
          historyDb.recordUnlockedBadge(badge.id).catch(() => {});
        }
      }
      if (soundEnabled) soundSynth.playBadgeUnlock();
    }

    set({
      streak: newStreak,
      maxStreak: newMaxStreak,
      multiplier,
      xp: newTotalXP,
      level: newLevel,
      levelProgress: newProgress,
      score: score + bonus.finalXP,
      chestProgress: bonus.nextChestProgress,
      chestGoal: bonus.nextChestGoal,
      chestsOpened: bonus.nextChestsOpened,
      lastResponseTimeMs: responseTimeMs,
      lastIsSpeedBlitz: isSpeedBlitz,
      lastSpeedBonusXP: speedBonusXP,
      isFeverActive: isFever,
      rewardFloaters: newFloaters,
      screenShake: shouldShake,
      unlockedBadgeIds: updatedBadgeIds,
      recentlyUnlockedBadge: latestUnlockedBadge,
      levelUpNotice: leveledUp
        ? {
            oldLevel: level,
            newLevel,
            title: getLevelTitle(newLevel),
            badgeEmoji: newProgress.titleBadgeEmoji,
          }
        : null,
    });
  },

  rollGoldenMolecule: () => {
    set({ isGoldenMolecule: Math.random() < 1 / 12 });
  },

  setActiveTab: (tab: ActiveTab) => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ activeTab: tab });
  },

  setCurrentMolecule: (mol: Molecule) => {
    const { queue } = get();
    queue.enqueue([mol]);
    set({
      currentMolecule: mol,
      userInput: '',
      slotState: { ...INITIAL_SLOT_STATE },
      currentEvaluation: null,
      isAnswerSubmitted: false,
      questionStartTime: Date.now(),
      lastIsSpeedBlitz: false,
      lastSpeedBonusXP: 0,
      rewardFloaters: [],
      nearMissNotice: null,
    });
  },

  toggleFullscreen: () => {
    const current = get().isFullscreen;
    const next = !current;
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isFullscreen: next });

    if (typeof document !== 'undefined') {
      try {
        if (next) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      } catch {
        // Safe fallback in restricted environments
      }
    }
  },

  setFullscreen: (val: boolean) => {
    const { soundEnabled, isFullscreen } = get();
    if (val === isFullscreen) return;
    if (soundEnabled) soundSynth.playClick();
    set({ isFullscreen: val });

    if (typeof document !== 'undefined') {
      try {
        if (val) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      } catch {
        // Safe fallback in restricted environments
      }
    }
  },

  setDifficultyFilter: (diff: DifficultyTier | 'todos') => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ difficultyFilter: diff });
    get().initSession();
  },

  setFunctionFilter: (func: OrganicFunction | 'todos') => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ functionFilter: func });
    get().initSession();
  },

  toggleSound: () => {
    const newMuted = soundSynth.toggleMute();
    set({ soundEnabled: !newMuted });
  },

  playSnapSound: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playSnap();
  },

  playClickSound: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
  },

  playMechanicalKeySound: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playMechanicalSwitch();
  },

  openAchievementsModal: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isAchievementsModalOpen: true });
  },

  closeAchievementsModal: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isAchievementsModalOpen: false });
  },

  toggleCheatsheet: () => {
    const { soundEnabled, isCheatsheetOpen } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isCheatsheetOpen: !isCheatsheetOpen });
  },

  closeCheatsheet: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isCheatsheetOpen: false });
  },

  openMobileControlSheet: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    haptics.tap();
    set({ isMobileControlSheetOpen: true });
  },

  closeMobileControlSheet: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isMobileControlSheetOpen: false });
  },

  toggleMobileControlSheet: () => {
    const { isMobileControlSheetOpen, soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    haptics.tap();
    set({ isMobileControlSheetOpen: !isMobileControlSheetOpen });
  },

  openMoleculeZoom: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    haptics.tap();
    set({ isMoleculeZoomOpen: true });
  },

  closeMoleculeZoom: () => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ isMoleculeZoomOpen: false });
  },

  setQuickRadicalMode: (mode: { active: boolean; locant?: string }) => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playMechanicalSwitch();
    set({ quickRadicalMode: mode });
  },

  dismissBadgeToast: () => {
    set({ recentlyUnlockedBadge: null });
  },

  dismissLevelUpNotice: () => {
    set({ levelUpNotice: null });
  },

  resetSession: () => {
    const { autoAdvanceTimer } = get();
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    soundSynth.stopFeverLoop();

    set({
      score: 0,
      streak: 0,
      multiplier: 1.0,
      xp: 0,
      level: 1,
      levelProgress: getLevelProgress(0),
      currentEvaluation: null,
      isAnswerSubmitted: false,
      autoAdvanceTimer: null,
      isFeverActive: false,
      rewardFloaters: [],
      nearMissNotice: null,
      levelUpNotice: null,
    });
    get().initSession();
  },
}));
