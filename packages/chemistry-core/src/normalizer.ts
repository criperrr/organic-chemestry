/**
 * Normalization utilities for pt-BR IUPAC organic chemical nomenclature.
 * Handles diacritics, hyphenation, case-folding, spacing, and IUPAC 1993 vs 2013 locants.
 */

/**
 * Strips diacritical accents from a string while preserving characters.
 * e.g., 'ácido' -> 'acido', 'hidróxi' -> 'hidroxi', 'butanoico' -> 'butanoico'.
 */
export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Cleans punctuation, unicode dashes, and extra whitespace.
 */
export function normalizeHyphensAndPunctuation(str: string): string {
  return (
    str
      // Convert unicode hyphens and dashes to standard ASCII hyphen
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
      // Remove spaces around hyphens and commas
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*,\s*/g, ',')
      // Collapse multiple hyphens to single hyphen
      .replace(/-+/g, '-')
      // Insert hyphen between digit and letter (e.g. 2metil -> 2-metil)
      .replace(/(\d)([a-zA-Z])/g, '$1-$2')
      .replace(/-+/g, '-')
      // Remove spaces around parentheses
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      // Collapse multiple spaces to single space
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Normalizes 'ciclo' prefix variations:
 * e.g., 'ciclo-hexano' -> 'ciclohexano', 'ciclo-butano' -> 'ciclobutano'.
 */
export function normalizeCiclo(str: string): string {
  return str
    .replace(/\bciclo-([a-z])/gi, 'ciclo$1')
    .replace(/\bcicloex/gi, 'ciclohex');
}

/**
 * Normalizes hyphen rules for Novo Acordo Ortográfico:
 * Handles hyphen before 'h' (e.g., 'metil-hexano' -> 'metilhexano', 'etil-heptano' -> 'etilheptano')
 * and tolerates pre-acordo / suppressed 'h' forms ('metilexano' -> 'metilhexano').
 */
export function normalizeHyphenBeforeH(str: string): string {
  return str
    .replace(/([a-z])-([hH][a-z])/gi, '$1$2')
    .replace(/([^h\W])ex(an|en|in)/gi, '$1hex$2');
}

/**
 * Standardizes common radical abbreviations:
 * e.g., 's-butil' -> 'sec-butil', 't-butil' -> 'terc-butil'.
 */
export function normalizeRadicals(str: string): string {
  return str
    .replace(/\bs-butil\b/gi, 'sec-butil')
    .replace(/\bsecbutil\b/gi, 'sec-butil')
    .replace(/\bt-butil\b/gi, 'terc-butil')
    .replace(/\btercbutil\b/gi, 'terc-butil')
    .replace(/\bi-propil\b/gi, 'isopropil')
    .replace(/\biso-propil\b/gi, 'isopropil')
    .replace(/\bi-butil\b/gi, 'isobutil')
    .replace(/\biso-butil\b/gi, 'isobutil');
}

const STEMS = 'met|et|prop|but|pent|hex|hept|oct|non|dec|undec|dodec';

function formatPrefix(
  prefix: string | undefined,
  sep: string | undefined,
  stem: string
): string {
  if (!prefix) return '';
  if (sep === ' ') return `${prefix} `;
  if (stem.startsWith('h')) return `${prefix}-`;
  return prefix;
}

/**
 * Converts IUPAC 1993 locant placements (locant before stem) to IUPAC 2013 (locant before infix/suffix).
 * Examples:
 * - '2-buteno' -> 'but-2-eno'
 * - '1,3-butadieno' -> 'buta-1,3-dieno'
 * - '2-butanol' -> 'butan-2-ol'
 * - '2-butanona' -> 'butan-2-ona'
 * - '1,2-etanodiol' -> 'etano-1,2-diol'
 * - '3-metil-1-butanol' -> '3-metilbutan-1-ol'
 * - 'ácido 2-butenoico' -> 'ácido but-2-enoico'
 */
export function convert1993To2013(str: string): string {
  let res = str;

  // Pattern: (prefix-)?locants-(ciclo)?stem(dieno|diino|trieno)
  // e.g., '1,3-butadieno' -> 'buta-1,3-dieno'
  // e.g., '3-metil-1,3-butadieno' -> '3-metilbuta-1,3-dieno'
  // e.g., 'acido 1,3-butadienoico' -> 'acido buta-1,3-dienoico'
  const polyeneRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))a?(dieno|diino|trieno|diin|trien|dienoico|diinoico|trienoico|dienal|dienona)(\\s+de\\s+[a-z]+)?$`,
    'i'
  );
  res = res.replace(
    polyeneRegex,
    (_match, prefix, sep, locants, stem, infixSuffix, ester) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}a-${locants}-${infixSuffix}${ester || ''}`;
    }
  );

  // Pattern: (prefix-)?locant-(ciclo)?stem(eno|ino)
  // e.g., '2-buteno' -> 'but-2-eno'
  // e.g., '4-cloro-2-penteno' -> '4-cloropent-2-eno'
  // e.g., 'acido 2-butenoico' -> 'acido but-2-enoico'
  // e.g., '2-butenoato de etila' -> 'but-2-enoato de etila'
  const monoeneRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))(eno|ino|enoico|inoico|enoato|inoato|enal|enona|enamida|enamina|enonitrila|enol)(\\s+de\\s+[a-z]+)?$`,
    'i'
  );
  res = res.replace(
    monoeneRegex,
    (_match, prefix, sep, locants, stem, infixSuffix, ester) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}-${locants}-${infixSuffix}${ester || ''}`;
    }
  );

  // Pattern: (prefix-)?locants-(ciclo)?steman(ol|ona)
  // e.g., '2-butanol' -> 'butan-2-ol'
  // e.g., '3-metil-1-butanol' -> '3-metilbutan-1-ol'
  // e.g., '2-butanona' -> 'butan-2-ona'
  const anolOnaRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))an(ol|ona|oico)(\\s+de\\s+[a-z]+)?$`,
    'i'
  );
  res = res.replace(
    anolOnaRegex,
    (_match, prefix, sep, locants, stem, suffix, ester) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}an-${locants}-${suffix}${ester || ''}`;
    }
  );

  // Pattern: (prefix-)?locants-(ciclo)?stemano(diol|triol|diona)
  // e.g., '1,2-etanodiol' -> 'etano-1,2-diol'
  const diolRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))ano(diol|triol|diona|triona)(\\s+de\\s+[a-z]+)?$`,
    'i'
  );
  res = res.replace(
    diolRegex,
    (_match, prefix, sep, locants, stem, suffix, ester) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}ano-${locants}-${suffix}${ester || ''}`;
    }
  );

  return res;
}

/**
 * Strips stereochemical and geometric descriptors:
 * e.g., '(2E)-', '(2Z)-', '(E)-', '(Z)-', 'cis-', 'trans-', '(R)-', '(S)-'.
 * Also handles prefixes like 'ácido (E)-' -> 'ácido '.
 */
export function stripStereoPrefixes(str: string): string {
  if (!str) return '';
  return str
    .replace(/^(\([0-9a-z, -]+\)|[ezrs]-|cis-|trans-)\s*-?/gi, '')
    .replace(/\b(acido|anidrido)\s+(\([0-9a-z, -]+\)|[ezrs]-|cis-|trans-)\s*-?/gi, '$1 ')
    .trim();
}

/**
 * Full master normalization for IUPAC names in pt-BR.
 */
export function normalizeIUPACName(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let normalized = input.toLowerCase();
  normalized = stripDiacritics(normalized);
  normalized = normalizeHyphensAndPunctuation(normalized);
  normalized = normalizeCiclo(normalized);
  normalized = normalizeHyphenBeforeH(normalized);
  normalized = normalizeRadicals(normalized);
  normalized = convert1993To2013(normalized);

  return normalized.trim();
}
