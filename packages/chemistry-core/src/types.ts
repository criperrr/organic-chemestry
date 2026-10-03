import { z } from 'zod';

/**
 * The organic functions the app teaches: the 16 of funcoes.pdf plus the
 * sulfur functions of the Brazilian high-school curriculum (tiol, tioéter,
 * dissulfeto, ácido sulfônico).
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
  | 'anidrido'
  | 'tiol'
  | 'tioeter'
  | 'dissulfeto'
  | 'acido_sulfonico';

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
  'tiol',
  'tioeter',
  'dissulfeto',
  'acido_sulfonico',
]);

/**
 * IUPAC priority order ranking (higher number = higher priority), after the
 * class seniority of P-41: sulfonic acids rank right below carboxylic acids,
 * thiols (the sulfur analogues of alcohols) right below alcohols and phenols,
 * and sulfides/disulfides right below ethers.
 *
 * Carboxylic Acid > Sulfonic Acid > Anhydride > Ester > Acyl Halide > Amide >
 * Nitrile > Aldehyde > Ketone > Alcohol > Enol > Phenol > Thiol > Amine >
 * Ether > Sulfide > Disulfide > Halide > Nitro > Hydrocarbon
 */
export const IUPAC_PRIORITY_ORDER: Record<OrganicFunction, number> = {
  acido_carboxilico: 20,
  acido_sulfonico: 19,
  anidrido: 18,
  ester: 17,
  haleto_acila: 16,
  amida: 15,
  nitrila: 14,
  aldeido: 13,
  cetona: 12,
  alcool: 11,
  enol: 10,
  fenol: 9,
  tiol: 8,
  amina: 7,
  eter: 6,
  tioeter: 5,
  dissulfeto: 4,
  haleto_alquila: 3,
  nitrocomposto: 2,
  hidrocarboneto: 1,
};

/** Number of functions taught, for UI copy that used to hard-code "16". */
export const ORGANIC_FUNCTION_COUNT = OrganicFunctionSchema.options.length;

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
  sulfo: 'acido_sulfonico',
  sulfanil: 'tiol',
  mercapto: 'tiol',
  metilsulfanil: 'tioeter',
  etilsulfanil: 'tioeter',
  propilsulfanil: 'tioeter',
  fenilsulfanil: 'tioeter',
  metildissulfanil: 'dissulfeto',
  etildissulfanil: 'dissulfeto',
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

/**
 * Supported chemical elements in 2D skeletal representation
 */
export type AtomElement = 'C' | 'O' | 'N' | 'F' | 'Cl' | 'Br' | 'I' | 'S' | 'P' | 'H' | 'Na' | 'K';

/**
 * Covalent bond orders
 */
export type BondOrder = 1 | 2 | 3;

/**
 * Bond rendering styles
 */
export type BondStyle = 'solid' | 'wedge' | 'dash';

/**
 * Atom Vertex Node in the 2D Molecular Graph
 */
export interface AtomNode {
  readonly id: string;
  element: AtomElement;
  x: number;
  y: number;
  charge: number;
  implicitH: number;
  /**
   * Hydrogen count stated explicitly by the source notation ([nH], [CH3]).
   * When present it is authoritative and overrides the valence estimate — the
   * pyrrole nitrogen carries an H that no valence rule can infer, because its
   * lone pair, not a pi bond, completes the aromatic sextet.
   */
  explicitHCount?: number;
  aromatic?: boolean;
  inRing?: boolean;
  ringIds?: number[];
  hybridization?: 'sp3' | 'sp2' | 'sp';
}

/**
 * Bond Edge in the 2D Molecular Graph
 */
export interface BondEdge {
  readonly id: string;
  source: string; // AtomNode id
  target: string; // AtomNode id
  order: BondOrder;
  style?: BondStyle;
  /**
   * Configuration marker carried by the "/" and "\\" of a SMILES single bond.
   * It says which side of the neighbouring double bond this bond leaves from,
   * and is what the E/Z assignment reads.
   */
  direction?: 'up' | 'down';
  aromatic?: boolean;
  inRing?: boolean;
}

/**
 * Serialized Molecular Graph Data
 */
export interface MolecularGraphData {
  atoms: AtomNode[];
  bonds: BondEdge[];
}

