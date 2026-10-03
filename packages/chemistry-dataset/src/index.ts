/**
 * @quimicarush/chemistry-dataset
 * Canonical Molecule Database, Procedural Generator, and Chaos Synthesizer
 */

export type {
  DifficultyTier,
  Molecule,
  OrganicFunction,
} from '@quimicarush/chemistry-core';

export {
  DatasetProvider,
  datasetProvider,
  getAllMolecules,
  getByDifficulty,
  getByFunction,
  getCanonicalIUPACForSynonym,
  getRandomMolecule,
  getSynonymsDictionary,
  searchMolecules,
} from './dataset-provider.js';

export {
  ProceduralGenerator,
  proceduralGenerator,
  generateMolecule,
  verifyValences,
  VALENCE_RULES,
} from './procedural-generator.js';
export type { ProceduralGeneratorOptions } from './procedural-generator.js';

export {
  ChaosSynthesizer,
  chaosSynthesizer,
  synthesizeChaosMolecule,
} from './chaos-synthesizer.js';
export type { ChaosSynthesizerOptions } from './chaos-synthesizer.js';

export {
  IsomerismProvider,
  isomerismProvider,
} from './isomerism-provider.js';
export type {
  IsomerPairFilter,
  ChiralFilter,
  GeometricFilter,
} from './isomerism-provider.js';
export {
  CANONICAL_ISOMER_PAIRS,
  CANONICAL_CHIRAL_QUESTIONS,
  CANONICAL_GEOMETRIC_QUESTIONS,
} from './isomerism-data.js';
