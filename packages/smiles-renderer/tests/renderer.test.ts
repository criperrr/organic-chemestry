import { describe, it, expect, beforeEach, vi } from 'vitest';
import SmilesDrawer from 'smiles-drawer';
import {
  ATOM_PALETTE,
  darkTheme,
  lightTheme,
  darkThemeTransparent,
  lightThemeTransparent,
  defaultTheme,
  createDrawerOptions,
  DrawerOptions,
} from '../src/theme';
import {
  HIGHLIGHT_COLORS,
  tagFunctionalGroup,
  cloneParseTree,
  getElementSymbol,
  SmilesParseNode,
} from '../src/highlight';
import { SmilesCanvas } from '../src/SmilesCanvas';

// Mock minimal DOM for canvas/SVG testing in Node environment
class MockCanvasContext {
  public font = '';
  public drawImage = vi.fn();
  public clearRect = vi.fn();
  public fillRect = vi.fn();
  public stroke = vi.fn();
  public fill = vi.fn();
  public measureText = vi.fn((_text: string) => ({ width: 12 }));
}

class MockCanvasElement {
  public width = 320;
  public height = 240;
  public context = new MockCanvasContext();
  public style: Record<string, string> = {};

  public getContext(type: string): MockCanvasContext | null {
    if (type === '2d') return this.context;
    return null;
  }
}

class MockSVGElement {
  public tagName: string;
  public attributes: Record<string, string> = {};
  public children: MockSVGElement[] = [];
  public style: Record<string, string> = {};

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  public setAttribute(k: string, v: string): void {
    this.attributes[k] = v;
  }

  public setAttributeNS(_ns: string | null, k: string, v: string): void {
    this.attributes[k] = v;
  }

  public appendChild(child: MockSVGElement): MockSVGElement {
    this.children.push(child);
    return child;
  }

  public removeChild(child: MockSVGElement): MockSVGElement {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    return child;
  }

  public get outerHTML(): string {
    return `<${this.tagName}></${this.tagName}>`;
  }
}

function setupMockDom(): () => void {
  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalImage = global.Image;
  const originalHTMLCanvasElement = global.HTMLCanvasElement;
  const originalSVGSVGElement = global.SVGSVGElement;
  const originalSVGElement = global.SVGElement;
  const originalElement = global.Element;

  const mockCanvas = new MockCanvasElement();

  global.HTMLCanvasElement = MockCanvasElement as unknown as typeof HTMLCanvasElement;
  global.SVGSVGElement = MockSVGElement as unknown as typeof SVGSVGElement;
  global.SVGElement = MockSVGElement as unknown as typeof SVGElement;
  global.Element = MockSVGElement as unknown as typeof Element;

  global.Image = class {
    public onload: (() => void) | null = null;
    private _src = '';
    set src(val: string) {
      this._src = val;
      if (this.onload) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    get src(): string {
      return this._src;
    }
  } as unknown as typeof Image;

  global.document = {
    createElementNS: (_ns: string, tag: string) => new MockSVGElement(tag),
    createElement: (tag: string) => {
      if (tag === 'canvas') return mockCanvas;
      return new MockSVGElement(tag);
    },
    createTextNode: (text: string) => ({ text }),
    getElementById: () => mockCanvas,
  } as unknown as Document;

  global.window = {
    HTMLCanvasElement: global.HTMLCanvasElement,
    Image: global.Image,
  } as unknown as Window & typeof globalThis;

  return () => {
    global.document = originalDocument;
    global.window = originalWindow;
    global.Image = originalImage;
    global.HTMLCanvasElement = originalHTMLCanvasElement;
    global.SVGSVGElement = originalSVGSVGElement;
    global.SVGElement = originalSVGElement;
    global.Element = originalElement;
  };
}

describe('Theme Definitions and Atom Palettes', () => {
  it('should define pedagogical high-contrast atom colors according to PRD', () => {
    expect(ATOM_PALETTE.oxygen).toBe('#EF4444');
    expect(ATOM_PALETTE.nitrogen).toBe('#3B82F6');
    expect(ATOM_PALETTE.halogens).toBe('#10B981');
    expect(ATOM_PALETTE.fluorine).toBe('#10B981');
    expect(ATOM_PALETTE.chlorine).toBe('#10B981');
    expect(ATOM_PALETTE.bromine).toBe('#10B981');
    expect(ATOM_PALETTE.iodine).toBe('#10B981');
    expect(ATOM_PALETTE.sulfur).toBe('#F59E0B');
    expect(ATOM_PALETTE.carbonDark).toBe('#F1F5F9');
    expect(ATOM_PALETTE.carbonLight).toBe('#0F172A');
    expect(ATOM_PALETTE.backgroundDark).toBe('#0B0F19');
    expect(ATOM_PALETTE.backgroundLight).toBe('#FFFFFF');
    expect(ATOM_PALETTE.backgroundTransparent).toBe('transparent');
  });

  it('should verify darkTheme has all required SmilesDrawer uppercase keys', () => {
    const requiredKeys = ['FOREGROUND', 'BACKGROUND', 'C', 'O', 'N', 'F', 'CL', 'BR', 'I', 'P', 'S', 'B', 'SI', 'H'];
    for (const key of requiredKeys) {
      expect(darkTheme).toHaveProperty(key);
      expect(typeof darkTheme[key]).toBe('string');
      expect(darkTheme[key].length).toBeGreaterThan(0);
    }
    expect(darkTheme.BACKGROUND).toBe('#0B0F19');
    expect(darkTheme.C).toBe('#F1F5F9');
    expect(darkTheme.O).toBe('#EF4444');
    expect(darkTheme.N).toBe('#3B82F6');
    expect(darkTheme.CL).toBe('#10B981');
    expect(darkTheme.S).toBe('#F59E0B');
  });

  it('should verify lightTheme has high-contrast dark carbon bonds on white background', () => {
    expect(lightTheme.BACKGROUND).toBe('#FFFFFF');
    expect(lightTheme.C).toBe('#0F172A');
    expect(lightTheme.FOREGROUND).toBe('#0F172A');
    expect(lightTheme.O).toBe('#EF4444');
    expect(lightTheme.N).toBe('#3B82F6');
    expect(lightTheme.F).toBe('#10B981');
    expect(lightTheme.S).toBe('#F59E0B');
  });

  it('should verify darkThemeTransparent and lightThemeTransparent set transparent background', () => {
    expect(darkThemeTransparent.BACKGROUND).toBe('transparent');
    expect(lightThemeTransparent.BACKGROUND).toBe('transparent');
    expect(darkThemeTransparent.O).toBe('#EF4444');
    expect(lightThemeTransparent.O).toBe('#EF4444');
  });

  it('should default to darkTheme', () => {
    expect(defaultTheme).toEqual(darkTheme);
  });
});

describe('SmilesDrawer Options and Initialization Logic', () => {
  it('should produce drawer options with high-performance defaults', () => {
    const opts = createDrawerOptions();
    expect(opts.width).toBe(320);
    expect(opts.height).toBe(240);
    expect(opts.overlapResolutionIterations).toBe(1);
    expect(opts.terminalCarbons).toBe(true);
    expect(opts.isomeric).toBe(true);
    expect(opts.themes?.dark).toEqual(darkTheme);
    expect(opts.themes?.light).toEqual(lightTheme);
  });

  it('should merge custom overrides into drawer options', () => {
    const opts = createDrawerOptions({
      width: 500,
      height: 400,
      bondThickness: 2.0,
      debug: true,
    });
    expect(opts.width).toBe(500);
    expect(opts.height).toBe(400);
    expect(opts.bondThickness).toBe(2.0);
    expect(opts.debug).toBe(true);
    expect(opts.themes?.dark).toEqual(darkTheme);
  });

  it('should initialize SmilesDrawer.Drawer successfully with created options', () => {
    const opts = createDrawerOptions({ width: 320, height: 240 });
    const drawer = new SmilesDrawer.Drawer(opts);
    expect(drawer).toBeDefined();
    expect(drawer.svgDrawer).toBeDefined();
    const svgOpts = drawer.svgDrawer.opts as DrawerOptions;
    expect(svgOpts.themes?.dark.O).toBe('#EF4444');
    expect(svgOpts.themes?.dark.N).toBe('#3B82F6');
  });

  it('should initialize SmilesDrawer.SvgDrawer successfully', () => {
    const opts = createDrawerOptions();
    const svgDrawer = new SmilesDrawer.SvgDrawer(opts);
    expect(svgDrawer).toBeDefined();
    const svgOpts = svgDrawer.opts as DrawerOptions;
    expect(svgOpts.width).toBe(320);
    expect(svgOpts.height).toBe(240);
  });
});

describe('Functional Group Identification and Tagging', () => {
  function parseTreeSync(smiles: string): SmilesParseNode {
    let result: SmilesParseNode | null = null;
    SmilesDrawer.parse(
      smiles,
      (tree) => {
        result = tree as unknown as SmilesParseNode;
      },
      (err) => {
        throw err;
      }
    );
    if (!result) throw new Error(`Failed to parse ${smiles}`);
    return result;
  }

  it('should identify carbonyl groups (C=O) in ketones, aldehydes, and acids', () => {
    const acetone = parseTreeSync('CC(=O)C');
    const resAcetone = tagFunctionalGroup(acetone, 'carbonyl');
    expect(resAcetone).not.toBeNull();
    expect(resAcetone?.count).toBe(1);
    expect(resAcetone?.color).toBe(HIGHLIGHT_COLORS.carbonyl);

    const aceticAcid = parseTreeSync('CC(=O)O');
    const resAcid = tagFunctionalGroup(aceticAcid, 'carbonyl');
    expect(resAcid).not.toBeNull();
    expect(resAcid?.count).toBe(1);

    const ethanol = parseTreeSync('CCO');
    const resEthanol = tagFunctionalGroup(ethanol, 'carbonyl');
    expect(resEthanol).toBeNull();
  });

  it('should identify nitrogen atoms in amines, amides, and heterocycles', () => {
    const ethylamine = parseTreeSync('CCN');
    const resAmine = tagFunctionalGroup(ethylamine, 'nitrogen');
    expect(resAmine).not.toBeNull();
    expect(resAmine?.count).toBe(1);
    expect(resAmine?.color).toBe(HIGHLIGHT_COLORS.nitrogen);

    const pyridine = parseTreeSync('c1ccncc1');
    const resPyr = tagFunctionalGroup(pyridine, 'nitrogen');
    expect(resPyr).not.toBeNull();
    expect(resPyr?.count).toBe(1);

    const benzene = parseTreeSync('c1ccccc1');
    const resBenzene = tagFunctionalGroup(benzene, 'nitrogen');
    expect(resBenzene).toBeNull();
  });

  it('should identify halogens (F, Cl, Br, I)', () => {
    const chloropropane = parseTreeSync('CC(Cl)C');
    const resCl = tagFunctionalGroup(chloropropane, 'halogen');
    expect(resCl).not.toBeNull();
    expect(resCl?.count).toBe(1);
    expect(resCl?.color).toBe(HIGHLIGHT_COLORS.halogen);

    const fluoro = parseTreeSync('CF');
    const resF = tagFunctionalGroup(fluoro, 'halogen');
    expect(resF?.count).toBe(1);

    const bromo = parseTreeSync('c1ccc(Br)cc1');
    const resBr = tagFunctionalGroup(bromo, 'halogen');
    expect(resBr?.count).toBe(1);

    const iodo = parseTreeSync('CI');
    const resI = tagFunctionalGroup(iodo, 'halogen');
    expect(resI?.count).toBe(1);

    const alkane = parseTreeSync('CCCC');
    expect(tagFunctionalGroup(alkane, 'halogen')).toBeNull();
  });

  it('should distinguish hydroxyl groups (-OH) from ethers (-O-)', () => {
    const ethanol = parseTreeSync('CCO');
    const resEthanol = tagFunctionalGroup(ethanol, 'hydroxyl');
    expect(resEthanol).not.toBeNull();
    expect(resEthanol?.count).toBe(1);
    expect(resEthanol?.color).toBe(HIGHLIGHT_COLORS.hydroxyl);

    const phenol = parseTreeSync('c1ccccc1O');
    const resPhenol = tagFunctionalGroup(phenol, 'hydroxyl');
    expect(resPhenol).not.toBeNull();
    expect(resPhenol?.count).toBe(1);

    // Diethyl ether C-C-O-C-C has an ether bridge, NOT a hydroxyl group
    const ether = parseTreeSync('CCOCC');
    const resEther = tagFunctionalGroup(ether, 'hydroxyl');
    expect(resEther).toBeNull();

    // Dimethyl ether C-O-C
    const dimethylEther = parseTreeSync('COC');
    expect(tagFunctionalGroup(dimethylEther, 'hydroxyl')).toBeNull();
  });

  it('should return null when group is none', () => {
    const molecule = parseTreeSync('CC(=O)O');
    expect(tagFunctionalGroup(molecule, 'none')).toBeNull();
  });

  it('should clone parse tree deeply without modifying original tree', () => {
    const original = parseTreeSync('CC(=O)O');
    const clone = cloneParseTree(original);
    tagFunctionalGroup(clone, 'carbonyl', 777);

    // Original atom object shouldn't have class 777
    const origBranch = original.next?.branches?.[0];
    const origClass = typeof origBranch?.atom === 'object' ? origBranch.atom?.class : undefined;
    expect(origClass).toBeUndefined();

    // Clone should have class 777
    const cloneBranch = clone.next?.branches?.[0];
    const cloneClass = typeof cloneBranch?.atom === 'object' ? cloneBranch.atom?.class : undefined;
    expect(cloneClass).toBe(777);
  });

  it('should extract correct element symbol from string or object atom representation', () => {
    expect(getElementSymbol('C')).toBe('C');
    expect(getElementSymbol('cl')).toBe('CL');
    expect(getElementSymbol({ element: 'O' })).toBe('O');
    expect(getElementSymbol({ element: 'br' })).toBe('BR');
    expect(getElementSymbol(null)).toBe('');
    expect(getElementSymbol(undefined)).toBe('');
  });
});

describe('SMILES Parsing Performance and Resilience', () => {
  const canonicalMolecules = [
    'CCO',                   // Ethanol (Alcohol)
    'CC(=O)O',               // Acetic acid (Carboxylic acid)
    'c1ccccc1',              // Benzene (Aromatic)
    'c1ccc(O)cc1',           // Phenol
    'CC(=O)C',               // Acetone (Ketone)
    'CC=O',                  // Acetaldehyde (Aldehyde)
    'CCOC(=O)C',             // Ethyl acetate (Ester)
    'CCN',                   // Ethylamine (Amine)
    'CC(=O)N',               // Acetamide (Amide)
    'CC#N',                  // Acetonitrile (Nitrile)
    'CC[N+](=O)[O-]',        // Nitroethane (Nitro)
    'CC(Cl)C',               // 2-Chloropropane (Alkyl Halide)
    'CC(=O)Cl',              // Acetyl chloride (Acyl Halide)
    'CC(=O)OC(=O)C',         // Acetic anhydride (Anhydride)
    'C1CCCCC1',              // Cyclohexane (Cycloalkane)
    'C=C',                   // Ethene (Alkene)
    'C#C',                   // Ethyne (Alkyne)
    'C=CC=C',                // Butadiene (Diene)
    'C=CO',                  // Ethenol (Enol)
    'CCOCC',                 // Diethyl ether (Ether)
  ];

  it('should parse 100% of canonical functional group representations without errors', () => {
    for (const smi of canonicalMolecules) {
      let parsedTree: unknown = null;
      SmilesDrawer.parse(
        smi,
        (tree) => {
          parsedTree = tree;
        },
        (err) => {
          throw new Error(`Failed to parse ${smi}: ${err}`);
        }
      );
      expect(parsedTree).toBeDefined();
    }
  });

  it('should satisfy performance budget (< 2ms per molecule parse)', () => {
    // Warm-up
    SmilesDrawer.parse('CC(=O)O', () => {});

    const timings: number[] = [];
    for (const smi of canonicalMolecules) {
      const t0 = performance.now();
      SmilesDrawer.parse(smi, () => {
        const t1 = performance.now();
        timings.push(t1 - t0);
      });
    }

    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    // Each individual parse after warm-up should be sub-millisecond
    expect(avgTime).toBeLessThan(2.0);
  });

  it('should gracefully report errors on malformed SMILES strings without crashing', () => {
    const invalidSmiles = ['INVALID_XYZ', 'C(((', '[invalid]', '???', '123#'];

    for (const bad of invalidSmiles) {
      let errorReported = false;
      try {
        SmilesDrawer.parse(
          bad,
          () => {
            // Should not succeed
          },
          (err) => {
            errorReported = true;
            expect(err).toBeDefined();
          }
        );
      } catch (e) {
        errorReported = true;
        expect(e).toBeDefined();
      }
      expect(errorReported).toBe(true);
    }
  });
});

describe('Canvas and SVG Drawer Rendering Integration', () => {
  let restoreDom: () => void;

  beforeEach(() => {
    restoreDom = setupMockDom();
    return () => {
      restoreDom();
    };
  });

  it('should draw molecule to mock canvas using SmilesDrawer.Drawer', () => {
    const canvas = new MockCanvasElement();
    const opts = createDrawerOptions({ width: 320, height: 240 });
    const drawer = new SmilesDrawer.Drawer(opts);

    let parsedTree: unknown = null;
    SmilesDrawer.parse('CC(=O)O', (tree) => {
      parsedTree = tree;
    });

    expect(parsedTree).toBeDefined();
    expect(() => {
      drawer.draw(
        parsedTree as unknown as Parameters<typeof drawer.draw>[0],
        canvas as unknown as HTMLCanvasElement,
        'dark',
        false,
        []
      );
    }).not.toThrow();
  });

  it('should draw molecule with highlight halos to mock SVG', () => {
    const opts = createDrawerOptions({ width: 320, height: 240 });
    const svgDrawer = new SmilesDrawer.SvgDrawer(opts);
    const svg = new MockSVGElement('svg');

    let parsedTree: SmilesParseNode | null = null;
    SmilesDrawer.parse('CC(=O)O', (tree) => {
      parsedTree = cloneParseTree(tree as unknown as SmilesParseNode);
    });

    expect(parsedTree).not.toBeNull();
    if (!parsedTree) return;

    const highlight = tagFunctionalGroup(parsedTree, 'carbonyl');
    expect(highlight).not.toBeNull();

    expect(() => {
      svgDrawer.draw(
        parsedTree as unknown as Parameters<typeof svgDrawer.draw>[0],
        svg as unknown as SVGSVGElement,
        'dark',
        null,
        false,
        [[highlight!.classId, highlight!.color]]
      );
    }).not.toThrow();
  });

  it('should verify SmilesCanvas component is exported and has valid signature', () => {
    expect(SmilesCanvas).toBeDefined();
    expect(['function', 'object']).toContain(typeof SmilesCanvas);
  });
});
