/**
 * packages/chemistry-core/src/graph-namer.ts
 * Rigorous Implementation of 2D Molecular Graph to Canonical IUPAC (pt-BR), Formula, and SMILES Engine.
 * 
 * Compliant with:
 * - IUPAC Blue Book (2013) & IUPAC Recommendations (1993)
 * - funcoes.pdf (16 canonical organic functions)
 * - Novo Acordo Ortográfico da Língua Portuguesa (Base XVI)
 */

import { OrganicFunction, IUPAC_PRIORITY_ORDER } from './types.js';
import type {
  AtomElement,
  AtomNode,
  BondEdge,
  BondOrder,
  MolecularGraphData,
} from './types.js';

export type {
  AtomElement,
  AtomNode,
  BondEdge,
  BondOrder,
  BondStyle,
  MolecularGraphData,
} from './types.js';

/**
 * Fast Adjacency Item for O(1) Graph Traversal.
 */
export interface NeighborEdge {
  readonly neighborId: string;
  readonly bondId: string;
  readonly order: BondOrder;
}

/**
 * Result of the end-to-end graph naming pipeline.
 */
export interface MolecularGraphNamingResult {
  iupacName2013: string;
  iupacName1993: string;
  formula: string;
  smiles: string;
  primaryFunction: OrganicFunction;
  secondaryFunctions: OrganicFunction[];
}

export type GraphNamerResult = MolecularGraphNamingResult;

/**
 * Ring identified by cycle perception.
 */
export interface Ring {
  id: number;
  atomIds: string[];        // In cyclic order
  bondIds: string[];
  isAromatic: boolean;
  isBenzene: boolean;
  isNaphthalene?: boolean;
}

/**
 * Detected functional group instance.
 */
export interface DetectedFunction {
  type: OrganicFunction;
  carbonId: string;         // Principal carbon id
  atomIds: string[];        // All atoms participating in the functional group
  priority: number;         // IUPAC Priority
  extra?: Record<string, string>;
}

/**
 * Master Molecular Graph representation with adjacency caching.
 */
export class MolecularGraph {
  public atoms: Map<string, AtomNode> = new Map();
  public bonds: Map<string, BondEdge> = new Map();
  public adjacency: Map<string, NeighborEdge[]> = new Map();

  constructor(data?: MolecularGraphData) {
    if (data) {
      for (const atom of data.atoms) {
        this.addAtom({ ...atom });
      }
      for (const bond of data.bonds) {
        this.addBond({ ...bond });
      }
    }
  }

  public addAtom(atom: AtomNode): void {
    this.atoms.set(atom.id, atom);
    if (!this.adjacency.has(atom.id)) {
      this.adjacency.set(atom.id, []);
    }
  }

  public addBond(bond: BondEdge): void {
    this.bonds.set(bond.id, bond);

    if (!this.adjacency.has(bond.source)) this.adjacency.set(bond.source, []);
    if (!this.adjacency.has(bond.target)) this.adjacency.set(bond.target, []);

    this.adjacency.get(bond.source)!.push({
      neighborId: bond.target,
      bondId: bond.id,
      order: bond.order,
    });
    this.adjacency.get(bond.target)!.push({
      neighborId: bond.source,
      bondId: bond.id,
      order: bond.order,
    });
  }

  public getNeighbors(atomId: string): NeighborEdge[] {
    return this.adjacency.get(atomId) ?? [];
  }

  public getBondBetween(u: string, v: string): BondEdge | undefined {
    const edges = this.adjacency.get(u);
    if (!edges) return undefined;
    const match = edges.find(e => e.neighborId === v);
    return match ? this.bonds.get(match.bondId) : undefined;
  }

  public toData(): MolecularGraphData {
    return {
      atoms: Array.from(this.atoms.values()).map(a => ({ ...a })),
      bonds: Array.from(this.bonds.values()).map(b => ({ ...b })),
    };
  }

  public clone(): MolecularGraph {
    return new MolecularGraph(this.toData());
  }
}

// ============================================================================
// 1. Valence & Implicit Hydrogens
// ============================================================================

const STANDARD_VALENCE: Record<AtomElement, number> = {
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

export function calculateValences(graph: MolecularGraph): void {
  for (const atom of graph.atoms.values()) {
    let explicitValence = 0;
    const neighbors = graph.getNeighbors(atom.id);
    for (const edge of neighbors) {
      explicitValence += edge.order;
    }

    // Aromatic atoms written in lowercase SMILES carry no Kekulé double bonds,
    // yet each one still contributes exactly one delocalised pi bond. Without
    // this, benzene would come out as C6H12 instead of C6H6.
    //
    // The bump counts towards saturation only — the *target* valence of sulfur
    // and phosphorus is picked from their sigma-bond count, so adding it before
    // that decision would promote thiophene's S to valence 4 and invent an H.
    const sigmaValence = explicitValence;
    if (
      atom.aromatic &&
      atom.explicitHCount === undefined &&
      !neighbors.some(n => n.order > 1)
    ) {
      explicitValence += 1;
    }

    let target = STANDARD_VALENCE[atom.element] ?? 4;
    if (atom.element === 'C') {
      target = atom.charge !== 0 ? 3 : 4;
    } else if (atom.element === 'N') {
      target = atom.charge === 1 ? 4 : atom.charge === -1 ? 2 : 3;
    } else if (atom.element === 'O') {
      target = atom.charge === 1 ? 3 : atom.charge === -1 ? 1 : 2;
    } else if (['F', 'Cl', 'Br', 'I'].includes(atom.element)) {
      target = atom.charge === -1 ? 0 : 1;
    } else if (atom.element === 'S') {
      target = sigmaValence > 4 ? 6 : sigmaValence > 2 ? 4 : 2;
    } else if (atom.element === 'P') {
      target = sigmaValence > 3 ? 5 : 3;
    } else if (atom.element === 'H') {
      target = 1;
    }

    if (atom.element === 'H') {
      atom.implicitH = 0;
    } else if (atom.explicitHCount !== undefined) {
      // A bracketed atom states its own hydrogen count; nothing to infer.
      atom.implicitH = atom.explicitHCount;
    } else {
      atom.implicitH = Math.max(0, target - explicitValence);
    }

    // Hybridization estimate
    if (atom.element === 'C') {
      const hasTriple = neighbors.some(n => n.order === 3);
      const doubleCount = neighbors.filter(n => n.order === 2).length;
      if (hasTriple || doubleCount >= 2) {
        atom.hybridization = 'sp';
      } else if (doubleCount === 1 || atom.aromatic) {
        atom.hybridization = 'sp2';
      } else {
        atom.hybridization = 'sp3';
      }
    }
  }
}

// ============================================================================
// 2. Molecular Formula (Hill System)
// ============================================================================

export function computeMolecularFormula(graph: MolecularGraph): string {
  const counts = new Map<string, number>();
  let totalH = 0;

  for (const atom of graph.atoms.values()) {
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

// ============================================================================
// 3. Ring Perception & Aromaticity (SSSR)
// ============================================================================

function findShortestCycleWithEdge(
  graph: MolecularGraph,
  u: string,
  v: string,
  excludeBondId: string
): string[] | null {
  const queue: { current: string; path: string[] }[] = [{ current: u, path: [u] }];
  const visited = new Set<string>([u]);

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;
    if (current === v) {
      return path;
    }

    for (const edge of graph.getNeighbors(current)) {
      if (edge.bondId === excludeBondId) continue;
      const next = edge.neighborId;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ current: next, path: [...path, next] });
      }
    }
  }
  return null;
}

function canonicalCycleKey(cycle: string[]): string {
  const n = cycle.length;
  let minCycle = cycle;
  let minStr = cycle.join(',');

  // Check original orientation rotations
  for (let i = 0; i < n; i++) {
    const rotated = cycle.slice(i).concat(cycle.slice(0, i));
    const str = rotated.join(',');
    if (str < minStr) {
      minStr = str;
      minCycle = rotated;
    }
  }

  // Check reversed orientation rotations
  const reversed = [...cycle].reverse();
  for (let i = 0; i < n; i++) {
    const rotated = reversed.slice(i).concat(reversed.slice(0, i));
    const str = rotated.join(',');
    if (str < minStr) {
      minStr = str;
      minCycle = rotated;
    }
  }

  return minCycle.join(',');
}

export function computeSSSR(graph: MolecularGraph): string[][] {
  const bonds = Array.from(graph.bonds.values());
  const candidateCycles: string[][] = [];
  const seenKeys = new Set<string>();

  for (const bond of bonds) {
    const path = findShortestCycleWithEdge(graph, bond.source, bond.target, bond.id);
    if (path && path.length >= 3) {
      const key = canonicalCycleKey(path);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        candidateCycles.push(path);
      }
    }
  }

  candidateCycles.sort((a, b) => a.length - b.length);

  // Compute cyclomatic number M
  const V = graph.atoms.size;
  const E = graph.bonds.size;
  // Compute connected components
  let components = 0;
  const visited = new Set<string>();
  for (const atomId of graph.atoms.keys()) {
    if (!visited.has(atomId)) {
      components++;
      const q = [atomId];
      visited.add(atomId);
      while (q.length > 0) {
        const curr = q.shift()!;
        for (const n of graph.getNeighbors(curr)) {
          if (!visited.has(n.neighborId)) {
            visited.add(n.neighborId);
            q.push(n.neighborId);
          }
        }
      }
    }
  }

  const cyclomatic = Math.max(0, E - V + components);
  if (cyclomatic === 0) return [];

  // Edge indexing for GF(2) linear independence
  const bondIndex = new Map<string, number>();
  bonds.forEach((b, i) => bondIndex.set(b.id, i));

  const basisVectors: boolean[][] = [];
  const sssr: string[][] = [];

  for (const cycle of candidateCycles) {
    const vec: boolean[] = new Array(E).fill(false);
    for (let i = 0; i < cycle.length; i++) {
      const u = cycle[i];
      const v = cycle[(i + 1) % cycle.length];
      const b = graph.getBondBetween(u, v);
      if (b && bondIndex.has(b.id)) {
        vec[bondIndex.get(b.id)!] = true;
      }
    }

    // Gaussian reduction over GF(2)
    const reducedVec = [...vec];
    for (const basis of basisVectors) {
      // Find leading 1 in basis
      const lead = basis.findIndex(Boolean);
      if (lead !== -1 && reducedVec[lead]) {
        for (let k = 0; k < E; k++) {
          reducedVec[k] = (reducedVec[k] !== basis[k]);
        }
      }
    }

    const firstOne = reducedVec.findIndex(Boolean);
    if (firstOne !== -1) {
      basisVectors.push(reducedVec);
      sssr.push(cycle);
      if (sssr.length === cyclomatic) break;
    }
  }

  return sssr;
}

export function perceiveRingsAndAromaticity(graph: MolecularGraph): Ring[] {
  const rawCycles = computeSSSR(graph);
  const rings: Ring[] = [];

  // Mark ring membership for every cycle up front. The aromaticity test looks at
  // whether a *neighbour* is a ring atom, and doing both in one pass made the
  // answer depend on the order the cycles happened to come in: the first ring of
  // Kekulé naphthalene was judged before the second one existed.
  rawCycles.forEach((atomIds, idx) => {
    atomIds.forEach(id => {
      const atom = graph.atoms.get(id);
      if (atom) {
        atom.inRing = true;
        atom.ringIds = [...new Set([...(atom.ringIds ?? []), idx])];
      }
    });
  });

  rawCycles.forEach((atomIds, idx) => {
    let isBenzene = false;
    let isAromatic = false;
    const bondIds: string[] = [];

    for (let i = 0; i < atomIds.length; i++) {
      const u = atomIds[i];
      const v = atomIds[(i + 1) % atomIds.length];
      const b = graph.getBondBetween(u, v);
      if (b) bondIds.push(b.id);
    }

    // Aromaticity is not a property of six-membered rings only. Computing it
    // just for benzene left every five-membered aromatic ring flagged
    // non-aromatic, so the heterocycle table matched the saturated entry:
    // thiophene answered to "tiolano" and pyridine's radical to "piperidinil".
    if (atomIds.every(id => graph.atoms.get(id)?.aromatic === true)) {
      isAromatic = true;
    }

    // The same ring can arrive written in Kekulé form, with plain upper-case
    // atoms and explicit alternating double bonds — that is what OPSIN emits and
    // what a student draws by hand. Without this, "C1=CC=NC=C1" was a diene
    // heterocycle rather than pyridine.
    if (!isAromatic && (atomIds.length === 5 || atomIds.length === 6)) {
      const ringBondSet = new Set(bondIds);
      const ringDoubles = bondIds.filter(bid => graph.bonds.get(bid)?.order === 2).length;
      const elements = atomIds.map(id => graph.atoms.get(id)?.element ?? 'C');
      // Only a double bond leaving the ring system disqualifies aromaticity (a
      // cyclohexadienone). A double bond into a *fused* ring does not: it is
      // how Kekulé naphthalene is written, and treating it as exocyclic left
      // half of that molecule non-aromatic.
      const hasExocyclicDouble = atomIds.some(id =>
        graph
          .getNeighbors(id)
          .some(
            n =>
              n.order === 2 &&
              !ringBondSet.has(n.bondId) &&
              !graph.atoms.get(n.neighborId)?.inRing
          )
      );
      const ringDoubleCountOf = (id: string) =>
        graph.getNeighbors(id).filter(n => ringBondSet.has(n.bondId) && n.order === 2).length;

      if (!hasExocyclicDouble) {
        // Every atom carrying exactly one double bond to a ring neighbour is
        // the general sp2 test. Counting only bonds *inside this ring* missed
        // naphthalene, whose fusion carbons double-bond into the other ring.
        const ringNeighbourDoubles = (id: string) =>
          graph
            .getNeighbors(id)
            .filter(n => n.order === 2 && graph.atoms.get(n.neighborId)?.inRing).length;

        if (
          atomIds.length === 6 &&
          elements.every(el => el === 'C' || el === 'N') &&
          atomIds.every(id => ringNeighbourDoubles(id) === 1)
        ) {
          isAromatic = true;
        } else if (atomIds.length === 5 && ringDoubles === 2) {
          // One heteroatom donates its lone pair and carries no ring double
          // bond: pyrrole, furan, thiophene and their aza analogues.
          const donors = atomIds.filter(
            (id, i) =>
              ['N', 'O', 'S'].includes(elements[i]) && ringDoubleCountOf(id) === 0
          );
          if (donors.length === 1) isAromatic = true;
        }
      }
    }

    if (atomIds.length === 6) {
      const allCarbon = atomIds.every(id => graph.atoms.get(id)?.element === 'C');
      if (allCarbon) {
        let doubleBonds = 0;
        let aromaticFlags = 0;
        for (const bid of bondIds) {
          const b = graph.bonds.get(bid);
          if (b) {
            if (b.order === 2) doubleBonds++;
            if (b.aromatic) aromaticFlags++;
          }
        }
        const allAtomsFlaggedAromatic = atomIds.every(
          id => graph.atoms.get(id)?.aromatic === true
        );
        if (doubleBonds === 3 || aromaticFlags >= 3 || allAtomsFlaggedAromatic) {
          isBenzene = true;
          isAromatic = true;
        }
      }
    }

    atomIds.forEach(id => {
      const atom = graph.atoms.get(id);
      if (atom) {
        if (isAromatic) {
          atom.aromatic = true;
          atom.hybridization = 'sp2';
        }
      }
    });

    for (const bid of bondIds) {
      const b = graph.bonds.get(bid);
      if (b) {
        b.inRing = true;
        if (isAromatic) b.aromatic = true;
      }
    }

    rings.push({ id: idx, atomIds, bondIds, isAromatic, isBenzene });
  });

  // Detect naphthalene: two fused 6-membered rings sharing 2 adjacent carbons, total 10 carbons
  if (rings.length >= 2) {
    for (let i = 0; i < rings.length; i++) {
      for (let j = i + 1; j < rings.length; j++) {
        const r1 = rings[i];
        const r2 = rings[j];
        if (r1.atomIds.length === 6 && r2.atomIds.length === 6) {
          const common = r1.atomIds.filter(id => r2.atomIds.includes(id));
          // Two conditions the original test left implicit and therefore never
          // checked: the shared atoms must be *adjacent* (otherwise the pair is
          // a bridged bicyclic such as bicyclo[2.2.2]octane, not a fused pair),
          // and the system must actually be aromatic — decalin shares an
          // adjacent edge too, and it was coming out as "naftaleno".
          const sharedAdjacent =
            common.length === 2 && graph.getBondBetween(common[0], common[1]) !== undefined;
          const bothAromatic =
            [...r1.atomIds, ...r2.atomIds].every(id => graph.atoms.get(id)?.aromatic === true);
          if (sharedAdjacent && bothAromatic) {
            const allC = [...r1.atomIds, ...r2.atomIds].every(
              id => graph.atoms.get(id)?.element === 'C'
            );
            if (allC) {
              r1.isNaphthalene = true;
              r2.isNaphthalene = true;
              r1.isAromatic = true;
              r2.isAromatic = true;
              r1.isBenzene = false;
              r2.isBenzene = false;
              [...r1.atomIds, ...r2.atomIds].forEach(id => {
                const a = graph.atoms.get(id);
                if (a) {
                  a.aromatic = true;
                  a.hybridization = 'sp2';
                }
              });
              [...r1.bondIds, ...r2.bondIds].forEach(bid => {
                const b = graph.bonds.get(bid);
                if (b) b.aromatic = true;
              });
            }
          }
        }
      }
    }
  }

  return rings;
}

// ============================================================================
// 4. Detection of 16 Canonical Functional Groups
// ============================================================================

export function detectFunctionalGroups(
  graph: MolecularGraph,
  rings: Ring[] = []
): DetectedFunction[] {
  const detected: DetectedFunction[] = [];
  const processedCarbons = new Set<string>();

  // Helper to check if atom is Oxygen with single bond to H or negative charge (hydroxyl/carboxylate)
  const isHydroxylOrOxide = (oAtomId: string): boolean => {
    const atom = graph.atoms.get(oAtomId);
    if (!atom || atom.element !== 'O') return false;
    const neighbors = graph.getNeighbors(oAtomId);
    // Order matters: a carbonyl oxygen is also a one-neighbour oxygen, and
    // counting it as a hydroxyl invented alcohols on carbonyl carbons that the
    // carbonyl pass had not claimed.
    if (neighbors.length === 1) return neighbors[0].order === 1; // terminal OH or O-
    if (neighbors.length === 2 && neighbors.some(n => graph.atoms.get(n.neighborId)?.element === 'H')) {
      return true;
    }
    return false;
  };

  // Helper to check if carbon is carbonyl (C=O)
  const getCarbonylOxygen = (cId: string): NeighborEdge | undefined => {
    const neighbors = graph.getNeighbors(cId);
    return neighbors.find(
      n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O'
    );
  };

  // 1. Check Carbonyl derivatives
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'C') continue;
    const carbonylO = getCarbonylOxygen(atom.id);
    if (!carbonylO) continue;

    const neighbors = graph.getNeighbors(atom.id);
    const oId = carbonylO.neighborId;

    // F01: acido_carboxilico: C(=O)[OH]
    const ohEdge = neighbors.find(
      n => n.neighborId !== oId && n.order === 1 && isHydroxylOrOxide(n.neighborId)
    );
    if (ohEdge) {
      detected.push({
        type: 'acido_carboxilico',
        carbonId: atom.id,
        atomIds: [atom.id, oId, ohEdge.neighborId],
        priority: IUPAC_PRIORITY_ORDER.acido_carboxilico,
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F02: anidrido: C(=O)-O-C(=O)
    const anhydrideEdge = neighbors.find(n => {
      if (n.neighborId === oId || n.order !== 1) return false;
      const bridgeAtom = graph.atoms.get(n.neighborId);
      if (!bridgeAtom || bridgeAtom.element !== 'O') return false;
      const bridgeNeighbors = graph.getNeighbors(bridgeAtom.id);
      return bridgeNeighbors.some(
        bn => bn.neighborId !== atom.id && getCarbonylOxygen(bn.neighborId) !== undefined
      );
    });
    if (anhydrideEdge) {
      detected.push({
        type: 'anidrido',
        carbonId: atom.id,
        atomIds: [atom.id, oId, anhydrideEdge.neighborId],
        priority: IUPAC_PRIORITY_ORDER.anidrido,
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F03: ester: C(=O)O-C (where the other C is not C=O)
    const esterEdge = neighbors.find(n => {
      if (n.neighborId === oId || n.order !== 1) return false;
      const oBridge = graph.atoms.get(n.neighborId);
      if (!oBridge || oBridge.element !== 'O') return false;
      const oBridgeNeighbors = graph.getNeighbors(oBridge.id);
      return oBridgeNeighbors.some(
        bn => bn.neighborId !== atom.id && graph.atoms.get(bn.neighborId)?.element === 'C'
      );
    });
    if (esterEdge) {
      const oBridge = graph.atoms.get(esterEdge.neighborId)!;
      const otherC = graph.getNeighbors(oBridge.id).find(bn => bn.neighborId !== atom.id);
      detected.push({
        type: 'ester',
        carbonId: atom.id,
        atomIds: [atom.id, oId, esterEdge.neighborId, otherC?.neighborId ?? ''],
        priority: IUPAC_PRIORITY_ORDER.ester,
        extra: { alkylCarbonId: otherC?.neighborId ?? '' },
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F04: haleto_acila: C(=O)X (X = F, Cl, Br, I)
    const halideEdge = neighbors.find(
      n => ['F', 'Cl', 'Br', 'I'].includes(graph.atoms.get(n.neighborId)?.element ?? '')
    );
    if (halideEdge) {
      const xAtom = graph.atoms.get(halideEdge.neighborId)!;
      detected.push({
        type: 'haleto_acila',
        carbonId: atom.id,
        atomIds: [atom.id, oId, xAtom.id],
        priority: IUPAC_PRIORITY_ORDER.haleto_acila,
        extra: { halogen: xAtom.element },
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F05: amida: C(=O)N
    const amideEdge = neighbors.find(
      n => n.order === 1 && graph.atoms.get(n.neighborId)?.element === 'N'
    );
    // A lactam — carbonyl and nitrogen both in the same ring — is named from the
    // ring skeleton with an "-ona" suffix (pirrolidin-2-ona), not as an amide;
    // "pirrolidinamida" described a ring with an extra NH2 hanging off it.
    const isLactam =
      amideEdge !== undefined &&
      atom.inRing === true &&
      graph.atoms.get(amideEdge.neighborId)?.inRing === true &&
      rings.some(r => r.atomIds.includes(atom.id) && r.atomIds.includes(amideEdge.neighborId));
    if (isLactam) {
      detected.push({
        type: 'cetona',
        carbonId: atom.id,
        atomIds: [atom.id, oId],
        priority: IUPAC_PRIORITY_ORDER.cetona,
      });
      processedCarbons.add(atom.id);
      continue;
    }
    if (amideEdge) {
      detected.push({
        type: 'amida',
        carbonId: atom.id,
        atomIds: [atom.id, oId, amideEdge.neighborId],
        priority: IUPAC_PRIORITY_ORDER.amida,
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F07: aldeido: C(=O)H (or formaldehyde, or terminal carbonyl with implicitH >= 1)
    const hasExplicitH = neighbors.some(n => graph.atoms.get(n.neighborId)?.element === 'H');
    if (atom.implicitH >= 1 || hasExplicitH) {
      detected.push({
        type: 'aldeido',
        carbonId: atom.id,
        atomIds: [atom.id, oId],
        priority: IUPAC_PRIORITY_ORDER.aldeido,
      });
      processedCarbons.add(atom.id);
      continue;
    }

    // F08: cetona: C-C(=O)-C
    const carbonNeighbors = neighbors.filter(
      n => n.neighborId !== oId && graph.atoms.get(n.neighborId)?.element === 'C'
    );
    if (carbonNeighbors.length >= 2 || (atom.inRing && carbonNeighbors.length >= 1)) {
      detected.push({
        type: 'cetona',
        carbonId: atom.id,
        atomIds: [atom.id, oId],
        priority: IUPAC_PRIORITY_ORDER.cetona,
      });
      processedCarbons.add(atom.id);
      continue;
    }
  }

  // 2. F06: nitrila: C#N
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'C') continue;
    const nNeighbor = graph.getNeighbors(atom.id).find(
      n => n.order === 3 && graph.atoms.get(n.neighborId)?.element === 'N'
    );
    if (nNeighbor) {
      detected.push({
        type: 'nitrila',
        carbonId: atom.id,
        atomIds: [atom.id, nNeighbor.neighborId],
        priority: IUPAC_PRIORITY_ORDER.nitrila,
      });
      processedCarbons.add(atom.id);
    }
  }

  // 3. F15: nitrocomposto: C-N(=O)[O-]
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'N') continue;
    const oNeighbors = graph.getNeighbors(atom.id).filter(
      n => graph.atoms.get(n.neighborId)?.element === 'O'
    );
    const cNeighbor = graph.getNeighbors(atom.id).find(
      n => graph.atoms.get(n.neighborId)?.element === 'C'
    );
    if (oNeighbors.length >= 2 && cNeighbor) {
      detected.push({
        type: 'nitrocomposto',
        carbonId: cNeighbor.neighborId,
        atomIds: [atom.id, ...oNeighbors.map(o => o.neighborId)],
        priority: IUPAC_PRIORITY_ORDER.nitrocomposto,
      });
    }
  }

  // 4. F11: fenol, F10: enol, F09: alcool: -OH groups
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'O') continue;
    if (!isHydroxylOrOxide(atom.id)) continue;

    const neighbors = graph.getNeighbors(atom.id);
    const cNeighbor = neighbors.find(n => graph.atoms.get(n.neighborId)?.element === 'C');
    if (!cNeighbor) continue;

    const cId = cNeighbor.neighborId;
    if (processedCarbons.has(cId)) continue; // Part of carboxylic acid

    const cAtom = graph.atoms.get(cId)!;

    // F11: Fenol: -OH attached directly to aromatic benzene ring
    if (cAtom.aromatic || rings.some(r => r.isBenzene && r.atomIds.includes(cId))) {
      detected.push({
        type: 'fenol',
        carbonId: cId,
        atomIds: [atom.id, cId],
        priority: IUPAC_PRIORITY_ORDER.fenol,
      });
      continue;
    }

    // F10: Enol: -OH on aliphatic sp2 C with double bond (not in aromatic ring)
    const cNeighbors = graph.getNeighbors(cId);
    const hasDoubleBond = cNeighbors.some(
      n => n.neighborId !== atom.id && n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'C'
    );

    if (hasDoubleBond && !cAtom.aromatic) {
      detected.push({
        type: 'enol',
        carbonId: cId,
        atomIds: [atom.id, cId],
        priority: IUPAC_PRIORITY_ORDER.enol,
      });
      continue;
    }

    // F09: Alcool: -OH on saturated aliphatic carbon
    detected.push({
      type: 'alcool',
      carbonId: cId,
      atomIds: [atom.id, cId],
      priority: IUPAC_PRIORITY_ORDER.alcool,
    });
  }

  // 5. F12: amina: -NR1R2 (no C=O on N)
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'N') continue;
    // A nitrogen that *is* a ring vertex belongs to the parent hydride
    // (piperidine, pyridine); it is not an amine substituent.
    if (atom.inRing) continue;
    // Ensure it's not amide, nitrile, or nitro
    const neighbors = graph.getNeighbors(atom.id);
    const isAmide = neighbors.some(n => getCarbonylOxygen(n.neighborId) !== undefined);
    const isNitrile = neighbors.some(n => n.order === 3);
    const isNitro = neighbors.filter(n => graph.atoms.get(n.neighborId)?.element === 'O').length >= 2;

    if (!isAmide && !isNitrile && !isNitro) {
      const cNeighbors = neighbors.filter(n => graph.atoms.get(n.neighborId)?.element === 'C');
      const primaryCarbon =
        cNeighbors
          .map(n => ({
            id: n.neighborId,
            size: getSubtreeAtoms(graph, n.neighborId, atom.id).filter(
              a => graph.atoms.get(a)?.element === 'C'
            ).length,
          }))
          .sort((a, b) => b.size - a.size)[0]?.id ?? '';
      detected.push({
        type: 'amina',
        carbonId: primaryCarbon,
        atomIds: [atom.id],
        priority: IUPAC_PRIORITY_ORDER.amina,
      });
    }
  }

  // 6. F13: eter: C-O-C (neither is C=O)
  for (const atom of graph.atoms.values()) {
    if (atom.element !== 'O') continue;
    // Ring oxygens are skeleton atoms (oxane, tetrahydrofuran), not ethers.
    if (atom.inRing) continue;
    const neighbors = graph.getNeighbors(atom.id);
    if (neighbors.length === 2) {
      const [u, v] = neighbors;
      const uAtom = graph.atoms.get(u.neighborId);
      const vAtom = graph.atoms.get(v.neighborId);
      if (uAtom?.element === 'C' && vAtom?.element === 'C') {
        const uIsCarbonyl = getCarbonylOxygen(u.neighborId) !== undefined;
        const vIsCarbonyl = getCarbonylOxygen(v.neighborId) !== undefined;
        if (!uIsCarbonyl && !vIsCarbonyl) {
          detected.push({
            type: 'eter',
            carbonId: u.neighborId,
            atomIds: [atom.id, u.neighborId, v.neighborId],
            priority: IUPAC_PRIORITY_ORDER.eter,
            extra: { c1: u.neighborId, c2: v.neighborId },
          });
        }
      }
    }
  }

  // 7. F14: haleto_alquila: C-X (not acyl halide)
  for (const atom of graph.atoms.values()) {
    if (!['F', 'Cl', 'Br', 'I'].includes(atom.element)) continue;
    const neighbors = graph.getNeighbors(atom.id);
    if (neighbors.length >= 1) {
      const cId = neighbors[0].neighborId;
      const cAtom = graph.atoms.get(cId);
      if (cAtom?.element === 'C' && !getCarbonylOxygen(cId)) {
        detected.push({
          type: 'haleto_alquila',
          carbonId: cId,
          atomIds: [atom.id, cId],
          priority: IUPAC_PRIORITY_ORDER.haleto_alquila,
          extra: { halogen: atom.element },
        });
      }
    }
  }

  // 8. F16: hidrocarboneto: fallback if no other hetero functions or strictly C and H
  if (detected.length === 0) {
    detected.push({
      type: 'hidrocarboneto',
      carbonId: Array.from(graph.atoms.values()).find(a => a.element === 'C')?.id ?? '',
      atomIds: Array.from(graph.atoms.keys()),
      priority: IUPAC_PRIORITY_ORDER.hidrocarboneto,
    });
  }

  return detected;
}

export function selectPrimaryFunction(detected: DetectedFunction[]): OrganicFunction {
  if (detected.length === 0) return 'hidrocarboneto';
  return detected.reduce((best, cur) =>
    IUPAC_PRIORITY_ORDER[cur.type] > IUPAC_PRIORITY_ORDER[best.type] ? cur : best
  ).type;
}


// ============================================================================
// 4b. Heterocyclic Parent Rings (retained IUPAC names, pt-BR)
// ============================================================================

interface HeterocycleEntry {
  /** Ring size. */
  size: number;
  /** Heteroatom elements in the ring, sorted. */
  hetero: string[];
  aromatic: boolean;
  /**
   * Smallest cyclic separations between consecutive heteroatoms, sorted.
   * Distinguishes pyrimidine (1,3) from pyrazine (1,4). Omitted when the ring
   * has a single heteroatom, where position cannot vary.
   */
  gaps?: number[];
  name: string;
}

/**
 * Retained names for the heterocycles a Brazilian secondary-school / vestibular
 * course actually meets. Anything outside this table is reported as
 * un-nameable rather than being passed off as a carbocycle — naming pyridine
 * "ciclo-hexanamina" teaches the student something false.
 */
const HETEROCYCLES: HeterocycleEntry[] = [
  { size: 3, hetero: ['O'], aromatic: false, name: 'oxirano' },
  { size: 3, hetero: ['N'], aromatic: false, name: 'aziridina' },
  { size: 3, hetero: ['S'], aromatic: false, name: 'tiirano' },

  { size: 4, hetero: ['O'], aromatic: false, name: 'oxetano' },
  { size: 4, hetero: ['N'], aromatic: false, name: 'azetidina' },

  { size: 5, hetero: ['O'], aromatic: true, name: 'furano' },
  { size: 5, hetero: ['S'], aromatic: true, name: 'tiofeno' },
  { size: 5, hetero: ['N'], aromatic: true, name: 'pirrol' },
  { size: 5, hetero: ['N', 'N'], aromatic: true, gaps: [1, 4], name: 'pirazol' },
  { size: 5, hetero: ['N', 'N'], aromatic: true, gaps: [2, 3], name: 'imidazol' },
  { size: 5, hetero: ['O'], aromatic: false, name: 'oxolano' },
  { size: 5, hetero: ['N'], aromatic: false, name: 'pirrolidina' },
  { size: 5, hetero: ['S'], aromatic: false, name: 'tiolano' },

  { size: 6, hetero: ['N'], aromatic: true, name: 'piridina' },
  { size: 6, hetero: ['N', 'N'], aromatic: true, gaps: [1, 5], name: 'piridazina' },
  { size: 6, hetero: ['N', 'N'], aromatic: true, gaps: [2, 4], name: 'pirimidina' },
  { size: 6, hetero: ['N', 'N'], aromatic: true, gaps: [3, 3], name: 'pirazina' },
  { size: 6, hetero: ['O'], aromatic: false, name: 'oxano' },
  { size: 6, hetero: ['N'], aromatic: false, name: 'piperidina' },
  { size: 6, hetero: ['S'], aromatic: false, name: 'tiano' },
  { size: 6, hetero: ['O', 'O'], aromatic: false, gaps: [3, 3], name: '1,4-dioxano' },
  { size: 6, hetero: ['N', 'N'], aromatic: false, gaps: [3, 3], name: 'piperazina' },
  { size: 6, hetero: ['N', 'O'], aromatic: false, gaps: [3, 3], name: 'morfolina' },
];

/**
 * Returns the retained pt-BR name of a heterocyclic ring, or null when the ring
 * is all-carbon (caller names it systematically) or unsupported.
 */
export function identifyHeterocycle(
  graph: MolecularGraph,
  ringAtomIds: string[],
  isAromatic: boolean
): string | null {
  const elements = ringAtomIds.map(id => graph.atoms.get(id)?.element ?? 'C');
  const heteroIndices: number[] = [];
  elements.forEach((element, index) => {
    if (element !== 'C') heteroIndices.push(index);
  });
  if (heteroIndices.length === 0) return null;

  const hetero = heteroIndices.map(i => elements[i]).sort();
  const size = ringAtomIds.length;

  // Cyclic gaps between consecutive heteroatoms, rotation-independent.
  let gaps: number[] | undefined;
  if (heteroIndices.length > 1) {
    const raw: number[] = [];
    for (let i = 0; i < heteroIndices.length; i++) {
      const current = heteroIndices[i];
      const next = heteroIndices[(i + 1) % heteroIndices.length];
      raw.push(((next - current + size) % size) || size);
    }
    gaps = [...raw].sort((a, b) => a - b);
  }

  const match = HETEROCYCLES.find(entry => {
    if (entry.size !== size) return false;
    if (entry.aromatic !== isAromatic) return false;
    if (entry.hetero.length !== hetero.length) return false;
    if (!entry.hetero.every((element, i) => element === hetero[i])) return false;
    if (!entry.gaps) return true;
    const expected = [...entry.gaps].sort((a, b) => a - b);
    return gaps !== undefined && expected.every((gap, i) => gap === gaps![i]);
  });

  return match ? match.name : null;
}

/** True when the ring skeleton contains at least one non-carbon atom. */
export function ringHasHeteroatoms(graph: MolecularGraph, ringAtomIds: string[]): boolean {
  return ringAtomIds.some(id => graph.atoms.get(id)?.element !== 'C');
}

// ============================================================================
// 5. Parent Structure & Main Carbon Chain Identification
// ============================================================================

export interface ParentStructure {
  type: 'chain' | 'ring';
  atomIds: string[];         // Carbons in parent structure order
  ringType?: 'ciclo' | 'benzeno' | 'naftaleno';
  /**
   * Carbon bearing the principal characteristic group when it hangs off a ring
   * (e.g. the carboxyl carbon of "ácido benzoico"). Not part of `atomIds`.
   */
  exocyclicCarbonId?: string;
  /**
   * Ring-fusion atoms of a polycyclic parent (naphthalene 4a/8a). They never
   * bear substituents and are numbered last.
   */
  fusionAtomIds?: string[];
}

/**
 * Walks the outer perimeter of two ortho-fused rings, returning every atom of the
 * fused system in cyclic order. Used so that naphthalene is treated as a single
 * ten-atom parent instead of a benzene ring carrying two phenyl substituents.
 */
function buildFusedPerimeter(
  graph: MolecularGraph,
  r1: Ring,
  r2: Ring
): { order: string[]; fusion: string[] } | null {
  const union = new Set([...r1.atomIds, ...r2.atomIds]);
  const fusion = r1.atomIds.filter(id => r2.atomIds.includes(id));
  if (fusion.length !== 2) return null;

  const start = Array.from(union).find(id => !fusion.includes(id));
  if (!start) return null;

  const order: string[] = [start];
  const visited = new Set([start]);

  while (order.length < union.size) {
    const current = order[order.length - 1];
    const next = graph
      .getNeighbors(current)
      .map(n => n.neighborId)
      .find(id => {
        if (!union.has(id) || visited.has(id)) return false;
        // Never cross the internal fusion bond.
        return !(fusion.includes(id) && fusion.includes(current));
      });
    if (!next) return null;
    order.push(next);
    visited.add(next);
  }

  return { order, fusion };
}

/**
 * Functions whose principal characteristic group is expressed as a SUFFIX.
 *
 * Ethers, alkyl halides, nitro compounds and hydrocarbons never generate a
 * suffix — they are *always* cited as prefixes — so they must neither steer
 * parent-chain selection nor locant minimisation (IUPAC P-41 / P-14.4).
 */
export const SUFFIX_EXPRESSED_FUNCTIONS: ReadonlySet<OrganicFunction> = new Set<OrganicFunction>([
  'acido_carboxilico',
  'anidrido',
  'ester',
  'haleto_acila',
  'amida',
  'nitrila',
  'aldeido',
  'cetona',
  'alcool',
  'enol',
  'fenol',
  'amina',
]);

/**
 * Functions that have a "carbo-" form when the group hangs off a ring
 * (ácido ...carboxílico, ...carbaldeído, ...carbonitrila, ...carboxamida).
 * Any other function keeps the exocyclic carbon as a one-carbon parent chain,
 * so CH2OH on benzene is "fenilmetanol", never a ring name.
 */
const RING_CARBO_FUNCTIONS: ReadonlySet<OrganicFunction> = new Set<OrganicFunction>([
  'acido_carboxilico',
  'aldeido',
  'nitrila',
  'amida',
  'haleto_acila',
  'ester',
]);

/** Morphemes used by the "carbo-" ring forms above. */
const RING_CARBO_SUFFIX: Partial<Record<OrganicFunction, string>> = {
  acido_carboxilico: 'carboxílico',
  aldeido: 'carbaldeído',
  nitrila: 'carbonitrila',
  amida: 'carboxamida',
  ester: 'carboxilato',
};

/**
 * Functions whose group is necessarily at the chain terminus (locant always 1),
 * so the locant is never written.
 */
const TERMINAL_SUFFIX_FUNCTIONS: ReadonlySet<OrganicFunction> = new Set<OrganicFunction>([
  'acido_carboxilico',
  'anidrido',
  'ester',
  'haleto_acila',
  'amida',
  'nitrila',
  'aldeido',
]);

/**
 * Upper bound on enumerated candidate chains.
 *
 * The enumeration is exponential in the branching of the acyclic skeleton, and
 * it used to run unbounded from every carbon — enough to freeze the live
 * builder on a large, heavily branched drawing. The cap keeps the worst case
 * finite; the chains it drops are the deep tail of an already-sorted-by-merit
 * search, and every candidate that can win on length is reached long before it.
 */
const MAX_CANDIDATE_PATHS = 20000;

function findAllSimplePaths(
  graph: MolecularGraph,
  u: string,
  currentPath: string[],
  visited: Set<string>,
  paths: string[][],
  excludedChainCarbons: ReadonlySet<string> = new Set()
): void {
  if (paths.length >= MAX_CANDIDATE_PATHS) return;
  currentPath.push(u);
  visited.add(u);

  const neighbors = graph
    .getNeighbors(u)
    .filter(e => {
      const a = graph.atoms.get(e.neighborId);
      // Parent chains never run *through* a ring: the ring is either the parent
      // or a substituent, never half of an acyclic chain (IUPAC P-52.2.8).
      return (
        a?.element === 'C' &&
        !a.inRing &&
        !excludedChainCarbons.has(e.neighborId) &&
        !visited.has(e.neighborId)
      );
    });

  if (neighbors.length === 0) {
    paths.push([...currentPath]);
  } else {
    for (const n of neighbors) {
      findAllSimplePaths(graph, n.neighborId, currentPath, visited, paths, excludedChainCarbons);
    }
  }

  currentPath.pop();
  visited.delete(u);
}

function ringTypeOf(ring: Ring): 'ciclo' | 'benzeno' | 'naftaleno' {
  if (ring.isNaphthalene) return 'naftaleno';
  if (ring.isBenzene) return 'benzeno';
  return 'ciclo';
}

/**
 * Expands a ring into its full fused system when it is part of one, so the
 * partner ring is never mistaken for a substituent.
 */
function ringToParent(graph: MolecularGraph, ring: Ring, rings: Ring[]): ParentStructure {
  if (ring.isNaphthalene) {
    const partner = rings.find(
      r => r !== ring && r.isNaphthalene && r.atomIds.some(id => ring.atomIds.includes(id))
    );
    if (partner) {
      const perimeter = buildFusedPerimeter(graph, ring, partner);
      if (perimeter) {
        return {
          type: 'ring',
          atomIds: perimeter.order,
          ringType: 'naftaleno',
          fusionAtomIds: perimeter.fusion,
        };
      }
    }
  }
  return { type: 'ring', atomIds: ring.atomIds, ringType: ringTypeOf(ring) };
}

export function selectParentStructure(
  graph: MolecularGraph,
  primaryFunction: OrganicFunction,
  rings: Ring[],
  detectedFunctions: DetectedFunction[]
): ParentStructure {
  const drivesParent = SUFFIX_EXPRESSED_FUNCTIONS.has(primaryFunction);
  const primaryInstances = drivesParent
    ? detectedFunctions.filter(d => d.type === primaryFunction)
    : [];

  // (a) Principal group carried by a ring atom → the ring is the parent.
  const ringPrimary = rings.find(r =>
    primaryInstances.some(pi => r.atomIds.includes(pi.carbonId))
  );
  if (ringPrimary) {
    return ringToParent(graph, ringPrimary, rings);
  }

  // A nitrile that is not the principal group is cited as the prefix "ciano",
  // which *includes* its carbon. Leaving that carbon eligible for the parent
  // chain made the chain run into the C≡N and then name the nitrogen "amino",
  // turning a nitrile into an amine.
  const prefixedNitrileCarbons = new Set(
    primaryFunction === 'nitrila'
      ? []
      : detectedFunctions.filter(d => d.type === 'nitrila').map(d => d.carbonId)
  );

  const acyclicCarbons = Array.from(graph.atoms.values()).filter(
    a => a.element === 'C' && !a.inRing && !prefixedNitrileCarbons.has(a.id)
  );

  // (b) Principal group on a carbon hanging off a ring, with no acyclic chain to
  //     carry it → ring parent + "carboxílico"/retained-name treatment.
  if (primaryInstances.length > 0 && rings.length > 0 && RING_CARBO_FUNCTIONS.has(primaryFunction)) {
    for (const pi of primaryInstances) {
      const piAtom = graph.atoms.get(pi.carbonId);
      if (!piAtom || piAtom.inRing) continue;
      const attachedRing = rings.find(r =>
        graph.getNeighbors(pi.carbonId).some(n => r.atomIds.includes(n.neighborId))
      );
      if (!attachedRing) continue;
      const chainCarbons = graph
        .getNeighbors(pi.carbonId)
        .filter(n => {
          const a = graph.atoms.get(n.neighborId);
          return a?.element === 'C' && !a.inRing;
        });
      if (chainCarbons.length === 0) {
        return { ...ringToParent(graph, attachedRing, rings), exocyclicCarbonId: pi.carbonId };
      }
    }
  }

  // (c) No suffix group anchoring a chain → largest ring wins over shorter chains.
  if (rings.length > 0 && primaryInstances.length === 0) {
    const largestRing = rings.reduce((best, cur) =>
      cur.atomIds.length > best.atomIds.length ? cur : best
    );
    if (acyclicCarbons.length < largestRing.atomIds.length) {
      return ringToParent(graph, largestRing, rings);
    }
  }

  // (d) Otherwise: optimal acyclic carbon chain.
  if (acyclicCarbons.length === 0) {
    const anyRing = rings[0];
    if (anyRing) {
      return ringToParent(graph, anyRing, rings);
    }
    return { type: 'chain', atomIds: [] };
  }
  if (acyclicCarbons.length === 1) {
    return { type: 'chain', atomIds: [acyclicCarbons[0].id] };
  }

  // Every maximal chain ends at a terminal carbon, so starting the walk only
  // from those loses no candidate and cuts the enumeration by a large factor.
  const acyclicDegree = (id: string) =>
    graph.getNeighbors(id).filter(n => {
      const a = graph.atoms.get(n.neighborId);
      return a?.element === 'C' && !a.inRing && !prefixedNitrileCarbons.has(n.neighborId);
    }).length;
  const terminals = acyclicCarbons.filter(c => acyclicDegree(c.id) <= 1);

  const candidatePaths: string[][] = [];
  for (const carbon of terminals.length > 0 ? terminals : acyclicCarbons) {
    findAllSimplePaths(
      graph,
      carbon.id,
      [],
      new Set<string>(),
      candidatePaths,
      prefixedNitrileCarbons
    );
  }
  if (candidatePaths.length === 0) {
    return { type: 'chain', atomIds: [acyclicCarbons[0].id] };
  }

  const pfgCarbonIds = new Set(primaryInstances.map(pi => pi.carbonId));

  /** Substituent locants for a path, taking the better of the two directions. */
  const canonicalSubLocants = (path: string[]): number[] => {
    const inPath = new Set(path);
    const forward: number[] = [];
    const backward: number[] = [];
    path.forEach((cId, idx) => {
      const count = graph.getNeighbors(cId).filter(n => !inPath.has(n.neighborId)).length;
      for (let k = 0; k < count; k++) {
        forward.push(idx + 1);
        backward.push(path.length - idx);
      }
    });
    forward.sort((a, b) => a - b);
    backward.sort((a, b) => a - b);
    return compareLocantArrays(forward, backward) <= 0 ? forward : backward;
  };

  const scorePath = (path: string[]) => {
    const inPath = new Set(path);
    let pfgCount = 0;
    let multipleBonds = 0;
    let doubleBonds = 0;
    let substituents = 0;

    for (let i = 0; i < path.length; i++) {
      const cId = path[i];
      if (pfgCarbonIds.has(cId)) pfgCount++;
      substituents += graph.getNeighbors(cId).filter(n => !inPath.has(n.neighborId)).length;
      if (i < path.length - 1) {
        const bond = graph.getBondBetween(cId, path[i + 1]);
        if (bond && bond.order > 1) {
          multipleBonds++;
          if (bond.order === 2) doubleBonds++;
        }
      }
    }

    return {
      pfgCount,
      length: path.length,
      multipleBonds,
      doubleBonds,
      substituents,
      subLocants: canonicalSubLocants(path),
    };
  };

  type PathScore = ReturnType<typeof scorePath>;

  /**
   * IUPAC P-44 seniority of the principal chain, in strict order:
   *   1. max number of principal characteristic groups
   *   2. max length
   *   3. max number of skeletal multiple bonds
   *   4. max number of double bonds
   *   5. max number of substituent attachments
   *   6. lowest locants for those substituents
   */
  const isBetter = (a: PathScore, b: PathScore): boolean => {
    if (a.pfgCount !== b.pfgCount) return a.pfgCount > b.pfgCount;
    if (a.length !== b.length) return a.length > b.length;
    if (a.multipleBonds !== b.multipleBonds) return a.multipleBonds > b.multipleBonds;
    if (a.doubleBonds !== b.doubleBonds) return a.doubleBonds > b.doubleBonds;
    if (a.substituents !== b.substituents) return a.substituents > b.substituents;
    return compareLocantArrays(a.subLocants, b.subLocants) < 0;
  };

  let bestPath = candidatePaths[0];
  let bestScore = scorePath(bestPath);
  for (let i = 1; i < candidatePaths.length; i++) {
    const score = scorePath(candidatePaths[i]);
    if (isBetter(score, bestScore)) {
      bestPath = candidatePaths[i];
      bestScore = score;
    }
  }

  return { type: 'chain', atomIds: bestPath };
}

// ============================================================================
// 6. Numbering Direction & Locant Minimization
// ============================================================================

function compareLocantArrays(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

export function numberParentStructure(
  graph: MolecularGraph,
  parent: ParentStructure,
  primaryFunction: OrganicFunction,
  detectedFunctions: DetectedFunction[]
): Map<string, number> {
  const parentSet = new Set(parent.atomIds);

  // Only suffix-expressed functions get locant priority. A hydrocarbon, ether,
  // halide or nitro "principal function" must never bias the numbering.
  const pfgCarbons = new Set<string>();
  if (SUFFIX_EXPRESSED_FUNCTIONS.has(primaryFunction)) {
    for (const d of detectedFunctions) {
      if (d.type !== primaryFunction) continue;
      if (parentSet.has(d.carbonId)) pfgCarbons.add(d.carbonId);
    }
  }
  // "ácido benzoico" style: the ring atom carrying the exocyclic group is C1.
  if (parent.exocyclicCarbonId) {
    for (const n of graph.getNeighbors(parent.exocyclicCarbonId)) {
      if (parentSet.has(n.neighborId)) pfgCarbons.add(n.neighborId);
    }
  }

  const scoreOrder = (order: string[], cyclic: boolean) => {
    const numbering = new Map<string, number>();
    order.forEach((id, idx) => numbering.set(id, idx + 1));

    const pfgLocants: number[] = [];
    order.forEach((id, idx) => {
      if (pfgCarbons.has(id)) pfgLocants.push(idx + 1);
    });

    const multLocants: number[] = [];
    const doubleLocants: number[] = [];
    const limit = cyclic ? order.length : order.length - 1;
    for (let i = 0; i < limit; i++) {
      const bond = graph.getBondBetween(order[i], order[(i + 1) % order.length]);
      if (bond && bond.order > 1 && !bond.aromatic) {
        const loc = i + 1;
        multLocants.push(loc);
        if (bond.order === 2) doubleLocants.push(loc);
      }
    }

    const subLocants: number[] = [];
    order.forEach((id, idx) => {
      for (const n of graph.getNeighbors(id)) {
        if (!parentSet.has(n.neighborId)) subLocants.push(idx + 1);
      }
    });

    pfgLocants.sort((a, b) => a - b);
    multLocants.sort((a, b) => a - b);
    doubleLocants.sort((a, b) => a - b);
    subLocants.sort((a, b) => a - b);

    return { pfgLocants, multLocants, doubleLocants, subLocants, numbering };
  };

  type OrderScore = ReturnType<typeof scoreOrder>;

  const isBetter = (a: OrderScore, b: OrderScore): boolean => {
    const c1 = compareLocantArrays(a.pfgLocants, b.pfgLocants);
    if (c1 !== 0) return c1 < 0;
    const c2 = compareLocantArrays(a.multLocants, b.multLocants);
    if (c2 !== 0) return c2 < 0;
    const c3 = compareLocantArrays(a.doubleLocants, b.doubleLocants);
    if (c3 !== 0) return c3 < 0;
    return compareLocantArrays(a.subLocants, b.subLocants) < 0;
  };

  if (parent.type === 'chain') {
    const path = parent.atomIds;
    if (path.length === 0) return new Map();
    if (path.length === 1) return new Map([[path[0], 1]]);

    const forward = scoreOrder([...path], false);
    const backward = scoreOrder([...path].reverse(), false);
    return isBetter(backward, forward) ? backward.numbering : forward.numbering;
  }

  const ringAtoms = parent.atomIds;
  const n = ringAtoms.length;
  if (n === 0) return new Map();

  // Ortho-fused parents (naphthalene) follow the retained 1-8 + 4a/8a scheme:
  // the fusion atoms are skipped while numbering the perimeter.
  if (parent.fusionAtomIds && parent.fusionAtomIds.length === 2) {
    const fusion = new Set(parent.fusionAtomIds);
    let bestFused: { numbering: Map<string, number>; subLocants: number[] } | null = null;

    for (let start = 0; start < n; start++) {
      if (fusion.has(ringAtoms[start])) continue;
      const previous = ringAtoms[(start - 1 + n) % n];
      if (!fusion.has(previous)) continue;

      for (const step of [1, -1]) {
        const order: string[] = [];
        for (let i = 0; i < n; i++) order.push(ringAtoms[(start + step * i + n * n) % n]);
        if (!fusion.has(order[n - 1])) continue;

        const numbering = new Map<string, number>();
        let peripheral = 0;
        let fused = 8;
        for (const id of order) {
          numbering.set(id, fusion.has(id) ? ++fused : ++peripheral);
        }

        const subLocants: number[] = [];
        for (const id of order) {
          for (const nb of graph.getNeighbors(id)) {
            if (!parentSet.has(nb.neighborId)) subLocants.push(numbering.get(id)!);
          }
        }
        subLocants.sort((a, b) => a - b);

        if (!bestFused || compareLocantArrays(subLocants, bestFused.subLocants) < 0) {
          bestFused = { numbering, subLocants };
        }
      }
    }

    if (bestFused) return bestFused.numbering;
  }

  // In a heterocycle the ring heteroatom is locant 1 by definition (piperidin-4-ol,
  // never piperidin-1-ol); only rotations that start on one are admissible.
  const heteroPositions = ringAtoms
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => graph.atoms.get(id)?.element !== 'C')
    .map(({ index }) => index);

  const admissibleStarts =
    heteroPositions.length > 0 ? heteroPositions : Array.from({ length: n }, (_, i) => i);

  let best: OrderScore | null = null;
  for (const start of admissibleStarts) {
    for (const step of [1, -1]) {
      const order: string[] = [];
      for (let i = 0; i < n; i++) {
        order.push(ringAtoms[(start + step * i + n * n) % n]);
      }
      const score = scoreOrder(order, true);
      if (!best || isBetter(score, best)) best = score;
    }
  }

  return best ? best.numbering : new Map();
}

// ============================================================================
// 7. Substituent Identification & Radical Classification
// ============================================================================

export interface ClassifiedSubstituent {
  locant: number;
  /**
   * Italic locant used instead of the numeral, as in the "N" of N-metilanilina.
   * Carrying it here lets N-substituents be alphabetised together with the
   * carbon ones, which is what IUPAC asks for and what emitting them as a
   * separate leading block prevented.
   */
  locantLabel?: string;
  name: string;             // e.g. 'metil', 'cloro', '(clorometil)'
  sortKey: string;          // alphabetisation key, e.g. 'metil', 'clorometil'
  isComplex: boolean;
}

/**
 * Alphanumerical ordering key (IUPAC P-14.5.2): multiplying prefixes and the
 * italicised structural markers do not count. "terc-butil" files under B.
 */
function alphabetisationKey(sortKey: string): string {
  let key = sortKey.replace(/[()]/g, '');
  // Locants and italics can alternate ("2-terc-butilciclopentil"), so peel them
  // until nothing is left to peel. This has to happen *before* the orthographic
  // hyphens go, or "terc-butil" collapses to "tercbutil" and files under T.
  for (;;) {
    const next = key
      .replace(/^\d+(,\d+)*-/, '')
      .replace(/^(terc|sec|n)-/, '');
    if (next === key) break;
    key = next;
  }
  // "ciclo-hexil" alphabetises as "ciclohexil": the Novo Acordo hyphen is
  // orthography, not morphology, and leaving it in sorted it before
  // "ciclobutil".
  // Alphanumerical order compares letters first — inner locants are only a
  // tiebreak, and leaving them in put "1-metil-3-oxopropil" before "metilamino"
  // because the digits sorted ahead of the letters.
  return key.replace(/[\d,-]/g, '');
}

function getSubtreeAtoms(graph: MolecularGraph, root: string, exclude: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>([exclude]);
  const queue = [root];
  visited.add(root);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    result.push(curr);
    for (const e of graph.getNeighbors(curr)) {
      if (!visited.has(e.neighborId)) {
        visited.add(e.neighborId);
        queue.push(e.neighborId);
      }
    }
  }

  return result;
}

const HALOGEN_PREFIX: Record<string, string> = {
  F: 'fluor',
  Cl: 'cloro',
  Br: 'bromo',
  I: 'iodo',
};

/** Alkyl radical names indexed by carbon count (unbranched). */
const STEM_NAMES: Record<number, string> = {
  1: 'met',
  2: 'et',
  3: 'prop',
  4: 'but',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'oct',
  9: 'non',
  10: 'dec',
  11: 'undec',
  12: 'dodec',
  13: 'tridec',
  14: 'tetradec',
  15: 'pentadec',
  16: 'hexadec',
  17: 'heptadec',
  18: 'octadec',
  19: 'nonadec',
  20: 'icos',
  21: 'henicos',
  22: 'docos',
  23: 'tricos',
  24: 'tetracos',
  25: 'pentacos',
  26: 'hexacos',
  27: 'heptacos',
  28: 'octacos',
  29: 'nonacos',
  30: 'triacont',
};

/**
 * Unbranched alkyl radical names, derived from the stem table so the two can
 * never drift apart. They used to stop at decil, which is why an undecyl branch
 * fell through to the invented word "carbil".
 */
const ALKYL_NAMES: Record<number, string> = Object.fromEntries(
  Object.entries(STEM_NAMES).map(([n, stem]) => [Number(n), `${stem}il`])
);

/**
 * Names a saturated all-carbon branch, honouring the retained contracted names
 * (isopropil, sec-butil, terc-butil, isobutil, neopentil).
 */
function nameSimpleAlkyl(
  graph: MolecularGraph,
  rootId: string,
  attachedTo: string,
  branchCarbons: string[]
): string | null {
  const k = branchCarbons.length;
  const inBranch = new Set(branchCarbons);
  const degreeIn = (id: string) =>
    graph.getNeighbors(id).filter(n => inBranch.has(n.neighborId) && n.neighborId !== attachedTo)
      .length;

  if (k <= 2) return ALKYL_NAMES[k] ?? null;

  if (k === 3) return degreeIn(rootId) === 2 ? 'isopropil' : 'propil';

  if (k === 4) {
    const rootDeg = degreeIn(rootId);
    if (rootDeg === 3) return 'terc-butil';
    if (rootDeg === 2) return 'sec-butil';
    const second = graph
      .getNeighbors(rootId)
      .find(n => inBranch.has(n.neighborId) && n.neighborId !== attachedTo)?.neighborId;
    if (second && degreeIn(second) === 3) return 'isobutil';
    return 'butil';
  }

  if (k === 5) {
    const second = graph
      .getNeighbors(rootId)
      .find(n => inBranch.has(n.neighborId) && n.neighborId !== attachedTo)?.neighborId;
    if (degreeIn(rootId) === 1 && second && degreeIn(second) === 4) return 'neopentil';
  }

  // Unbranched *and* attached at a terminus: "pentil" means the parent hangs
  // off carbon 1. A five-carbon branch joined at its middle carbon satisfied
  // the old degree test and was named "pentil" too, which describes a
  // different molecule.
  const isUnbranched = branchCarbons.every(id => degreeIn(id) <= 2) && degreeIn(rootId) <= 1;
  return isUnbranched ? ALKYL_NAMES[k] ?? null : null;
}

/**
 * Longest carbon path inside a branch, starting at the attachment atom.
 */
function longestBranchChain(
  graph: MolecularGraph,
  rootId: string,
  attachedTo: string,
  branchCarbons: Set<string>
): string[] {
  let best: string[] = [rootId];
  const unsaturationOf = (path: string[]) => {
    let count = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const bond = graph.getBondBetween(path[i], path[i + 1]);
      if (bond && bond.order > 1) count++;
    }
    return count;
  };
  const walk = (id: string, path: string[], seen: Set<string>) => {
    // Equal-length candidates are broken by unsaturation: for an isopropenyl
    // group both branches are two carbons long, and picking the methyl left the
    // double bond unexpressed.
    if (
      path.length > best.length ||
      (path.length === best.length && unsaturationOf(path) > unsaturationOf(best))
    ) {
      best = [...path];
    }
    for (const n of graph.getNeighbors(id)) {
      if (n.neighborId === attachedTo || seen.has(n.neighborId)) continue;
      if (!branchCarbons.has(n.neighborId)) continue;
      seen.add(n.neighborId);
      path.push(n.neighborId);
      walk(n.neighborId, path, seen);
      path.pop();
      seen.delete(n.neighborId);
    }
  };
  walk(rootId, [rootId], new Set([rootId]));
  return best;
}

/**
 * Names any branch hanging off the parent structure — simple alkyl, halogenated,
 * functionalised or nested — producing a complex radical in parentheses when the
 * branch itself carries substituents (IUPAC P-29.2 / P-14.5.2).
 */

/**
 * Signals that a branch contains a ring the engine has no vocabulary for.
 *
 * Returning `null` was not an option: the caller drops null substituents, which
 * is exactly how a whole ring used to vanish from a name while the formula
 * stayed right. Throwing forces `analyzeMolecularGraph` to refuse out loud.
 */
export class UnnameableBranchError extends Error {
  constructor(readonly atomIds: string[], message: string) {
    super(message);
    this.name = 'UnnameableBranchError';
  }
}

/**
 * Names a ring cited as a substituent, with its attachment locant and its own
 * substituents.
 *
 * Three separate defects lived here before. Every aromatic ring returned the
 * constant "fenil", so pyridine and thiophene branches were named as benzene;
 * ring radicals carried no attachment locant, so "pirrolidinil" let a reader
 * (and OPSIN) attach through the nitrogen; and because the return value was a
 * constant, any substituent sitting on that ring was silently discarded.
 */
function nameRingRadical(
  graph: MolecularGraph,
  rootId: string,
  attachedTo: string,
  rings: Ring[],
  depth: number
): ClassifiedSubstituent | null {
  const hostRing = rings.find(r => r.atomIds.includes(rootId));
  if (!hostRing) return null;

  const ringIds = hostRing.atomIds;
  const n = ringIds.length;
  const ringSet = new Set(ringIds);
  const isHetero = ringHasHeteroatoms(graph, ringIds);
  const retained = isHetero ? identifyHeterocycle(graph, ringIds, hostRing.isAromatic) : null;

  if (isHetero && !retained) {
    throw new UnnameableBranchError(
      ringIds,
      'Anel heterocíclico substituinte fora da tabela de nomes que eu conheço.'
    );
  }
  const sharesAtomsWithAnotherRing = rings.some(
    r => r !== hostRing && r.atomIds.some(id => ringSet.has(id))
  );
  if (hostRing.isNaphthalene || sharesAtomsWithAnotherRing || !STEM_NAMES[n]) {
    // A fused or bridged ring has no radical name here — and walking into one
    // would recurse forever, each ring naming the other as its substituent.
    throw new UnnameableBranchError(
      ringIds,
      'Anel substituinte fundido ou fora da tabela que eu conheço.'
    );
  }

  // --- numbering -------------------------------------------------------------
  // Carbocycle: the attachment atom is position 1 by definition. Heterocycle:
  // the heteroatom is position 1 and the attachment gets a real locant, which
  // is precisely the information that used to be missing.
  const heteroPositions = ringIds
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => graph.atoms.get(id)?.element !== 'C')
    .map(({ index }) => index);
  const starts = retained ? heteroPositions : [ringIds.indexOf(rootId)];

  let best: { numbering: Map<string, number>; attach: number; subLocants: number[] } | null = null;
  for (const start of starts) {
    for (const step of [1, -1]) {
      const order: string[] = [];
      for (let i = 0; i < n; i++) order.push(ringIds[(start + step * i + n * n) % n]);
      const numbering = new Map<string, number>();
      order.forEach((id, idx) => numbering.set(id, idx + 1));

      const subLocants: number[] = [];
      for (const id of order) {
        for (const nb of graph.getNeighbors(id)) {
          if (nb.neighborId === attachedTo || ringSet.has(nb.neighborId)) continue;
          if (graph.atoms.get(nb.neighborId)?.element === 'H') continue;
          subLocants.push(numbering.get(id)!);
        }
      }
      subLocants.sort((a, b) => a - b);
      const attach = numbering.get(rootId)!;

      const better =
        !best ||
        attach < best.attach ||
        (attach === best.attach && compareLocantArrays(subLocants, best.subLocants) < 0);
      if (better) best = { numbering, attach, subLocants };
    }
  }
  if (!best) return null;

  // --- substituents carried by the ring --------------------------------------
  const innerSubs: ClassifiedSubstituent[] = [];
  for (const id of ringIds) {
    for (const nb of graph.getNeighbors(id)) {
      if (nb.neighborId === attachedTo || ringSet.has(nb.neighborId)) continue;
      if (graph.atoms.get(nb.neighborId)?.element === 'H') continue;
      const sub = nameBranch(graph, nb.neighborId, id, rings, depth + 1);
      if (sub) innerSubs.push({ ...sub, locant: best.numbering.get(id)! });
    }
  }

  // --- assembly --------------------------------------------------------------
  let core: string;
  if (retained) {
    core = `${retained.replace(/[aeiou]$/, '')}-${best.attach}-il`;
  } else if (hostRing.isBenzene) {
    core = 'fenil';
  } else {
    core = `${joinWithNovoAcordo('ciclo', STEM_NAMES[n]!)}il`;
  }

  const prefix = formatGroupedSubstituents(innerSubs);
  const inner = prefix ? joinWithNovoAcordo(prefix, core) : core;
  // Enclosing marks whenever the radical name carries locants of its own, so
  // they can never be read as the parent's.
  const needsBrackets = /\d/.test(inner);
  return {
    locant: 0,
    name: needsBrackets ? `(${inner})` : inner,
    sortKey: inner,
    isComplex: needsBrackets,
  };
}

function nameBranch(
  graph: MolecularGraph,
  rootId: string,
  attachedTo: string,
  rings: Ring[],
  depth = 0
): ClassifiedSubstituent | null {
  const rootAtom = graph.atoms.get(rootId);
  if (!rootAtom) return null;

  // --- Heteroatom-rooted branches (permanent prefixes) ---
  if (HALOGEN_PREFIX[rootAtom.element]) {
    const p = HALOGEN_PREFIX[rootAtom.element];
    return { locant: 0, name: p, sortKey: p, isComplex: false };
  }

  if (rootAtom.element === 'O') {
    const bond = graph.getBondBetween(attachedTo, rootId);
    if (bond?.order === 2) {
      return { locant: 0, name: 'oxo', sortKey: 'oxo', isComplex: false };
    }
    const others = graph.getNeighbors(rootId).filter(n => n.neighborId !== attachedTo);
    const heavy = others.filter(n => graph.atoms.get(n.neighborId)?.element !== 'H');
    if (heavy.length === 0) {
      return { locant: 0, name: 'hidroxi', sortKey: 'hidroxi', isComplex: false };
    }
    // Acyloxy: -O-CO-R is "acetoxi" / "…anoiloxi". Falling through to the
    // alkoxy rule below described aspirin's acetyl group as "1-oxoetoxi" —
    // structurally right, but not a name any exam accepts.
    const rIdCandidate = heavy[0].neighborId;
    const acylCarbonyl = graph
      .getNeighbors(rIdCandidate)
      .find(n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O');
    if (acylCarbonyl && graph.atoms.get(rIdCandidate)?.element === 'C') {
      const acylCarbons = getSubtreeAtoms(graph, rIdCandidate, rootId).filter(
        id => graph.atoms.get(id)?.element === 'C'
      );
      const acylAtoms = getSubtreeAtoms(graph, rIdCandidate, rootId);
      const unbranchedSaturated =
        acylCarbons.every(
          id =>
            graph.getNeighbors(id).filter(n => graph.atoms.get(n.neighborId)?.element === 'C')
              .length <= 2
        ) &&
        acylAtoms.every(
          id =>
            graph.atoms.get(id)?.element === 'C' || id === acylCarbonyl.neighborId
        );
      const acylStem = STEM_NAMES[acylCarbons.length];
      if (unbranchedSaturated && acylStem) {
        const label = acylCarbons.length === 2 ? 'acetoxi' : `${acylStem}anoiloxi`;
        return { locant: 0, name: label, sortKey: label, isComplex: false };
      }
    }

    // Alkoxy / aryloxy: -O-R
    const rId = heavy[0].neighborId;
    const rAtom = graph.atoms.get(rId);
    if (rAtom?.aromatic) {
      return { locant: 0, name: 'fenoxi', sortKey: 'fenoxi', isComplex: false };
    }
    const rBranch = nameBranch(graph, rId, rootId, rings, depth + 1);
    const rName = (rBranch?.sortKey ?? 'metil').replace(/^\(|\)$/g, '');
    // Saturated chain radicals contract their "-il" into "-oxi" even when
    // substituted (2-cloroetil -> 2-cloroetoxi). Aryl radicals keep it
    // (benzil -> benziloxi), and so do unsaturated ones: contracting "etenil"
    // gave "etenoxi", a group that does not exist — it is "(etenil)oxi".
    const NEVER_CONTRACT = new Set(['benzil', 'fenil']);
    const isUnsaturatedRadical = /(en|in)il$/.test(rName);
    const alkoxi =
      rName.endsWith('il') && !NEVER_CONTRACT.has(rName) && !isUnsaturatedRadical
        ? `${rName.slice(0, -2)}oxi`
        : `${rName}oxi`;
    // A composite radical must stay bracketed, or its locants read as the
    // parent's: "2-(2-cloroetoxi)etano", never "2-2-cloroetoxietano".
    const isComplex = rBranch?.isComplex ?? false;
    return {
      locant: 0,
      name: isComplex ? `(${alkoxi})` : alkoxi,
      sortKey: alkoxi,
      isComplex,
    };
  }

  if (rootAtom.element === 'N') {
    const nNeighbors = graph.getNeighbors(rootId);
    const oCount = nNeighbors.filter(n => graph.atoms.get(n.neighborId)?.element === 'O').length;
    if (oCount >= 2) {
      return { locant: 0, name: 'nitro', sortKey: 'nitro', isComplex: false };
    }
    const carbons = nNeighbors.filter(
      n => n.neighborId !== attachedTo && graph.atoms.get(n.neighborId)?.element === 'C'
    );
    if (carbons.length === 0) {
      return { locant: 0, name: 'amino', sortKey: 'amino', isComplex: false };
    }

    // Acylated nitrogen: -NH-CO-R is "R-amido", never "R-ilamino". Naming it as
    // a plain alkylamino group moved the carbonyl oxygen out of the molecule.
    const acyl = carbons.find(
      c =>
        graph
          .getNeighbors(c.neighborId)
          .some(n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O')
    );
    if (acyl) {
      const acylCarbons = getSubtreeAtoms(graph, acyl.neighborId, rootId).filter(
        id => graph.atoms.get(id)?.element === 'C'
      );
      const stem = STEM_NAMES[acylCarbons.length];
      const acylAtoms = getSubtreeAtoms(graph, acyl.neighborId, rootId);
      const carbonylOxygens = graph
        .getNeighbors(acyl.neighborId)
        .filter(n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O')
        .map(n => n.neighborId);
      // Unbranched, and carrying nothing but its own carbonyl oxygen: a
      // hydroxyl further down the acyl chain was being dropped silently.
      const simple =
        acylCarbons.every(
          id =>
            graph.getNeighbors(id).filter(n => graph.atoms.get(n.neighborId)?.element === 'C')
              .length <= 2
        ) &&
        acylAtoms.every(
          id => graph.atoms.get(id)?.element === 'C' || carbonylOxygens.includes(id)
        ) &&
        acylCarbons.every(id =>
          graph
            .getNeighbors(id)
            .every(n => n.order === 1 || carbonylOxygens.includes(n.neighborId))
        );
      if (stem && simple) {
        const label = `${stem}anamido`;
        return { locant: 0, name: `(${label})`, sortKey: label, isComplex: true };
      }
      throw new UnnameableBranchError(
        [rootId, acyl.neighborId],
        'Grupo acilamino ramificado fora do que eu sei nomear.'
      );
    }
    const parts = carbons
      .map(c => nameBranch(graph, c.neighborId, rootId, rings, depth + 1)?.sortKey ?? 'metil')
      .sort();
    const inner = parts.length === 2 && parts[0] === parts[1] ? `di${parts[0]}` : parts.join('');
    return { locant: 0, name: `(${inner}amino)`, sortKey: `${inner}amino`, isComplex: true };
  }

  if (rootAtom.element !== 'C') return null;

  // --- Carbon-rooted branches ---
  const branchAtoms = getSubtreeAtoms(graph, rootId, attachedTo);
  const branchSet = new Set(branchAtoms);
  const branchCarbons = branchAtoms.filter(id => graph.atoms.get(id)?.element === 'C');
  const hasMultipleBond = branchAtoms.some(id =>
    graph.getNeighbors(id).some(n => branchSet.has(n.neighborId) && n.order > 1)
  );

  // Ring branch — carbocyclic or heterocyclic, aromatic or not. This test must
  // come before anything that assumes an aromatic ring is benzene.
  if (rootAtom.inRing) {
    const asRing = nameRingRadical(graph, rootId, attachedTo, rings, depth);
    if (asRing) return asRing;
  }

  // Benzyl: a CH2 bridging the parent to an otherwise bare benzene ring.
  // The ring has to be *inside* the branch. Testing only "a neighbour of the
  // root is in a benzene ring" also matched a branch hanging off a benzene
  // parent, and a styryl group on benzene answered to "benzilbenzeno".
  const benzylRing = rings.find(
    r =>
      r.isBenzene &&
      !r.atomIds.includes(attachedTo) &&
      r.atomIds.every(id => branchSet.has(id)) &&
      graph.getNeighbors(rootId).some(n => r.atomIds.includes(n.neighborId))
  );
  if (
    benzylRing &&
    branchCarbons.length === 7 &&
    !rootAtom.inRing &&
    !hasMultipleBond &&
    graph.getNeighbors(rootId).filter(n => n.neighborId !== attachedTo).length === 1
  ) {
    return { locant: 0, name: 'benzil', sortKey: 'benzil', isComplex: false };
  }

  // Functionalised carbon branches cited as prefixes (P-66)
  const carbonylO = graph
    .getNeighbors(rootId)
    .find(n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O');
  if (carbonylO) {
    const singleO = graph
      .getNeighbors(rootId)
      .find(
        n =>
          n.order === 1 &&
          n.neighborId !== attachedTo &&
          graph.atoms.get(n.neighborId)?.element === 'O'
      );
    if (singleO) {
      const oNeighbors = graph
        .getNeighbors(singleO.neighborId)
        .filter(n => n.neighborId !== rootId && graph.atoms.get(n.neighborId)?.element !== 'H');
      if (oNeighbors.length === 0) {
        return { locant: 0, name: 'carboxi', sortKey: 'carboxi', isComplex: false };
      }
    }
    const amideN = graph
      .getNeighbors(rootId)
      .find(n => n.order === 1 && graph.atoms.get(n.neighborId)?.element === 'N');
    // "carbamoil" is H2N-CO- exactly. Any other acyl group on that nitrogen
    // makes a different prefix, and answering "carbamoil" for all of them
    // renamed a propanoylamino branch after urea.
    if (amideN && branchCarbons.length === 1) {
      const nHasOtherCarbon = graph
        .getNeighbors(amideN.neighborId)
        .some(n => n.neighborId !== rootId && graph.atoms.get(n.neighborId)?.element === 'C');
      if (!nHasOtherCarbon) {
        return { locant: 0, name: 'carbamoil', sortKey: 'carbamoil', isComplex: false };
      }
    }
    // An acyl halide branch is "clorocarbonil", not "formil": naming it after
    // the aldehyde threw the halogen away entirely.
    const acylHalide = graph
      .getNeighbors(rootId)
      .find(n => ['F', 'Cl', 'Br', 'I'].includes(graph.atoms.get(n.neighborId)?.element ?? ''));
    if (acylHalide) {
      const halogen = graph.atoms.get(acylHalide.neighborId)!.element;
      const prefix =
        halogen === 'F' ? 'fluor' : halogen === 'Br' ? 'bromo' : halogen === 'I' ? 'iodo' : 'cloro';
      const label = `${prefix}carbonil`;
      return { locant: 0, name: `(${label})`, sortKey: label, isComplex: true };
    }
    if (branchCarbons.length === 1) {
      return { locant: 0, name: 'formil', sortKey: 'formil', isComplex: false };
    }
  }
  const nitrileN = graph
    .getNeighbors(rootId)
    .find(n => n.order === 3 && graph.atoms.get(n.neighborId)?.element === 'N');
  if (nitrileN && branchCarbons.length === 1) {
    return { locant: 0, name: 'ciano', sortKey: 'ciano', isComplex: false };
  }

  const heteroAtoms = branchAtoms.filter(id => {
    const el = graph.atoms.get(id)?.element;
    return el !== undefined && el !== 'C' && el !== 'H';
  });

  // Plain saturated alkyl → retained/systematic simple name. A branch that
  // reaches into a ring is never "simple": walking its carbons as a chain
  // turned cyclohexylmethyl into "heptil".
  const branchTouchesRing = branchAtoms.some(id => graph.atoms.get(id)?.inRing);
  if (heteroAtoms.length === 0 && !hasMultipleBond && !branchTouchesRing) {
    const simple = nameSimpleAlkyl(graph, rootId, attachedTo, branchCarbons);
    if (simple) {
      return { locant: 0, name: simple, sortKey: simple, isComplex: false };
    }
  }

  // Complex radical: number the branch from its attachment point (locant 1)
  if (depth > 4) {
    return { locant: 0, name: 'alquil', sortKey: 'alquil', isComplex: false };
  }

  // The radical's own chain stops at the ring boundary; ring atoms are picked up
  // below as sub-substituents and named by nameRingRadical. A nitrile carbon is
  // excluded for the same reason it is excluded from the parent chain: it
  // belongs to the "ciano" prefix, and running the chain through it made the
  // nitrogen come out as an amine.
  const isNitrileCarbon = (id: string) =>
    graph.atoms.get(id)?.element === 'C' &&
    graph.getNeighbors(id).some(n => n.order === 3 && graph.atoms.get(n.neighborId)?.element === 'N');
  const carbonSet = new Set(
    branchCarbons.filter(id => !graph.atoms.get(id)?.inRing && !isNitrileCarbon(id))
  );
  const chain = longestBranchChain(graph, rootId, attachedTo, carbonSet);
  const chainSet = new Set(chain);
  const innerSubs: ClassifiedSubstituent[] = [];

  chain.forEach((cId, idx) => {
    for (const n of graph.getNeighbors(cId)) {
      if (n.neighborId === attachedTo || chainSet.has(n.neighborId)) continue;
      const sub = nameBranch(graph, n.neighborId, cId, rings, depth + 1);
      if (!sub) continue;
      // A radical's own branches can also be doubly bonded to it; without this
      // the "=CH2" of an isopropenyl group vanished from the name.
      const asYlidene = toYlidene(graph, sub, n, idx + 1);
      innerSubs.push(asYlidene ?? { ...sub, locant: idx + 1 });
    }
  });

  const eneLocants: number[] = [];
  const yneLocants: number[] = [];
  for (let i = 0; i < chain.length - 1; i++) {
    const bond = graph.getBondBetween(chain[i], chain[i + 1]);
    if (bond?.order === 2) eneLocants.push(i + 1);
    if (bond?.order === 3) yneLocants.push(i + 1);
  }

  const stem = STEM_NAMES[chain.length];
  if (!stem) {
    // Same rule as the parent hydride: no invented stems ("alquil") for a
    // radical longer than the table.
    throw new UnnameableBranchError(
      chain,
      `Radical de ${chain.length} carbonos está fora da tabela de prefixos que eu conheço.`
    );
  }
  let core: string;
  if (eneLocants.length > 0 || yneLocants.length > 0) {
    // Both may be present; the old "else if" dropped the triple bond of a
    // radical that had a double one, silently changing the molecule.
    const withLocants = chain.length > 2;
    let infix = '';
    if (eneLocants.length > 0) {
      if (eneLocants.length > 1) infix += 'a';
      if (withLocants) infix += `-${eneLocants.join(',')}-`;
      infix += `${MULTIPLIERS[eneLocants.length] ?? ''}en`;
    }
    if (yneLocants.length > 0) {
      if (eneLocants.length === 0 && yneLocants.length > 1) infix += 'a';
      if (withLocants) infix += `-${yneLocants.join(',')}-`;
      infix += `${MULTIPLIERS[yneLocants.length] ?? ''}in`;
    }
    core = `${stem}${infix}il`;
  } else {
    core = `${ALKYL_NAMES[chain.length] ?? `${stem}il`}`;
  }

  const omitInnerLocants = chain.length === 1 && innerSubs.length <= 1;
  const innerPrefix = formatGroupedSubstituents(innerSubs, omitInnerLocants);
  const inner = innerPrefix ? joinWithNovoAcordo(innerPrefix, core) : core;

  return { locant: 0, name: `(${inner})`, sortKey: inner, isComplex: true };
}


/**
 * Rewrites a substituent as an ylidene / ylidyne when it hangs off its parent by
 * a double or triple bond.
 *
 * Emitting the plain "-il" name threw that bond away: "CCC=C(CCCC)CCCC" came out
 * as 5-propilnonano, an alkane, because the bond joins the chain to a branch
 * instead of running along it and nothing else in the pipeline looks at it.
 * Returns null when the attachment is a single bond or the branch is not carbon.
 */
function toYlidene(
  graph: MolecularGraph,
  named: ClassifiedSubstituent,
  edge: NeighborEdge,
  locant: number
): ClassifiedSubstituent | null {
  if (edge.order < 2) return null;
  if (graph.atoms.get(edge.neighborId)?.element !== 'C') return null;

  const suffix = edge.order === 2 ? 'ideno' : 'idino';
  // sortKey is the radical name without enclosing marks by construction;
  // stripping brackets here mangled "(pirrol-2-il)metil" into an unbalanced
  // "pirrol-2-il)metil".
  const bare = named.sortKey;
  const stem = bare.endsWith('il') ? bare : `${bare}il`;
  const ylidene = `${stem}${suffix}`;
  const needsBrackets = named.isComplex || /[\d-]/.test(ylidene) || stem !== named.sortKey;
  return {
    locant,
    name: needsBrackets ? `(${ylidene})` : ylidene,
    sortKey: ylidene,
    isComplex: needsBrackets,
  };
}

export function identifySubstituents(
  graph: MolecularGraph,
  parent: ParentStructure,
  numbering: Map<string, number>,
  primaryFunction: OrganicFunction,
  consumedAtoms: ReadonlySet<string> = new Set(),
  rings: Ring[] = []
): ClassifiedSubstituent[] {
  const parentAtomSet = new Set(parent.atomIds);
  const substituents: ClassifiedSubstituent[] = [];

  for (const parentId of parent.atomIds) {
    const locant = numbering.get(parentId) ?? 1;

    for (const edge of graph.getNeighbors(parentId)) {
      const subId = edge.neighborId;
      if (parentAtomSet.has(subId)) continue;
      if (consumedAtoms.has(subId)) continue;
      if (parent.exocyclicCarbonId === subId) continue;
      const subAtom = graph.atoms.get(subId);
      if (!subAtom || subAtom.element === 'H') continue;

      const named = nameBranch(graph, subId, parentId, rings);
      if (!named) continue;

      const asYlidene = toYlidene(graph, named, edge, locant);
      substituents.push(asYlidene ?? { ...named, locant });
    }
  }

  // Suppress the primary function's own prefix duplication for permanent-prefix
  // functions is unnecessary: halides/nitro/ethers are *meant* to appear here.
  void primaryFunction;

  return substituents;
}

// ============================================================================
// 8. Canonical IUPAC pt-BR Assembler (2013 & 1993)
// ============================================================================

const MULTIPLIERS = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa'];
/** Multiplying prefixes used before composite (parenthesised) radical names. */
const COMPLEX_MULTIPLIERS = ['', '', 'bis', 'tris', 'tetraquis', 'pentaquis', 'hexaquis'];

function formatGroupedSubstituents(
  subs: ClassifiedSubstituent[],
  omitLocants = false
): string {
  if (subs.length === 0) return '';

  const groups = new Map<string, { locants: string[]; sortKey: string; isComplex: boolean }>();
  for (const s of subs) {
    if (!groups.has(s.name)) {
      groups.set(s.name, { locants: [], sortKey: s.sortKey, isComplex: s.isComplex });
    }
    groups.get(s.name)!.locants.push(s.locantLabel ?? String(s.locant));
  }

  // Alphanumerical ordering ignores multiplying prefixes and italics (P-14.5.2).
  const sortedNames = Array.from(groups.keys()).sort((a, b) =>
    alphabetisationKey(groups.get(a)!.sortKey).localeCompare(
      alphabetisationKey(groups.get(b)!.sortKey),
      'pt-BR'
    )
  );

  // Italic locants are cited before numerals within a group: N,2-dimetil…
  const locantRank = (l: string) => (/^\d+$/.test(l) ? Number(l) : -1);

  const parts: string[] = [];
  for (const name of sortedNames) {
    const grp = groups.get(name)!;
    grp.locants.sort((a, b) => locantRank(a) - locantRank(b));
    const count = grp.locants.length;
    const table = grp.isComplex ? COMPLEX_MULTIPLIERS : MULTIPLIERS;
    const mult = count > 1 ? table[count] ?? `${count}x-` : '';
    const locStr = omitLocants ? '' : `${grp.locants.join(',')}-`;
    parts.push(`${locStr}${mult}${name}`);
  }

  return parts.join('-');
}

function joinWithNovoAcordo(prefix: string, stem: string): string {
  if (!prefix) return stem;
  if (/[)\d]$/.test(prefix)) {
    // Never glue a locant or a closing parenthesis straight onto the stem.
    if (/^\d/.test(stem)) return `${prefix}-${stem}`;
  }
  if (stem.startsWith('h') || stem.startsWith('H')) {
    return `${prefix}-${stem}`;
  }
  const last = prefix.slice(-1).toLowerCase();
  const first = stem.charAt(0).toLowerCase();
  if ('aeiou'.includes(last) && last === first) {
    return `${prefix}-${stem}`;
  }
  return `${prefix}${stem}`;
}

/** Suffix morpheme for each suffix-expressed function. */
const FUNCTION_SUFFIX: Partial<Record<OrganicFunction, string>> = {
  alcool: 'ol',
  enol: 'ol',
  fenol: 'ol',
  aldeido: 'al',
  cetona: 'ona',
  acido_carboxilico: 'oico',
  ester: 'oato',
  haleto_acila: 'oíla',
  amida: 'amida',
  amina: 'amina',
  nitrila: 'onitrila',
};

/** Suffix morpheme used when the group occurs more than once (di-, tri-, ...). */
const FUNCTION_SUFFIX_PLURAL: Partial<Record<OrganicFunction, string>> = {
  nitrila: 'nitrila',
};

interface AssemblyInput {
  graph: MolecularGraph;
  parent: ParentStructure;
  numbering: Map<string, number>;
  prefixStr: string;
  /** Number of locant-bearing features, used by the locant-omission rule. */
  substituentCount: number;
  suffix?: { base: string; pluralBase?: string; locants: number[]; fn: OrganicFunction };
  /** Forces the alkane 'o' ending (hydrocarbons, halides, nitro, ethers). */
  plainEnding?: boolean;
}

/**
 * Builds the parent hydride name plus unsaturation infixes and the functional
 * suffix, in both the 2013 (locants next to the affected morpheme) and the
 * 1993/classic Brazilian school style (locants pushed to the front).
 */
function assembleParent(input: AssemblyInput): { name2013: string; name1993: string } {
  const { graph, parent, numbering, prefixStr, suffix } = input;
  const carbonCount = parent.atomIds.length;
  const isRing = parent.type === 'ring';
  const ringIsAromatic =
    isRing && parent.atomIds.every(id => graph.atoms.get(id)?.aromatic === true);
  const heterocycleName = isRing
    ? identifyHeterocycle(graph, parent.atomIds, ringIsAromatic)
    : null;
  // A retained heterocycle name (piridina, morfolina, ...) is already a complete
  // parent hydride: it takes no "ciclo" prefix and no "an" saturation infix.
  const isAromatic =
    heterocycleName !== null ||
    (isRing && (parent.ringType === 'benzeno' || parent.ringType === 'naftaleno'));

  // --- Unsaturation locants along the parent skeleton ---
  const eneLocants: number[] = [];
  const yneLocants: number[] = [];
  const limit = isRing ? carbonCount : carbonCount - 1;
  for (let i = 0; i < limit; i++) {
    const u = parent.atomIds[i];
    const v = parent.atomIds[(i + 1) % carbonCount];
    const bond = graph.getBondBetween(u, v);
    if (!bond || bond.order === 1 || bond.aromatic) continue;
    const lu = numbering.get(u);
    const lv = numbering.get(v);
    if (lu === undefined || lv === undefined) continue;
    // The locant of a multiple bond is the lower of its two atoms, except for the
    // ring-closing bond where it is the higher one wrapping back to 1.
    const loc =
      Math.abs(lu - lv) === 1 ? Math.min(lu, lv) : Math.max(lu, lv);
    if (bond.order === 2) eneLocants.push(loc);
    else yneLocants.push(loc);
  }
  eneLocants.sort((a, b) => a - b);
  yneLocants.sort((a, b) => a - b);

  const suffixLocants = suffix ? [...suffix.locants].sort((a, b) => a - b) : [];
  const featureCount =
    input.substituentCount + suffixLocants.length + eneLocants.length + yneLocants.length;

  // Rule: with a single locant-bearing feature on a skeleton whose positions are
  // all equivalent (any ring, or a chain of at most two carbons), every locant is
  // redundant and therefore omitted — metilciclopentano, clorometano, etanol.
  // Every position of benzene or cyclohexane is equivalent, so a lone
  // substituent needs no locant. A heterocycle is different: the heteroatom
  // fixes the numbering, so piperidin-3-ol and piperidin-4-ol are distinct.
  const isFusedRing = parent.ringType === 'naftaleno' || (parent.fusionAtomIds?.length ?? 0) > 0;
  const allPositionsEquivalent =
    (isRing && !heterocycleName && !isFusedRing && !parent.exocyclicCarbonId) ||
    carbonCount <= 2;
  const omitAllLocants =
    carbonCount <= 1 || (featureCount <= 1 && allPositionsEquivalent);

  let writeSuffixLocants = false;
  if (suffix && suffixLocants.length > 0 && !omitAllLocants) {
    if (TERMINAL_SUFFIX_FUNCTIONS.has(suffix.fn)) {
      writeSuffixLocants = false;
    } else if (isRing) {
      writeSuffixLocants = !allPositionsEquivalent || featureCount > 1;
    } else if (suffix.fn === 'cetona') {
      writeSuffixLocants = carbonCount > 3 || suffixLocants.length > 1;
    } else {
      writeSuffixLocants = carbonCount > 2 || suffixLocants.length > 1;
    }
  }

  const writeUnsatLocants =
    !omitAllLocants && !(carbonCount <= 3 && !writeSuffixLocants && !isRing);

  // --- Parent hydride core ---
  let core: string;
  if (heterocycleName) core = heterocycleName;
  else if (parent.ringType === 'benzeno') core = 'benzen';
  else if (parent.ringType === 'naftaleno') core = 'naftalen';
  else if (isRing || parent.type === 'chain') {
    const stem = STEM_NAMES[carbonCount];
    if (!stem) {
      // The old fallback spelled the non-word "carbano" for anything past the
      // table. A missing name is honest; an invented one is not.
      throw new UnnameableBranchError(
        parent.atomIds,
        `Esqueleto de ${carbonCount} átomos está fora da tabela de prefixos que eu conheço.`
      );
    }
    core = isRing ? joinWithNovoAcordo('ciclo', stem) : stem;
  } else core = STEM_NAMES[carbonCount] ?? '';

  const suffixCount = Math.max(1, suffixLocants.length);
  const suffixBase =
    (suffixCount > 1 ? suffix?.pluralBase ?? suffix?.base : suffix?.base) ?? 'o';
  const suffixMult = suffixCount > 1 ? MULTIPLIERS[suffixCount] ?? '' : '';

  const buildInfix = (withLocants: boolean): string => {
    if (isAromatic) return '';
    if (eneLocants.length === 0 && yneLocants.length === 0) return 'an';

    let out = '';
    if (eneLocants.length > 0) {
      if (eneLocants.length > 1) out += 'a';
      if (withLocants) out += `-${eneLocants.join(',')}-`;
      out += `${MULTIPLIERS[eneLocants.length] ?? ''}en`;
    }
    if (yneLocants.length > 0) {
      if (eneLocants.length === 0 && yneLocants.length > 1) out += 'a';
      if (withLocants) out += `-${yneLocants.join(',')}-`;
      out += `${MULTIPLIERS[yneLocants.length] ?? ''}in`;
    }
    return out;
  };

  // --- 2013 style ---
  if (heterocycleName && suffix && /[aeiou]$/.test(core) && /^[aeiou]/.test(suffixBase)) {
    // piperidina + ol -> piperidin-4-ol (never "piperidinaol")
    core = core.slice(0, -1);
  }

  // "piridin" + "o" + "diamina" produced "piridinodiamina"; the retained name
  // keeps its own ending and takes the locants directly: piridina-2,5-diamina.
  if (heterocycleName && suffixCount > 1) {
    const body = `${heterocycleName}-${suffixLocants.join(',')}-${suffixMult}${suffixBase}`;
    const full = joinWithNovoAcordo(prefixStr, body);
    return { name2013: full, name1993: full };
  }

  let base2013 = core + buildInfix(writeUnsatLocants);
  if (heterocycleName && !suffix) {
    // "piridina" / "oxano" are finished words — never append the alkane 'o'.
    return {
      name2013: joinWithNovoAcordo(prefixStr, core),
      name1993: joinWithNovoAcordo(prefixStr, core),
    };
  }
  if (suffixCount > 1) base2013 += 'o';
  if (writeSuffixLocants) base2013 += `-${suffixLocants.join(',')}-`;
  base2013 += suffixMult + suffixBase;
  const name2013 = joinWithNovoAcordo(prefixStr, base2013);

  // --- 1993 / classic Brazilian style: all locants up front ---
  let base1993 = core + buildInfix(false);
  if (suffixCount > 1) base1993 += 'o';
  base1993 += suffixMult + suffixBase;

  const frontLocants: number[] = [];
  if (writeUnsatLocants) frontLocants.push(...eneLocants, ...yneLocants);
  if (writeSuffixLocants) frontLocants.push(...suffixLocants);
  frontLocants.sort((a, b) => a - b);

  let name1993: string;
  if (frontLocants.length === 0) {
    name1993 = joinWithNovoAcordo(prefixStr, base1993);
  } else {
    const locPart = `${frontLocants.join(',')}-`;
    name1993 = prefixStr ? `${prefixStr}-${locPart}${base1993}` : `${locPart}${base1993}`;
  }

  return { name2013, name1993 };
}


/**
 * Names an anhydride from both of its acyl halves.
 *
 * Acyclic: "anidrido etanoico" when symmetric, "anidrido etanoico e metanoico"
 * when mixed. Cyclic: the parent is the carbon chain bridging the two carbonyls
 * ("anidrido butanodioico" for succinic), or the aromatic ring they hang off
 * ("anidrido benzeno-1,2-dicarboxílico" for phthalic).
 */
function assembleAnhydrideName(
  graph: MolecularGraph,
  detectedFunctions: DetectedFunction[],
  rings: Ring[]
): string | null {
  const groups = detectedFunctions.filter(d => d.type === 'anidrido');
  if (groups.length < 2) return null;

  const acylCarbons = [...new Set(groups.map(g => g.carbonId))];
  if (acylCarbons.length !== 2) return null;

  // The bridging oxygen is the single-bonded O shared by both acyl carbons.
  const bridge = graph
    .getNeighbors(acylCarbons[0])
    .find(
      edge =>
        edge.order === 1 &&
        graph.atoms.get(edge.neighborId)?.element === 'O' &&
        graph.getNeighbors(edge.neighborId).some(n => n.neighborId === acylCarbons[1])
    );
  if (!bridge) return null;
  const bridgeId = bridge.neighborId;

  /**
   * Longest acyclic carbon chain from an acyl carbon. Ring atoms are excluded so
   * the walk cannot wander into a benzene ring and report benzoic anhydride as
   * a seven-carbon "heptanoico".
   */
  const countMultipleBonds = (path: string[]): number => {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const bond = graph.getBondBetween(path[i], path[i + 1]);
      if (bond && bond.order > 1 && !bond.aromatic) total++;
    }
    return total;
  };

  const acylChain = (
    start: string,
    forbidden: Set<string>,
    { allowRingAtoms = false }: { allowRingAtoms?: boolean } = {}
  ): string[] => {
    let best: string[] = [start];
    const walk = (id: string, path: string[], seen: Set<string>) => {
      // Longest chain wins; on a tie the one carrying more multiple bonds does,
      // so methacrylic anhydride's two identical halves get identical names.
      if (
        path.length > best.length ||
        (path.length === best.length && countMultipleBonds(path) > countMultipleBonds(best))
      ) {
        best = [...path];
      }
      for (const edge of graph.getNeighbors(id)) {
        if (forbidden.has(edge.neighborId) || seen.has(edge.neighborId)) continue;
        const atom = graph.atoms.get(edge.neighborId);
        if (atom?.element !== 'C') continue;
        if (!allowRingAtoms && atom.inRing) continue;
        seen.add(edge.neighborId);
        path.push(edge.neighborId);
        walk(edge.neighborId, path, seen);
        path.pop();
        seen.delete(edge.neighborId);
      }
    };
    walk(start, [start], new Set([start]));
    return best;
  };

  const unsaturationSuffix = (path: string[]): string => {
    const enes: number[] = [];
    const ynes: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const bond = graph.getBondBetween(path[i], path[i + 1]);
      if (!bond || bond.aromatic) continue;
      if (bond.order === 2) enes.push(i + 1);
      if (bond.order === 3) ynes.push(i + 1);
    }
    if (enes.length === 0 && ynes.length === 0) return 'an';
    const parts: string[] = [];
    if (enes.length > 0) parts.push(`-${enes.join(',')}-${MULTIPLIERS[enes.length] ?? ''}en`);
    if (ynes.length > 0) parts.push(`-${ynes.join(',')}-${MULTIPLIERS[ynes.length] ?? ''}in`);
    return parts.join('');
  };

  /** Atoms of the anhydride linkage itself, never cited as substituents. */
  const linkage = new Set<string>([bridgeId]);
  for (const carbon of acylCarbons) {
    for (const edge of graph.getNeighbors(carbon)) {
      if (edge.order === 2 && graph.atoms.get(edge.neighborId)?.element === 'O') {
        linkage.add(edge.neighborId);
      }
    }
  }

  /**
   * Names one acyl half, substituents included. Reuses the ordinary substituent
   * machinery so "2-cloroetanoico" and "2-metilpropanoico" come out right
   * instead of losing their branches.
   */
  const nameAcylHalf = (carbon: string): string | null => {
    const aromaticRing = rings.find(
      r => r.isAromatic && graph.getNeighbors(carbon).some(n => r.atomIds.includes(n.neighborId))
    );

    if (aromaticRing && !aromaticRing.isNaphthalene) {
      const parent: ParentStructure = {
        type: 'ring',
        atomIds: aromaticRing.atomIds,
        ringType: 'benzeno',
        exocyclicCarbonId: carbon,
      };
      const numbering = numberParentStructure(graph, parent, 'acido_carboxilico', []);
      const subs = identifySubstituents(
        graph,
        parent,
        numbering,
        'acido_carboxilico',
        new Set([...linkage, carbon]),
        rings
      );
      return joinWithNovoAcordo(formatGroupedSubstituents(subs, subs.length === 0), 'benzoico');
    }

    const chain = acylChain(carbon, new Set([bridgeId]));
    const stem = STEM_NAMES[chain.length];
    if (!stem) return null;

    const parent: ParentStructure = { type: 'chain', atomIds: chain };
    const numbering = new Map(chain.map((id, index) => [id, index + 1]));
    const subs = identifySubstituents(
      graph,
      parent,
      numbering,
      'acido_carboxilico',
      linkage,
      rings
    );
    return joinWithNovoAcordo(
      formatGroupedSubstituents(subs, chain.length <= 1),
      `${stem}${unsaturationSuffix(chain)}oico`
    );
  };

  const cyclic = graph.atoms.get(bridgeId)?.inRing === true;

  if (cyclic) {
    // Phthalic-type: both carbonyls hang off one aromatic ring.
    const hostRing = rings.find(
      r =>
        r.isAromatic &&
        acylCarbons.every(carbon =>
          graph.getNeighbors(carbon).some(n => r.atomIds.includes(n.neighborId))
        )
    );
    if (hostRing) {
      const ringName = hostRing.isNaphthalene ? 'naftaleno' : 'benzeno';
      return `anidrido ${ringName}-1,2-dicarboxílico`;
    }

    // Succinic-type: the two carbonyls are joined by a carbon chain that runs
    // through the anhydride ring itself.
    const chain = acylChain(acylCarbons[0], new Set([bridgeId]), { allowRingAtoms: true });
    if (chain[chain.length - 1] !== acylCarbons[1]) return null;
    const stem = STEM_NAMES[chain.length];
    if (!stem) return null;
    const infix = unsaturationSuffix(chain);
    return `anidrido ${stem}${infix === 'an' ? 'ano' : infix + 'o'}dioico`;
  }

  const halves = acylCarbons.map(nameAcylHalf);
  if (halves.some(half => half === null)) return null;

  if (halves[0] === halves[1]) return `anidrido ${halves[0]}`;
  return `anidrido ${[...(halves as string[])]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .join(' e ')}`;
}

/**
 * Public entry point: builds the name, then stamps the E/Z descriptor on it.
 *
 * The stamping lives here, not in the analysis pipeline, because there are two
 * callers — `analyzeMolecularGraph` and the older `GraphNamer` — and putting it
 * in only one of them meant `nameMolecularGraph` still gave geranial and neral
 * the same name.
 */
export function assembleIupacNames(
  graph: MolecularGraph,
  parent: ParentStructure,
  numbering: Map<string, number>,
  substituents: ClassifiedSubstituent[],
  primaryFunction: OrganicFunction,
  detectedFunctions: DetectedFunction[],
  suffixOccurrences: DetectedFunction[] = [],
  rings: Ring[] = []
): { name2013: string; name1993: string } {
  const built = assembleParentName(
    graph,
    parent,
    numbering,
    substituents,
    primaryFunction,
    detectedFunctions,
    suffixOccurrences,
    rings
  );

  const configurations = assignDoubleBondConfigurations(graph, parent, numbering);
  if (configurations.length === 0) return built;

  let eneCount = 0;
  for (let i = 0; i < parent.atomIds.length - 1; i++) {
    const b = graph.getBondBetween(parent.atomIds[i], parent.atomIds[i + 1]);
    if (b?.order === 2 && !b.aromatic && !b.inRing) eneCount++;
  }

  // A lone double bond needs no locant in the descriptor; several do.
  const descriptor =
    eneCount > 1
      ? configurations.map(c => `${c.locant}${c.descriptor}`).join(',')
      : configurations[0].descriptor;

  // Portuguese puts a class word first ("ácido", "cloreto de"); the descriptor
  // goes after it, immediately before the parent name.
  const stamp = (full: string): string => {
    if (!full) return full;
    const match = full.match(/^(ácido |anidrido |\w+ de )/);
    const head = match ? match[1] : '';
    return `${head}(${descriptor})-${full.slice(head.length)}`;
  };

  return { name2013: stamp(built.name2013), name1993: stamp(built.name1993) };
}

function assembleParentName(
  graph: MolecularGraph,
  parent: ParentStructure,
  numbering: Map<string, number>,
  substituents: ClassifiedSubstituent[],
  primaryFunction: OrganicFunction,
  detectedFunctions: DetectedFunction[],
  suffixOccurrences: DetectedFunction[] = [],
  rings: Ring[] = []
): { name2013: string; name1993: string } {
  const carbonCount = parent.atomIds.length;
  const isRing = parent.type === 'ring';

  const suffixLocants = suffixOccurrences
    .map(d => numbering.get(d.carbonId))
    .filter((n): n is number => n !== undefined)
    .sort((a, b) => a - b);

  // N-substituents of amines and amides are cited with the italic locant "N",
  // repeated once per occurrence: N,N-dimetil…, N-etil-N-metil…
  // N-substituents are cited with the italic locant "N" — but *interleaved*
  // with the carbon ones in a single alphabetical sequence. Emitting them as a
  // separate block in front produced "N-metil-3-etil…" where IUPAC asks for
  // "3-etil-N-metil…".
  const nSubstituents: ClassifiedSubstituent[] = [];
  if (primaryFunction === 'amina' || primaryFunction === 'amida') {
    // Two nitrogens need telling apart: N and N'. Labelling both "N" turned a
    // di(methylamino) compound into one nitrogen carrying two methyls.
    const nitrogenIds = [
      ...new Set(
        suffixOccurrences
          .map(o => o.atomIds.find(id => graph.atoms.get(id)?.element === 'N'))
          .filter((id): id is string => id !== undefined)
      ),
    ];
    const primeFor = (nId: string) =>
      nitrogenIds.length > 1 ? `N${"'".repeat(nitrogenIds.indexOf(nId))}` : 'N';
    for (const occ of suffixOccurrences) {
      const nId = occ.atomIds.find(id => graph.atoms.get(id)?.element === 'N');
      if (!nId) continue;
      for (const n of graph.getNeighbors(nId)) {
        if (n.neighborId === occ.carbonId) continue;
        const a = graph.atoms.get(n.neighborId);
        if (!a || a.element !== 'C') continue;
        if (parent.atomIds.includes(n.neighborId)) continue;
        const named = nameBranch(graph, n.neighborId, nId, rings);
        if (named) nSubstituents.push({ ...named, locant: 0, locantLabel: primeFor(nId) });
      }
    }
  }

  // A ring that carries an exocyclic principal group, or a fused ring, has a
  // fixed C1 — its substituent positions are meaningful and must be numbered.
  // A heteroatom fixes the numbering, so no position of a heterocycle is
  // interchangeable: 4-metilpiridina and 2-metilpiridina are different
  // compounds. assembleParent already knew this; this function did not, and it
  // is the one that decides the prefix, so the locant was being dropped.
  const parentIsHeterocycle = isRing && ringHasHeteroatoms(graph, parent.atomIds);
  const ringPositionsInterchangeable =
    isRing &&
    !parentIsHeterocycle &&
    !parent.exocyclicCarbonId &&
    parent.ringType !== 'naftaleno' &&
    (parent.fusionAtomIds?.length ?? 0) === 0;
  const allSubstituents = [...substituents, ...nSubstituents];
  const omitPrefixLocants =
    carbonCount <= 1 ||
    (allSubstituents.length + suffixLocants.length <= 1 &&
      (ringPositionsInterchangeable || carbonCount <= 2));

  // An italic "N" is never redundant, so it survives the omission rule.
  const prefixStr = formatGroupedSubstituents(
    allSubstituents,
    omitPrefixLocants && nSubstituents.length === 0
  );

  const base = (suffixFn: OrganicFunction | undefined, plain = false) =>
    assembleParent({
      graph,
      parent,
      numbering,
      prefixStr,
      substituentCount: allSubstituents.length,
      suffix:
        suffixFn && FUNCTION_SUFFIX[suffixFn]
          ? {
              base: FUNCTION_SUFFIX[suffixFn]!,
              pluralBase: FUNCTION_SUFFIX_PLURAL[suffixFn],
              locants: suffixLocants,
              fn: suffixFn,
            }
          : undefined,
      plainEnding: plain,
    });

  // --- Special constructions -------------------------------------------------

  // Principal group hanging off a ring: retained names first, then the "carbo-"
  // forms (benzenocarbaldeído, ácido ciclo-hexanocarboxílico, ...).
  if (isRing && parent.exocyclicCarbonId) {
    const ringName = assembleParent({
      graph,
      parent,
      numbering,
      prefixStr,
      substituentCount: allSubstituents.length,
    }).name2013;

    if (primaryFunction === 'acido_carboxilico' && parent.ringType === 'benzeno') {
      const anionic = detectedFunctions
        .filter(d => d.type === 'acido_carboxilico')
        .every(d =>
          d.atomIds.some(id => {
            const a = graph.atoms.get(id);
            return a?.element === 'O' && a.charge === -1;
          })
        );
      const retained = anionic ? 'benzoato' : 'benzoico';
      const full = anionic
        ? joinWithNovoAcordo(prefixStr, retained)
        : `ácido ${joinWithNovoAcordo(prefixStr, retained)}`;
      return { name2013: full, name1993: full };
    }
    if (primaryFunction === 'ester') {
      const esterGroups =
        suffixOccurrences.length > 0
          ? suffixOccurrences
          : detectedFunctions.filter(d => d.type === 'ester');
      const first = esterGroups[0];
      const alkylCId = first?.extra?.alkylCarbonId ?? '';
      const bridgeO = first?.atomIds[2] ?? '';
      const named = alkylCId ? nameBranch(graph, alkylCId, bridgeO, rings) : null;
      const radical = (named?.sortKey ?? 'metil').replace(/^\(|\)$/g, '');
      const alkylName = radical.endsWith('il') ? `${radical}a` : `${radical}ila`;
      const acyl =
        parent.ringType === 'benzeno'
          ? joinWithNovoAcordo(prefixStr, 'benzoato')
          : `${ringName}carboxilato`;
      const full = `${acyl} de ${alkylName}`;
      return { name2013: full, name1993: full };
    }
    if (primaryFunction === 'haleto_acila') {
      const acyl = detectedFunctions.find(d => d.type === 'haleto_acila');
      const halogen = acyl?.extra?.halogen ?? 'Cl';
      const halName =
        halogen === 'F' ? 'fluoreto' : halogen === 'Br' ? 'brometo' : halogen === 'I' ? 'iodeto' : 'cloreto';
      const ringAttachment = graph
        .getNeighbors(parent.exocyclicCarbonId)
        .map(n => n.neighborId)
        .find(id => parent.atomIds.includes(id));
      const ringAttachmentLocant = ringAttachment ? numbering.get(ringAttachment) : undefined;
      const carbonilaBody =
        ringHasHeteroatoms(graph, parent.atomIds) && ringAttachmentLocant !== undefined
          ? `${ringName}-${ringAttachmentLocant}-carbonila`
          : `${ringName}carbonila`;
      const acylName =
        parent.ringType === 'benzeno'
          ? joinWithNovoAcordo(prefixStr, 'benzoíla')
          : carbonilaBody;
      const full = `${halName} de ${acylName}`;
      return { name2013: full, name1993: full };
    }
    const carbo = RING_CARBO_SUFFIX[primaryFunction];
    if (carbo) {
      // On a heterocycle the heteroatom owns position 1, so the ring carbon
      // bearing the group has a locant of its own and it must be written:
      // "ácido piperidinacarboxílico" let a reader hang the acid on the
      // nitrogen. A carbocycle keeps the bare form, its C1 being the
      // attachment by definition.
      const attachmentRingAtom = graph
        .getNeighbors(parent.exocyclicCarbonId)
        .map(n => n.neighborId)
        .find(id => parent.atomIds.includes(id));
      const attachmentLocant = attachmentRingAtom ? numbering.get(attachmentRingAtom) : undefined;
      const needsLocant =
        ringHasHeteroatoms(graph, parent.atomIds) && attachmentLocant !== undefined;
      const body = needsLocant
        ? `${ringName}-${attachmentLocant}-${carbo}`
        : `${ringName}${carbo}`;
      const full = primaryFunction === 'acido_carboxilico' ? `ácido ${body}` : body;
      return { name2013: full, name1993: full };
    }
  }

  // Urea is a retained name (P-66.1.6.1.1). Built systematically it came out as
  // "aminometanamida", which OPSIN reads as H2N-NH-CHO — a different molecule.
  if (primaryFunction === 'amida' && parent.atomIds.length === 1) {
    const carbon = graph.atoms.get(parent.atomIds[0]);
    if (carbon) {
      const neighbours = graph.getNeighbors(carbon.id);
      const nitrogens = neighbours.filter(
        n => n.order === 1 && graph.atoms.get(n.neighborId)?.element === 'N'
      );
      const carbonylO = neighbours.find(
        n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O'
      );
      const bareNitrogens = nitrogens.filter(
        n =>
          !graph
            .getNeighbors(n.neighborId)
            .some(x => x.neighborId !== carbon.id && graph.atoms.get(x.neighborId)?.element === 'C')
      );
      if (carbonylO && nitrogens.length === 2 && bareNitrogens.length === 2) {
        return { name2013: 'ureia', name1993: 'ureia' };
      }
    }
  }

  // Carboxylate anion: the deprotonated form is "benzoato" / "…oato", never
  // "ácido benzoico" — calling an anion an acid states the wrong species.
  const isCarboxylate =
    primaryFunction === 'acido_carboxilico' &&
    suffixOccurrences.length > 0 &&
    suffixOccurrences.every(occ =>
      occ.atomIds.some(id => {
        const a = graph.atoms.get(id);
        return a?.element === 'O' && a.charge === -1;
      })
    );
  if (isCarboxylate) {
    if (isRing && parent.exocyclicCarbonId && parent.ringType === 'benzeno') {
      const full = joinWithNovoAcordo(prefixStr, 'benzoato');
      return { name2013: full, name1993: full };
    }
    const { name2013, name1993 } = base('ester');
    return { name2013, name1993 };
  }

  // Carboxylic acid: "ácido …oico"
  if (primaryFunction === 'acido_carboxilico') {
    const { name2013, name1993 } = base('acido_carboxilico');
    return { name2013: `ácido ${name2013}`, name1993: `ácido ${name1993}` };
  }

  // Anhydride. It has TWO acyl halves, so the generic single-parent pipeline
  // cannot name it: that path silently dropped one half of every mixed
  // anhydride and, for the cyclic ones, mistook the ring holding the bridging
  // oxygen for an oxolane parent ("anidrido oxolanodioico" for succinic).
  if (primaryFunction === 'anidrido') {
    const built = assembleAnhydrideName(graph, detectedFunctions, rings);
    if (built) return { name2013: built, name1993: built };
    const { name2013, name1993 } = base('acido_carboxilico');
    return { name2013: `anidrido ${name2013}`, name1993: `anidrido ${name1993}` };
  }

  // Ester: "…oato de …ila"
  if (primaryFunction === 'ester') {
    const esterGroups =
      suffixOccurrences.length > 0
        ? suffixOccurrences
        : detectedFunctions.filter(d => d.type === 'ester');

    const radicals = esterGroups.map(group => {
      const alkylCId = group.extra?.alkylCarbonId ?? '';
      const bridgeO = group.atomIds[2] ?? '';
      if (!alkylCId) return 'metil';
      const named = nameBranch(graph, alkylCId, bridgeO, rings);
      return (named?.sortKey ?? 'metil').replace(/^\(|\)$/g, '');
    });

    // A diester repeats its alkoxy group: "etanodioato de dimetila".
    const distinct = [...new Set(radicals)];
    const alkylName =
      distinct.length === 1
        ? (() => {
            const multiplier = radicals.length > 1 ? MULTIPLIERS[radicals.length] ?? '' : '';
            const radical = distinct[0];
            return `${multiplier}${radical.endsWith('il') ? `${radical}a` : `${radical}ila`}`;
          })()
        : distinct
            .map(radical => (radical.endsWith('il') ? `${radical}a` : `${radical}ila`))
            .join(' e ');

    const { name2013, name1993 } = base('ester');
    return {
      name2013: `${name2013} de ${alkylName}`,
      name1993: `${name1993} de ${alkylName}`,
    };
  }

  // Acyl halide: "cloreto de …oíla"
  if (primaryFunction === 'haleto_acila') {
    const acylFunc = suffixOccurrences[0] ?? detectedFunctions.find(d => d.type === 'haleto_acila');
    const halogen = acylFunc?.extra?.halogen ?? 'Cl';
    const halName =
      halogen === 'F' ? 'fluoreto' : halogen === 'Br' ? 'brometo' : halogen === 'I' ? 'iodeto' : 'cloreto';
    const { name2013, name1993 } = base('haleto_acila');
    return {
      name2013: `${halName} de ${name2013}`,
      name1993: `${halName} de ${name1993}`,
    };
  }

  // Phenol. The retained "fenol" parent only covers a SINGLE hydroxyl on a
  // benzene ring; benzenediols and naphthalenols must go through the systematic
  // assembler, or the extra hydroxyls are silently dropped.
  if (primaryFunction === 'fenol') {
    const singleHydroxyl = suffixLocants.length <= 1;
    if (singleHydroxyl && parent.ringType === 'benzeno') {
      if (!prefixStr) {
        return { name2013: 'hidroxibenzeno', name1993: 'hidroxibenzeno' };
      }
      const name = joinWithNovoAcordo(prefixStr, 'fenol');
      return { name2013: name, name1993: name };
    }
    return base('fenol');
  }

  // Suffix-expressed functions handled generically.
  if (FUNCTION_SUFFIX[primaryFunction] && suffixLocants.length > 0) {
    return base(primaryFunction);
  }

  // Hydrocarbons, ethers, alkyl halides and nitro compounds: plain parent hydride.
  return base(undefined, true);
}

// ============================================================================
// 8b. Double-bond configuration (E/Z)
// ============================================================================

const ATOMIC_NUMBERS: Record<string, number> = {
  H: 1, C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53,
};

/**
 * CIP exploration of one branch, as a list of spheres of atomic numbers sorted
 * descending. Multiple bonds contribute duplicate atoms, as the rules require.
 *
 * This is the classic hierarchical-digraph comparison truncated at a fixed
 * depth: enough to separate every substituent pair a secondary-school molecule
 * presents, and it degrades to "cannot decide" rather than guessing.
 */
function cipSpheres(
  graph: MolecularGraph,
  root: string,
  cameFrom: string,
  maxDepth = 6
): number[][] {
  const HYDROGEN = '\u0000H';
  const spheres: number[][] = [];
  let frontier: { id: string; from: string }[] = [{ id: root, from: cameFrom }];

  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const numbers: number[] = [];
    const next: { id: string; from: string }[] = [];

    for (const node of frontier) {
      if (node.id === HYDROGEN) {
        numbers.push(1);
        continue;
      }
      const atom = graph.atoms.get(node.id);
      if (!atom) continue;
      numbers.push(ATOMIC_NUMBERS[atom.element] ?? 0);

      for (const edge of graph.getNeighbors(node.id)) {
        if (edge.neighborId === node.from) continue;
        next.push({ id: edge.neighborId, from: node.id });
        // A double bond duplicates its partner, a triple bond triplicates it.
        for (let k = 1; k < edge.order; k++) {
          next.push({ id: edge.neighborId, from: node.id });
        }
      }
      // Hydrogens are branches of this atom, so they belong to the NEXT sphere.
      // Counting them in the current one made a methyl (C + 3H in sphere 0)
      // outrank a chain (C + 2H), inverting the descriptor of geranial.
      for (let k = 0; k < atom.implicitH; k++) {
        next.push({ id: HYDROGEN, from: node.id });
      }
    }

    numbers.sort((a, b) => b - a);
    spheres.push(numbers);
    frontier = next;
  }

  return spheres;
}

/** > 0 when branch `a` outranks branch `b`; 0 when they are indistinguishable. */
function compareCipBranches(
  graph: MolecularGraph,
  a: string,
  b: string,
  from: string
): number {
  const sa = cipSpheres(graph, a, from);
  const sb = cipSpheres(graph, b, from);
  for (let depth = 0; depth < Math.max(sa.length, sb.length); depth++) {
    const la = sa[depth] ?? [];
    const lb = sb[depth] ?? [];
    for (let i = 0; i < Math.max(la.length, lb.length); i++) {
      const va = la[i] ?? 0;
      const vb = lb[i] ?? 0;
      if (va !== vb) return va - vb;
    }
  }
  return 0;
}

export interface DoubleBondConfiguration {
  locant: number;
  descriptor: 'E' | 'Z';
}

/**
 * Assigns E/Z to the parent's double bonds, reading the "/" and "\" markers.
 *
 * Without this, geranial and neral — different molecules, different smells —
 * received the same name, and so did fumaric and maleic acid. A bond whose
 * configuration the notation does not state is left undescribed rather than
 * guessed.
 */
export function assignDoubleBondConfigurations(
  graph: MolecularGraph,
  parent: ParentStructure,
  numbering: Map<string, number>
): DoubleBondConfiguration[] {
  if (parent.type !== 'chain') return [];
  const result: DoubleBondConfiguration[] = [];

  for (let i = 0; i < parent.atomIds.length - 1; i++) {
    const c1 = parent.atomIds[i];
    const c2 = parent.atomIds[i + 1];
    const bond = graph.getBondBetween(c1, c2);
    if (!bond || bond.order !== 2 || bond.aromatic || bond.inRing) continue;

    /** Which side a substituent sits on, from the notation's markers. */
    const sideOf = (carbon: string, other: string): Map<string, 'up' | 'down'> => {
      const sides = new Map<string, 'up' | 'down'>();
      for (const edge of graph.getNeighbors(carbon)) {
        if (edge.neighborId === other) continue;
        const b = graph.bonds.get(edge.bondId);
        if (!b?.direction) continue;
        // A marker is written relative to the bond's own source→target order;
        // normalise it to "leaving the double-bond carbon".
        const leavingCarbon = b.source === carbon;
        const normalised: 'up' | 'down' = leavingCarbon
          ? b.direction
          : b.direction === 'up'
          ? 'down'
          : 'up';
        sides.set(edge.neighborId, normalised);
      }
      return sides;
    };

    const sides1 = sideOf(c1, c2);
    const sides2 = sideOf(c2, c1);
    if (sides1.size === 0 || sides2.size === 0) continue;

    const branches = (carbon: string, other: string) =>
      graph
        .getNeighbors(carbon)
        .filter(n => n.neighborId !== other && graph.atoms.get(n.neighborId)?.element !== 'H')
        .map(n => n.neighborId);

    const b1 = branches(c1, c2);
    const b2 = branches(c2, c1);
    if (b1.length === 0 || b2.length === 0) continue;

    // Senior branch on each carbon. With a single heavy substituent the implicit
    // hydrogen is automatically the junior one.
    const senior = (list: string[], carbon: string): string | null => {
      let best = list[0];
      for (const candidate of list.slice(1)) {
        const cmp = compareCipBranches(graph, candidate, best, carbon);
        if (cmp === 0) return null; // indistinguishable: no descriptor is defined
        if (cmp > 0) best = candidate;
      }
      return best;
    };

    const s1 = senior(b1, c1);
    const s2 = senior(b2, c2);
    if (!s1 || !s2) continue;

    const side1 = sides1.get(s1) ?? flipSide(sides1, b1, s1);
    const side2 = sides2.get(s2) ?? flipSide(sides2, b2, s2);
    if (!side1 || !side2) continue;

    // Equal normalised markers put the two branches on the same side: that is
    // why "F/C=C/F" is the trans isomer.
    const sameSide = side1 === side2;
    const locant = Math.min(numbering.get(c1) ?? 1, numbering.get(c2) ?? 1);
    result.push({ locant, descriptor: sameSide ? 'Z' : 'E' });
  }

  return result.sort((a, b) => a.locant - b.locant);
}

/**
 * The marker may sit on the *other* substituent of the same carbon; the senior
 * branch is then on the opposite side of it.
 */
function flipSide(
  sides: Map<string, 'up' | 'down'>,
  branches: string[],
  target: string
): 'up' | 'down' | null {
  for (const [id, side] of sides) {
    if (id !== target && branches.includes(id)) {
      return side === 'up' ? 'down' : 'up';
    }
  }
  return null;
}

// ============================================================================
// 9. Graph to SMILES Serializer
// ============================================================================

export function molecularGraphToSMILES(graph: MolecularGraph): string {
  if (graph.atoms.size === 0) return '';

  // --- Morgan invariants give a stable, canonical traversal order ------------
  const ranks = new Map<string, number>();
  const ATOMIC_NUMBER: Partial<Record<AtomElement, number>> = {
    C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53, H: 1,
  };
  for (const atom of graph.atoms.values()) {
    const atomicNum = ATOMIC_NUMBER[atom.element] ?? 6;
    ranks.set(atom.id, atomicNum * 10 + graph.getNeighbors(atom.id).length);
  }
  for (let iteration = 0; iteration < 2; iteration++) {
    const next = new Map<string, number>();
    for (const [id, rank] of ranks.entries()) {
      let sum = rank;
      for (const n of graph.getNeighbors(id)) sum += ranks.get(n.neighborId) ?? 0;
      next.set(id, sum);
    }
    for (const [id, r] of next.entries()) ranks.set(id, r);
  }

  const orderedNeighbors = (id: string): NeighborEdge[] =>
    [...graph.getNeighbors(id)].sort(
      (a, b) => (ranks.get(b.neighborId) ?? 0) - (ranks.get(a.neighborId) ?? 0)
    );

  const atomToken = (id: string): string => {
    const atom = graph.atoms.get(id)!;
    const symbol = atom.aromatic ? atom.element.toLowerCase() : atom.element;
    if (atom.charge === 0) return symbol;
    const sign = atom.charge > 0 ? '+' : '-';
    const magnitude = Math.abs(atom.charge);
    return `[${symbol}${sign}${magnitude > 1 ? magnitude : ''}]`;
  };

  const bondSymbol = (order: BondOrder): string =>
    order === 2 ? '=' : order === 3 ? '#' : '';

  interface TreeEdge {
    atomId: string;
    order: BondOrder;
  }

  const seen = new Set<string>();
  const treeChildren = new Map<string, TreeEdge[]>();
  const ringDigits = new Map<string, string[]>();
  const closedBonds = new Set<string>();
  const ringBonds: { open: string; close: string; order: BondOrder }[] = [];

  /**
   * Pass 1 — spanning tree.
   *
   * `seen` is consulted inside the loop, not snapshotted before it: a neighbour
   * can become reachable through a ring while we are still iterating, and
   * descending into it a second time is what used to duplicate atoms.
   */
  const buildTree = (current: string, parentBondId: string | null): void => {
    seen.add(current);
    const children: TreeEdge[] = [];

    for (const edge of orderedNeighbors(current)) {
      if (edge.bondId === parentBondId) continue;

      if (seen.has(edge.neighborId)) {
        // Back edge: a ring closure. Record it once, from either endpoint.
        if (!closedBonds.has(edge.bondId)) {
          closedBonds.add(edge.bondId);
          ringBonds.push({ open: edge.neighborId, close: current, order: edge.order });
        }
        continue;
      }

      children.push({ atomId: edge.neighborId, order: edge.order });
      buildTree(edge.neighborId, edge.bondId);
    }

    treeChildren.set(current, children);
  };

  // Pass 2 — assign a matching digit to BOTH endpoints of every ring bond.
  const assignRingDigits = (): void => {
    let nextNumber = 1;
    for (const ring of ringBonds) {
      const number = nextNumber++;
      const token = number < 10 ? `${number}` : `%${number}`;
      const opening = ringDigits.get(ring.open) ?? [];
      opening.push(`${bondSymbol(ring.order)}${token}`);
      ringDigits.set(ring.open, opening);

      const closing = ringDigits.get(ring.close) ?? [];
      closing.push(token);
      ringDigits.set(ring.close, closing);
    }
  };

  const emit = (current: string): string => {
    let out = atomToken(current);
    out += (ringDigits.get(current) ?? []).join('');

    const children = treeChildren.get(current) ?? [];
    children.forEach((child, index) => {
      const branch = bondSymbol(child.order) + emit(child.atomId);
      out += index === children.length - 1 ? branch : `(${branch})`;
    });

    return out;
  };

  // A well-formed molecule is one fragment, but never emit a truncated string
  // for a disconnected drawing: each fragment becomes its own dot-separated part.
  const fragments: string[] = [];
  const remaining = [...graph.atoms.values()].sort((a, b) => {
    const degreeA = graph.getNeighbors(a.id).length;
    const degreeB = graph.getNeighbors(b.id).length;
    if (degreeA !== degreeB) return degreeA - degreeB;
    return (ranks.get(a.id) ?? 0) - (ranks.get(b.id) ?? 0);
  });

  for (const atom of remaining) {
    if (seen.has(atom.id)) continue;
    buildTree(atom.id, null);
    assignRingDigits();
    ringBonds.length = 0;
    fragments.push(emit(atom.id));
  }

  return fragments.join('.');
}

// ============================================================================
// 10. SMILES to MolecularGraph Builder Helper
// ============================================================================

export function createGraphFromSMILES(smiles: string): MolecularGraph {
  const graph = new MolecularGraph();
  let atomIndex = 1;
  let bondIndex = 1;

  const stack: (string | null)[] = [];
  let currentAtomId: string | null = null;
  let pendingBondOrder: BondOrder = 1;
  let pendingBondDirection: 'up' | 'down' | undefined;
  const ringOpenings = new Map<number, { atomId: string; bondOrder: BondOrder }>();

  let i = 0;
  while (i < smiles.length) {
    const ch = smiles[i];

    if (ch === '(') {
      stack.push(currentAtomId);
      i++;
      continue;
    }
    if (ch === ')') {
      currentAtomId = stack.pop() ?? null;
      i++;
      continue;
    }
    if (ch === '-') {
      pendingBondOrder = 1;
      i++;
      continue;
    }
    if (ch === '=') {
      pendingBondOrder = 2;
      i++;
      continue;
    }
    if (ch === '#') {
      pendingBondOrder = 3;
      i++;
      continue;
    }
    // Configuration markers around a double bond. These are *bond* tokens, not
    // atoms: falling through to the element branch turned every one of them
    // into a carbon, so cinnamaldehyde (C9H8O) parsed as C11H12O and was named
    // "5-fenilpent-3-enal".
    if (ch === '/' || ch === '\\') {
      pendingBondDirection = ch === '/' ? 'up' : 'down';
      i++;
      continue;
    }

    // Ring closure digit
    if (ch >= '1' && ch <= '9') {
      const rNum = parseInt(ch, 10);
      if (currentAtomId === null) {
        throw new Error(`SMILES inválido: dígito de anel "${ch}" antes de qualquer átomo.`);
      }
      if (ringOpenings.has(rNum)) {
        const opening = ringOpenings.get(rNum)!;
        ringOpenings.delete(rNum);
        const order = Math.max(pendingBondOrder, opening.bondOrder) as BondOrder;
        graph.addBond({
          id: `b${bondIndex++}`,
          source: opening.atomId,
          target: currentAtomId!,
          order,
          style: 'solid',
        });
        pendingBondOrder = 1;
      } else {
        ringOpenings.set(rNum, { atomId: currentAtomId!, bondOrder: pendingBondOrder });
        pendingBondOrder = 1;
      }
      i++;
      continue;
    }

    // Bracketed atom: [N+], [O-], [nH], [CH3], [13C], ...
    if (ch === '[') {
      const closeIdx = smiles.indexOf(']', i);
      if (closeIdx === -1) {
        throw new Error(`SMILES inválido: "[" sem "]" em ${i}.`);
      }
      const inner = smiles.substring(i + 1, closeIdx);

      // Read the element symbol off the *front* of the bracket, past any isotope
      // digits. Scanning for a letter anywhere inside instead made "[nH]" parse
      // as carbon (no upper-case N, no lower-case c) — pyrrole came out as
      // cyclopentane, with the nitrogen silently gone.
      const symbolMatch = inner.match(/^\d*([A-Za-z][a-z]?)/);
      if (!symbolMatch) {
        throw new Error(`SMILES inválido: átomo "[${inner}]" sem símbolo de elemento.`);
      }
      let symbol = symbolMatch[1];
      let aromatic = false;
      // Two-letter reads are only real for Cl and Br; "nH" is an aromatic n
      // followed by its hydrogen count, and "CH" is a C followed by hers.
      if (symbol.length === 2 && symbol !== 'Cl' && symbol !== 'Br') {
        symbol = symbol[0];
      }
      if (/^[cnosp]$/.test(symbol)) {
        aromatic = true;
        symbol = symbol.toUpperCase();
      }
      if (!['C', 'N', 'O', 'F', 'Cl', 'Br', 'I', 'S', 'P', 'H'].includes(symbol)) {
        throw new Error(`SMILES inválido: elemento "${symbol}" não suportado.`);
      }
      const element = symbol as AtomElement;

      const rest = inner.slice(symbolMatch[0].length);
      const hMatch = rest.match(/H(\d*)/);
      const explicitHCount = hMatch ? (hMatch[1] === '' ? 1 : Number(hMatch[1])) : 0;

      let charge = 0;
      const chargeMatch = rest.match(/([+-])(\d*)/);
      if (chargeMatch) {
        const magnitude = chargeMatch[2] === '' ? 1 : Number(chargeMatch[2]);
        charge = chargeMatch[1] === '+' ? magnitude : -magnitude;
      }

      const id = `a${atomIndex++}`;
      graph.addAtom({
        id,
        element,
        x: 0,
        y: 0,
        charge,
        implicitH: 0,
        explicitHCount,
        aromatic,
      });

      if (currentAtomId) {
        graph.addBond({
          id: `b${bondIndex++}`,
          source: currentAtomId,
          target: id,
          order: pendingBondOrder,
          style: 'solid',
          direction: pendingBondDirection,
        });
        pendingBondOrder = 1;
        pendingBondDirection = undefined;
      }
      currentAtomId = id;
      i = closeIdx + 1;
      continue;
    }

    // Organic subset atom
    let elStr = ch;
    if (ch === 'C' && smiles[i + 1] === 'l') {
      elStr = 'Cl';
      i++;
    } else if (ch === 'B' && smiles[i + 1] === 'r') {
      elStr = 'Br';
      i++;
    }

    let element: AtomElement = 'C';
    let aromatic = false;

    // Anything the organic subset does not cover is a parse error. Defaulting
    // to carbon is what let the stereo markers become phantom atoms, and it
    // would hide every future notation gap the same way.
    if (!/^(c|n|o|s|p|C|N|O|F|Cl|Br|I|S|P|H)$/.test(elStr)) {
      throw new Error(`SMILES inválido: token "${elStr}" não reconhecido na posição ${i}.`);
    }

    if (elStr === 'c') { element = 'C'; aromatic = true; }
    else if (elStr === 'n') { element = 'N'; aromatic = true; }
    else if (elStr === 'o') { element = 'O'; aromatic = true; }
    else if (elStr === 's') { element = 'S'; aromatic = true; }
    else if (elStr === 'p') { element = 'P'; aromatic = true; }
    else if (['C', 'N', 'O', 'F', 'Cl', 'Br', 'I', 'S', 'P', 'H'].includes(elStr)) {
      element = elStr as AtomElement;
    }

    const id = `a${atomIndex++}`;
    graph.addAtom({
      id,
      element,
      x: 0,
      y: 0,
      charge: 0,
      implicitH: 0,
      aromatic,
    });

    if (currentAtomId) {
      graph.addBond({
        id: `b${bondIndex++}`,
        source: currentAtomId,
        target: id,
        order: pendingBondOrder,
        style: 'solid',
        direction: pendingBondDirection,
      });
      pendingBondOrder = 1;
      pendingBondDirection = undefined;
    }

    currentAtomId = id;
    i++;
  }

  if (ringOpenings.size > 0) {
    // An unmatched digit means the ring never closed. Naming the fragment anyway
    // produced confident nonsense from corrupt input, so it is an error now.
    const open = [...ringOpenings.keys()].sort().join(', ');
    throw new Error(`SMILES inválido: dígito(s) de anel sem fechamento: ${open}.`);
  }
  if (stack.length > 0) {
    throw new Error('SMILES inválido: parênteses não fechados.');
  }

  calculateValences(graph);
  perceiveRingsAndAromaticity(graph);
  return graph;
}

// ============================================================================
// 11. Master Pipeline & GraphNamer Class
// ============================================================================

/**
 * One human-readable step of the naming derivation, shown live in the sandbox so
 * the student sees *why* a structure earns its name.
 */
export interface NamingStep {
  /** Short label, e.g. "Cadeia principal". */
  title: string;
  /** Explanation in pt-BR. */
  detail: string;
}

/**
 * Structural problems that make a drawing un-nameable, reported to the user
 * instead of throwing.
 */
export interface GraphProblem {
  code: 'empty' | 'no_carbon' | 'disconnected' | 'valence' | 'unsupported_ring';
  message: string;
  atomIds?: string[];
}

export interface MolecularGraphAnalysis extends MolecularGraphNamingResult {
  /** False when `problems` contains a blocking issue; the name is then a best effort. */
  isNameable: boolean;
  problems: GraphProblem[];
  steps: NamingStep[];
  parentType: 'chain' | 'ring';
  parentSize: number;
  parentAtomIds: string[];
  /** Parent locant assigned to each atom, for canvas overlays. */
  locants: Record<string, number>;
  substituents: { locant: number; name: string }[];
  detectedFunctions: OrganicFunction[];
}

const FUNCTION_LABEL_PTBR: Record<OrganicFunction, string> = {
  hidrocarboneto: 'Hidrocarboneto',
  alcool: 'Álcool',
  fenol: 'Fenol',
  enol: 'Enol',
  eter: 'Éter',
  aldeido: 'Aldeído',
  cetona: 'Cetona',
  acido_carboxilico: 'Ácido carboxílico',
  ester: 'Éster',
  amina: 'Amina',
  amida: 'Amida',
  nitrila: 'Nitrila',
  nitrocomposto: 'Nitrocomposto',
  haleto_alquila: 'Haleto de alquila',
  haleto_acila: 'Haleto de acila',
  anidrido: 'Anidrido',
};

/**
 * Detects structural issues that would make the drawing chemically impossible.
 */
export function validateMolecularGraph(graph: MolecularGraph): GraphProblem[] {
  const problems: GraphProblem[] = [];
  const atoms = Array.from(graph.atoms.values());

  if (atoms.length === 0) {
    problems.push({ code: 'empty', message: 'Desenhe pelo menos um átomo para começar.' });
    return problems;
  }

  if (!atoms.some(a => a.element === 'C')) {
    problems.push({
      code: 'no_carbon',
      message: 'Sem carbono não há composto orgânico — adicione ao menos um C.',
    });
  }

  // Connectivity: a molecule must be a single fragment.
  const visited = new Set<string>([atoms[0].id]);
  const queue = [atoms[0].id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const n of graph.getNeighbors(current)) {
      if (!visited.has(n.neighborId)) {
        visited.add(n.neighborId);
        queue.push(n.neighborId);
      }
    }
  }
  if (visited.size < atoms.length) {
    problems.push({
      code: 'disconnected',
      message: `Há ${atoms.length - visited.size} átomo(s) solto(s). Conecte tudo em uma única molécula.`,
      atomIds: atoms.filter(a => !visited.has(a.id)).map(a => a.id),
    });
  }

  // Valence saturation
  const maxValence: Partial<Record<string, number>> = {
    C: 4, N: 4, O: 2, F: 1, Cl: 1, Br: 1, I: 1, H: 1, S: 6, P: 5,
  };
  const overloaded: string[] = [];
  for (const atom of atoms) {
    const sum = graph.getNeighbors(atom.id).reduce((acc, n) => acc + n.order, 0);
    // Only a *positive* charge buys extra bonds. Using |charge| let [O-] reach
    // three bonds and [N+] five, so genuinely impossible drawings passed.
    let limit = (maxValence[atom.element] ?? 4) + Math.max(0, atom.charge);

    // "N(=O)=O" is the everyday SMILES shorthand for a nitro group and appears
    // all over public datasets. It is formally pentavalent nitrogen, so accept
    // it explicitly rather than rejecting half the corpus we want to grow into.
    if (atom.element === 'N' && atom.charge === 0 && sum === 5) {
      const doubleOxygens = graph
        .getNeighbors(atom.id)
        .filter(n => n.order === 2 && graph.atoms.get(n.neighborId)?.element === 'O');
      if (doubleOxygens.length === 2) limit = 5;
    }

    if (sum > limit) overloaded.push(atom.id);
  }
  if (overloaded.length > 0) {
    problems.push({
      code: 'valence',
      message: `${overloaded.length} átomo(s) com valência estourada — remova uma ligação.`,
      atomIds: overloaded,
    });
  }

  return problems;
}

export class GraphNamer {
  private graph: MolecularGraph;

  constructor(graph: MolecularGraph | MolecularGraphData) {
    this.graph = graph instanceof MolecularGraph ? graph.clone() : new MolecularGraph(graph);
  }

  public execute(): MolecularGraphNamingResult {
    calculateValences(this.graph);
    const formula = computeMolecularFormula(this.graph);
    const rings = perceiveRingsAndAromaticity(this.graph);
    const detected = detectFunctionalGroups(this.graph, rings);
    const primaryFunction = selectPrimaryFunction(detected);
    const secondaryFunctions = Array.from(
      new Set(detected.map(d => d.type).filter(t => t !== primaryFunction))
    );

    const parentStructure = selectParentStructure(
      this.graph,
      primaryFunction,
      rings,
      detected
    );

    const numbering = numberParentStructure(
      this.graph,
      parentStructure,
      primaryFunction,
      detected
    );

    // Occurrences of the principal function that sit on the parent structure are
    // expressed as the SUFFIX; every atom they consume must therefore never be
    // cited again as a prefix (this is what produced "1-hidroxietanol" before).
    const parentSet = new Set(parentStructure.atomIds);
    const suffixOccurrences = detected.filter(
      d =>
        d.type === primaryFunction &&
        SUFFIX_EXPRESSED_FUNCTIONS.has(d.type) &&
        (parentSet.has(d.carbonId) || parentStructure.exocyclicCarbonId === d.carbonId)
    );

    const consumedAtoms = new Set<string>();
    for (const occ of suffixOccurrences) {
      for (const atomId of occ.atomIds) {
        if (!parentSet.has(atomId)) consumedAtoms.add(atomId);
      }
    }
    if (parentStructure.exocyclicCarbonId) {
      consumedAtoms.add(parentStructure.exocyclicCarbonId);
    }

    // A branch may hold a ring with no name (fused, bridged, off-table). This
    // path has no channel to report problems through — analyzeMolecularGraph is
    // the one that refuses out loud — so it degrades to a best effort here.
    let substituents: ClassifiedSubstituent[] = [];
    try {
      substituents = identifySubstituents(
        this.graph,
        parentStructure,
        numbering,
        primaryFunction,
        consumedAtoms,
        rings
      );
    } catch (err) {
      if (!(err instanceof UnnameableBranchError)) throw err;
    }

    let name2013 = '';
    let name1993 = '';
    try {
      ({ name2013, name1993 } = assembleIupacNames(
        this.graph,
        parentStructure,
        numbering,
        substituents,
        primaryFunction,
        detected,
        suffixOccurrences,
        rings
      ));
    } catch (err) {
      if (!(err instanceof UnnameableBranchError)) throw err;
    }

    const smiles = molecularGraphToSMILES(this.graph);

    return {
      iupacName2013: name2013,
      iupacName1993: name1993,
      formula,
      smiles,
      primaryFunction,
      secondaryFunctions,
    };
  }
}

export function nameMolecularGraph(
  graph: MolecularGraph | MolecularGraphData
): MolecularGraphNamingResult {
  const namer = new GraphNamer(graph);
  return namer.execute();
}

const EMPTY_ANALYSIS: MolecularGraphAnalysis = {
  iupacName2013: '',
  iupacName1993: '',
  formula: '',
  smiles: '',
  primaryFunction: 'hidrocarboneto',
  secondaryFunctions: [],
  isNameable: false,
  problems: [{ code: 'empty', message: 'Desenhe pelo menos um átomo para começar.' }],
  steps: [],
  parentType: 'chain',
  parentSize: 0,
  parentAtomIds: [],
  locants: {},
  substituents: [],
  detectedFunctions: [],
};

/**
 * Full real-time analysis used by the interactive builder: the canonical name in
 * both notations plus a step-by-step derivation and any structural problems.
 * Never throws — a broken drawing comes back as `isNameable: false`.
 */
export function analyzeMolecularGraph(
  input: MolecularGraph | MolecularGraphData
): MolecularGraphAnalysis {
  const graph = input instanceof MolecularGraph ? input.clone() : new MolecularGraph(input);

  const problems = validateMolecularGraph(graph);
  const blocking = problems.some(p => p.code === 'empty' || p.code === 'no_carbon');
  if (blocking) {
    return { ...EMPTY_ANALYSIS, problems };
  }

  try {
    calculateValences(graph);
    const formula = computeMolecularFormula(graph);
    const rings = perceiveRingsAndAromaticity(graph);
    const detected = detectFunctionalGroups(graph, rings);
    const primaryFunction = selectPrimaryFunction(detected);
    const secondaryFunctions = Array.from(
      new Set(detected.map(d => d.type).filter(t => t !== primaryFunction))
    );

    const parent = selectParentStructure(graph, primaryFunction, rings, detected);
    const numbering = numberParentStructure(graph, parent, primaryFunction, detected);

    // Polycyclic systems the engine has no vocabulary for. Naphthalene is the
    // one fused parent it can name; bridged bicyclics, spiro centres,
    // anthracene and indole used to be pulled apart into independent SSSR rings
    // and named as if each were isolated, so bicyclo[2.2.2]octane (C8H14) came
    // out as "1,4-diciclo-hexilciclo-hexano". Refusing is the house rule.
    //
    // Scoped to the *parent* on purpose: a fused system can still be named when
    // some other construction owns it, as the anhydride assembler does for
    // phthalic anhydride.
    if (parent.type === 'ring' && parent.ringType !== 'naftaleno') {
      const parentRingSet = new Set(parent.atomIds);
      const fusedWith = rings.find(
        r =>
          !r.atomIds.every(id => parentRingSet.has(id)) &&
          r.atomIds.some(id => parentRingSet.has(id))
      );
      // A cyclic anhydride is named from its two acyl halves, so the fused ring
      // it lives on is fine — as long as the ring carries nothing else, which
      // that assembler would not know how to cite.
      const anhydrideAtoms = new Set(
        detected.filter(d => d.type === 'anidrido').flatMap(d => d.atomIds)
      );
      const fusedSystem = new Set([...parent.atomIds, ...(fusedWith?.atomIds ?? [])]);
      const ringIsBare =
        primaryFunction === 'anidrido' &&
        [...fusedSystem].every(id =>
          graph
            .getNeighbors(id)
            .every(
              n =>
                fusedSystem.has(n.neighborId) ||
                anhydrideAtoms.has(n.neighborId) ||
                graph.atoms.get(n.neighborId)?.element === 'H'
            )
        );
      if (fusedWith && !ringIsBare) {
        problems.push({
          code: 'unsupported_ring',
          message:
            'Sistema de anéis fundidos ou em ponte fora do que eu sei nomear (só naftaleno). Prefiro não dar um nome do que dar um errado.',
          atomIds: fusedWith.atomIds.filter(id => parentRingSet.has(id)),
        });
      }
    }

    // A chain or ring bigger than the stem table has no name either.
    if (parent.type === 'chain' && parent.atomIds.length > 0 && !STEM_NAMES[parent.atomIds.length]) {
      problems.push({
        code: 'unsupported_ring',
        message: `Cadeia de ${parent.atomIds.length} carbonos está fora da tabela de prefixos que eu conheço.`,
        atomIds: parent.atomIds,
      });
    }

    if (parent.type === 'ring' && !STEM_NAMES[parent.atomIds.length]) {
      problems.push({
        code: 'unsupported_ring',
        message: `Anel de ${parent.atomIds.length} átomos está fora da tabela de prefixos que eu conheço.`,
        atomIds: parent.atomIds,
      });
    }

    if (parent.type === 'ring' && ringHasHeteroatoms(graph, parent.atomIds)) {
      const ringAromatic = parent.atomIds.every(id => graph.atoms.get(id)?.aromatic === true);
      if (!identifyHeterocycle(graph, parent.atomIds, ringAromatic)) {
        problems.push({
          code: 'unsupported_ring',
          message:
            'Este anel heterocíclico está fora da tabela de nomes que eu conheço. Prefiro não dar um nome do que dar um errado.',
          atomIds: parent.atomIds.filter(id => graph.atoms.get(id)?.element !== 'C'),
        });
      }
    }

    const parentSet = new Set(parent.atomIds);
    const suffixOccurrences = detected.filter(
      d =>
        d.type === primaryFunction &&
        SUFFIX_EXPRESSED_FUNCTIONS.has(d.type) &&
        (parentSet.has(d.carbonId) || parent.exocyclicCarbonId === d.carbonId)
    );
    const consumedAtoms = new Set<string>();
    for (const occ of suffixOccurrences) {
      for (const atomId of occ.atomIds) if (!parentSet.has(atomId)) consumedAtoms.add(atomId);
    }
    if (parent.exocyclicCarbonId) consumedAtoms.add(parent.exocyclicCarbonId);

    let substituents: ClassifiedSubstituent[];
    try {
      substituents = identifySubstituents(
        graph,
        parent,
        numbering,
        primaryFunction,
        consumedAtoms,
        rings
      );
    } catch (err) {
      // A branch holding a ring we cannot name. Refuse instead of returning a
      // name that quietly leaves that ring out.
      if (err instanceof UnnameableBranchError) {
        // The anhydride assembler builds its name from the two acyl halves and
        // never consults this list, so a fused ring it *can* handle (phthalic)
        // must not be turned into a refusal here.
        if (primaryFunction !== 'anidrido') {
          problems.push({ code: 'unsupported_ring', message: err.message, atomIds: err.atomIds });
        }
        substituents = [];
      } else {
        throw err;
      }
    }

    let name2013: string;
    let name1993: string;
    try {
      ({ name2013, name1993 } = assembleIupacNames(
        graph,
        parent,
        numbering,
        substituents,
        primaryFunction,
        detected,
        suffixOccurrences,
        rings
      ));
    } catch (err) {
      if (err instanceof UnnameableBranchError) {
        problems.push({ code: 'unsupported_ring', message: err.message, atomIds: err.atomIds });
        ({ name2013, name1993 } = { name2013: '', name1993: '' });
      } else {
        throw err;
      }
    }

    const locants: Record<string, number> = {};
    numbering.forEach((value, key) => {
      locants[key] = value;
    });

    const suffixLocants = suffixOccurrences
      .map(d => numbering.get(d.carbonId))
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b);

    const eneLocants: number[] = [];
    const yneLocants: number[] = [];
    const limit = parent.type === 'ring' ? parent.atomIds.length : parent.atomIds.length - 1;
    for (let i = 0; i < limit; i++) {
      const bond = graph.getBondBetween(
        parent.atomIds[i],
        parent.atomIds[(i + 1) % parent.atomIds.length]
      );
      if (!bond || bond.order === 1 || bond.aromatic) continue;
      const loc = Math.min(
        numbering.get(parent.atomIds[i]) ?? 1,
        numbering.get(parent.atomIds[(i + 1) % parent.atomIds.length]) ?? 1
      );
      if (bond.order === 2) eneLocants.push(loc);
      else yneLocants.push(loc);
    }

    const steps: NamingStep[] = [];

    steps.push({
      title: '1. Função principal',
      detail:
        detected.length === 0 || primaryFunction === 'hidrocarboneto'
          ? 'Só carbono e hidrogênio: é um hidrocarboneto, então o nome termina em -o.'
          : `Entre os grupos encontrados, ${FUNCTION_LABEL_PTBR[primaryFunction]} tem a maior prioridade IUPAC, então ela manda no sufixo.` +
            (secondaryFunctions.length > 0
              ? ` As demais (${secondaryFunctions.map(f => FUNCTION_LABEL_PTBR[f]).join(', ')}) viram prefixos.`
              : ''),
    });

    steps.push({
      title: '2. Cadeia principal',
      detail:
        parent.type === 'ring'
          ? `Anel de ${parent.atomIds.length} carbonos${
              parent.ringType === 'benzeno'
                ? ' aromático → benzeno'
                : parent.ringType === 'naftaleno'
                ? ' fundido → naftaleno'
                : ' → ciclo' + (STEM_NAMES[parent.atomIds.length] ?? '')
            }.`
          : `A maior cadeia que contém o grupo principal tem ${parent.atomIds.length} carbono(s) → prefixo "${
              STEM_NAMES[parent.atomIds.length] ?? '?'
            }".`,
    });

    const numberingReason =
      suffixLocants.length > 0
        ? `o grupo principal receber o menor número (${suffixLocants.join(', ')})`
        : eneLocants.length + yneLocants.length > 0
        ? `a insaturação receber o menor número (${[...eneLocants, ...yneLocants].sort((a, b) => a - b).join(', ')})`
        : substituents.length > 0
        ? `os ramos receberem os menores números (${[...substituents.map(s => s.locant)].sort((a, b) => a - b).join(', ')})`
        : 'não haver nada a numerar';
    steps.push({
      title: '3. Numeração',
      detail: `Numera-se a partir da ponta que faz ${numberingReason}.`,
    });

    steps.push({
      title: '4. Insaturações',
      detail:
        eneLocants.length + yneLocants.length === 0
          ? 'Só ligações simples → infixo "an".'
          : [
              eneLocants.length > 0 ? `${eneLocants.length} dupla(s) em ${eneLocants.join(',')} → "en"` : '',
              yneLocants.length > 0 ? `${yneLocants.length} tripla(s) em ${yneLocants.join(',')} → "in"` : '',
            ]
              .filter(Boolean)
              .join(' e ') + '.',
    });

    steps.push({
      title: '5. Ramos e prefixos',
      detail:
        substituents.length === 0
          ? 'Nenhum ramo: a cadeia é normal (sem ramificações).'
          : `${substituents.length} grupo(s) citado(s) como prefixo, em ordem alfabética: ${[
              ...substituents,
            ]
              .sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'pt-BR'))
              .map(s => `${s.locant}-${s.name}`)
              .join(', ')}.`,
    });

    steps.push({
      title: '6. Nome final',
      detail: `IUPAC 2013: ${name2013}${
        name1993 !== name2013 ? ` — na notação antiga (1993): ${name1993}` : ''
      }`,
    });

    return {
      iupacName2013: name2013,
      iupacName1993: name1993,
      formula,
      smiles: molecularGraphToSMILES(graph),
      primaryFunction,
      secondaryFunctions,
      isNameable: problems.length === 0,
      problems,
      steps,
      parentType: parent.type,
      parentSize: parent.atomIds.length,
      parentAtomIds: [...parent.atomIds],
      locants,
      substituents: substituents.map(s => ({ locant: s.locant, name: s.name })),
      detectedFunctions: Array.from(new Set(detected.map(d => d.type))),
    };
  } catch (error) {
    return {
      ...EMPTY_ANALYSIS,
      problems: [
        ...problems,
        {
          code: 'valence',
          message: `Não consegui nomear esta estrutura: ${(error as Error).message}`,
        },
      ],
    };
  }
}

/** pt-BR display label for an organic function. */
export function functionLabelPtBR(fn: OrganicFunction): string {
  return FUNCTION_LABEL_PTBR[fn];
}
