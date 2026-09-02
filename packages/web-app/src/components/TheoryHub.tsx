import React, { useState } from 'react';
import {
  BookOpen,
  Crown,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  Zap,
  Info,
  Swords,
  Flame,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import type { HighlightGroup } from '@quimicarush/smiles-renderer';
import type { OrganicFunction } from '@quimicarush/chemistry-core';

interface FunctionTheoryDetail {
  id: OrganicFunction;
  title: string;
  generalFormula: string;
  identifyingGroup: string;
  iupacSuffix: string;
  radicalPrefix: string;
  priorityRank: number; // 1 to 16 (16 = highest)
  exampleSmiles: string;
  exampleIupac: string;
  commonNames: string;
  highlightType: HighlightGroup;
  everydayStory: string;
  identificationRule: string;
  enemTip: string;
}

export const THEORY_DATA: FunctionTheoryDetail[] = [
  {
    id: 'acido_carboxilico',
    title: 'Ácidos Carboxílicos',
    generalFormula: 'R-COOH',
    identifyingGroup: 'Carboxila (-COOH)',
    iupacSuffix: 'Ácido ...-oico',
    radicalPrefix: 'carboxi-',
    priorityRank: 16,
    exampleSmiles: 'CC(=O)O',
    exampleIupac: 'Ácido etanoico',
    commonNames: 'Ácido acético (vinagre)',
    highlightType: 'carbonyl',
    everydayStory:
      'O ácido fórmico (metanoico) é a arma química injetada pelas formigas e abelhas ao picarem. O ácido acético confere o sabor azedo e conservante do vinagre comum. O ácido butírico é o odor desagradável da manteiga rançosa, e os ácidos caproico/caprílico dão o cheiro característico dos caprinos.',
    identificationRule:
      'Possui o grupo carboxila (-COOH) sempre na extremidade de uma cadeia de carbono, combinando uma carbonila (C=O) e uma hidroxila (-OH) no mesmíssimo átomo de carbono.',
    enemTip:
      'REI DA PRIORIDADE: Em qualquer composto polifuncional, o ácido carboxílico possui a maior prioridade da química orgânica geral. Todos os outros grupos viram radicais!',
  },
  {
    id: 'anidrido',
    title: 'Anidridos de Ácido',
    generalFormula: "R-CO-O-CO-R'",
    identifyingGroup: 'Oxigênio entre 2 Carbonilas (-CO-O-CO-)',
    iupacSuffix: 'Anidrido ...oico',
    radicalPrefix: 'alcanoilóxi- (ou acetilóxi-)',
    priorityRank: 15,
    exampleSmiles: 'CC(=O)OC(=O)C',
    exampleIupac: 'Anidrido etanoico',
    commonNames: 'Anidrido acético',
    highlightType: 'carbonyl',
    everydayStory:
      'Formados pela desidratação intermolecular de duas moléculas de ácido carboxílico com perda de água. O anidrido acético é crucial na síntese industrial do medicamento mais vendido do planeta: o ácido acetilsalicílico (Aspirina).',
    identificationRule:
      'Dois grupos acila (C=O) ligados a um mesmo átomo central de oxigênio em ponte.',
    enemTip:
      'Segunda maior prioridade IUPAC. Sua hidrólise quebra a ponte de oxigênio regenerando dois ácidos carboxílicos.',
  },
  {
    id: 'ester',
    title: 'Ésteres',
    generalFormula: "R-COO-R'",
    identifyingGroup: 'Carboxilato (-COO-)',
    iupacSuffix: '...oato de [alquila]-ila',
    radicalPrefix: 'alcoxicarbonil- ou acilóxi-',
    priorityRank: 14,
    exampleSmiles: 'CC(=O)OCC',
    exampleIupac: 'Etanoato de etila',
    commonNames: 'Acetato de etila (essência de maçã/solvente)',
    highlightType: 'carbonyl',
    everydayStory:
      'Responsáveis pelos aromas e sabores irresistíveis da natureza: o etanoato de pentila cheira a banana madura; o butanoato de etila cheira a abacaxi. Além disso, todos os óleos vegetais e gorduras animais são triésteres de glicerol (triglicerídeos), e o biodiesel é um monoéster graxo!',
    identificationRule:
      'Carbonila (C=O) ligada diretamente a um oxigênio que se conecta a outra cadeia carbônica (-COO-C). Não confundir com éter ou ácido carboxílico!',
    enemTip:
      'Questão garantida no ENEM: Reação de transesterificação para produção de biodiesel a partir de óleo vegetal + metanol/etanol catalisado por base forte.',
  },
  {
    id: 'haleto_acila',
    title: 'Haletos de Acila',
    generalFormula: 'R-COX (X = F, Cl, Br, I)',
    identifyingGroup: 'Haleto de Carbonila (-COX)',
    iupacSuffix: 'Haleto de ...oíla',
    radicalPrefix: 'halocarbonil- (ex: clorocarbonil-)',
    priorityRank: 13,
    exampleSmiles: 'CC(=O)Cl',
    exampleIupac: 'Cloreto de etanoíla',
    commonNames: 'Cloreto de acetila',
    highlightType: 'carbonyl',
    everydayStory:
      'Substâncias extremamente reativas que fumegam em contato com a umidade do ar. São intermediários sintéticos vitais na fabricação de fármacos e plásticos na indústria química fina.',
    identificationRule:
      'Átomo de halogênio (cloro, bromo, etc.) ligado diretamente ao carbono da carbonila (C=O).',
    enemTip:
      'Reagem instantaneamente com água gerando ácido carboxílico e vapor corrosivo de gás clorídrico (HCl).',
  },
  {
    id: 'amida',
    title: 'Amidas',
    generalFormula: "R-CO-NH2 / R-CO-NHR'",
    identifyingGroup: 'Amida (-CO-N-)',
    iupacSuffix: '...amida',
    radicalPrefix: 'carbamoil- ou acetamido-',
    priorityRank: 12,
    exampleSmiles: 'CC(=O)N',
    exampleIupac: 'Etanamida',
    commonNames: 'Acetamida',
    highlightType: 'nitrogen',
    everydayStory:
      'A capsaicina dá a ardência picante nas pimentas malagueta e gás de pimenta; a piperina confere o sabor pungente da pimenta-do-reino; o paracetamol alivia febres; e todas as proteínas do corpo humano (incluindo o DNA e músculos) e as fibras de Nylon são mantidas por ligações peptídicas amídicas.',
    identificationRule:
      'Átomo de nitrogênio ligado DIRETAMENTE a um carbono com dupla ligação de oxigênio (C=O). Se o nitrogênio não estiver na carbonila, é uma amina!',
    enemTip:
      'A ligação peptídica que une aminoácidos para formar proteínas é exatamente uma função amida.',
  },
  {
    id: 'nitrila',
    title: 'Nitrilas',
    generalFormula: 'R-C≡N',
    identifyingGroup: 'Ciano (-C≡N)',
    iupacSuffix: '...nitrila',
    radicalPrefix: 'ciano-',
    priorityRank: 11,
    exampleSmiles: 'CC#N',
    exampleIupac: 'Etanonitrila',
    commonNames: 'Acetonitrila / Cianeto de metila',
    highlightType: 'nitrogen',
    everydayStory:
      'A acrilonitrila (propenonitrila) é o monômero base para a fabricação do termoplástico ABS utilizado em todas as peças de LEGO do mundo, além de para-choques de carros e fibras têxteis sintéticas.',
    identificationRule:
      'Carbono com ligação tripla sp diretamente ao átomo de nitrogênio (-C≡N).',
    enemTip:
      'O carbono do grupo nitrila CONTA na contagem da cadeia principal! Ex: CH3-C≡N tem 2 carbonos, logo é etanonitrila.',
  },
  {
    id: 'aldeido',
    title: 'Aldeídos',
    generalFormula: 'R-CHO',
    identifyingGroup: 'Formila / Aldoxila (-CHO)',
    iupacSuffix: '...al',
    radicalPrefix: 'formil- (ramificado) ou oxo-',
    priorityRank: 10,
    exampleSmiles: 'CC=O',
    exampleIupac: 'Etanal',
    commonNames: 'Acetaldeído',
    highlightType: 'carbonyl',
    everydayStory:
      'O formol (metanal a 37-40% em água) é a clássica solução para conservação de peças anatômicas em vidros de biologia. O acetaldeído é o vilão da ressaca alcoólica, e o benzaldeído dá o aroma de amêndoas amargas.',
    identificationRule:
      'Carbonila (C=O) terminal, ligada a pelo menos um hidrogênio (H-C=O). O carbono 1 é sempre o da aldoxila.',
    enemTip:
      'Oxidam-se muito facilmente a ácidos carboxílicos através do reagente de Tollens (espelho de prata) e solução de Fehling.',
  },
  {
    id: 'cetona',
    title: 'Cetonas',
    generalFormula: "R-CO-R'",
    identifyingGroup: 'Carbonila secundária (C-CO-C)',
    iupacSuffix: '...ona',
    radicalPrefix: 'oxo-',
    priorityRank: 9,
    exampleSmiles: 'CC(=O)C',
    exampleIupac: 'Propanona',
    commonNames: 'Acetona / Dimetilcetona',
    highlightType: 'carbonyl',
    everydayStory:
      'A acetona comercial é o solvente indispensável para remover esmalte de unhas. No corpo humano, os corpos cetônicos (como o acetoacetato) são gerados pelo fígado durante jejum prolongado como fonte de energia alternativa para o cérebro.',
    identificationRule:
      'Carbonila (C=O) presa estritamente ENTRE dois carbonos. Nunca pode ser terminal.',
    enemTip:
      'A menor cetona possível precisa ter no mínimo 3 carbonos (a propanona). Não existe "metanona" nem "etanona"!',
  },
  {
    id: 'alcool',
    title: 'Álcoois',
    generalFormula: 'R-OH',
    identifyingGroup: 'Hidroxila (-OH) em carbono sp3',
    iupacSuffix: '...ol',
    radicalPrefix: 'hidróxi-',
    priorityRank: 8,
    exampleSmiles: 'CCO',
    exampleIupac: 'Etanol',
    commonNames: 'Álcool etílico',
    highlightType: 'hydroxyl',
    everydayStory:
      'O etanol obtido pela fermentação da cana-de-açúcar move frotas de automóveis biocombustíveis e sanitiza hospitais a 70%. O mentol dá a refrescância nos cremes dentais e o colesterol é o álcool esteroide essencial às membranas celulares.',
    identificationRule:
      'Grupo hidroxila (-OH) ligado a um carbono saturado (com 4 ligações simples).',
    enemTip:
      'Classificação primário, secundário ou terciário depende exclusivamente do tipo de carbono ao qual a hidroxila está ligada.',
  },
  {
    id: 'enol',
    title: 'Enóis',
    generalFormula: 'R-C=C-OH',
    identifyingGroup: 'Hidroxila (-OH) em carbono sp2 de dupla',
    iupacSuffix: '...en-...ol',
    radicalPrefix: 'hidróxi-',
    priorityRank: 7,
    exampleSmiles: 'C=CO',
    exampleIupac: 'Etenol',
    commonNames: 'Álcool vinílico',
    highlightType: 'hydroxyl',
    everydayStory:
      'Compostos altamente instáveis e efêmeros que existem em equilíbrio químico dinâmico contínuo (tautomeria ceto-enólica) com aldeídos e cetonas.',
    identificationRule:
      'Grupo hidroxila (-OH) ligado diretamente a um carbono que faz uma ligação dupla carbono-carbono.',
    enemTip:
      'Tautomeria ceto-enólica no ENEM: o hidrogênio da hidroxila migra para o carbono vizinho enquanto a dupla ligação vai para o oxigênio.',
  },
  {
    id: 'fenol',
    title: 'Fenóis',
    generalFormula: 'Ar-OH',
    identifyingGroup: 'Hidroxila (-OH) direta no anel benzênico',
    iupacSuffix: '...fenol ou hidroxibenzeno',
    radicalPrefix: 'hidróxi- ou (hidroxifenil)-',
    priorityRank: 6,
    exampleSmiles: 'Oc1ccccc1',
    exampleIupac: 'Hidroxibenzeno',
    commonNames: 'Fenol comum / Ácido fênico',
    highlightType: 'hydroxyl',
    everydayStory:
      'Joseph Lister utilizou o ácido fênico no século XIX para criar as primeiras cirurgias antissépticas da história, salvando milhões de vidas. Os cresóis (orto, meta, para) compõem a creosina usada para preservar postes de madeira contra cupins.',
    identificationRule:
      'A hidroxila DEVE estar ligada diretamente a um carbono aromático do benzeno. Se houver um -CH2- intermediário, é um álcool aromático (álcool benzílico), NÃO é fenol!',
    enemTip:
      'Fenóis são ácidos fracos (mais ácidos que álcoois e água) porque o ânion fenolato é estabilizado por ressonância no anel aromático.',
  },
  {
    id: 'amina',
    title: 'Aminas',
    generalFormula: "R-NH2 / R-NH-R' / R-NR'R''",
    identifyingGroup: 'Grupo Amino derivado de NH3',
    iupacSuffix: '...amina',
    radicalPrefix: 'amino- (ou dimetilamino-)',
    priorityRank: 5,
    exampleSmiles: 'CCN',
    exampleIupac: 'Etanamina',
    commonNames: 'Etilamina',
    highlightType: 'nitrogen',
    everydayStory:
      'A trimetilamina é a causa do cheiro pungente de peixe podre. Os grandes alcaloides medicinais e tóxicos da botânica (cafeína, nicotina, morfina, cocaína) são aminas. E os corantes de anilina deram cor à revolução industrial têxtil.',
    identificationRule:
      'Nitrogênio ligado a átomos de carbono sem carbonila vizinha. Podem ser primárias, secundárias ou terciárias.',
    enemTip:
      'As aminas têm caráter BÁSICO devido ao par de elétrons livres no nitrogênio que captura prótons H+ segundo Lewis e Brønsted-Lowry.',
  },
  {
    id: 'eter',
    title: 'Éteres',
    generalFormula: "R-O-R'",
    identifyingGroup: 'Oxigênio Heteroátomo (C-O-C)',
    iupacSuffix: '[menor]-óxi-[maior]ano',
    radicalPrefix: 'alcóxi- (metóxi-, etóxi-)',
    priorityRank: 4,
    exampleSmiles: 'CCOCC',
    exampleIupac: 'Etoxietano',
    commonNames: 'Éter dietílico / Éter comum',
    highlightType: 'none',
    everydayStory:
      'O éter dietílico foi o anestésico revolucionário inalatório das primeiras cirurgias sem dor no século XIX. É um líquido extremamente volátil cujo vapor denso se acumula no chão e pega fogo com facilidade.',
    identificationRule:
      'Um oxigênio agindo como ponte (heteroátomo) entre dois átomos de carbono separados.',
    enemTip:
      'Ponto de ebulição baixo porque não fazem ligações de hidrogênio entre si (ao contrário dos seus isômeros funcionais, os álcoois).',
  },
  {
    id: 'haleto_alquila',
    title: 'Haletos de Alquila',
    generalFormula: 'R-X (X = F, Cl, Br, I)',
    identifyingGroup: 'Halogênio em Alcano',
    iupacSuffix: 'halogênio + hidrocarboneto',
    radicalPrefix: 'flúor-, cloro-, bromo-, iodo-',
    priorityRank: 3,
    exampleSmiles: 'CCCl',
    exampleIupac: 'Cloroetano',
    commonNames: 'Cloreto de etila / Lança-perfume',
    highlightType: 'halogen',
    everydayStory:
      'O clorofórmio anestesiou a rainha Vitória no parto; o inseticida DDT baniu a malária em meados do século XX antes de ser proibido por bioacumulação; e os CFCs (freons de geladeira) destruíram a camada de ozônio.',
    identificationRule:
      'Átomo de halogênio (flúor, cloro, bromo ou iodo) ligado a um radical derivado de hidrocarboneto.',
    enemTip:
      'Na IUPAC, os halogênios NÃO geram sufixo; são sempre tratados como substituintes/radicais com seus respectivos localizadores.',
  },
  {
    id: 'nitrocomposto',
    title: 'Nitrocompostos',
    generalFormula: 'R-NO2',
    identifyingGroup: 'Grupo Nitro (-NO2)',
    iupacSuffix: 'nitro- + hidrocarboneto',
    radicalPrefix: 'nitro-',
    priorityRank: 2,
    exampleSmiles: 'CC[N+](=O)[O-]',
    exampleIupac: 'Nitroetano',
    commonNames: 'Nitroetano',
    highlightType: 'nitrogen',
    everydayStory:
      'O TNT (2,4,6-trinitrotolueno) é o clássico explosivo militar e industrial de demolições. Nitrocompostos são intermediários indispensáveis na fabricação de tintas e fármacos sintéticos.',
    identificationRule:
      'Grupo nitro (-NO2) ligado a carbono através do nitrogênio.',
    enemTip:
      'Sempre nomeados com o prefixo "nitro-", com a menor numeração possível na cadeia carbônica.',
  },
  {
    id: 'hidrocarboneto',
    title: 'Hidrocarbonetos',
    generalFormula: 'CxHy',
    identifyingGroup: 'Somente Carbono e Hidrogênio',
    iupacSuffix: '...o',
    radicalPrefix: 'hidrocarboneto base',
    priorityRank: 1,
    exampleSmiles: 'CCCC',
    exampleIupac: 'Butano',
    commonNames: 'Gás de cozinha (GLP junto com propano)',
    highlightType: 'none',
    everydayStory:
      'O gás liquefeito de petróleo (GLP) dos botijões de cozinha é uma mistura de propano e butano. A gasolina é rica em octanos, as velas são feitas de parafina sólida e o eteno (etileno) é o hormônio vegetal gasoso que amadurece as frutas.',
    identificationRule:
      'Moléculas compostas EXCLUSIVAMENTE por átomos de carbono e hidrogênio, sem nenhum heteroátomo.',
    enemTip:
      'Base de toda a nomenclatura orgânica: Prefixo de carbonos + Infixo de ligações (an, en, in) + Sufixo -o.',
  },
];

interface LocantBattle {
  id: string;
  title: string;
  categoryBadge: string;
  ruleSummary: string;
  smiles: string;
  winner: {
    name: string;
    locantSet: string;
    direction: string;
    reason: string;
  };
  loser: {
    name: string;
    locantSet: string;
    direction: string;
    errorReason: string;
  };
  iupacRuleCitation: string;
}

export const LOCANT_BATTLES: LocantBattle[] = [
  {
    id: 'battle-alcool-secundario',
    title: 'Batalha 1: Álcool com Hidroxila Secundária',
    categoryBadge: 'Função Oxigenada',
    ruleSummary:
      'A numeração da cadeia principal deve começar pela extremidade mais próxima do grupo funcional, conferindo-lhe o menor localizador numérico possível.',
    smiles: 'CCC(O)C',
    winner: {
      name: 'butan-2-ol (ou 2-butanol)',
      locantSet: 'Posição 2',
      direction: 'Direita para a esquerda: C1 - C2(OH) - C3 - C4',
      reason: 'O localizador 2 é estritamente menor que 3. Vitória da proximidade da hidroxila!',
    },
    loser: {
      name: 'butan-3-ol (ou 3-butanol)',
      locantSet: 'Posição 3',
      direction: 'Esquerda para a direita: C1 - C2 - C3(OH) - C4',
      errorReason: 'Atribui posição 3 desnecessariamente alta ao grupo funcional principal.',
    },
    iupacRuleCitation:
      'IUPAC Blue Book P-14.3.5: "A numeração da cadeia principal é escolhida de modo a dar os menores localizadores aos grupos característicos com sufixo."',
  },
  {
    id: 'battle-insaturacao-vs-ramificacao',
    title: 'Batalha 2: Insaturação vs. Ramificação',
    categoryBadge: 'Precedência de Ligação',
    ruleSummary:
      'A insaturação (ligação dupla ou tripla) tem precedência obrigatória de menor localizador sobre qualquer ramificação simples da cadeia.',
    smiles: 'CC=CC(C)C',
    winner: {
      name: '4-metilpent-2-eno',
      locantSet: 'Dupla no C2, Metil no C4',
      direction: 'Esquerda para a direita: a dupla ligação fica na posição 2.',
      reason:
        'A dupla ligação C=C dita o sentido da numeração! Ela conquista o menor número (2), rebaixando a metila para o C4.',
    },
    loser: {
      name: '2-metilpent-3-eno',
      locantSet: 'Dupla no C3, Metil no C2',
      direction: 'Direita para a esquerda: tenta favorecer a metila na posição 2.',
      errorReason:
        'Erro clássico de vestibular: priorizar a ramificação e deixar a dupla ligação em posição maior (3). Insaturação SEMPRE vence ramificação!',
    },
    iupacRuleCitation:
      'IUPAC Blue Book P-14.4: "Ligações duplas e triplas recebem menores localizadores do que radicais ou substituintes alquílicos."',
  },
  {
    id: 'battle-funcao-vs-insaturacao',
    title: 'Batalha 3: Grupo Funcional vs. Insaturação',
    categoryBadge: 'O Terror dos Vestibulares',
    ruleSummary:
      'O grupo funcional principal com sufixo possui autoridade máxima sobre insaturações, mesmo que a dupla pudesse ficar na posição 1 pelo outro lado.',
    smiles: 'C=CC(O)C',
    winner: {
      name: 'but-3-en-2-ol (ou 3-buten-2-ol)',
      locantSet: 'OH no C2, Dupla no C3',
      direction: 'Direita para a esquerda: garante menor posição (2) para o álcool.',
      reason:
        'A hidroxila (-ol) é a rainha do sufixo. C2 para a hidroxila vence C3, ainda que a dupla ficasse com C1 pelo outro sentido!',
    },
    loser: {
      name: 'but-1-en-3-ol (ou 1-buten-3-ol)',
      locantSet: 'OH no C3, Dupla no C1',
      direction: 'Esquerda para a direita: tentou dar a posição 1 para a dupla ligação.',
      errorReason:
        'A armadilha mais perversa do ENEM: cair na tentação do número 1 para a dupla e prejudicar o grupo funcional principal (-OH).',
    },
    iupacRuleCitation:
      'IUPAC Blue Book P-44.4.1: "O sufixo funcional prioritário é soberano na determinação da extremidade de numeração mais baixa."',
  },
  {
    id: 'battle-desempate-alfabetico',
    title: 'Batalha 4: Desempate por Ordem Alfabética de Radicais',
    categoryBadge: 'Critério de Desempate',
    ruleSummary:
      'Quando os dois sentidos de numeração produzem conjuntos de localizadores numericamente idênticos, o critério supremo de desempate é a ordem alfabética dos radicais.',
    smiles: 'CCC(CC)CC(C)CC',
    winner: {
      name: '3-etil-5-metil-heptano',
      locantSet: 'Etil no C3, Metil no C5',
      direction: 'Esquerda para a direita: conjunto de posições (3, 5).',
      reason:
        'Empate numérico: tanto da esquerda quanto da direita as posições seriam 3 e 5. Por desempate alfabético, o radical "etil" (letra E) ganha a menor posição (3).',
    },
    loser: {
      name: '5-etil-3-metil-heptano',
      locantSet: 'Etil no C5, Metil no C3',
      direction: 'Direita para a esquerda: deu a posição 3 ao radical metil.',
      errorReason:
        'Viola a regra alfabética de desempate: a letra M de metil vem depois da letra E de etil.',
    },
    iupacRuleCitation:
      'IUPAC Blue Book P-14.4.2: "Havendo escolha entre conjuntos de localizadores idênticos, a menor numeração é concedida ao substituinte citado primeiro no nome em ordem alfabética."',
  },
];

interface EnemMacete {
  id: string;
  title: string;
  badge: string;
  mnemonicChant: string;
  explanation: string;
  examTrap: string;
  practicalExample: {
    molecule: string;
    correct: string;
    wrong: string;
  };
}

export const ENEM_MACETES: EnemMacete[] = [
  {
    id: 'macete-coroa',
    title: '1. A Coroa da Prioridade Suprema (O Macete dos Reis)',
    badge: 'Morfologia & Sufixo',
    mnemonicChant:
      '👑 "Ácido Anidrou Éster Há Anos; Nitrilas Aldeídicas Cederam Álcoois E Fenóis Às Aminas, Éteres, Haletos e Nitros!"',
    explanation:
      'Apenas o grupo funcional com a maior patente assume o sufixo no final do nome e define a família principal. Todas as outras funções subordinadas são compulsoriamente rebaixadas a prefixos (radicais) com nomes modificados (ex: álcool vira hidróxi-, amina vira amino-, cetona vira oxo-).',
    examTrap:
      'Muitos estudantes tentam inventar dois sufixos na mesma molécula (ex: chamar ácido 2-hidroxipropanoico de "propano-1-ol-2-oico"). Nunca existe mais de um sufixo funcional principal!',
    practicalExample: {
      molecule: 'Ácido lático (CH3-CH(OH)-COOH)',
      correct: 'ácido 2-hidroxipropanoico (Ácido carboxílico = sufixo -oico; Álcool = prefixo hidróxi-)',
      wrong: '2-hidroxipropanol ou ácido propanoloico',
    },
  },
  {
    id: 'macete-prefixos',
    title: '2. O Canto dos Prefixos de Carbono (M-E-P-B)',
    badge: 'Contagem de Carbonos',
    mnemonicChant:
      '🔢 "Mete, Eta, Propõe, Bota!" ➔ 1 = Met, 2 = Et, 3 = Prop, 4 = But. Do 5 em diante, é matemática esportiva (Pent, Hex, Hept, Oct, Non, Dec)!',
    explanation:
      'Os 4 primeiros prefixos vêm de origens históricas químicas: Met (de metanol/madeira), Et (de éter/éter dietílico), Prop (de ácido propiônico / primeira gordura) e But (de ácido butírico / manteiga). Os prefixos a partir de 5 carbonos adotam os numerais gregos normais.',
    examTrap:
      'Confundir propano (3 carbonos) com butano (4 carbonos) em questões de combustíveis veiculares (GLP e gás natural).',
    practicalExample: {
      molecule: 'Gás de botijão (GLP)',
      correct: 'Mistura de Propano (3C) e Butano (4C)',
      wrong: 'Gás natural (predominantemente metano, 1C)',
    },
  },
  {
    id: 'macete-fenol-vs-alcool',
    title: '3. A Armadilha Fatal: Fenol vs. Álcool Aromático',
    badge: 'A Mais Cobrada no ENEM',
    mnemonicChant:
      '⚠️ "OH grudado direto no anel benzênico é FENOL! Teve carbono -CH2- intermediário no meio? Vira ÁLCOOL!"',
    explanation:
      'Para ser fenol, o oxigênio da hidroxila precisa estar conectado diretamente ao carbono com hibridização sp2 do anel de benzeno. Isso confere ao fenol caráter fracamente ácido (Ka ~ 10^-10) por estabilização por ressonância do íon fenolato. Se houver um carbono sp3 (-CH2-) entre eles, a molécula é um álcool benzílico (fenilmetanol) com caráter estritamente neutro como a água.',
    examTrap:
      'Questões do ENEM que perguntam qual composto reage com NaOH aquoso: FENÓIS reagem com bases fortes gerando fenolato e água; ÁLCOOIS não reagem com NaOH!',
    practicalExample: {
      molecule: 'C6H5-CH2-OH (Álcool benzílico)',
      correct: 'Álcool aromático neutro (não é fenol, não reage com NaOH)',
      wrong: 'Classificar como fenol só porque tem anel benzênico e hidroxila',
    },
  },
  {
    id: 'macete-amida-vs-amina',
    title: '4. Amida vs. Amina em Fármacos & Proteínas',
    badge: 'Bioquímica & Fármacos',
    mnemonicChant:
      '🧬 "Tem Carbonila C=O vizinha do Nitrogênio? AMIDA! Nitrogênio sozinho em carbono simples? AMINA!"',
    explanation:
      'As aminas derivam formalmente da amônia (NH3) e mantêm caráter BÁSICO devido ao par de elétrons livres no N, capazes de capturar H+. Já as amidas têm o par de elétrons do nitrogênio deslocalizado por ressonância com o oxigênio da carbonila, perdendo a basicidade e tornando-se neutras. São as amidas que formam a ligação peptídica de todas as proteínas e do Paracetamol!',
    examTrap:
      'Confundir anilina (amina aromática básica) com paracetamol ou acetanilida (amidas neutras).',
    practicalExample: {
      molecule: 'Paracetamol (4-acetamidofenol)',
      correct: 'Contém a função AMIDA (ligação C=O com NH) e a função FENOL (OH no anel)',
      wrong: 'Dizer que possui função amina e álcool',
    },
  },
  {
    id: 'macete-aldeido-vs-cetona',
    title: '5. Aldeído vs. Cetona: A Batalha das Carbonilas',
    badge: 'Oxigênio Carbonílico',
    mnemonicChant:
      '🍋 "Aldeído é na PONTA (al-de-ida, carbono 1 terminal H-C=O); Cetona é no MEIO (C-CO-C secundária, precisa de 3 carbonos)!"',
    explanation:
      'O aldeído possui a carbonila ligada a pelo menos um átomo de hidrogênio na extremidade da cadeia carbônica. Esse hidrogênio terminal confere aos aldeídos uma facilidade ímpar de oxidação a ácidos carboxílicos, reagindo com o Reagente de Tollens para formar o lendário espelho de prata metálica. Cetonas não sofrem oxidação suave.',
    examTrap:
      'Achar que existe "metanona" ou "etanona". A menor cetona existente na natureza precisa de no mínimo 3 carbonos: a propanona (acetona)!',
    practicalExample: {
      molecule: 'CH3-CH2-CHO vs CH3-CO-CH3',
      correct: 'Propanal (aldeído terminal, oxida) vs Propanona (cetona central, não oxida fácil)',
      wrong: 'Confundir suas reatividades redox',
    },
  },
  {
    id: 'macete-acordo-ortografico',
    title: '6. O Segredo do Hífen no Novo Acordo Ortográfico (pt-BR)',
    badge: 'Gramática Química ABL/SBQ',
    mnemonicChant:
      '✍️ "Diante de H, hífen sem dó! Com outras letras, junta tudo e seja o que for!"',
    explanation:
      'Pelas normas conjuntas da SBQ e ABL decorrentes do Acordo Ortográfico: diante da letra H, o hífen é estritamente obrigatório: ciclo-hexano, 2-metil-hexano, ciclo-heptano. Diante de outras consoantes ou vogais distintas, aglutina-se sem hífen: ciclobutano, ciclopentano, metilpropano, dimetilbutano. Diante de vogais idênticas em colisão, usa-se hífen: ciclo-octano.',
    examTrap:
      'Escrever "ciclo-butano" ou "metil-propano" com hífen (incorreto pela norma culta).',
    practicalExample: {
      molecule: 'Anéis de 6 e 4 carbonos',
      correct: 'ciclo-hexano (com hífen) e ciclobutano (sem hífen)',
      wrong: 'ciclo-butano ou ciclohexano (este tolerado em vestibulares antigos)',
    },
  },
];

interface SensoryProfile {
  title: string;
  badge: string;
  iconName: string;
  scientificReason: string;
  compounds: Array<{
    name: string;
    iupac: string;
    sensoryDescription: string;
    realWorldRole: string;
  }>;
  enemCuriosity: string;
}

export const SENSORY_PROFILES: SensoryProfile[] = [
  {
    title: 'Ésteres: Os Aromas e Sabores da Frutaria',
    badge: 'Olfato & Paladar Doce',
    iconName: 'Sparkles',
    scientificReason:
      'Moléculas de baixa e média massa molar com ponto de ebulição moderado que se volatilizam facilmente à temperatura ambiente, encaixando-se com perfeição nos receptores olfativos de mamíferos.',
    compounds: [
      {
        name: 'Etanoato de isopentila (Acetato de isoamila)',
        iupac: 'etanoato de 3-metilbutila',
        sensoryDescription: 'Aroma inconfundível e doce de banana madura e chiclete tutti-frutti.',
        realWorldRole: 'Aromatizante idêntico ao natural em balas, sorvetes e gelatinas.',
      },
      {
        name: 'Butanoato de etila',
        iupac: 'butanoato de etila',
        sensoryDescription: 'Aroma fresco e suculento de abacaxi e morango silvestre.',
        realWorldRole: 'Flavorizante culinário em sucos prontos e licores.',
      },
      {
        name: 'Etanoato de octila',
        iupac: 'etanoato de octila',
        sensoryDescription: 'Aroma cítrico aveludado característico de laranjas doces.',
        realWorldRole: 'Perfumaria fina e essências cosméticas corporais.',
      },
      {
        name: 'Antranilato de metila',
        iupac: '2-aminobenzoato de metila',
        sensoryDescription: 'Aroma e sabor penetrante de uva artificial de refrigerantes.',
        realWorldRole: 'Flavorizante de sucos em pó e repelente biológico de pássaros.',
      },
    ],
    enemCuriosity:
      'Gorduras animais (manteiga, sebo) e óleos vegetais (soja, dendê) são quimicamente triésteres de glicerol (triglicerídeos). Na reação de transesterificação com álcoois catalisada por base, geram biodiesel e glicerina!',
  },
  {
    title: 'Aminas: Odor de Peixe, Carniça e Alcaloides Psicoativos',
    badge: 'Odor Básico Pungente',
    iconName: 'Droplets',
    scientificReason:
      'Vapores básicos com par de elétrons livres no nitrogênio. Compostos voláteis que ativam receptores de perigo biológico para alertar animais sobre carne em putrefação.',
    compounds: [
      {
        name: 'Trimetilamina',
        iupac: 'N,N-dimetilmetanamina',
        sensoryDescription: 'Odor característico e repulsivo de peixe cru envelhecido.',
        realWorldRole:
          'Gerada pela redução bacteriana do óxido de trimetilamina em frutos do mar.',
      },
      {
        name: 'Cadaverina & Putrescina',
        iupac: 'pentano-1,5-diamina & butano-1,4-diamina',
        sensoryDescription: 'Odor nauseabundo e asfixiante de cadáveres e carne em decomposição.',
        realWorldRole: 'Produzidas pela descarboxilação bacteriana de aminoácidos após a morte.',
      },
      {
        name: 'Cafeína & Nicotina',
        iupac: '1,3,7-trimetilpurina-2,6-diona & 3-(1-metilpirrolidin-2-il)piridina',
        sensoryDescription: 'Sabor amargo acentuado de alcaloides vegetais estimulantes.',
        realWorldRole:
          'Mecanismos de defesa botânica contra herbívoros; atuam no sistema nervoso central humano promovendo vigília e recompensa dopaminérgica.',
      },
    ],
    enemCuriosity:
      'Dica culinária de química no ENEM: o cheiro de peixe das mãos sai lavando com limão ou vinagre! O ácido cítrico/acético doa H+ neutralizando a amina básica em sal de amônio iônico solúvel e inodoro!',
  },
  {
    title: 'Cetonas: Removedor de Esmalte, Hálito Cetônico e Cânfora',
    badge: 'Solvência & Volatilidade',
    iconName: 'Flame',
    scientificReason:
      'Líquidos polares sem pontes de hidrogênio entre si, com evaporação endotérmica acelerada que retira calor rapidamente das superfícies.',
    compounds: [
      {
        name: 'Propanona (Acetona)',
        iupac: 'propanona (ou propan-2-ona)',
        sensoryDescription:
          'Odor etéreo pungente adocicado; sensação de resfriamento gelado na ponta dos dedos.',
        realWorldRole:
          'Solvente universal que rompe as redes poliméricas de esmaltes e vernizes.',
      },
      {
        name: 'Corpos Cetônicos (Acetoacetato e Acetona)',
        iupac: 'ácido 3-oxobutanoico e propanona',
        sensoryDescription: 'Aroma adocicado e frutado emanado no hálito de pessoas em jejum.',
        realWorldRole:
          'Metabólitos sintetizados pelo fígado na dieta cetogênica ou diabetes descompensada.',
      },
      {
        name: 'Cânfora',
        iupac: '1,7,7-trimetilbiciclo[2.2.1]heptan-2-ona',
        sensoryDescription: 'Odor medicinal penetrante e refrescante nas vias respiratórias.',
        realWorldRole: 'Pomadas peitorais descongestionantes e anti-inflamatórias.',
      },
    ],
    enemCuriosity:
      'A acetona pura teve sua comercialização controlada pela Polícia Federal no Brasil por ser o principal solvente químico de extração e refino na fabricação de cocaína.',
  },
  {
    title: 'Aldeídos: Do Formol Irritante à Baunilha e Canela',
    badge: 'Perfume & Conservação',
    iconName: 'Zap',
    scientificReason:
      'Carbonila terminal H-C=O polar e altamente reativa com potencial redox elevado e notas olfativas agudas.',
    compounds: [
      {
        name: 'Metanal (Formol)',
        iupac: 'metanal',
        sensoryDescription: 'Gás asfixiante pungente que queima as narinas e faz lacrimejar na hora.',
        realWorldRole:
          'Solução a 37% que preserva tecidos biológicos por desnaturação e reticulação protéica.',
      },
      {
        name: 'Cinamaldeído',
        iupac: '(2E)-3-fenilprop-2-enal',
        sensoryDescription: 'Odor quente, picante e inconfundível da casca da canela em pau.',
        realWorldRole: 'Especiaria milenar na culinária e cosmética aromaterápica.',
      },
      {
        name: 'Vanilina',
        iupac: '4-hidróxi-3-metoxibenzaldeído',
        sensoryDescription: 'Doçura aveludada e aconchegante da essência de baunilha.',
        realWorldRole: 'Aromatizante culinário global em chocolates, sorvetes e bolos.',
      },
      {
        name: 'Citral (Geranial + Neral)',
        iupac: '3,7-dimetilocta-2,6-dienal',
        sensoryDescription: 'Aroma cítrico elétrico da casca do limão siciliano e capim-limão.',
        realWorldRole: 'Aromatizante cítrico e pilar da perfumaria da família aldeídica.',
      },
    ],
    enemCuriosity:
      'O etanal (acetaldeído) é a toxina gerada pelo fígado ao metabolizar o etanol da cerveja via enzima álcool desidrogenase; é o verdadeiro carrasco responsável pela dor de cabeça e enjoo da ressaca!',
  },
  {
    title: 'Ácidos Carboxílicos: O Império do Azedo, Rançoso e Picante',
    badge: 'Paladar Ácido & Picadas',
    iconName: 'ShieldAlert',
    scientificReason:
      'Compostos polares capazes de doar íons H+ (hidrogênio ionizável) em solução aquosa, sensibilizando receptores de acidez e dor nas papilas gustativas e na pele.',
    compounds: [
      {
        name: 'Ácido acético (etanoico)',
        iupac: 'ácido etanoico',
        sensoryDescription: 'Sabor azedo penetrante e aroma acentuado do vinagre culinário.',
        realWorldRole: 'Condimento alimentar e conservante natural contra bolores em conserva.',
      },
      {
        name: 'Ácido fórmico (metanoico)',
        iupac: 'ácido metanoico',
        sensoryDescription: 'Sensação de queimação ardida e coceira imediata na derme.',
        realWorldRole: 'Defesa química cáustica inoculada no veneno de formigas e vespas.',
      },
      {
        name: 'Ácido butírico (butanoico)',
        iupac: 'ácido butanoico',
        sensoryDescription: 'Cheiro asqueroso e nauseante de manteiga podre, chulé e vômito.',
        realWorldRole:
          'Gerado pela hidrólise enzimática de lipídios lácteos por bactérias anaeróbias.',
      },
      {
        name: 'Ácido lático (2-hidroxipropanoico)',
        iupac: 'ácido 2-hidroxipropanoico',
        sensoryDescription: 'Acidez cremosa e suave em iogurtes; queimação muscular em sprints.',
        realWorldRole:
          'Fermentação láctica de laticínios e subproduto anaeróbio da glicólise muscular.',
      },
    ],
    enemCuriosity:
      'Os ácidos caproico (C6), caprílico (C8) e cáprico (C10) recebem esses nomes da palavra latina "capra" (cabra), por serem os responsáveis pelo cheiro almiscarado forte de bodes!',
  },
  {
    title: 'Fenóis & Tióis: Antissepsia Hospitalar, Cravo e Gambá',
    badge: 'Desinfecção & Especiarias',
    iconName: 'Award',
    scientificReason:
      'Anéis aromáticos com hidroxila direta com acidez moderada e poder bactericida cáustico, ou compostos com enxofre bivalente volátil de extrema detectabilidade olfativa.',
    compounds: [
      {
        name: 'Fenol Comum (Ácido Fênico)',
        iupac: 'hidroxibenzeno',
        sensoryDescription: 'Odor característico de hospital antigo e desinfetante cirúrgico.',
        realWorldRole:
          'Pioneiro antisséptico de Joseph Lister em 1865 que reduziu a mortalidade pós-cirúrgica.',
      },
      {
        name: 'Eugenol',
        iupac: '4-alil-2-metoxifenol',
        sensoryDescription: 'Aroma quente e acolhedor de cravo-da-índia com efeito anestésico.',
        realWorldRole: 'Culinária festiva e cimento provisório em odontologia clínica.',
      },
      {
        name: 'Cresóis (o, m, p-cresol)',
        iupac: 'metilfenóis',
        sensoryDescription: 'Cheiro alcatroado e pesado de curral desinfetado.',
        realWorldRole: 'Componente ativo da Creolina veterinária para saneamento de instalações.',
      },
      {
        name: 'Etanotiol (Tiol / Mercaptana)',
        iupac: 'etanotiol (CH3-CH2-SH)',
        sensoryDescription: 'Cheiro insuportável de repolho podre, ovo podre e gambá.',
        realWorldRole:
          'Odorizador de segurança injetado em doses mínimas no GLP para denunciar vazamentos de gás.',
      },
    ],
    enemCuriosity:
      'O nariz humano consegue detectar o etanotiol em concentrações minúsculas de 1 parte por bilhão no ar. Sem ele, vazamentos de gás de cozinha (que é inodoro) causariam asfixias e explosões sem aviso!',
  },
  {
    title: 'Álcoois: O Frio Ilusório do Mentol e o Floral dos Gerânios',
    badge: 'Termorrecepção & Biocombustíveis',
    iconName: 'BookOpen',
    scientificReason:
      'Grupos hidroxila (-OH) em carbonos saturados que formam ligações de hidrogênio e ativam termorreceptores neuronais de frio na derme e mucosas.',
    compounds: [
      {
        name: 'Mentol',
        iupac: '2-isopropil-5-metilciclo-hexanol',
        sensoryDescription: 'Sensação física de frio congelante na boca e nas vias aéreas.',
        realWorldRole:
          'Ativa o canal de íons TRPM8 na língua enganando os neurônios com sensação de gelo; usado em pastas de dente e balas.',
      },
      {
        name: 'Geraniol',
        iupac: '(2E)-3,7-dimetilocta-2,6-dien-1-ol',
        sensoryDescription: 'Aroma floral nobre e adocicado de rosas e gerânios.',
        realWorldRole:
          'Essência chave na perfumaria de luxo e feromônio atrator de operárias de abelhas.',
      },
      {
        name: 'Citronelol',
        iupac: '3,7-dimetiloct-6-en-1-ol',
        sensoryDescription: 'Aroma fresco de folhas de eucalipto.',
        realWorldRole:
          'Repelente botânico natural que confunde o sistema olfativo de mosquitos transmissores de doenças.',
      },
      {
        name: 'Etanol',
        iupac: 'etanol',
        sensoryDescription: 'Odor alcoólico límpido com sensação adstringente antisséptica.',
        realWorldRole:
          'Biocombustível renovável da cana-de-açúcar e sanitizante hospitalar a 70%.',
      },
    ],
    enemCuriosity:
      'O mentol não reduz a temperatura da boca em nenhum décimo de grau! Ele simplesmente se liga ao receptor TRPM8, o mesmo que detecta temperaturas abaixo de 15 °C, fazendo o cérebro crer que a boca está congelando!',
  },
  {
    title: 'Amidas: O Fogo Químico da Pimenta e o Alívio da Febre',
    badge: 'Sensação Térmica & Fármacos',
    iconName: 'Crown',
    scientificReason:
      'Amidas lipofílicas que se ligam ao receptor térmico TRPV1, disparando sinais elétricos idênticos aos de queimaduras físicas reais.',
    compounds: [
      {
        name: 'Capsaicina',
        iupac: '(E)-N-(4-hidróxi-3-metoxibenzil)-8-metilnon-6-enamida',
        sensoryDescription: 'Ardência picante lancinante de fogo nas mucosas e garganta.',
        realWorldRole:
          'Ingrediente pungente das pimentas chili e agente ativo do spray de pimenta policial.',
      },
      {
        name: 'Piperina',
        iupac: '1-(5-(benzo[d][1,3]dioxol-5-il)penta-2,4-dienoil)piperidina',
        sensoryDescription: 'Picância seca e estimulante da pimenta-do-reino moída.',
        realWorldRole:
          'Estimulante digestivo de secreções gástricas e absorção de micronutrientes.',
      },
      {
        name: 'Paracetamol',
        iupac: '4-acetamidofenol',
        sensoryDescription: 'Sabor amargo acentuado característico de fármacos sintéticos.',
        realWorldRole:
          'Inibe a síntese de prostaglandinas no hipotálamo, restaurando a temperatura corporal.',
      },
    ],
    enemCuriosity:
      'Por que beber água não passa a ardência da pimenta? A capsaicina é altamente apolar e lipofílica, sendo insolúvel em água. Para aliviar a ardência, beba leite: a gordura e a proteína caseína dissolvem e lavam a capsaicina!',
  },
];

type HubTab = 'compendium' | 'locant_battle' | 'enem_macetes' | 'sensory_guide';

const getSensoryIcon = (name: string) => {
  switch (name) {
    case 'Droplets':
      return <Droplets className="w-5 h-5 text-cyan-400" />;
    case 'Flame':
      return <Flame className="w-5 h-5 text-orange-400" />;
    case 'Award':
      return <Award className="w-5 h-5 text-amber-400" />;
    case 'Zap':
      return <Zap className="w-5 h-5 text-yellow-400" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    case 'BookOpen':
      return <BookOpen className="w-5 h-5 text-blue-400" />;
    case 'Crown':
      return <Crown className="w-5 h-5 text-amber-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-emerald-400" />;
  }
};

export const TheoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HubTab>('compendium');
  const [selectedFunction, setSelectedFunction] = useState<FunctionTheoryDetail>(THEORY_DATA[0]);
  const [selectedBattle, setSelectedBattle] = useState<LocantBattle>(LOCANT_BATTLES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunctions = THEORY_DATA.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exampleIupac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commonNames.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-4 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-800/50 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300">
              Química Orgânica Mestra & Teoria IUPAC
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Compêndio definitivo das 16 funções orgânicas, macetes de vestibular (ENEM, FUVEST, Unicamp), regras de menores localizadores e conexões sensoriais do cotidiano.
          </p>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700/80">
          <button
            onClick={() => setActiveTab('compendium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compendium'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>As 16 Funções</span>
          </button>

          <button
            onClick={() => setActiveTab('locant_battle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'locant_battle'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Batalha dos Localizadores</span>
          </button>

          <button
            onClick={() => setActiveTab('enem_macetes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'enem_macetes'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Macetes do ENEM</span>
          </button>

          <button
            onClick={() => setActiveTab('sensory_guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sensory_guide'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guia Sensorial</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 16 CANONICAL FUNCTIONS COMPENDIUM */}
      {activeTab === 'compendium' && (
        <div className="flex flex-col gap-6">
          {/* Morphology Universal Blueprint */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Anatomia do Nome IUPAC: Decomposição Morfológica Universal
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Todo nome de química orgânica segue rigorosamente esta equação morfológica aditiva:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  1. Classe Especial
                </span>
                <span className="text-sm font-mono font-bold text-rose-200">Ácido / Anidrido</span>
                <p className="text-[11px] text-slate-400">Usado em ácidos carboxílicos e anidridos.</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  2. Substituintes / Radicais
                </span>
                <span className="text-sm font-mono font-bold text-amber-200">4-amino-2-metil</span>
                <p className="text-[11px] text-slate-400">Em ordem alfabética com suas posições.</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  3. Cadeia Principal
                </span>
                <span className="text-sm font-mono font-bold text-cyan-200">prop / but / pent</span>
                <p className="text-[11px] text-slate-400">Nº de carbonos da maior cadeia contínua.</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  4. Grau de Saturação
                </span>
                <span className="text-sm font-mono font-bold text-purple-200">-an- / -2-en- / -in-</span>
                <p className="text-[11px] text-slate-400">Infixo que define ligações simples, duplas ou triplas.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  5. Sufixo Funcional
                </span>
                <span className="text-sm font-mono font-bold text-emerald-200">-oico / -ol / -ona / -al</span>
                <p className="text-[11px] text-slate-400">Determinado pela função de maior prioridade.</p>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar as 16 funções por nome, sufixo ou história..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Main Content: Left Function Selector Pills & Right Detailed Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: 16 Function Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-2 max-h-[620px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                As 16 Classes Canônicas ({filteredFunctions.length})
              </span>
              {filteredFunctions.map((item) => {
                const isSelected = selectedFunction.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFunction(item)}
                    className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-500/80 shadow-lg shadow-cyan-500/10 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-semibold">
                          Rank #{item.priorityRank}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{item.generalFormula}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Functional Card */}
            <div className="lg:col-span-8 flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
              {/* Header & Crown Priority Badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-100">{selectedFunction.title}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                      {selectedFunction.generalFormula}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Identificador: <strong className="text-slate-200">{selectedFunction.identifyingGroup}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 font-mono text-xs font-bold">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Prioridade IUPAC: {selectedFunction.priorityRank} / 16</span>
                </div>
              </div>

              {/* Interactive Molecular Canvas & Morpheme Blueprint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* 2D Chemical Canvas */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Exemplo Típico de Livro-Texto:</span>
                  </div>
                  <SmilesCanvas
                    smiles={selectedFunction.exampleSmiles}
                    width={260}
                    height={160}
                    theme="dark"
                    highlightGroup={selectedFunction.highlightType}
                    className="rounded-lg"
                  />
                  <div className="mt-2 text-center">
                    <div className="text-sm font-bold font-mono text-cyan-300">
                      {selectedFunction.exampleIupac}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {selectedFunction.commonNames}
                    </div>
                  </div>
                </div>

                {/* Suffix vs Radical Prefix */}
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                      Quando Função Principal (Sufixo):
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-200">
                      {selectedFunction.iupacSuffix}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-800/40">
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-0.5">
                      Quando Radical Subordinado (Prefixo):
                    </span>
                    <span className="text-base font-mono font-bold text-orange-200">
                      {selectedFunction.radicalPrefix}
                    </span>
                  </div>
                </div>
              </div>

              {/* How to identify */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col gap-1">
                <span className="font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Como Identificar Estruturalmente na Prova:
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedFunction.identificationRule}</p>
              </div>

              {/* Real World Story */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 text-xs flex flex-col gap-1.5">
                <span className="font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  História Curiosa & Cotidiano Humano:
                </span>
                <p className="text-indigo-100/90 leading-relaxed">{selectedFunction.everydayStory}</p>
              </div>

              {/* ENEM Tip */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs flex flex-col gap-1.5">
                <span className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Dica Quente de Prova (ENEM / Vestibulares):
                </span>
                <p className="text-amber-100/90 leading-relaxed">{selectedFunction.enemTip}</p>
              </div>
            </div>
          </div>

          {/* IUPAC Priority Crown Hierarchy Chart */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Tabela Real de Prioridade IUPAC (Da Maior à Menor)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Se a molécula tiver 2 ou mais grupos, apenas o que estiver mais à esquerda nesta hierarquia será o sufixo principal. Todos os outros serão rebaixados a radicais (prefixos):
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {[...THEORY_DATA]
                .sort((a, b) => b.priorityRank - a.priorityRank)
                .map((fn, idx) => (
                  <div key={fn.id} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedFunction(fn)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border ${
                        selectedFunction.id === fn.id
                          ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] text-amber-400 font-black">#{fn.priorityRank}</span>
                      <span>{fn.title}</span>
                    </button>
                    {idx < THEORY_DATA.length - 1 && (
                      <span className="text-slate-600 font-bold text-xs">›</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATALHA DOS LOCALIZADORES */}
      {activeTab === 'locant_battle' && (
        <div className="flex flex-col gap-6">
          {/* Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Arena de Combate: A Regra de Ouro dos Menores Localizadores
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Em vestibulares e no ENEM, mais de 40% dos erros de nomenclatura ocorrem por inverter o sentido da numeração dos carbonos. Analise os duelos clássicos lado a lado e domine o critério do primeiro ponto de diferença (IUPAC Blue Book P-14.3.5)!
            </p>
          </div>

          {/* Battle Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LOCANT_BATTLES.map((battle) => {
              const isSelected = selectedBattle.id === battle.id;
              return (
                <button
                  key={battle.id}
                  onClick={() => setSelectedBattle(battle)}
                  className={`p-3.5 rounded-xl text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {battle.categoryBadge}
                  </span>
                  <span className="font-bold text-sm text-slate-100">{battle.title}</span>
                  <span className="text-[11px] font-mono text-cyan-300">
                    {battle.winner.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Battle Arena Card */}
          <div className="flex flex-col gap-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {selectedBattle.categoryBadge}
                </span>
                <h3 className="text-2xl font-black text-slate-100">{selectedBattle.title}</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Regra IUPAC P-14
              </span>
            </div>

            {/* Molecule Visual & Rule Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                <span className="text-[11px] font-mono text-slate-400 mb-2">
                  Esqueleto Molecular em Disputa:
                </span>
                <SmilesCanvas
                  smiles={selectedBattle.smiles}
                  width={240}
                  height={150}
                  theme="dark"
                  className="rounded-lg"
                />
              </div>

              <div className="md:col-span-8 flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-wide block mb-1">
                    Enunciado da Regra:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{selectedBattle.ruleSummary}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs">
                  <span className="font-bold text-amber-300 uppercase tracking-wide block mb-1">
                    Norma Autoritativa:
                  </span>
                  <p className="text-amber-100/90 font-mono text-[11px] leading-relaxed">
                    {selectedBattle.iupacRuleCitation}
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Confrontation Cards (Winner vs Loser) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Winner Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-600/50 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      Nomenclatura Vencedora (IUPAC Oficial)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/40">
                    VITÓRIA
                  </span>
                </div>

                <div className="text-xl font-black font-mono text-emerald-200">
                  {selectedBattle.winner.name}
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="text-slate-300">
                    <strong className="text-emerald-400">Localizadores Obtidos:</strong>{' '}
                    <span className="font-mono">{selectedBattle.winner.locantSet}</span>
                  </div>
                  <div className="text-slate-300">
                    <strong className="text-emerald-400">Sentido de Leitura:</strong>{' '}
                    {selectedBattle.winner.direction}
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-100 text-[11px] leading-relaxed">
                    {selectedBattle.winner.reason}
                  </div>
                </div>
              </div>

              {/* Loser Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-800/50 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                      Nomenclatura Incorreta (Pegadinha)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-200 border border-rose-500/40">
                    DERROTA
                  </span>
                </div>

                <div className="text-xl font-black font-mono text-rose-300 line-through">
                  {selectedBattle.loser.name}
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="text-slate-300">
                    <strong className="text-rose-400">Localizadores Inválidos:</strong>{' '}
                    <span className="font-mono">{selectedBattle.loser.locantSet}</span>
                  </div>
                  <div className="text-slate-300">
                    <strong className="text-rose-400">Sentido Falho:</strong>{' '}
                    {selectedBattle.loser.direction}
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-100 text-[11px] leading-relaxed">
                    {selectedBattle.loser.errorReason}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MACETES E DICAS QUENTES DO ENEM */}
      {activeTab === 'enem_macetes' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Macetes Mnemônicos & Dicas Quentes para o ENEM
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A química orgânica representa mais de 30% da prova de Ciências da Natureza. Memorize os 6 macetes definitivos para nunca mais cair em armadilhas de pegadinhas de bancas examinadoras!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ENEM_MACETES.map((macete) => (
              <div
                key={macete.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 shadow-xl flex flex-col gap-3 transition-all"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-black text-slate-100 text-base">{macete.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    {macete.badge}
                  </span>
                </div>

                {/* Mnemonic Chant Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-700/50 text-purple-200 text-xs font-bold leading-relaxed shadow-sm">
                  {macete.mnemonicChant}
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">{macete.explanation}</p>

                {/* Exam Trap */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs flex flex-col gap-1">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Armadilha Clássica do Vestibular:
                  </span>
                  <p className="text-amber-100/90 text-[11px] leading-relaxed">{macete.examTrap}</p>
                </div>

                {/* Practical Example */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col gap-1 font-mono">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    Exemplo na Prática: {macete.practicalExample.molecule}
                  </span>
                  <div className="text-emerald-400 text-[11px]">
                    ✓ {macete.practicalExample.correct}
                  </div>
                  <div className="text-rose-400 text-[11px] line-through">
                    ✗ {macete.practicalExample.wrong}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GUIA SENSORIAL & COTIDIANO */}
      {activeTab === 'sensory_guide' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Guia Sensorial & Conexões do Cotidiano Humano
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Por que os ésteres cheiram a frutas? Por que as aminas cheiram a peixe podre? Por que a pimenta arde sem queimar a pele? Descubra a química por trás de todos os sentidos humanos explorados no ENEM!
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SENSORY_PROFILES.map((profile, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {getSensoryIcon(profile.iconName)}
                    <h3 className="text-lg font-black text-slate-100">{profile.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {profile.badge}
                  </span>
                </div>

                {/* Scientific Reason */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col gap-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-wide text-[10px]">
                    Fundamento Químico & Molecular:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{profile.scientificReason}</p>
                </div>

                {/* Compounds Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {profile.compounds.map((cmp, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-1.5 text-xs"
                    >
                      <span className="font-bold text-slate-100">{cmp.name}</span>
                      <span className="font-mono text-[10px] text-cyan-400">{cmp.iupac}</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                        {cmp.sensoryDescription}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 mt-auto">
                        <strong>Uso:</strong> {cmp.realWorldRole}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ENEM Curiosity */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/50 text-xs flex flex-col gap-1">
                  <span className="font-bold text-indigo-300 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Curiosidade de Prova (ENEM / Cotidiano):
                  </span>
                  <p className="text-indigo-100/90 leading-relaxed">{profile.enemCuriosity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
