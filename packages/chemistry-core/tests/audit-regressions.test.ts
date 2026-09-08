import { describe, expect, it } from 'vitest';
import {
  analyzeMolecularGraph,
  createGraphFromSMILES,
  nameMolecularGraph,
} from '../src/graph-namer.js';
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
    // The radical also states where it attaches and keeps its own N-methyl —
    // "pirrolidinil" alone let a reader attach through the nitrogen instead.
    expect(name('CN1CCCC1c2cccnc2')).toBe('3-(1-metilpirrolidin-2-il)piridina');
    // An aromatic heterocycle is not benzene: this used to be "feniletanamida".
    expect(name('c1ccsc1CC(=O)N')).toBe('2-(tiofen-2-il)etanamida');
    // A heterocyclic parent has a fixed numbering, so its locant is never optional.
    expect(name('Cc1ccncc1')).toBe('4-metilpiridina');
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
    expect(name('c1ccccc1COCC')).toBe('(etoximetil)benzeno');
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

/**
 * Second wave, found by the brute-force audit (`tools/bruteforce.audit.ts`),
 * which generates molecules instead of reading the curated acervo. Every case
 * below was a name the engine produced confidently and wrongly on a shape
 * nobody had curated.
 */
describe('Regressions found by the brute-force audit', () => {
  const analyse = (smiles: string) => analyzeMolecularGraph(createGraphFromSMILES(smiles));

  it('reads bracketed atoms by their element, not by scanning for a letter', () => {
    // "[nH]" held no upper-case N and no lower-case c, so pyrrole parsed as
    // five carbons: C5H6, named "ciclopentano".
    expect(name('c1cc[nH]c1')).toBe('pirrol');
    expect(analyse('c1cc[nH]c1').formula).toBe('C4H5N');
  });

  it('perceives aromaticity in Kekulé notation and at any ring size', () => {
    expect(name('C1=CC=NC=C1')).toBe('piridina');
    expect(name('C1=CC=CC2=CC=CC=C12')).toBe('naftaleno');
    // Five-membered aromatics were flagged non-aromatic, so the heterocycle
    // table answered with the saturated entry: thiophene as "tiolano".
    expect(name('c1ccsc1')).toBe('tiofeno');
  });

  it('does not mistake a saturated or bridged bicycle for naphthalene', () => {
    // Decalin shares an edge between two six-rings, like naphthalene, but is
    // not aromatic; bicyclo[2.2.2]octane shares two non-adjacent atoms.
    expect(analyse('C1CCC2CCCCC2C1').isNameable).toBe(false);
    expect(analyse('C1CC2CCC1CC2').isNameable).toBe(false);
  });

  it('refuses instead of inventing a stem past the table', () => {
    expect(name('CCCCCCCCCCCCCCCC(=O)O')).toBe('ácido hexadecanoico');
    // Beyond the table the old fallback produced the non-word "carbano".
    const huge = analyse(`C${'C'.repeat(40)}`);
    expect(huge.isNameable).toBe(false);
    expect(huge.iupacName2013).not.toContain('carb');
  });

  it('keeps a ring substituent whole: identity, attachment and its own groups', () => {
    // Every aromatic branch used to answer "fenil".
    expect(name('CC(O)Cc1ccncc1')).toBe('1-(piridin-4-il)propan-2-ol');
    // A ring cited as a substituent used to drop everything else on it.
    expect(name('c1c(C(C)C)c(CC(C)C)ccc1')).toBe('1-(2-isopropilfenil)-2-metilpropano');
    // And a branch reaching into a ring was walked as an open chain: "heptil".
    expect(name('C1CCCCC1CC(CC)CC(=O)O')).toBe('ácido 3-(ciclo-hexilmetil)pentanoico');
  });

  it('never drops a bond that joins the parent to a branch', () => {
    // The chain-to-branch double bond is an ylidene; ignoring it turned an
    // alkene into an alkane.
    expect(name('CCC=C(CCCC)CCCC')).toBe('5-propilidenononano');
    expect(name('C=C1CCCCC1')).toBe('metilidenociclo-hexano');
  });

  it('cites substituents in alphanumerical order, italics and all', () => {
    // "terc-" files under B, and N-substituents interleave with the carbon
    // ones instead of being emitted as a block in front.
    expect(name('CCC(C)CNC')).toBe('N,2-dimetilbutan-1-amina');
    expect(name('CC(C)(C)C1CCC(C)CC1')).toBe('1-terc-butil-4-metilciclo-hexano');
  });

  it('names an unbranched alkyl only when it attaches at its own terminus', () => {
    // A five-carbon branch joined at its middle carbon was also "pentil".
    expect(name('CCC(c1ccccc1)CC')).toBe('(1-etilpropil)benzeno');
  });

  it('keeps a nitrile out of the parent chain when it is cited as a prefix', () => {
    // The chain ran through the C≡N and the nitrogen came out as "amino".
    expect(name('N#CCCC(=O)N')).toContain('ciano');
    expect(name('N#CCCC(=O)N')).not.toContain('amino');
  });

  it('uses the retained names for urea and the lactams', () => {
    // "aminometanamida" is read by OPSIN as H2N-NH-CHO, a different molecule.
    expect(name('NC(=O)N')).toBe('ureia');
    expect(name('O=C1CCCN1')).toBe('pirrolidin-2-ona');
  });

  it('rejects malformed SMILES instead of naming the wreckage', () => {
    expect(() => createGraphFromSMILES('c1c(CC)')).toThrow();
    expect(() => createGraphFromSMILES('CC(C')).toThrow();
  });
});

/**
 * Third wave, found by probing the engine with real, named molecules instead of
 * generated ones. The round-trip audit is blind to all of these: the parser sits
 * on both ends of that cycle, so a molecule it corrupts on the way in is
 * re-corrupted identically on the way out and the comparison still matches.
 */
describe('Regressions found by probing real molecules', () => {
  const analyse = (smiles: string) => analyzeMolecularGraph(createGraphFromSMILES(smiles));

  it('reads "/" and "\\\\" as bond markers, not as carbon atoms', () => {
    // Cinnamaldehyde is C9H8O. Parsed as atoms, the two markers made it C11H12O
    // and it was named "5-fenilpent-3-enal".
    expect(analyse('O=C/C=C/c1ccccc1').formula).toBe('C9H8O');
    expect(analyse('OC(=O)/C=C/C(=O)O').formula).toBe('C4H4O4');
  });

  it('assigns E/Z so that two different molecules cannot share one name', () => {
    // Geranial and neral differ only in configuration; both answered to
    // "3,7-dimetilocta-2,6-dienal".
    expect(name('CC(C)=CCC/C(=C/C=O)/C')).toBe('(2E)-3,7-dimetilocta-2,6-dienal');
    expect(name('CC(C)=CCC/C(=C\\C=O)/C')).toBe('(2Z)-3,7-dimetilocta-2,6-dienal');
    expect(name('OC(=O)/C=C/C(=O)O')).toBe('ácido (E)-but-2-enodioico');
    expect(name('OC(=O)/C=C\\C(=O)O')).toBe('ácido (Z)-but-2-enodioico');
    expect(name('CCCCCCCC/C=C\\CCCCCCCC(=O)O')).toBe('ácido (Z)-octadec-9-enoico');
    // CIP ranking: a chain outranks a methyl, and hydrogens belong to the next
    // sphere — counting them in the current one inverted geranial.
    expect(name('C/C=C/C')).toBe('(E)-but-2-eno');
    expect(name('F/C=C\\F')).toBe('(Z)-1,2-difluoreteno');
    // A double bond whose configuration the drawing does not state stays
    // undescribed rather than guessed.
    expect(name('CC=CC')).toBe('but-2-eno');
  });

  it('names an acyloxy group as such', () => {
    // Aspirin's acetyl was "1-oxoetoxi": structurally right, but no exam
    // accepts it, and the acervo's own gabarito says otherwise.
    expect(name('CC(=O)Oc1ccccc1C(=O)O')).toBe('ácido 2-acetoxibenzoico');
  });

  it('does not call a carboxylate anion an acid', () => {
    expect(name('c1ccccc1C(=O)[O-]')).toBe('benzoato');
    expect(name('CC(=O)[O-]')).toBe('etanoato');
  });
});
