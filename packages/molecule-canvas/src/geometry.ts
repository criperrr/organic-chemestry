import type {
  AtomElement,
  AtomNode,
  BondEdge,
  BondOrder,
  MolecularGraphData,
  RingTemplateType,
  FunctionalGroupType,
} from './types.js';

export const BOND_LENGTH = 44;
export const SNAP_RADIUS = 16;
export const BOND_CLICK_RADIUS = 12;

let idCounter = 1;
export function generateUniqueId(prefix: string = 'a'): string {
  return `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Snaps angle to the nearest 30-degree increment (0, 30, 60, 90, 120, 150, 180, etc.)
 */
export function snapAngle30(rawRadians: number): { angleRad: number; angleDeg: number } {
  let deg = ((rawRadians * 180) / Math.PI) % 360;
  if (deg < 0) deg += 360;

  // Round to nearest 30 degrees
  const snappedDeg = (Math.round(deg / 30) * 30) % 360;
  const snappedRad = (snappedDeg * Math.PI) / 180;

  return { angleRad: snappedRad, angleDeg: snappedDeg };
}

/**
 * Calculates snapped end point given start point and current cursor position
 */
export function getSnappedBondPoint(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  bondLength: number = BOND_LENGTH
): { x: number; y: number; angleDeg: number } {
  const dx = currentX - startX;
  const dy = currentY - startY;
  const rawAngle = Math.atan2(dy, dx);
  const { angleRad, angleDeg } = snapAngle30(rawAngle);

  return {
    x: Math.round(startX + bondLength * Math.cos(angleRad)),
    y: Math.round(startY + bondLength * Math.sin(angleRad)),
    angleDeg,
  };
}

/**
 * Finds the nearest atom to a given point within a max radius
 */
export function findNearestAtom(
  x: number,
  y: number,
  atoms: AtomNode[],
  maxRadius: number = SNAP_RADIUS,
  excludeAtomId?: string
): AtomNode | null {
  let bestDistSq = maxRadius * maxRadius;
  let bestAtom: AtomNode | null = null;

  for (const atom of atoms) {
    if (excludeAtomId && atom.id === excludeAtomId) continue;
    const dx = atom.x - x;
    const dy = atom.y - y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= bestDistSq) {
      bestDistSq = distSq;
      bestAtom = atom;
    }
  }

  return bestAtom;
}

/**
 * Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
 */
export function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) {
    const dpx = px - x1;
    const dpy = py - y1;
    return Math.sqrt(dpx * dpx + dpy * dpy);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const distDx = px - projX;
  const distDy = py - projY;

  return Math.sqrt(distDx * distDx + distDy * distDy);
}

/**
 * Finds the nearest bond edge to a given coordinate
 */
export function findNearestBond(
  x: number,
  y: number,
  graph: MolecularGraphData,
  maxDist: number = BOND_CLICK_RADIUS
): BondEdge | null {
  const atomMap = new Map(graph.atoms.map((a) => [a.id, a]));
  let bestDist = maxDist;
  let bestBond: BondEdge | null = null;

  for (const bond of graph.bonds) {
    const src = atomMap.get(bond.source);
    const tgt = atomMap.get(bond.target);
    if (!src || !tgt) continue;

    const dist = pointToSegmentDistance(x, y, src.x, src.y, tgt.x, tgt.y);
    if (dist <= bestDist) {
      bestDist = dist;
      bestBond = bond;
    }
  }

  return bestBond;
}

/**
 * Computes the optimal attachment angle (in radians) at a given atom
 * to attach a substituent or ring with maximum angular clearance from existing bonds.
 */
export function findBestAttachmentAngle(
  atomId: string,
  graph: MolecularGraphData
): number {
  const centerAtom = graph.atoms.find((a) => a.id === atomId);
  if (!centerAtom) return -Math.PI / 6; // default -30 degrees

  // Find all neighbors of centerAtom
  const neighborAngles: number[] = [];
  for (const bond of graph.bonds) {
    let neighborId: string | null = null;
    if (bond.source === atomId) neighborId = bond.target;
    else if (bond.target === atomId) neighborId = bond.source;

    if (neighborId) {
      const neighbor = graph.atoms.find((a) => a.id === neighborId);
      if (neighbor) {
        let ang = Math.atan2(neighbor.y - centerAtom.y, neighbor.x - centerAtom.x);
        if (ang < 0) ang += 2 * Math.PI;
        neighborAngles.push(ang);
      }
    }
  }

  if (neighborAngles.length === 0) {
    // Isolated atom: standard 30 degrees down-right or up-right
    return -Math.PI / 6; // -30 degrees
  }

  if (neighborAngles.length === 1) {
    // Continuation of chain: standard 120-degree bend
    const alpha = neighborAngles[0]!;
    // Standard sp2/sp3 bend: either +120° or -120°
    // Prefer snapping to standard 30-degree increment that points right or up
    const cand1 = (alpha + (2 * Math.PI) / 3) % (2 * Math.PI);
    const cand2 = (alpha - (2 * Math.PI) / 3 + 2 * Math.PI) % (2 * Math.PI);

    // Pick candidate with higher cos (pointing more to the right) or upward
    const score1 = Math.cos(cand1) * 1.5 - Math.sin(cand1);
    const score2 = Math.cos(cand2) * 1.5 - Math.sin(cand2);
    const chosen = score1 >= score2 ? cand1 : cand2;
    return snapAngle30(chosen).angleRad;
  }

  // 2 or more neighbors: sort angles and find largest circular gap
  neighborAngles.sort((a, b) => a - b);
  let maxGap = 0;
  let bestStartAngle = neighborAngles[0]!;

  for (let i = 0; i < neighborAngles.length; i++) {
    const cur = neighborAngles[i]!;
    const next = i === neighborAngles.length - 1 ? neighborAngles[0]! + 2 * Math.PI : neighborAngles[i + 1]!;
    const gap = next - cur;
    if (gap > maxGap) {
      maxGap = gap;
      bestStartAngle = cur;
    }
  }

  const bisector = (bestStartAngle + maxGap / 2) % (2 * Math.PI);
  return snapAngle30(bisector).angleRad;
}

/**
 * Creates a regular cyclic ring template centered at (centerX, centerY)
 */
export function createRingTemplate(
  type: RingTemplateType,
  center: { x: number; y: number },
  bondLength: number = BOND_LENGTH
): { atoms: AtomNode[]; bonds: BondEdge[] } {
  let sides = 6;
  let isAromatic = false;
  let initialAngle = -Math.PI / 2; // Flat top or vertex up

  switch (type) {
    case 'cyclopropane':
      sides = 3;
      initialAngle = -Math.PI / 2;
      break;
    case 'cyclobutane':
      sides = 4;
      initialAngle = -Math.PI / 4;
      break;
    case 'cyclopentane':
      sides = 5;
      initialAngle = -Math.PI / 2;
      break;
    case 'cyclohexane':
      sides = 6;
      initialAngle = -Math.PI / 6;
      break;
    case 'benzene':
      sides = 6;
      isAromatic = true;
      initialAngle = -Math.PI / 6;
      break;
  }

  // Polygon circumradius R = L / (2 * sin(PI / sides))
  const radius = bondLength / (2 * Math.sin(Math.PI / sides));
  const atoms: AtomNode[] = [];
  const bonds: BondEdge[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = initialAngle + (i * 2 * Math.PI) / sides;
    const x = Math.round(center.x + radius * Math.cos(angle));
    const y = Math.round(center.y + radius * Math.sin(angle));
    const atomId = generateUniqueId('c');

    atoms.push({
      id: atomId,
      element: 'C',
      x,
      y,
      charge: 0,
      implicitH: isAromatic ? 1 : 2,
      inRing: true,
      aromatic: isAromatic,
    });
  }

  // Create ring bonds
  for (let i = 0; i < sides; i++) {
    const src = atoms[i]!;
    const tgt = atoms[(i + 1) % sides]!;
    let order: BondOrder = 1;

    if (type === 'benzene') {
      // Alternating double bonds (order 2, 1, 2, 1, 2, 1)
      order = i % 2 === 0 ? 2 : 1;
    }

    bonds.push({
      id: generateUniqueId('b'),
      source: src.id,
      target: tgt.id,
      order,
      aromatic: isAromatic,
      inRing: true,
    });
  }

  return { atoms, bonds };
}

/**
 * Creates and attaches a functional group or alkyl radical to an anchor atom
 */
export function buildSubstituentGroup(
  type: FunctionalGroupType,
  anchorAtom: AtomNode,
  angleRad: number,
  bondLength: number = BOND_LENGTH
): { atoms: AtomNode[]; bonds: BondEdge[] } {
  const atoms: AtomNode[] = [];
  const bonds: BondEdge[] = [];

  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Helper to add bond
  const addBond = (srcId: string, tgtId: string, order: BondOrder = 1, isArom: boolean = false) => {
    bonds.push({
      id: generateUniqueId('b'),
      source: srcId,
      target: tgtId,
      order,
      aromatic: isArom,
    });
  };

  // Helper to create an atom
  const makeAtom = (
    el: AtomElement,
    x: number,
    y: number,
    charge: number = 0,
    implicitH: number = 0,
    isArom: boolean = false
  ): AtomNode => {
    const atom: AtomNode = {
      id: generateUniqueId(el.toLowerCase()),
      element: el,
      x: Math.round(x),
      y: Math.round(y),
      charge,
      implicitH,
      aromatic: isArom,
    };
    atoms.push(atom);
    return atom;
  };

  switch (type) {
    case '-OH': {
      // Alcohol: single bond to Oxygen
      const oAtom = makeAtom('O', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 1);
      addBond(anchorAtom.id, oAtom.id, 1);
      break;
    }

    case '=O': {
      // Carbonyl: double bond to Oxygen
      const oAtom = makeAtom('O', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 0);
      addBond(anchorAtom.id, oAtom.id, 2);
      break;
    }

    case '-COOH': {
      // Carboxyl: C bonded to anchor, with =O and -OH
      const c1 = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 0);
      addBond(anchorAtom.id, c1.id, 1);

      // Carbonyl =O at +60 deg
      const o1Angle = angleRad + Math.PI / 3;
      const o1 = makeAtom('O', c1.x + bondLength * Math.cos(o1Angle), c1.y + bondLength * Math.sin(o1Angle), 0, 0);
      addBond(c1.id, o1.id, 2);

      // Hydroxyl -OH at -60 deg
      const o2Angle = angleRad - Math.PI / 3;
      const o2 = makeAtom('O', c1.x + bondLength * Math.cos(o2Angle), c1.y + bondLength * Math.sin(o2Angle), 0, 1);
      addBond(c1.id, o2.id, 1);
      break;
    }

    case '-NH2': {
      // Primary amine: single bond to Nitrogen
      const nAtom = makeAtom('N', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 2);
      addBond(anchorAtom.id, nAtom.id, 1);
      break;
    }

    case '-NO2': {
      // Nitro group: -N(+)(=[O])[O-]
      const nAtom = makeAtom('N', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 1, 0);
      addBond(anchorAtom.id, nAtom.id, 1);

      const o1Angle = angleRad + Math.PI / 3;
      const o1 = makeAtom('O', nAtom.x + bondLength * Math.cos(o1Angle), nAtom.y + bondLength * Math.sin(o1Angle), 0, 0);
      addBond(nAtom.id, o1.id, 2);

      const o2Angle = angleRad - Math.PI / 3;
      const o2 = makeAtom('O', nAtom.x + bondLength * Math.cos(o2Angle), nAtom.y + bondLength * Math.sin(o2Angle), -1, 0);
      addBond(nAtom.id, o2.id, 1);
      break;
    }

    case '-OCH3': {
      // Methoxy ether: -O-CH3
      const oAtom = makeAtom('O', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 0);
      addBond(anchorAtom.id, oAtom.id, 1);

      const cAngle = angleRad + Math.PI / 3;
      const cAtom = makeAtom('C', oAtom.x + bondLength * Math.cos(cAngle), oAtom.y + bondLength * Math.sin(cAngle), 0, 3);
      addBond(oAtom.id, cAtom.id, 1);
      break;
    }

    case '-C#N': {
      // Nitrile: -C≡N
      const cAtom = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 0);
      addBond(anchorAtom.id, cAtom.id, 1);

      const nAtom = makeAtom('N', cAtom.x + bondLength * cosA, cAtom.y + bondLength * sinA, 0, 0);
      addBond(cAtom.id, nAtom.id, 3);
      break;
    }

    case '-CH3': {
      // Methyl radical
      const cAtom = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 3);
      addBond(anchorAtom.id, cAtom.id, 1);
      break;
    }

    case '-CH2CH3': {
      // Ethyl radical (zigzag)
      const c1 = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 2);
      addBond(anchorAtom.id, c1.id, 1);

      const bendAngle = angleRad + Math.PI / 3;
      const c2 = makeAtom('C', c1.x + bondLength * Math.cos(bendAngle), c1.y + bondLength * Math.sin(bendAngle), 0, 3);
      addBond(c1.id, c2.id, 1);
      break;
    }

    case '-CH(CH3)2': {
      // Isopropyl: central C branching into two methyls
      const cMid = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 1);
      addBond(anchorAtom.id, cMid.id, 1);

      const m1Angle = angleRad + Math.PI / 3;
      const cM1 = makeAtom('C', cMid.x + bondLength * Math.cos(m1Angle), cMid.y + bondLength * Math.sin(m1Angle), 0, 3);
      addBond(cMid.id, cM1.id, 1);

      const m2Angle = angleRad - Math.PI / 3;
      const cM2 = makeAtom('C', cMid.x + bondLength * Math.cos(m2Angle), cMid.y + bondLength * Math.sin(m2Angle), 0, 3);
      addBond(cMid.id, cM2.id, 1);
      break;
    }

    case '-C(CH3)3': {
      // tert-Butyl: central C branching into three methyls
      const cQuat = makeAtom('C', anchorAtom.x + bondLength * cosA, anchorAtom.y + bondLength * sinA, 0, 0);
      addBond(anchorAtom.id, cQuat.id, 1);

      const m1Angle = angleRad - Math.PI / 3;
      const cM1 = makeAtom('C', cQuat.x + bondLength * Math.cos(m1Angle), cQuat.y + bondLength * Math.sin(m1Angle), 0, 3);
      addBond(cQuat.id, cM1.id, 1);

      const m2Angle = angleRad;
      const cM2 = makeAtom('C', cQuat.x + bondLength * Math.cos(m2Angle), cQuat.y + bondLength * Math.sin(m2Angle), 0, 3);
      addBond(cQuat.id, cM2.id, 1);

      const m3Angle = angleRad + Math.PI / 3;
      const cM3 = makeAtom('C', cQuat.x + bondLength * Math.cos(m3Angle), cQuat.y + bondLength * Math.sin(m3Angle), 0, 3);
      addBond(cQuat.id, cM3.id, 1);
      break;
    }

    case '-C6H5': {
      // Phenyl radical: attached benzene ring
      const ringCenterDist = bondLength + bondLength; // bond to ring + ring radius
      const centerX = anchorAtom.x + ringCenterDist * cosA;
      const centerY = anchorAtom.y + ringCenterDist * sinA;

      const ring = createRingTemplate('benzene', { x: centerX, y: centerY }, bondLength);
      // Find the ring atom closest to anchorAtom and bond anchor to it
      let closestRingAtom = ring.atoms[0]!;
      let minD = Infinity;
      for (const rAtom of ring.atoms) {
        const d = (rAtom.x - anchorAtom.x) ** 2 + (rAtom.y - anchorAtom.y) ** 2;
        if (d < minD) {
          minD = d;
          closestRingAtom = rAtom;
        }
      }

      atoms.push(...ring.atoms);
      bonds.push(...ring.bonds);
      addBond(anchorAtom.id, closestRingAtom.id, 1);
      break;
    }
  }

  return { atoms, bonds };
}

/**
 * Calculates bounding box and center of the entire molecular graph
 */
export function getGraphBounds(atoms: AtomNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  if (atoms.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const a of atoms) {
    if (a.x < minX) minX = a.x;
    if (a.y < minY) minY = a.y;
    if (a.x > maxX) maxX = a.x;
    if (a.y > maxY) maxY = a.y;
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return { minX, minY, maxX, maxY, width, height, centerX, centerY };
}
