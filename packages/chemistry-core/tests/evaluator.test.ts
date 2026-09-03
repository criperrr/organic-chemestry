import { describe, expect, it } from 'vitest';
import { evaluateIUPACName } from '../src/evaluator.js';

describe('Evaluator - Scoring and Partial Credit', () => {
  it('awards perfect 1.0 score for exact canonical names with accent/casing tolerance', () => {
    const res1 = evaluateIUPACName('Ácido Butanóico', 'acido butanoico');
    expect(res1.score).toBe(1.0);
    expect(res1.isPerfect).toBe(true);
    expect(res1.partialCreditBreakdown.functionScore).toBe(1.0);
    expect(res1.partialCreditBreakdown.chainScore).toBe(1.0);
    expect(res1.partialCreditBreakdown.bondScore).toBe(1.0);
    expect(res1.partialCreditBreakdown.radicalScore).toBe(1.0);

    const res2 = evaluateIUPACName('ciclo-hexano', 'ciclohexano');
    expect(res2.score).toBe(1.0);
    expect(res2.isPerfect).toBe(true);
  });

  it('recognizes 1993 vs 2013 locants as 100% equivalent', () => {
    const res1 = evaluateIUPACName('2-buteno', 'but-2-eno');
    expect(res1.score).toBe(1.0);
    expect(res1.isPerfect).toBe(true);

    const res2 = evaluateIUPACName('butan-2-ol', '2-butanol');
    expect(res2.score).toBe(1.0);
    expect(res2.isPerfect).toBe(true);

    const res3 = evaluateIUPACName('1,3-butadieno', 'buta-1,3-dieno');
    expect(res3.score).toBe(1.0);
    expect(res3.isPerfect).toBe(true);
  });

  it('accepts registered common synonyms and trivial names', () => {
    const acetona = evaluateIUPACName('acetona', 'propanona');
    expect(acetona.score).toBe(1.0);
    expect(acetona.isPerfect).toBe(true);
    expect(acetona.acceptedSynonymMatched).toBe(true);

    const formol = evaluateIUPACName('formol', 'metanal');
    expect(formol.score).toBe(1.0);
    expect(formol.acceptedSynonymMatched).toBe(true);

    const alcoolEtilico = evaluateIUPACName('alcool etilico', 'etanol');
    expect(alcoolEtilico.score).toBe(1.0);
    expect(alcoolEtilico.acceptedSynonymMatched).toBe(true);

    const acidoAcetico = evaluateIUPACName('ácido acético', 'acido etanoico');
    expect(acidoAcetico.score).toBe(1.0);
    expect(acidoAcetico.acceptedSynonymMatched).toBe(true);

    const tolueno = evaluateIUPACName('tolueno', 'metilbenzeno');
    expect(tolueno.score).toBe(1.0);
    expect(tolueno.acceptedSynonymMatched).toBe(true);

    const anilina = evaluateIUPACName('anilina', 'benzenamina');
    expect(anilina.score).toBe(1.0);
    expect(anilina.acceptedSynonymMatched).toBe(true);

    const cafeina = evaluateIUPACName('cafeína', '1,3,7-trimetilpurina-2,6-diona');
    expect(cafeina.score).toBe(1.0);
    expect(cafeina.acceptedSynonymMatched).toBe(true);

    const nicotina = evaluateIUPACName('nicotina', '3-(1-metilpirrolidin-2-il)piridina');
    expect(nicotina.score).toBe(1.0);
    expect(nicotina.acceptedSynonymMatched).toBe(true);

    const paracetamol = evaluateIUPACName('paracetamol', '4-acetamidofenol');
    expect(paracetamol.score).toBe(1.0);
    expect(paracetamol.acceptedSynonymMatched).toBe(true);

    const aspirina = evaluateIUPACName('aspirina', 'ácido 2-acetoxibenzoico');
    expect(aspirina.score).toBe(1.0);
    expect(aspirina.acceptedSynonymMatched).toBe(true);
  });

  it('provides rich pedagogical mnemonics when functions are confused', () => {
    // Aldeído vs Cetona
    const resAld = evaluateIUPACName('butanona', 'butanal');
    expect(resAld.feedbackMessages.some((m) => m.includes('Macete ENEM (Aldeído vs Cetona)'))).toBe(true);

    // Amida vs Amina
    const resAmd = evaluateIUPACName('etanamina', 'etanamida');
    expect(resAmd.feedbackMessages.some((m) => m.includes('Macete ENEM (Amida vs Amina)'))).toBe(true);

    // Éster vs Éter
    const resEst = evaluateIUPACName('etoxietano', 'etanoato de etila');
    expect(resEst.feedbackMessages.some((m) => m.includes('Macete ENEM (Éster vs Éter)'))).toBe(true);

    // Fenol vs Álcool
    const resFen = evaluateIUPACName('etanol', 'fenol');
    expect(resFen.feedbackMessages.some((m) => m.includes('Macete ENEM (Fenol vs Álcool)'))).toBe(true);
  });

  it('calculates granular partial credit for wrong carbon chain', () => {
    // Target: butano (4 carbons), User: pentano (5 carbons, diff 1)
    const res = evaluateIUPACName('pentano', 'butano');
    expect(res.isPerfect).toBe(false);
    expect(res.partialCreditBreakdown.functionScore).toBe(1.0);
    expect(res.partialCreditBreakdown.chainScore).toBe(0.5); // 1-carbon difference
    expect(res.partialCreditBreakdown.bondScore).toBe(1.0);
    expect(res.partialCreditBreakdown.radicalScore).toBe(1.0);
    // 0.35*1 + 0.25*0.5 + 0.20*1 + 0.20*1 = 0.35 + 0.125 + 0.20 + 0.20 = 0.875 -> 0.88
    expect(res.score).toBeCloseTo(0.88, 1);
    expect(res.feedbackMessages.some((msg) => msg.includes('4 carbonos'))).toBe(true);
  });

  it('detects missing ring prefix and penalizes chain score', () => {
    // Target: ciclohexano, User: hexano
    const res = evaluateIUPACName('hexano', 'ciclohexano');
    expect(res.isPerfect).toBe(false);
    expect(res.partialCreditBreakdown.chainScore).toBeLessThan(1.0);
    expect(
      res.feedbackMessages.some((msg) => msg.toLowerCase().includes('ciclo'))
    ).toBe(true);
  });

  it('calculates partial credit for bond locant mismatch', () => {
    // Target: but-2-eno, User: but-1-eno (identified double bond, wrong locant)
    const res = evaluateIUPACName('but-1-eno', 'but-2-eno');
    expect(res.isPerfect).toBe(false);
    expect(res.partialCreditBreakdown.functionScore).toBe(1.0);
    expect(res.partialCreditBreakdown.chainScore).toBe(1.0);
    expect(res.partialCreditBreakdown.bondScore).toBe(0.6); // Locant mismatch
    expect(res.score).toBeGreaterThan(0.8);
    expect(
      res.feedbackMessages.some((msg) => msg.toLowerCase().includes('numeração'))
    ).toBe(true);
  });

  it('calculates partial credit for wrong saturation type', () => {
    // Target: but-2-eno (unsaturated), User: butano (saturated)
    const res = evaluateIUPACName('butano', 'but-2-eno');
    expect(res.partialCreditBreakdown.bondScore).toBe(0.0);
    expect(
      res.feedbackMessages.some((msg) => msg.toLowerCase().includes('dupla'))
    ).toBe(true);
  });

  it('calculates partial credit for substituent locant mismatch', () => {
    // Target: 3-metilpentano, User: 2-metilpentano
    const res = evaluateIUPACName('2-metilpentano', '3-metilpentano');
    expect(res.partialCreditBreakdown.functionScore).toBe(1.0);
    expect(res.partialCreditBreakdown.chainScore).toBe(1.0);
    expect(res.partialCreditBreakdown.bondScore).toBe(1.0);
    expect(res.partialCreditBreakdown.radicalScore).toBe(0.7); // correct radical, wrong locant
    expect(res.score).toBeGreaterThan(0.9);
    expect(
      res.feedbackMessages.some((msg) => msg.toLowerCase().includes('localizadores'))
    ).toBe(true);
  });

  describe('IUPAC Priority Inversion Detection', () => {
    it('detects priority inversion when carboxylic acid is subordinated to alcohol', () => {
      // Canonical PRD scenario:
      // Target: ácido 3-hidroxibutanoico (Carboxylic acid with alcohol radical)
      // User: 3-carboxibutan-1-ol (Alcohol with carboxylic acid radical)
      const res = evaluateIUPACName(
        '3-carboxibutan-1-ol',
        'ácido 3-hidroxibutanoico'
      );

      expect(res.priorityInversionDetected).toBe(true);
      expect(res.detectedInversionDetails).toBeDefined();
      expect(res.detectedInversionDetails).toContain('prioridade SUPERIOR');
      expect(res.detectedInversionDetails).toContain('Coroa de Prioridade IUPAC');
      expect(
        res.feedbackMessages.some((m) =>
          m.includes('[⚠️ Inversão de Prioridade IUPAC]') &&
          m.includes('Ácido Carboxílico > Anidrido > Éster')
        )
      ).toBe(true);

      // Verify partial credit: chain is 4 carbons (1.0), bonds are saturated (1.0),
      // partial credit for function (0.4) and radicals (0.5)
      // Score around 0.69 (approx 65-70%)
      expect(res.score).toBeGreaterThanOrEqual(0.65);
      expect(res.score).toBeLessThanOrEqual(0.75);
    });

    it('detects priority inversion when carboxylic acid is subordinated to amine', () => {
      // Target: ácido 2-aminopropanoico
      // User: 2-carboxietanamina
      const res = evaluateIUPACName(
        '2-carboxietanamina',
        'ácido 2-aminopropanoico'
      );
      expect(res.priorityInversionDetected).toBe(true);
      expect(res.score).toBeGreaterThan(0.5);
    });

    it('detects priority inversion between ketone and carboxylic acid', () => {
      // Target: ácido 4-oxopentanoico
      // User: 4-carboxipentan-2-ona
      const res = evaluateIUPACName(
        '4-carboxipentan-2-ona',
        'ácido 4-oxopentanoico'
      );
      expect(res.priorityInversionDetected).toBe(true);
      expect(res.detectedInversionDetails).toContain('prioridade SUPERIOR');
      expect(res.score).toBeGreaterThan(0.5);
    });

    it('[P1-4] does not trigger priority inversion when user did not identify higher priority group', () => {
      // Target: ácido 3-hidroxibutanoico (contains acid and alcohol)
      // User: butan-1-ol (user only named an alcohol, never identified carboxi/acid)
      const res = evaluateIUPACName('butan-1-ol', 'ácido 3-hidroxibutanoico');
      expect(res.priorityInversionDetected).toBe(false);
      expect(res.detectedInversionDetails).toBeUndefined();
    });

    it('[P0-1] returns 0% score and guidance message for empty or whitespace input', () => {
      const res1 = evaluateIUPACName('', 'etanol');
      expect(res1.score).toBe(0);
      expect(res1.isPerfect).toBe(false);
      expect(res1.feedbackMessages).toContain('Por favor, digite o nome IUPAC da molécula.');
      expect(res1.partialCreditBreakdown).toEqual({
        functionScore: 0,
        chainScore: 0,
        bondScore: 0,
        radicalScore: 0,
      });

      const res2 = evaluateIUPACName('   \t  \n ', 'metano');
      expect(res2.score).toBe(0);
      expect(res2.feedbackMessages).toContain('Por favor, digite o nome IUPAC da molécula.');
    });
  });

  describe('Evaluation across all 16 canonical functions', () => {
    const canonicalPairs = [
      ['metano', 'metano'],
      ['etanol', 'etanol'],
      ['fenol', 'fenol'],
      ['etenol', 'etenol'],
      ['metoxietano', 'metoxietano'],
      ['metanal', 'metanal'],
      ['propanona', 'propanona'],
      ['ácido etanoico', 'ácido etanoico'],
      ['etanoato de etila', 'etanoato de etila'],
      ['metanamina', 'metanamina'],
      ['etanamida', 'etanamida'],
      ['etanonitrila', 'etanonitrila'],
      ['nitrometano', 'nitrometano'],
      ['clorometano', 'clorometano'],
      ['cloreto de etanoila', 'cloreto de etanoila'],
      ['anidrido etanoico', 'anidrido etanoico'],
    ];

    it.each(canonicalPairs)('accurately evaluates function %s', (user, target) => {
      const res = evaluateIUPACName(user, target);
      expect(res.isPerfect).toBe(true);
      expect(res.score).toBe(1.0);
    });
  });

  describe('Novo Acordo Ortográfico Hyphenation Compliance', () => {
    it('accepts ciclo-hexano (with hyphen) and ciclohexano (without hyphen) with 100% precision', () => {
      const res1 = evaluateIUPACName('ciclo-hexano', 'ciclohexano');
      expect(res1.isPerfect).toBe(true);
      expect(res1.score).toBe(1.0);

      const res2 = evaluateIUPACName('cicloexano', 'ciclo-hexano');
      expect(res2.isPerfect).toBe(true);
      expect(res2.score).toBe(1.0);
    });

    it('handles hyphen before h in branched alkanes (2-metil-hexano, 3-etil-heptano)', () => {
      const res1 = evaluateIUPACName('2-metil-hexano', '2-metilhexano');
      expect(res1.isPerfect).toBe(true);
      expect(res1.score).toBe(1.0);

      const res2 = evaluateIUPACName('3-etil-heptano', '3-etilheptano');
      expect(res2.isPerfect).toBe(true);
      expect(res2.score).toBe(1.0);
    });

    it('correctly validates agglutinated cyclic and branched alkanes (ciclobutano, metilbutano)', () => {
      const res1 = evaluateIUPACName('ciclobutano', 'ciclobutano');
      expect(res1.isPerfect).toBe(true);
      expect(res1.score).toBe(1.0);

      const res2 = evaluateIUPACName('ciclo-butano', 'ciclobutano');
      expect(res2.isPerfect).toBe(true);
      expect(res2.score).toBe(1.0);
    });

    it('tolerates optional stereochemical descriptors (e.g. accepts 3,7-dimetilocta-2,6-dienal for (2E)-3,7-dimetilocta-2,6-dienal)', () => {
      const resDienal = evaluateIUPACName('3,7-dimetilocta-2,6-dienal', '(2E)-3,7-dimetilocta-2,6-dienal');
      expect(resDienal.isPerfect).toBe(true);
      expect(resDienal.score).toBe(1.0);

      const resOctanal = evaluateIUPACName('3,7-dimetiloctanal', '(2E)-3,7-dimetilocta-2,6-dienal');
      expect(resOctanal.isPerfect).toBe(false);
      expect(resOctanal.partialCreditBreakdown.functionScore).toBe(1.0);
      expect(resOctanal.partialCreditBreakdown.chainScore).toBe(1.0);
      expect(resOctanal.partialCreditBreakdown.radicalScore).toBe(1.0);
      expect(resOctanal.partialCreditBreakdown.bondScore).toBe(0);
      expect(resOctanal.feedbackMessages.some((m) => m.includes('-dien-'))).toBe(true);
    });
  });
});
