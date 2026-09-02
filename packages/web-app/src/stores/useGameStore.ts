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

export type InputMode = 'speedrunner' | 'slotBuilder';
export type ActiveTab = 'arcade' | 'theory';

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

  // Reward floaters & screen shake
  rewardFloaters: RewardFloater[];
  screenShake: boolean;
  nearMissNotice: string | null;

  // Achievements & Level Up notices
  unlockedBadgeIds: string[];
  recentlyUnlockedBadge: Badge | null;
  levelUpNotice: LevelUpNotice | null;
  isAchievementsModalOpen: boolean;

  // Modality & View
  inputMode: InputMode;
  activeTab: ActiveTab;
  userInput: string;
  slotState: SlotBuilderState;

  // Evaluation & feedback
  currentEvaluation: EvaluationResult | null;
  isAnswerSubmitted: boolean;
  autoAdvanceTimer: ReturnType<typeof setTimeout> | null;

  // Settings & Filters
  soundEnabled: boolean;
  difficultyFilter: DifficultyTier | 'todos';
  functionFilter: OrganicFunction | 'todos';

  // Actions
  initSession: () => void;
  loadBadgesFromDb: () => Promise<void>;
  submitAnswer: () => void;
  retryQuestion: () => void;
  nextQuestion: () => void;
  setUserInput: (input: string) => void;
  setSlotState: (slots: Partial<SlotBuilderState>) => void;
  addRadicalChip: (radical: string, locant?: string) => void;
  removeRadicalChip: (id: string) => void;
  clearSlotState: () => void;
  toggleInputMode: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setDifficultyFilter: (diff: DifficultyTier | 'todos') => void;
  setFunctionFilter: (func: OrganicFunction | 'todos') => void;
  toggleSound: () => void;
  playSnapSound: () => void;
  playClickSound: () => void;
  openAchievementsModal: () => void;
  closeAchievementsModal: () => void;
  dismissBadgeToast: () => void;
  dismissLevelUpNotice: () => void;
  resetSession: () => void;
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

  rewardFloaters: [],
  screenShake: false,
  nearMissNotice: null,

  unlockedBadgeIds: [],
  recentlyUnlockedBadge: null,
  levelUpNotice: null,
  isAchievementsModalOpen: false,

  inputMode: 'speedrunner',
  activeTab: 'arcade',
  userInput: '',
  slotState: { ...INITIAL_SLOT_STATE },

  currentEvaluation: null,
  isAnswerSubmitted: false,
  autoAdvanceTimer: null,

  soundEnabled: true,
  difficultyFilter: 'todos',
  functionFilter: 'todos',

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
    const { difficultyFilter, functionFilter } = get();
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

    const newTotalXP = xp + earnedXP;
    const newLevel = getLevelForXP(newTotalXP);
    const newProgress = getLevelProgress(newTotalXP);
    const newScore = score + earnedXP;
    const leveledUp = newLevel > level;

    // Update FSRS repetition queue
    queue.recordReview(evalResult.score);

    // Sound feedback
    if (soundEnabled) {
      soundSynth.playAnswerFeedback(isSuccess, newStreak, isSpeedBlitz);
      if (leveledUp) {
        soundSynth.playLevelUp();
      }
    }

    // Floating reward pills
    const newFloaters: RewardFloater[] = [];
    if (earnedXP > 0) {
      newFloaters.push({
        id: `xp-${Date.now()}`,
        text: `+${earnedXP} XP`,
        type: 'xp',
        color: '#00f3ff',
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

  clearSlotState: () => {
    set({
      slotState: { ...INITIAL_SLOT_STATE },
      userInput: '',
    });
  },

  toggleInputMode: () => {
    const { inputMode, soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ inputMode: inputMode === 'speedrunner' ? 'slotBuilder' : 'speedrunner' });
  },

  setActiveTab: (tab: ActiveTab) => {
    const { soundEnabled } = get();
    if (soundEnabled) soundSynth.playClick();
    set({ activeTab: tab });
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
