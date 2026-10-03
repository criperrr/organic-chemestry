import { z } from 'zod';
import type { DifficultyTier, OrganicFunction } from './types.js';

/**
 * The fundamental types of chemical isomerism covered in organic chemistry:
 * - Isomeria Plana (Constitucional): função, cadeia, posição, metameria, tautomeria
 * - Isomeria Espacial (Estereoisomeria): geométrica (cis-trans / Z-E), óptica (quiralidade)
 * - Negative / Edge controls: nao_isomeros (fórmulas distintas), mesmo_composto (idênticos)
 */
export type IsomerismType =
  | 'funcao'
  | 'cadeia'
  | 'posicao'
  | 'metameria'
  | 'tautomeria'
  | 'geometrica'
  | 'optica'
  | 'nao_isomeros'
  | 'mesmo_composto';

export const IsomerismTypeSchema = z.enum([
  'funcao',
  'cadeia',
  'posicao',
  'metameria',
  'tautomeria',
  'geometrica',
  'optica',
  'nao_isomeros',
  'mesmo_composto',
]);

export type IsomerismCategory = 'plana' | 'espacial' | 'outros';

export interface IsomerismMeta {
  readonly id: IsomerismType;
  readonly name: string;
  readonly category: IsomerismCategory;
  readonly shortDescription: string;
  readonly condition: string;
  readonly classicPairs: readonly string[];
  readonly enemTip: string;
  readonly hotkey: string;
}

export const ISOMERISM_TYPES_META: Record<IsomerismType, IsomerismMeta> = {
  funcao: {
    id: 'funcao',
    name: 'Isomeria de Função',
    category: 'plana',
    shortDescription: 'Mesma fórmula molecular, mas funções químicas orgânicas diferentes.',
    condition: 'Diferença no grupo funcional principal pertencente a classes químicas distintas.',
    classicPairs: [
      'Álcool e Éter (ex: Etanol e Metoximetano)',
      'Aldeído e Cetona (ex: Propanal e Propanona)',
      'Ácido Carboxílico e Éster (ex: Ácido propanoico e Etanoato de metila)',
      'Fenol, Álcool Aromático e Éter Aromático (ex: o-Cresol, Álcool benzílico e Metoxibenzeno)',
    ],
    enemTip:
      'Clássico absoluto no ENEM: Álcool ↔ Éter (CnH2n+2O), Aldeído ↔ Cetona (CnH2nO), Ácido ↔ Éster (CnH2nO2).',
    hotkey: '1',
  },
  cadeia: {
    id: 'cadeia',
    name: 'Isomeria de Cadeia',
    category: 'plana',
    shortDescription: 'Mesma função química e fórmula, mas formato da cadeia carbônica diferente.',
    condition:
      'Diferença entre cadeia aberta vs fechada (anel), normal vs ramificada, ou homogênea vs heterogênea.',
    classicPairs: [
      'Normal vs Ramificada (ex: Butano e 2-Metilpropano / isobutano)',
      'Aberta vs Cíclica (ex: But-1-eno e Ciclobutano)',
      'Anel normal vs Anel ramificado (ex: Ciclobutano e Metilciclopropano)',
    ],
    enemTip:
      'Cadeias abertas com dupla ligação são isômeros de cadeia de ciclanos correspondentes (fórmula CnH2n).',
    hotkey: '2',
  },
  posicao: {
    id: 'posicao',
    name: 'Isomeria de Posição',
    category: 'plana',
    shortDescription: 'Mesma função e mesma cadeia base, mas difere a posição de um grupo, insaturação ou ramificação.',
    condition: 'A cadeia principal e a função são idênticas; muda apenas o localizador (número do carbono).',
    classicPairs: [
      'Posição da hidroxila (ex: Propan-1-ol e Propan-2-ol)',
      'Posição da ligação dupla (ex: But-1-eno e But-2-eno)',
      'Posição da ligação tripla (ex: Pent-1-ino e Pent-2-ino)',
      'Posição do substituinte aromático (ex: orto, meta e para-xileno / 1,2 e 1,3-dimetilbenzeno)',
    ],
    enemTip:
      'Verifique o nome IUPAC: se apenas o número localizador mudar (ex: butan-1-ol vs butan-2-ol), é isomeria de posição!',
    hotkey: '3',
  },
  metameria: {
    id: 'metameria',
    name: 'Metameria (Compensação)',
    category: 'plana',
    shortDescription: 'Mesma função com heteroátomo, variando o tamanho dos radicais de cada lado.',
    condition:
      'Presença de heteroátomo (O, N, S) intercalando a cadeia carbônica com distribuição de carbonos assimétrica entre os dois lados.',
    classicPairs: [
      'Éteres: Metoxipropano (C1-O-C3) e Etoxietano (C2-O-C2)',
      'Aminas secundárias: Metilpropilamina e Dietilamina',
      'Ésteres: Propanoato de metila e Etanoato de etila',
      'Tioéteres: Metil-propil-tioéter e Dietil-tioéter',
    ],
    enemTip:
      'A metameria é um tipo especial de isomeria de posição restrito a heteroátomos (átomo diferente de C e H entre carbonos).',
    hotkey: '4',
  },
  tautomeria: {
    id: 'tautomeria',
    name: 'Tautomeria (Dinâmica)',
    category: 'plana',
    shortDescription: 'Isômeros de função em equilíbrio dinâmico químico espontâneo em solução.',
    condition:
      'Migração de um átomo de hidrogênio concomitante à transposição da ligação dupla (geralmente ceto-enólica ou aldo-enólica).',
    classicPairs: [
      'Ceto-enólica: Propanona (cetona) ⇌ Prop-1-en-2-ol (enol)',
      'Aldo-enólica: Etanal (aldeído) ⇌ Etenol (enol)',
      'Ceto-enólica em anel: Ciclo-hexanona ⇌ Ciclo-hex-1-en-1-ol',
    ],
    enemTip:
      'Na tautomeria ceto-enólica, a forma carbonílica (cetona ou aldeído) é geralmente muito mais estável e majoritária no equilíbrio.',
    hotkey: '5',
  },
  geometrica: {
    id: 'geometrica',
    name: 'Isomeria Geométrica (Cis-Trans / Z-E)',
    category: 'espacial',
    shortDescription: 'Mesma conectividade de átomos, diferindo no arranjo espacial dos ligantes ao redor de uma ligação rígida.',
    condition:
      'Em duplas (C=C): R1 ≠ R2 no primeiro carbono e R3 ≠ R4 no segundo carbono. Em ciclos: dois carbonos com substituintes distintos.',
    classicPairs: [
      'cis-But-2-eno vs trans-But-2-eno ((Z)-but-2-eno vs (E)-but-2-eno)',
      'Ácido maleico (cis) vs Ácido fumárico (trans)',
      'cis-1,2-Dicloroeteno vs trans-1,2-Dicloroeteno',
      'cis-1,2-Dimetilciclopropano vs trans-1,2-Dimetilciclopropano',
    ],
    enemTip:
      'Se um dos carbonos da dupla tiver dois ligantes idênticos (ex: =CH2 com dois H), NÃO EXISTE isomeria geométrica!',
    hotkey: '6',
  },
  optica: {
    id: 'optica',
    name: 'Isomeria Óptica',
    category: 'espacial',
    shortDescription: 'Compostos assimétricos que desviam o plano da luz polarizada (dextrógiro e levógiro).',
    condition:
      'Presença de pelo menos um carbono assimétrico / quiral (C*) ligado a 4 grupos químicos diferentes entre si.',
    classicPairs: [
      '(R)-Ácido lático e (S)-Ácido lático (enantiômeros)',
      'D-Gliceraldeído e L-Gliceraldeído',
      '(R)-Talidomida (sedativo) e (S)-Talidomida (teratogênico)',
      'Ácido tartárico: par enantiomérico e forma Meso opticamente inativa',
    ],
    enemTip:
      'Fórmula de van \'t Hoff: número de isômeros opticamente ativos = 2ⁿ (n = número de C* diferentes); misturas racêmicas inativas = 2ⁿ⁻¹.',
    hotkey: '7',
  },
  nao_isomeros: {
    id: 'nao_isomeros',
    name: 'Não São Isômeros',
    category: 'outros',
    shortDescription: 'Moléculas que possuem fórmulas moleculares diferentes (diferente quantidade de átomos).',
    condition: 'A contagem total de C, H, O ou outros átomos não coincide entre as duas espécies químicas.',
    classicPairs: [
      'Etanol (C2H6O) e Propanol (C3H8O) — homólogos, não isômeros',
      'Propanona (C3H6O) e Butanona (C4H8O)',
    ],
    enemTip:
      'Regra número 1 da Isomeria: antes de qualquer análise, confirme se a fórmula molecular é estritamente IDÊNTICA!',
    hotkey: '8',
  },
  mesmo_composto: {
    id: 'mesmo_composto',
    name: 'Mesmo Composto (Idênticos)',
    category: 'outros',
    shortDescription: 'Não são isômeros pois representam exatamente a mesma molécula, apenas rotacionada ou desenhada diferente.',
    condition: 'Conectividade e estereoquímica absolutamente idênticas segundo as regras de nomenclatura IUPAC.',
    classicPairs: [
      'Pentano esticado vs Pentano em zigue-zague',
      '2-Metilbutano desenhado da esquerda ou da direita',
    ],
    enemTip:
      'Cuidado com rotações de ligações simples (sigma C-C): girar a molécula não cria um novo isômero!',
    hotkey: '9',
  },
};

/**
 * Question Model: Pair Isomerism Classification
 */
export interface IsomerPairQuestion {
  id: string;
  moleculeA: {
    smiles: string;
    name: string;
    formula: string;
    function?: OrganicFunction;
  };
  moleculeB: {
    smiles: string;
    name: string;
    formula: string;
    function?: OrganicFunction;
  };
  relation: IsomerismType;
  explanation: string;
  comparison: {
    sameFormula: boolean;
    formulaA: string;
    formulaB: string;
    differenceSummary: string;
    keyClue: string;
  };
  difficulty: DifficultyTier;
  tags?: string[];
}

/**
 * Question Model: Chiral Center Detective (Optical Isomerism)
 */
export interface ChiralCenterQuestion {
  id: string;
  molecule: {
    smiles: string;
    name: string;
    formula: string;
    realWorldStory?: string;
  };
  chiralCarbonCount: number;
  chiralCarbonDescriptions: string[];
  opticallyActiveCount: number; // 2^n
  racemicMixCount: number; // 2^(n-1)
  hasMesoForm: boolean;
  isChiralMolecule: boolean;
  explanation: string;
  difficulty: DifficultyTier;
}

/**
 * Question Model: Geometric Isomerism Radar
 */
export interface GeometricConditionQuestion {
  id: string;
  molecule: {
    smiles: string;
    name: string;
    formula: string;
  };
  hasGeometricIsomerism: boolean;
  systemType: 'alqueno' | 'ciclo';
  substituentsA?: [string, string];
  substituentsB?: [string, string];
  reason: string;
  explanation: string;
  difficulty: DifficultyTier;
}

export interface IsomerismGradingResult {
  correct: boolean;
  score: number; // 0 to 1
  feedback: string;
  expectedName: string;
  providedName: string;
}

/**
 * Evaluates user's answer in a Pair Classification challenge.
 */
export function gradeIsomerPair(
  selectedRelation: IsomerismType,
  expectedRelation: IsomerismType
): IsomerismGradingResult {
  const isCorrect = selectedRelation === expectedRelation;
  const expectedMeta = ISOMERISM_TYPES_META[expectedRelation];
  const providedMeta = ISOMERISM_TYPES_META[selectedRelation];

  let score = isCorrect ? 1.0 : 0.0;
  let feedback = '';

  if (isCorrect) {
    feedback = `Perfeito! Trata-se de ${expectedMeta.name}. ${expectedMeta.shortDescription}`;
  } else {
    // Partial credit for recognizing the right general category (e.g. plana vs espacial)
    if (
      expectedMeta.category === providedMeta.category &&
      expectedMeta.category !== 'outros'
    ) {
      score = 0.35;
      feedback = `Quase! Você identificou corretamente a categoria (${expectedMeta.category.toUpperCase()}), mas a resposta exata é ${expectedMeta.name}.`;
    } else {
      score = 0.0;
      feedback = `Incorreto. A relação correta é ${expectedMeta.name}. ${expectedMeta.condition}`;
    }
  }

  return {
    correct: isCorrect,
    score,
    feedback,
    expectedName: expectedMeta.name,
    providedName: providedMeta.name,
  };
}

/**
 * Evaluates user's answer in a Chiral Carbon challenge.
 */
export function gradeChiralCount(
  selectedCount: number,
  expectedCount: number
): { correct: boolean; score: number; feedback: string } {
  const isCorrect = selectedCount === expectedCount;
  let score = 0;
  let feedback = '';

  if (isCorrect) {
    score = 1.0;
    feedback = `Exato! A molécula possui ${expectedCount} carbono(s) quiral(is) assimétrico(s) (C*).`;
  } else if (Math.abs(selectedCount - expectedCount) === 1) {
    score = 0.4;
    feedback = `Passou muito perto! A contagem correta é ${expectedCount} carbono(s) quiral(is).`;
  } else {
    score = 0.0;
    feedback = `Incorreto. A estrutura contém ${expectedCount} carbono(s) quiral(is) assimétrico(s).`;
  }

  return { correct: isCorrect, score, feedback };
}

/**
 * Evaluates user's answer in a Geometric Condition challenge.
 */
export function gradeGeometricCondition(
  selectedAnswer: boolean,
  expectedAnswer: boolean,
  reason: string
): { correct: boolean; score: number; feedback: string } {
  const isCorrect = selectedAnswer === expectedAnswer;
  return {
    correct: isCorrect,
    score: isCorrect ? 1.0 : 0.0,
    feedback: isCorrect
      ? `Correto! ${reason}`
      : `Incorreto. ${expectedAnswer ? 'Apresenta' : 'Não apresenta'} isomeria geométrica. ${reason}`,
  };
}
