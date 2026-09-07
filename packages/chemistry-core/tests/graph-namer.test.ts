import { describe, expect, it } from 'vitest';
import {
  MolecularGraph,
  createGraphFromSMILES,
  nameMolecularGraph,
  computeMolecularFormula,
  perceiveRingsAndAromaticity,
  molecularGraphToSMILES,
} from '../src/graph-namer.js';

describe('Molecular Graph to IUPAC pt-BR Namer Engine', () => {
  describe('1. Hydrocarbons (Alkanes, Alkenes, Alkynes, Cycloalkanes, Aromatics)', () => {
    it('names linear and branched alkanes correctly', () => {
      // Methane
      const metano = createGraphFromSMILES('C');
      const resMet = nameMolecularGraph(metano);
      expect(resMet.iupacName2013).toBe('metano');
      expect(resMet.formula).toBe('CH4');
      expect(resMet.primaryFunction).toBe('hidrocarboneto');

      // Ethane
      const etano = createGraphFromSMILES('CC');
      const resEt = nameMolecularGraph(etano);
      expect(resEt.iupacName2013).toBe('etano');
      expect(resEt.formula).toBe('C2H6');

      // Butane (Golden Case 1)
      const butano = createGraphFromSMILES('CCCC');
      const resBut = nameMolecularGraph(butano);
      expect(resBut.iupacName2013).toBe('butano');
      expect(resBut.iupacName1993).toBe('butano');
      expect(resBut.formula).toBe('C4H10');
      expect(resBut.primaryFunction).toBe('hidrocarboneto');
      expect(resBut.secondaryFunctions).toEqual([]);

      // 2,2,4-Trimethylpentane / Isooctane (Golden Case 2)
      const isooctano = createGraphFromSMILES('CC(C)CC(C)(C)C');
      const resIso = nameMolecularGraph(isooctano);
      expect(resIso.iupacName2013).toBe('2,2,4-trimetilpentano');
      expect(resIso.iupacName1993).toBe('2,2,4-trimetilpentano');
      expect(resIso.formula).toBe('C8H18');
    });

    it('names alkenes with dual 2013 and 1993 locant placements', () => {
      // Ethene
      const eteno = createGraphFromSMILES('C=C');
      const resEteno = nameMolecularGraph(eteno);
      expect(resEteno.iupacName2013).toBe('eteno');
      expect(resEteno.formula).toBe('C2H4');

      // Propene
      const propeno = createGraphFromSMILES('CC=C');
      const resPropeno = nameMolecularGraph(propeno);
      expect(resPropeno.iupacName2013).toBe('propeno');
      expect(resPropeno.formula).toBe('C3H6');

      // But-2-ene (Golden Case 3)
      const but2eno = createGraphFromSMILES('CC=CC');
      const resBut2eno = nameMolecularGraph(but2eno);
      expect(resBut2eno.iupacName2013).toBe('but-2-eno');
      expect(resBut2eno.iupacName1993).toBe('2-buteno');
      expect(resBut2eno.formula).toBe('C4H8');

      // Buta-1,3-diene
      const dieno = createGraphFromSMILES('C=CC=C');
      const resDieno = nameMolecularGraph(dieno);
      expect(resDieno.iupacName2013).toBe('buta-1,3-dieno');
      expect(resDieno.iupacName1993).toBe('1,3-butadieno');
      expect(resDieno.formula).toBe('C4H6');
    });

    it('names alkynes', () => {
      // Ethyne
      const etino = createGraphFromSMILES('C#C');
      const resEtino = nameMolecularGraph(etino);
      expect(resEtino.iupacName2013).toBe('etino');
      expect(resEtino.formula).toBe('C2H2');

      // Propyne
      const propino = createGraphFromSMILES('CC#C');
      const resPropino = nameMolecularGraph(propino);
      expect(resPropino.iupacName2013).toBe('propino');
      expect(resPropino.formula).toBe('C3H4');

      // But-1-yne
      const but1ino = createGraphFromSMILES('CCC#C');
      const resBut1ino = nameMolecularGraph(but1ino);
      expect(resBut1ino.iupacName2013).toBe('but-1-ino');
      expect(resBut1ino.iupacName1993).toBe('1-butino');
      expect(resBut1ino.formula).toBe('C4H6');
    });

    it('names cycloalkanes adhering strictly to Novo Acordo Ortográfico (Base XVI)', () => {
      // Cyclopropane
      const ciclopropano = createGraphFromSMILES('C1CC1');
      expect(nameMolecularGraph(ciclopropano).iupacName2013).toBe('ciclopropano');
      expect(computeMolecularFormula(ciclopropano)).toBe('C3H6');

      // Cyclobutane
      const ciclobutano = createGraphFromSMILES('C1CCC1');
      expect(nameMolecularGraph(ciclobutano).iupacName2013).toBe('ciclobutano');
      expect(computeMolecularFormula(ciclobutano)).toBe('C4H8');

      // Cyclopentane
      const ciclopentano = createGraphFromSMILES('C1CCCC1');
      expect(nameMolecularGraph(ciclopentano).iupacName2013).toBe('ciclopentano');
      expect(computeMolecularFormula(ciclopentano)).toBe('C5H10');

      // Cyclohexane (Golden Case 4 - Mandatory hyphen before 'h')
      const ciclohexano = createGraphFromSMILES('C1CCCCC1');
      const resHex = nameMolecularGraph(ciclohexano);
      expect(resHex.iupacName2013).toBe('ciclo-hexano');
      expect(resHex.iupacName1993).toBe('ciclo-hexano');
      expect(resHex.formula).toBe('C6H12');

      // Methylcyclopentane
      const metilciclopentano = createGraphFromSMILES('CC1CCCC1');
      const resMcp = nameMolecularGraph(metilciclopentano);
      expect(resMcp.iupacName2013).toBe('metilciclopentano');
      expect(resMcp.formula).toBe('C6H12');

      // Cyclooctane (Vowel collision hyphen: ciclo-octano)
      const ciclooctano = createGraphFromSMILES('C1CCCCCCC1');
      expect(nameMolecularGraph(ciclooctano).iupacName2013).toBe('ciclo-octano');
    });

    it('names aromatics: benzene, toluene, o-xylene, naphthalene', () => {
      // Benzene
      const benzeno = createGraphFromSMILES('c1ccccc1');
      const resBenz = nameMolecularGraph(benzeno);
      expect(resBenz.iupacName2013).toBe('benzeno');
      expect(resBenz.formula).toBe('C6H6');

      // Toluene / Methylbenzene
      const tolueno = createGraphFromSMILES('Cc1ccccc1');
      const resTol = nameMolecularGraph(tolueno);
      expect(resTol.iupacName2013).toBe('metilbenzeno');
      expect(resTol.formula).toBe('C7H8');

      // 1,2-Dimethylbenzene / o-Xylene
      const xileno = createGraphFromSMILES('Cc1ccccc1C');
      const resXil = nameMolecularGraph(xileno);
      expect(resXil.iupacName2013).toBe('1,2-dimetilbenzeno');
      expect(resXil.formula).toBe('C8H10');

      // Naphthalene
      const naftaleno = createGraphFromSMILES('c1ccc2ccccc2c1');
      const resNaft = nameMolecularGraph(naftaleno);
      expect(resNaft.iupacName2013).toBe('naftaleno');
      expect(resNaft.formula).toBe('C10H8');
    });
  });

  describe('2. Alcohols, Enols, and Phenols', () => {
    it('names primary and secondary alcohols', () => {
      // Ethanol
      const etanol = createGraphFromSMILES('CCO');
      const resEt = nameMolecularGraph(etanol);
      expect(resEt.iupacName2013).toBe('etanol');
      expect(resEt.iupacName1993).toBe('etanol');
      expect(resEt.formula).toBe('C2H6O');
      expect(resEt.primaryFunction).toBe('alcool');

      // Propan-2-ol
      const propan2ol = createGraphFromSMILES('CC(O)C');
      const resProp2ol = nameMolecularGraph(propan2ol);
      expect(resProp2ol.iupacName2013).toBe('propan-2-ol');
      expect(resProp2ol.iupacName1993).toBe('2-propanol');
      expect(resProp2ol.formula).toBe('C3H8O');
      expect(resProp2ol.primaryFunction).toBe('alcool');

      // Propan-1-ol
      const propan1ol = createGraphFromSMILES('CCCO');
      const resProp1ol = nameMolecularGraph(propan1ol);
      expect(resProp1ol.iupacName2013).toBe('propan-1-ol');
      expect(resProp1ol.iupacName1993).toBe('1-propanol');
      expect(resProp1ol.formula).toBe('C3H8O');
    });

    it('names phenols', () => {
      // Phenol / Hydroxybenzene (Golden Case 7)
      const fenol = createGraphFromSMILES('Oc1ccccc1');
      const resFenol = nameMolecularGraph(fenol);
      expect(resFenol.iupacName2013).toBe('hidroxibenzeno');
      expect(resFenol.formula).toBe('C6H6O');
      expect(resFenol.primaryFunction).toBe('fenol');

      // 2-Methylphenol (o-cresol)
      const cresol = createGraphFromSMILES('Cc1ccccc1O');
      const resCresol = nameMolecularGraph(cresol);
      expect(resCresol.iupacName2013).toBe('2-metilfenol');
      expect(resCresol.formula).toBe('C7H8O');
      expect(resCresol.primaryFunction).toBe('fenol');
    });

    it('names enols', () => {
      // Ethenol
      const etenol = createGraphFromSMILES('C=CO');
      const resEtenol = nameMolecularGraph(etenol);
      expect(resEtenol.iupacName2013).toBe('etenol');
      expect(resEtenol.primaryFunction).toBe('enol');
      expect(resEtenol.formula).toBe('C2H4O');

      // Prop-1-en-2-ol
      const prop1en2ol = createGraphFromSMILES('CC(=C)O');
      const resP = nameMolecularGraph(prop1en2ol);
      expect(resP.iupacName2013).toBe('prop-1-en-2-ol');
      expect(resP.primaryFunction).toBe('enol');
      expect(resP.formula).toBe('C3H6O');
    });
  });

  describe('3. Carbonyl Derivatives: Aldehydes, Ketones, Carboxylic Acids, Esters, Amides, Acyl Halides, Anhydrides', () => {
    it('names aldehydes', () => {
      // Methanal (formaldehyde)
      const metanal = createGraphFromSMILES('C=O');
      const resMet = nameMolecularGraph(metanal);
      expect(resMet.iupacName2013).toBe('metanal');
      expect(resMet.primaryFunction).toBe('aldeido');
      expect(resMet.formula).toBe('CH2O');

      // Ethanal (acetaldehyde)
      const etanal = createGraphFromSMILES('CC=O');
      const resEt = nameMolecularGraph(etanal);
      expect(resEt.iupacName2013).toBe('etanal');
      expect(resEt.primaryFunction).toBe('aldeido');
      expect(resEt.formula).toBe('C2H4O');

      // Butanal
      const butanal = createGraphFromSMILES('CCCC=O');
      const resBut = nameMolecularGraph(butanal);
      expect(resBut.iupacName2013).toBe('butanal');
      expect(resBut.primaryFunction).toBe('aldeido');
      expect(resBut.formula).toBe('C4H8O');
    });

    it('names ketones', () => {
      // Propanone (acetone)
      const propanona = createGraphFromSMILES('CC(=O)C');
      const resProp = nameMolecularGraph(propanona);
      expect(resProp.iupacName2013).toBe('propanona');
      expect(resProp.iupacName1993).toBe('propanona');
      expect(resProp.primaryFunction).toBe('cetona');
      expect(resProp.formula).toBe('C3H6O');

      // Butan-2-one
      const butanona = createGraphFromSMILES('CCC(=O)C');
      const resBut = nameMolecularGraph(butanona);
      expect(resBut.iupacName2013).toBe('butan-2-ona');
      expect(resBut.iupacName1993).toBe('2-butanona');
      expect(resBut.primaryFunction).toBe('cetona');
      expect(resBut.formula).toBe('C4H8O');
    });

    it('names carboxylic acids and polyfunctional acids with Crown Rule', () => {
      // Methanoic acid (formic acid)
      const acFormico = createGraphFromSMILES('OC=O');
      const resMet = nameMolecularGraph(acFormico);
      expect(resMet.iupacName2013).toBe('ácido metanoico');
      expect(resMet.primaryFunction).toBe('acido_carboxilico');
      expect(resMet.formula).toBe('CH2O2');

      // Ethanoic acid (acetic acid)
      const acAcetico = createGraphFromSMILES('CC(=O)O');
      const resEt = nameMolecularGraph(acAcetico);
      expect(resEt.iupacName2013).toBe('ácido etanoico');
      expect(resEt.primaryFunction).toBe('acido_carboxilico');
      expect(resEt.formula).toBe('C2H4O2');

      // Benzoic acid
      const acBenzoico = createGraphFromSMILES('O=C(O)c1ccccc1');
      const resBenz = nameMolecularGraph(acBenzoico);
      expect(resBenz.iupacName2013).toBe('ácido benzoico');
      expect(resBenz.formula).toBe('C7H6O2');

      // 3-Hydroxybutanoic acid (Golden Case 5 - Polyfunctional Priority)
      const ac3hidroxi = createGraphFromSMILES('CC(O)CC(=O)O');
      const resPoly = nameMolecularGraph(ac3hidroxi);
      expect(resPoly.iupacName2013).toBe('ácido 3-hidroxibutanoico');
      expect(resPoly.iupacName1993).toBe('ácido 3-hidroxibutanoico');
      expect(resPoly.primaryFunction).toBe('acido_carboxilico');
      expect(resPoly.secondaryFunctions).toEqual(['alcool']);
      expect(resPoly.formula).toBe('C4H8O3');
    });

    it('names esters', () => {
      // Ethyl ethanoate (Golden Case 6)
      const acetatoEtila = createGraphFromSMILES('CCOC(=O)C');
      const resEst = nameMolecularGraph(acetatoEtila);
      expect(resEst.iupacName2013).toBe('etanoato de etila');
      expect(resEst.iupacName1993).toBe('etanoato de etila');
      expect(resEst.primaryFunction).toBe('ester');
      expect(resEst.formula).toBe('C4H8O2');

      // Methyl methanoate
      const metilMet = createGraphFromSMILES('COC=O');
      const resMet = nameMolecularGraph(metilMet);
      expect(resMet.iupacName2013).toBe('metanoato de metila');
      expect(resMet.formula).toBe('C2H4O2');
    });

    it('names amides', () => {
      // Formamide / Methanamide
      const formamida = createGraphFromSMILES('NC=O');
      const resForm = nameMolecularGraph(formamida);
      expect(resForm.iupacName2013).toBe('metanamida');
      expect(resForm.primaryFunction).toBe('amida');
      expect(resForm.formula).toBe('CH3NO');

      // Acetamide / Ethanamide
      const acetamida = createGraphFromSMILES('CC(=O)N');
      const resAc = nameMolecularGraph(acetamida);
      expect(resAc.iupacName2013).toBe('etanamida');
      expect(resAc.primaryFunction).toBe('amida');
      expect(resAc.formula).toBe('C2H5NO');
    });

    it('names acyl halides and anhydrides', () => {
      // Ethanoyl chloride / Acetyl chloride
      const cloretoAc = createGraphFromSMILES('CC(=O)Cl');
      const resCl = nameMolecularGraph(cloretoAc);
      expect(resCl.iupacName2013).toBe('cloreto de etanoíla');
      expect(resCl.primaryFunction).toBe('haleto_acila');
      expect(resCl.formula).toBe('C2H3ClO');

      // Ethanoic anhydride / Acetic anhydride
      const anidrido = createGraphFromSMILES('CC(=O)OC(=O)C');
      const resAn = nameMolecularGraph(anidrido);
      expect(resAn.iupacName2013).toBe('anidrido etanoico');
      expect(resAn.primaryFunction).toBe('anidrido');
      expect(resAn.formula).toBe('C4H6O3');
    });
  });

  describe('4. Amines, Ethers, Nitriles, Halides, Nitro Compounds', () => {
    it('names primary and secondary amines', () => {
      // Methanamine
      const metanamina = createGraphFromSMILES('CN');
      const resMet = nameMolecularGraph(metanamina);
      expect(resMet.iupacName2013).toBe('metanamina');
      expect(resMet.primaryFunction).toBe('amina');
      expect(resMet.formula).toBe('CH5N');

      // Ethanamine
      const etanamina = createGraphFromSMILES('CCN');
      const resEt = nameMolecularGraph(etanamina);
      expect(resEt.iupacName2013).toBe('etanamina');
      expect(resEt.formula).toBe('C2H7N');

      // N-Methylethanamine (Golden Case 8)
      const nMetil = createGraphFromSMILES('CCNC');
      const resN = nameMolecularGraph(nMetil);
      expect(resN.iupacName2013).toBe('N-metiletanamina');
      expect(resN.iupacName1993).toBe('N-metiletanamina');
      expect(resN.primaryFunction).toBe('amina');
      expect(resN.formula).toBe('C3H9N');
    });

    it('names ethers', () => {
      // Methoxyethane
      const metoxietano = createGraphFromSMILES('COCC');
      const resMet = nameMolecularGraph(metoxietano);
      expect(resMet.iupacName2013).toBe('metoxietano');
      expect(resMet.primaryFunction).toBe('eter');
      expect(resMet.formula).toBe('C3H8O');

      // Ethoxyethane
      const etoxietano = createGraphFromSMILES('CCOCC');
      const resEt = nameMolecularGraph(etoxietano);
      expect(resEt.iupacName2013).toBe('etoxietano');
      expect(resEt.primaryFunction).toBe('eter');
      expect(resEt.formula).toBe('C4H10O');
    });

    it('names nitriles', () => {
      // Ethanenitrile / Acetonitrile
      const acn = createGraphFromSMILES('CC#N');
      const resAcn = nameMolecularGraph(acn);
      expect(resAcn.iupacName2013).toBe('etanonitrila');
      expect(resAcn.primaryFunction).toBe('nitrila');
      expect(resAcn.formula).toBe('C2H3N');

      // Propanenitrile
      const propanonitrila = createGraphFromSMILES('CCC#N');
      const resP = nameMolecularGraph(propanonitrila);
      expect(resP.iupacName2013).toBe('propanonitrila');
      expect(resP.formula).toBe('C3H5N');
    });

    it('names alkyl halides and nitro compounds as permanent prefixes', () => {
      // Chloromethane
      const cl = createGraphFromSMILES('CCl');
      const resCl = nameMolecularGraph(cl);
      expect(resCl.iupacName2013).toBe('clorometano');
      expect(resCl.primaryFunction).toBe('haleto_alquila');
      expect(resCl.formula).toBe('CH3Cl');

      // 2-Bromobutane
      const br = createGraphFromSMILES('CCC(Br)C');
      const resBr = nameMolecularGraph(br);
      expect(resBr.iupacName2013).toBe('2-bromobutano');
      expect(resBr.primaryFunction).toBe('haleto_alquila');
      expect(resBr.formula).toBe('C4H9Br');

      // Nitromethane
      const nitro = createGraphFromSMILES('C[N+](=O)[O-]');
      const resNit = nameMolecularGraph(nitro);
      expect(resNit.iupacName2013).toBe('nitrometano');
      expect(resNit.primaryFunction).toBe('nitrocomposto');
      expect(resNit.formula).toBe('CH3NO2');

      // 2-Chloro-1-nitropropane (Golden Case 9 - Permanent prefixes alphabetized)
      const case9 = createGraphFromSMILES('CC(Cl)C[N+](=O)[O-]');
      const res9 = nameMolecularGraph(case9);
      expect(res9.iupacName2013).toBe('2-cloro-1-nitropropano');
      expect(res9.iupacName1993).toBe('2-cloro-1-nitropropano');
      expect(res9.primaryFunction).toBe('haleto_alquila');
      expect(res9.secondaryFunctions).toEqual(['nitrocomposto']);
      expect(res9.formula).toBe('C3H6ClNO2');
    });
  });

  describe('5. Complex Polyfunctional Chaos Molecule (Golden Case 10)', () => {
    it('correctly perceives and names the 7-carbon polyfunctional chaos molecule', () => {
      // ácido 4-amino-5-(clorometil)-6-hidroxi-3-oxo-heptanoico
      // SMILES: CC(O)C(CCl)C(N)C(=O)CC(=O)O
      const chaos = createGraphFromSMILES('CC(O)C(CCl)C(N)C(=O)CC(=O)O');
      const resChaos = nameMolecularGraph(chaos);

      expect(resChaos.primaryFunction).toBe('acido_carboxilico');
      expect(resChaos.formula).toBe('C8H14ClNO4');
      expect(resChaos.iupacName2013).toBe('ácido 4-amino-5-(clorometil)-6-hidroxi-3-oxo-heptanoico');
      expect(resChaos.secondaryFunctions).toContain('cetona');
      expect(resChaos.secondaryFunctions).toContain('alcool');
      expect(resChaos.secondaryFunctions).toContain('amina');
      expect(resChaos.secondaryFunctions).toContain('haleto_alquila');
    });
  });

  describe('6. Programmatic MolecularGraph Builder and SMILES Serializer', () => {
    it('supports direct programmatic construction of MolecularGraph', () => {
      const g = new MolecularGraph();
      g.addAtom({ id: 'c1', element: 'C', charge: 0, implicitH: 0, x: 0, y: 0 });
      g.addAtom({ id: 'c2', element: 'C', charge: 0, implicitH: 0, x: 1, y: 0 });
      g.addAtom({ id: 'c3', element: 'C', charge: 0, implicitH: 0, x: 2, y: 0 });
      g.addBond({ id: 'b1', source: 'c1', target: 'c2', order: 1, style: 'solid' });
      g.addBond({ id: 'b2', source: 'c2', target: 'c3', order: 1, style: 'solid' });

      const res = nameMolecularGraph(g);
      expect(res.iupacName2013).toBe('propano');
      expect(res.formula).toBe('C3H8');
      expect(res.primaryFunction).toBe('hidrocarboneto');
    });

    it('serializes graphs to valid SMILES strings', () => {
      const g1 = createGraphFromSMILES('CCCC');
      const s1 = molecularGraphToSMILES(g1);
      expect(s1).toBeTruthy();
      expect(s1.replace(/\(|\)/g, '')).toContain('C');

      const g2 = createGraphFromSMILES('C1CCCCC1');
      const s2 = molecularGraphToSMILES(g2);
      expect(s2).toContain('1'); // Has ring closure digit
    });

    it('perceives rings correctly in SSSR', () => {
      const g = createGraphFromSMILES('C1CCCCC1');
      const rings = perceiveRingsAndAromaticity(g);
      expect(rings).toHaveLength(1);
      expect(rings[0].atomIds).toHaveLength(6);
      expect(rings[0].isAromatic).toBe(false);

      const benzene = createGraphFromSMILES('c1ccccc1');
      const bRings = perceiveRingsAndAromaticity(benzene);
      expect(bRings).toHaveLength(1);
      expect(bRings[0].isBenzene).toBe(true);
      expect(bRings[0].isAromatic).toBe(true);
    });
  });
});
