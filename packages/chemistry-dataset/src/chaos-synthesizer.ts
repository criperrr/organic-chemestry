import {
  DifficultyTier,
  IUPAC_PRIORITY_ORDER,
  Molecule,
  OrganicFunction,
} from '@quimicarush/chemistry-core';

/**
 * Options for Chaos Synthesizer.
 */
export interface ChaosSynthesizerOptions {
  targetFunctionCount?: number; // 2 to 5 concurrent functional groups
  primaryFunction?: OrganicFunction;
  seed?: number;
}

interface SubordinateRadicalDef {
  name: string;
  subFunction: OrganicFunction;
  smilesFragment: string;
  atomCounts: Record<string, number>;
  alphabeticalKey: string;
  isComplex: boolean;
}

const SUBORDINATE_RADICALS_POOL: SubordinateRadicalDef[] = [
  {
    name: 'amino',
    subFunction: 'amina',
    smilesFragment: 'N',
    atomCounts: { N: 1, H: 2 },
    alphabeticalKey: 'amino',
    isComplex: false,
  },
  {
    name: '(2-aminoetil)',
    subFunction: 'amina',
    smilesFragment: 'CCN',
    atomCounts: { C: 2, H: 6, N: 1 },
    alphabeticalKey: 'aminoetil',
    isComplex: true,
  },
  {
    name: '(dimetilamino)',
    subFunction: 'amina',
    smilesFragment: 'N(C)C',
    atomCounts: { C: 2, H: 6, N: 1 },
    alphabeticalKey: 'dimetilamino',
    isComplex: true,
  },
  {
    name: 'cloro',
    subFunction: 'haleto_alquila',
    smilesFragment: 'Cl',
    atomCounts: { Cl: 1 },
    alphabeticalKey: 'cloro',
    isComplex: false,
  },
  {
    name: '(clorometil)',
    subFunction: 'haleto_alquila',
    smilesFragment: 'CCl',
    atomCounts: { C: 1, H: 2, Cl: 1 },
    alphabeticalKey: 'clorometil',
    isComplex: true,
  },
  {
    name: 'bromo',
    subFunction: 'haleto_alquila',
    smilesFragment: 'Br',
    atomCounts: { Br: 1 },
    alphabeticalKey: 'bromo',
    isComplex: false,
  },
  {
    name: 'hidróxi',
    subFunction: 'alcool',
    smilesFragment: 'O',
    atomCounts: { O: 1, H: 1 },
    alphabeticalKey: 'hidroxi',
    isComplex: false,
  },
  {
    name: '(hidroximetil)',
    subFunction: 'alcool',
    smilesFragment: 'CO',
    atomCounts: { C: 1, H: 3, O: 1 },
    alphabeticalKey: 'hidroximetil',
    isComplex: true,
  },
  {
    name: 'oxo',
    subFunction: 'cetona',
    smilesFragment: '=O',
    atomCounts: { O: 1, H: -1 }, // replaced 2 hydrogens on CH2
    alphabeticalKey: 'oxo',
    isComplex: false,
  },
  {
    name: 'nitro',
    subFunction: 'nitrocomposto',
    smilesFragment: '[N+](=O)[O-]',
    atomCounts: { N: 1, O: 2 },
    alphabeticalKey: 'nitro',
    isComplex: false,
  },
  {
    name: 'ciano',
    subFunction: 'nitrila',
    smilesFragment: 'C#N',
    atomCounts: { C: 1, N: 1 },
    alphabeticalKey: 'ciano',
    isComplex: false,
  },
  {
    name: 'metóxi',
    subFunction: 'eter',
    smilesFragment: 'OC',
    atomCounts: { C: 1, H: 3, O: 1 },
    alphabeticalKey: 'metoxi',
    isComplex: false,
  },
  {
    name: 'carbamoil',
    subFunction: 'amida',
    smilesFragment: 'C(=O)N',
    atomCounts: { C: 1, H: 2, N: 1, O: 1 },
    alphabeticalKey: 'carbamoil',
    isComplex: false,
  },
  {
    name: 'acetóxi',
    subFunction: 'ester',
    smilesFragment: 'OC(=O)C',
    atomCounts: { C: 2, H: 3, O: 2 },
    alphabeticalKey: 'acetoxi',
    isComplex: false,
  },
  {
    name: 'carboxi',
    subFunction: 'acido_carboxilico',
    smilesFragment: 'C(=O)O',
    atomCounts: { C: 1, H: 1, O: 2 },
    alphabeticalKey: 'carboxi',
    isComplex: false,
  },
];

class LCG {
  private state: number;
  constructor(seed: number = 777) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

/**
 * Builds standard molecular formula.
 */
function buildFormula(counts: Record<string, number>): string {
  const parts: string[] = [];
  if (counts['C']) parts.push(counts['C'] > 1 ? `C${counts['C']}` : 'C');
  if (counts['H']) parts.push(counts['H'] > 1 ? `H${counts['H']}` : 'H');
  const others = Object.keys(counts)
    .filter((el) => el !== 'C' && el !== 'H')
    .sort();
  for (const el of others) {
    if (counts[el] > 0) parts.push(counts[el] > 1 ? `${el}${counts[el]}` : el);
  }
  return parts.join('');
}

/**
 * Synthesizes Chaos Mode polyfunctional molecules featuring 2 to 5 concurrent groups
 * with proper IUPAC priority hierarchy resolution and parenthesized complex radicals.
 */
export class ChaosSynthesizer {
  private rng: LCG;

  constructor(seed: number = 9999) {
    this.rng = new LCG(seed);
  }

  public setSeed(seed: number): void {
    this.rng = new LCG(seed);
  }

  /**
   * Synthesizes a polyfunctional molecule with 2 to 5 concurrent functional groups.
   */
  public synthesizeChaosMolecule(options: ChaosSynthesizerOptions = {}): Molecule {
    const totalGroups = options.targetFunctionCount || this.rng.range(2, 5);
    const subordinateCount = totalGroups - 1; // 1 to 4 subordinate groups

    // Primary function candidates (excluding anhydride as it is not suitable for aliphatic single-chain chaos generation)
    const primaryCandidates: OrganicFunction[] = [
      'acido_carboxilico',
      'ester',
      'haleto_acila',
      'amida',
      'nitrila',
      'aldeido',
      'cetona',
      'alcool',
    ];

    const chosenPrimary: OrganicFunction =
      options.primaryFunction || this.rng.pick(primaryCandidates);

    const primaryRank = IUPAC_PRIORITY_ORDER[chosenPrimary];

    // Filter subordinate radicals: must have LOWER priority than chosenPrimary
    const validSubordinates = SUBORDINATE_RADICALS_POOL.filter(
      (rad) => IUPAC_PRIORITY_ORDER[rad.subFunction] < primaryRank
    );

    // Pick 1 to 4 distinct subordinate radicals
    const shuffled = [...validSubordinates].sort(() => this.rng.next() - 0.5);
    const selectedSubordinates = shuffled.slice(
      0,
      Math.min(subordinateCount, shuffled.length)
    );

    // Backbone: aliphatic chain length 6 to 8
    const chainLen = this.rng.range(6, 8);
    const stem = chainLen === 6 ? 'hexan' : chainLen === 7 ? 'heptan' : 'octan';

    // Assign locants:
    // C1 is reserved for principal function (acid, acyl halide, ester, amide, nitrile, aldehyde, alcohol).
    // For ketones on C2, C2 is also occupied by =O; start available substituent locants at C3 to prevent pentavalent carbon.
    const startLocant = chosenPrimary === 'cetona' ? 3 : 2;
    const availableLocants = Array.from(
      { length: chainLen - startLocant },
      (_, i) => i + startLocant
    );
    const shuffledLocants = availableLocants.sort(() => this.rng.next() - 0.5);

    interface PlacedRadical {
      locant: number;
      def: SubordinateRadicalDef;
    }

    const placed: PlacedRadical[] = [];
    for (let i = 0; i < selectedSubordinates.length; i++) {
      placed.push({
        locant: shuffledLocants[i],
        def: selectedSubordinates[i],
      });
    }

    // Sort placed radicals ALPHABETICALLY according to IUPAC rules
    placed.sort((a, b) =>
      a.def.alphabeticalKey.localeCompare(b.def.alphabeticalKey)
    );

    const prefixParts = placed.map((p) => `${p.locant}-${p.def.name}`).join('-');

    const placedMap = new Map<number, SubordinateRadicalDef>();
    for (const p of placed) {
      placedMap.set(p.locant, p.def);
    }

    const getCarbonSmiles = (loc: number): string => {
      const rad = placedMap.get(loc);
      if (!rad) return 'C';
      if (rad.smilesFragment === '=O') return 'C(=O)';
      return `C(${rad.smilesFragment})`;
    };

    const chainFrom2 = Array.from(
      { length: chainLen - 1 },
      (_, i) => getCarbonSmiles(i + 2)
    ).join('');

    const chainFrom3 = Array.from(
      { length: chainLen - 2 },
      (_, i) => getCarbonSmiles(i + 3)
    ).join('');

    // Build IUPAC name based on primary function
    let iupacName = '';
    let smiles = '';
    const atomCounts: Record<string, number> = {
      C: chainLen,
      H: chainLen * 2 + 2,
    };

    switch (chosenPrimary) {
      case 'acido_carboxilico': {
        iupacName = `ácido ${prefixParts ? prefixParts + '-' : ''}${stem}oico`;
        atomCounts['O'] = 2;
        atomCounts['H'] -= 2; // -COOH at C1
        smiles = `OC(=O)${chainFrom2}`;
        break;
      }
      case 'haleto_acila': {
        iupacName = `cloreto de ${prefixParts ? prefixParts + '-' : ''}${stem}oíla`;
        atomCounts['Cl'] = 1;
        atomCounts['O'] = 1;
        atomCounts['H'] -= 2;
        smiles = `ClC(=O)${chainFrom2}`;
        break;
      }
      case 'ester': {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}oato de etila`;
        atomCounts['C'] += 2;
        atomCounts['H'] += 2;
        atomCounts['O'] = 2;
        smiles = `CCOC(=O)${chainFrom2}`;
        break;
      }
      case 'amida': {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}amida`;
        atomCounts['N'] = 1;
        atomCounts['O'] = 1;
        atomCounts['H'] -= 1;
        smiles = `NC(=O)${chainFrom2}`;
        break;
      }
      case 'nitrila': {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}onitrila`;
        atomCounts['N'] = 1;
        atomCounts['H'] -= 3;
        smiles = `N#C${chainFrom2}`;
        break;
      }
      case 'aldeido': {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}al`;
        atomCounts['O'] = 1;
        atomCounts['H'] -= 2;
        smiles = `O=C${chainFrom2}`;
        break;
      }
      case 'cetona': {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}-2-ona`;
        atomCounts['O'] = 1;
        atomCounts['H'] -= 2;
        smiles = `CC(=O)${chainFrom3}`;
        break;
      }
      default: {
        iupacName = `${prefixParts ? prefixParts + '-' : ''}${stem}-1-ol`;
        atomCounts['O'] = 1;
        smiles = `OC${chainFrom2}`;
        break;
      }
    }

    // Add atom counts from subordinate radicals
    for (const p of placed) {
      atomCounts['H'] -= 1; // Hydrogen replaced by radical
      for (const [elem, count] of Object.entries(p.def.atomCounts)) {
        atomCounts[elem] = (atomCounts[elem] || 0) + count;
      }
    }

    const formula = buildFormula(atomCounts);
    const secondaryFunctions = Array.from(
      new Set(placed.map((p) => p.def.subFunction))
    );

    const radicalNamesFormatted = placed
      .map((p) => `"${p.def.name}" na posição ${p.locant}`)
      .join(', ');

    return {
      id: `caos-${Math.floor(this.rng.next() * 1000000)}`,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: chosenPrimary,
      secondaryFunctions,
      difficulty: 'caos' as DifficultyTier,
      formula,
      realWorldStory: `Sintetizada como desafio extremo de nomenclatura para o Modo Caos do QuímicaRush! Esta molécula quimérica reúne ${totalGroups} funções concorrentes em um único esqueleto molecular.`,
      educationalContext: `Regra de Ouro IUPAC ("Suffix Crown Rule"): A função prioritária ${chosenPrimary.toUpperCase()} (rank ${primaryRank}) assume o sufixo principal. Todas as demais funções perdem o sufixo e são convertidas em radicais prefixais (${radicalNamesFormatted}) dispostos estritamente em ordem alfabética.`,
    };
  }
}

export const chaosSynthesizer = new ChaosSynthesizer();
export function synthesizeChaosMolecule(
  options?: ChaosSynthesizerOptions
): Molecule {
  return chaosSynthesizer.synthesizeChaosMolecule(options);
}
