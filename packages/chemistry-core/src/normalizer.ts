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

  // Pattern: (prefix-)?locants-(ciclo)?stemano(diol|triol|diona|tiol|sulfonico)
  // e.g., '1,2-etanodiol' -> 'etano-1,2-diol', '1-propanotiol' -> 'propano-1-tiol',
  // 'acido 1-propanossulfonico' -> 'acido propano-1-sulfonico' (the doubled s only
  // exists when nothing separates the vowel from the suffix)
  const diolRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))ano(diol|triol|diona|triona|tiol|ditiol|tritiol|s?sulfonico|dissulfonico)(\\s+de\\s+[a-z]+)?$`,
    'i'
  );
  res = res.replace(
    diolRegex,
    (_match, prefix, sep, locants, stem, suffix, ester) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}ano-${locants}-${suffix.replace(/^ss/, 's')}${ester || ''}`;
    }
  );

  // Pattern: (prefix-)?enelocants-stem(en|in)(o)?-suffixlocants-suffix, the old style
  // that keeps both sets of locants: '2-propen-1-ol' -> 'prop-2-en-1-ol',
  // '2-propeno-1-tiol' -> 'prop-2-eno-1-tiol'
  const splitRegex = new RegExp(
    `^(?:([a-z0-9(),' -]+?)([-\\s]))?([0-9,]+)-((?:ciclo)?(?:${STEMS}))(a?(?:di|tri)?(?:en|in))(o?)-([0-9,]+)-([a-z]+)$`,
    'i'
  );
  res = res.replace(
    splitRegex,
    (_match, prefix, sep, unsatLocants, stem, infix, linkO, suffixLocants, suffix) => {
      const p = formatPrefix(prefix, sep, stem);
      return `${p}${stem}-${unsatLocants}-${infix}${linkO}-${suffixLocants}-${suffix}`;
    }
  );

  return res;
}

/**
 * Folds the sulfur spellings Brazilian textbooks and exams use onto the IUPAC
 * 2013 form, so each is graded as the same name:
 * - 'mercapto' (retired by IUPAC, still common) -> 'sulfanil'
 * - 'metiltioetano', 'metil-tio-etano' -> 'metilsulfaniletano'; 'ditio' -> 'dissulfanil'
 * - '(metilsulfanil)etano' -> 'metilsulfaniletano' (the marks are optional here)
 * - 'butan-1-tiol', 'propan-2-sulfonico' (elided, as in UECE/UNIVAG) -> 'butano-1-tiol'
 * - 'metanosulfonico', 'benzeno-sulfonico' -> 'metanossulfonico', 'benzenossulfonico'
 */
export function normalizeSulfurSpellings(str: string): string {
  return str
    .replace(/mercapto/g, 'sulfanil')
    .replace(/([a-z]il)-?ditio-?(?=[a-z])/g, '$1dissulfanil')
    .replace(/([a-z]il)-?tio-?(?!l|fen)(?=[a-z])/g, '$1sulfanil')
    .replace(/\(([a-z]+sulfanil)\)/g, '$1')
    .replace(/an-([0-9,]+)-((?:di|tri)?(?:tiol|s?sulfon(?:ico|ato)))\b/g, 'ano-$1-$2')
    .replace(/([ae]n)o-?s?(sulfon(?:ico|ato))/g, '$1os$2');
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
  normalized = normalizeSulfurSpellings(normalized);
  normalized = convert1993To2013(normalized);

  return normalized.trim();
}
