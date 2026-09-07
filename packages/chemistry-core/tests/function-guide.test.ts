import { describe, expect, it } from 'vitest';
import {
  FUNCTION_GUIDE,
  FUNCTIONS_BY_PRIORITY,
  checkNomenclatureAnswer,
  gradeFunctionHunt,
} from '../src/function-guide.js';
import { analyzeMolecularGraph, createGraphFromSMILES } from '../src/graph-namer.js';
import { OrganicFunctionSchema } from '../src/types.js';

describe('Function nomenclature guide', () => {
  it('covers all 16 canonical functions, ordered by IUPAC seniority', () => {
    const ids = OrganicFunctionSchema.options;
    expect(Object.keys(FUNCTION_GUIDE).sort()).toEqual([...ids].sort());
    expect(FUNCTIONS_BY_PRIORITY).toHaveLength(16);
    expect(FUNCTIONS_BY_PRIORITY[0].id).toBe('acido_carboxilico');
    expect(FUNCTIONS_BY_PRIORITY[15].id).toBe('hidrocarboneto');
    for (let i = 1; i < FUNCTIONS_BY_PRIORITY.length; i++) {
      expect(FUNCTIONS_BY_PRIORITY[i - 1].priority).toBeGreaterThan(
        FUNCTIONS_BY_PRIORITY[i].priority
      );
    }
  });

  it('every worked example really is an instance of its own function', () => {
    for (const guide of FUNCTIONS_BY_PRIORITY) {
      const analysis = analyzeMolecularGraph(createGraphFromSMILES(guide.example.smiles));
      expect(analysis.primaryFunction, `${guide.id} example`).toBe(guide.id);
    }
  });

  it('accepts the many ways a student writes a suffix', () => {
    for (const answer of ['-al', 'al', 'AL', 'sufixo -al', 'termina em al', ' Al ']) {
      expect(checkNomenclatureAnswer('aldeido', answer).correct, answer).toBe(true);
    }
    expect(checkNomenclatureAnswer('cetona', '-ona').correct).toBe(true);
    expect(checkNomenclatureAnswer('alcool', 'ol').correct).toBe(true);
    expect(checkNomenclatureAnswer('acido_carboxilico', 'ácido -oico').correct).toBe(true);
    expect(checkNomenclatureAnswer('ester', 'oato de ila').correct).toBe(true);
    expect(checkNomenclatureAnswer('nitrocomposto', 'nitro').correct).toBe(true);
  });

  it('rejects the wrong suffix and flags a near miss', () => {
    const wrong = checkNomenclatureAnswer('aldeido', '-ona');
    expect(wrong.correct).toBe(false);
    expect(wrong.expected).toBe('-al');

    const typo = checkNomenclatureAnswer('cetona', 'ora');
    expect(typo.correct).toBe(false);
    expect(typo.isNearMiss).toBe(true);

    expect(checkNomenclatureAnswer('alcool', '').correct).toBe(false);
  });

  it('grades a function hunt with partial credit', () => {
    const perfect = gradeFunctionHunt(['alcool', 'cetona'], ['cetona', 'alcool']);
    expect(perfect.isPerfect).toBe(true);
    expect(perfect.score).toBe(1);

    const partial = gradeFunctionHunt(['alcool'], ['alcool', 'cetona']);
    expect(partial.score).toBe(0.5);
    expect(partial.missed).toEqual(['cetona']);

    const overreach = gradeFunctionHunt(['alcool', 'amina'], ['alcool']);
    expect(overreach.wrongPicks).toEqual(['amina']);
    expect(overreach.score).toBe(0.5);
    expect(overreach.isPerfect).toBe(false);
  });
});

describe('Real-time graph analysis for the builder', () => {
  it('explains the derivation step by step', () => {
    const analysis = analyzeMolecularGraph(createGraphFromSMILES('CC(O)CC(=O)O'));
    expect(analysis.isNameable).toBe(true);
    expect(analysis.iupacName2013).toBe('ácido 3-hidroxibutanoico');
    expect(analysis.steps).toHaveLength(6);
    expect(analysis.steps[0].detail).toContain('Ácido carboxílico');
    expect(analysis.parentSize).toBe(4);
    expect(analysis.substituents).toEqual([{ locant: 3, name: 'hidroxi' }]);
    expect(analysis.detectedFunctions).toContain('alcool');
  });

  it('reports an empty canvas instead of throwing', () => {
    const analysis = analyzeMolecularGraph({ atoms: [], bonds: [] });
    expect(analysis.isNameable).toBe(false);
    expect(analysis.problems[0].code).toBe('empty');
  });

  it('reports disconnected fragments and blown valences', () => {
    const split = analyzeMolecularGraph({
      atoms: [
        { id: 'a', element: 'C', x: 0, y: 0, charge: 0, implicitH: 0 },
        { id: 'b', element: 'C', x: 50, y: 0, charge: 0, implicitH: 0 },
      ],
      bonds: [],
    });
    expect(split.problems.some(p => p.code === 'disconnected')).toBe(true);

    const overloaded = analyzeMolecularGraph({
      atoms: [
        { id: 'a', element: 'C', x: 0, y: 0, charge: 0, implicitH: 0 },
        { id: 'b', element: 'C', x: 1, y: 0, charge: 0, implicitH: 0 },
        { id: 'c', element: 'C', x: 2, y: 0, charge: 0, implicitH: 0 },
      ],
      bonds: [
        { id: 'b1', source: 'a', target: 'b', order: 3 },
        { id: 'b2', source: 'a', target: 'c', order: 3 },
      ],
    });
    expect(overloaded.problems.some(p => p.code === 'valence')).toBe(true);
  });
});
