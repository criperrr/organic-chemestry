/**
 * @quimicarush/smiles-renderer
 *
 * High-performance SmilesDrawer 2.x React wrapper with high-contrast
 * chemistry palettes and educational functional group highlighting.
 */

export { SmilesCanvas } from './SmilesCanvas';
export type { SmilesCanvasProps } from './SmilesCanvas';

export {
  ATOM_PALETTE,
  darkTheme,
  lightTheme,
  darkThemeTransparent,
  lightThemeTransparent,
  defaultTheme,
  createDrawerOptions,
} from './theme';

export type {
  AtomPalette,
  SmilesDrawerTheme,
  ThemeName,
  DrawerOptions,
} from './theme';

export {
  HIGHLIGHT_COLORS,
  tagFunctionalGroup,
  cloneParseTree,
  getElementSymbol,
} from './highlight';

export type {
  HighlightGroup,
  SmilesParseNode,
  SmilesAtomData,
  HighlightResult,
} from './highlight';
