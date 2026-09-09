import React from 'react';
import { Library } from 'lucide-react';
import type { MolecularGraphData, AtomNode, BondEdge, RingTemplateType } from '../types.js';
import {
  BOND_LENGTH,
  createRingTemplate,
  buildSubstituentGroup,
  generateUniqueId,
} from '../geometry.js';
import { recalculateAllValences } from '../valence.js';
import { FragmentPreview } from '../FragmentPreview.js';
import { Balloon } from './Balloon.js';

/** Zigzag carbon chain of `length` carbons, centred on the origin. */
export function buildChain(length: number): MolecularGraphData {
  const atoms: AtomNode[] = [];
  const bonds: BondEdge[] = [];
  const dx = BOND_LENGTH * Math.cos(Math.PI / 6);
  const dy = BOND_LENGTH * Math.sin(Math.PI / 6);

  for (let i = 0; i < length; i++) {
    atoms.push({
      id: generateUniqueId('c'),
      element: 'C',
      x: Math.round((i - (length - 1) / 2) * dx),
      y: Math.round(i % 2 === 0 ? 0 : -dy),
      charge: 0,
      implicitH: 2,
    });
    if (i > 0) {
      bonds.push({
        id: generateUniqueId('b'),
        source: atoms[i - 1]!.id,
        target: atoms[i]!.id,
        order: 1,
      });
    }
  }

  return recalculateAllValences({ atoms, bonds });
}

/** A ring template with one group already hung off its first vertex. */
function buildRingWithGroup(
  ring: RingTemplateType,
  group: Parameters<typeof buildSubstituentGroup>[0]
): MolecularGraphData {
  const template = createRingTemplate(ring, { x: 0, y: 0 }, BOND_LENGTH);
  const anchor = template.atoms[0]!;
  // Point the substituent away from the ring centre.
  const angle = Math.atan2(anchor.y, anchor.x);
  const fragment = buildSubstituentGroup(group, anchor, angle, BOND_LENGTH);
  return recalculateAllValences({
    atoms: [...template.atoms, ...fragment.atoms],
    bonds: [...template.bonds, ...fragment.bonds],
  });
}

const STARTERS: { label: string; hint: string; build: () => MolecularGraphData }[] = [
  { label: 'Propano', hint: 'cadeia de 3 carbonos', build: () => buildChain(3) },
  { label: 'Pentano', hint: 'cadeia de 5 carbonos', build: () => buildChain(5) },
  { label: 'Octano', hint: 'cadeia de 8 carbonos', build: () => buildChain(8) },
  {
    label: 'Benzeno',
    hint: 'anel aromático puro',
    build: () => {
      const ring = createRingTemplate('benzene', { x: 0, y: 0 }, BOND_LENGTH);
      return recalculateAllValences({ atoms: ring.atoms, bonds: ring.bonds });
    },
  },
  { label: 'Fenol', hint: 'benzeno + hidroxila', build: () => buildRingWithGroup('benzene', '-OH') },
  { label: 'Tolueno', hint: 'benzeno + metil', build: () => buildRingWithGroup('benzene', '-CH3') },
  { label: 'Anilina', hint: 'benzeno + amina', build: () => buildRingWithGroup('benzene', '-NH2') },
  {
    label: 'Ácido benzoico',
    hint: 'benzeno + carboxila',
    build: () => buildRingWithGroup('benzene', '-COOH'),
  },
  {
    label: 'Nitrobenzeno',
    hint: 'benzeno + nitro',
    build: () => buildRingWithGroup('benzene', '-NO2'),
  },
  {
    label: 'Ciclo-hexanol',
    hint: 'ciclo-hexano + hidroxila',
    build: () => buildRingWithGroup('cyclohexane', '-OH'),
  },
  {
    label: 'Piridina',
    hint: 'aromático com nitrogênio',
    build: () => {
      const ring = createRingTemplate('pyridine', { x: 0, y: 0 }, BOND_LENGTH);
      return recalculateAllValences({ atoms: ring.atoms, bonds: ring.bonds });
    },
  },
  {
    label: 'Ácido acético',
    hint: 'metil + carboxila',
    build: () => {
      const anchor: AtomNode = {
        id: generateUniqueId('c'),
        element: 'C',
        x: 0,
        y: 0,
        charge: 0,
        implicitH: 3,
      };
      const fragment = buildSubstituentGroup('-COOH', anchor, 0, BOND_LENGTH);
      return recalculateAllValences({
        atoms: [anchor, ...fragment.atoms],
        bonds: fragment.bonds,
      });
    },
  },
];

export interface StartersPanelProps {
  onLoad: (graph: MolecularGraphData) => void;
  onHide: () => void;
}

/**
 * Ready-made skeletons to start from.
 *
 * Drawing benzene bond by bond every time you want to study a substituted
 * aromatic is busywork; the point of the exercise is what you hang off it.
 */
export const StartersPanel: React.FC<StartersPanelProps> = ({ onLoad, onHide }) => (
  <Balloon
    title="Esqueletos prontos"
    icon={<Library className="w-4 h-4" />}
    initialPosition={{ top: 88, left: 16 }}
    width={300}
    onHide={onHide}
    hideKey="L"
  >
    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
      Carrega a estrutura no canvas, substituindo o desenho atual.
    </p>
    <div className="grid grid-cols-2 gap-1.5">
      {STARTERS.map(starter => {
        const graph = starter.build();
        return (
          <button
            key={starter.label}
            type="button"
            onClick={() => onLoad(starter.build())}
            title={starter.hint}
            className="flex items-center gap-2 px-2 py-1.5 rounded-2xl text-left text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
          >
            <FragmentPreview atoms={graph.atoms} bonds={graph.bonds} size={30} />
            <span className="min-w-0 truncate">{starter.label}</span>
          </button>
        );
      })}
    </div>
  </Balloon>
);
