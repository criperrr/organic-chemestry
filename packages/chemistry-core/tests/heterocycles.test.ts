import { describe, expect, it } from 'vitest';
import {
  analyzeMolecularGraph,
  createGraphFromSMILES,
  molecularGraphToSMILES,
  nameMolecularGraph,
} from '../src/graph-namer.js';

describe('Heterocyclic parent rings', () => {
  it('uses retained pt-BR names instead of pretending the ring is all carbon', () => {
    const expected: [string, string, string][] = [
      ['C1CNC1', 'azetidina', 'C3H7N'],
      ['C1CCNC1', 'pirrolidina', 'C4H9N'],
      ['C1CCOC1', 'oxolano', 'C4H8O'],
      ['O1CCCCC1', 'oxano', 'C5H10O'],
      ['C1CCNCC1', 'piperidina', 'C5H11N'],
      ['c1ccncc1', 'piridina', 'C5H5N'],
      ['c1ccoc1', 'furano', 'C4H4O'],
      ['c1ccsc1', 'tiofeno', 'C4H4S'],
      ['c1cnccn1', 'pirazina', 'C4H4N2'],
      ['N1CCOCC1', 'morfolina', 'C4H9NO'],
      ['C1CNCCN1', 'piperazina', 'C4H10N2'],
      ['C1COCCO1', '1,4-dioxano', 'C4H8O2'],
    ];

    for (const [smiles, name, formula] of expected) {
      const result = nameMolecularGraph(createGraphFromSMILES(smiles));
      expect(result.iupacName2013, smiles).toBe(name);
      expect(result.formula, smiles).toBe(formula);
    }
  });

  it('numbers the ring heteroatom as position 1', () => {
    // The hydroxyl sits three bonds from the nitrogen, so it is C4 — never C1.
    const result = nameMolecularGraph(createGraphFromSMILES('OC1CCNCC1'));
    expect(result.iupacName2013).toBe('piperidin-4-ol');
  });

  it('does not treat a ring heteroatom as an amine or ether group', () => {
    expect(nameMolecularGraph(createGraphFromSMILES('C1CCNCC1')).primaryFunction).toBe(
      'hidrocarboneto'
    );
    expect(nameMolecularGraph(createGraphFromSMILES('O1CCCCC1')).primaryFunction).toBe(
      'hidrocarboneto'
    );
  });

  it('refuses to name a heterocycle outside the supported table', () => {
    const analysis = analyzeMolecularGraph(createGraphFromSMILES('C1CCPCC1'));
    expect(analysis.isNameable).toBe(false);
    expect(analysis.problems.some(p => p.code === 'unsupported_ring')).toBe(true);
  });
});

describe('SMILES serialisation', () => {
  it('emits matched ring-closure digits and never repeats an atom', () => {
    const cases = [
      'C1CNC1',
      'C1CCCCC1',
      'c1ccccc1',
      'c1ccncc1',
      'c1ccc2ccccc2c1',
      'OC1CCCCC1',
      'CC(=O)OCC',
      'C1CCCCC1C1CCCCC1',
    ];

    for (const smiles of cases) {
      const original = createGraphFromSMILES(smiles);
      const emitted = molecularGraphToSMILES(original);

      // Every ring-closure digit must appear an even number of times.
      const digits = emitted.replace(/\[[^\]]*\]/g, '').match(/\d/g) ?? [];
      const counts = new Map<string, number>();
      for (const digit of digits) counts.set(digit, (counts.get(digit) ?? 0) + 1);
      for (const [digit, count] of counts) {
        expect(count % 2, `${smiles} -> ${emitted} (digit ${digit})`).toBe(0);
      }

      // Round-tripping our own output must preserve the molecule.
      const reparsed = createGraphFromSMILES(emitted);
      expect(reparsed.atoms.size, `${smiles} -> ${emitted}`).toBe(original.atoms.size);
      expect(computeFormula(emitted), `${smiles} -> ${emitted}`).toBe(computeFormula(smiles));
    }
  });
});

function computeFormula(smiles: string): string {
  return nameMolecularGraph(createGraphFromSMILES(smiles)).formula;
}
