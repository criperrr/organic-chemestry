import { describe, expect, it } from 'vitest';
import { createGraphFromSMILES, nameMolecularGraph } from '../src/graph-namer.js';
import { translateIupacToEnglish } from '../src/ptbr-to-english.js';

const name = (smiles: string) => nameMolecularGraph(createGraphFromSMILES(smiles)).iupacName2013;

/**
 * Every case here was found by the OPSIN round-trip audit (`npm run audit:names`),
 * not by inspection. Each one was a name the engine produced confidently and
 * wrongly, so they exist to stop the same class coming back.
 */
describe('Regressions found by the round-trip audit', () => {
  it('keeps every hydroxyl of a benzenediol instead of collapsing to "hidroxibenzeno"', () => {
    expect(name('Oc1ccccc1O')).toBe('benzeno-1,2-diol');
    expect(name('Oc1ccc(O)cc1')).toBe('benzeno-1,4-diol');
    // A single hydroxyl on benzene keeps the retained parent name.
    expect(name('Oc1ccccc1')).toBe('hidroxibenzeno');
    expect(name('Cc1ccccc1O')).toBe('2-metilfenol');
  });

  it('numbers fused rings, whose positions are not interchangeable', () => {
    expect(name('Oc1cccc2ccccc12')).toBe('naftalen-1-ol');
  });

  it('names a ring substituent as a cycloalkyl, not an open chain', () => {
    // Three ring carbons are cyclopropyl; reading them as isopropyl was wrong.
    expect(name('OC(=C)C1CC1')).toBe('1-ciclopropiletenol');
    expect(name('OC=CC1CCCC1')).toBe('2-ciclopentiletenol');
  });

  it('never calls a heteroatom-bearing ring substituent a cycloalkyl', () => {
    // Nicotine's N-methylpyrrolidine has a nitrogen: it is not "ciclopentil".
    expect(name('CN1CCCC1c2cccnc2')).toContain('pirrolidinil');
  });

  it('writes substituent locants when a ring carries an exocyclic group', () => {
    expect(name('O=Cc1ccc(O)cc1')).toBe('4-hidroxibenzenocarbaldeído');
    expect(name('O=C(O)c1ccc(C(=O)O)cc1')).toBe('ácido 4-carboxibenzoico');
  });

  it('names ester alkyl groups through the same branch namer as substituents', () => {
    expect(name('CC(=O)OCc1ccccc1')).toBe('etanoato de benzila');
    expect(name('COC(=O)c1ccccc1')).toBe('benzoato de metila');
    // A branched five-carbon alkyl is not "pentila".
    expect(name('CC(=O)OCCC(C)C')).toBe('etanoato de 3-metilbutila');
  });

  it('pluralises the alkoxy group of a diester', () => {
    expect(name('COC(=O)C(=O)OC')).toBe('etanodioato de dimetila');
  });

  it('only contracts alkoxy names for the short unbranched alkyls', () => {
    // benzil + oxi is "benziloxi"; contracting it to "benzoxi" invented a group.
    expect(name('c1ccc2OCOc2c1')).toBe('1,2-dibenziloxibenzeno');
    expect(name('COCC')).toBe('metoxietano');
  });
});

describe('Anhydrides, which have two acyl halves', () => {
  it('names symmetric, mixed and substituted acyclic anhydrides', () => {
    expect(name('CC(=O)OC(=O)C')).toBe('anidrido etanoico');
    // Both halves must survive: the old code named one and dropped the other.
    expect(name('O=COC(=O)C')).toBe('anidrido etanoico e metanoico');
    expect(name('CC(=O)OC(=O)c1ccccc1')).toBe('anidrido benzoico e etanoico');
    // Substituents on the acyl halves must be cited.
    expect(name('ClCC(=O)OC(=O)CCl')).toBe('anidrido 2-cloroetanoico');
    expect(name('CC(C)C(=O)OC(=O)C(C)C')).toBe('anidrido 2-metilpropanoico');
    // The chain must not wander into the aromatic ring ("heptanoico").
    expect(name('O=C(OC(=O)c1ccccc1)c2ccccc2')).toBe('anidrido benzoico');
    // Equal-length chains: the unsaturated one wins, so both halves match.
    expect(name('CC(=C)C(=O)OC(=O)C(=C)C')).toBe('anidrido 2-metilprop-2-enoico');
  });

  it('names cyclic anhydrides from the bridging chain, not the oxygen ring', () => {
    // These were all "anidrido oxolanodioico" — the ring holding the bridging
    // oxygen was being mistaken for an oxolane parent.
    expect(name('O=C1CCC(=O)O1')).toBe('anidrido butanodioico');
    expect(name('O=C1C=CC(=O)O1')).toBe('anidrido but-2-enodioico');
    expect(name('O=C1CCCC(=O)O1')).toBe('anidrido pentanodioico');
    expect(name('O=C1OC(=O)c2ccccc12')).toBe('anidrido benzeno-1,2-dicarboxílico');
  });
});

describe('pt-BR to English bridge', () => {
  it('translates the constructions the engine emits', () => {
    const cases: [string, string][] = [
      ['butano', 'butane'],
      ['pentano', 'pentane'],
      ['but-2-eno', 'but-2-ene'],
      ['buta-1,3-dieno', 'buta-1,3-diene'],
      ['but-1-ino', 'but-1-yne'],
      ['propan-2-ol', 'propan-2-ol'],
      ['propanona', 'propanone'],
      ['metanal', 'methanal'],
      ['ácido etanoico', 'ethanoic acid'],
      ['ácido butanodioico', 'butanedioic acid'],
      ['etanoato de etila', 'ethyl ethanoate'],
      ['etanoato de benzila', 'benzyl ethanoate'],
      ['etanodioato de dimetila', 'dimethyl ethanedioate'],
      ['cloreto de etanoíla', 'ethanoyl chloride'],
      ['anidrido etanoico', 'ethanoic anhydride'],
      ['etanonitrila', 'ethanenitrile'],
      ['N-metiletanamina', 'N-methylethanamine'],
      ['ciclo-hexano', 'cyclohexane'],
      ['2,2,4-trimetilpentano', '2,2,4-trimethylpentane'],
      ['piperidin-4-ol', 'piperidin-4-ol'],
      ['piridina', 'pyridine'],
      ['naftalen-1-ol', 'naphthalen-1-ol'],
      ['benzeno-1,2-diol', 'benzene-1,2-diol'],
    ];

    for (const [ptName, expected] of cases) {
      expect(translateIupacToEnglish(ptName), ptName).toBe(expected);
    }
  });

  it('returns null rather than guessing at an unknown construction', () => {
    expect(translateIupacToEnglish('composto misterioso xyz')).toBeNull();
    expect(translateIupacToEnglish('')).toBeNull();
  });
});
