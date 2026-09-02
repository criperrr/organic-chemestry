/**
 * Functional group identification and atom highlighting for organic chemistry education.
 * Highlights specific functional groups (carbonyl, nitrogen, halogen, hydroxyl) with
 * pedagogical colored halo markers on SmilesDrawer canvas/SVG depictions.
 */

export type HighlightGroup = 'carbonyl' | 'nitrogen' | 'halogen' | 'hydroxyl' | 'none';

export const HIGHLIGHT_COLORS: Record<HighlightGroup, string> = {
  carbonyl: 'rgba(239, 68, 68, 0.45)', // Red halo
  nitrogen: 'rgba(59, 130, 246, 0.45)', // Electric blue halo
  halogen: 'rgba(16, 185, 129, 0.45)',  // Emerald green halo
  hydroxyl: 'rgba(6, 182, 212, 0.45)',  // Cyan halo
  none: 'transparent',
};

export interface SmilesAtomData {
  element: string;
  class?: number;
  isotope?: number | null;
  chirality?: string | null;
  hcount?: number | null;
  charge?: number | null;
  [key: string]: unknown;
}

export interface SmilesParseNode {
  atom: string | SmilesAtomData;
  isBracket?: boolean;
  branches?: SmilesParseNode[];
  branchCount?: number;
  ringbonds?: Array<{ id: number; bond?: string; [key: string]: unknown }>;
  ringbondCount?: number;
  bond?: string;
  branchBond?: string;
  next?: SmilesParseNode | null;
  hasNext?: boolean;
  [key: string]: unknown;
}

export interface HighlightResult {
  classId: number;
  color: string;
  count: number;
}

/**
 * Extracts element symbol from an atom representation.
 */
export function getElementSymbol(atom: string | SmilesAtomData | undefined | null): string {
  if (!atom) return '';
  if (typeof atom === 'string') return atom.toUpperCase();
  return (atom.element || '').toUpperCase();
}

/**
 * Deep clones a SmilesDrawer parse tree to prevent mutating shared or cached trees.
 */
export function cloneParseTree(node: SmilesParseNode): SmilesParseNode {
  const cloned: SmilesParseNode = {
    ...node,
    atom: typeof node.atom === 'string' ? node.atom : { ...node.atom },
  };

  if (node.branches && Array.isArray(node.branches)) {
    cloned.branches = node.branches.map(cloneParseTree);
  }
  if (node.next) {
    cloned.next = cloneParseTree(node.next);
  }
  if (node.ringbonds && Array.isArray(node.ringbonds)) {
    cloned.ringbonds = node.ringbonds.map((rb) => ({ ...rb }));
  }

  return cloned;
}

/**
 * Identifies atoms corresponding to the requested functional group
 * and assigns a SmilesDrawer atom class ID so SmilesDrawer's native
 * atom highlight renderer can draw the visual halo.
 */
export function tagFunctionalGroup(
  tree: SmilesParseNode,
  group: HighlightGroup,
  customClassId = 999
): HighlightResult | null {
  if (group === 'none' || !tree) {
    return null;
  }

  const halogens = new Set(['F', 'CL', 'BR', 'I']);
  let matchCount = 0;

  function isCarbonylOxygen(node: SmilesParseNode, incomingBond: string): boolean {
    const elem = getElementSymbol(node.atom);
    if (elem !== 'O') return false;
    // Double bond incoming from branch or chain
    if (incomingBond === '=') return true;
    if (node.bond === '=') return true;
    if (node.branchBond === '=') return true;
    if (node.next && (node.next.bond === '=' || node.bond === '=')) return true;
    return false;
  }

  function isHydroxylOxygen(
    node: SmilesParseNode,
    incomingBond: string,
    hasParent: boolean
  ): boolean {
    const elem = getElementSymbol(node.atom);
    if (elem !== 'O') return false;

    // Must NOT be double-bonded (carbonyl)
    if (incomingBond === '=' || node.bond === '=' || node.branchBond === '=') {
      return false;
    }

    // In SMILES, an ether oxygen bridges two carbon fragments (e.g. C-O-C).
    // A hydroxyl oxygen is terminal (e.g. C-O or C-O[H]) and does not bridge non-hydrogen atoms.
    const hasNonHBranches =
      node.branches &&
      node.branches.some((b) => {
        const symbol = getElementSymbol(b.atom);
        return symbol !== 'H' && symbol !== '';
      });

    const hasNonHNext =
      node.next &&
      (() => {
        const symbol = getElementSymbol(node.next?.atom);
        return symbol !== 'H' && symbol !== '';
      })();

    if (hasParent && (hasNonHBranches || hasNonHNext)) {
      // Bridging two carbon chains => ether, not hydroxyl
      return false;
    }

    return true;
  }

  function walk(node: SmilesParseNode | null | undefined, hasParent: boolean, incomingBond: string): void {
    if (!node) return;

    const elem = getElementSymbol(node.atom);
    let shouldHighlight = false;

    switch (group) {
      case 'nitrogen':
        if (elem === 'N') {
          shouldHighlight = true;
        }
        break;

      case 'halogen':
        if (halogens.has(elem)) {
          shouldHighlight = true;
        }
        break;

      case 'carbonyl':
        if (isCarbonylOxygen(node, incomingBond)) {
          shouldHighlight = true;
        }
        break;

      case 'hydroxyl':
        if (isHydroxylOxygen(node, incomingBond, hasParent)) {
          shouldHighlight = true;
        }
        break;

      default:
        break;
    }

    if (shouldHighlight) {
      matchCount++;
      if (typeof node.atom === 'string') {
        node.atom = {
          element: node.atom,
          class: customClassId,
          isotope: null,
          charge: null,
          chirality: null,
          hcount: null,
        };
      } else if (node.atom) {
        node.atom.class = customClassId;
        if (node.atom.isotope === undefined) node.atom.isotope = null;
        if (node.atom.charge === undefined) node.atom.charge = null;
        if (node.atom.chirality === undefined) node.atom.chirality = null;
        if (node.atom.hcount === undefined) node.atom.hcount = null;
      }
    }

    if (node.branches && Array.isArray(node.branches)) {
      for (const b of node.branches) {
        walk(b, true, b.branchBond || b.bond || '-');
      }
    }

    if (node.next) {
      walk(node.next, true, node.next.bond || node.bond || '-');
    }
  }

  walk(tree, false, '-');

  if (matchCount === 0) {
    return null;
  }

  return {
    classId: customClassId,
    color: HIGHLIGHT_COLORS[group],
    count: matchCount,
  };
}
