import {
  BondNode,
  IUPACNameAST,
  OrganicFunction,
  SUBORDINATED_RADICALS,
  SubstituentNode,
} from './types.js';
import { normalizeIUPACName } from './normalizer.js';
import {
  CARBON_STEM_MAP,
  IUPACToken,
  parseNestedRadical,
  tokenize,
} from './lexer.js';

/**
 * Maps known common/trivial names to their IUPAC equivalent components.
 */
const TRIVIAL_NAME_MAPPINGS: Record<string, Partial<IUPACNameAST>> = {
  acetona: {
    mainChainPrefix: 'prop',
    carbonCount: 3,
    bonds: [{ type: 'an' }],
    functionSuffix: 'ona',
    primaryFunction: 'cetona',
    isRing: false,
    substituents: [],
  },
  formol: {
    mainChainPrefix: 'met',
    carbonCount: 1,
    bonds: [{ type: 'an' }],
    functionSuffix: 'al',
    primaryFunction: 'aldeido',
    isRing: false,
    substituents: [],
  },
  formaldeido: {
    mainChainPrefix: 'met',
    carbonCount: 1,
    bonds: [{ type: 'an' }],
    functionSuffix: 'al',
    primaryFunction: 'aldeido',
    isRing: false,
    substituents: [],
  },
  acetaldeido: {
    mainChainPrefix: 'et',
    carbonCount: 2,
    bonds: [{ type: 'an' }],
    functionSuffix: 'al',
    primaryFunction: 'aldeido',
    isRing: false,
    substituents: [],
  },
  benzeno: {
    mainChainPrefix: 'benzen',
    carbonCount: 6,
    bonds: [{ type: 'an' }],
    functionSuffix: 'o',
    primaryFunction: 'hidrocarboneto',
    isRing: true,
    ringType: 'benzeno',
    substituents: [],
  },
  fenol: {
    mainChainPrefix: 'benzen',
    carbonCount: 6,
    bonds: [{ type: 'an' }],
    functionSuffix: 'fenol',
    primaryFunction: 'fenol',
    isRing: true,
    ringType: 'benzeno',
    substituents: [],
  },
  tolueno: {
    mainChainPrefix: 'benzen',
    carbonCount: 6,
    bonds: [{ type: 'an' }],
    functionSuffix: 'o',
    primaryFunction: 'hidrocarboneto',
    isRing: true,
    ringType: 'benzeno',
    substituents: [{ locants: [1], name: 'metil', type: 'simple_alkyl' }],
  },
  anilina: {
    mainChainPrefix: 'benzen',
    carbonCount: 6,
    bonds: [{ type: 'an' }],
    functionSuffix: 'amina',
    primaryFunction: 'amina',
    isRing: true,
    ringType: 'benzeno',
    substituents: [],
  },
  aminobenzeno: {
    mainChainPrefix: 'benzen',
    carbonCount: 6,
    bonds: [{ type: 'an' }],
    functionSuffix: 'amina',
    primaryFunction: 'amina',
    isRing: true,
    ringType: 'benzeno',
    substituents: [],
  },
  naftaleno: {
    mainChainPrefix: 'naftalen',
    carbonCount: 10,
    bonds: [{ type: 'an' }],
    functionSuffix: 'o',
    primaryFunction: 'hidrocarboneto',
    isRing: true,
    ringType: 'naftaleno',
    substituents: [],
  },
  naftol: {
    mainChainPrefix: 'naftalen',
    carbonCount: 10,
    bonds: [{ type: 'an' }],
    functionSuffix: 'ol',
    primaryFunction: 'fenol',
    isRing: true,
    ringType: 'naftaleno',
    substituents: [],
  },
  '1-naftol': {
    mainChainPrefix: 'naftalen',
    carbonCount: 10,
    bonds: [{ type: 'an' }],
    functionSuffix: 'ol',
    primaryFunction: 'fenol',
    isRing: true,
    ringType: 'naftaleno',
    substituents: [],
  },
  '2-naftol': {
    mainChainPrefix: 'naftalen',
    carbonCount: 10,
    bonds: [{ type: 'an' }],
    functionSuffix: 'ol',
    primaryFunction: 'fenol',
    isRing: true,
    ringType: 'naftaleno',
    substituents: [],
  },
  cloroformio: {
    mainChainPrefix: 'met',
    carbonCount: 1,
    bonds: [{ type: 'an' }],
    functionSuffix: 'o',
    primaryFunction: 'haleto_alquila',
    isRing: false,
    substituents: [
      {
        locants: [1, 1, 1],
        multiplier: 3,
        name: 'cloro',
        type: 'functional_substituent',
        subordinateFunction: 'haleto_alquila',
      },
    ],
  },
};

/**
 * Determines primary organic function from AST fields.
 */
function resolvePrimaryFunction(
  isSpecialPrefix: 'acido' | 'anidrido' | 'eter' | undefined,
  functionSuffix: string,
  bonds: BondNode[],
  isRing: boolean,
  ringType: 'ciclo' | 'benzeno' | 'naftaleno' | undefined,
  substituents: SubstituentNode[],
  acylHalideHalogen?: string,
  suffixLocants?: number[],
  carbonCount: number = 1
): OrganicFunction {
  // 1. Special prefixes take precedence
  if (isSpecialPrefix === 'acido') return 'acido_carboxilico';
  if (isSpecialPrefix === 'anidrido') return 'anidrido';
  if (isSpecialPrefix === 'eter') return 'eter';
  if (acylHalideHalogen || functionSuffix === 'oila') return 'haleto_acila';

  // 2. Specific principal suffixes
  switch (functionSuffix) {
    case 'oico':
    case 'dioico':
    case 'carboxilico':
      return 'acido_carboxilico';
    case 'oato':
      return 'ester';
    case 'amida':
    case 'diamida':
      return 'amida';
    case 'nitrila':
    case 'dinitrila':
      return 'nitrila';
    case 'al':
    case 'dial':
      return 'aldeido';
    case 'ona':
    case 'diona':
    case 'triona':
      return 'cetona';
    case 'fenol':
      return 'fenol';
    case 'amina':
    case 'diamina':
      return 'amina';
    case 'ol':
    case 'diol':
    case 'triol': {
      if (isRing && (ringType === 'benzeno' || ringType === 'naftaleno')) {
        return 'fenol';
      }
      // Check if attached to unsaturated double bond carbon (enol)
      const enBonds = bonds.filter((b) => b.type === 'en' || b.type === 'dien');
      if (enBonds.length > 0) {
        const bondLocants = enBonds.flatMap((b) => b.locants || []);
        const ohLocants = suffixLocants && suffixLocants.length > 0 ? suffixLocants : [1];

        if (bondLocants.length > 0) {
          const sp2Carbons = new Set<number>();
          for (const k of bondLocants) {
            sp2Carbons.add(k);
            sp2Carbons.add(k + 1);
          }
          const isAttachedToSp2 = ohLocants.some((loc) => sp2Carbons.has(loc));
          if (isAttachedToSp2) {
            return 'enol';
          }
          return 'alcool';
        } else {
          // No bond locants specified (e.g. etenol, propenol)
          if (carbonCount <= 2) {
            return 'enol';
          }
          const isAttachedToSp2 = ohLocants.some((loc) => loc === 1 || loc === 2);
          if (isAttachedToSp2) {
            return 'enol';
          }
          return 'alcool';
        }
      }
      return 'alcool';
    }
    case 'o':
    default: {
      // Ethers: metoxi, etoxi, propoxi, etc.
      const etherSub = substituents.find(
        (s) => s.subordinateFunction === 'eter'
      );
      if (etherSub) return 'eter';

      // Alkyl halides: cloro, bromo, fluor, iodo
      const halideSub = substituents.find(
        (s) => s.subordinateFunction === 'haleto_alquila'
      );
      if (halideSub) return 'haleto_alquila';

      // Nitro compounds: nitro
      const nitroSub = substituents.find(
        (s) => s.subordinateFunction === 'nitrocomposto'
      );
      if (nitroSub) return 'nitrocomposto';

      // Aminobenzene / aromatic amine named with radical prefix (e.g. aminobenzeno)
      const aminoSub = substituents.find(
        (s) => s.subordinateFunction === 'amina' || s.name === 'amino'
      );
      if (aminoSub) return 'amina';

      // Phenol: -OH directly on benzene or naphthalene ring (e.g. hidroxibenzeno)
      if (isRing && (ringType === 'benzeno' || ringType === 'naftaleno')) {
        const hasPhenolOH = substituents.some(
          (s) => s.subordinateFunction === 'alcool' || s.name === 'hidroxi'
        );
        if (hasPhenolOH) {
          return 'fenol';
        }
      }

      return 'hidrocarboneto';
    }
  }
}

/**
 * Parses a normalized pt-BR IUPAC chemical name into a structured IUPACNameAST.
 */
export function parseIUPACName(rawInput: string): IUPACNameAST {
  const normalized = normalizeIUPACName(rawInput);

  if (!normalized) {
    return {
      isRing: false,
      substituents: [],
      mainChainPrefix: '',
      carbonCount: 0,
      bonds: [],
      functionSuffix: '',
      primaryFunction: undefined,
      rawNormalized: '',
    };
  }

  // Check trivial dictionary first
  if (TRIVIAL_NAME_MAPPINGS[normalized]) {
    const base = TRIVIAL_NAME_MAPPINGS[normalized];
    return {
      isRing: base.isRing ?? false,
      ringType: base.ringType,
      substituents: base.substituents ? [...base.substituents] : [],
      mainChainPrefix: base.mainChainPrefix ?? 'met',
      carbonCount: base.carbonCount ?? 1,
      bonds: base.bonds ? [...base.bonds] : [{ type: 'an' }],
      functionSuffix: base.functionSuffix ?? 'o',
      primaryFunction: base.primaryFunction ?? 'hidrocarboneto',
      rawNormalized: normalized,
    };
  }

  // Handle special case: 'eter [alquil]-[alquil]ico' (e.g. 'eter dietilico', 'eter dimetilico')
  if (normalized.startsWith('eter ')) {
    const eterRest = normalized.slice(5).trim();
    let carbonCount = 2;
    if (eterRest.includes('dimetil') || eterRest === 'dimetilico') {
      carbonCount = 2;
    } else if (eterRest.includes('dietil') || eterRest === 'dietilico') {
      carbonCount = 4;
    } else if (eterRest.includes('metil-etil') || eterRest.includes('etil-metil')) {
      carbonCount = 3;
    } else if (eterRest.includes('dipropil') || eterRest === 'dipropilico') {
      carbonCount = 6;
    }
    return {
      isSpecialPrefix: 'eter',
      isRing: false,
      substituents: [],
      mainChainPrefix: carbonCount >= 4 ? 'but' : carbonCount === 3 ? 'prop' : 'et',
      carbonCount,
      bonds: [{ type: 'an' }],
      functionSuffix: 'o',
      primaryFunction: 'eter',
      rawNormalized: normalized,
    };
  }

  // Handle amine synonyms: e.g. 'metilamina', 'etilamina', 'dimetilamina', 'trimetilamina'
  const amineSynonymMatch = normalized.match(/^(di|tri)?([a-z]+)amina$/);
  if (
    amineSynonymMatch &&
    !['metan', 'etan', 'propan', 'butan', 'pentan', 'hexan'].includes(
      amineSynonymMatch[2]
    )
  ) {
    const multStr = amineSynonymMatch[1];
    const rad = amineSynonymMatch[2]; // e.g. 'metil', 'etil'
    const alkylStem = rad.replace(/il$/, ''); // 'met', 'et'
    const carbonCount = CARBON_STEM_MAP[alkylStem] || 1;
    const substituents: SubstituentNode[] = [];
    const nitrogenSubstituents: string[] = [];

    if (multStr === 'di') {
      substituents.push({
        locants: ['N'],
        name: `${rad}`,
        type: 'simple_alkyl',
      });
      nitrogenSubstituents.push(rad);
    } else if (multStr === 'tri') {
      substituents.push({
        locants: ['N', 'N'],
        multiplier: 2,
        name: `${rad}`,
        type: 'simple_alkyl',
      });
      nitrogenSubstituents.push(rad, rad);
    }

    return {
      isRing: false,
      substituents,
      mainChainPrefix: alkylStem,
      carbonCount,
      bonds: [{ type: 'an' }],
      functionSuffix: 'amina',
      primaryFunction: 'amina',
      nitrogenSubstituents: nitrogenSubstituents.length > 0 ? nitrogenSubstituents : undefined,
      rawNormalized: normalized,
    };
  }

  // Tokenize the name
  const tokens: IUPACToken[] = tokenize(normalized);

  let isSpecialPrefix: 'acido' | 'anidrido' | 'eter' | undefined;
  let acylHalideHalogen: string | undefined;
  let isRing = false;
  let ringType: 'ciclo' | 'benzeno' | 'naftaleno' | undefined;
  const substituents: SubstituentNode[] = [];
  const nitrogenSubstituents: string[] = [];
  let mainChainPrefix = 'met';
  let carbonCount = 1;
  const bonds: BondNode[] = [];
  let functionSuffix = 'o';
  let suffixLocants: number[] | undefined;
  let esterAlkylPart: string | undefined;

  for (const token of tokens) {
    switch (token.type) {
      case 'SPECIAL_PREFIX': {
        if (token.value === 'acido') {
          isSpecialPrefix = 'acido';
        } else if (token.value === 'anidrido') {
          isSpecialPrefix = 'anidrido';
        } else if (token.value === 'eter') {
          isSpecialPrefix = 'eter';
        } else if (token.value.endsWith(' de')) {
          acylHalideHalogen = token.value.replace(/\s+de$/, '');
        }
        break;
      }
      case 'RING_PREFIX': {
        isRing = true;
        ringType = 'ciclo';
        break;
      }
      case 'CARBON_STEM': {
        mainChainPrefix = token.value;
        carbonCount = token.metadata?.carbonCount || CARBON_STEM_MAP[token.value] || 1;
        if (token.value === 'benz' || token.value === 'benzen' || token.value === 'benzeno') {
          isRing = true;
          ringType = 'benzeno';
        } else if (token.value === 'fenol') {
          isRing = true;
          ringType = 'benzeno';
          functionSuffix = 'fenol';
        } else if (token.value === 'naftalen' || token.value === 'naftaleno') {
          isRing = true;
          ringType = 'naftaleno';
        }
        break;
      }
      case 'INFIX': {
        const bondType = token.value as BondNode['type'];
        bonds.push({
          type: bondType,
          locants: token.metadata?.locants
            ? token.metadata.locants.map(Number).filter((n) => !isNaN(n))
            : undefined,
        });
        break;
      }
      case 'SUFFIX': {
        functionSuffix = token.value;
        if (token.metadata?.locants) {
          suffixLocants = token.metadata.locants.map(Number).filter((n) => !isNaN(n));
        }
        break;
      }
      case 'RADICAL': {
        const locants = token.metadata?.locants || [];
        const multiplier = token.metadata?.multiplier || 1;
        const radName = token.value;
        const subFn = token.metadata?.subordinateFunction || SUBORDINATED_RADICALS[radName];

        const subType: SubstituentNode['type'] = subFn
          ? 'functional_substituent'
          : 'simple_alkyl';

        substituents.push({
          locants,
          multiplier,
          type: subType,
          name: radName,
          subordinateFunction: subFn,
        });

        // Track N-substituents
        if (locants.some((l) => String(l).includes('N'))) {
          nitrogenSubstituents.push(radName);
        }
        break;
      }
      case 'COMPLEX_RADICAL': {
        const locants = token.metadata?.locants || [];
        const multiplier = token.metadata?.multiplier || 1;
        const nested = token.metadata?.nestedRadical || parseNestedRadical(token.value);

        substituents.push({
          locants,
          multiplier,
          type: 'complex_radical',
          name: token.value,
          subordinateFunction: token.metadata?.subordinateFunction || nested.subFunction,
          nestedRadical: nested,
        });
        break;
      }
      case 'ESTER_ALKYL': {
        esterAlkylPart = token.value;
        break;
      }
      default:
        break;
    }
  }

  // Benzoic acid / derivatives with 'benz' stem has 7 carbons (6 ring + 1 carboxyl)
  if (mainChainPrefix === 'benz' && (functionSuffix === 'oico' || isSpecialPrefix === 'acido')) {
    carbonCount = 7;
  }

  // Default bonds to single bonds if none extracted
  if (bonds.length === 0) {
    bonds.push({ type: 'an' });
  }

  // Resolve primary function
  const primaryFunction = resolvePrimaryFunction(
    isSpecialPrefix,
    functionSuffix,
    bonds,
    isRing,
    ringType,
    substituents,
    acylHalideHalogen,
    suffixLocants,
    carbonCount
  );

  return {
    isSpecialPrefix,
    isRing,
    ringType,
    substituents,
    mainChainPrefix,
    carbonCount,
    bonds,
    functionSuffix,
    primaryFunction,
    esterAlkylPart,
    acylHalideHalogen,
    nitrogenSubstituents: nitrogenSubstituents.length > 0 ? nitrogenSubstituents : undefined,
    rawNormalized: normalized,
  };
}
