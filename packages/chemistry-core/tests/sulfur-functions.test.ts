import { describe, expect, it } from 'vitest';
import {
  analyzeMolecularGraph,
  classifySulfur,
  createGraphFromSMILES,
} from '../src/graph-namer.js';
import { evaluateIUPACName } from '../src/evaluator.js';
import { parseIUPACName } from '../src/parser.js';
import { translateIupacToEnglish } from '../src/ptbr-to-english.js';

const analyze = (smiles: string) => analyzeMolecularGraph(createGraphFromSMILES(smiles));

describe('Funções sulfuradas — motor de nomenclatura', () => {
  it('never silently drops a sulfur atom', () => {
    // The engine used to skip any branch rooted at S: methanethiol came out as
    // "metano" and was reported nameable. Every one of these either keeps its
    // sulfur in the name or is refused.
    for (const smiles of [
      'CS', 'CSC', 'CSSC', 'CS(=O)(=O)O', 'OCCS', 'NC(CS)C(=O)O',
      'CS(=O)C', 'CS(=O)(=O)C', 'CC(=O)SC', 'CC(=S)C', 'CS(=O)(=O)N', 'CS(=O)(=O)OC',
    ]) {
      const analysis = analyze(smiles);
      if (analysis.isNameable) {
        expect(analysis.iupacName2013, smiles).toMatch(/sulf|tiol/);
      } else {
        expect(analysis.problems.length, smiles).toBeGreaterThan(0);
      }
    }
  });

  describe('tióis (-SH)', () => {
    it.each([
      ['CS', 'metanotiol', 'metanotiol'],
      ['CCS', 'etanotiol', 'etanotiol'],
      ['CCCS', 'propano-1-tiol', '1-propanotiol'],
      ['CC(S)C', 'propano-2-tiol', '2-propanotiol'],
      ['CC(C)CCS', '3-metilbutano-1-tiol', '3-metil-1-butanotiol'],
      ['CC(C)(C)S', '2-metilpropano-2-tiol', '2-metil-2-propanotiol'],
      ['SCCS', 'etano-1,2-ditiol', '1,2-etanoditiol'],
      ['Sc1ccccc1', 'benzenotiol', 'benzenotiol'],
      ['SC1CCCCC1', 'ciclo-hexanotiol', 'ciclo-hexanotiol'],
      ['C=CCS', 'prop-2-eno-1-tiol', '2-propeno-1-tiol'],
    ])('%s → %s', (smiles, name2013, name1993) => {
      const analysis = analyze(smiles);
      expect(analysis.isNameable).toBe(true);
      expect(analysis.primaryFunction).toBe('tiol');
      expect(analysis.iupacName2013).toBe(name2013);
      expect(analysis.iupacName1993).toBe(name1993);
    });

    it('ranks below alcohol and above amine, citing -SH as "sulfanil"', () => {
      const mercaptoethanol = analyze('OCCS');
      expect(mercaptoethanol.primaryFunction).toBe('alcool');
      expect(mercaptoethanol.iupacName2013).toBe('2-sulfaniletanol');

      const cysteamine = analyze('NCCS');
      expect(cysteamine.primaryFunction).toBe('tiol');
      expect(cysteamine.iupacName2013).toBe('2-aminoetanotiol');

      const cysteine = analyze('NC(CS)C(=O)O');
      expect(cysteine.iupacName2013).toBe('ácido 2-amino-3-sulfanilpropanoico');
      expect(cysteine.secondaryFunctions).toEqual(expect.arrayContaining(['amina', 'tiol']));
    });

    it('writes two -SH prefixes as bis(sulfanil), never the -S-S- prefix', () => {
      expect(analyze('SCC(S)CO').iupacName2013).toBe('2,3-bis(sulfanil)propan-1-ol');
    });
  });

  describe('ácidos sulfônicos (-SO3H)', () => {
    it.each([
      ['CS(=O)(=O)O', 'ácido metanossulfônico', 'ácido metanossulfônico'],
      ['CCS(=O)(=O)O', 'ácido etanossulfônico', 'ácido etanossulfônico'],
      ['CCCS(=O)(=O)O', 'ácido propano-1-sulfônico', 'ácido 1-propanossulfônico'],
      ['OS(=O)(=O)c1ccccc1', 'ácido benzenossulfônico', 'ácido benzenossulfônico'],
      ['OS(=O)(=O)c1cccc(c1)S(=O)(=O)O', 'ácido benzeno-1,3-dissulfônico', 'ácido 1,3-benzenodissulfônico'],
    ])('%s → %s', (smiles, name2013, name1993) => {
      const analysis = analyze(smiles);
      expect(analysis.primaryFunction).toBe('acido_sulfonico');
      expect(analysis.iupacName2013).toBe(name2013);
      expect(analysis.iupacName1993).toBe(name1993);
    });

    it('outranks every function except the carboxylic acid', () => {
      const taurine = analyze('NCCS(=O)(=O)O');
      expect(taurine.primaryFunction).toBe('acido_sulfonico');
      expect(taurine.iupacName2013).toBe('ácido 2-aminoetanossulfônico');

      const sulfobenzoic = analyze('OC(=O)c1ccc(cc1)S(=O)(=O)O');
      expect(sulfobenzoic.primaryFunction).toBe('acido_carboxilico');
      expect(sulfobenzoic.iupacName2013).toBe('ácido 4-sulfobenzoico');
    });

    it('names the detergent anion as a sulfonate, not as an acid', () => {
      expect(analyze('CS(=O)(=O)[O-]').iupacName2013).toBe('metanossulfonato');
    });
  });

  describe('tioéteres e dissulfetos', () => {
    it('recognises C-S-C and C-S-S-C and never mistakes a ring sulfur for one', () => {
      expect(analyze('CSC').primaryFunction).toBe('tioeter');
      expect(analyze('CCSC').primaryFunction).toBe('tioeter');
      expect(analyze('CSSC').primaryFunction).toBe('dissulfeto');
      expect(analyze('c1ccsc1').iupacName2013).toBe('tiofeno');
      expect(analyze('c1ccsc1').primaryFunction).toBe('hidrocarboneto');
    });

    it('cites the sulfide inside a higher-priority function', () => {
      const methionine = analyze('CSCCC(N)C(=O)O');
      expect(methionine.primaryFunction).toBe('acido_carboxilico');
      expect(methionine.secondaryFunctions).toEqual(expect.arrayContaining(['amina', 'tioeter']));
    });
  });

  it('refuses the sulfur groups outside the high-school scope instead of guessing', () => {
    for (const smiles of ['CS(=O)C', 'CS(=O)(=O)C', 'CC(=O)SC', 'CC(=O)S', 'CC(=S)C', 'CS(=O)(=O)N', 'CS(=O)(=O)OC']) {
      const analysis = analyze(smiles);
      expect(analysis.isNameable, smiles).toBe(false);
      expect(analysis.problems.some(p => p.code === 'unsupported_group'), smiles).toBe(true);
    }
  });

  it('classifies each sulfur atom by its environment', () => {
    const roleOf = (smiles: string) => {
      const graph = createGraphFromSMILES(smiles);
      const sulfur = [...graph.atoms.values()].find(a => a.element === 'S')!;
      return classifySulfur(graph, sulfur.id);
    };
    expect(roleOf('CCS')).toBe('tiol');
    expect(roleOf('CSC')).toBe('tioeter');
    expect(roleOf('CSSC')).toBe('dissulfeto');
    expect(roleOf('CS(=O)(=O)O')).toBe('acido_sulfonico');
    expect(roleOf('c1ccsc1')).toBe('ring');
    expect(roleOf('CS(=O)C')).toBe('unsupported');
  });

  it('bridges every generated sulfur name to English for the OPSIN audit', () => {
    for (const smiles of ['CCCS', 'CSSC', 'CCSC', 'CS(=O)(=O)O', 'OS(=O)(=O)c1ccccc1', 'SCC(S)CO', 'NC(CS)C(=O)O']) {
      const { iupacName2013 } = analyze(smiles);
      expect(translateIupacToEnglish(iupacName2013), iupacName2013).not.toBeNull();
    }
    expect(translateIupacToEnglish('ácido metanossulfônico')).toBe('methanesulfonic acid');
    expect(translateIupacToEnglish('propano-1-tiol')).toBe('propane-1-thiol');
  });
});

describe('Sais: detergentes e sabões', () => {
  it.each([
    ['CCCCCCCCCCCCc1ccc(cc1)S(=O)(=O)[O-].[Na+]', '4-dodecilbenzeno-1-sulfonato de sódio', 'C18H29NaO3S'],
    ['CS(=O)(=O)[O-].[Na+]', 'metanossulfonato de sódio', 'CH3NaO3S'],
    ['[O-]S(=O)(=O)c1cccc(c1)S(=O)(=O)[O-].[Na+].[Na+]', 'benzeno-1,3-dissulfonato de dissódio', 'C6H4Na2O6S2'],
    ['CCCCCCCCCCCCCCCCCC(=O)[O-].[K+]', 'octadecanoato de potássio', 'C18H35KO2'],
  ])('%s → %s', (smiles, name, formula) => {
    const analysis = analyze(smiles);
    expect(analysis.isNameable).toBe(true);
    expect(analysis.iupacName2013).toBe(name);
    expect(analysis.formula).toBe(formula);
    expect(translateIupacToEnglish(name)).not.toBeNull();
  });

  it('refuses a cation with no anion to balance it', () => {
    expect(analyze('CCS.[Na+]').isNameable).toBe(false);
    expect(analyze('CS(=O)(=O)O.[Na+]').isNameable).toBe(false);
  });
});

describe('Funções sulfuradas — resposta do aluno', () => {
  it('parses thiol and sulfonic acid names in both notations', () => {
    for (const name of ['propano-1-tiol', '1-propanotiol', 'etanotiol', 'benzenotiol', '2-propeno-1-tiol']) {
      expect(parseIUPACName(name).primaryFunction, name).toBe('tiol');
    }
    for (const name of ['ácido metanossulfônico', 'ácido 1-propanossulfônico', 'ácido benzeno-1,3-dissulfônico']) {
      expect(parseIUPACName(name).primaryFunction, name).toBe('acido_sulfonico');
    }
    expect(parseIUPACName('1-propanotiol').carbonCount).toBe(3);
  });

  it('accepts the 1993 spelling of a thiol as a perfect answer', () => {
    expect(evaluateIUPACName('1-propanotiol', 'propano-1-tiol').isPerfect).toBe(true);
    expect(evaluateIUPACName('ácido 1-propanossulfônico', 'ácido propano-1-sulfônico').isPerfect).toBe(true);
    expect(evaluateIUPACName('2-propen-1-ol', 'prop-2-en-1-ol').isPerfect).toBe(true);
  });

  it('accepts every spelling Brazilian exams and textbooks use', () => {
    const same = (typed: string, target: string) =>
      expect(evaluateIUPACName(typed, target).isPerfect, `${typed} ≡ ${target}`).toBe(true);
    // Elided locant form (UECE 2020, UNIVAG 2014)
    same('butan-1-tiol', 'butano-1-tiol');
    same('3-metilbutan-1-tiol', '3-metilbutano-1-tiol');
    same('3-metil-1-butanotiol', '3-metilbutano-1-tiol');
    // "radical + tio + cadeia" (PrePara Enem, InfoEscola) and the brackets
    same('metiltioetano', '(metilsulfanil)etano');
    same('metil-tio-metano', '(metilsulfanil)metano');
    same('metilsulfaniletano', '(metilsulfanil)etano');
    same('metilditiometano', '(metildissulfanil)metano');
    // Retired "mercapto" prefix, still printed everywhere
    same('2-mercaptoetanol', '2-sulfaniletanol');
    same('ácido 2-amino-3-mercaptopropanoico', 'ácido 2-amino-3-sulfanilpropanoico');
    // Sulfonic acid spellings
    same('ácido metanosulfônico', 'ácido metanossulfônico');
    same('ácido benzeno-sulfônico', 'ácido benzenossulfônico');
    same('ácido propan-2-sulfônico', 'ácido propano-2-sulfônico');
  });

  it('does not accept "sulfato" for a sulfide', () => {
    expect(evaluateIUPACName('sulfato de dimetila', '(metilsulfanil)metano').isPerfect).toBe(false);
  });

  it('does not give full function credit for writing the alcohol instead of the thiol', () => {
    const result = evaluateIUPACName('etanol', 'etanotiol');
    expect(result.isPerfect).toBe(false);
    expect(result.partialCreditBreakdown.functionScore).toBeLessThan(1);
  });
});
