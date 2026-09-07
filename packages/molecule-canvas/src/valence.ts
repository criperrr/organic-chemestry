import type { AtomElement, AtomNode, MolecularGraphData } from './types.js';

/**
 * Standard neutral valence capacities
 */
export const STANDARD_VALENCES: Record<AtomElement, number> = {
  C: 4,
  N: 3,
  O: 2,
  F: 1,
  Cl: 1,
  Br: 1,
  I: 1,
  S: 2,
  P: 3,
  H: 1,
};

/**
 * Canonical high-contrast IUPAC element colors matching the design system
 */
export const ELEMENT_COLORS: Record<AtomElement, string> = {
  C: '#94A3B8',      // Slate-400 (subtle skeletal vertex)
  O: '#EF4444',      // Crimson Red
  N: '#3B82F6',      // Electric Blue
  Cl: '#10B981',     // Emerald Green
  Br: '#F59E0B',     // Amber / Rust
  F: '#06B6D4',      // Cyan
  I: '#8B5CF6',      // Violet
  S: '#EAB308',      // Gold
  P: '#F97316',      // Orange
  H: '#64748B',      // Slate-500
};

/**
 * Returns the target valence of an atom based on its formal charge
 */
export function getTargetValence(element: AtomElement, charge: number = 0): number {
  const std = STANDARD_VALENCES[element] ?? 4;
  if (element === 'N') {
    if (charge === 1) return 4;
    if (charge === -1) return 2;
  } else if (element === 'O') {
    if (charge === 1) return 3;
    if (charge === -1) return 1;
  } else if (element === 'C') {
    if (charge === 1 || charge === -1) return 3;
  }
  return std;
}

/**
 * Recalculates explicit valence and implicit hydrogen counts for all atoms in graph
 */
export function recalculateAllValences(graph: MolecularGraphData): MolecularGraphData {
  const valenceMap = new Map<string, number>();

  // Sum incident bond orders for each atom
  for (const bond of graph.bonds) {
    valenceMap.set(bond.source, (valenceMap.get(bond.source) ?? 0) + bond.order);
    valenceMap.set(bond.target, (valenceMap.get(bond.target) ?? 0) + bond.order);
  }

  const updatedAtoms = graph.atoms.map((atom) => {
    const explicitValence = valenceMap.get(atom.id) ?? 0;
    const target = getTargetValence(atom.element, atom.charge);
    const implicitH = Math.max(0, target - explicitValence);
    return {
      ...atom,
      implicitH,
    };
  });

  return {
    atoms: updatedAtoms,
    bonds: graph.bonds,
  };
}

/**
 * Formatted label for rendering an atom on the skeletal canvas
 */
export interface AtomDisplayLabel {
  text: string;
  hasText: boolean;
  color: string;
  chargeBadge?: string;
}

export function getAtomDisplayLabel(atom: AtomNode, degree: number): AtomDisplayLabel {
  const color = ELEMENT_COLORS[atom.element] ?? '#FFFFFF';
  let chargeBadge: string | undefined;
  if (atom.charge > 0) {
    chargeBadge = atom.charge === 1 ? '+' : `+${atom.charge}`;
  } else if (atom.charge < 0) {
    chargeBadge = atom.charge === -1 ? '-' : `${atom.charge}`;
  }

  // Carbon skeleton: Carbons in chains or rings are represented by line vertices (no text)
  if (atom.element === 'C') {
    if (degree === 0) {
      // Isolated single carbon
      return {
        text: atom.implicitH > 0 ? (atom.implicitH === 4 ? 'CH₄' : `CH${atom.implicitH}`) : 'C',
        hasText: true,
        color: '#E2E8F0',
        chargeBadge,
      };
    }
    // Connected carbon: hidden text (pure skeletal line vertex)
    return {
      text: '',
      hasText: false,
      color,
      chargeBadge,
    };
  }

  // Heteroatoms: Always display element symbol and implicit hydrogens
  let hSuffix = '';
  if (atom.implicitH === 1) {
    hSuffix = 'H';
  } else if (atom.implicitH > 1) {
    hSuffix = `H${atom.implicitH}`;
  }

  return {
    text: `${atom.element}${hSuffix}`,
    hasText: true,
    color,
    chargeBadge,
  };
}

/**
 * Computes Hill-system Molecular Formula (e.g., C4H10O, CH4, etc.)
 */
export function computeHillFormula(graph: MolecularGraphData): string {
  if (graph.atoms.length === 0) return '';

  const counts = new Map<string, number>();
  let totalH = 0;

  for (const atom of graph.atoms) {
    if (atom.element === 'H') {
      totalH += 1;
    } else {
      counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1);
      totalH += atom.implicitH;
    }
  }

  if (totalH > 0) {
    counts.set('H', (counts.get('H') ?? 0) + totalH);
  }

  const parts: string[] = [];
  const hasCarbon = counts.has('C');

  if (hasCarbon) {
    const cCount = counts.get('C')!;
    parts.push(`C${cCount > 1 ? cCount : ''}`);
    counts.delete('C');

    if (counts.has('H')) {
      const hCount = counts.get('H')!;
      parts.push(`H${hCount > 1 ? hCount : ''}`);
      counts.delete('H');
    }
  }

  const remaining = Array.from(counts.keys()).sort();
  for (const el of remaining) {
    const cnt = counts.get(el)!;
    parts.push(`${el}${cnt > 1 ? cnt : ''}`);
  }

  return parts.join('');
}
