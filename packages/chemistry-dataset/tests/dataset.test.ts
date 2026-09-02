import { describe, expect, it } from 'vitest';
import {
  MoleculeSchema,
  OrganicFunction,
  parseIUPACName,
} from '@quimicarush/chemistry-core';

import {
  ChaosSynthesizer,
  DatasetProvider,
  ProceduralGenerator,
  getAllMolecules,
  getByDifficulty,
  getByFunction,
  getCanonicalIUPACForSynonym,
  getRandomMolecule,
  getSynonymsDictionary,
  searchMolecules,
  verifyValences,
} from '../src/index.js';

describe('Chemistry Dataset - Canonical Molecules Database', () => {
  const molecules = getAllMolecules();

  it('contains 500+ total curated canonical molecules', () => {
    expect(molecules.length).toBeGreaterThanOrEqual(500);
    expect(molecules.length).toBe(560);
  });

  it('strictly validates every molecule against MoleculeSchema', () => {
    const ids = new Set<string>();

    for (const mol of molecules) {
      // Must have unique ID
      expect(ids.has(mol.id)).toBe(false);
      ids.add(mol.id);

      // Must have non-empty required fields
      expect(mol.id.trim()).not.toBe('');
      expect(mol.smiles.trim()).not.toBe('');
      expect(mol.iupacName.trim()).not.toBe('');
      expect(mol.formula.trim()).not.toBe('');
      expect(mol.realWorldStory.trim()).not.toBe('');
      expect(mol.educationalContext.trim()).not.toBe('');

      // Validate with Zod schema
      const parseResult = MoleculeSchema.safeParse(mol);
      expect(parseResult.success).toBe(true);
    }
  });

  it('covers 100% of all 16 organic functions with at least 20 molecules per function', () => {
    const all16Functions: OrganicFunction[] = [
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

    for (const fn of all16Functions) {
      const subset = getByFunction(fn);
      expect(subset.length).toBeGreaterThanOrEqual(20);
      expect(subset.length).toBe(35);
      // Verify all items have this primaryFunction
      for (const m of subset) {
        expect(m.primaryFunction).toBe(fn);
      }
    }
  });

  it('covers all 4 difficulty tiers (iniciante, intermediario, avancado, caos)', () => {
    const tiers = ['iniciante', 'intermediario', 'avancado', 'caos'] as const;
    for (const tier of tiers) {
      const subset = getByDifficulty(tier);
      expect(subset.length).toBeGreaterThan(0);
    }
  });
});

describe('Chemistry Dataset - Synonyms Dictionary', () => {
  const dict = getSynonymsDictionary();

  it('contains 100+ mappings of Portuguese trivial names to canonical IUPAC names', () => {
    expect(Object.keys(dict).length).toBeGreaterThanOrEqual(100);
  });

  it('resolves key popular and commercial synonyms from funcoes.pdf and IUPAC guide', () => {
    expect(getCanonicalIUPACForSynonym('acetona')).toBe('propanona');
    expect(getCanonicalIUPACForSynonym('formol')).toBe('metanal');
    expect(getCanonicalIUPACForSynonym('formaldeído')).toBe('metanal');
    expect(getCanonicalIUPACForSynonym('formaldeido')).toBe('metanal');
    expect(getCanonicalIUPACForSynonym('acetaldeído')).toBe('etanal');
    expect(getCanonicalIUPACForSynonym('ácido acético')).toBe('ácido etanoico');
    expect(getCanonicalIUPACForSynonym('acido acetico')).toBe('ácido etanoico');
    expect(getCanonicalIUPACForSynonym('ácido fórmico')).toBe('ácido metanoico');
    expect(getCanonicalIUPACForSynonym('ácido butírico')).toBe('ácido butanoico');
    expect(getCanonicalIUPACForSynonym('anilina')).toBe('fenilamina');
    expect(getCanonicalIUPACForSynonym('tolueno')).toBe('metilbenzeno');
    expect(getCanonicalIUPACForSynonym('fenol')).toBe('hidroxibenzeno');
    expect(getCanonicalIUPACForSynonym('clorofórmio')).toBe('triclorometano');
    expect(getCanonicalIUPACForSynonym('cloroformio')).toBe('triclorometano');
    expect(getCanonicalIUPACForSynonym('éter dietílico')).toBe('etoxietano');
    expect(getCanonicalIUPACForSynonym('eter dietilico')).toBe('etoxietano');
    expect(getCanonicalIUPACForSynonym('acetato de etila')).toBe('etanoato de etila');
    expect(getCanonicalIUPACForSynonym('mentol')).toBe('2-isopropil-5-metilciclo-hexanol');
    expect(getCanonicalIUPACForSynonym('aspirina')).toBe('ácido 2-acetoxibenzoico');
    expect(getCanonicalIUPACForSynonym('aas')).toBe('ácido 2-acetoxibenzoico');
    expect(getCanonicalIUPACForSynonym('ureia')).toBe('diamidometanal');
    expect(getCanonicalIUPACForSynonym('acrilonitrila')).toBe('propenonitrila');
    expect(getCanonicalIUPACForSynonym('tnt')).toBe('2-metil-1,3,5-trinitrobenzeno');
    expect(getCanonicalIUPACForSynonym('anidrido acético')).toBe('anidrido etanoico');
    expect(getCanonicalIUPACForSynonym('cafeína')).toBe('1,3,7-trimetilpurina-2,6-diona');
    expect(getCanonicalIUPACForSynonym('cafeina')).toBe('1,3,7-trimetilpurina-2,6-diona');
    expect(getCanonicalIUPACForSynonym('nicotina')).toBe('3-(1-metilpirrolidin-2-il)piridina');
    expect(getCanonicalIUPACForSynonym('paracetamol')).toBe('4-acetamidofenol');
    expect(getCanonicalIUPACForSynonym('ácido lático')).toBe('ácido 2-hidroxipropanoico');
    expect(getCanonicalIUPACForSynonym('geraniol')).toBe('(2E)-3,7-dimetilocta-2,6-dien-1-ol');
  });

  it('handles case-insensitive and accent-insensitive synonym lookups', () => {
    expect(getCanonicalIUPACForSynonym('ACETONA')).toBe('propanona');
    expect(getCanonicalIUPACForSynonym('  AcIdO aCeTiCo  ')).toBe('ácido etanoico');
    expect(getCanonicalIUPACForSynonym('CLOROFORMIO')).toBe('triclorometano');
    expect(getCanonicalIUPACForSynonym('non_existent_chemical_xyz')).toBeUndefined();
  });
});

describe('Chemistry Dataset - DatasetProvider Methods', () => {
  it('returns a random molecule respecting optional filters', () => {
    const randAny = getRandomMolecule();
    expect(randAny).toBeDefined();
    expect(randAny.id).toBeDefined();

    const randAlc = getRandomMolecule({ function: 'alcool' });
    expect(randAlc.primaryFunction).toBe('alcool');

    const randIniciante = getRandomMolecule({ difficulty: 'iniciante' });
    expect(randIniciante.difficulty).toBe('iniciante');

    const randSpecific = getRandomMolecule({
      function: 'anidrido',
      difficulty: 'caos',
    });
    expect(randSpecific.primaryFunction).toBe('anidrido');
    expect(randSpecific.difficulty).toBe('caos');
  });

  it('searches molecules across id, iupacName, commonNames, and formulas', () => {
    const resultsName = searchMolecules('formaldeído');
    expect(resultsName.length).toBeGreaterThan(0);
    expect(resultsName.some((m) => m.iupacName === 'metanal')).toBe(true);

    const resultsFormula = searchMolecules('CH4');
    expect(resultsFormula.some((m) => m.iupacName === 'metano')).toBe(true);

    const resultsId = searchMolecules('mol-hidro-001');
    expect(resultsId.length).toBe(1);
    expect(resultsId[0].id).toBe('mol-hidro-001');

    const resultsStory = searchMolecules('Aspirina');
    expect(resultsStory.length).toBeGreaterThan(0);
  });

  it('allows custom DatasetProvider instances', () => {
    const customProvider = new DatasetProvider();
    expect(customProvider.getAllMolecules().length).toBeGreaterThanOrEqual(500);
    expect(customProvider.getByFunction('hidrocarboneto').length).toBeGreaterThanOrEqual(20);
    expect(customProvider.getCanonicalIUPACForSynonym('acetona')).toBe('propanona');
  });
});

describe('Chemistry Dataset - Procedural Generator', () => {
  const generator = new ProceduralGenerator(42);

  it('generates valid molecules adhering to chemical valences across multiple functions', () => {
    const functionsToTest: OrganicFunction[] = [
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

    for (const fn of functionsToTest) {
      const mol = generator.generateMolecule({ primaryFunction: fn, chainLength: 4 });
      expect(mol.primaryFunction).toBe(fn);
      expect(mol.smiles).toBeDefined();
      expect(mol.smiles.length).toBeGreaterThan(0);
      expect(mol.iupacName).toBeDefined();
      expect(mol.iupacName.length).toBeGreaterThan(0);

      const valenceCheck = verifyValences(mol);
      expect(valenceCheck.valid).toBe(true);

      const parseRes = MoleculeSchema.safeParse(mol);
      expect(parseRes.success).toBe(true);
    }
  });

  it('produces reproducible molecules with fixed seeds', () => {
    const gen1 = new ProceduralGenerator(12345);
    const gen2 = new ProceduralGenerator(12345);

    const m1 = gen1.generateMolecule({ primaryFunction: 'cetona' });
    const m2 = gen2.generateMolecule({ primaryFunction: 'cetona' });

    expect(m1.iupacName).toBe(m2.iupacName);
    expect(m1.smiles).toBe(m2.smiles);
    expect(m1.formula).toBe(m2.formula);
  });
});

describe('Chemistry Dataset - Chaos Synthesizer', () => {
  const synth = new ChaosSynthesizer(999);

  it('generates Chaos Mode molecules with 2 to 5 concurrent functional groups', () => {
    for (let count = 2; count <= 5; count++) {
      const mol = synth.synthesizeChaosMolecule({ targetFunctionCount: count });
      expect(mol.difficulty).toBe('caos');
      expect(mol.secondaryFunctions.length).toBeGreaterThanOrEqual(1);
      expect(mol.secondaryFunctions.length).toBeLessThanOrEqual(count - 1);
      expect(mol.iupacName).toBeDefined();
      expect(mol.smiles).toBeDefined();
      expect(mol.formula).toBeDefined();

      const parseRes = MoleculeSchema.safeParse(mol);
      expect(parseRes.success).toBe(true);
    }
  });

  it('respects IUPAC priority hierarchy with primary function as suffix and others as prefixes', () => {
    // Generate acid chaos molecule
    const mol = synth.synthesizeChaosMolecule({
      primaryFunction: 'acido_carboxilico',
      targetFunctionCount: 4,
    });
    expect(mol.primaryFunction).toBe('acido_carboxilico');
    expect(mol.iupacName.startsWith('ácido ')).toBe(true);
    expect(mol.iupacName.endsWith('oico')).toBe(true);

    // Verify secondary functions all have lower priority than acid
    for (const sec of mol.secondaryFunctions) {
      expect(sec).not.toBe('acido_carboxilico');
    }
  });

  it('[P0-2] [P0-3] connects radicals into SMILES at correct locants and avoids pentavalent ketone carbons', () => {
    // Test multiple seeds to ensure substituents are included in SMILES
    for (let s = 1; s <= 10; s++) {
      const chaosSynth = new ChaosSynthesizer(s * 100);
      const mol = chaosSynth.synthesizeChaosMolecule({
        targetFunctionCount: 3,
        primaryFunction: 'cetona',
      });
      expect(mol.primaryFunction).toBe('cetona');
      // Verify no main chain substituent prefix is on locant 2 for ketone (which would cause pentavalent carbon)
      // Note: (2-aminoetil) contains an internal locant 2, but main chain locants are preceded by start or hyphen
      const prefixPart = mol.iupacName.replace(/(hexan|heptan|octan)-2-ona$/, '');
      expect(prefixPart).not.toMatch(/(?:^|-)2-[a-z(]/i);

      // Verify SMILES contains branched radicals
      if (mol.secondaryFunctions.length > 0) {
        expect(mol.smiles).toContain('(');
      }
    }
  });
});

describe('Chemistry Dataset - Procedural Generator Fixes [P0-4]', () => {
  const gen = new ProceduralGenerator(42);

  it('[P0-4] generates chlorophenol with Cl formula and SMILES', () => {
    // Generate multiple phenols to ensure chlorophenol is tested
    for (let s = 0; s < 20; s++) {
      gen.setSeed(s);
      const mol = gen.generateMolecule({ primaryFunction: 'fenol' });
      if (mol.iupacName.includes('cloro')) {
        expect(mol.formula).toContain('Cl');
        expect(mol.smiles).toContain('Cl');
        expect(mol.formula).toBe('C6H5ClO');
      } else {
        expect(mol.formula).toBe('C7H8O');
      }
    }
  });

  it('[P0-4] generates enols with consistent chain lengths and formulas', () => {
    for (let len = 2; len <= 5; len++) {
      gen.setSeed(100 + len);
      const mol = gen.generateMolecule({ primaryFunction: 'enol', chainLength: len });
      expect(mol.primaryFunction).toBe('enol');
      expect(mol.formula).toBe(`C${len}H${len * 2}O`);
      if (len === 2) {
        expect(mol.iupacName).toBe('etenol');
        expect(mol.smiles).toBe('C=CO');
      } else {
        expect(mol.smiles).toContain('C(=C)O');
      }
    }
  });

  it('[P0-4] generates esters with acidLen=1 and variable alcohol lengths cleanly', () => {
    for (let s = 1; s <= 15; s++) {
      gen.setSeed(s * 10);
      const mol = gen.generateMolecule({ primaryFunction: 'ester', chainLength: 1 });
      expect(mol.primaryFunction).toBe('ester');
      expect(mol.iupacName).toContain('metanoato de');
      expect(mol.smiles.startsWith('O=CO')).toBe(true);
    }
  });
});

describe('Chemistry Core Integration', () => {
  it('parses canonical IUPAC names from dataset with parser', () => {
    // Check various representative molecules
    const ast1 = parseIUPACName('butano');
    expect(ast1.primaryFunction).toBe('hidrocarboneto');

    const ast2 = parseIUPACName('etanol');
    expect(ast2.primaryFunction).toBe('alcool');

    const ast3 = parseIUPACName('ácido butanoico');
    expect(ast3.primaryFunction).toBe('acido_carboxilico');

    const ast4 = parseIUPACName('etanoato de etila');
    expect(ast4.primaryFunction).toBe('ester');

    const ast5 = parseIUPACName('etanamida');
    expect(ast5.primaryFunction).toBe('amida');

    const ast6 = parseIUPACName('etanonitrila');
    expect(ast6.primaryFunction).toBe('nitrila');

    const ast7 = parseIUPACName('butan-2-ona');
    expect(ast7.primaryFunction).toBe('cetona');
  });
});
