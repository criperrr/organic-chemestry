import { describe, it, expect } from 'vitest';
import {
  ISOMERISM_TYPES_META,
  IsomerismTypeSchema,
  gradeIsomerPair,
  gradeChiralCount,
  gradeGeometricCondition,
  type IsomerismType,
} from '../src/isomerism.js';

describe('Isomerism Core Module', () => {
  it('covers all official types of isomerism in metadata and schema', () => {
    const expectedTypes: IsomerismType[] = [
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

    for (const type of expectedTypes) {
      expect(IsomerismTypeSchema.safeParse(type).success).toBe(true);
      const meta = ISOMERISM_TYPES_META[type];
      expect(meta).toBeDefined();
      expect(meta.name.length).toBeGreaterThan(3);
      expect(meta.shortDescription.length).toBeGreaterThan(10);
      expect(meta.condition.length).toBeGreaterThan(10);
      expect(meta.enemTip.length).toBeGreaterThan(10);
      expect(meta.classicPairs.length).toBeGreaterThan(0);
      expect(meta.hotkey).toBeDefined();
    }
  });

  it('correctly grades pair classification with full score for exact match', () => {
    const result = gradeIsomerPair('funcao', 'funcao');
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1.0);
    expect(result.feedback).toContain('Isomeria de Função');
  });

  it('awards partial credit for identifying the same general category (plana vs espacial)', () => {
    const result = gradeIsomerPair('cadeia', 'posicao');
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0.35);
    expect(result.feedback).toContain('categoria');
  });

  it('gives 0 for wrong category cross-mismatch', () => {
    const result = gradeIsomerPair('optica', 'funcao');
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0.0);
    expect(result.feedback).toContain('Incorreto');
  });

  it('correctly evaluates chiral carbon counting', () => {
    const perfect = gradeChiralCount(2, 2);
    expect(perfect.correct).toBe(true);
    expect(perfect.score).toBe(1.0);

    const nearMiss = gradeChiralCount(3, 2);
    expect(nearMiss.correct).toBe(false);
    expect(nearMiss.score).toBe(0.4);

    const farMiss = gradeChiralCount(5, 1);
    expect(farMiss.correct).toBe(false);
    expect(farMiss.score).toBe(0.0);
  });

  it('correctly evaluates geometric condition challenges', () => {
    const correct = gradeGeometricCondition(true, true, 'Ligantes distintos em cada carbono.');
    expect(correct.correct).toBe(true);
    expect(correct.score).toBe(1.0);

    const wrong = gradeGeometricCondition(true, false, 'Dois hidrogênios idênticos no C1.');
    expect(wrong.correct).toBe(false);
    expect(wrong.score).toBe(0.0);
  });
});
