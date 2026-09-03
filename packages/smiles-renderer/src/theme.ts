/**
 * High-contrast atom color palettes and themes for QuímicaRush organic chemistry education.
 * Complies with IUPAC color-coding conventions while maximizing visual accessibility,
 * high-contrast clarity, and dark mode vibrancy.
 */

export const ATOM_PALETTE = {
  // Core heteroatoms
  oxygen: '#EF4444',     // Vibrant crimson/red
  nitrogen: '#3B82F6',   // Electric blue
  halogens: '#10B981',   // Emerald green
  fluorine: '#10B981',   // Halogen emerald green
  chlorine: '#10B981',   // Halogen emerald green
  bromine: '#10B981',    // Halogen emerald green
  iodine: '#10B981',     // Halogen emerald green
  sulfur: '#F59E0B',     // Bright amber
  phosphorus: '#F97316', // Orange
  boron: '#F472B6',      // Pink
  silicon: '#A855F7',    // Purple

  // Skeletal Carbon & Bonds
  carbonDark: '#F1F5F9',  // High-contrast slate/white (slate-100)
  carbonLight: '#0F172A', // High-contrast deep slate (slate-900)

  // Hydrogen
  hydrogenDark: '#94A3B8',  // Slate-400
  hydrogenLight: '#64748B', // Slate-500

  // Canvas Backgrounds
  backgroundDark: '#0B0F19',  // Deep obsidian
  backgroundLight: '#FFFFFF', // Pure white
  backgroundTransparent: 'transparent',
} as const;

export type AtomPalette = typeof ATOM_PALETTE;

/**
 * Interface matching SmilesDrawer's theme dictionary format.
 * All chemical symbol keys must be uppercase.
 */
export interface SmilesDrawerTheme {
  FOREGROUND: string;
  BACKGROUND: string;
  C: string;
  O: string;
  N: string;
  F: string;
  CL: string;
  BR: string;
  I: string;
  P: string;
  S: string;
  B: string;
  SI: string;
  H: string;
  [key: string]: string;
}

/**
 * Default dark theme:
 * Deep obsidian background with high-contrast slate/white bonds
 * and vibrant elemental highlights for high-engagement gaming.
 */
export const darkTheme: SmilesDrawerTheme = {
  FOREGROUND: ATOM_PALETTE.carbonDark,
  BACKGROUND: ATOM_PALETTE.backgroundDark,
  C: ATOM_PALETTE.carbonDark,
  O: ATOM_PALETTE.oxygen,
  N: ATOM_PALETTE.nitrogen,
  F: ATOM_PALETTE.fluorine,
  CL: ATOM_PALETTE.chlorine,
  BR: ATOM_PALETTE.bromine,
  I: ATOM_PALETTE.iodine,
  P: ATOM_PALETTE.phosphorus,
  S: ATOM_PALETTE.sulfur,
  B: ATOM_PALETTE.boron,
  SI: ATOM_PALETTE.silicon,
  H: ATOM_PALETTE.hydrogenDark,
};

/**
 * Light theme:
 * High-contrast dark bonds on white background with vibrant heteroatoms.
 */
export const lightTheme: SmilesDrawerTheme = {
  FOREGROUND: ATOM_PALETTE.carbonLight,
  BACKGROUND: ATOM_PALETTE.backgroundLight,
  C: ATOM_PALETTE.carbonLight,
  O: ATOM_PALETTE.oxygen,
  N: ATOM_PALETTE.nitrogen,
  F: ATOM_PALETTE.fluorine,
  CL: ATOM_PALETTE.chlorine,
  BR: ATOM_PALETTE.bromine,
  I: ATOM_PALETTE.iodine,
  P: ATOM_PALETTE.phosphorus,
  S: ATOM_PALETTE.sulfur,
  B: ATOM_PALETTE.boron,
  SI: ATOM_PALETTE.silicon,
  H: ATOM_PALETTE.hydrogenLight,
};

/**
 * Dark theme with transparent background for seamless HUD overlay.
 */
export const darkThemeTransparent: SmilesDrawerTheme = {
  ...darkTheme,
  BACKGROUND: ATOM_PALETTE.backgroundTransparent,
};

/**
 * Light theme with transparent background.
 */
export const lightThemeTransparent: SmilesDrawerTheme = {
  ...lightTheme,
  BACKGROUND: ATOM_PALETTE.backgroundTransparent,
};

export const defaultTheme = darkTheme;

export type ThemeName = 'dark' | 'light';

/**
 * SmilesDrawer drawer configuration options.
 */
export interface DrawerOptions {
  width: number;
  height: number;
  bondThickness?: number;
  bondLength?: number;
  shortBondLength?: number;
  bondSpacing?: number;
  atomVisualization?: 'default' | 'balls' | 'allballs';
  isomeric?: boolean;
  debug?: boolean;
  terminalCarbons?: boolean;
  explicitHydrogens?: boolean;
  overlapSensitivity?: number;
  overlapResolutionIterations?: number;
  compactDrawing?: boolean;
  fontSizeLarge?: number;
  fontSizeSmall?: number;
  padding?: number;
  themes?: {
    dark: SmilesDrawerTheme;
    light: SmilesDrawerTheme;
    [themeName: string]: SmilesDrawerTheme;
  };
  [key: string]: unknown;
}

/**
 * Creates tuned SmilesDrawer options with high-performance defaults (< 2ms render target).
 */
export function createDrawerOptions(overrides: Partial<DrawerOptions> = {}): DrawerOptions {
  const bondLength = overrides.bondLength ?? 30;
  return {
    width: overrides.width ?? 320,
    height: overrides.height ?? 240,
    bondThickness: overrides.bondThickness ?? 1.4,
    bondLength,
    shortBondLength: overrides.shortBondLength ?? 0.8,
    bondSpacing: overrides.bondSpacing ?? (0.17 * bondLength),
    atomVisualization: overrides.atomVisualization ?? 'default',
    isomeric: overrides.isomeric ?? true,
    debug: overrides.debug ?? false,
    terminalCarbons: overrides.terminalCarbons ?? true,
    explicitHydrogens: overrides.explicitHydrogens ?? false,
    overlapSensitivity: overrides.overlapSensitivity ?? 0.42,
    // Limit iterations to 1 for sub-2ms real-time responsiveness
    overlapResolutionIterations: overrides.overlapResolutionIterations ?? 1,
    compactDrawing: overrides.compactDrawing ?? false,
    fontSizeLarge: overrides.fontSizeLarge ?? 8,
    fontSizeSmall: overrides.fontSizeSmall ?? 4,
    padding: overrides.padding ?? 12,
    themes: {
      dark: darkTheme,
      light: lightTheme,
      ...(overrides.themes ?? {}),
    },
    ...overrides,
  };
}
