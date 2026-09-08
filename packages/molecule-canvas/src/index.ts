/**
 * @quimicarush/molecule-canvas
 *
 * Standalone 2D skeletal-formula editor. Owns drawing, valence bookkeeping and
 * geometry only — naming lives in @quimicarush/chemistry-core, so the canvas can
 * be embedded in any app (the QuímicaRush lab tab, the Molecule Studio, tests).
 */
export { SkeletalCanvas } from './SkeletalCanvas.js';
export * from './types.js';
export {
  BOND_LENGTH,
  SNAP_RADIUS,
  getSnappedBondPoint,
  findNearestAtom,
  findNearestBond,
  findBestAttachmentAngle,
  createRingTemplate,
  buildSubstituentGroup,
  generateUniqueId,
  getGraphBounds,
} from './geometry.js';
export {
  recalculateAllValences,
  getAtomDisplayLabel,
  computeHillFormula,
  ELEMENT_COLORS,
} from './valence.js';
export { haptics } from './haptics.js';
export { findStrandedAtoms } from './fragments.js';
