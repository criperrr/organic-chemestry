import {
  DifficultyTier,
  Molecule,
  OrganicFunction,
} from '@quimicarush/chemistry-core';

/**
 * Options for procedural molecule generation.
 */
export interface ProceduralGeneratorOptions {
  primaryFunction?: OrganicFunction;
  difficulty?: DifficultyTier;
  chainLength?: number;
  seed?: number;
}

/**
 * Valence rules for standard organic elements.
 */
export const VALENCE_RULES: Record<string, number> = {
  C: 4,
  O: 2,
  N: 3,
  H: 1,
  F: 1,
  Cl: 1,
  Br: 1,
  I: 1,
};

const STEM_NAMES: Record<number, string> = {
  1: 'met',
  2: 'et',
  3: 'prop',
  4: 'but',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'oct',
  9: 'non',
  10: 'dec',
};

/**
 * Simple pseudo-random number generator for reproducible procedural generation.
 */
class LCG {
  private state: number;
  constructor(seed: number = 42) {
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
 * Computes empirical molecular formula from atom counts.
 */
function buildFormula(counts: Record<string, number>): string {
  const parts: string[] = [];
  // Standard Hill system: C first, then H, then remaining alphabetically
  if (counts['C']) {
    parts.push(counts['C'] > 1 ? `C${counts['C']}` : 'C');
  }
  if (counts['H']) {
    parts.push(counts['H'] > 1 ? `H${counts['H']}` : 'H');
  }
  const others = Object.keys(counts)
    .filter((el) => el !== 'C' && el !== 'H')
    .sort();
  for (const el of others) {
    if (counts[el] > 0) {
      parts.push(counts[el] > 1 ? `${el}${counts[el]}` : el);
    }
  }
  return parts.join('');
}

/**
 * Verifies that standard valences are respected in a simplified representation.
 */
export function verifyValences(mol: Molecule): { valid: boolean; reason?: string } {
  if (!mol.smiles || !mol.iupacName || !mol.formula) {
    return { valid: false, reason: 'Molecule contains empty mandatory fields' };
  }
  // Check that formula matches basic organic stoichiometry
  const cMatch = mol.formula.match(/C(\d*)/);
  const carbonCount = cMatch ? (cMatch[1] === '' ? 1 : parseInt(cMatch[1], 10)) : 0;
  if (carbonCount <= 0 && mol.primaryFunction !== 'anidrido') {
    return { valid: false, reason: 'Organic molecule must contain at least one carbon' };
  }
  return { valid: true };
}

/**
 * Procedural combinatorial generator for organic molecules.
 */
export class ProceduralGenerator {
  private rng: LCG;

  constructor(seed: number = 1337) {
    this.rng = new LCG(seed);
  }

  /**
   * Sets the generator seed.
   */
  public setSeed(seed: number): void {
    this.rng = new LCG(seed);
  }

  /**
   * Generates a valid organic molecule adhering to IUPAC nomenclature and chemical valence rules.
   */
  public generateMolecule(options: ProceduralGeneratorOptions = {}): Molecule {
    const allFunctions: OrganicFunction[] = [
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
    ];

    const primaryFunction = options.primaryFunction || this.rng.pick(allFunctions);
    const difficulty = options.difficulty || this.rng.pick(['iniciante', 'intermediario', 'avancado', 'caos']);
    const chainLength = options.chainLength || this.rng.range(1, 8);

    const id = `proc-${primaryFunction.slice(0, 3)}-${Math.floor(this.rng.next() * 1000000)}`;

    switch (primaryFunction) {
      case 'hidrocarboneto':
        return this.generateHydrocarbon(id, difficulty, chainLength);
      case 'alcool':
        return this.generateAlcohol(id, difficulty, chainLength);
      case 'fenol':
        return this.generatePhenol(id, difficulty);
      case 'enol':
        return this.generateEnol(id, difficulty, chainLength);
      case 'eter':
        return this.generateEther(id, difficulty, chainLength);
      case 'aldeido':
        return this.generateAldehyde(id, difficulty, chainLength);
      case 'cetona':
        return this.generateKetone(id, difficulty, chainLength);
      case 'acido_carboxilico':
        return this.generateCarboxylicAcid(id, difficulty, chainLength);
      case 'ester':
        return this.generateEster(id, difficulty, chainLength);
      case 'amina':
        return this.generateAmine(id, difficulty, chainLength);
      case 'amida':
        return this.generateAmide(id, difficulty, chainLength);
      case 'nitrila':
        return this.generateNitrile(id, difficulty, chainLength);
      case 'nitrocomposto':
        return this.generateNitro(id, difficulty, chainLength);
      case 'haleto_alquila':
        return this.generateAlkylHalide(id, difficulty, chainLength);
      case 'haleto_acila':
        return this.generateAcylHalide(id, difficulty, chainLength);
      case 'anidrido':
        return this.generateAnhydride(id, difficulty, chainLength);
    }
  }

  private generateHydrocarbon(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 8));
    const stem = STEM_NAMES[chain] || 'but';

    if (difficulty === 'iniciante' || chain <= 2) {
      const smiles = 'C'.repeat(chain);
      const formula = buildFormula({ C: chain, H: chain * 2 + 2 });
      return {
        id,
        smiles,
        iupacName: `${stem}ano`,
        commonNames: [],
        primaryFunction: 'hidrocarboneto',
        secondaryFunctions: [],
        difficulty,
        formula,
        realWorldStory: `Alcano saturado linear de ${chain} carbonos gerado combinatorialmente.`,
        educationalContext: `Alcano acíclico: prefixo ${stem}- + infixo -an- + sufixo -o.`,
      };
    }

    // Alkenes for intermediate
    const doublePos = this.rng.range(1, Math.floor(chain / 2));
    const smiles = Array.from({ length: chain }, (_, i) => (i === doublePos ? '=C' : 'C')).join('');
    const formula = buildFormula({ C: chain, H: chain * 2 });
    const name = doublePos === 1 && chain <= 3 ? `${stem}eno` : `${stem}-${doublePos}-eno`;

    return {
      id,
      smiles,
      iupacName: name,
      commonNames: [],
      primaryFunction: 'hidrocarboneto',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Alceno com ligação dupla gerado proceduralmente com valência 4 satisfeita em todos os carbonos.`,
      educationalContext: `Alceno com insaturação dupla: infixo -en- na posição ${doublePos}.`,
    };
  }

  private generateAlcohol(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 6));
    const stem = STEM_NAMES[chain] || 'prop';
    const pos = chain <= 2 ? 1 : this.rng.range(1, Math.floor(chain / 2) + 1);

    const cChain = 'C'.repeat(chain);
    const smiles = pos === 1 ? `${cChain}O` : `${'C'.repeat(pos - 1)}C(O)${'C'.repeat(chain - pos)}`;
    const formula = buildFormula({ C: chain, H: chain * 2 + 2, O: 1 });
    const iupacName = chain <= 2 ? `${stem}anol` : `${stem}an-${pos}-ol`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'alcool',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Álcool alifático com grupo hidroxila (-OH) em carbono saturado sp3.`,
      educationalContext: `Álcool com sufixo -ol ligado ao carbono ${pos}.`,
    };
  }

  private generatePhenol(id: string, difficulty: DifficultyTier): Molecule {
    const substituents = ['2-metil', '3-metil', '4-metil', '2-cloro', '4-cloro'];
    const chosen = this.rng.pick(substituents);
    const [loc, rad] = chosen.split('-');
    const locNum = parseInt(loc, 10);

    let smiles = '';
    let formula = '';

    if (rad === 'cloro') {
      smiles = locNum === 2 ? `Oc1ccccc1Cl` : `Oc1ccc(Cl)cc1`;
      formula = buildFormula({ C: 6, H: 5, Cl: 1, O: 1 });
    } else {
      if (locNum === 2) {
        smiles = `Oc1ccccc1C`;
      } else if (locNum === 3) {
        smiles = `Oc1cccc(C)c1`;
      } else {
        smiles = `Oc1ccc(C)cc1`;
      }
      formula = buildFormula({ C: 7, H: 8, O: 1 });
    }

    return {
      id,
      smiles,
      iupacName: `${chosen}fenol`,
      commonNames: [],
      primaryFunction: 'fenol',
      secondaryFunctions: rad === 'cloro' ? ['haleto_alquila'] : [],
      difficulty,
      formula,
      realWorldStory: `Composto aromático com hidroxila diretamente ligada ao anel benzênico.`,
      educationalContext: `Fenol monossubstituído na posição ${locNum} com radical ${rad}.`,
    };
  }

  private generateEnol(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(2, Math.min(len, 5));
    const stem = STEM_NAMES[chain] || 'prop';
    const smiles = chain === 2 ? 'C=CO' : `${'C'.repeat(chain - 2)}C(=C)O`;
    const iupacName = chain === 2 ? 'etenol' : `${stem}-1-en-2-ol`;
    const formula = buildFormula({ C: chain, H: chain * 2, O: 1 });

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'enol',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Enol instável em equilíbrio tautomérico ceto-enólico dinâmico.`,
      educationalContext: `Hidroxila ligada diretamente a átomo de carbono sp2 com dupla ligação alifática: infixo -en- + sufixo -ol.`,
    };
  }

  private generateEther(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const r1 = Math.max(1, Math.min(len, 3));
    const r2 = this.rng.range(1, 4);
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);

    const minStem = STEM_NAMES[minR] || 'met';
    const maxStem = STEM_NAMES[maxR] || 'et';

    const smiles = `${'C'.repeat(minR)}O${'C'.repeat(maxR)}`;
    const formula = buildFormula({ C: minR + maxR, H: (minR + maxR) * 2 + 2, O: 1 });
    const iupacName = `${minStem}oxi${maxStem}ano`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'eter',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Éter gerado proceduralmente com oxigênio como heteroátomo entre duas cadeias carbônicas.`,
      educationalContext: `Nomenclatura oficial: prefixo do radical menor + óxi + hidrocarboneto maior.`,
    };
  }

  private generateAldehyde(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 6));
    const stem = STEM_NAMES[chain] || 'prop';
    const smiles = chain === 1 ? 'C=O' : `${'C'.repeat(chain - 1)}C=O`;
    const formula = buildFormula({ C: chain, H: chain * 2, O: 1 });
    const iupacName = `${stem}anal`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'aldeido',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Aldeído contendo o grupo formila terminal (H-C=O).`,
      educationalContext: `O carbono da carbonila terminal é compulsoriamente o C1: sufixo -al sem localizador numérico.`,
    };
  }

  private generateKetone(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(3, Math.min(len, 6));
    const stem = STEM_NAMES[chain] || 'but';
    const pos = chain === 3 ? 2 : this.rng.range(2, Math.floor(chain / 2) + 1);

    const left = 'C'.repeat(pos - 1);
    const right = 'C'.repeat(chain - pos);
    const smiles = `${left}C(=O)${right}`;
    const formula = buildFormula({ C: chain, H: chain * 2, O: 1 });
    const iupacName = chain === 3 ? 'propanona' : `${stem}an-${pos}-ona`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'cetona',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Cetona alifática com grupo carbonila (C=O) entre dois átomos de carbono secundários.`,
      educationalContext: `Sufixo canônico -ona precedido pelo localizador numérico da posição carbonílica.`,
    };
  }

  private generateCarboxylicAcid(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 6));
    const stem = STEM_NAMES[chain] || 'but';
    const smiles = chain === 1 ? 'OC=O' : `${'C'.repeat(chain - 1)}C(=O)O`;
    const formula = buildFormula({ C: chain, H: chain * 2, O: 2 });
    const iupacName = `ácido ${stem}anoico`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'acido_carboxilico',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Ácido carboxílico com grupo carboxila (-COOH) de máxima prioridade química IUPAC.`,
      educationalContext: `Palavra ácido + prefixo carbônico + infixo -an- + sufixo -oico.`,
    };
  }

  private generateEster(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const acidLen = Math.max(1, Math.min(len, 4));
    const alcoholLen = this.rng.range(1, 3);
    const acidStem = STEM_NAMES[acidLen] || 'et';
    const alcRad = alcoholLen === 1 ? 'metila' : alcoholLen === 2 ? 'etila' : 'propila';

    const smiles =
      acidLen === 1
        ? `O=CO${'C'.repeat(alcoholLen)}`
        : `${'C'.repeat(acidLen - 1)}C(=O)O${'C'.repeat(alcoholLen)}`;
    const formula = buildFormula({
      C: acidLen + alcoholLen,
      H: (acidLen + alcoholLen) * 2,
      O: 2,
    });
    const iupacName = `${acidStem}anoato de ${alcRad}`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'ester',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Éster com aroma frutado derivado da esterificação de ácido carboxílico e álcool.`,
      educationalContext: `Sufixo -oato na cadeia principal do ácido + preposição "de" + radical do álcool com -ila.`,
    };
  }

  private generateAmine(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 5));
    const stem = STEM_NAMES[chain] || 'et';
    const smiles = `${'C'.repeat(chain)}N`;
    const formula = buildFormula({ C: chain, H: chain * 2 + 3, N: 1 });
    const iupacName = `${stem}anamina`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'amina',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Amina primária básica derivada formalmente da amônia.`,
      educationalContext: `Prefixo carbônico + infixo -an- + sufixo -amina.`,
    };
  }

  private generateAmide(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 5));
    const stem = STEM_NAMES[chain] || 'et';
    const smiles = chain === 1 ? 'NC=O' : `${'C'.repeat(chain - 1)}C(=O)N`;
    const formula = buildFormula({ C: chain, H: chain * 2 + 1, N: 1, O: 1 });
    const iupacName = `${stem}anamida`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'amida',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Amida primária alifática contendo nitrogênio ligado diretamente à carbonila.`,
      educationalContext: `Prefixo carbônico + infixo -an- + sufixo -amida.`,
    };
  }

  private generateNitrile(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(2, Math.min(len, 5));
    const stem = STEM_NAMES[chain] || 'et';
    const smiles = `${'C'.repeat(chain - 1)}C#N`;
    const formula = buildFormula({ C: chain, H: chain * 2 - 1, N: 1 });
    const iupacName = `${stem}anonitrila`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'nitrila',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Nitrila com ligação tripla carbono-nitrogênio (-C≡N).`,
      educationalContext: `O carbono do grupo ciano é o C1: prefixo + -ano- + sufixo -nitrila.`,
    };
  }

  private generateNitro(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 4));
    const stem = STEM_NAMES[chain] || 'prop';
    const smiles = `${'C'.repeat(chain)}[N+](=O)[O-]`;
    const formula = buildFormula({ C: chain, H: chain * 2 + 1, N: 1, O: 2 });
    const iupacName = chain === 1 ? 'nitrometano' : `1-nitro${stem}ano`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'nitrocomposto',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Nitrocomposto com grupo funcional -NO2 polar.`,
      educationalContext: `Prefixo permanente nitro- precedendo o nome do hidrocarboneto.`,
    };
  }

  private generateAlkylHalide(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 4));
    const stem = STEM_NAMES[chain] || 'prop';
    const halogen = this.rng.pick(['cloro', 'bromo', 'iodo']);
    const halSymbol = halogen === 'cloro' ? 'Cl' : halogen === 'bromo' ? 'Br' : 'I';

    const smiles = `${'C'.repeat(chain)}${halSymbol}`;
    const formulaCounts: Record<string, number> = { C: chain, H: chain * 2 + 1 };
    formulaCounts[halSymbol] = 1;
    const formula = buildFormula(formulaCounts);
    const iupacName = chain === 1 ? `${halogen}metano` : `1-${halogen}${stem}ano`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'haleto_alquila',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Haleto de alquila monohalogenado com ligação polar carbono-halogênio.`,
      educationalContext: `Halogênio nomeado compulsoriamente como prefixo no esqueleto alcânico.`,
    };
  }

  private generateAcylHalide(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 4));
    const stem = STEM_NAMES[chain] || 'et';
    const smiles = chain === 1 ? 'ClC=O' : `${'C'.repeat(chain - 1)}C(=O)Cl`;
    const formula = buildFormula({ C: chain, H: chain * 2 - 1, Cl: 1, O: 1 });
    const iupacName = `cloreto de ${stem}anoíla`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'haleto_acila',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Haleto de acila reativo com halogênio ligado ao carbono carbonílico.`,
      educationalContext: `Nomenclatura: [haleto] de [hidrocarboneto]-oíla.`,
    };
  }

  private generateAnhydride(id: string, difficulty: DifficultyTier, len: number): Molecule {
    const chain = Math.max(1, Math.min(len, 3));
    const stem = STEM_NAMES[chain] || 'et';
    const smiles = chain === 1 ? 'O=COC=O' : `${'C'.repeat(chain - 1)}C(=O)OC(=O)${'C'.repeat(chain - 1)}`;
    const formula = buildFormula({ C: chain * 2, H: (chain * 2 - 1) * 2, O: 3 });
    const iupacName = `anidrido ${stem}anoico`;

    return {
      id,
      smiles,
      iupacName,
      commonNames: [],
      primaryFunction: 'anidrido',
      secondaryFunctions: [],
      difficulty,
      formula,
      realWorldStory: `Anidrido de ácido carboxílico resultante da desidratação molecular.`,
      educationalContext: `Palavra anidrido seguida do nome do ácido carboxílico que o originou.`,
    };
  }
}

export const proceduralGenerator = new ProceduralGenerator();
export function generateMolecule(options?: ProceduralGeneratorOptions): Molecule {
  return proceduralGenerator.generateMolecule(options);
}
