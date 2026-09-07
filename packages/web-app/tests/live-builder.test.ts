import { describe, expect, it } from 'vitest';
import {
  analyzeMolecularGraph,
  type MolecularGraphData,
} from '@quimicarush/chemistry-core';

/**
 * The SkeletalCanvas emits plain MolecularGraphData with screen coordinates and
 * pre-filled implicit hydrogens. These tests pin the exact contract the live
 * builder relies on, so a canvas refactor cannot silently break the naming.
 */
function graph(
  atoms: [id: string, element: string, x: number, y: number][],
  bonds: [source: string, target: string, order: number][]
): MolecularGraphData {
  return {
    atoms: atoms.map(([id, element, x, y]) => ({
      id,
      element: element as MolecularGraphData['atoms'][number]['element'],
      x,
      y,
      charge: 0,
      implicitH: 0,
    })),
    bonds: bonds.map(([source, target, order], i) => ({
      id: `b${i}`,
      source,
      target,
      order: order as 1 | 2 | 3,
      style: 'solid' as const,
    })),
  };
}

describe('LiveBuilder naming pipeline (canvas graph -> IUPAC)', () => {
  it('names the canvas default structure (ethanol) with screen coordinates', () => {
    const canvasGraph = graph(
      [
        ['c1', 'C', 200, 220],
        ['c2', 'C', 238, 198],
        ['o1', 'O', 276, 220],
      ],
      [
        ['c1', 'c2', 1],
        ['c2', 'o1', 1],
      ]
    );

    const analysis = analyzeMolecularGraph(canvasGraph);
    expect(analysis.isNameable).toBe(true);
    expect(analysis.iupacName2013).toBe('etanol');
    expect(analysis.formula).toBe('C2H6O');
    expect(analysis.primaryFunction).toBe('alcool');
  });

  it('renames live as the user promotes a bond to a carbonyl', () => {
    const asAlcohol = graph(
      [
        ['c1', 'C', 0, 0],
        ['c2', 'C', 40, 20],
        ['c3', 'C', 80, 0],
        ['o1', 'O', 120, 20],
      ],
      [
        ['c1', 'c2', 1],
        ['c2', 'c3', 1],
        ['c3', 'o1', 1],
      ]
    );
    expect(analyzeMolecularGraph(asAlcohol).iupacName2013).toBe('propan-1-ol');

    // User double-clicks the C-O bond: single -> double. Aldehyde now.
    const asAldehyde: MolecularGraphData = {
      ...asAlcohol,
      bonds: asAlcohol.bonds.map(b =>
        b.target === 'o1' ? { ...b, order: 2 as const } : b
      ),
    };
    const aldehyde = analyzeMolecularGraph(asAldehyde);
    expect(aldehyde.iupacName2013).toBe('propanal');
    expect(aldehyde.primaryFunction).toBe('aldeido');
  });

  it('keeps a branched, polyfunctional drawing nameable and explained', () => {
    // CH3-CH(OH)-CH2-COOH drawn atom by atom
    const drawing = graph(
      [
        ['a1', 'C', 0, 0],
        ['a2', 'C', 40, 20],
        ['a3', 'O', 40, 60],
        ['a4', 'C', 80, 0],
        ['a5', 'C', 120, 20],
        ['a6', 'O', 120, 60],
        ['a7', 'O', 160, 0],
      ],
      [
        ['a1', 'a2', 1],
        ['a2', 'a3', 1],
        ['a2', 'a4', 1],
        ['a4', 'a5', 1],
        ['a5', 'a6', 2],
        ['a5', 'a7', 1],
      ]
    );

    const analysis = analyzeMolecularGraph(drawing);
    expect(analysis.iupacName2013).toBe('ácido 3-hidroxibutanoico');
    expect(analysis.secondaryFunctions).toContain('alcool');
    expect(analysis.steps.length).toBeGreaterThan(0);
    // Every parent carbon must carry a locant for the canvas overlay.
    expect(Object.keys(analysis.locants).length).toBeGreaterThanOrEqual(analysis.parentSize);
  });

  it('degrades gracefully while the user is mid-drawing', () => {
    const loneOxygen = graph([['o1', 'O', 0, 0]], []);
    const analysis = analyzeMolecularGraph(loneOxygen);
    expect(analysis.isNameable).toBe(false);
    expect(analysis.problems.some(p => p.code === 'no_carbon')).toBe(true);
    expect(analysis.iupacName2013).toBe('');
  });
});
