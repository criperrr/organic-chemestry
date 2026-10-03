import type {
  IsomerPairQuestion,
  ChiralCenterQuestion,
  GeometricConditionQuestion,
} from '@quimicarush/chemistry-core';

/**
 * Curated, chemically validated bank of Isomer Pair Questions.
 * Covers 100% of isomerism types:
 * - Isomeria Plana: função, cadeia, posição, metameria, tautomeria
 * - Isomeria Espacial: geométrica (cis-trans), óptica
 * - Casos de checagem: não isômeros, mesmo composto
 */
export const CANONICAL_ISOMER_PAIRS: IsomerPairQuestion[] = [
  // ==========================================
  // 1. ISOMERIA DE FUNÇÃO
  // ==========================================
  {
    id: 'pair-func-01',
    moleculeA: {
      smiles: 'CCO',
      name: 'Etanol',
      formula: 'C2H6O',
      function: 'alcool',
    },
    moleculeB: {
      smiles: 'COC',
      name: 'Metoximetano (Éter dimetílico)',
      formula: 'C2H6O',
      function: 'eter',
    },
    relation: 'funcao',
    explanation:
      'Ambos possuem fórmula molecular idêntica (C2H6O). No entanto, o etanol pertence à função Álcool (possui hidroxila -OH ligada a carbono saturado, formando pontes de hidrogênio e sendo líquido a 25 °C), enquanto o metoximetano é um Éter (oxigênio heteroátomo entre carbonos, gasoso a 25 °C). Trata-se do par clássico de Isomeria de Função Álcool ↔ Éter.',
    comparison: {
      sameFormula: true,
      formulaA: 'C2H6O',
      formulaB: 'C2H6O',
      differenceSummary: 'Álcool (-OH terminal) vs Éter (-O- heteroátomo)',
      keyClue: 'Funções orgânicas diferentes para a fórmula CnH2n+2O.',
    },
    difficulty: 'iniciante',
    tags: ['alcool', 'eter', 'vestibular-classico'],
  },
  {
    id: 'pair-func-02',
    moleculeA: {
      smiles: 'CCC=O',
      name: 'Propanal',
      formula: 'C3H6O',
      function: 'aldeido',
    },
    moleculeB: {
      smiles: 'CC(=O)C',
      name: 'Propanona (Acetona)',
      formula: 'C3H6O',
      function: 'cetona',
    },
    relation: 'funcao',
    explanation:
      'Ambos possuem a mesma fórmula molecular (C3H6O). O propanal possui carbonila primária na extremidade da cadeia (Aldeído, -CHO), enquanto a propanona possui a carbonila secundária entre dois carbonos (Cetona, -CO-). É o exemplo clássico de Isomeria de Função Aldeído ↔ Cetona (fórmula geral CnH2nO).',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H6O',
      formulaB: 'C3H6O',
      differenceSummary: 'Carbonila terminal (Aldeído) vs Carbonila entre carbonos (Cetona)',
      keyClue: 'Aldeído ↔ Cetona compartilham a fórmula geral CnH2nO.',
    },
    difficulty: 'iniciante',
    tags: ['aldeido', 'cetona', 'vestibular-classico'],
  },
  {
    id: 'pair-func-03',
    moleculeA: {
      smiles: 'CC(=O)O',
      name: 'Ácido etanoico (Ácido acético)',
      formula: 'C2H4O2',
      function: 'acido_carboxilico',
    },
    moleculeB: {
      smiles: 'COC=O',
      name: 'Metanoato de metila (Formiato de metila)',
      formula: 'C2H4O2',
      function: 'ester',
    },
    relation: 'funcao',
    explanation:
      'Ambos têm a fórmula molecular C2H4O2. O ácido acético possui o grupo carboxila (-COOH), conferindo caráter ácido e odor de vinagre. O metanoato de metila é um Éster (-COO-), classe conhecida por aromas agradáveis de frutas e solventes. É o par clássico de Isomeria de Função Ácido Carboxílico ↔ Éter (CnH2nO2).',
    comparison: {
      sameFormula: true,
      formulaA: 'C2H4O2',
      formulaB: 'C2H4O2',
      differenceSummary: 'Carboxila (-COOH) vs Éster (-COO-)',
      keyClue: 'Ácido Carboxílico ↔ Éster compartilham a fórmula CnH2nO2.',
    },
    difficulty: 'iniciante',
    tags: ['acido_carboxilico', 'ester', 'vestibular-classico'],
  },
  {
    id: 'pair-func-04',
    moleculeA: {
      smiles: 'CCCC=O',
      name: 'Butanal',
      formula: 'C4H8O',
      function: 'aldeido',
    },
    moleculeB: {
      smiles: 'CCC(=O)C',
      name: 'Butanona',
      formula: 'C4H8O',
      function: 'cetona',
    },
    relation: 'funcao',
    explanation:
      'Mesma fórmula C4H8O. Butanal é um aldeído (carbonila terminal no C1) e butanona é uma cetona (carbonila interna no C2). Como pertencem a funções orgânicas distintas, são isômeros de função.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8O',
      formulaB: 'C4H8O',
      differenceSummary: 'Aldeído vs Cetona com 4 carbonos',
      keyClue: 'Diferença funcional na carbonila (C1 vs C2).',
    },
    difficulty: 'intermediario',
    tags: ['aldeido', 'cetona'],
  },
  {
    id: 'pair-func-05',
    moleculeA: {
      smiles: 'CCC(=O)O',
      name: 'Ácido propanoico',
      formula: 'C3H6O2',
      function: 'acido_carboxilico',
    },
    moleculeB: {
      smiles: 'CC(=O)OC',
      name: 'Etanoato de metila (Acetato de metila)',
      formula: 'C3H6O2',
      function: 'ester',
    },
    relation: 'funcao',
    explanation:
      'Mesma fórmula C3H6O2. O ácido propanoico tem função ácido carboxílico e o etanoato de metila tem função éster. Isômeros funcionais com 3 carbonos.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H6O2',
      formulaB: 'C3H6O2',
      differenceSummary: 'Ácido carboxílico vs Éster',
      keyClue: 'Ácido propanoico tem -COOH, etanoato de metila tem -COOCH3.',
    },
    difficulty: 'intermediario',
    tags: ['acido_carboxilico', 'ester'],
  },
  {
    id: 'pair-func-06',
    moleculeA: {
      smiles: 'OCc1ccccc1',
      name: 'Álcool benzílico (Fenilmetanol)',
      formula: 'C7H8O',
      function: 'alcool',
    },
    moleculeB: {
      smiles: 'Cc1ccccc1O',
      name: 'o-Cresol (2-Metilfenol)',
      formula: 'C7H8O',
      function: 'fenol',
    },
    relation: 'funcao',
    explanation:
      'Mesma fórmula C7H8O. No álcool benzílico, o grupo -OH está ligado ao carbono alifático sp3 fora do anel (Álcool aromático). No o-cresol, o grupo -OH está ligado diretamente ao anel benzênico sp2 (Fenol). Álcoois e fenóis são funções químicas distintas com reatividades e acidez totalmente diferentes (fenóis são muito mais ácidos).',
    comparison: {
      sameFormula: true,
      formulaA: 'C7H8O',
      formulaB: 'C7H8O',
      differenceSummary: 'Álcool alifático ligado a benzila vs Fenol (OH direto no anel)',
      keyClue: 'OH direto no anel = Fenol; OH fora do anel = Álcool.',
    },
    difficulty: 'avancado',
    tags: ['alcool', 'fenol', 'aromatico', 'vestibular-classico'],
  },

  // ==========================================
  // 2. ISOMERIA DE CADEIA
  // ==========================================
  {
    id: 'pair-cad-01',
    moleculeA: {
      smiles: 'CCCC',
      name: 'Butano',
      formula: 'C4H10',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CC(C)C',
      name: '2-Metilpropano (Isobutano)',
      formula: 'C4H10',
      function: 'hidrocarboneto',
    },
    relation: 'cadeia',
    explanation:
      'Ambos são alcanos hidrocarbonetos saturados de fórmula C4H10. O butano possui cadeia contínua/normal (linear), enquanto o 2-metilpropano possui cadeia ramificada (carbono terciário central). Portanto, são isômeros de cadeia.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H10',
      formulaB: 'C4H10',
      differenceSummary: 'Cadeia linear normal vs Cadeia ramificada',
      keyClue: 'Mesma função hidrocarboneto, esqueleto de carbono diferente.',
    },
    difficulty: 'iniciante',
    tags: ['alcano', 'cadeia-ramificada'],
  },
  {
    id: 'pair-cad-02',
    moleculeA: {
      smiles: 'CCC=C',
      name: 'But-1-eno',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'C1CCC1',
      name: 'Ciclobutano',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    relation: 'cadeia',
    explanation:
      'Ambos são hidrocarbonetos de fórmula C4H8. O but-1-eno é um alceno de cadeia aberta (acíclica) com uma dupla ligação. O ciclobutano é um ciclane de cadeia fechada (cíclica) saturada. Como a diferença estrutural reside no fechamento da cadeia carbônica (aberta vs fechada), trata-se de Isomeria de Cadeia.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8',
      formulaB: 'C4H8',
      differenceSummary: 'Cadeia aberta insaturada vs Cadeia fechada saturada (anel)',
      keyClue: 'Alcenos e ciclanos de mesmo número de carbonos (CnH2n) são isômeros de cadeia.',
    },
    difficulty: 'intermediario',
    tags: ['alceno', 'cicloalcano', 'vestibular-classico'],
  },
  {
    id: 'pair-cad-03',
    moleculeA: {
      smiles: 'CCCCC',
      name: 'Pentano',
      formula: 'C5H12',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CCC(C)C',
      name: '2-Metilbutano (Isopentano)',
      formula: 'C5H12',
      function: 'hidrocarboneto',
    },
    relation: 'cadeia',
    explanation:
      'Ambos compartilham a fórmula C5H12 e a mesma função (hidrocarboneto alcano). O pentano tem cadeia normal de 5 carbonos contínuos, e o isopentano tem cadeia ramificada de 4 carbonos com uma ramificação metil.',
    comparison: {
      sameFormula: true,
      formulaA: 'C5H12',
      formulaB: 'C5H12',
      differenceSummary: 'Cadeia normal linear vs Cadeia ramificada',
      keyClue: 'Pentano (normal) e 2-metilbutano (ramificada).',
    },
    difficulty: 'iniciante',
    tags: ['alcano', 'ramificacao'],
  },
  {
    id: 'pair-cad-04',
    moleculeA: {
      smiles: 'C1CCC1',
      name: 'Ciclobutano',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CC1CC1',
      name: 'Metilciclopropano',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    relation: 'cadeia',
    explanation:
      'Ambos têm fórmula C4H8 e pertencem à classe dos cicloalcanos. O ciclobutano tem anel de 4 membros sem ramificações, enquanto o metilciclopropano tem anel de 3 membros com uma ramificação metil externa. A diferença no tamanho e ramificação do esqueleto cíclico configura Isomeria de Cadeia.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8',
      formulaB: 'C4H8',
      differenceSummary: 'Anel não-ramificado de 4C vs Anel de 3C com ramificação metil',
      keyClue: 'Diferença no esqueleto da cadeia cíclica.',
    },
    difficulty: 'intermediario',
    tags: ['cicloalcano', 'anel'],
  },
  {
    id: 'pair-cad-05',
    moleculeA: {
      smiles: 'CCCN',
      name: 'Propilamina (Propan-1-amina)',
      formula: 'C3H9N',
      function: 'amina',
    },
    moleculeB: {
      smiles: 'CC(C)N',
      name: 'Isopropilamina (Propan-2-amina)',
      formula: 'C3H9N',
      function: 'amina',
    },
    relation: 'cadeia',
    explanation:
      'Ambas são aminas primárias (-NH2) de fórmula C3H9N. A propilamina possui o radical propil linear (cadeia normal), enquanto a isopropilamina possui o radical isopropil ramificado. É uma clássica isomeria de cadeia entre radicais acíclicos.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H9N',
      formulaB: 'C3H9N',
      differenceSummary: 'Radical linear n-propil vs Radical ramificado isopropil',
      keyClue: 'Ambas aminas primárias, mas o esqueleto carbônico do radical é diferente.',
    },
    difficulty: 'intermediario',
    tags: ['amina', 'ramificacao'],
  },

  // ==========================================
  // 3. ISOMERIA DE POSIÇÃO
  // ==========================================
  {
    id: 'pair-pos-01',
    moleculeA: {
      smiles: 'CCCO',
      name: 'Propan-1-ol',
      formula: 'C3H8O',
      function: 'alcool',
    },
    moleculeB: {
      smiles: 'CC(O)C',
      name: 'Propan-2-ol (Álcool isopropílico)',
      formula: 'C3H8O',
      function: 'alcool',
    },
    relation: 'posicao',
    explanation:
      'Ambos são álcoois de fórmula C3H8O com a mesma cadeia principal linear de 3 carbonos. No propan-1-ol a hidroxila está no carbono 1 (álcool primário), e no propan-2-ol a hidroxila está no carbono 2 (álcool secundário). Como a cadeia carbônica e a função são idênticas, mudando unicamente o localizador do grupo funcional, é Isomeria de Posição.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H8O',
      formulaB: 'C3H8O',
      differenceSummary: 'Hidroxila no carbono 1 vs Hidroxila no carbono 2',
      keyClue: 'Mesma função e mesma cadeia, apenas o número do localizador varia.',
    },
    difficulty: 'iniciante',
    tags: ['alcool', 'posicao-grupo-funcional'],
  },
  {
    id: 'pair-pos-02',
    moleculeA: {
      smiles: 'CCC=C',
      name: 'But-1-eno',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CC=CC',
      name: 'But-2-eno',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    relation: 'posicao',
    explanation:
      'Ambos são alcenos de fórmula C4H8 com cadeia linear de 4 carbonos. No but-1-eno, a dupla ligação situa-se entre os carbonos 1 e 2. No but-2-eno, a dupla ligação está entre os carbonos 2 e 3. Mudança exclusiva na posição da insaturação: Isomeria de Posição.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8',
      formulaB: 'C4H8',
      differenceSummary: 'Dupla ligação no C1 vs Dupla ligação no C2',
      keyClue: 'Insaturação deslocada ao longo da mesma cadeia linear.',
    },
    difficulty: 'iniciante',
    tags: ['alceno', 'insaturacao'],
  },
  {
    id: 'pair-pos-03',
    moleculeA: {
      smiles: 'CCCC#C',
      name: 'Pent-1-ino',
      formula: 'C5H8',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CCC#CC',
      name: 'Pent-2-ino',
      formula: 'C5H8',
      function: 'hidrocarboneto',
    },
    relation: 'posicao',
    explanation:
      'Ambos são alcinos lineares com 5 carbonos e fórmula C5H8. No pent-1-ino a tripla ligação está no C1, enquanto no pent-2-ino a tripla está no C2. É isomeria de posição da insaturação.',
    comparison: {
      sameFormula: true,
      formulaA: 'C5H8',
      formulaB: 'C5H8',
      differenceSummary: 'Tripla ligação no C1 vs C2',
      keyClue: 'Mudança de localizador da tripla ligação (#).',
    },
    difficulty: 'intermediario',
    tags: ['alcino', 'insaturacao'],
  },
  {
    id: 'pair-pos-04',
    moleculeA: {
      smiles: 'Cc1ccccc1C',
      name: '1,2-Dimetilbenzeno (o-Xileno)',
      formula: 'C8H10',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'Cc1cccc(C)c1',
      name: '1,3-Dimetilbenzeno (m-Xileno)',
      formula: 'C8H10',
      function: 'hidrocarboneto',
    },
    relation: 'posicao',
    explanation:
      'Ambos são hidrocarbonetos aromáticos dissubstituídos de fórmula C8H10. O o-xileno tem substituintes nas posições adjacentes 1,2 (orto), enquanto o m-xileno tem substituintes nas posições alternadas 1,3 (meta). A diferença exclusiva na posição dos radicais no anel aromático caracteriza Isomeria de Posição.',
    comparison: {
      sameFormula: true,
      formulaA: 'C8H10',
      formulaB: 'C8H10',
      differenceSummary: 'Posição 1,2 (orto) vs Posição 1,3 (meta)',
      keyClue: 'Isomeria orto/meta/para em anéis aromáticos é sempre de posição.',
    },
    difficulty: 'intermediario',
    tags: ['aromatico', 'xileno', 'orto-meta-para'],
  },
  {
    id: 'pair-pos-05',
    moleculeA: {
      smiles: 'CCCCl',
      name: '1-Cloropropano',
      formula: 'C3H7Cl',
      function: 'haleto_alquila',
    },
    moleculeB: {
      smiles: 'CC(Cl)C',
      name: '2-Cloropropano',
      formula: 'C3H7Cl',
      function: 'haleto_alquila',
    },
    relation: 'posicao',
    explanation:
      'Ambos são haletos de alquila de fórmula C3H7Cl. O halogênio cloro está ligado no C1 no 1-cloropropano e no C2 no 2-cloropropano. Isomeria de posição do heteroátomo substituinte.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H7Cl',
      formulaB: 'C3H7Cl',
      differenceSummary: 'Cloro no carbono 1 vs Cloro no carbono 2',
      keyClue: 'Substituinte cloro mudando de carbono na cadeia.',
    },
    difficulty: 'iniciante',
    tags: ['haleto_alquila', 'posicao'],
  },

  // ==========================================
  // 4. METAMERIA (COMPENSAÇÃO)
  // ==========================================
  {
    id: 'pair-meta-01',
    moleculeA: {
      smiles: 'COCCC',
      name: 'Metoxipropano (Éter metil-propílico)',
      formula: 'C4H10O',
      function: 'eter',
    },
    moleculeB: {
      smiles: 'CCOCC',
      name: 'Etoxietano (Éter dietílico)',
      formula: 'C4H10O',
      function: 'eter',
    },
    relation: 'metameria',
    explanation:
      'Ambos são éteres com fórmula molecular C4H10O. No metoxipropano, o heteroátomo de oxigênio separa um radical metil (1C) de um propil (3C): C1-O-C3. No etoxietano, o oxigênio está centralizado separando dois radicais etil (2C): C2-O-C2. Quando a posição do heteroátomo varia ao longo da cadeia, chama-se Metameria ou Isomeria de Compensação.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H10O',
      formulaB: 'C4H10O',
      differenceSummary: 'Heteroátomo O dividindo 1C|3C vs 2C|2C',
      keyClue: 'Heteroátomo intercalado com distribuição de carbonos diferente.',
    },
    difficulty: 'intermediario',
    tags: ['eter', 'heteroatomo', 'metameria-classica'],
  },
  {
    id: 'pair-meta-02',
    moleculeA: {
      smiles: 'CCCN C',
      name: 'N-Metilpropan-1-amina (Metilpropilamina)',
      formula: 'C4H11N',
      function: 'amina',
    },
    moleculeB: {
      smiles: 'CCNCC',
      name: 'Dietilamina',
      formula: 'C4H11N',
      function: 'amina',
    },
    relation: 'metameria',
    explanation:
      'Ambas são aminas secundárias (-NH-) de fórmula C4H11N. Na metilpropilamina, o nitrogênio heteroátomo divide um metil (1C) e um propil (3C). Na dietilamina, divide dois etis (2C e 2C). Trata-se de Metameria (compensação entre os grupos alquila ligados ao heteroátomo N).',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H11N',
      formulaB: 'C4H11N',
      differenceSummary: 'Heteroátomo de nitrogênio dividindo 1C|3C vs 2C|2C',
      keyClue: 'Amina secundária com heteroátomo N em posições relativas distintas.',
    },
    difficulty: 'intermediario',
    tags: ['amina', 'heteroatomo', 'metameria'],
  },
  {
    id: 'pair-meta-03',
    moleculeA: {
      smiles: 'CCC(=O)OC',
      name: 'Propanoato de metila',
      formula: 'C4H8O2',
      function: 'ester',
    },
    moleculeB: {
      smiles: 'CC(=O)OCC',
      name: 'Etanoato de etila (Acetato de etila)',
      formula: 'C4H8O2',
      function: 'ester',
    },
    relation: 'metameria',
    explanation:
      'Ambos são ésteres de fórmula C4H8O2. O propanoato de metila tem a parte acila com 3 carbonos e o radical alcoxi com 1 carbono (CH3CH2COO - CH3). O acetato de etila tem acila com 2 carbonos e alcoxi com 2 carbonos (CH3COO - CH2CH3). A mudança de carbonos em torno do oxigênio central caracteriza Metameria.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8O2',
      formulaB: 'C4H8O2',
      differenceSummary: 'Éster com 3C|1C vs Éster com 2C|2C ao redor do -COO-',
      keyClue: 'Distribuição dos carbonos dos radicais em torno do heteroátomo do éster.',
    },
    difficulty: 'avancado',
    tags: ['ester', 'heteroatomo', 'metameria'],
  },
  {
    id: 'pair-meta-04',
    moleculeA: {
      smiles: 'CSCCC',
      name: 'Metilsulfanilpropano (Metil-propil-tioéter)',
      formula: 'C4H10S',
      function: 'tioeter',
    },
    moleculeB: {
      smiles: 'CCSCC',
      name: 'Etilsulfanile खेल (Dietiltioéter)',
      formula: 'C4H10S',
      function: 'tioeter',
    },
    relation: 'metameria',
    explanation:
      'Ambos são tioéteres de fórmula C4H10S onde o enxofre atua como heteroátomo bridging (-S-). Em A temos 1C-S-3C e em B temos 2C-S-2C. Trata-se de metameria envolvendo heteroátomo de enxofre.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H10S',
      formulaB: 'C4H10S',
      differenceSummary: 'Heteroátomo S entre 1C|3C vs 2C|2C',
      keyClue: 'Heteroátomo enxofre variando radicais adjacentes.',
    },
    difficulty: 'avancado',
    tags: ['tioeter', 'enxofre', 'metameria'],
  },

  // ==========================================
  // 5. TAUTOMERIA (DINÂMICA)
  // ==========================================
  {
    id: 'pair-taut-01',
    moleculeA: {
      smiles: 'CC(=O)C',
      name: 'Propanona (Forma Ceto)',
      formula: 'C3H6O',
      function: 'cetona',
    },
    moleculeB: {
      smiles: 'CC(=C)O',
      name: 'Prop-1-en-2-ol (Forma Enol)',
      formula: 'C3H6O',
      function: 'enol',
    },
    relation: 'tautomeria',
    explanation:
      'Ambos possuem a fórmula C3H6O e coexistem em equilíbrio químico dinâmico e espontâneo em solução (Tautomeria Ceto-Enólica). O hidrogênio do carbono alfa migra para o oxigênio da carbonila, transformando a dupla C=O numa ligação C=C e gerando uma hidroxila enólica (-OH ligada a carbono com dupla ligação). A forma ceto é a predominante por ser termodinamicamente mais estável.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H6O',
      formulaB: 'C3H6O',
      differenceSummary: 'Cetona (C=O) em equilíbrio dinâmico com Enol (C=C-OH)',
      keyClue: 'Migração de H concomitante à transposição da dupla: Cetona ⇌ Enol.',
    },
    difficulty: 'intermediario',
    tags: ['cetona', 'enol', 'tautomeria-cetoenolica', 'vestibular-classico'],
  },
  {
    id: 'pair-taut-02',
    moleculeA: {
      smiles: 'CC=O',
      name: 'Etanal (Acetaldeído - Forma Aldo)',
      formula: 'C2H4O',
      function: 'aldeido',
    },
    moleculeB: {
      smiles: 'C=CO',
      name: 'Etenol (Álcool vinílico - Forma Enol)',
      formula: 'C2H4O',
      function: 'enol',
    },
    relation: 'tautomeria',
    explanation:
      'Ambos possuem a fórmula C2H4O. Estão em equilíbrio químico dinâmico aldo-enólico: o aldeído etanal se converte reversivelmente em etenol pela migração do próton para o oxigênio. Trata-se de Tautomeria Aldo-Enólica.',
    comparison: {
      sameFormula: true,
      formulaA: 'C2H4O',
      formulaB: 'C2H4O',
      differenceSummary: 'Aldeído em equilíbrio com Enol',
      keyClue: 'Aldeído ⇌ Enol constitui tautomeria aldoenólica.',
    },
    difficulty: 'intermediario',
    tags: ['aldeido', 'enol', 'tautomeria-aldoenolica'],
  },
  {
    id: 'pair-taut-03',
    moleculeA: {
      smiles: 'O=C1CCCCC1',
      name: 'Ciclo-hexanona (Forma Ceto)',
      formula: 'C6H10O',
      function: 'cetona',
    },
    moleculeB: {
      smiles: 'OC1=CCCCC1',
      name: 'Ciclo-hex-1-en-1-ol (Forma Enol)',
      formula: 'C6H10O',
      function: 'enol',
    },
    relation: 'tautomeria',
    explanation:
      'Mesma fórmula C6H10O no anel de seis membros. A ciclo-hexanona (cetona cíclica) sofre enolização formando ciclo-hex-1-en-1-ol (enol cíclico). Esse equilíbrio tautomérico é crucial em reações orgânicas como halogenação alfa e condensação aldólica.',
    comparison: {
      sameFormula: true,
      formulaA: 'C6H10O',
      formulaB: 'C6H10O',
      differenceSummary: 'Cetona cíclica em equilíbrio dinâmico com enol cíclico',
      keyClue: 'Enolização em anel cíclico: tautomeria.',
    },
    difficulty: 'avancado',
    tags: ['ciclo', 'cetona', 'enol', 'tautomeria'],
  },

  // ==========================================
  // 6. ISOMERIA GEOMÉTRICA (CIS-TRANS / Z-E)
  // ==========================================
  {
    id: 'pair-geom-01',
    moleculeA: {
      smiles: 'C/C=C\\C',
      name: 'cis-But-2-eno ((Z)-but-2-eno)',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'C/C=C/C',
      name: 'trans-But-2-eno ((E)-but-2-eno)',
      formula: 'C4H8',
      function: 'hidrocarboneto',
    },
    relation: 'geometrica',
    explanation:
      'Ambos possuem conectividade idêntica de átomos e fórmula C4H8, mas diferem na disposição espacial dos ligantes ao redor da dupla ligação rígida C=C. No cis-but-2-eno, os dois grupos metil (-CH3) situam-se do mesmo lado do plano da dupla. No trans-but-2-eno, os grupos metil estão em lados opostos. Trata-se do clássico supremo da Isomeria Geométrica (Cis-Trans / Z-E).',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H8',
      formulaB: 'C4H8',
      differenceSummary: 'Grupos metil no mesmo plano (Cis) vs Planos opostos (Trans)',
      keyClue: 'Ligação dupla com ligantes distintos em cada carbono: R1 ≠ R2 e R3 ≠ R4.',
    },
    difficulty: 'iniciante',
    tags: ['alceno', 'cis-trans', 'estereoisomeria', 'vestibular-classico'],
  },
  {
    id: 'pair-geom-02',
    moleculeA: {
      smiles: 'Cl/C=C\\Cl',
      name: 'cis-1,2-Dicloroeteno',
      formula: 'C2H2Cl2',
      function: 'haleto_alquila',
    },
    moleculeB: {
      smiles: 'Cl/C=C/Cl',
      name: 'trans-1,2-Dicloroeteno',
      formula: 'C2H2Cl2',
      function: 'haleto_alquila',
    },
    relation: 'geometrica',
    explanation:
      'Mesma fórmula C2H2Cl2. No isômero cis, os átomos de cloro altamente eletronegativos estão do mesmo lado, resultando em momento dipolar resultante não nulo (molécula polar, maior ponto de ebulição). No trans, os momentos de dipolo dos cloros se anulam por estarem em lados opostos (molécula apolar). Isomeria Geométrica com impacto marcante nas propriedades físicas.',
    comparison: {
      sameFormula: true,
      formulaA: 'C2H2Cl2',
      formulaB: 'C2H2Cl2',
      differenceSummary: 'Átomos de cloro no mesmo lado (Cis/Polar) vs Lados opostos (Trans/Apolar)',
      keyClue: 'Diferença espacial ao longo do plano da dupla ligação.',
    },
    difficulty: 'intermediario',
    tags: ['haleto_alquila', 'cis-trans', 'polaridade'],
  },
  {
    id: 'pair-geom-03',
    moleculeA: {
      smiles: 'OC(=O)/C=C\\C(=O)O',
      name: 'Ácido maleico (Ácido cis-butenodioico)',
      formula: 'C4H4O4',
      function: 'acido_carboxilico',
    },
    moleculeB: {
      smiles: 'OC(=O)/C=C/C(=O)O',
      name: 'Ácido fumárico (Ácido trans-butenodioico)',
      formula: 'C4H4O4',
      function: 'acido_carboxilico',
    },
    relation: 'geometrica',
    explanation:
      'Ambos possuem a fórmula C4H4O4. O ácido maleico (cis) tem as duas carboxilas próximas do mesmo lado da dupla, permitindo formar facilmente um anidrido cíclico por aquecimento. O ácido fumárico (trans) possui as carboxilas em lados opostos e não forma anidrido cíclico intramolecular. É um dos maiores clássicos de Isomeria Geométrica dos vestibulares.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H4O4',
      formulaB: 'C4H4O4',
      differenceSummary: 'Carboxilas no mesmo lado (cis/maleico) vs opostos (trans/fumárico)',
      keyClue: 'Ácido maleico (cis) e Ácido fumárico (trans).',
    },
    difficulty: 'avancado',
    tags: ['acido_carboxilico', 'cis-trans', 'vestibular-classico'],
  },
  {
    id: 'pair-geom-04',
    moleculeA: {
      smiles: 'C1[C@H](C)[C@@H]1C',
      name: 'cis-1,2-Dimetilciclopropano',
      formula: 'C5H10',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'C1[C@H](C)[C@H]1C',
      name: 'trans-1,2-Dimetilciclopropano',
      formula: 'C5H10',
      function: 'hidrocarboneto',
    },
    relation: 'geometrica',
    explanation:
      'Ambos têm fórmula C5H10 e cadeia cíclica fechada de 3 carbonos. No isômero cis, os dois grupos metil apontam para a mesma face do plano do anel ciclopropano. No isômero trans, um aponta para cima e outro para baixo. A rigidez do anel impede a rotação livre, criando Isomeria Geométrica em Ciclos (isomeria bayeriana).',
    comparison: {
      sameFormula: true,
      formulaA: 'C5H10',
      formulaB: 'C5H10',
      differenceSummary: 'Metis na mesma face do anel (Cis) vs Faces opostas (Trans)',
      keyClue: 'Isomeria geométrica em compostos cíclicos (anel rígido).',
    },
    difficulty: 'avancado',
    tags: ['cicloalcano', 'cis-trans-ciclos'],
  },

  // ==========================================
  // 7. ISOMERIA ÓPTICA (QUIRALIDADE)
  // ==========================================
  {
    id: 'pair-opt-01',
    moleculeA: {
      smiles: 'C[C@@H](O)C(=O)O',
      name: '(R)-Ácido lático (Dextrógiro / d-lático)',
      formula: 'C3H6O3',
      function: 'acido_carboxilico',
    },
    moleculeB: {
      smiles: 'C[C@H](O)C(=O)O',
      name: '(S)-Ácido lático (Levógiro / l-lático)',
      formula: 'C3H6O3',
      function: 'acido_carboxilico',
    },
    relation: 'optica',
    explanation:
      'Ambas as estruturas possuem fórmula C3H6O3 e têm o carbono central (C2) assimétrico / quiral (C*), ligado a 4 grupos distintos: -H, -OH, -CH3 e -COOH. As duas moléculas são imagens especulares não sobreponíveis uma da outra (Enantiômeros). Uma desvia o plano da luz polarizada para a direita (dextrógiro, +) e a outra para a esquerda (levógiro, -). Trata-se de Isomeria Óptica.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H6O3',
      formulaB: 'C3H6O3',
      differenceSummary: 'Enantiômeros especulares: desviam a luz polarizada em sentidos opostos',
      keyClue: 'Presença de carbono quiral (C*) com 4 ligantes diferentes.',
    },
    difficulty: 'intermediario',
    tags: ['acido_carboxilico', 'quiralidade', 'enantiomeros', 'vestibular-classico'],
  },
  {
    id: 'pair-opt-02',
    moleculeA: {
      smiles: 'O=C[C@@H](O)CO',
      name: 'D-Gliceraldeído',
      formula: 'C3H6O3',
      function: 'aldeido',
    },
    moleculeB: {
      smiles: 'O=C[C@H](O)CO',
      name: 'L-Gliceraldeído',
      formula: 'C3H6O3',
      function: 'aldeido',
    },
    relation: 'optica',
    explanation:
      'O gliceraldeído é a molécula padrão de referência da estereoquímica de carboidratos e aminoácidos. O carbono 2 é quiral, ligado a -H, -OH, -CHO e -CH2OH. As formas D e L são enantiômeros ópticos que desviam a luz polarizada em direções contrárias.',
    comparison: {
      sameFormula: true,
      formulaA: 'C3H6O3',
      formulaB: 'C3H6O3',
      differenceSummary: 'Par de enantiômeros D/L do padrão de Fischer',
      keyClue: 'Quiralidade no C2 com 4 ligantes diferentes.',
    },
    difficulty: 'intermediario',
    tags: ['aldeido', 'acucar', 'quiralidade'],
  },
  {
    id: 'pair-opt-03',
    moleculeA: {
      smiles: 'CC1=CC[C@@H](CC1)C(=C)C',
      name: '(R)-Limoneno (Aroma de Laranja)',
      formula: 'C10H16',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CC1=CC[C@H](CC1)C(=C)C',
      name: '(S)-Limoneno (Aroma de Pinho / Limão)',
      formula: 'C10H16',
      function: 'hidrocarboneto',
    },
    relation: 'optica',
    explanation:
      'O limoneno possui um carbono quiral no anel. Os dois enantiômeros (R e S) possuem mesmíssimas propriedades físicas comuns (PF, PE, densidade), mas interagem de maneira totalmente diferente com os receptores olfativos quirais humanos: o (R)-limoneno cheira a laranja doce e o (S)-limoneno cheira a terebintina e limão.',
    comparison: {
      sameFormula: true,
      formulaA: 'C10H16',
      formulaB: 'C10H16',
      differenceSummary: 'Enantiômeros com percepção olfativa estereoespecífica',
      keyClue: 'Enantiômeros com atividade biológica distinta.',
    },
    difficulty: 'avancado',
    tags: ['terpeno', 'quiralidade', 'olfato'],
  },

  // ==========================================
  // 8. NÃO SÃO ISÔMEROS
  // ==========================================
  {
    id: 'pair-nao-01',
    moleculeA: {
      smiles: 'CCO',
      name: 'Etanol',
      formula: 'C2H6O',
      function: 'alcool',
    },
    moleculeB: {
      smiles: 'CCCO',
      name: 'Propan-1-ol',
      formula: 'C3H8O',
      function: 'alcool',
    },
    relation: 'nao_isomeros',
    explanation:
      'Atenção à regra fundamental da isomeria: para serem isômeros, as moléculas DEVEM OBRIGATORIAMENTE possuir a mesma fórmula molecular. O etanol possui 2 carbonos (C2H6O) e o propan-1-ol possui 3 carbonos (C3H8O). Pertencem à mesma série homóloga (diferem por um grupo -CH2-), portanto NÃO são isômeros.',
    comparison: {
      sameFormula: false,
      formulaA: 'C2H6O',
      formulaB: 'C3H8O',
      differenceSummary: 'Fórmulas moleculares diferentes (C2 vs C3)',
      keyClue: 'Contagem de átomos de carbono diferente.',
    },
    difficulty: 'iniciante',
    tags: ['pegadinha', 'homologo', 'nao-isomeros'],
  },
  {
    id: 'pair-nao-02',
    moleculeA: {
      smiles: 'CC(=O)C',
      name: 'Propanona',
      formula: 'C3H6O',
      function: 'cetona',
    },
    moleculeB: {
      smiles: 'CCC(=O)C',
      name: 'Butanona',
      formula: 'C4H8O',
      function: 'cetona',
    },
    relation: 'nao_isomeros',
    explanation:
      'A propanona possui fórmula C3H6O e a butanona possui C4H8O. Como o número de carbonos e hidrogênios difere, não há relação de isomeria entre elas.',
    comparison: {
      sameFormula: false,
      formulaA: 'C3H6O',
      formulaB: 'C4H8O',
      differenceSummary: 'C3H6O vs C4H8O',
      keyClue: 'Fórmulas moleculares desiguais.',
    },
    difficulty: 'iniciante',
    tags: ['pegadinha', 'nao-isomeros'],
  },

  // ==========================================
  // 9. MESMO COMPOSTO (IDÊNTICOS)
  // ==========================================
  {
    id: 'pair-same-01',
    moleculeA: {
      smiles: 'CCCC',
      name: 'Butano (desenho linear)',
      formula: 'C4H10',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'C(C)CC',
      name: 'Butano (desenho dobrado)',
      formula: 'C4H10',
      function: 'hidrocarboneto',
    },
    relation: 'mesmo_composto',
    explanation:
      'As duas estruturas representam o exato mesmo composto químico: o n-butano (C4H10). A rotação livre em torno das ligações simples carbono-carbono (ligações sigma) permite diferentes conformações espaciais, mas não altera a conectividade nem cria um novo isômero. Ambas são a mesma substância.',
    comparison: {
      sameFormula: true,
      formulaA: 'C4H10',
      formulaB: 'C4H10',
      differenceSummary: 'Mesma conectividade, apenas representação gráfica dobrada',
      keyClue: 'Rotação em torno de ligação simples sigma não gera isômero.',
    },
    difficulty: 'intermediario',
    tags: ['pegadinha', 'conformacao', 'mesmo-composto'],
  },
  {
    id: 'pair-same-02',
    moleculeA: {
      smiles: 'CCC(C)C',
      name: '2-Metilbutano',
      formula: 'C5H12',
      function: 'hidrocarboneto',
    },
    moleculeB: {
      smiles: 'CC(C)CC',
      name: '2-Metilbutano (invertido)',
      formula: 'C5H12',
      function: 'hidrocarboneto',
    },
    relation: 'mesmo_composto',
    explanation:
      'Pela regra IUPAC, a numeração da cadeia principal deve começar pela extremidade mais próxima da ramificação. Seja lendo da esquerda para a direita ou da direita para a esquerda, a molécula é o 2-metilbutano. É a mesmíssima molécula apenas rotacionada em 180° no plano.',
    comparison: {
      sameFormula: true,
      formulaA: 'C5H12',
      formulaB: 'C5H12',
      differenceSummary: 'Mesma molécula numerada por direções invertidas',
      keyClue: 'Numeração IUPAC resulta no mesmo nome: 2-metilbutano.',
    },
    difficulty: 'intermediario',
    tags: ['pegadinha', 'numeracao-iupac', 'mesmo-composto'],
  },
];

/**
 * Curated Bank of Chiral Center & Optical Isomerism Questions.
 */
export const CANONICAL_CHIRAL_QUESTIONS: ChiralCenterQuestion[] = [
  {
    id: 'chiral-01',
    molecule: {
      smiles: 'C[C@@H](O)C(=O)O',
      name: 'Ácido lático (Ácido 2-hidroxipropanoico)',
      formula: 'C3H6O3',
      realWorldStory:
        'Produzido nos músculos durante exercício anaeróbico intenso e responsável pelo azedamento do leite no iogurte.',
    },
    chiralCarbonCount: 1,
    chiralCarbonDescriptions: [
      'Carbono 2 (C2): ligado a -H, -OH, -CH3 e -COOH (4 ligantes químicos totalmente distintos).',
    ],
    opticallyActiveCount: 2, // 2^1 = 2 (dextrógiro e levógiro)
    racemicMixCount: 1, // 2^0 = 1 mistura racêmica
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'O ácido lático possui exatamente 1 carbono assimétrico/quiral (C2). Pela fórmula de van \'t Hoff (2ⁿ), possui 2¹ = 2 isômeros opticamente ativos (d-lático e l-lático) e 2¹⁻¹ = 1 mistura racêmica inativa por compensação externa.',
    difficulty: 'iniciante',
  },
  {
    id: 'chiral-02',
    molecule: {
      smiles: 'CCC(C)O',
      name: 'Butan-2-ol (sec-Butanol)',
      formula: 'C4H10O',
      realWorldStory:
        'Solvente industrial comum usado na fabricação de tintas, resinas e ésteres de aromas.',
    },
    chiralCarbonCount: 1,
    chiralCarbonDescriptions: [
      'Carbono 2 (C2): ligado a -H, -OH, -CH3 (metil) e -CH2CH3 (etil). 4 ligantes diferentes!',
    ],
    opticallyActiveCount: 2,
    racemicMixCount: 1,
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'O C2 está ligado a quatro grupos químicos diferentes entre si: hidrogênio (-H), hidroxila (-OH), metil (-CH3) e etil (-CH2CH3). Portanto, é quiral e apresenta 2 isômeros ópticos ativos (enantiômeros).',
    difficulty: 'iniciante',
  },
  {
    id: 'chiral-03',
    molecule: {
      smiles: 'CC(N)C(=O)O',
      name: 'Alanina (Ácido 2-aminopropanoico)',
      formula: 'C3H7NO2',
      realWorldStory:
        'Um dos 20 aminoácidos essenciais formadores das proteínas em todos os seres vivos da Terra.',
    },
    chiralCarbonCount: 1,
    chiralCarbonDescriptions: [
      'Carbono alfa (C2): ligado a -H, -NH2 (amina), -CH3 e -COOH (carboxila).',
    ],
    opticallyActiveCount: 2,
    racemicMixCount: 1,
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'A alanina possui 1 carbono assimétrico central (o carbono alfa). Apresenta os estereoisômeros L-alanina (incorporada nos ribossomos biológicos) e D-alanina (presente na parede celular bacteriana).',
    difficulty: 'iniciante',
  },
  {
    id: 'chiral-04',
    molecule: {
      smiles: 'O=C[C@@H](O)CO',
      name: 'Gliceraldeído (2,3-Di-hidroxipropanal)',
      formula: 'C3H6O3',
      realWorldStory:
        'A aldotriose mais simples, intermediário chave na via da glicólise biológica.',
    },
    chiralCarbonCount: 1,
    chiralCarbonDescriptions: [
      'Carbono 2 (C2): ligado a -H, -OH, -CHO (aldeído) e -CH2OH.',
    ],
    opticallyActiveCount: 2,
    racemicMixCount: 1,
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'Possui 1 centro quiral no C2. O C1 não é quiral pois tem ligação dupla C=O (geometria planar sp2), e o C3 tem 2 hidrogênios idênticos (-CH2-). Logo, 2 isômeros opticamente ativos.',
    difficulty: 'intermediario',
  },
  {
    id: 'chiral-05',
    molecule: {
      smiles: 'O=C(O)[C@@H](O)[C@H](O)C(=O)O',
      name: 'Ácido tartárico (Ácido 2,3-di-hidroxibutanodioico)',
      formula: 'C4H6O6',
      realWorldStory:
        'Substância histórica isolada por Louis Pasteur em 1848, que inaugurou a estereoquímica ao separar cristais dextrógiros e levógiros à mão com pinça sob microscópio!',
    },
    chiralCarbonCount: 2,
    chiralCarbonDescriptions: [
      'Carbono 2 (C2): ligado a -H, -OH, -COOH e ao grupo C3 (-CH(OH)COOH).',
      'Carbono 3 (C3): ligado a -H, -OH, -COOH e ao grupo C2 (-CH(OH)COOH).',
    ],
    opticallyActiveCount: 2, // d e l (devido à simetria interna, 2^(n-1) = 2)
    racemicMixCount: 1,
    hasMesoForm: true,
    isChiralMolecule: true,
    explanation:
      'O ácido tartárico possui 2 carbonos assimétricos IDÊNTICOS (com o mesmo conjunto de 4 ligantes). Devido a essa simetria interna, ele possui: 2 isômeros opticamente ativos (dextrógiro e levógiro), 1 mistura racêmica e 1 COMPOSTO MESO inativo por compensação interna (a metade superior da molécula é a imagem especular da metade inferior)!',
    difficulty: 'avancado',
  },
  {
    id: 'chiral-06',
    molecule: {
      smiles: 'CC(C)C1CCC(C)CC1O',
      name: 'Mentol',
      formula: 'C10H20O',
      realWorldStory:
        'Composto orgânico extraído do óleo de hortelã que ativa os receptores sensoriais de frio TRPM8 na mucosa da boca.',
    },
    chiralCarbonCount: 3,
    chiralCarbonDescriptions: [
      'C1 (com -OH): ligado a -H, -OH e dois caminhos de anel diferentes.',
      'C2 (com isopropil): ligado a -H, -CH(CH3)2 e dois caminhos de anel diferentes.',
      'C5 (com metil): ligado a -H, -CH3 e dois caminhos de anel diferentes.',
    ],
    opticallyActiveCount: 8, // 2^3 = 8
    racemicMixCount: 4, // 2^2 = 4
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'O mentol possui 3 carbonos quirais assimétricos no anel ciclo-hexano. Pela fórmula 2ⁿ, existem 2³ = 8 estereoisômeros opticamente ativos possíveis (4 pares enantioméricos).',
    difficulty: 'avancado',
  },
  {
    id: 'chiral-07',
    molecule: {
      smiles: 'O=C[C@@H](O)[C@H](O)[C@@H](O)[C@@H](O)CO',
      name: 'D-Glicose (Forma aberta)',
      formula: 'C6H12O6',
      realWorldStory:
        'A principal fonte de energia metabólica celular do corpo humano e dos mamíferos.',
    },
    chiralCarbonCount: 4,
    chiralCarbonDescriptions: [
      'Carbono 2 (C2 quiral)',
      'Carbono 3 (C3 quiral)',
      'Carbono 4 (C4 quiral)',
      'Carbono 5 (C5 quiral)',
    ],
    opticallyActiveCount: 16, // 2^4 = 16 aldo-hexoses
    racemicMixCount: 8,
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'A glicose de cadeia aberta possui 4 carbonos quirais diferentes (C2, C3, C4 e C5). O número total de aldo-hexoses estereoisômeras opticamente ativas é 2⁴ = 16 isômeros (incluindo D/L-galactose, D/L-manose, etc.) e 8 misturas racêmicas.',
    difficulty: 'avancado',
  },
  {
    id: 'chiral-08',
    molecule: {
      smiles: 'CCO',
      name: 'Etanol',
      formula: 'C2H6O',
      realWorldStory: 'O álcool comum de combustíveis e bebidas.',
    },
    chiralCarbonCount: 0,
    chiralCarbonDescriptions: [],
    opticallyActiveCount: 0,
    racemicMixCount: 0,
    hasMesoForm: false,
    isChiralMolecule: false,
    explanation:
      'O etanol é uma molécula Aquiral: o C1 tem 3 hidrogênios idênticos (-CH3) e o C2 tem 2 hidrogênios idênticos (-CH2-). Nenhum átomo de carbono está ligado a 4 grupos distintos. Logo, não possui carbono quiral e não tem atividade óptica.',
    difficulty: 'iniciante',
  },
  {
    id: 'chiral-09',
    molecule: {
      smiles: 'CC(O)C',
      name: 'Propan-2-ol (Álcool isopropílico)',
      formula: 'C3H8O',
      realWorldStory: 'Desinfetante hospitalar e limpador de placas eletrônicas.',
    },
    chiralCarbonCount: 0,
    chiralCarbonDescriptions: [],
    opticallyActiveCount: 0,
    racemicMixCount: 0,
    hasMesoForm: false,
    isChiralMolecule: false,
    explanation:
      'Cuidado com a pegadinha: o carbono central (C2) está ligado a um -H, um -OH e DOIS grupos metil (-CH3 e -CH3) idênticos! Por ter dois ligantes iguais, NÃO é carbono quiral. A molécula é aquiral e não apresenta isomeria óptica.',
    difficulty: 'iniciante',
  },
  {
    id: 'chiral-10',
    molecule: {
      smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
      name: 'Ibuprofeno',
      formula: 'C13H18O2',
      realWorldStory:
        'Anti-inflamatório não-esteroide consumido globalmente. Apenas o enantiômero (S) é farmacologicamente ativo como analgésico inibidor de COX!',
    },
    chiralCarbonCount: 1,
    chiralCarbonDescriptions: [
      'Carbono alfa da carboxila: ligado a -H, -CH3, -COOH e ao anel aromático isobutil-substituído.',
    ],
    opticallyActiveCount: 2,
    racemicMixCount: 1,
    hasMesoForm: false,
    isChiralMolecule: true,
    explanation:
      'O ibuprofeno possui 1 carbono quiral no carbono alfa adjacente à carboxila. Por isso, existe como dois enantiômeros: (S)-ibuprofeno (ativo como analgésico) e (R)-ibuprofeno (inativo, embora enzimas do corpo convertam lentamente R em S).',
    difficulty: 'avancado',
  },
];

/**
 * Curated Bank of Geometric Isomerism Condition Questions.
 */
export const CANONICAL_GEOMETRIC_QUESTIONS: GeometricConditionQuestion[] = [
  {
    id: 'geom-cond-01',
    molecule: {
      smiles: 'CC=CC',
      name: 'But-2-eno',
      formula: 'C4H8',
    },
    hasGeometricIsomerism: true,
    systemType: 'alqueno',
    substituentsA: ['-H', '-CH3'],
    substituentsB: ['-H', '-CH3'],
    reason:
      'O C2 está ligado a -H e -CH3 (dois grupos distintos, R1 ≠ R2) e o C3 está ligado a -H e -CH3 (dois grupos distintos, R3 ≠ R4). A condição é plenamente satisfeita, gerando o cis-but-2-eno e o trans-but-2-eno.',
    explanation:
      'Para haver isomeria geométrica em alcenos, cada carbono da dupla deve conter dois ligantes diferentes entre si: R1 ≠ R2 e R3 ≠ R4. O but-2-eno atende perfeitamente à regra.',
    difficulty: 'iniciante',
  },
  {
    id: 'geom-cond-02',
    molecule: {
      smiles: 'CCC=C',
      name: 'But-1-eno',
      formula: 'C4H8',
    },
    hasGeometricIsomerism: false,
    systemType: 'alqueno',
    substituentsA: ['-H', '-H'],
    substituentsB: ['-H', '-CH2CH3'],
    reason:
      'O carbono 1 da dupla possui 2 átomos de hidrogênio idênticos ligados a ele (=CH2, R1 = R2 = H).',
    explanation:
      'Regra de ouro: qualquer alceno terminal com o grupo =CH2 (dupla na ponta com dois hidrogênios) NUNCA apresenta isomeria geométrica cis-trans, pois trocar os dois hidrogênios de posição gera a mesmíssima estrutura.',
    difficulty: 'iniciante',
  },
  {
    id: 'geom-cond-03',
    molecule: {
      smiles: 'C=C',
      name: 'Eteno (Etileno)',
      formula: 'C2H4',
    },
    hasGeometricIsomerism: false,
    systemType: 'alqueno',
    substituentsA: ['-H', '-H'],
    substituentsB: ['-H', '-H'],
    reason: 'Ambos os carbonos da dupla possuem dois hidrogênios idênticos.',
    explanation:
      'No eteno (H2C=CH2), todos os quatro ligantes são átomos de hidrogênio idênticos. Não há como formar isômeros cis ou trans.',
    difficulty: 'iniciante',
  },
  {
    id: 'geom-cond-04',
    molecule: {
      smiles: 'ClC=CCl',
      name: '1,2-Dicloroeteno',
      formula: 'C2H2Cl2',
    },
    hasGeometricIsomerism: true,
    systemType: 'alqueno',
    substituentsA: ['-H', '-Cl'],
    substituentsB: ['-H', '-Cl'],
    reason:
      'O primeiro carbono tem -H e -Cl (diferentes), e o segundo carbono tem -H e -Cl (diferentes).',
    explanation:
      'Atende perfeitamente à condição R1 ≠ R2 e R3 ≠ R4. Origina o cis-1,2-dicloroeteno (polar) e o trans-1,2-dicloroeteno (apolar).',
    difficulty: 'iniciante',
  },
  {
    id: 'geom-cond-05',
    molecule: {
      smiles: 'C=C(Cl)Cl',
      name: '1,1-Dicloroeteno',
      formula: 'C2H2Cl2',
    },
    hasGeometricIsomerism: false,
    systemType: 'alqueno',
    substituentsA: ['-H', '-H'],
    substituentsB: ['-Cl', '-Cl'],
    reason:
      'O C1 possui dois hidrogênios idênticos (-H e -H) e o C2 possui dois cloros idênticos (-Cl e -Cl).',
    explanation:
      'Apesar de ter a mesma fórmula do 1,2-dicloroeteno, o 1,1-dicloroeteno possui ligantes idênticos em ambos os carbonos da dupla, inviabilizando qualquer isomeria geométrica.',
    difficulty: 'intermediario',
  },
  {
    id: 'geom-cond-06',
    molecule: {
      smiles: 'CC(C)=CC',
      name: '2-Metilbut-2-eno',
      formula: 'C5H10',
    },
    hasGeometricIsomerism: false,
    systemType: 'alqueno',
    substituentsA: ['-CH3', '-CH3'],
    substituentsB: ['-H', '-CH3'],
    reason:
      'O carbono 2 da dupla está ligado a dois grupos metil idênticos (-CH3 e -CH3, R1 = R2).',
    explanation:
      'Embora o C3 tenha dois ligantes distintos (-H e -CH3), o C2 falha na condição ao possuir dois metis idênticos. Para haver isomeria geométrica, AMBOS os carbonos da dupla devem ter ligantes distintos.',
    difficulty: 'intermediario',
  },
  {
    id: 'geom-cond-07',
    molecule: {
      smiles: 'C1C(C)C1C',
      name: '1,2-Dimetilciclopropano',
      formula: 'C5H10',
    },
    hasGeometricIsomerism: true,
    systemType: 'ciclo',
    reason:
      'Em compostos cíclicos, a rotação é impedida pelo fechamento do anel. Os carbonos 1 e 2 possuem dois substituintes diferentes (-H e -CH3).',
    explanation:
      'Em ciclos, a condição de isomeria cis-trans (bayeriana) exige pelo menos dois carbonos do anel com substituintes diferentes entre si. No 1,2-dimetilciclopropano temos cis (ambos os metis na mesma face) e trans (metis em faces opostas).',
    difficulty: 'avancado',
  },
  {
    id: 'geom-cond-08',
    molecule: {
      smiles: 'CC1(C)CC1',
      name: '1,1-Dimetilciclopropano',
      formula: 'C5H10',
    },
    hasGeometricIsomerism: false,
    systemType: 'ciclo',
    reason:
      'O carbono 1 possui dois grupos metil no mesmo vértice (R1 = R2 = -CH3), e os outros carbonos do anel têm apenas hidrogênios.',
    explanation:
      'Não há como definir faces opostas cis/trans quando os dois substituintes estão no mesmo átomo de carbono do anel.',
    difficulty: 'intermediario',
  },
  {
    id: 'geom-cond-09',
    molecule: {
      smiles: 'CCC=CC',
      name: 'Pent-2-eno',
      formula: 'C5H10',
    },
    hasGeometricIsomerism: true,
    systemType: 'alqueno',
    substituentsA: ['-H', '-CH3'],
    substituentsB: ['-H', '-CH2CH3'],
    reason:
      'C2 tem -H e -CH3 (distintos); C3 tem -H e -CH2CH3 (distintos).',
    explanation:
      'Como ambos os carbonos da dupla possuem grupos diferentes, existe o cis-pent-2-eno e o trans-pent-2-eno.',
    difficulty: 'iniciante',
  },
];
