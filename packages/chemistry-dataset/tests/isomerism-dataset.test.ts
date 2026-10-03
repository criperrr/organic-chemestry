import { describe, it, expect } from 'vitest';
import {
  isomerismProvider,
  CANONICAL_ISOMER_PAIRS,
  CANONICAL_CHIRAL_QUESTIONS,
  CANONICAL_GEOMETRIC_QUESTIONS,
} from '../src/index.js';
import { ISOMERISM_TYPES_META, type IsomerismType } from '@quimicarush/chemistry-core';

describe('Isomerism Dataset & Provider', () => {
  it('contains canonical pairs for every single isomerism type', () => {
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
      const matching = CANONICAL_ISOMER_PAIRS.filter(p => p.relation === type);
      expect(
        matching.length,
        `Expected at least one pair for isomerism type: ${type}`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('validates that all pair questions have non-empty SMILES, names, and explanations', () => {
    for (const pair of CANONICAL_ISOMER_PAIRS) {
      expect(pair.id).toBeDefined();
      expect(pair.moleculeA.smiles.length).toBeGreaterThan(0);
      expect(pair.moleculeA.name.length).toBeGreaterThan(0);
      expect(pair.moleculeA.formula.length).toBeGreaterThan(0);
      expect(pair.moleculeB.smiles.length).toBeGreaterThan(0);
      expect(pair.moleculeB.name.length).toBeGreaterThan(0);
      expect(pair.moleculeB.formula.length).toBeGreaterThan(0);
      expect(pair.explanation.length).toBeGreaterThan(15);
      expect(pair.comparison.keyClue.length).toBeGreaterThan(5);

      if (pair.relation !== 'nao_isomeros') {
        expect(
          pair.comparison.sameFormula,
          `Pair ${pair.id} should have sameFormula: true`
        ).toBe(true);
        expect(pair.comparison.formulaA).toBe(pair.comparison.formulaB);
      } else {
        expect(pair.comparison.sameFormula).toBe(false);
      }
    }
  });

  it('validates chiral center questions have accurate math and explanations', () => {
    expect(CANONICAL_CHIRAL_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    for (const q of CANONICAL_CHIRAL_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.molecule.smiles.length).toBeGreaterThan(0);
      expect(q.molecule.name.length).toBeGreaterThan(0);
      expect(q.chiralCarbonCount).toBeGreaterThanOrEqual(0);
      expect(q.opticallyActiveCount).toBeGreaterThanOrEqual(0);
      expect(q.racemicMixCount).toBeGreaterThanOrEqual(0);
      expect(q.explanation.length).toBeGreaterThan(10);

      if (q.chiralCarbonCount > 0 && !q.hasMesoForm) {
        // van 't Hoff formula without meso: 2^n
        expect(q.opticallyActiveCount).toBe(Math.pow(2, q.chiralCarbonCount));
        expect(q.racemicMixCount).toBe(Math.pow(2, q.chiralCarbonCount - 1));
      }
    }
  });

  it('validates geometric condition questions', () => {
    expect(CANONICAL_GEOMETRIC_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    const withGeom = CANONICAL_GEOMETRIC_QUESTIONS.filter(q => q.hasGeometricIsomerism);
    const withoutGeom = CANONICAL_GEOMETRIC_QUESTIONS.filter(q => !q.hasGeometricIsomerism);

    expect(withGeom.length).toBeGreaterThanOrEqual(3);
    expect(withoutGeom.length).toBeGreaterThanOrEqual(3);

    for (const q of CANONICAL_GEOMETRIC_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.molecule.smiles.length).toBeGreaterThan(0);
      expect(q.molecule.name.length).toBeGreaterThan(0);
      expect(q.reason.length).toBeGreaterThan(10);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it('filters questions accurately in IsomerismProvider', () => {
    const funcaoPairs = isomerismProvider.getPairQuestions({ type: 'funcao' });
    expect(funcaoPairs.every(p => p.relation === 'funcao')).toBe(true);

    const planaPairs = isomerismProvider.getPairQuestions({ category: 'plana' });
    expect(
      planaPairs.every(p => ISOMERISM_TYPES_META[p.relation].category === 'plana')
    ).toBe(true);

    const randomPair = isomerismProvider.getRandomPairQuestion();
    expect(randomPair).toBeDefined();
    expect(randomPair.moleculeA.name).toBeDefined();

    const chiralList = isomerismProvider.getChiralQuestions({ minChiralCount: 1 });
    expect(chiralList.every(q => q.chiralCarbonCount >= 1)).toBe(true);

    const stats = isomerismProvider.getStats();
    expect(stats.pairCount).toBeGreaterThanOrEqual(20);
    expect(stats.chiralCount).toBeGreaterThanOrEqual(8);
    expect(stats.geometricCount).toBeGreaterThanOrEqual(8);
    expect(stats.totalCount).toBeGreaterThanOrEqual(36);
  });
});
