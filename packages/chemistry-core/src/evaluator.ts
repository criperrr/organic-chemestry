import {
  EvaluationResult,
  IUPACNameAST,
  IUPAC_PRIORITY_ORDER,
  OrganicFunction,
  PartialCreditBreakdown,
} from './types.js';
import { normalizeIUPACName } from './normalizer.js';
import { parseIUPACName } from './parser.js';

export const FUNCTION_PT_BR_NAMES: Record<OrganicFunction, string> = {
  hidrocarboneto: 'Hidrocarboneto',
  alcool: 'Álcool',
  fenol: 'Fenol',
  enol: 'Enol',
  eter: 'Éter',
  aldeido: 'Aldeído',
  cetona: 'Cetona',
  acido_carboxilico: 'Ácido Carboxílico',
  ester: 'Éster',
  amina: 'Amina',
  amida: 'Amida',
  nitrila: 'Nitrila',
  nitrocomposto: 'Nitrocomposto',
  haleto_alquila: 'Haleto de Alquila',
  haleto_acila: 'Haleto de Acila',
  anidrido: 'Anidrido de Ácido',
};

export const COMMON_SYNONYMS: Record<string, string> = {
  "1,3,7-trimetilxantina": "1,3,7-trimetilpurina-2,6-diona",
  "1-naftol": "naftalen-1-ol",
  "2,4,6-trinitrotolueno": "2-metil-1,3,5-trinitrobenzeno",
  "2-naftol": "naftalen-2-ol",
  aas: "acido 2-acetoxibenzoico",
  acetaldeido: "etanal",
  acetamida: "etanamida",
  acetaminofeno: "4-acetamidofenol",
  acetanilida: "N-fenilacetamida",
  "acetato de benzila": "etanoato de benzila",
  "acetato de butila": "etanoato de butila",
  "acetato de etila": "etanoato de etila",
  "acetato de fenila": "etanoato de fenila",
  "acetato de isoamila": "etanoato de 3-metilbutila",
  "acetato de isopentila": "etanoato de 3-metilbutila",
  "acetato de metila": "etanoato de metila",
  "acetato de propila": "etanoato de propila",
  acetileno: "etino",
  acetona: "propanona",
  acetonitrila: "etanonitrila",
  "acido acetico": "acido etanoico",
  "acido acetilsalicilico": "ácido 2-acetoxibenzoico",
  "acido acetoacetico": "ácido 3-oxobutanoico",
  "acido acrilico": "ácido propenoico",
  "acido adipico": "ácido hexanodioico",
  "acido benzoico": "ácido benzoico",
  "acido butirico": "acido butanoico",
  "acido caprico": "ácido decanoico",
  "acido caprilico": "ácido octanoico",
  "acido caproico": "ácido hexanoico",
  "acido carbolico": "hidroxibenzeno",
  "acido cianidrico": "metanonitrila",
  "acido citrico": "ácido 2-hidroxipropano-1,2,3-tricarboxílico",
  "acido crotonico": "ácido (E)-but-2-enoico",
  "acido enantico": "ácido heptanoico",
  "acido estearico": "ácido octadecanoico",
  "acido fenico": "hidroxibenzeno",
  "acido formico": "acido metanoico",
  "acido ftalico": "ácido benzeno-1,2-dicarboxílico",
  "acido fumarico": "ácido (E)-butenodioico",
  "acido glutarico": "ácido pentanodioico",
  "acido isobutirico": "ácido 2-metilpropanoico",
  "acido isovalerico": "ácido 3-metilbutanoico",
  "acido lactico": "acido 2-hidroxipropanoico",
  "acido latico": "acido 2-hidroxipropanoico",
  "acido laurico": "ácido dodecanoico",
  "acido linoleico": "ácido (9Z,12Z)-octadeca-9,12-dienoico",
  "acido maleico": "ácido (Z)-butenodioico",
  "acido malico": "ácido 2-hidroxibutanodioico",
  "acido malonico": "ácido propanodioico",
  "acido metacrilico": "ácido 2-metilpropenoico",
  "acido miristico": "ácido tetradecanoico",
  "acido oleico": "ácido (9Z)-octadec-9-enoico",
  "acido oxalico": "ácido etanodioico",
  "acido palmitico": "ácido hexadecanoico",
  "acido pelargonico": "ácido nonanoico",
  "acido picrico": "2,4,6-trinitrofenol",
  "acido piruvico": "ácido 2-oxopropanoico",
  "acido pivalico": "ácido 2,2-dimetilpropanoico",
  "acido propionico": "acido propanoico",
  "acido salicilico": "acido 2-hidroxibenzoico",
  "acido stearico": "ácido octadecanoico",
  "acido succinico": "ácido butanodioico",
  "acido tartarico": "ácido 2,3-di-hidroxibutanodioico",
  "acido tereftalico": "ácido benzeno-1,4-dicarboxílico",
  "acido valerico": "ácido pentanoico",
  acrilamida: "propenamida",
  "acrilato de metila": "propenoato de metila",
  acrilonitrila: "propenonitrila",
  acroleina: "propenal",
  adipaldeido: "hexanodial",
  adiponitrila: "hexanodinitrila",
  "alcool alilico": "prop-2-en-1-ol",
  "alcool benzilico": "fenilmetanol",
  "alcool etilico": "etanol",
  "alcool isobutilico": "2-metilpropan-1-ol",
  "alcool isopropilico": "propan-2-ol",
  "alcool metilico": "metanol",
  "alcool sec-butilico": "butan-2-ol",
  "alcool secbutilico": "butan-2-ol",
  "alcool terbutilico": "2-metilpropan-2-ol",
  "alcool terc-butilico": "2-metilpropan-2-ol",
  "alfa-naftol": "naftalen-1-ol",
  aminobenzeno: "fenilamina",
  "anidrido acetico": "anidrido etanoico",
  "anidrido benzoico": "anidrido benzoico",
  "anidrido butirico": "anidrido butanoico",
  "anidrido ftalico": "anidrido 1,3-di-hidroisobenzofuran-1,3-diona",
  "anidrido maleico": "anidrido (Z)-butenodioico",
  "anidrido propionico": "anidrido propanoico",
  "anidrido succinico": "anidrido butanodioico",
  anilina: "benzenamina",
  anisol: "metoxibenzeno",
  antraceno: "antraceno",
  aspirina: "acido 2-acetoxibenzoico",
  benzaldeido: "benzaldeído",
  benzenocarbaldeido: "benzaldeído",
  benzenol: "hidroxibenzeno",
  benzilamina: "fenilmetanamina",
  "benzoato de etila": "benzoato de etila",
  "benzoato de metila": "benzoato de metila",
  benzonitrila: "benzonitrila",
  "beta-naftol": "naftalen-2-ol",
  "brometo de acetila": "brometo de etanoíla",
  "brometo de etila": "bromoetano",
  "brometo de metila": "bromometano",
  bromoformio: "tribromometano",
  butileno: "but-1-eno",
  butiraldeido: "butanal",
  "butirato de etila": "butanoato de etila",
  "butirato de metila": "butanoato de metila",
  cadaverina: "pentano-1,5-diamina",
  cafeina: "1,3,7-trimetilpurina-2,6-diona",
  canfora: "1,7,7-trimetilbiciclo[2.2.1]heptan-2-ona",
  capsaicina: "(E)-N-(4-hidroxi-3-metoxibenzil)-8-metilnon-6-enamida",
  carvacrol: "5-isopropil-2-metilfenol",
  catecol: "benzeno-1,2-diol",
  "cfc-12": "diclorodifluorometano",
  "cianeto de benzila": "2-feniletanonitrila",
  "cianeto de etila": "propanonitrila",
  "cianeto de fenila": "benzonitrila",
  "cianeto de hidrogenio": "metanonitrila",
  "cianeto de metila": "etanonitrila",
  cinamaldeido: "(2E)-3-fenilprop-2-enal",
  citral: "3,7-dimetilocta-2,6-dienal",
  citronelol: "3,7-dimetiloct-6-en-1-ol",
  "cloreto de acetila": "cloreto de etanoíla",
  "cloreto de acriloila": "cloreto de propenoíla",
  "cloreto de adipofla": "dicloreto de hexanodioíla",
  "cloreto de alila": "3-cloroprop-1-eno",
  "cloreto de benzila": "(clorometil)benzeno",
  "cloreto de benzoila": "cloreto de benzoíla",
  "cloreto de butirila": "cloreto de butanoíla",
  "cloreto de etila": "cloroetano",
  "cloreto de formila": "cloreto de metanoíla",
  "cloreto de isopropila": "2-cloropropano",
  "cloreto de metacriloila": "cloreto de 2-metilpropenoíla",
  "cloreto de metila": "clorometano",
  "cloreto de metileno": "diclorometano",
  "cloreto de oxalila": "dicloreto de etanodioíla",
  "cloreto de propionila": "cloreto de propanoíla",
  "cloreto de succinila": "dicloreto de butanodioíla",
  "cloreto de terc-butila": "2-cloro-2-metilpropano",
  "cloreto de vinila": "cloroeteno",
  cloroformio: "triclorometano",
  crotonaldeido: "but-2-enal",
  cumeno: "isopropilbenzeno",
  ddt: "1,1,1-tricloro-2,2-bis(4-clorofenil)etano",
  deet: "N,N-dietil-3-metilbenzamida",
  dietilamina: "N-etiletanamina",
  difenilamina: "N-fenilbenzenamina",
  "dimetil cetona": "propanona",
  dimetilacetamida: "N,N-dimetiletanamida",
  dimetilamina: "N-metilmetanamina",
  dimetilcetona: "propanona",
  dimetilformamida: "N,N-dimetilmetanamida",
  dioxano: "1,4-dioxano",
  dmac: "N,N-dimetiletanamida",
  dmf: "N,N-dimetilmetanamida",
  estireno: "etenilbenzeno",
  etanolamina: "2-aminoetanol",
  "eter di-isopropilico": "2-isopropoxipropano",
  "eter dietilico": "etoxietano",
  "eter dimetilico": "metoximetano",
  "eter dipropilico": "1-propoxipropano",
  "eter etilico": "etoxietano",
  "eter etilmetilico": "metoxietano",
  "eter metil-etilico": "metoxietano",
  etilamina: "etanamina",
  etileno: "eteno",
  etilenodiamina: "etano-1,2-diamina",
  etilenoglicol: "etano-1,2-diol",
  eugenol: "4-alil-2-metoxifenol",
  fenantreno: "fenantreno",
  fenetol: "etoxibenzeno",
  fenol: "hidroxibenzeno",
  floroglucinol: "benzeno-1,3,5-triol",
  formaldeido: "metanal",
  formamida: "metanamida",
  "formiato de etila": "metanoato de etila",
  "formiato de metila": "metanoato de metila",
  formol: "metanal",
  "freon-12": "diclorodifluorometano",
  "gas acetileno": "etino",
  "gas etileno": "eteno",
  geranial: "(2E)-3,7-dimetilocta-2,6-dienal",
  geraniol: "(2E)-3,7-dimetilocta-2,6-dien-1-ol",
  glicerina: "propano-1,2,3-triol",
  glicerol: "propano-1,2,3-triol",
  glioxal: "etanodial",
  glutaraldeido: "pentanodial",
  guaicol: "2-metoxifenol",
  hexametilenodiamina: "hexano-1,6-diamina",
  hidroquinona: "benzeno-1,4-diol",
  "iodeto de etila": "iodoetano",
  "iodeto de metila": "iodometano",
  iodoforme: "tri-iodometano",
  isobutano: "2-metilpropano",
  isobuteno: "2-metilpropeno",
  isobutileno: "2-metilpropeno",
  isooctano: "2,2,4-trimetilpentano",
  isopentano: "2-metilbutano",
  isopreno: "2-metilbuta-1,3-dieno",
  isopropanol: "propan-2-ol",
  isopropilamina: "propan-2-amina",
  isovaleraldeido: "3-metilbutanal",
  limoneno: "1-metil-4-(prop-1-en-2-il)ciclo-hex-1-eno",
  "m-cresol": "3-metilfenol",
  "m-toluidina": "3-metilfenilamina",
  "m-xileno": "1,3-dimetilbenzeno",
  malonaldeido: "propanodial",
  malononitrila: "propanodinitrila",
  mentol: "2-isopropil-5-metilciclo-hexanol",
  mesitileno: "1,3,5-trimetilbenzeno",
  metacresol: "3-metilfenol",
  "metacrilato de metila": "2-metilpropenoato de metila",
  metaxileno: "1,3-dimetilbenzeno",
  "metil-etil-cetona": "butan-2-ona",
  "metil-terc-butil-eter": "2-metoxi-2-metilpropano",
  metilamina: "metanamina",
  metiletilcetona: "butan-2-ona",
  metilparabeno: "4-hidroxibenzoato de metila",
  mtbe: "2-metoxi-2-metilpropano",
  naftaleno: "naftaleno",
  naftalina: "naftaleno",
  neopentano: "2,2-dimetilpropano",
  neral: "(2Z)-3,7-dimetilocta-2,6-dienal",
  nicotina: "3-(1-metilpirrolidin-2-il)piridina",
  nitrobenzeno: "nitrobenzeno",
  nitroetano: "nitroetano",
  nitrometano: "nitrometano",
  "o-cresol": "2-metilfenol",
  "o-toluidina": "2-metilfenilamina",
  "o-xileno": "1,2-dimetilbenzeno",
  ortocresol: "2-metilfenol",
  ortoxileno: "1,2-dimetilbenzeno",
  oxamida: "etanodiamida",
  "p-cresol": "4-metilfenol",
  "p-toluidina": "4-metilfenilamina",
  "p-xileno": "1,4-dimetilbenzeno",
  paracetamol: "4-acetamidofenol",
  paracresol: "4-metilfenol",
  paraxileno: "1,4-dimetilbenzeno",
  piperina: "1-(5-(benzo[d][1,3]dioxol-5-il)penta-2,4-dienoil)piperidina",
  pirocatecol: "benzeno-1,2-diol",
  pirogallol: "benzeno-1,2,3-triol",
  pivalaldeido: "2,2-dimetilpropanal",
  "propan-2-ona": "propanona",
  propileno: "propeno",
  propilparabeno: "4-hidroxibenzoato de propila",
  propionaldeido: "propanal",
  putrescina: "butano-1,4-diamina",
  resorcinol: "benzeno-1,3-diol",
  "salicilato de metila": "2-hidroxibenzoato de metila",
  succinaldeido: "butanodial",
  succinonitrila: "butanodinitrila",
  teobromina: "3,7-dimetilpurina-2,6-diona",
  teofilina: "1,3-dimetilpurina-2,6-diona",
  "terc-butilamina": "2-metilpropan-2-amina",
  "tetra-hidrofurano": "oxolano",
  "tetracloreto de carbono": "tetraclorometano",
  thf: "oxolano",
  timol: "2-isopropil-5-metilfenol",
  tnt: "2-metil-1,3,5-trinitrobenzeno",
  tolueno: "metilbenzeno",
  triacetina: "triacetato de propano-1,2,3-triila",
  trietilamina: "N,N-dietiletanamina",
  trimetilamina: "N,N-dimetilmetanamina",
  ureia: "diamidometanal",
  valeraldeido: "pentanal",
  "valerato de etila": "pentanoato de etila",
  vanilina: "4-hidróxi-3-metoxibenzaldeído",
};

/**
 * Pedagogical Priority Crown mnemonic constant for pt-BR organic chemistry students.
 */
export const PRIORITY_CROWN_MNEMONIC =
  '👑 Macete da Coroa de Prioridade IUPAC: Ácido Carboxílico > Anidrido > Éster > Haleto de Acila > Amida > Nitrila > Aldeído > Cetona > Álcool > Enol > Fenol > Amina > Éter > Haleto de Alquila > Nitrocomposto > Hidrocarboneto.';

export const PRIORITY_CROWN_ENEM_RHYME =
  '🎓 Mnemônico do ENEM: "Ácido Anidrou Éster Há Anos; Nitrilas Aldeídicas Cederam Álcoois E Fenóis Às Aminas, Éteres, Haletos e Nitros!"';

/**
 * Checks if a priority inversion occurred between target and user nomenclature.
 */
function checkPriorityInversion(
  userAST: IUPACNameAST,
  targetAST: IUPACNameAST
): { isInverted: boolean; details?: string } {
  const targetFn = targetAST.primaryFunction;
  const userFn = userAST.primaryFunction;

  if (!targetFn || !userFn || targetFn === userFn) {
    return { isInverted: false };
  }

  const targetPriority = IUPAC_PRIORITY_ORDER[targetFn] || 0;
  const userPriority = IUPAC_PRIORITY_ORDER[userFn] || 0;

  // Case 1: Target has higher priority than user's choice,
  // AND user included the target's functional group as a substituent radical!
  // e.g. target is acido (16), user chose alcool (8) with substituent 'carboxi'
  const targetFnPresentInUserSubstituents = userAST.substituents.some(
    (s) => s.subordinateFunction === targetFn
  );

  if (targetPriority > userPriority && targetFnPresentInUserSubstituents) {
    const targetLabel = FUNCTION_PT_BR_NAMES[targetFn];
    const userLabel = FUNCTION_PT_BR_NAMES[userFn];

    const details =
      `Você identificou corretamente o grupo ${targetLabel.toLowerCase()} e o grupo ${userLabel.toLowerCase()}, ` +
      `mas ${targetLabel.toLowerCase()} tem prioridade SUPERIOR sobre ${userLabel.toLowerCase()}. ` +
      `A função prioritária deve definir o sufixo principal, enquanto a outra atua como radical substituinte!\n` +
      `${PRIORITY_CROWN_MNEMONIC}\n` +
      `${PRIORITY_CROWN_ENEM_RHYME}`;

    return { isInverted: true, details };
  }

  return { isInverted: false };
}

/**
 * Computes partial credit score for organic function.
 */
function evaluateFunction(
  userAST: IUPACNameAST,
  targetAST: IUPACNameAST,
  isInverted: boolean
): number {
  if (userAST.primaryFunction === targetAST.primaryFunction) {
    // Check ester alkyl part
    if (targetAST.primaryFunction === 'ester') {
      if (
        targetAST.esterAlkylPart &&
        userAST.esterAlkylPart &&
        targetAST.esterAlkylPart !== userAST.esterAlkylPart
      ) {
        return 0.7;
      }
    }
    // Check acyl halide halogen
    if (targetAST.primaryFunction === 'haleto_acila') {
      if (
        targetAST.acylHalideHalogen &&
        userAST.acylHalideHalogen &&
        targetAST.acylHalideHalogen !== userAST.acylHalideHalogen
      ) {
        return 0.7;
      }
    }
    return 1.0;
  }

  // Priority inversion award
  if (isInverted) {
    return 0.4;
  }

  // Chemically close families
  const uFn = userAST.primaryFunction;
  const tFn = targetAST.primaryFunction;
  if ((uFn === 'alcool' && tFn === 'enol') || (uFn === 'enol' && tFn === 'alcool')) {
    return 0.5;
  }
  if ((uFn === 'alcool' && tFn === 'fenol') || (uFn === 'fenol' && tFn === 'alcool')) {
    return 0.4;
  }
  if ((uFn === 'aldeido' && tFn === 'cetona') || (uFn === 'cetona' && tFn === 'aldeido')) {
    return 0.35;
  }
  if ((uFn === 'amina' && tFn === 'amida') || (uFn === 'amida' && tFn === 'amina')) {
    return 0.3;
  }

  return 0.0;
}

/**
 * Computes partial credit score for carbon chain length and ring type.
 */
function evaluateChain(userAST: IUPACNameAST, targetAST: IUPACNameAST): number {
  const ringMatch =
    userAST.isRing === targetAST.isRing &&
    (!targetAST.isRing || userAST.ringType === targetAST.ringType);

  const diff = Math.abs(userAST.carbonCount - targetAST.carbonCount);
  let carbonScore = 0;

  if (diff === 0) {
    carbonScore = 1.0;
  } else if (diff === 1) {
    carbonScore = 0.5;
  } else if (diff === 2) {
    carbonScore = 0.25;
  } else {
    carbonScore = 0.0;
  }

  return ringMatch ? carbonScore : carbonScore * 0.5;
}

/**
 * Computes partial credit score for bond saturation and locants.
 */
function evaluateBonds(userAST: IUPACNameAST, targetAST: IUPACNameAST): number {
  const targetPrimaryBond = targetAST.bonds[0]?.type || 'an';
  const userPrimaryBond = userAST.bonds[0]?.type || 'an';

  if (targetPrimaryBond === userPrimaryBond) {
    // If no locants needed (e.g. 'an' or single option)
    const targetLocs = targetAST.bonds[0]?.locants;
    const userLocs = userAST.bonds[0]?.locants;

    if (!targetLocs || targetLocs.length === 0) {
      return 1.0;
    }

    if (!userLocs || userLocs.length === 0) {
      // User forgot locant
      return 0.75;
    }

    // Compare locants
    const matches =
      targetLocs.length === userLocs.length &&
      targetLocs.every((loc, idx) => loc === userLocs[idx]);

    return matches ? 1.0 : 0.6;
  }

  // Mismatch in bond type
  if (
    (targetPrimaryBond === 'dien' && userPrimaryBond === 'en') ||
    (targetPrimaryBond === 'en' && userPrimaryBond === 'dien')
  ) {
    return 0.5;
  }

  if (
    (targetPrimaryBond === 'en' && userPrimaryBond === 'in') ||
    (targetPrimaryBond === 'in' && userPrimaryBond === 'en')
  ) {
    return 0.3;
  }

  return 0.0;
}

/**
 * Computes partial credit score for radicals and substituents.
 */
function evaluateRadicals(
  userAST: IUPACNameAST,
  targetAST: IUPACNameAST,
  isInverted: boolean
): number {
  const targetSubs = targetAST.substituents;
  const userSubs = userAST.substituents;

  if (targetSubs.length === 0 && userSubs.length === 0) {
    return 1.0;
  }

  if (targetSubs.length === 0 && userSubs.length > 0) {
    // User added substituents where none exist
    return Math.max(0, 1 - userSubs.length * 0.3);
  }

  if (targetSubs.length > 0 && userSubs.length === 0) {
    // User missed all substituents
    return 0.0;
  }

  let matchedScore = 0;
  const usedUserIndices = new Set<number>();

  for (const tSub of targetSubs) {
    let bestSubScore = 0;
    let bestIdx = -1;

    for (let i = 0; i < userSubs.length; i++) {
      if (usedUserIndices.has(i)) continue;
      const uSub = userSubs[i];

      // Exact radical name match
      if (tSub.name === uSub.name) {
        // Compare locants
        const locantsMatch =
          tSub.locants.length === uSub.locants.length &&
          tSub.locants.every((l, idx) => String(l) === String(uSub.locants[idx]));

        const currentScore = locantsMatch ? 1.0 : 0.7;
        if (currentScore > bestSubScore) {
          bestSubScore = currentScore;
          bestIdx = i;
        }
      } else if (
        tSub.subordinateFunction &&
        tSub.subordinateFunction === uSub.subordinateFunction
      ) {
        // Subordinated functional radical matched by function
        const currentScore = 0.8;
        if (currentScore > bestSubScore) {
          bestSubScore = currentScore;
          bestIdx = i;
        }
      }
    }

    if (bestIdx >= 0) {
      usedUserIndices.add(bestIdx);
      matchedScore += bestSubScore;
    }
  }

  if (isInverted && matchedScore === 0) {
    // In priority inversion, the subordinated function was used as suffix
    matchedScore += 0.5;
  }

  const maxCount = Math.max(targetSubs.length, userSubs.length);
  return Math.min(1.0, matchedScore / maxCount);
}

/**
 * Generates rich, educational feedback messages in Portuguese (pt-BR).
 */
function generateFeedback(
  userAST: IUPACNameAST,
  targetAST: IUPACNameAST,
  breakdown: PartialCreditBreakdown,
  isInverted: boolean,
  inversionDetails?: string,
  acceptedSynonymMatched?: boolean
): string[] {
  const messages: string[] = [];

  if (acceptedSynonymMatched) {
    messages.push('Excelente! Nome usual / sinônimo aceito com sucesso.');
    return messages;
  }

  const totalScore =
    0.35 * breakdown.functionScore +
    0.25 * breakdown.chainScore +
    0.20 * breakdown.bondScore +
    0.20 * breakdown.radicalScore;

  if (totalScore >= 0.98) {
    messages.push('Perfeito! Nomenclatura IUPAC perfeitamente correta!');
    return messages;
  }

  // Priority inversion feedback
  if (isInverted && inversionDetails) {
    messages.push(`[⚠️ Inversão de Prioridade IUPAC] ${inversionDetails}`);
  } else if (breakdown.functionScore >= 0.98) {
    const fnName = targetAST.primaryFunction
      ? FUNCTION_PT_BR_NAMES[targetAST.primaryFunction]
      : 'Correta';
    messages.push(`Função orgânica principal identificada corretamente: ${fnName}.`);
  } else {
    const targetFn = targetAST.primaryFunction
      ? FUNCTION_PT_BR_NAMES[targetAST.primaryFunction]
      : 'outra função';
    const userFn = userAST.primaryFunction
      ? FUNCTION_PT_BR_NAMES[userAST.primaryFunction]
      : 'hidrocarboneto';
    messages.push(
      `Atenção à função principal: a estrutura pertence a ${targetFn}, mas sua resposta indicou terminação de ${userFn}.`
    );

    // Contextual pedagogical mnemonics
    const tFn = targetAST.primaryFunction;
    const uFn = userAST.primaryFunction;
    if ((tFn === 'aldeido' && uFn === 'cetona') || (tFn === 'cetona' && uFn === 'aldeido')) {
      messages.push(
        '💡 Macete ENEM (Aldeído vs Cetona): Aldeído fica na PONTA (carbono 1 terminal H-C=O); Cetona fica NO MEIO da cadeia carbônica (mínimo 3 carbonos, C-CO-C)!'
      );
    } else if ((tFn === 'amida' && uFn === 'amina') || (tFn === 'amina' && uFn === 'amida')) {
      messages.push(
        '💡 Macete ENEM (Amida vs Amina): Amida tem a Carbonila colada no Nitrogênio (C=O ligado ao N, ligação peptídica!); Amina é Nitrogênio ligado a carbono comum sem C=O vizinho (caráter básico)!'
      );
    } else if ((tFn === 'ester' && uFn === 'eter') || (tFn === 'eter' && uFn === 'ester')) {
      messages.push(
        '💡 Macete ENEM (Éster vs Éter): Éster tem carbonila conjugada ao oxigênio (-COO-C, essências doces frutadas!); Éter tem apenas o oxigênio heteroátomo entre carbonos (C-O-C, solvente anestésico)!'
      );
    } else if ((tFn === 'fenol' && uFn === 'alcool') || (tFn === 'alcool' && uFn === 'fenol')) {
      messages.push(
        '💡 Macete ENEM (Fenol vs Álcool): Fenol liga a hidroxila (-OH) DIRETAMENTE no anel aromático benzênico! Se houver um carbono sp3 (-CH2-) entre o anel e o -OH, é um álcool aromático (álcool benzílico)!'
      );
    } else if ((tFn === 'enol' && uFn === 'alcool') || (tFn === 'alcool' && uFn === 'enol')) {
      messages.push(
        '💡 Macete ENEM (Enol vs Álcool): Enol tem a hidroxila (-OH) ligada a um carbono de dupla ligação alifática C=C (instável, sofre tautomeria); Álcool tem a hidroxila em carbono saturado sp3!'
      );
    }
  }

  // Chain feedback
  if (targetAST.isRing && !userAST.isRing) {
    messages.push(
      'Atenção: a molécula possui uma cadeia cíclica (fechada), exigindo o prefixo "ciclo-".'
    );
  } else if (!targetAST.isRing && userAST.isRing) {
    messages.push(
      'Atenção: a cadeia principal é aberta (acíclica), não devendo conter o prefixo "ciclo-".'
    );
  } else if (breakdown.chainScore >= 0.98) {
    messages.push(`Cadeia principal correta com ${targetAST.carbonCount} carbonos.`);
  } else {
    messages.push(
      `A cadeia principal possui ${targetAST.carbonCount} carbonos (prefixo "${targetAST.mainChainPrefix}"), mas você indicou ${userAST.carbonCount} carbonos.`
    );
  }

  // Bonds feedback
  if (breakdown.bondScore >= 0.98) {
    messages.push('Grau de saturação e insaturações corretos.');
  } else if (breakdown.bondScore >= 0.5) {
    messages.push(
      'As insaturações foram identificadas, mas verifique a numeração dos carbonos para dar as menores posições possíveis.'
    );
    messages.push(
      '💡 Regra da Numeração Menor (IUPAC): Comece a numerar pela extremidade mais próxima do grupo funcional; havendo empate, priorize as insaturações sobre as ramificações.'
    );
  } else {
    const targetBondType = targetAST.bonds[0]?.type || 'an';
    if (targetBondType === 'en') {
      messages.push('Atenção: a molécula possui uma dupla ligação (infixo "-en-").');
    } else if (targetBondType === 'in') {
      messages.push('Atenção: a molécula possui uma tripla ligação (infixo "-in-").');
    } else if (targetBondType === 'dien') {
      messages.push('Atenção: a molécula possui duas duplas ligações (infixo "-dien-").');
    } else {
      messages.push('Atenção ao grau de saturação das ligações.');
    }
  }

  // Radicals feedback
  if (targetAST.substituents.length > 0) {
    if (breakdown.radicalScore >= 0.98) {
      messages.push('Ramificações e substituintes identificados com precisão!');
    } else if (breakdown.radicalScore >= 0.6) {
      messages.push(
        'Substituintes identificados, mas revise a posição numérica (locantes / localizadores) na cadeia principal.'
      );
      messages.push(
        '💡 Batalha dos Localizadores: A cadeia principal é numerada no sentido que forneça os menores localizadores no primeiro ponto de diferença!'
      );
    } else {
      messages.push(
        'Verifique os grupos substituintes e suas ramificações ao longo da cadeia.'
      );
    }
  }

  return messages;
}

/**
 * Evaluates a user input IUPAC name against a canonical target IUPAC name or target AST.
 * Awards granular partial credit (35% function, 25% chain, 20% bonds, 20% radicals).
 */
export function evaluateIUPACName(
  userInput: string,
  targetInput: string | IUPACNameAST,
  acceptedSynonyms: string[] = []
): EvaluationResult {
  const normUser = normalizeIUPACName(userInput);

  let targetAST: IUPACNameAST;
  let targetNormalized = '';

  if (typeof targetInput === 'string') {
    targetNormalized = normalizeIUPACName(targetInput);
    targetAST = parseIUPACName(targetInput);
  } else {
    targetNormalized = targetInput.rawNormalized;
    targetAST = targetInput;
  }

  // [P0-1] Empty / whitespace input guard: return 0% score and message without giving default credit
  if (!normUser) {
    const emptyUserAST = parseIUPACName('');
    return {
      score: 0,
      isPerfect: false,
      partialCreditBreakdown: {
        functionScore: 0,
        chainScore: 0,
        bondScore: 0,
        radicalScore: 0,
      },
      feedbackMessages: ['Por favor, digite o nome IUPAC da molécula.'],
      priorityInversionDetected: false,
      parsedUserAST: emptyUserAST,
      parsedTargetAST: targetAST,
      acceptedSynonymMatched: false,
    };
  }

  // Check exact normalized match
  if (normUser === targetNormalized) {
    const parsedUserAST = parseIUPACName(userInput);
    return {
      score: 1.0,
      isPerfect: true,
      partialCreditBreakdown: {
        functionScore: 1.0,
        chainScore: 1.0,
        bondScore: 1.0,
        radicalScore: 1.0,
      },
      feedbackMessages: ['Perfeito! Nomenclatura IUPAC perfeitamente correta!'],
      priorityInversionDetected: false,
      parsedUserAST,
      parsedTargetAST: targetAST,
      acceptedSynonymMatched: false,
    };
  }

  // Check synonym dictionary & user acceptedSynonyms list
  const rawSynonym = COMMON_SYNONYMS[normUser];
  const synonymTarget = rawSynonym ? normalizeIUPACName(rawSynonym) : undefined;
  const isSynonym =
    synonymTarget === targetNormalized ||
    acceptedSynonyms.map((s) => normalizeIUPACName(s)).includes(normUser);

  if (isSynonym) {
    const parsedUserAST = parseIUPACName(userInput);
    return {
      score: 1.0,
      isPerfect: true,
      partialCreditBreakdown: {
        functionScore: 1.0,
        chainScore: 1.0,
        bondScore: 1.0,
        radicalScore: 1.0,
      },
      feedbackMessages: ['Excelente! Nome usual ou sinônimo aceito com sucesso.'],
      priorityInversionDetected: false,
      parsedUserAST,
      parsedTargetAST: targetAST,
      acceptedSynonymMatched: true,
    };
  }

  // Parse user AST
  const userAST = parseIUPACName(userInput);

  // Check for priority inversion
  const { isInverted, details: inversionDetails } = checkPriorityInversion(
    userAST,
    targetAST
  );

  // Calculate component scores
  const functionScore = evaluateFunction(userAST, targetAST, isInverted);
  const chainScore = evaluateChain(userAST, targetAST);
  const bondScore = evaluateBonds(userAST, targetAST);
  const radicalScore = evaluateRadicals(userAST, targetAST, isInverted);

  const breakdown: PartialCreditBreakdown = {
    functionScore: Number(functionScore.toFixed(2)),
    chainScore: Number(chainScore.toFixed(2)),
    bondScore: Number(bondScore.toFixed(2)),
    radicalScore: Number(radicalScore.toFixed(2)),
  };

  // Weighted formula: 35% function, 25% chain, 20% bonds, 20% radicals
  const rawScore =
    0.35 * breakdown.functionScore +
    0.25 * breakdown.chainScore +
    0.20 * breakdown.bondScore +
    0.20 * breakdown.radicalScore;

  const score = Number(Math.max(0, Math.min(1, rawScore)).toFixed(2));
  const isPerfect = score >= 0.98;

  const feedbackMessages = generateFeedback(
    userAST,
    targetAST,
    breakdown,
    isInverted,
    inversionDetails,
    false
  );

  return {
    score,
    isPerfect,
    partialCreditBreakdown: breakdown,
    feedbackMessages,
    priorityInversionDetected: isInverted,
    detectedInversionDetails: isInverted ? inversionDetails : undefined,
    parsedUserAST: userAST,
    parsedTargetAST: targetAST,
    acceptedSynonymMatched: false,
  };
}
