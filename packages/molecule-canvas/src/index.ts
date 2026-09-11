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
  RING_SPECS,
  buildSubstituentGroup,
  generateUniqueId,
  getGraphBounds,
  autoAlignMolecularGraph,
} from './geometry.js';
export {
  recalculateAllValences,
  getAtomDisplayLabel,
  computeHillFormula,
  ELEMENT_COLORS,
} from './valence.js';
export { haptics } from './haptics.js';
export { findStrandedAtoms } from './fragments.js';
export { FragmentPreview, previewRing, previewGroup } from './FragmentPreview.js';
export type { FragmentPreviewProps } from './FragmentPreview.js';
export {
  ELEMENT_OPTIONS,
  FUNCTIONAL_GROUPS,
  RING_TEMPLATES,
  groupPalette,
} from './catalog.js';
export type { PaletteEntry } from './catalog.js';

/** Full-bleed Studio shell: canvas + floating, dismissible panels. */
export { MoleculeStudio } from './studio/MoleculeStudio.js';
export type { MoleculeStudioProps } from './studio/MoleculeStudio.js';
export { FloatingToolbar } from './studio/FloatingToolbar.js';
export { Balloon } from './studio/Balloon.js';
