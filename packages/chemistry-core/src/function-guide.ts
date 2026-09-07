/**
 * packages/chemistry-core/src/function-guide.ts
 *
 * Canonical pt-BR nomenclature guide for the 16 organic functions of
 * `funcoes.pdf`. Powers the "Caça-Funções" game mode, where the student must
 * identify which functions a molecule contains and then state *how* each one is
 * named (aldeído → termina em "-al", cetona → "-ona", and so on).
 */

import type { OrganicFunction } from './types.js';
import { normalizeIUPACName } from './normalizer.js';

/**
 * How a function shows up in a name: as the suffix (when it is the principal
 * group), as a prefix (when it loses the priority contest), or by a fixed
 * template like "cloreto de …oíla".
 */
export interface FunctionNomenclature {
  id: OrganicFunction;
  label: string;
  /** Short symbol shown on chips, e.g. "-CHO". */
  groupSymbol: string;
  /** Suffix used when this is the principal function ("-al", "-ona", ...). */
  suffix: string;
  /** Prefix used when a higher-priority function wins ("oxo-", "hidroxi-", ...). */
  prefix: string | null;
  /** Fixed naming template when the function is not built from a plain suffix. */
  template: string | null;
  /** IUPAC seniority, 16 = highest. */
  priority: number;
  /** One-line recognition rule for a high-school student. */
  recognition: string;
  /** Mnemonic that makes the suffix stick. */
  mnemonic: string;
  /** Canonical worked example. */
  example: { name: string; smiles: string; commonName: string };
  /**
   * Every spelling accepted when the student is asked how the function is named.
   * Compared after accent/punctuation normalisation.
   */
  acceptedAnswers: string[];
}

export const FUNCTION_GUIDE: Record<OrganicFunction, FunctionNomenclature> = {
  acido_carboxilico: {
    id: 'acido_carboxilico',
    label: 'Ácido carboxílico',
    groupSymbol: '-COOH',
    suffix: '-oico',
    prefix: 'carboxi-',
    template: 'ácido …oico',
    priority: 16,
    recognition: 'Carbonila (C=O) e hidroxila (-OH) no MESMO carbono, sempre na ponta da cadeia.',
    mnemonic: 'É o rei da fila: ganha de todo mundo e ainda leva a palavra "ácido" na frente.',
    example: { name: 'ácido etanoico', smiles: 'CC(=O)O', commonName: 'ácido acético (vinagre)' },
    acceptedAnswers: ['oico', 'acido oico', 'acido -oico', '-oico', 'ico', 'acido ico', 'carboxi'],
  },
  anidrido: {
    id: 'anidrido',
    label: 'Anidrido',
    groupSymbol: '-CO-O-CO-',
    suffix: '-oico',
    prefix: null,
    template: 'anidrido …oico',
    priority: 15,
    recognition: 'Dois grupos carbonila ligados pelo mesmo oxigênio: C(=O)-O-C(=O).',
    mnemonic: 'São dois ácidos que perderam uma água ("an-idro" = sem água).',
    example: { name: 'anidrido etanoico', smiles: 'CC(=O)OC(=O)C', commonName: 'anidrido acético' },
    acceptedAnswers: ['anidrido', 'anidrido oico', 'anidrido -oico'],
  },
  ester: {
    id: 'ester',
    label: 'Éster',
    groupSymbol: '-COO-',
    suffix: '-oato',
    prefix: 'alcoxicarbonil-',
    template: '…oato de …ila',
    priority: 14,
    recognition: 'Carbonila ligada a um oxigênio que continua em outro carbono: C(=O)-O-C.',
    mnemonic: '"oato de ila" — é o cheiro das frutas e da essência de banana.',
    example: { name: 'etanoato de etila', smiles: 'CCOC(=O)C', commonName: 'acetato de etila' },
    acceptedAnswers: ['oato', '-oato', 'oato de ila', 'oato de', 'ato'],
  },
  haleto_acila: {
    id: 'haleto_acila',
    label: 'Haleto de acila',
    groupSymbol: '-COX',
    suffix: '-oíla',
    prefix: null,
    template: 'cloreto de …oíla',
    priority: 13,
    recognition: 'Carbonila ligada diretamente a um halogênio (F, Cl, Br, I).',
    mnemonic: 'Halogênio grudado na carbonila: "cloreto de etanoíla".',
    example: { name: 'cloreto de etanoíla', smiles: 'CC(=O)Cl', commonName: 'cloreto de acetila' },
    acceptedAnswers: ['oila', 'oíla', '-oila', 'cloreto de oila', 'haleto de oila', 'eto de oila'],
  },
  amida: {
    id: 'amida',
    label: 'Amida',
    groupSymbol: '-CONH₂',
    suffix: '-amida',
    prefix: 'carbamoil-',
    template: null,
    priority: 12,
    recognition: 'Carbonila (C=O) ligada diretamente a um nitrogênio.',
    mnemonic: 'Carbonila + nitrogênio = amida. É a ligação que monta as proteínas.',
    example: { name: 'etanamida', smiles: 'CC(=O)N', commonName: 'acetamida' },
    acceptedAnswers: ['amida', '-amida'],
  },
  nitrila: {
    id: 'nitrila',
    label: 'Nitrila',
    groupSymbol: '-C≡N',
    suffix: '-nitrila',
    prefix: 'ciano-',
    template: '…onitrila',
    priority: 11,
    recognition: 'Carbono ligado ao nitrogênio por ligação TRIPLA.',
    mnemonic: 'Tripla com N = nitrila. O carbono da tripla conta na cadeia!',
    example: { name: 'etanonitrila', smiles: 'CC#N', commonName: 'acetonitrila' },
    acceptedAnswers: ['nitrila', '-nitrila', 'onitrila', 'ciano'],
  },
  aldeido: {
    id: 'aldeido',
    label: 'Aldeído',
    groupSymbol: '-CHO',
    suffix: '-al',
    prefix: 'oxo- / formil-',
    template: null,
    priority: 10,
    recognition: 'Carbonila (C=O) na PONTA da cadeia, com hidrogênio preso nela.',
    mnemonic: 'AldeÍdo termina em -AL. Carbonila na ponta = -al.',
    example: { name: 'etanal', smiles: 'CC=O', commonName: 'acetaldeído' },
    acceptedAnswers: ['al', '-al', 'termina em al', 'sufixo al'],
  },
  cetona: {
    id: 'cetona',
    label: 'Cetona',
    groupSymbol: '-CO-',
    suffix: '-ona',
    prefix: 'oxo-',
    template: null,
    priority: 9,
    recognition: 'Carbonila (C=O) NO MEIO da cadeia, entre dois carbonos.',
    mnemonic: 'CetONA termina em -ONA. Carbonila no meio = -ona.',
    example: { name: 'propanona', smiles: 'CC(=O)C', commonName: 'acetona' },
    acceptedAnswers: ['ona', '-ona', 'termina em ona', 'sufixo ona'],
  },
  alcool: {
    id: 'alcool',
    label: 'Álcool',
    groupSymbol: '-OH',
    suffix: '-ol',
    prefix: 'hidroxi-',
    template: null,
    priority: 8,
    recognition: 'Hidroxila (-OH) ligada a carbono SATURADO (sp³).',
    mnemonic: 'ÁlcoOL termina em -OL. Etanol, metanol, propanol.',
    example: { name: 'etanol', smiles: 'CCO', commonName: 'álcool etílico' },
    acceptedAnswers: ['ol', '-ol', 'termina em ol', 'sufixo ol'],
  },
  enol: {
    id: 'enol',
    label: 'Enol',
    groupSymbol: '=C-OH',
    suffix: '-ol',
    prefix: 'hidroxi-',
    template: '…en…ol',
    priority: 7,
    recognition: 'Hidroxila (-OH) presa a um carbono que faz ligação DUPLA (sp²).',
    mnemonic: 'EN (dupla) + OL (hidroxila) = ENOL. O nome já é a definição.',
    example: { name: 'etenol', smiles: 'C=CO', commonName: 'álcool vinílico' },
    acceptedAnswers: ['ol', '-ol', 'enol', 'en ol', 'enol', 'termina em ol'],
  },
  fenol: {
    id: 'fenol',
    label: 'Fenol',
    groupSymbol: 'Ar-OH',
    suffix: '-ol',
    prefix: 'hidroxi-',
    template: 'hidroxibenzeno / …fenol',
    priority: 6,
    recognition: 'Hidroxila (-OH) presa DIRETAMENTE ao anel aromático.',
    mnemonic: 'OH no benzeno = fenol. Se sair do anel, vira álcool.',
    example: { name: 'hidroxibenzeno', smiles: 'Oc1ccccc1', commonName: 'fenol' },
    acceptedAnswers: ['ol', '-ol', 'fenol', 'hidroxibenzeno', 'hidroxi'],
  },
  amina: {
    id: 'amina',
    label: 'Amina',
    groupSymbol: '-NH₂',
    suffix: '-amina',
    prefix: 'amino-',
    template: null,
    priority: 5,
    recognition: 'Nitrogênio ligado só a carbonos e/ou hidrogênios — SEM carbonila do lado.',
    mnemonic: 'Nitrogênio sozinho = amina. Com C=O do lado, vira amida.',
    example: { name: 'etanamina', smiles: 'CCN', commonName: 'etilamina' },
    acceptedAnswers: ['amina', '-amina'],
  },
  eter: {
    id: 'eter',
    label: 'Éter',
    groupSymbol: '-O-',
    suffix: '-oxi',
    prefix: 'alcoxi- (metoxi-, etoxi-)',
    template: '…oxi…ano',
    priority: 4,
    recognition: 'Oxigênio ENTRE dois carbonos, sem nenhuma carbonila.',
    mnemonic: 'O menor lado vira "-oxi" e o maior vira a cadeia: metoxietano.',
    example: { name: 'metoxietano', smiles: 'COCC', commonName: 'éter metil-etílico' },
    acceptedAnswers: ['oxi', '-oxi', 'oxi ano', 'metoxi', 'etoxi', 'alcoxi'],
  },
  haleto_alquila: {
    id: 'haleto_alquila',
    label: 'Haleto de alquila',
    groupSymbol: '-X',
    suffix: 'prefixo fixo',
    prefix: 'fluor- / cloro- / bromo- / iodo-',
    template: 'cloro…ano',
    priority: 3,
    recognition: 'Halogênio (F, Cl, Br, I) ligado a carbono SATURADO.',
    mnemonic: 'Halogênio nunca vira sufixo: é sempre prefixo — 2-clorobutano.',
    example: { name: '2-clorobutano', smiles: 'CCC(Cl)C', commonName: 'cloreto de sec-butila' },
    acceptedAnswers: ['cloro', 'bromo', 'iodo', 'fluor', 'prefixo', 'halogenio como prefixo', 'cloro bromo iodo fluor'],
  },
  nitrocomposto: {
    id: 'nitrocomposto',
    label: 'Nitrocomposto',
    groupSymbol: '-NO₂',
    suffix: 'prefixo fixo',
    prefix: 'nitro-',
    template: 'nitro…ano',
    priority: 2,
    recognition: 'Grupo -NO₂: nitrogênio com DOIS oxigênios, preso ao carbono.',
    mnemonic: 'Sempre prefixo "nitro-". Nitroglicerina, TNT, nitrometano.',
    example: { name: 'nitrometano', smiles: 'C[N+](=O)[O-]', commonName: 'nitrometano' },
    acceptedAnswers: ['nitro', 'nitro-', 'prefixo nitro'],
  },
  hidrocarboneto: {
    id: 'hidrocarboneto',
    label: 'Hidrocarboneto',
    groupSymbol: 'C e H',
    suffix: '-o',
    prefix: null,
    template: '…ano / …eno / …ino',
    priority: 1,
    recognition: 'Só carbono e hidrogênio, nenhum outro elemento.',
    mnemonic: 'ANO (simples), ENO (dupla), INO (tripla). A base de tudo.',
    example: { name: 'butano', smiles: 'CCCC', commonName: 'gás de isqueiro' },
    acceptedAnswers: ['o', '-o', 'ano', '-ano', 'eno', 'ino', 'ano eno ino', 'ano/eno/ino'],
  },
};

/** All 16 functions ordered from highest to lowest IUPAC seniority. */
export const FUNCTIONS_BY_PRIORITY: FunctionNomenclature[] = Object.values(FUNCTION_GUIDE).sort(
  (a, b) => b.priority - a.priority
);

/** Strips accents, punctuation and filler words so free-text answers can match. */
function normalizeAnswer(raw: string): string {
  return normalizeIUPACName(raw)
    .replace(/\b(sufixo|prefixo|termina|terminacao|terminacao|em|com|no|na|o|a|de|do|da|final|nome)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export interface NomenclatureCheck {
  correct: boolean;
  /** The canonical answer, always returned so the UI can teach on a miss. */
  expected: string;
  /** Which accepted spelling matched, when correct. */
  matched?: string;
  /** True when the answer is close but not exact (one edit away). */
  isNearMiss: boolean;
}

/** Levenshtein distance, capped for speed — used only for near-miss feedback. */
function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = temp;
    }
  }
  return prev[b.length];
}

/**
 * Checks a free-text answer to "how is this function named?".
 * Accepts "-al", "al", "sufixo -al", "termina em AL", etc.
 */
export function checkNomenclatureAnswer(
  fn: OrganicFunction,
  answer: string
): NomenclatureCheck {
  const guide = FUNCTION_GUIDE[fn];
  const expected = guide.template ?? guide.suffix;
  const normalized = normalizeAnswer(answer);

  if (!normalized) {
    return { correct: false, expected, isNearMiss: false };
  }

  const candidates = guide.acceptedAnswers.map(normalizeAnswer).filter(Boolean);

  for (const candidate of candidates) {
    if (normalized === candidate) {
      return { correct: true, expected, matched: candidate, isNearMiss: false };
    }
  }
  // A longer sentence that contains the exact suffix token still counts.
  const tokens = new Set(normalized.split(' '));
  for (const candidate of candidates) {
    if (!candidate.includes(' ') && tokens.has(candidate)) {
      return { correct: true, expected, matched: candidate, isNearMiss: false };
    }
  }

  const isNearMiss = candidates.some(candidate => editDistance(normalized, candidate) === 1);
  return { correct: false, expected, isNearMiss };
}

/**
 * Grades a "which functions are in this molecule?" answer against the truth,
 * rewarding partial hits and penalising guesses that were not there.
 */
export interface FunctionHuntGrade {
  correctPicks: OrganicFunction[];
  missed: OrganicFunction[];
  wrongPicks: OrganicFunction[];
  /** 0 to 1. */
  score: number;
  isPerfect: boolean;
}

export function gradeFunctionHunt(
  selected: readonly OrganicFunction[],
  actual: readonly OrganicFunction[]
): FunctionHuntGrade {
  const actualSet = new Set(actual);
  const selectedSet = new Set(selected);

  const correctPicks = [...selectedSet].filter(f => actualSet.has(f));
  const missed = [...actualSet].filter(f => !selectedSet.has(f));
  const wrongPicks = [...selectedSet].filter(f => !actualSet.has(f));

  const total = actualSet.size || 1;
  const raw = (correctPicks.length - wrongPicks.length * 0.5) / total;
  const score = Math.max(0, Math.min(1, raw));

  return {
    correctPicks,
    missed,
    wrongPicks,
    score,
    isPerfect: missed.length === 0 && wrongPicks.length === 0 && correctPicks.length > 0,
  };
}
