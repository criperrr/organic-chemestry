import {
  OrganicFunction,
  SUBORDINATED_RADICALS,
} from './types.js';

export type TokenType =
  | 'SPECIAL_PREFIX'
  | 'RING_PREFIX'
  | 'CARBON_STEM'
  | 'INFIX'
  | 'SUFFIX'
  | 'RADICAL'
  | 'COMPLEX_RADICAL'
  | 'MULTIPLIER'
  | 'LOCANTS'
  | 'ESTER_DE'
  | 'ESTER_ALKYL'
  | 'PUNCTUATION'
  | 'UNKNOWN';

export interface IUPACToken {
  type: TokenType;
  value: string;
  metadata?: {
    multiplier?: number;
    subordinateFunction?: OrganicFunction;
    carbonCount?: number;
    locants?: (number | string)[];
    nestedRadical?: {
      subLocants: (number | string)[];
      subFunction?: OrganicFunction;
      alkylBase: string;
    };
  };
}

export const CARBON_STEM_MAP: Record<string, number> = {
  met: 1,
  et: 2,
  prop: 3,
  but: 4,
  pent: 5,
  hex: 6,
  hept: 7,
  oct: 8,
  non: 9,
  dec: 10,
  undec: 11,
  dodec: 12,
  tridec: 13,
  tetradec: 14,
  pentadec: 15,
  eicos: 20,
  benz: 6,
  benzen: 6,
  benzeno: 6,
  naftalen: 10,
  naftaleno: 10,
  fenol: 6,
  tolueno: 7,
  xileno: 8,
};

export const MULTIPLIER_MAP: Record<string, number> = {
  di: 2,
  tri: 3,
  tetra: 4,
  penta: 5,
  hexa: 6,
  hepta: 7,
  octa: 8,
  bis: 2,
  tris: 3,
  tetrakis: 4,
};

export const SUFFIX_FUNCTION_MAP: Record<string, OrganicFunction> = {
  oico: 'acido_carboxilico',
  dioico: 'acido_carboxilico',
  carboxilico: 'acido_carboxilico',
  oato: 'ester',
  oila: 'haleto_acila',
  amida: 'amida',
  diamida: 'amida',
  nitrila: 'nitrila',
  dinitrila: 'nitrila',
  al: 'aldeido',
  dial: 'aldeido',
  ona: 'cetona',
  diona: 'cetona',
  triona: 'cetona',
  ol: 'alcool',
  diol: 'alcool',
  triol: 'alcool',
  amina: 'amina',
  diamina: 'amina',
  fenol: 'fenol',
  o: 'hidrocarboneto',
};

export const SIMPLE_RADICALS = [
  'isopropil',
  'sec-butil',
  'isobutil',
  'terc-butil',
  'neopentil',
  'isopentil',
  'metil',
  'etil',
  'propil',
  'butil',
  'pentil',
  'fenil',
  'benzil',
  'vinil',
  'alil',
];

export const FUNCTIONAL_RADICAL_KEYS = Object.keys(SUBORDINATED_RADICALS).sort(
  (a, b) => b.length - a.length
);

export const ALL_RADICALS = [
  ...FUNCTIONAL_RADICAL_KEYS,
  ...SIMPLE_RADICALS,
].sort((a, b) => b.length - a.length);

/**
 * Parses a complex parenthesized radical like '(2-aminoetil)', '(clorometil)', '(hidroximetil)', '(4-nitrofenil)'.
 */
export function parseNestedRadical(raw: string): {
  subLocants: (number | string)[];
  subFunction?: OrganicFunction;
  alkylBase: string;
} {
  const clean = raw.replace(/[()]/g, '').trim();

  const match = clean.match(/^(?:([0-9Nn,]+)-)?([a-z]+)$/);
  if (!match) {
    return {
      subLocants: [],
      alkylBase: clean,
    };
  }

  const locantsRaw = match[1];
  const rest = match[2];

  const subLocants: (number | string)[] = locantsRaw
    ? locantsRaw.split(',').map((l) => (isNaN(Number(l)) ? l.toUpperCase() : Number(l)))
    : [];

  let subFunction: OrganicFunction | undefined;
  let alkylBase = rest;

  for (const fnRad of FUNCTIONAL_RADICAL_KEYS) {
    if (rest.startsWith(fnRad)) {
      subFunction = SUBORDINATED_RADICALS[fnRad];
      alkylBase = rest.slice(fnRad.length);
      break;
    }
  }

  return {
    subLocants,
    subFunction,
    alkylBase: alkylBase || 'metil',
  };
}

/**
 * Parses locant string like '2', '2,3', 'N', 'N,N', '1,4' into array.
 */
export function parseLocantString(str: string): (number | string)[] {
  return str
    .split(',')
    .map((item) => item.trim())
    .filter((trimmed) => trimmed.length > 0)
    .map((trimmed) => {
      const num = Number(trimmed);
      return isNaN(num) ? trimmed.toUpperCase() : num;
    });
}

/**
 * Tokenizes a normalized IUPAC name into structured tokens.
 */
export function tokenize(normalizedName: string): IUPACToken[] {
  const tokens: IUPACToken[] = [];
  let remaining = normalizedName.trim();

  // 1. Special prefix check: 'acido', 'anidrido', 'cloreto de', etc.
  if (remaining.startsWith('acido ') || remaining === 'acido') {
    tokens.push({ type: 'SPECIAL_PREFIX', value: 'acido' });
    remaining = remaining.slice(5).trim();
  } else if (remaining.startsWith('anidrido ') || remaining === 'anidrido') {
    tokens.push({ type: 'SPECIAL_PREFIX', value: 'anidrido' });
    remaining = remaining.slice(8).trim();
  } else if (remaining.startsWith('eter ') || remaining === 'eter') {
    tokens.push({ type: 'SPECIAL_PREFIX', value: 'eter' });
    remaining = remaining.slice(4).trim();
  } else {
    const acylMatch = remaining.match(/^(cloreto|brometo|iodeto|fluoreto)\s+de\s+/);
    if (acylMatch) {
      tokens.push({ type: 'SPECIAL_PREFIX', value: `${acylMatch[1]} de` });
      remaining = remaining.slice(acylMatch[0].length).trim();
    }
  }

  // 2. Check for Ester suffix part: '... de etila', '... de metila', etc.
  let esterAlkylToken: IUPACToken | null = null;
  const esterMatch = remaining.match(/\s+de\s+([a-z]+a)$/i);
  if (esterMatch) {
    esterAlkylToken = {
      type: 'ESTER_ALKYL',
      value: esterMatch[1],
    };
    remaining = remaining.slice(0, remaining.length - esterMatch[0].length).trim();
  }

  // 3. Extract substituents / radicals loop
  while (remaining.length > 0) {
    // Check for complex radical: e.g. '2-(clorometil)-' or '(clorometil)' or '1,2-bis(clorometil)'
    const complexMatch = remaining.match(
      /^(?:([0-9Nn,ompOMP]+)-)?(bis|tris|tetrakis)?(\([a-z0-9,-]+\))-?/i
    );
    if (complexMatch) {
      const locants = complexMatch[1] ? parseLocantString(complexMatch[1]) : [];
      const multiplierStr = complexMatch[2]?.toLowerCase();
      const multiplier = multiplierStr ? MULTIPLIER_MAP[multiplierStr] || 1 : 1;
      const parenthesized = complexMatch[3];
      const nested = parseNestedRadical(parenthesized);

      tokens.push({
        type: 'COMPLEX_RADICAL',
        value: parenthesized,
        metadata: {
          locants,
          multiplier,
          subordinateFunction: nested.subFunction,
          nestedRadical: nested,
        },
      });
      remaining = remaining.slice(complexMatch[0].length).trim();
      continue;
    }

    // Check for standard radical with locant and optional multiplier:
    // e.g. '3,3-dimetil-', '2-cloro-', 'N,N-dimetil-', 'sec-butil-', 'o-cloro-'
    let matchedRadical = false;
    for (const radical of ALL_RADICALS) {
      const radRegex = new RegExp(
        `^(?:([0-9Nn,ompOMP]+)-)?(di|tri|tetra|penta|hexa|bis|tris|tetrakis)?(${radical})(?:-|(?!$))`,
        'i'
      );
      const match = remaining.match(radRegex);
      if (match && match[3] === radical) {
        const isEndOfStr = remaining.length === match[0].length;
        if (isEndOfStr && !match[1] && !match[2]) {
          break;
        }

        const locants = match[1] ? parseLocantString(match[1]) : [];
        const multiplierStr = match[2] ? match[2].toLowerCase() : undefined;
        const multiplier = multiplierStr ? MULTIPLIER_MAP[multiplierStr] || 1 : 1;
        const radName = match[3].toLowerCase();
        const subordinateFunction = SUBORDINATED_RADICALS[radName];

        tokens.push({
          type: 'RADICAL',
          value: radName,
          metadata: {
            locants,
            multiplier,
            subordinateFunction,
          },
        });
        remaining = remaining.slice(match[0].length).trim();
        matchedRadical = true;
        break;
      }
    }

    if (matchedRadical) {
      continue;
    }

    break;
  }

  // 4. Ring check: 'ciclo'
  if (remaining.startsWith('ciclo')) {
    tokens.push({ type: 'RING_PREFIX', value: 'ciclo' });
    remaining = remaining.slice(5);
    if (remaining.startsWith('-')) {
      remaining = remaining.slice(1);
    }
  }

  // 5. Connective vowel 'a-' after stem in polyenes: e.g. 'buta-1,3-dieno' -> stem 'but', 'a-1,3-dieno'
  const stemEntries = Object.entries(CARBON_STEM_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [stem, count] of stemEntries) {
    if (remaining.startsWith(stem)) {
      tokens.push({
        type: 'CARBON_STEM',
        value: stem,
        metadata: { carbonCount: count },
      });
      remaining = remaining.slice(stem.length);
      break;
    }
  }

  // Handle connective 'a-' before locants: e.g. 'buta-1,3-dieno' -> stem was 'but', remaining is 'a-1,3-dieno'
  if (remaining.startsWith('a-')) {
    remaining = remaining.slice(2);
  }

  // Handle connective 'o-' before locants: e.g. 'ano-1,2-diol' -> 'an' + '1,2-diol'
  const connectiveOLocMatch = remaining.match(
    /^(an|en|in|dien|diin|trien)o-([0-9,]+)-([a-z]+)$/i
  );
  if (connectiveOLocMatch) {
    tokens.push({
      type: 'INFIX',
      value: connectiveOLocMatch[1].toLowerCase(),
    });
    tokens.push({
      type: 'SUFFIX',
      value: connectiveOLocMatch[3].toLowerCase(),
      metadata: { locants: connectiveOLocMatch[2].split(',').map(Number) },
    });
    remaining = '';
  }

  // Handle connective 'o' before consonant suffixes: e.g. 'anonitrila', 'anodiamina', 'anodial', 'anodioico'
  const connectiveOConsonantMatch = remaining.match(
    /^(an|en|in|dien|diin|trien)o(nitrila|dinitrila|diamina|diona|triol|dial|dioico|carboxilico)$/i
  );
  if (connectiveOConsonantMatch) {
    tokens.push({
      type: 'INFIX',
      value: connectiveOConsonantMatch[1].toLowerCase(),
    });
    const sfx = connectiveOConsonantMatch[2].toLowerCase();
    tokens.push({
      type: 'SUFFIX',
      value: sfx === 'dioico' ? 'oico' : sfx,
    });
    remaining = '';
  }

  // 6. Bond infix with optional locants:
  // e.g. '-2-en-', '-1,3-dien-', 'an-', 'an', 'en', 'in'
  if (remaining.length > 0) {
    const bondMatch = remaining.match(/^(?:-?([0-9,]+)-)?(an|en|in|dien|diin|trien)-?/i);
    if (bondMatch) {
      const locants = bondMatch[1] ? bondMatch[1].split(',').map(Number) : undefined;
      tokens.push({
        type: 'INFIX',
        value: bondMatch[2].toLowerCase(),
        metadata: { locants },
      });
      remaining = remaining.slice(bondMatch[0].length);
    }
  }

  // 7. Suffix with optional locant:
  // e.g. '-2-ol', '-1,2-diol', 'al', 'oico', 'o', 'ona', 'amida', 'nitrila'
  if (remaining.length > 0) {
    const suffixLocMatch = remaining.match(/^(?:-?([0-9,]+)-)?([a-z]+)$/i);
    if (suffixLocMatch) {
      const locants = suffixLocMatch[1] ? suffixLocMatch[1].split(',').map(Number) : undefined;
      const suffixStr = suffixLocMatch[2].toLowerCase();
      tokens.push({
        type: 'SUFFIX',
        value: suffixStr,
        metadata: { locants },
      });
      remaining = '';
    } else {
      tokens.push({ type: 'UNKNOWN', value: remaining });
      remaining = '';
    }
  }

  if (esterAlkylToken) {
    tokens.push(esterAlkylToken);
  }

  return tokens;
}
