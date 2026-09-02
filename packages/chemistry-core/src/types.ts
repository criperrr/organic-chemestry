import { z } from 'zod';

/**
 * The 16 canonical organic functions from funcoes.pdf
 */
export type OrganicFunction =
  | 'hidrocarboneto'
  | 'alcool'
  | 'fenol'
  | 'enol'
  | 'eter'
  | 'aldeido'
  | 'cetona'
  | 'acido_carboxilico'
  | 'ester'
  | 'amina'
  | 'amida'
  | 'nitrila'
  | 'nitrocomposto'
  | 'haleto_alquila'
  | 'haleto_acila'
  | 'anidrido';

export const OrganicFunctionSchema = z.enum([
  'hidrocarboneto',
  'alcool',
  'fenol',
  'enol',
  'eter',
  'aldeido',
  'cetona',
  'acido_carboxilico',
  'ester',
  'amina',
  'amida',
  'nitrila',
  'nitrocomposto',
  'haleto_alquila',
  'haleto_acila',
  'anidrido',
]);

/**
 * IUPAC priority order ranking (higher number = higher priority)
 * Carboxylic Acid > Anhydride > Ester > Acyl Halide > Amide > Nitrile >
 * Aldehyde > Ketone > Alcohol > Enol > Phenol > Amine > Ether > Halide > Nitro > Hydrocarbon
 */
export const IUPAC_PRIORITY_ORDER: Record<OrganicFunction, number> = {
  acido_carboxilico: 16,
  anidrido: 15,
  ester: 14,
  haleto_acila: 13,
  amida: 12,
  nitrila: 11,
  aldeido: 10,
  cetona: 9,
  alcool: 8,
  enol: 7,
  fenol: 6,
  amina: 5,
  eter: 4,
  haleto_alquila: 3,
  nitrocomposto: 2,
  hidrocarboneto: 1,
};

/**
 * Subordinated functional radicals and their mapping
 */
export interface FunctionalRadicalMapping {
  prefix: string; // e.g. 'hidroxi', 'oxo', 'amino', 'cloro'
  principalFunction: OrganicFunction;
  ptBRLabel: string;
}

export const SUBORDINATED_RADICALS: Record<string, OrganicFunction> = {
  carboxi: 'acido_carboxilico',
  acetoxi: 'ester',
  alcoxicarbonil: 'ester',
  metoxicarbonil: 'ester',
  etoxicarbonil: 'ester',
  carbamoil: 'amida',
  acetamido: 'amida',
  ciano: 'nitrila',
  formil: 'aldeido',
  oxo: 'cetona', // Can also represent aldehyde inside chain
  hidroxi: 'alcool',
  amino: 'amina',
  dimetilamino: 'amina',
  metoxi: 'eter',
  etoxi: 'eter',
  isopropoxi: 'eter',
  propoxi: 'eter',
  fenoxi: 'eter',
  fluor: 'haleto_alquila',
  cloro: 'haleto_alquila',
  bromo: 'haleto_alquila',
  iodo: 'haleto_alquila',
  nitro: 'nitrocomposto',
};

/**
 * Substituent node in the AST
 */
export interface SubstituentNode {
  locants: (number | string)[]; // e.g. [2], [2, 3], ['N'], ['N', 3]
  multiplier?: number; // 1 = mono, 2 = di, 3 = tri, 4 = tetra
  type: 'simple_alkyl' | 'functional_substituent' | 'complex_radical';
  name: string; // 'metil', 'hidroxi', 'oxo', 'cloro', '(2-aminoetil)'
  subordinateFunction?: OrganicFunction;
  nestedRadical?: {
    subLocants: (number | string)[];
    subFunction?: OrganicFunction;
    alkylBase: string;
  };
}

/**
 * Bond saturation type and locants
 */
export interface BondNode {
  type: 'an' | 'en' | 'in' | 'dien' | 'diin' | 'trien';
  locants?: number[];
}

/**
 * Master IUPAC Name AST
 */
export interface IUPACNameAST {
  isSpecialPrefix?: 'acido' | 'anidrido' | 'eter';
  isRing: boolean;
  ringType?: 'ciclo' | 'benzeno' | 'naftaleno';
  substituents: SubstituentNode[];
  mainChainPrefix: string; // 'met', 'et', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'
  carbonCount: number;
  bonds: BondNode[];
  functionSuffix: string; // 'o', 'ol', 'al', 'ona', 'oico', 'oato', 'amina', 'amida', 'nitrila', 'oila'
  primaryFunction?: OrganicFunction;
  esterAlkylPart?: string; // e.g. 'etila' in 'etanoato de etila'
  acylHalideHalogen?: string; // e.g. 'cloreto' in 'cloreto de etanoila'
  nitrogenSubstituents?: string[];
  rawNormalized: string;
}

/**
 * Granular Partial Credit Breakdown
 */
export interface PartialCreditBreakdown {
  functionScore: number; // 0 to 1 (weight 35%)
  chainScore: number; // 0 to 1 (weight 25%)
  bondScore: number; // 0 to 1 (weight 20%)
  radicalScore: number; // 0 to 1 (weight 20%)
}

/**
 * Evaluation Result
 */
export interface EvaluationResult {
  score: number; // 0 to 1
  isPerfect: boolean; // score >= 0.98
  partialCreditBreakdown: PartialCreditBreakdown;
  feedbackMessages: string[];
  priorityInversionDetected: boolean;
  detectedInversionDetails?: string;
  parsedUserAST?: IUPACNameAST;
  parsedTargetAST?: IUPACNameAST;
  acceptedSynonymMatched?: boolean;
}

/**
 * Difficulty tiers for game questions
 */
export type DifficultyTier = 'iniciante' | 'intermediario' | 'avancado' | 'caos';

/**
 * Canonical Molecule Data Record
 */
export interface Molecule {
  id: string;
  smiles: string;
  iupacName: string;
  commonNames: string[];
  primaryFunction: OrganicFunction;
  secondaryFunctions: OrganicFunction[];
  difficulty: DifficultyTier;
  formula: string;
  realWorldStory: string;
  educationalContext: string;
}

export const MoleculeSchema = z.object({
  id: z.string(),
  smiles: z.string(),
  iupacName: z.string(),
  commonNames: z.array(z.string()),
  primaryFunction: OrganicFunctionSchema,
  secondaryFunctions: z.array(OrganicFunctionSchema),
  difficulty: z.enum(['iniciante', 'intermediario', 'avancado', 'caos']),
  formula: z.string(),
  realWorldStory: z.string(),
  educationalContext: z.string(),
});
