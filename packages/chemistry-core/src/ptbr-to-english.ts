/**
 * packages/chemistry-core/src/ptbr-to-english.ts
 *
 * Translates the pt-BR IUPAC names this engine emits into their English
 * equivalents, so they can be fed to OPSIN (name -> structure) and round-tripped
 * against the original molecule. OPSIN only understands English, and no
 * Portuguese nomenclature corpus exists, so this bridge is what makes automated
 * correctness testing possible at all.
 *
 * The translation is a single left-to-right pass over an ordered morpheme table.
 * A single pass matters: replacements must never cascade, or "metil" -> "methyl"
 * would then be re-read by the "et" -> "eth" rule and become "meththyl".
 */

/**
 * Morpheme table. Keys are Portuguese fragments, values their English form.
 * Longest keys are matched first, so "onitrila" wins over "nitrila", and
 * "piperidina" wins over "piperidin".
 */
const MORPHEMES: Record<string, string> = {
  // --- Retained heterocycle names -----------------------------------------
  '1,4-dioxano': '1,4-dioxane',
  dioxano: 'dioxane',
  piperazina: 'piperazine',
  piperazin: 'piperazin',
  piridazina: 'pyridazine',
  piridazin: 'pyridazin',
  pirimidina: 'pyrimidine',
  pirimidin: 'pyrimidin',
  pirrolidina: 'pyrrolidine',
  pirrolidin: 'pyrrolidin',
  piperidina: 'piperidine',
  piperidin: 'piperidin',
  morfolina: 'morpholine',
  morfolin: 'morpholin',
  aziridina: 'aziridine',
  aziridin: 'aziridin',
  azetidina: 'azetidine',
  azetidin: 'azetidin',
  pirazina: 'pyrazine',
  pirazin: 'pyrazin',
  piridina: 'pyridine',
  piridin: 'pyridin',
  oxolano: 'oxolane',
  oxolan: 'oxolan',
  oxirano: 'oxirane',
  oxiran: 'oxiran',
  oxetano: 'oxetane',
  oxetan: 'oxetan',
  tiolano: 'thiolane',
  tiirano: 'thiirane',
  imidazol: 'imidazole',
  pirazol: 'pyrazole',
  tiofeno: 'thiophene',
  furano: 'furan',
  pirrol: 'pyrrole',
  oxano: 'oxane',
  oxan: 'oxan',
  tiano: 'thiane',

  // --- Aromatic and ring parents ------------------------------------------
  naftaleno: 'naphthalene',
  naftalen: 'naphthalen',
  benzeno: 'benzene',
  benzen: 'benzen',
  'benzoíla': 'benzoyl',
  benzoico: 'benzoic',
  fenol: 'phenol',
  'ciclo-': 'cyclo',
  ciclo: 'cyclo',

  // --- Ring-attached functional forms --------------------------------------
  'carbaldeído': 'carbaldehyde',
  'carboxílico': 'carboxylic',
  carbonitrila: 'carbonitrile',
  carboxamida: 'carboxamide',
  carbonila: 'carbonyl',

  // --- Substituent prefixes -------------------------------------------------
  'terc-butil': 'tert-butyl',
  'sec-butil': 'sec-butyl',
  isopropil: 'isopropyl',
  isobutil: 'isobutyl',
  neopentil: 'neopentyl',
  carbamoil: 'carbamoyl',
  formil: 'formyl',
  carboxi: 'carboxy',
  hidroxi: 'hydroxy',
  amino: 'amino',
  ciano: 'cyano',
  nitro: 'nitro',
  oxo: 'oxo',
  isopropoxi: 'isopropoxy',
  benziloxi: 'benzyloxy',
  metoxi: 'methoxy',
  etoxi: 'ethoxy',
  propoxi: 'propoxy',
  butoxi: 'butoxy',
  fenoxi: 'phenoxy',
  fluor: 'fluoro',
  cloro: 'chloro',
  bromo: 'bromo',
  iodo: 'iodo',
  benzil: 'benzyl',
  fenil: 'phenyl',
  metil: 'methyl',
  etil: 'ethyl',
  propil: 'propyl',
  butil: 'butyl',
  pentil: 'pentyl',
  hexil: 'hexyl',
  heptil: 'heptyl',
  octil: 'octyl',
  nonil: 'nonyl',
  decil: 'decyl',

  // --- Multiplying prefixes -------------------------------------------------
  tetraquis: 'tetrakis',
  tris: 'tris',
  bis: 'bis',
  tetra: 'tetra',
  penta: 'penta',
  hexa: 'hexa',
  hepta: 'hepta',
  octa: 'octa',
  tri: 'tri',
  di: 'di',

  // --- Suffixes (longest first) ---------------------------------------------
  // Portuguese links the parent to a multiplied suffix with "o"; English keeps
  // the hydride's final "e": propanodinitrila -> propanedinitrile.
  onitrila: 'enitrile',
  nitrila: 'nitrile',
  amida: 'amide',
  amina: 'amine',
  'oíla': 'oyl',
  benzoato: 'benzoate',
  carboxilato: 'carboxylate',
  oato: 'oate',
  oico: 'oic',
  ona: 'one',
  ano: 'ane',
  eno: 'ene',
  ino: 'yne',
  ila: 'yl',
  il: 'yl',
  an: 'an',
  en: 'en',
  in: 'yn',
  ol: 'ol',
  al: 'al',

  // --- Stems ---------------------------------------------------------------
  undec: 'undec',
  dodec: 'dodec',
  hept: 'hept',
  pent: 'pent',
  prop: 'prop',
  met: 'meth',
  but: 'but',
  hex: 'hex',
  oct: 'oct',
  non: 'non',
  dec: 'dec',
  et: 'eth',
};

const MORPHEME_KEYS = Object.keys(MORPHEMES).sort((a, b) => b.length - a.length);

/** Characters that carry no morphology: locants, brackets, separators, italics. */
const SEPARATOR = /^[0-9,\-()\[\]'’ .N]+/;

/**
 * Splits a name into known morphemes, backtracking when a greedy choice leaves
 * an untranslatable remainder.
 *
 * Plain longest-match is not enough: in "pentano" the multiplying prefix
 * "penta" is longer than the stem "pent", but only the stem lets the rest of
 * the word ("ano") resolve. Backtracking picks the split that consumes the
 * whole string, and returns null when no split does — an honest "I cannot
 * translate this" beats emitting a plausible-looking wrong name.
 */
function tokenize(input: string): string[] | null {
  const memoFailed = new Set<number>();

  const walk = (position: number): string[] | null => {
    if (position === input.length) return [];
    if (memoFailed.has(position)) return null;

    const rest = input.slice(position);

    // Euphonic linker in "buta-1,3-dieno" — only ever before a locant. Allowing
    // a bare "a" anywhere lets "ciclopentanona" split as penta+non+a, which is
    // a valid token sequence and a completely wrong word.
    if (rest.startsWith('a-')) {
      const tail = walk(position + 1);
      if (tail) return ['a', ...tail];
    }

    const separator = rest.match(SEPARATOR);
    if (separator) {
      const tail = walk(position + separator[0].length);
      if (tail) return [separator[0], ...tail];
    }

    for (const key of MORPHEME_KEYS) {
      if (!rest.startsWith(key)) continue;
      const tail = walk(position + key.length);
      if (tail) return [MORPHEMES[key], ...tail];
    }

    memoFailed.add(position);
    return null;
  };

  return walk(0);
}

/** Translates a bare parent/substituent expression, with no wrapper words. */
function translateCore(core: string): string | null {
  const tokens = tokenize(core);
  return tokens ? tokens.join('') : null;
}

const HALIDE_WORDS: Record<string, string> = {
  cloreto: 'chloride',
  brometo: 'bromide',
  iodeto: 'iodide',
  fluoreto: 'fluoride',
};

/**
 * Converts a pt-BR IUPAC name to English.
 *
 * Returns `null` when the name uses a construction this bridge does not model,
 * so a caller can report "not translated" separately from "translated wrong" —
 * conflating the two would blame the naming engine for gaps in the translator.
 */
export function translateIupacToEnglish(ptName: string): string | null {
  const name = ptName.trim();
  if (!name) return null;

  // "cloreto de etanoíla" -> "ethanoyl chloride"
  const acylHalide = name.match(/^(cloreto|brometo|iodeto|fluoreto) de (.+)$/);
  if (acylHalide) {
    const acyl = translateCore(acylHalide[2]);
    return acyl ? `${acyl} ${HALIDE_WORDS[acylHalide[1]]}` : null;
  }

  // "ácido butanodioico" -> "butanedioic acid"
  const acid = name.match(/^ácido (.+)$/);
  if (acid) {
    const core = translateCore(acid[1]);
    return core ? `${core} acid` : null;
  }

  // "anidrido etanoico" -> "ethanoic anhydride"
  const anhydride = name.match(/^anidrido (.+)$/);
  if (anhydride) {
    // "anidrido etanoico e metanoico" -> "ethanoic methanoic anhydride"
    const halves = anhydride[1].split(' e ').map(translateCore);
    if (halves.some(half => half === null)) return null;
    return `${halves.join(' ')} anhydride`;
  }

  // "etanoato de etila" -> "ethyl ethanoate"
  const ester = name.match(/^(.+?) de (.+)$/);
  if (ester) {
    const alkyl = translateCore(ester[2].replace(/a$/, ''));
    const acyl = translateCore(ester[1]);
    return alkyl && acyl ? `${alkyl} ${acyl}` : null;
  }

  if (/ de /.test(name)) return null;

  return translateCore(name);
}
