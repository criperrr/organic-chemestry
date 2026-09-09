import { findStrandedAtoms } from './fragments.js';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  PenLine,
  Atom as AtomIcon,
  Sparkles,
  Hexagon,
  Eraser,
  Undo2,
  Redo2,
  AlertTriangle,
  Crosshair,
  Trash2,
  Hand,
  ZoomIn,
  ZoomOut,
  Info,
  ArrowRight,
} from 'lucide-react';
import type {
  AtomElement,
  AtomNode,
  BondEdge,
  BondOrder,
  MolecularGraphData,
  CanvasTool,
  RingTemplateType,
  FunctionalGroupType,
  ViewTransform,
  DragBondState,
  SkeletalCanvasProps,
  SkeletalCanvasState,
  SkeletalCanvasHandle,
} from './types.js';
import {
  ELEMENT_OPTIONS,
  FUNCTIONAL_GROUPS,
  RING_TEMPLATES,
} from './catalog.js';
import { FragmentPreview, previewGroup, previewRing } from './FragmentPreview.js';
import {
  BOND_LENGTH,
  SNAP_RADIUS,
  getSnappedBondPoint,
  findNearestAtom,
  findNearestBond,
  findBestAttachmentAngle,
  createRingTemplate,
  buildSubstituentGroup,
  generateUniqueId,
  getGraphBounds,
} from './geometry.js';
import {
  recalculateAllValences,
  getAtomDisplayLabel,
  computeHillFormula,
  ELEMENT_COLORS,
} from './valence.js';
import { haptics } from './haptics.js';
import { soundSynth } from '@quimicarush/gamification-engine';

/**
 * Creates an initial ethanol molecule (CH3-CH2-OH) centered around (240, 200)
 */
function createDefaultInitialGraph(): MolecularGraphData {
  const c1Id = generateUniqueId('c');
  const c2Id = generateUniqueId('c');
  const oId = generateUniqueId('o');

  const atoms: AtomNode[] = [
    { id: c1Id, element: 'C', x: 200, y: 220, charge: 0, implicitH: 3 },
    { id: c2Id, element: 'C', x: 238, y: 198, charge: 0, implicitH: 2 },
    { id: oId, element: 'O', x: 276, y: 220, charge: 0, implicitH: 1 },
  ];

  const bonds: BondEdge[] = [
    { id: generateUniqueId('b'), source: c1Id, target: c2Id, order: 1 },
    { id: generateUniqueId('b'), source: c2Id, target: oId, order: 1 },
  ];

  return recalculateAllValences({ atoms, bonds });
}

/**
 * Renders a molecular formula with its counts as subscripts.
 *
 * In a monospace face at this weight, the "O" of C4H12O is indistinguishable
 * from a zero — a chemistry app cannot leave "C4H120" on screen. Subscripting
 * the numbers separates the two by shape and position, not by glyph.
 */
const FormulaText: React.FC<{ formula: string }> = ({ formula }) => (
  <>
    {formula.split(/(\d+)/).map((part, i) =>
      /^\d+$/.test(part) ? (
        <sub key={i} className="text-[0.7em] leading-none align-baseline relative -bottom-[0.15em]">
          {part}
        </sub>
      ) : (
        <span key={i}>{part}</span>
      )
    )}
  </>
);

export const SkeletalCanvas = forwardRef<SkeletalCanvasHandle, SkeletalCanvasProps>(function
SkeletalCanvas(
  {
    initialGraph,
    onGraphChange,
    onStateChange,
    className = '',
    height = 520,
    readOnly = false,
    showToolbar = true,
    onSendToArcade,
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Tool & Sub-options
  const [activeTool, setActiveTool] = useState<CanvasTool>('bond');
  const [selectedElement, setSelectedElement] = useState<AtomElement>('C');
  const [selectedGroup, setSelectedGroup] = useState<FunctionalGroupType>('-OH');
  const [selectedRing, setSelectedRing] = useState<RingTemplateType>('benzene');

  // Selected atom for property edits or attachments
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
  const [hoveredBondId, setHoveredBondId] = useState<string | null>(null);

  // Viewport transform (Pan & Zoom)
  const [transform, setTransform] = useState<ViewTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const transformRef = useRef<ViewTransform>({ zoom: 1, panX: 0, panY: 0 });
  const panStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number } | null>(null);
  const spacePressedRef = useRef(false);

  // Drag-to-draw state for bonds
  const [dragBond, setDragBond] = useState<DragBondState | null>(null);

  // Ghost ring preview when stamping
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number } | null>(null);

  // Molecular Graph with Undo / Redo history
  const [history, setHistory] = useState<MolecularGraphData[]>(() => {
    const startGraph = initialGraph ? recalculateAllValences(initialGraph) : createDefaultInitialGraph();
    return [startGraph];
  });
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentGraph = history[historyIndex] ?? { atoms: [], bonds: [] };

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Degree count map for fast skeletal atom rendering
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const bond of currentGraph.bonds) {
      map.set(bond.source, (map.get(bond.source) ?? 0) + 1);
      map.set(bond.target, (map.get(bond.target) ?? 0) + 1);
    }
    return map;
  }, [currentGraph.bonds]);

  // Atom lookup map
  const atomMap = useMemo(() => {
    return new Map(currentGraph.atoms.map((a) => [a.id, a]));
  }, [currentGraph.atoms]);

  // Live Hill Formula
  const molecularFormula = useMemo(() => {
    return computeHillFormula(currentGraph);
  }, [currentGraph]);

  // Commit new graph state to history & fire callback
  const commitGraph = useCallback(
    (newGraph: MolecularGraphData, playSound: boolean = true) => {
      const balanced = recalculateAllValences(newGraph);
      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyIndex + 1);
        nextHistory.push(balanced);
        // Limit history to 50 entries
        if (nextHistory.length > 50) nextHistory.shift();
        return nextHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));

      if (playSound) {
        soundSynth.playSnap();
        haptics.tap();
      }

      onGraphChange?.(balanced);
    },
    [historyIndex, onGraphChange]
  );

  // Desfazer (Undo)
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const restored = history[nextIdx]!;
      setSelectedAtomId(null);
      soundSynth.playClick();
      haptics.light();
      onGraphChange?.(restored);
    }
  }, [historyIndex, history, onGraphChange]);

  // Refazer (Redo)
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const restored = history[nextIdx]!;
      setSelectedAtomId(null);
      soundSynth.playClick();
      haptics.light();
      onGraphChange?.(restored);
    }
  }, [historyIndex, history, onGraphChange]);

  // Centralizar (Recenter graph in canvas)
  /** Loose atoms, flagged on canvas and in the top bar. See findStrandedAtoms. */
  const strandedAtomIds = useMemo(() => findStrandedAtoms(currentGraph), [currentGraph]);

  const handleRecenter = useCallback(() => {
    if (!svgRef.current || currentGraph.atoms.length === 0) {
      setTransform({ zoom: 1, panX: 0, panY: 0 });
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const bounds = getGraphBounds(currentGraph.atoms);

    const padding = 80;
    const availableW = Math.max(100, rect.width - padding * 2);
    const availableH = Math.max(100, rect.height - padding * 2);

    const scaleX = availableW / bounds.width;
    const scaleY = availableH / bounds.height;
    const fitZoom = Math.min(1.6, Math.max(0.6, Math.min(scaleX, scaleY)));

    const canvasCenterX = rect.width / 2;
    const canvasCenterY = rect.height / 2;

    const panX = canvasCenterX - bounds.centerX * fitZoom;
    const panY = canvasCenterY - bounds.centerY * fitZoom;

    setTransform({ zoom: fitZoom, panX, panY });
    soundSynth.playClick();
    haptics.tap();
  }, [currentGraph.atoms]);

  // Limpar Tela (Clear canvas)
  const handleClear = useCallback(() => {
    if (currentGraph.atoms.length === 0) return;
    commitGraph({ atoms: [], bonds: [] });
    setSelectedAtomId(null);
  }, [currentGraph.atoms.length, commitGraph]);

  // Transform screen client (x, y) to SVG world coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!svgRef.current) return { x: clientX, y: clientY };
      const rect = svgRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      return {
        x: Math.round((localX - transform.panX) / transform.zoom),
        y: Math.round((localY - transform.panY) / transform.zoom),
      };
    },
    [transform]
  );

  /** Applies a multiplicative zoom keeping the point under the cursor fixed. */
  const zoomAtPoint = useCallback((factor: number, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const anchorX = clientX - rect.left;
    const anchorY = clientY - rect.top;

    setTransform((prev) => {
      const nextZoom = Math.min(4.0, Math.max(0.25, prev.zoom * factor));
      if (nextZoom === prev.zoom) return prev;
      const ratio = nextZoom / prev.zoom;
      return {
        zoom: nextZoom,
        panX: anchorX - (anchorX - prev.panX) * ratio,
        panY: anchorY - (anchorY - prev.panY) * ratio,
      };
    });
  }, []);

  /**
   * Trackpad and wheel input.
   *
   * Browsers report a trackpad pinch as a wheel event with `ctrlKey` forced on —
   * that is the only reliable way to tell a pinch from a two-finger scroll, and
   * it is why the two gestures are split here rather than both zooming:
   *
   *   - pinch (ctrlKey)      -> zoom around the fingers
   *   - two-finger scroll    -> pan on both axes, like every canvas app
   *   - shift + scroll       -> force horizontal pan (mouse-wheel users)
   *   - cmd/ctrl + wheel     -> zoom, for mice with a single wheel
   *
   * The listener is attached natively with `passive: false`; React's synthetic
   * wheel handler is passive, so `preventDefault` there cannot stop the page
   * from scrolling behind the canvas.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      // Line and page deltas must be normalised to pixels or a mouse wheel
      // moves the canvas by a couple of pixels while a trackpad flies.
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      const deltaX = event.deltaX * scale;
      const deltaY = event.deltaY * scale;

      if (event.ctrlKey || event.metaKey) {
        // Pinch: exponential mapping keeps the gesture smooth at any speed.
        zoomAtPoint(Math.exp(-deltaY * 0.01), event.clientX, event.clientY);
        return;
      }

      setTransform((prev) => ({
        ...prev,
        panX: prev.panX - (event.shiftKey ? deltaY : deltaX),
        panY: prev.panY - (event.shiftKey ? 0 : deltaY),
      }));
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAtPoint]);

  // ------------------------------------------------------------------------
  // Host integration: imperative handle + state mirror
  //
  // The Molecule Studio hides the built-in chrome and draws its own floating
  // toolbar, so it needs to drive the tools and read the editor state without
  // owning it.
  // ------------------------------------------------------------------------
  useImperativeHandle(
    ref,
    () => ({
      setTool: (tool) => setActiveTool(tool),
      setElement: (element) => setSelectedElement(element),
      setGroup: (group) => setSelectedGroup(group),
      setRing: (ringTemplate) => setSelectedRing(ringTemplate),
      undo: handleUndo,
      redo: handleRedo,
      clear: handleClear,
      recenter: handleRecenter,
      zoomBy: (factor) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        zoomAtPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
      },
      resetZoom: () => setTransform({ zoom: 1, panX: 0, panY: 0 }),
      loadGraph: (graph) => commitGraph(graph, false),
    }),
    [handleUndo, handleRedo, handleClear, handleRecenter, zoomAtPoint, commitGraph]
  );

  const editorState: SkeletalCanvasState = useMemo(
    () => ({
      tool: activeTool,
      element: selectedElement,
      group: selectedGroup,
      ring: selectedRing,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      zoom: transform.zoom,
      atomCount: currentGraph.atoms.length,
      bondCount: currentGraph.bonds.length,
      formula: molecularFormula,
    }),
    [
      activeTool,
      selectedElement,
      selectedGroup,
      selectedRing,
      historyIndex,
      history.length,
      transform.zoom,
      currentGraph.atoms.length,
      currentGraph.bonds.length,
      molecularFormula,
    ]
  );

  useEffect(() => {
    onStateChange?.(editorState);
  }, [editorState, onStateChange]);

  /**
   * Safari on macOS emits its own pinch gestures instead of ctrl+wheel, so the
   * non-standard gesture events are handled too. Chrome ignores them.
   */
  useEffect(() => {
    const svg = svgRef.current as (SVGSVGElement & Record<string, unknown>) | null;
    if (!svg) return undefined;

    let gestureStartZoom = 1;
    let anchor = { x: 0, y: 0 };

    const onGestureStart = (event: Event) => {
      event.preventDefault();
      const gesture = event as Event & { clientX: number; clientY: number };
      gestureStartZoom = transformRef.current.zoom;
      anchor = { x: gesture.clientX, y: gesture.clientY };
    };

    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as Event & { scale: number };
      const target = gestureStartZoom * gesture.scale;
      const factor = target / transformRef.current.zoom;
      if (Number.isFinite(factor) && factor > 0) {
        zoomAtPoint(factor, anchor.x, anchor.y);
      }
    };

    const prevent = (event: Event) => event.preventDefault();

    svg.addEventListener('gesturestart', onGestureStart as EventListener);
    svg.addEventListener('gesturechange', onGestureChange as EventListener);
    svg.addEventListener('gestureend', prevent);
    return () => {
      svg.removeEventListener('gesturestart', onGestureStart as EventListener);
      svg.removeEventListener('gesturechange', onGestureChange as EventListener);
      svg.removeEventListener('gestureend', prevent);
    };
  }, [zoomAtPoint]);

  // Cycle bond order: 1 -> 2 -> 3 -> 1
  const cycleBondOrder = useCallback(
    (bondId: string) => {
      if (readOnly) return;
      const targetBond = currentGraph.bonds.find((b) => b.id === bondId);
      if (!targetBond) return;

      const nextOrder: BondOrder = ((targetBond.order % 3) + 1) as BondOrder;
      const updatedBonds = currentGraph.bonds.map((b) =>
        b.id === bondId ? { ...b, order: nextOrder } : b
      );

      commitGraph({
        atoms: currentGraph.atoms,
        bonds: updatedBonds,
      });
    },
    [readOnly, currentGraph, commitGraph]
  );

  // Convert atom's element
  const changeAtomElement = useCallback(
    (atomId: string, element: AtomElement) => {
      if (readOnly) return;
      const targetAtom = currentGraph.atoms.find((a) => a.id === atomId);
      if (!targetAtom) return;

      const updated = currentGraph.atoms.map((a) =>
        a.id === atomId ? { ...a, element } : a
      );

      commitGraph({
        atoms: updated,
        bonds: currentGraph.bonds,
      });
    },
    [readOnly, currentGraph, commitGraph]
  );

  // Attach functional group or alkyl radical to atom
  const attachGroupToAtom = useCallback(
    (atomId: string, groupType: FunctionalGroupType) => {
      if (readOnly) return;
      const anchorAtom = currentGraph.atoms.find((a) => a.id === atomId);
      if (!anchorAtom) return;

      const angleRad = findBestAttachmentAngle(atomId, currentGraph);
      const { atoms: newAtoms, bonds: newBonds } = buildSubstituentGroup(
        groupType,
        anchorAtom,
        angleRad,
        BOND_LENGTH
      );

      commitGraph({
        atoms: [...currentGraph.atoms, ...newAtoms],
        bonds: [...currentGraph.bonds, ...newBonds],
      });
    },
    [readOnly, currentGraph, commitGraph]
  );

  // Drop or attach a ring template
  const stampRing = useCallback(
    (ringType: RingTemplateType, anchorAtomId?: string, dropCenter?: { x: number; y: number }) => {
      if (readOnly) return;

      if (anchorAtomId) {
        // Attach ring to existing atom via single bond
        const anchor = currentGraph.atoms.find((a) => a.id === anchorAtomId);
        if (!anchor) return;

        const angle = findBestAttachmentAngle(anchorAtomId, currentGraph);
        const ringDist = BOND_LENGTH + BOND_LENGTH;
        const centerX = anchor.x + ringDist * Math.cos(angle);
        const centerY = anchor.y + ringDist * Math.sin(angle);

        const ring = createRingTemplate(ringType, { x: centerX, y: centerY }, BOND_LENGTH);
        // Find nearest ring atom to anchor
        let closestAtom = ring.atoms[0]!;
        let minDSq = Infinity;
        for (const rAtom of ring.atoms) {
          const dSq = (rAtom.x - anchor.x) ** 2 + (rAtom.y - anchor.y) ** 2;
          if (dSq < minDSq) {
            minDSq = dSq;
            closestAtom = rAtom;
          }
        }

        const connectBond: BondEdge = {
          id: generateUniqueId('b'),
          source: anchor.id,
          target: closestAtom.id,
          order: 1,
        };

        commitGraph({
          atoms: [...currentGraph.atoms, ...ring.atoms],
          bonds: [...currentGraph.bonds, ...ring.bonds, connectBond],
        });
      } else if (dropCenter) {
        // Drop ring on free canvas
        const ring = createRingTemplate(ringType, dropCenter, BOND_LENGTH);
        commitGraph({
          atoms: [...currentGraph.atoms, ...ring.atoms],
          bonds: [...currentGraph.bonds, ...ring.bonds],
        });
      }
    },
    [readOnly, currentGraph, commitGraph]
  );

  // Delete atom and all incident bonds
  const deleteAtom = useCallback(
    (atomId: string) => {
      if (readOnly) return;
      const remainingAtoms = currentGraph.atoms.filter((a) => a.id !== atomId);
      const remainingBonds = currentGraph.bonds.filter(
        (b) => b.source !== atomId && b.target !== atomId
      );

      if (selectedAtomId === atomId) setSelectedAtomId(null);
      commitGraph({ atoms: remainingAtoms, bonds: remainingBonds });
    },
    [readOnly, currentGraph, selectedAtomId, commitGraph]
  );

  // Delete bond
  const deleteBond = useCallback(
    (bondId: string) => {
      if (readOnly) return;
      const remainingBonds = currentGraph.bonds.filter((b) => b.id !== bondId);
      commitGraph({ atoms: currentGraph.atoms, bonds: remainingBonds });
    },
    [readOnly, currentGraph, commitGraph]
  );

  // Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (readOnly) return;

    // Middle click, Pan tool, or Space key activates panning
    if (e.button === 1 || activeTool === 'pan' || spacePressedRef.current) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialPanX: transform.panX,
        initialPanY: transform.panY,
      };
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    if (e.button !== 0) return; // Only left-click from here

    const worldPos = screenToWorld(e.clientX, e.clientY);
    const clickedAtom = findNearestAtom(worldPos.x, worldPos.y, currentGraph.atoms, 18);
    const clickedBond = !clickedAtom
      ? findNearestBond(worldPos.x, worldPos.y, currentGraph, 14)
      : null;

    // Tool 1: Eraser Tool
    if (activeTool === 'eraser') {
      if (clickedAtom) {
        deleteAtom(clickedAtom.id);
        return;
      }
      if (clickedBond) {
        deleteBond(clickedBond.id);
        return;
      }
      return;
    }

    // Tool 2: Element Converter Tool
    if (activeTool === 'element') {
      if (clickedAtom) {
        changeAtomElement(clickedAtom.id, selectedElement);
        setSelectedAtomId(clickedAtom.id);
      }
      return;
    }

    // Tool 3: Functional Group Attachment Tool
    if (activeTool === 'functional_group') {
      if (clickedAtom) {
        attachGroupToAtom(clickedAtom.id, selectedGroup);
        setSelectedAtomId(clickedAtom.id);
      }
      return;
    }

    // Tool 4: Ring Template Stamping Tool
    if (activeTool === 'ring') {
      if (clickedAtom) {
        stampRing(selectedRing, clickedAtom.id);
      } else {
        stampRing(selectedRing, undefined, worldPos);
      }
      return;
    }

    // Tool 5: Draw Bond Tool
    if (activeTool === 'bond') {
      if (clickedBond) {
        // Clicking existing bond cycles its order: 1 -> 2 -> 3 -> 1
        cycleBondOrder(clickedBond.id);
        return;
      }

      if (clickedAtom) {
        // Start dragging a bond from this atom
        setSelectedAtomId(clickedAtom.id);
        setDragBond({
          sourceAtomId: clickedAtom.id,
          startX: clickedAtom.x,
          startY: clickedAtom.y,
          currentX: clickedAtom.x,
          currentY: clickedAtom.y,
          snappedX: clickedAtom.x,
          snappedY: clickedAtom.y,
          targetAtomId: null,
        });
        (e.target as Element).setPointerCapture?.(e.pointerId);
        return;
      }

      // Clicked on empty canvas in Draw Bond mode:
      if (currentGraph.atoms.length === 0) {
        // First atom on empty canvas!
        const newAtom: AtomNode = {
          id: generateUniqueId('c'),
          element: 'C',
          x: worldPos.x,
          y: worldPos.y,
          charge: 0,
          implicitH: 4,
        };
        commitGraph({ atoms: [newAtom], bonds: [] });
        setSelectedAtomId(newAtom.id);
      } else if (selectedAtomId) {
        // If an atom was selected, create a snapped bond towards the clicked position
        const anchor = currentGraph.atoms.find((a) => a.id === selectedAtomId);
        if (anchor) {
          const snapped = getSnappedBondPoint(anchor.x, anchor.y, worldPos.x, worldPos.y, BOND_LENGTH);
          const newAtom: AtomNode = {
            id: generateUniqueId('c'),
            element: 'C',
            x: snapped.x,
            y: snapped.y,
            charge: 0,
            implicitH: 3,
          };
          const newBond: BondEdge = {
            id: generateUniqueId('b'),
            source: anchor.id,
            target: newAtom.id,
            order: 1,
          };
          commitGraph({
            atoms: [...currentGraph.atoms, newAtom],
            bonds: [...currentGraph.bonds, newBond],
          });
          setSelectedAtomId(newAtom.id);
        }
      } else {
        // Start an isolated carbon atom
        const newAtom: AtomNode = {
          id: generateUniqueId('c'),
          element: 'C',
          x: worldPos.x,
          y: worldPos.y,
          charge: 0,
          implicitH: 4,
        };
        commitGraph({ atoms: [...currentGraph.atoms, newAtom], bonds: currentGraph.bonds });
        setSelectedAtomId(newAtom.id);
      }
    }
  };

  // Pointer Move handler
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos(worldPos);

    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTransform((prev) => ({
        ...prev,
        panX: panStartRef.current!.initialPanX + dx,
        panY: panStartRef.current!.initialPanY + dy,
      }));
      return;
    }

    if (dragBond) {
      // Check if cursor is near another atom for target snapping
      const nearbyTarget = findNearestAtom(
        worldPos.x,
        worldPos.y,
        currentGraph.atoms,
        SNAP_RADIUS,
        dragBond.sourceAtomId
      );

      if (nearbyTarget) {
        setDragBond({
          ...dragBond,
          currentX: worldPos.x,
          currentY: worldPos.y,
          snappedX: nearbyTarget.x,
          snappedY: nearbyTarget.y,
          targetAtomId: nearbyTarget.id,
        });
      } else {
        // Angle-snap to 30° multiple
        const snapped = getSnappedBondPoint(
          dragBond.startX,
          dragBond.startY,
          worldPos.x,
          worldPos.y,
          BOND_LENGTH
        );

        setDragBond({
          ...dragBond,
          currentX: worldPos.x,
          currentY: worldPos.y,
          snappedX: snapped.x,
          snappedY: snapped.y,
          targetAtomId: null,
        });
      }
      return;
    }

    // Hover detection for interactive cursor styling
    const hoverAtom = findNearestAtom(worldPos.x, worldPos.y, currentGraph.atoms, 18);
    setHoveredAtomId(hoverAtom ? hoverAtom.id : null);

    if (!hoverAtom) {
      const hoverBond = findNearestBond(worldPos.x, worldPos.y, currentGraph, 14);
      setHoveredBondId(hoverBond ? hoverBond.id : null);
    } else {
      setHoveredBondId(null);
    }
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
      return;
    }

    if (dragBond) {
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}

      const dx = dragBond.currentX - dragBond.startX;
      const dy = dragBond.currentY - dragBond.startY;
      const draggedDist = Math.sqrt(dx * dx + dy * dy);

      if (dragBond.targetAtomId) {
        // Connect to existing target atom if no bond exists between them yet
        const existingBond = currentGraph.bonds.find(
          (b) =>
            (b.source === dragBond.sourceAtomId && b.target === dragBond.targetAtomId) ||
            (b.source === dragBond.targetAtomId && b.target === dragBond.sourceAtomId)
        );

        if (!existingBond) {
          const newBond: BondEdge = {
            id: generateUniqueId('b'),
            source: dragBond.sourceAtomId,
            target: dragBond.targetAtomId,
            order: 1,
          };
          commitGraph({
            atoms: currentGraph.atoms,
            bonds: [...currentGraph.bonds, newBond],
          });
          setSelectedAtomId(dragBond.targetAtomId);
        } else {
          // Cycle existing bond
          cycleBondOrder(existingBond.id);
        }
      } else if (draggedDist >= 12) {
        // Dragged enough to form a new carbon atom at snapped point
        const newAtom: AtomNode = {
          id: generateUniqueId('c'),
          element: 'C',
          x: dragBond.snappedX,
          y: dragBond.snappedY,
          charge: 0,
          implicitH: 3,
        };
        const newBond: BondEdge = {
          id: generateUniqueId('b'),
          source: dragBond.sourceAtomId,
          target: newAtom.id,
          order: 1,
        };

        commitGraph({
          atoms: [...currentGraph.atoms, newAtom],
          bonds: [...currentGraph.bonds, newBond],
        });
        setSelectedAtomId(newAtom.id);
      }

      setDragBond(null);
    }
  };

  // Keyboard Shortcuts (Undo, Redo, Delete, Recenter, Element shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAtomId) {
          e.preventDefault();
          deleteAtom(selectedAtomId);
        }
        return;
      }

      if (e.key === 'Escape') {
        setSelectedAtomId(null);
        setActiveTool('bond');
        return;
      }

      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        handleRecenter();
        return;
      }

      // Tool quick switches
      if (e.key.toLowerCase() === 'b') setActiveTool('bond');
      if (e.key.toLowerCase() === 'e') setActiveTool('eraser');
      if (e.key.toLowerCase() === 'c') {
        setSelectedElement('C');
        if (selectedAtomId) changeAtomElement(selectedAtomId, 'C');
      }
      if (e.key.toLowerCase() === 'o') {
        setSelectedElement('O');
        if (selectedAtomId) changeAtomElement(selectedAtomId, 'O');
      }
      if (e.key.toLowerCase() === 'n') {
        setSelectedElement('N');
        if (selectedAtomId) changeAtomElement(selectedAtomId, 'N');
      }

      if (e.code === 'Space') {
        spacePressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo, selectedAtomId, deleteAtom, handleRecenter, changeAtomElement]);

  // Ghost preview of whatever the active stamp tool is about to add: the ring
  // under the cursor, the ring as it would hang off the hovered atom, or the
  // functional group on the atom being pointed at. Seeing the fragment before
  // committing is the difference between placing furan and guessing at it.
  const ghostFragment = useMemo(() => {
    if (readOnly) return null;

    if (activeTool === 'ring') {
      const hoveredAtom = hoveredAtomId ? atomMap.get(hoveredAtomId) : undefined;
      if (hoveredAtom) {
        const angle = findBestAttachmentAngle(hoveredAtom.id, currentGraph);
        const ringDist = BOND_LENGTH * 2;
        const ring = createRingTemplate(
          selectedRing,
          {
            x: hoveredAtom.x + ringDist * Math.cos(angle),
            y: hoveredAtom.y + ringDist * Math.sin(angle),
          },
          BOND_LENGTH
        );

        // Show the bond that will tie the ring to the atom, too.
        let closest = ring.atoms[0]!;
        let minDSq = Infinity;
        for (const rAtom of ring.atoms) {
          const dSq = (rAtom.x - hoveredAtom.x) ** 2 + (rAtom.y - hoveredAtom.y) ** 2;
          if (dSq < minDSq) {
            minDSq = dSq;
            closest = rAtom;
          }
        }
        return {
          atoms: [hoveredAtom, ...ring.atoms],
          bonds: [
            ...ring.bonds,
            { id: 'ghost-link', source: hoveredAtom.id, target: closest.id, order: 1 as BondOrder },
          ],
        };
      }

      if (!mouseWorldPos) return null;
      return createRingTemplate(selectedRing, mouseWorldPos, BOND_LENGTH);
    }

    if (activeTool === 'functional_group') {
      const hoveredAtom = hoveredAtomId ? atomMap.get(hoveredAtomId) : undefined;
      if (!hoveredAtom) return null;
      const angle = findBestAttachmentAngle(hoveredAtom.id, currentGraph);
      const fragment = buildSubstituentGroup(selectedGroup, hoveredAtom, angle, BOND_LENGTH);
      return { atoms: [hoveredAtom, ...fragment.atoms], bonds: fragment.bonds };
    }

    return null;
  }, [
    readOnly,
    activeTool,
    hoveredAtomId,
    atomMap,
    currentGraph,
    mouseWorldPos,
    selectedRing,
    selectedGroup,
  ]);

  return (
    <div
      ref={containerRef}
      // The editor owns horizontal swipes and two-finger trackpad gestures for
      // panning the drawing; the host app must not read them as "next tab".
      data-no-tab-swipe=""
      className={`relative w-full flex flex-col rounded-3xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-sm select-none ${className}`}
    >
      {/* ------------------------------------------------------------------------- */}
      {/* Top Application Bar & Chemical Telemetry                                  */}
      {/* ------------------------------------------------------------------------- */}
      {showToolbar && (
        <div className="w-full px-4 py-3 bg-[var(--md-sys-color-surface-container-high)] border-b border-[var(--md-sys-color-outline-variant)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Left: Formula & Live Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              <span>Fórmula:</span>
              <span className="text-sm tracking-wide font-extrabold">
                {molecularFormula ? <FormulaText formula={molecularFormula} /> : 'Vazia'}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]">
              <span>{currentGraph.atoms.length} átomos</span>
              <span className="mx-1.5 opacity-40">•</span>
              <span>{currentGraph.bonds.length} ligações</span>
            </div>

            {/* A loose atom is the usual reason a drawing has no name, and it
                is often parked off the edge where nobody sees it. Say so, and
                make the chip itself the way to bring it into view. */}
            {strandedAtomIds.size > 0 && (
              <button
                type="button"
                onClick={handleRecenter}
                title="Enquadrar tudo para achar o átomo solto"
                className="px-2.5 py-1 rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {strandedAtomIds.size} átomo{strandedAtomIds.size > 1 ? 's' : ''} solto
                  {strandedAtomIds.size > 1 ? 's' : ''} — enquadrar
                </span>
              </button>
            )}
          </div>

          {/* Right: History & Canvas Utilities */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0 || readOnly}
              className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] disabled:opacity-40 disabled:pointer-events-none text-[var(--md-sys-color-on-surface)] transition-colors"
              title="Desfazer [Ctrl+Z]"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1 || readOnly}
              className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] disabled:opacity-40 disabled:pointer-events-none text-[var(--md-sys-color-on-surface)] transition-colors"
              title="Refazer [Ctrl+Y]"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRecenter}
              className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] transition-colors"
              title="Centralizar molécula [R]"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={readOnly || currentGraph.atoms.length === 0}
              className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-error-container)] hover:text-[var(--md-sys-color-on-error-container)] disabled:opacity-40 disabled:pointer-events-none text-[var(--md-sys-color-error)] transition-colors"
              title="Limpar Tela"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {onSendToArcade && currentGraph.atoms.length > 0 && (
              <button
                type="button"
                onClick={() => onSendToArcade(currentGraph)}
                className="m3-button-filled py-1.5 px-3 text-xs flex items-center gap-1.5 ml-1"
                title="Treinar estrutura desenhada no Arcade"
              >
                <span>Treinar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* Primary Tool Palette Navigation (Draw, Element, Groups, Rings, Eraser)     */}
      {/* ------------------------------------------------------------------------- */}
      {showToolbar && !readOnly && (
        <div className="w-full px-3 py-2 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2">
          {/* Main Tool Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setActiveTool('bond');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'bond'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Desenhar Ligação</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('element');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'element'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <AtomIcon className="w-3.5 h-3.5" />
              <span>Mudar Elemento</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('functional_group');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'functional_group'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grupos & Radicais</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('ring');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'ring'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Hexagon className="w-3.5 h-3.5" />
              <span>Moldes Cíclicos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('eraser');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'eraser'
                  ? 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Borracha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('pan');
                soundSynth.playClick();
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTool === 'pan'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Mover / Pan</span>
            </button>
          </div>

          {/* Secondary Options Drawer for Active Tool */}
          {activeTool === 'element' && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mr-1">
                Elemento:
              </span>
              {ELEMENT_OPTIONS.map((opt) => {
                const isSelected = selectedElement === opt.element;
                return (
                  <button
                    key={opt.element}
                    type="button"
                    onClick={() => {
                      setSelectedElement(opt.element);
                      if (selectedAtomId) {
                        changeAtomElement(selectedAtomId, opt.element);
                      }
                      soundSynth.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ring-2 ring-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                    }`}
                    title={`${opt.desc} (${opt.label})`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ELEMENT_COLORS[opt.element] }}
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
              {selectedAtomId && (
                <span className="text-[11px] text-[var(--md-sys-color-primary)] ml-auto font-mono">
                  Átomo selecionado pronto para conversão
                </span>
              )}
            </div>
          )}

          {activeTool === 'functional_group' && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mr-1">
                Anexar:
              </span>
              {FUNCTIONAL_GROUPS.map((grp) => {
                const isSelected = selectedGroup === grp.type;
                return (
                  <button
                    key={grp.type}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(grp.type);
                      if (selectedAtomId) {
                        attachGroupToAtom(selectedAtomId, grp.type);
                      }
                      soundSynth.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ring-2 ring-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                    }`}
                    title={`Anexar ${grp.name}`}
                  >
                    <FragmentPreview {...previewGroup(grp.type)} size={26} />
                    <span>{grp.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTool === 'ring' && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mr-1">
                Molde:
              </span>
              {RING_TEMPLATES.map((ring) => {
                const isSelected = selectedRing === ring.type;
                return (
                  <button
                    key={ring.type}
                    type="button"
                    onClick={() => {
                      setSelectedRing(ring.type);
                      if (selectedAtomId) {
                        stampRing(ring.type, selectedAtomId);
                      }
                      soundSynth.playClick();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ring-2 ring-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                    }`}
                    title={ring.name}
                  >
                    <FragmentPreview {...previewRing(ring.type)} size={26} />
                    <span>{ring.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* Main Interactive SVG Canvas Surface                                       */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="relative w-full flex-1 overflow-hidden"
        style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '380px' }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background Definition: Subtle dot grid */}
          <defs>
            <pattern id="skeletal-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="var(--md-sys-color-outline-variant)" opacity="0.45" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#skeletal-grid)" />

          {/* World Transform Group (Pan & Zoom) */}
          <g transform={`translate(${transform.panX}, ${transform.panY}) scale(${transform.zoom})`}>
            {/* ------------------------------------------------------------------- */}
            {/* 1. Render Covalent Bonds                                            */}
            {/* ------------------------------------------------------------------- */}
            {currentGraph.bonds.map((bond) => {
              const src = atomMap.get(bond.source);
              const tgt = atomMap.get(bond.target);
              if (!src || !tgt) return null;

              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;

              // Unit direction & normal vectors
              const ux = dx / dist;
              const uy = dy / dist;
              const nx = -uy;
              const ny = ux;

              // Trim bond if endpoint is a heteroatom with visible text
              const srcDegree = degreeMap.get(src.id) ?? 0;
              const tgtDegree = degreeMap.get(tgt.id) ?? 0;
              const srcHasText = getAtomDisplayLabel(src, srcDegree).hasText;
              const tgtHasText = getAtomDisplayLabel(tgt, tgtDegree).hasText;

              const srcTrim = srcHasText ? 14 : 0;
              const tgtTrim = tgtHasText ? 14 : 0;

              const x1 = src.x + ux * srcTrim;
              const y1 = src.y + uy * srcTrim;
              const x2 = tgt.x - ux * tgtTrim;
              const y2 = tgt.y - uy * tgtTrim;

              const isHovered = hoveredBondId === bond.id;
              const bondColor = isHovered
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-on-surface)';

              // Order 1 (Single Bond): 1 crisp line
              // Order 2 (Double Bond): 2 parallel offset lines
              // Order 3 (Triple Bond): 3 parallel lines
              const bondOffset = 2.8;

              return (
                <g key={bond.id} className="cursor-pointer">
                  {/* Invisible fat hit line for effortless touch & click */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="transparent"
                    strokeWidth={24}
                  />

                  {/* Render Lines according to Bond Order */}
                  {bond.order === 1 && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={bondColor}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  )}

                  {bond.order === 2 && (
                    <>
                      <line
                        x1={x1 + nx * bondOffset}
                        y1={y1 + ny * bondOffset}
                        x2={x2 + nx * bondOffset}
                        y2={y2 + ny * bondOffset}
                        stroke={bondColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                      <line
                        x1={x1 - nx * bondOffset}
                        y1={y1 - ny * bondOffset}
                        x2={x2 - nx * bondOffset}
                        y2={y2 - ny * bondOffset}
                        stroke={bondColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    </>
                  )}

                  {bond.order === 3 && (
                    <>
                      {/* Center line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={bondColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                      {/* Left & right parallel lines */}
                      <line
                        x1={x1 + nx * (bondOffset + 1.2)}
                        y1={y1 + ny * (bondOffset + 1.2)}
                        x2={x2 + nx * (bondOffset + 1.2)}
                        y2={y2 + ny * (bondOffset + 1.2)}
                        stroke={bondColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                      <line
                        x1={x1 - nx * (bondOffset + 1.2)}
                        y1={y1 - ny * (bondOffset + 1.2)}
                        x2={x2 - nx * (bondOffset + 1.2)}
                        y2={y2 - ny * (bondOffset + 1.2)}
                        stroke={bondColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* ------------------------------------------------------------------- */}
            {/* 2. Render Live Ghost Bond while Dragging                            */}
            {/* ------------------------------------------------------------------- */}
            {dragBond && (
              <g pointerEvents="none">
                <line
                  x1={dragBond.startX}
                  y1={dragBond.startY}
                  x2={dragBond.snappedX}
                  y2={dragBond.snappedY}
                  stroke="var(--md-sys-color-primary)"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />

                {/* Ghost preview atom at end point */}
                <circle
                  cx={dragBond.snappedX}
                  cy={dragBond.snappedY}
                  r={dragBond.targetAtomId ? 9 : 5}
                  fill={dragBond.targetAtomId ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'}
                  opacity={0.85}
                />
              </g>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* 3. Render Ghost Ring while Stamp Tool is Active                     */}
            {/* ------------------------------------------------------------------- */}
            {ghostFragment && (
              <g pointerEvents="none" opacity={0.45}>
                {ghostFragment.bonds.map((gb) => {
                  const s = ghostFragment.atoms.find((a) => a.id === gb.source);
                  const t = ghostFragment.atoms.find((a) => a.id === gb.target);
                  if (!s || !t) return null;
                  const dx = t.x - s.x;
                  const dy = t.y - s.y;
                  const len = Math.hypot(dx, dy) || 1;
                  const nx = -dy / len;
                  const ny = dx / len;
                  const offsets = gb.order === 2 ? [-3, 3] : gb.order === 3 ? [-5, 0, 5] : [0];
                  return (
                    <g key={gb.id}>
                      {offsets.map((offset, index) => (
                        <line
                          key={index}
                          x1={s.x + nx * offset}
                          y1={s.y + ny * offset}
                          x2={t.x + nx * offset}
                          y2={t.y + ny * offset}
                          stroke="var(--md-sys-color-primary)"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                        />
                      ))}
                    </g>
                  );
                })}
                {ghostFragment.atoms
                  .filter((a) => a.element !== 'C' && !atomMap.has(a.id))
                  .map((a) => (
                    <text
                      key={a.id}
                      x={a.x}
                      y={a.y}
                      fill={ELEMENT_COLORS[a.element]}
                      fontSize={13}
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {a.element}
                    </text>
                  ))}
              </g>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* 4. Render Atoms & Chemical Labels                                   */}
            {/* ------------------------------------------------------------------- */}
            {currentGraph.atoms.map((atom) => {
              const degree = degreeMap.get(atom.id) ?? 0;
              const display = getAtomDisplayLabel(atom, degree);
              const isSelected = selectedAtomId === atom.id;
              const isHovered = hoveredAtomId === atom.id;

              const isStranded = strandedAtomIds.has(atom.id);

              return (
                <g key={atom.id} className="cursor-pointer">
                  {/* Stranded-atom warning halo: this atom is not bonded to the
                      main structure, which is why the molecule has no name. */}
                  {isStranded && (
                    <circle
                      cx={atom.x}
                      cy={atom.y}
                      r={display.hasText ? 20 : 14}
                      fill="var(--md-sys-color-error)"
                      opacity={0.16}
                    />
                  )}
                  {isStranded && (
                    <circle
                      cx={atom.x}
                      cy={atom.y}
                      r={display.hasText ? 20 : 14}
                      fill="none"
                      stroke="var(--md-sys-color-error)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={atom.x}
                      cy={atom.y}
                      r={display.hasText ? 18 : 12}
                      fill="none"
                      stroke="var(--md-sys-color-primary)"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Hover Aura */}
                  {isHovered && !isSelected && (
                    <circle
                      cx={atom.x}
                      cy={atom.y}
                      r={display.hasText ? 18 : 10}
                      fill="var(--md-sys-color-primary)"
                      opacity={0.18}
                    />
                  )}

                  {/* If atom has text (Heteroatoms or isolated carbon) */}
                  {display.hasText ? (
                    <>
                      {/* Background circle mask to prevent skeletal lines crossing text */}
                      <circle
                        cx={atom.x}
                        cy={atom.y}
                        r={13}
                        fill="var(--md-sys-color-surface-container)"
                      />

                      {/* Chemical Symbol & Implicit Hydrogens */}
                      <text
                        x={atom.x}
                        y={atom.y + 0.5}
                        fill={display.color}
                        fontSize={14}
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="select-none pointer-events-none"
                      >
                        {display.text}
                      </text>

                      {/* Superscript Formal Charge Badge */}
                      {display.chargeBadge && (
                        <text
                          x={atom.x + 10}
                          y={atom.y - 7}
                          fill={display.color}
                          fontSize={10}
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="start"
                          dominantBaseline="central"
                          className="select-none pointer-events-none"
                        >
                          {display.chargeBadge}
                        </text>
                      )}
                    </>
                  ) : (
                    // Carbon Vertex: invisible or subtle terminal point
                    degree <= 1 && (
                      <circle
                        cx={atom.x}
                        cy={atom.y}
                        r={2.5}
                        fill="var(--md-sys-color-on-surface-variant)"
                        opacity={0.6}
                      />
                    )
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* --------------------------------------------------------------------- */}
        {/* Floating Zoom Controls & Reset                                        */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)]/90 backdrop-blur-md border border-[var(--md-sys-color-outline-variant)] shadow-md">
          <button
            type="button"
            onClick={() => setTransform((t) => ({ ...t, zoom: Math.min(3.0, t.zoom * 1.2) }))}
            className="p-1.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono font-bold px-1 text-[var(--md-sys-color-on-surface-variant)]">
            {Math.round(transform.zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setTransform((t) => ({ ...t, zoom: Math.max(0.4, t.zoom / 1.2) }))}
            className="p-1.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* Contextual Action Guidance Tooltip at Bottom Left                     */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute bottom-4 left-4 max-w-xs sm:max-w-md p-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)]/90 backdrop-blur-md border border-[var(--md-sys-color-outline-variant)] shadow-sm pointer-events-none flex items-center gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          <Info className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
          <span>
            {activeTool === 'bond' &&
              'Clique e arraste de um átomo para criar ligação (30°/60°/120°). Clique em uma ligação para alternar simples/dupla/tripla.'}
            {activeTool === 'element' &&
              'Clique em qualquer átomo para alterar seu elemento químico.'}
            {activeTool === 'functional_group' &&
              'Clique em um átomo para anexar o grupo ou radical selecionado.'}
            {activeTool === 'ring' &&
              'Clique no espaço vazio para estampar o anel, ou clique em um átomo para conectar.'}
            {activeTool === 'eraser' &&
              'Clique em qualquer átomo ou ligação para excluir.'}
            {activeTool === 'pan' &&
              'Arraste o cursor para navegar pela área do desenho.'}
          </span>
        </div>
      </div>
    </div>
  );
});
