import { describe, expect, it } from 'vitest';
import { normalizeIUPACName, convert1993To2013 } from '../src/normalizer.js';
import { parseIUPACName } from '../src/parser.js';

describe('Normalizer', () => {
  it('strips accents and normalizes casing and hyphens', () => {
    expect(normalizeIUPACName('Ácido Butanóico')).toBe('acido butanoico');
    expect(normalizeIUPACName('  CICLOHEXANO  ')).toBe('ciclohexano');
    expect(normalizeIUPACName('ciclo-hexano')).toBe('ciclohexano');
    expect(normalizeIUPACName('2 - metilpropano')).toBe('2-metilpropano');
  });

  it('handles Novo Acordo Ortográfico hyphenation before h and agglutination', () => {
    expect(normalizeIUPACName('ciclo-hexano')).toBe('ciclohexano');
    expect(normalizeIUPACName('cicloexano')).toBe('ciclohexano');
    expect(normalizeIUPACName('ciclobutano')).toBe('ciclobutano');
    expect(normalizeIUPACName('2-metil-hexano')).toBe('2-metilhexano');
    expect(normalizeIUPACName('3-etil-heptano')).toBe('3-etilheptano');
    expect(normalizeIUPACName('metilexano')).toBe('metilhexano');
  });

  it('converts IUPAC 1993 locants to 2013 locants', () => {
    expect(convert1993To2013('2-buteno')).toBe('but-2-eno');
    expect(convert1993To2013('1,3-butadieno')).toBe('buta-1,3-dieno');
    expect(convert1993To2013('2-butanol')).toBe('butan-2-ol');
    expect(convert1993To2013('2-butanona')).toBe('butan-2-ona');
    expect(convert1993To2013('1,2-etanodiol')).toBe('etano-1,2-diol');
    expect(convert1993To2013('3-metil-1-butanol')).toBe('3-metilbutan-1-ol');
    expect(convert1993To2013('4-cloro-2-penteno')).toBe('4-cloropent-2-eno');
  });
});

describe('Parser - 16 Canonical Organic Functions', () => {
  // 1. Hydrocarbons
  describe('1. Hidrocarbonetos', () => {
    it('parses linear alkanes, alkenes, alkynes', () => {
      const metano = parseIUPACName('metano');
      expect(metano.primaryFunction).toBe('hidrocarboneto');
      expect(metano.carbonCount).toBe(1);
      expect(metano.bonds[0].type).toBe('an');

      const buteno2013 = parseIUPACName('but-2-eno');
      expect(buteno2013.primaryFunction).toBe('hidrocarboneto');
      expect(buteno2013.carbonCount).toBe(4);
      expect(buteno2013.bonds[0].type).toBe('en');
      expect(buteno2013.bonds[0].locants).toEqual([2]);

      const buteno1993 = parseIUPACName('2-buteno');
      expect(buteno1993.carbonCount).toBe(4);
      expect(buteno1993.bonds[0].type).toBe('en');
      expect(buteno1993.bonds[0].locants).toEqual([2]);

      const pentino = parseIUPACName('pent-2-ino');
      expect(pentino.carbonCount).toBe(5);
      expect(pentino.bonds[0].type).toBe('in');
      expect(pentino.bonds[0].locants).toEqual([2]);
    });

    it('parses dienes and polyenes', () => {
      const dieno = parseIUPACName('buta-1,3-dieno');
      expect(dieno.carbonCount).toBe(4);
      expect(dieno.bonds[0].type).toBe('dien');
      expect(dieno.bonds[0].locants).toEqual([1, 3]);

      const dieno1993 = parseIUPACName('1,3-butadieno');
      expect(dieno1993.carbonCount).toBe(4);
      expect(dieno1993.bonds[0].type).toBe('dien');
      expect(dieno1993.bonds[0].locants).toEqual([1, 3]);
    });

    it('parses cycloalkanes and aromatics', () => {
      const ciclohexano = parseIUPACName('ciclo-hexano');
      expect(ciclohexano.isRing).toBe(true);
      expect(ciclohexano.ringType).toBe('ciclo');
      expect(ciclohexano.carbonCount).toBe(6);

      const benzeno = parseIUPACName('benzeno');
      expect(benzeno.isRing).toBe(true);
      expect(benzeno.ringType).toBe('benzeno');
      expect(benzeno.carbonCount).toBe(6);

      const naftaleno = parseIUPACName('naftaleno');
      expect(naftaleno.isRing).toBe(true);
      expect(naftaleno.ringType).toBe('naftaleno');
      expect(naftaleno.carbonCount).toBe(10);
    });

    it('parses branched alkanes with substituents', () => {
      const dimetil = parseIUPACName('2,2-dimetilbutano');
      expect(dimetil.mainChainPrefix).toBe('but');
      expect(dimetil.carbonCount).toBe(4);
      expect(dimetil.substituents).toHaveLength(1);
      expect(dimetil.substituents[0].name).toBe('metil');
      expect(dimetil.substituents[0].multiplier).toBe(2);
      expect(dimetil.substituents[0].locants).toEqual([2, 2]);
    });
  });

  // 2. Alcohols
  describe('2. Álcoois', () => {
    it('parses simple alcohols and polyols', () => {
      const etanol = parseIUPACName('etanol');
      expect(etanol.primaryFunction).toBe('alcool');
      expect(etanol.carbonCount).toBe(2);
      expect(etanol.functionSuffix).toBe('ol');

      const propanol2013 = parseIUPACName('propan-2-ol');
      expect(propanol2013.primaryFunction).toBe('alcool');
      expect(propanol2013.carbonCount).toBe(3);

      const propanol1993 = parseIUPACName('2-propanol');
      expect(propanol1993.primaryFunction).toBe('alcool');
      expect(propanol1993.carbonCount).toBe(3);

      const diol = parseIUPACName('etano-1,2-diol');
      expect(diol.primaryFunction).toBe('alcool');
      expect(diol.carbonCount).toBe(2);
    });
  });

  // 3. Phenols
  describe('3. Fenóis', () => {
    it('parses phenol and substituted phenols', () => {
      const fenol = parseIUPACName('fenol');
      expect(fenol.primaryFunction).toBe('fenol');
      expect(fenol.isRing).toBe(true);
      expect(fenol.ringType).toBe('benzeno');

      const hidroxibenzeno = parseIUPACName('hidroxibenzeno');
      expect(hidroxibenzeno.primaryFunction).toBe('fenol');
      expect(hidroxibenzeno.isRing).toBe(true);

      const cresol = parseIUPACName('2-metilfenol');
      expect(cresol.primaryFunction).toBe('fenol');
      expect(cresol.substituents).toHaveLength(1);
      expect(cresol.substituents[0].name).toBe('metil');
      expect(cresol.substituents[0].locants).toEqual([2]);
    });
  });

  // 4. Enols
  describe('4. Enóis', () => {
    it('parses enols with double bond and hydroxyl', () => {
      const etenol = parseIUPACName('etenol');
      expect(etenol.primaryFunction).toBe('enol');
      expect(etenol.bonds[0].type).toBe('en');

      const propenol = parseIUPACName('prop-1-en-1-ol');
      expect(propenol.primaryFunction).toBe('enol');
      expect(propenol.carbonCount).toBe(3);
      expect(propenol.bonds[0].type).toBe('en');
    });
  });

  // 5. Ethers
  describe('5. Éteres', () => {
    it('parses alkoxyalkanes and eter format', () => {
      const metoxietano = parseIUPACName('metoxietano');
      expect(metoxietano.primaryFunction).toBe('eter');
      expect(metoxietano.carbonCount).toBe(2);
      expect(metoxietano.substituents[0].name).toBe('metoxi');
      expect(metoxietano.substituents[0].subordinateFunction).toBe('eter');

      const eterDietilico = parseIUPACName('eter dietilico');
      expect(eterDietilico.primaryFunction).toBe('eter');
      expect(eterDietilico.carbonCount).toBe(4);
    });
  });

  // 6. Aldehydes
  describe('6. Aldeídos', () => {
    it('parses simple and aromatic aldehydes', () => {
      const metanal = parseIUPACName('metanal');
      expect(metanal.primaryFunction).toBe('aldeido');
      expect(metanal.carbonCount).toBe(1);
      expect(metanal.functionSuffix).toBe('al');

      const etanal = parseIUPACName('etanal');
      expect(etanal.primaryFunction).toBe('aldeido');
      expect(etanal.carbonCount).toBe(2);

      const propanal = parseIUPACName('propanal');
      expect(propanal.primaryFunction).toBe('aldeido');
      expect(propanal.carbonCount).toBe(3);
    });
  });

  // 7. Ketones
  describe('7. Cetonas', () => {
    it('parses ketones with 2013 and 1993 locants', () => {
      const butanona = parseIUPACName('butan-2-ona');
      expect(butanona.primaryFunction).toBe('cetona');
      expect(butanona.carbonCount).toBe(4);
      expect(butanona.functionSuffix).toBe('ona');

      const butanona1993 = parseIUPACName('2-butanona');
      expect(butanona1993.primaryFunction).toBe('cetona');
      expect(butanona1993.carbonCount).toBe(4);

      const propanona = parseIUPACName('propanona');
      expect(propanona.primaryFunction).toBe('cetona');
      expect(propanona.carbonCount).toBe(3);
    });
  });

  // 8. Carboxylic Acids
  describe('8. Ácidos Carboxílicos', () => {
    it('parses carboxylic acids with special prefix', () => {
      const etanoico = parseIUPACName('ácido etanoico');
      expect(etanoico.primaryFunction).toBe('acido_carboxilico');
      expect(etanoico.isSpecialPrefix).toBe('acido');
      expect(etanoico.carbonCount).toBe(2);
      expect(etanoico.functionSuffix).toBe('oico');

      const latico = parseIUPACName('acido 2-hidroxipropanoico');
      expect(latico.primaryFunction).toBe('acido_carboxilico');
      expect(latico.carbonCount).toBe(3);
      expect(latico.substituents).toHaveLength(1);
      expect(latico.substituents[0].name).toBe('hidroxi');
      expect(latico.substituents[0].locants).toEqual([2]);
      expect(latico.substituents[0].subordinateFunction).toBe('alcool');
    });
  });

  // 9. Esters
  describe('9. Ésteres', () => {
    it('parses esters with alkyl part', () => {
      const ester = parseIUPACName('etanoato de etila');
      expect(ester.primaryFunction).toBe('ester');
      expect(ester.carbonCount).toBe(2);
      expect(ester.functionSuffix).toBe('oato');
      expect(ester.esterAlkylPart).toBe('etila');

      const metilEster = parseIUPACName('metanoato de metila');
      expect(metilEster.primaryFunction).toBe('ester');
      expect(metilEster.carbonCount).toBe(1);
      expect(metilEster.esterAlkylPart).toBe('metila');
    });
  });

  // 10. Amines
  describe('10. Aminas', () => {
    it('parses primary, secondary, tertiary amines and N-substituents', () => {
      const metanamina = parseIUPACName('metanamina');
      expect(metanamina.primaryFunction).toBe('amina');
      expect(metanamina.carbonCount).toBe(1);
      expect(metanamina.functionSuffix).toBe('amina');

      const dimetil = parseIUPACName('N,N-dimetilmetanamina');
      expect(dimetil.primaryFunction).toBe('amina');
      expect(dimetil.carbonCount).toBe(1);
      expect(dimetil.substituents).toHaveLength(1);
      expect(dimetil.substituents[0].locants).toEqual(['N', 'N']);
      expect(dimetil.nitrogenSubstituents).toEqual(['metil']);

      const aminaSynonym = parseIUPACName('dimetilamina');
      expect(aminaSynonym.primaryFunction).toBe('amina');
    });
  });

  // 11. Amides
  describe('11. Amidas', () => {
    it('parses amides', () => {
      const etanamida = parseIUPACName('etanamida');
      expect(etanamida.primaryFunction).toBe('amida');
      expect(etanamida.carbonCount).toBe(2);
      expect(etanamida.functionSuffix).toBe('amida');

      const metanamida = parseIUPACName('metanamida');
      expect(metanamida.primaryFunction).toBe('amida');
      expect(metanamida.carbonCount).toBe(1);
    });
  });

  // 12. Nitriles
  describe('12. Nitrilas', () => {
    it('parses nitriles', () => {
      const etanonitrila = parseIUPACName('etanonitrila');
      expect(etanonitrila.primaryFunction).toBe('nitrila');
      expect(etanonitrila.carbonCount).toBe(2);
      expect(etanonitrila.functionSuffix).toBe('nitrila');

      const propanonitrila = parseIUPACName('propanonitrila');
      expect(propanonitrila.primaryFunction).toBe('nitrila');
      expect(propanonitrila.carbonCount).toBe(3);
    });
  });

  // 13. Nitro Compounds
  describe('13. Nitrocompostos', () => {
    it('parses nitro compounds', () => {
      const nitrometano = parseIUPACName('nitrometano');
      expect(nitrometano.primaryFunction).toBe('nitrocomposto');
      expect(nitrometano.carbonCount).toBe(1);
      expect(nitrometano.substituents[0].name).toBe('nitro');

      const nitropropano = parseIUPACName('2-nitropropano');
      expect(nitropropano.primaryFunction).toBe('nitrocomposto');
      expect(nitropropano.carbonCount).toBe(3);
      expect(nitropropano.substituents[0].locants).toEqual([2]);
    });
  });

  // 14. Alkyl Halides
  describe('14. Haletos de Alquila', () => {
    it('parses halogenated hydrocarbons', () => {
      const clorometano = parseIUPACName('clorometano');
      expect(clorometano.primaryFunction).toBe('haleto_alquila');
      expect(clorometano.carbonCount).toBe(1);
      expect(clorometano.substituents[0].name).toBe('cloro');

      const dicloro = parseIUPACName('1,2-dicloroetano');
      expect(dicloro.primaryFunction).toBe('haleto_alquila');
      expect(dicloro.carbonCount).toBe(2);
      expect(dicloro.substituents[0].multiplier).toBe(2);
      expect(dicloro.substituents[0].locants).toEqual([1, 2]);
    });
  });

  // 15. Acyl Halides
  describe('15. Haletos de Acila', () => {
    it('parses acyl halides with halogen prefix and oila suffix', () => {
      const cloreto = parseIUPACName('cloreto de etanoila');
      expect(cloreto.primaryFunction).toBe('haleto_acila');
      expect(cloreto.acylHalideHalogen).toBe('cloreto');
      expect(cloreto.carbonCount).toBe(2);
      expect(cloreto.functionSuffix).toBe('oila');

      const brometo = parseIUPACName('brometo de propanoila');
      expect(brometo.primaryFunction).toBe('haleto_acila');
      expect(brometo.acylHalideHalogen).toBe('brometo');
      expect(brometo.carbonCount).toBe(3);
    });
  });

  // 16. Acid Anhydrides
  describe('16. Anidridos de Ácido', () => {
    it('parses acid anhydrides', () => {
      const anidrido = parseIUPACName('anidrido etanoico');
      expect(anidrido.primaryFunction).toBe('anidrido');
      expect(anidrido.isSpecialPrefix).toBe('anidrido');
      expect(anidrido.carbonCount).toBe(2);
      expect(anidrido.functionSuffix).toBe('oico');
    });
  });

  // Complex Radicals
  describe('Complex Nested Radicals', () => {
    it('parses parenthesized nested radicals', () => {
      const complex = parseIUPACName('2-(clorometil)but-1-eno');
      expect(complex.substituents).toHaveLength(1);
      const sub = complex.substituents[0];
      expect(sub.type).toBe('complex_radical');
      expect(sub.locants).toEqual([2]);
      expect(sub.name).toBe('(clorometil)');
      expect(sub.nestedRadical?.alkylBase).toBe('metil');
      expect(sub.nestedRadical?.subFunction).toBe('haleto_alquila');

      const aminoNested = parseIUPACName('3-(2-aminoetil)hexano');
      expect(aminoNested.substituents).toHaveLength(1);
      const aminoSub = aminoNested.substituents[0];
      expect(aminoSub.type).toBe('complex_radical');
      expect(aminoSub.locants).toEqual([3]);
      expect(aminoSub.nestedRadical?.subLocants).toEqual([2]);
      expect(aminoSub.nestedRadical?.subFunction).toBe('amina');
      expect(aminoSub.nestedRadical?.alkylBase).toBe('etil');

      const hidroxiNested = parseIUPACName('2-(hidroximetil)butano');
      expect(hidroxiNested.substituents).toHaveLength(1);
      const hSub = hidroxiNested.substituents[0];
      expect(hSub.type).toBe('complex_radical');
      expect(hSub.locants).toEqual([2]);
      expect(hSub.nestedRadical?.subFunction).toBe('alcool');
      expect(hSub.nestedRadical?.alkylBase).toBe('metil');

      const nitroArom = parseIUPACName('4-(4-nitrofenil)butano');
      expect(nitroArom.substituents).toHaveLength(1);
      const nSub = nitroArom.substituents[0];
      expect(nSub.type).toBe('complex_radical');
      expect(nSub.locants).toEqual([4]);
      expect(nSub.nestedRadical?.subLocants).toEqual([4]);
      expect(nSub.nestedRadical?.subFunction).toBe('nitrocomposto');
      expect(nSub.nestedRadical?.alkylBase).toBe('fenil');
    });
  });

  describe('Edge Cases and Complex Nomenclature', () => {
    it('parses cycloalkenes correctly', () => {
      const ciclohexeno = parseIUPACName('ciclohexeno');
      expect(ciclohexeno.isRing).toBe(true);
      expect(ciclohexeno.ringType).toBe('ciclo');
      expect(ciclohexeno.bonds[0].type).toBe('en');
      expect(ciclohexeno.carbonCount).toBe(6);
      expect(ciclohexeno.primaryFunction).toBe('hidrocarboneto');
    });

    it('parses conjugated trienes', () => {
      const trieno = parseIUPACName('hepta-1,3,5-trieno');
      expect(trieno.carbonCount).toBe(7);
      expect(trieno.bonds[0].type).toBe('trien');
      expect(trieno.bonds[0].locants).toEqual([1, 3, 5]);
    });

    it('parses dicarboxylic acids', () => {
      const dioico = parseIUPACName('ácido butanodioico');
      expect(dioico.primaryFunction).toBe('acido_carboxilico');
      expect(dioico.carbonCount).toBe(4);
      expect(dioico.functionSuffix).toBe('oico');
    });

    it('parses dialdehydes', () => {
      const dial = parseIUPACName('butanodial');
      expect(dial.primaryFunction).toBe('aldeido');
      expect(dial.carbonCount).toBe(4);
      expect(dial.functionSuffix).toBe('dial');
    });

    it('parses N-substituted amides', () => {
      const amida = parseIUPACName('N-metiletanamida');
      expect(amida.primaryFunction).toBe('amida');
      expect(amida.carbonCount).toBe(2);
      expect(amida.substituents).toHaveLength(1);
      expect(amida.substituents[0].locants).toEqual(['N']);
      expect(amida.nitrogenSubstituents).toEqual(['metil']);
    });

    it('[P0-1] returns empty AST for empty / whitespace input', () => {
      const emptyAST = parseIUPACName('   ');
      expect(emptyAST.carbonCount).toBe(0);
      expect(emptyAST.primaryFunction).toBeUndefined();
      expect(emptyAST.bonds).toEqual([]);
      expect(emptyAST.substituents).toEqual([]);
    });

    it('[P1-1] correctly distinguishes enol from unsaturated alcohol', () => {
      // but-3-en-1-ol: -OH is at C1 (sp3), double bond at C3 (sp2) -> unsaturated alcohol
      const alc = parseIUPACName('but-3-en-1-ol');
      expect(alc.primaryFunction).toBe('alcool');

      // but-1-en-1-ol: -OH is at C1 (sp2) -> enol
      const enol1 = parseIUPACName('but-1-en-1-ol');
      expect(enol1.primaryFunction).toBe('enol');

      // etenol: always enol
      const etenol = parseIUPACName('etenol');
      expect(etenol.primaryFunction).toBe('enol');
    });

    it('[P1-2] recognizes benz stem for benzoic derivatives with 7 carbons', () => {
      const benzoico = parseIUPACName('ácido benzoico');
      expect(benzoico.isRing).toBe(true);
      expect(benzoico.ringType).toBe('benzeno');
      expect(benzoico.carbonCount).toBe(7);
      expect(benzoico.primaryFunction).toBe('acido_carboxilico');
    });

    it('[P2-2] classifies naphthols as fenol', () => {
      const naftol1 = parseIUPACName('naftalen-1-ol');
      expect(naftol1.primaryFunction).toBe('fenol');
      expect(naftol1.ringType).toBe('naftaleno');

      const naftolTrivial = parseIUPACName('naftol');
      expect(naftolTrivial.primaryFunction).toBe('fenol');
    });

    it('[P3-1] classifies aminobenzeno as amina', () => {
      const amina = parseIUPACName('aminobenzeno');
      expect(amina.primaryFunction).toBe('amina');
    });

    it('[P2-1] supports aromatic locants o-, m-, p- and digit-letter hyphenation', () => {
      const oCloro = parseIUPACName('o-clorofenol');
      expect(oCloro.substituents[0].locants).toEqual(['O']);
      expect(oCloro.substituents[0].name).toBe('cloro');

      const normalized = parseIUPACName('2metilbutano');
      expect(normalized.substituents[0].name).toBe('metil');
      expect(normalized.substituents[0].locants).toEqual([2]);
    });

    it('[P2-3] supports complex multipliers bis, tris, tetrakis', () => {
      const bis = parseIUPACName('1,2-bis(clorometil)benzeno');
      expect(bis.substituents).toHaveLength(1);
      expect(bis.substituents[0].multiplier).toBe(2);
      expect(bis.substituents[0].locants).toEqual([1, 2]);
    });

    it('[P1-3] converts 1993 names with special prefix to 2013 format', () => {
      const ast = parseIUPACName('ácido 2-butenoico');
      expect(ast.primaryFunction).toBe('acido_carboxilico');
      expect(ast.bonds[0].type).toBe('en');
      expect(ast.bonds[0].locants).toEqual([2]);
    });
  });
});

