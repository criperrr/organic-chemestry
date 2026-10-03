import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/stores/useGameStore.js';
import { TAB_ORDER } from '../src/hooks/useTabGestures.js';
import {
  ISOMERISM_TYPES_META,
  gradeIsomerPair,
  gradeChiralCount,
  gradeGeometricCondition,
  type IsomerismType,
} from '@quimicarush/chemistry-core';
import {
  isomerismProvider,
  CANONICAL_ISOMER_PAIRS,
  CANONICAL_CHIRAL_QUESTIONS,
  CANONICAL_GEOMETRIC_QUESTIONS,
} from '@quimicarush/chemistry-dataset';

describe('Isomerism Trainer & Tab Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeTab: 'arcade',
      xp: 0,
      streak: 0,
      maxStreak: 0,
      soundEnabled: false,
    });
  });

  it('supports activeTab = "isomeria"', () => {
    const { setActiveTab } = useGameStore.getState();
    setActiveTab('isomeria');
    expect(useGameStore.getState().activeTab).toBe('isomeria');
  });

  it('includes isomeria in TAB_ORDER for touch and trackpad gestures', () => {
    expect(TAB_ORDER).toContain('isomeria');
    expect(TAB_ORDER.indexOf('isomeria')).toBe(2);
  });

  it('correctly awards XP and streak on isomerism answer submission', () => {
    const { awardModeResult } = useGameStore.getState();

    awardModeResult({
      score: 1.0,
      isPerfect: true,
      responseTimeMs: 2500,
      label: 'Isomeria Correta',
    });

    const state = useGameStore.getState();
    expect(state.streak).toBe(1);
    expect(state.maxStreak).toBe(1);
    expect(state.xp).toBeGreaterThan(0);
  });

  it('evaluates all types of isomerism with canonical pairs', () => {
    const allTypes: IsomerismType[] = [
      'funcao',
      'cadeia',
      'posicao',
      'metameria',
      'tautomeria',
      'geometrica',
      'optica',
      'nao_isomeros',
      'mesmo_composto',
    ];

    for (const type of allTypes) {
      const meta = ISOMERISM_TYPES_META[type];
      expect(meta).toBeDefined();
      expect(meta.name.length).toBeGreaterThan(0);

      const pairs = isomerismProvider.getPairQuestions({ type });
      expect(pairs.length).toBeGreaterThanOrEqual(1);

      const pair = pairs[0];
      const result = gradeIsomerPair(type, pair.relation);
      expect(result.correct).toBe(true);
      expect(result.score).toBe(1.0);
    }
  });

  it('provides chiral center challenges and evaluates answers', () => {
    expect(CANONICAL_CHIRAL_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    const lactic = CANONICAL_CHIRAL_QUESTIONS.find(q => q.id === 'chiral-01');
    expect(lactic).toBeDefined();
    expect(lactic?.chiralCarbonCount).toBe(1);

    const grade = gradeChiralCount(1, lactic!.chiralCarbonCount);
    expect(grade.correct).toBe(true);
    expect(grade.score).toBe(1.0);
  });

  it('provides geometric condition challenges and evaluates conditions', () => {
    expect(CANONICAL_GEOMETRIC_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    const but2ene = CANONICAL_GEOMETRIC_QUESTIONS.find(q => q.id === 'geom-cond-01');
    expect(but2ene).toBeDefined();
    expect(but2ene?.hasGeometricIsomerism).toBe(true);

    const grade = gradeGeometricCondition(true, but2ene!.hasGeometricIsomerism, but2ene!.reason);
    expect(grade.correct).toBe(true);
    expect(grade.score).toBe(1.0);
  });
});
