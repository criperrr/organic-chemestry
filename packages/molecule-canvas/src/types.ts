import type {
  AtomElement,
  BondOrder,
  BondStyle,
  AtomNode,
  BondEdge,
  MolecularGraphData,
} from '@quimicarush/chemistry-core';

export type { AtomElement, BondOrder, BondStyle, AtomNode, BondEdge, MolecularGraphData };

export type CanvasTool =
  | 'bond'
  | 'element'
  | 'functional_group'
  | 'ring'
  | 'eraser'
  | 'pan';

export type RingTemplateType =
  | 'benzene'
  | 'cyclopropane'
  | 'cyclobutane'
  | 'cyclopentane'
  | 'cyclohexane';

export type FunctionalGroupType =
  | '-OH'
  | '=O'
  | '-COOH'
  | '-NH2'
  | '-NO2'
  | '-OCH3'
  | '-C#N'
  | '-CH3'
  | '-CH2CH3'
  | '-CH(CH3)2'
  | '-C(CH3)3'
  | '-C6H5';

export interface ViewTransform {
  zoom: number;
  panX: number;
  panY: number;
}

export interface DragBondState {
  sourceAtomId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  snappedX: number;
  snappedY: number;
  targetAtomId: string | null;
}

/**
 * Live snapshot of the editor, pushed to the host on every change so an external
 * toolbar can stay in sync without owning the canvas state.
 */
export interface SkeletalCanvasState {
  tool: CanvasTool;
  element: AtomElement;
  group: FunctionalGroupType;
  ring: RingTemplateType;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  atomCount: number;
  bondCount: number;
  formula: string;
}

/** Imperative handle for hosts that render their own chrome. */
export interface SkeletalCanvasHandle {
  setTool: (tool: CanvasTool) => void;
  setElement: (element: AtomElement) => void;
  setGroup: (group: FunctionalGroupType) => void;
  setRing: (ring: RingTemplateType) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  recenter: () => void;
  zoomBy: (factor: number) => void;
  resetZoom: () => void;
  loadGraph: (graph: MolecularGraphData) => void;
}

export interface SkeletalCanvasProps {
  /** Reports editor state so an external toolbar can mirror it. */
  onStateChange?: (state: SkeletalCanvasState) => void;

  /**
   * Initial molecular graph to load into the canvas
   */
  initialGraph?: MolecularGraphData;

  /**
   * Callback fired whenever the molecular graph changes (atoms/bonds added, modified, removed)
   */
  onGraphChange?: (graph: MolecularGraphData) => void;

  /**
   * Additional CSS classes for the outer container
   */
  className?: string;

  /**
   * Canvas height (default: 480px or 100%)
   */
  height?: number | string;

  /**
   * Read-only inspection mode (disables editing controls)
   */
  readOnly?: boolean;

  /**
   * Whether to show the integrated toolbar (defaults to true)
   */
  showToolbar?: boolean;

  /**
   * Quick export or external action callbacks
   */
  onSendToArcade?: (graph: MolecularGraphData) => void;
}
