import { describe, it, expect } from 'vitest';
import { analyzeMolecularGraph } from '@quimicarush/chemistry-core';
import {
  BOND_LENGTH,
  FUNCTIONAL_GROUPS,
  RING_TEMPLATES,
  buildSubstituentGroup,
  createRingTemplate,
  recalculateAllValences,
  previewGroup,
  previewRing,
} from '../src/index.js';
import type { AtomNode } from '../src/types.js';

/** hexane, so a substituent on C3 always has a parent chain to attach to. */
function hexane() {
  const atoms: AtomNode[] = Array.from({ length: 6 }, (_, i) => ({
    id: `c${i}`,
    element: 'C' as const,
    x: i * 40,
    y: (i % 2) * 20,
    charge: 0,
    implicitH: 2,
  }));
  const bonds = atoms.slice(1).map((atom, i) => ({
    id: `b${i}`,
    source: atoms[i]!.id,
    target: atom.id,
    order: 1 as const,
  }));
  return { atoms, bonds };
}

describe('ring templates', () => {
  it.each(RING_TEMPLATES.map(entry => entry.type))('%s is a nameable structure', type => {
    const ring = createRingTemplate(type, { x: 0, y: 0 }, BOND_LENGTH);
    const analysis = analyzeMolecularGraph(
      recalculateAllValences({ atoms: ring.atoms, bonds: ring.bonds })
    );
    expect(analysis.problems).toEqual([]);
    expect(analysis.isNameable).toBe(true);
  });

  it('names the aromatic templates by their retained names', () => {
    const named = (type: Parameters<typeof createRingTemplate>[0]) => {
      const ring = createRingTemplate(type, { x: 0, y: 0 }, BOND_LENGTH);
      return analyzeMolecularGraph(
        recalculateAllValences({ atoms: ring.atoms, bonds: ring.bonds })
      );
    };

    expect(named('benzene').iupacName2013).toBe('benzeno');
    expect(named('pyridine').iupacName2013).toBe('piridina');
    expect(named('furan').iupacName2013).toBe('furano');
    expect(named('thiophene').iupacName2013).toBe('tiofeno');
    expect(named('piperidine').iupacName2013).toBe('piperidina');

    // Pyrrole's nitrogen donates a lone pair instead of a pi bond, so it keeps
    // its hydrogen: C4H5N, not C4H4N.
    const pyrrole = named('pyrrole');
    expect(pyrrole.iupacName2013).toBe('pirrol');
    expect(pyrrole.formula).toBe('C4H5N');
  });
});

describe('functional group palette', () => {
  it.each(FUNCTIONAL_GROUPS.map(entry => entry.type))(
    '%s survives into the name of the molecule it is attached to',
    type => {
      const base = hexane();
      const fragment = buildSubstituentGroup(type, base.atoms[2]!, 0, BOND_LENGTH);
      const analysis = analyzeMolecularGraph(
        recalculateAllValences({
          atoms: [...base.atoms, ...fragment.atoms],
          bonds: [...base.bonds, ...fragment.bonds],
        })
      );

      expect(analysis.problems).toEqual([]);
      expect(analysis.isNameable).toBe(true);
      // A group that the namer silently drops would teach the wrong lesson:
      // every entry has to change the name of plain hexane.
      expect(analysis.iupacName2013).not.toBe('hexano');
    }
  );
});

describe('palette previews', () => {
  it('draws every ring and group so a button can show what it stamps', () => {
    for (const entry of RING_TEMPLATES) {
      const preview = previewRing(entry.type);
      expect(preview.atoms.length).toBeGreaterThan(2);
      expect(preview.bonds.length).toBe(preview.atoms.length);
    }

    for (const entry of FUNCTIONAL_GROUPS) {
      const preview = previewGroup(entry.type);
      // The host atom plus at least one new atom, all wired to something.
      expect(preview.atoms.length).toBeGreaterThan(1);
      expect(preview.bonds.length).toBeGreaterThan(0);
      expect(preview.atoms.some(atom => atom.id === preview.anchorId)).toBe(true);
    }
  });
});
