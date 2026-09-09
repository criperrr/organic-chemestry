import React, { useMemo } from 'react';
import type { AtomNode, BondEdge, FunctionalGroupType, RingTemplateType } from './types.js';
import { BOND_LENGTH, createRingTemplate, buildSubstituentGroup } from './geometry.js';
import { ELEMENT_COLORS } from './valence.js';

/**
 * A drawing of the fragment a button is about to stamp.
 *
 * Picking "furano" or "−COOCH₃" from a list of text labels asks the student to
 * already know what the thing looks like, which is exactly what they are here
 * to learn. Every template and every group therefore carries the same skeletal
 * drawing the canvas will produce, built from the very same geometry code, so
 * the thumbnail can never drift from what actually gets stamped.
 */
export interface FragmentPreviewProps {
  atoms: AtomNode[];
  bonds: BondEdge[];
  /** Box side in px. */
  size?: number;
  className?: string;
  /** Marks the attachment point (the host atom) with a hollow dot. */
  anchorId?: string;
}

export const FragmentPreview: React.FC<FragmentPreviewProps> = ({
  atoms,
  bonds,
  size = 34,
  className = '',
  anchorId,
}) => {
  const viewBox = useMemo(() => {
    if (atoms.length === 0) return '0 0 1 1';
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const atom of atoms) {
      minX = Math.min(minX, atom.x);
      minY = Math.min(minY, atom.y);
      maxX = Math.max(maxX, atom.x);
      maxY = Math.max(maxY, atom.y);
    }
    // Square box around the fragment, padded so labels are not clipped.
    const pad = 16;
    const width = maxX - minX;
    const height = maxY - minY;
    const side = Math.max(width, height) + pad * 2;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return `${cx - side / 2} ${cy - side / 2} ${side} ${side}`;
  }, [atoms]);

  const atomById = useMemo(() => new Map(atoms.map(a => [a.id, a])), [atoms]);
  const degree = useMemo(() => {
    const map = new Map<string, number>();
    for (const bond of bonds) {
      map.set(bond.source, (map.get(bond.source) ?? 0) + 1);
      map.set(bond.target, (map.get(bond.target) ?? 0) + 1);
    }
    return map;
  }, [bonds]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      {bonds.map(bond => {
        const source = atomById.get(bond.source);
        const target = atomById.get(bond.target);
        if (!source || !target) return null;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length;
        const ny = dx / length;
        const offsets =
          bond.order === 2 ? [-2.6, 2.6] : bond.order === 3 ? [-4.4, 0, 4.4] : [0];
        return (
          <g key={bond.id}>
            {offsets.map((offset, index) => (
              <line
                key={index}
                x1={source.x + nx * offset}
                y1={source.y + ny * offset}
                x2={target.x + nx * offset}
                y2={target.y + ny * offset}
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}

      {atoms.map(atom => {
        if (atom.id === anchorId) {
          return (
            <circle
              key={atom.id}
              cx={atom.x}
              cy={atom.y}
              r={5}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeDasharray="3 2.5"
              opacity={0.7}
            />
          );
        }
        if (atom.element === 'C') {
          // Skeletal convention: carbons are vertices, only loose ends get a dot.
          return (degree.get(atom.id) ?? 0) <= 1 ? (
            <circle key={atom.id} cx={atom.x} cy={atom.y} r={2.4} fill="currentColor" opacity={0.55} />
          ) : null;
        }
        return (
          <g key={atom.id}>
            <circle cx={atom.x} cy={atom.y} r={10} fill="var(--md-sys-color-surface-container-high)" />
            <text
              x={atom.x}
              y={atom.y}
              fill={ELEMENT_COLORS[atom.element]}
              fontSize={16}
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {atom.element}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Ring template drawn on its own, centred on the origin. */
export function previewRing(type: RingTemplateType): { atoms: AtomNode[]; bonds: BondEdge[] } {
  return createRingTemplate(type, { x: 0, y: 0 }, BOND_LENGTH);
}

/**
 * Group drawn as it will be attached: a dashed host atom plus the substituent,
 * pointing right so every thumbnail in the palette reads the same way.
 */
export function previewGroup(type: FunctionalGroupType): {
  atoms: AtomNode[];
  bonds: BondEdge[];
  anchorId: string;
} {
  const anchor: AtomNode = {
    id: 'preview-anchor',
    element: 'C',
    x: 0,
    y: 0,
    charge: 0,
    implicitH: 3,
  };
  const fragment = buildSubstituentGroup(type, anchor, 0, BOND_LENGTH);
  return {
    atoms: [anchor, ...fragment.atoms],
    bonds: fragment.bonds,
    anchorId: anchor.id,
  };
}
