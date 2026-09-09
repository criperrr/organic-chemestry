import type { AtomElement, FunctionalGroupType, RingTemplateType } from './types.js';

/**
 * One catalogue for every palette in the app.
 *
 * The embedded toolbar and the Studio's floating toolbar used to keep separate
 * lists, so a group added to one silently went missing in the other.
 */

export interface PaletteEntry<T> {
  type: T;
  /** Short label for the button. */
  label: string;
  /** Full name, shown as the tooltip. */
  name: string;
  /** The family the entry belongs to, used to group the palette. */
  group: string;
}

export const ELEMENT_OPTIONS: { element: AtomElement; label: string; desc: string }[] = [
  { element: 'C', label: 'C', desc: 'Carbono' },
  { element: 'O', label: 'O', desc: 'Oxigênio' },
  { element: 'N', label: 'N', desc: 'Nitrogênio' },
  { element: 'S', label: 'S', desc: 'Enxofre' },
  { element: 'P', label: 'P', desc: 'Fósforo' },
  { element: 'F', label: 'F', desc: 'Flúor' },
  { element: 'Cl', label: 'Cl', desc: 'Cloro' },
  { element: 'Br', label: 'Br', desc: 'Bromo' },
  { element: 'I', label: 'I', desc: 'Iodo' },
];

export const FUNCTIONAL_GROUPS: PaletteEntry<FunctionalGroupType>[] = [
  { type: '-OH', label: '−OH', name: 'Hidroxila — álcool ou fenol', group: 'Oxigenadas' },
  { type: '=O', label: '=O', name: 'Carbonila — cetona ou aldeído', group: 'Oxigenadas' },
  { type: '-CHO', label: '−CHO', name: 'Aldeído (formila)', group: 'Oxigenadas' },
  { type: '-COCH3', label: '−COCH₃', name: 'Acetila — cetona metílica', group: 'Oxigenadas' },
  { type: '-COOH', label: '−COOH', name: 'Carboxila — ácido carboxílico', group: 'Oxigenadas' },
  { type: '-COOCH3', label: '−COOCH₃', name: 'Éster metílico', group: 'Oxigenadas' },
  { type: '-OCH3', label: '−OCH₃', name: 'Metóxi — éter', group: 'Oxigenadas' },
  { type: '-OC2H5', label: '−OC₂H₅', name: 'Etóxi — éter', group: 'Oxigenadas' },

  { type: '-NH2', label: '−NH₂', name: 'Amina primária', group: 'Nitrogenadas' },
  { type: '-NHCH3', label: '−NHCH₃', name: 'Amina secundária (N-metil)', group: 'Nitrogenadas' },
  { type: '-N(CH3)2', label: '−N(CH₃)₂', name: 'Amina terciária (N,N-dimetil)', group: 'Nitrogenadas' },
  { type: '-CONH2', label: '−CONH₂', name: 'Amida primária', group: 'Nitrogenadas' },
  { type: '-C#N', label: '−C≡N', name: 'Nitrila (ciano)', group: 'Nitrogenadas' },
  { type: '-NO2', label: '−NO₂', name: 'Nitro', group: 'Nitrogenadas' },

  { type: '-F', label: '−F', name: 'Flúor (fluoro)', group: 'Haletos' },
  { type: '-Cl', label: '−Cl', name: 'Cloro (cloro)', group: 'Haletos' },
  { type: '-Br', label: '−Br', name: 'Bromo (bromo)', group: 'Haletos' },
  { type: '-I', label: '−I', name: 'Iodo (iodo)', group: 'Haletos' },
  { type: '-COCl', label: '−COCl', name: 'Haleto de acila (cloreto)', group: 'Haletos' },

  { type: '-CH3', label: '−CH₃', name: 'Metil', group: 'Radicais' },
  { type: '-CH2CH3', label: '−C₂H₅', name: 'Etil', group: 'Radicais' },
  { type: '-CH2CH2CH3', label: '−C₃H₇', name: 'Propil', group: 'Radicais' },
  { type: '-CH(CH3)2', label: 'isopropil', name: 'Isopropil (propan-2-il)', group: 'Radicais' },
  { type: '-C(CH3)3', label: 'terc-butil', name: 'terc-Butil (2-metilpropan-2-il)', group: 'Radicais' },
  { type: '-CH=CH2', label: '−CH=CH₂', name: 'Etenil (vinil)', group: 'Radicais' },
  { type: '-C#CH', label: '−C≡CH', name: 'Etinil', group: 'Radicais' },
  { type: '-C6H5', label: 'fenil', name: 'Fenil — anel aromático como radical', group: 'Aromáticos' },
  { type: '-CH2C6H5', label: 'benzil', name: 'Benzil (fenilmetil)', group: 'Aromáticos' },
];

export const RING_TEMPLATES: PaletteEntry<RingTemplateType>[] = [
  { type: 'benzene', label: 'Benzeno', name: 'Benzeno — anel aromático (C₆H₆)', group: 'Aromáticos' },
  { type: 'pyridine', label: 'Piridina', name: 'Piridina — aromático com N', group: 'Aromáticos' },
  { type: 'pyrrole', label: 'Pirrol', name: 'Pirrol — aromático de 5 com N', group: 'Aromáticos' },
  { type: 'furan', label: 'Furano', name: 'Furano — aromático de 5 com O', group: 'Aromáticos' },
  { type: 'thiophene', label: 'Tiofeno', name: 'Tiofeno — aromático de 5 com S', group: 'Aromáticos' },

  { type: 'cyclohexane', label: 'Ciclo-hexano', name: 'Ciclo-hexano (6C)', group: 'Cicloalcanos' },
  { type: 'cyclopentane', label: 'Ciclopentano', name: 'Ciclopentano (5C)', group: 'Cicloalcanos' },
  { type: 'cyclobutane', label: 'Ciclobutano', name: 'Ciclobutano (4C)', group: 'Cicloalcanos' },
  { type: 'cyclopropane', label: 'Ciclopropano', name: 'Ciclopropano (3C)', group: 'Cicloalcanos' },
  { type: 'cycloheptane', label: 'Ciclo-heptano', name: 'Ciclo-heptano (7C)', group: 'Cicloalcanos' },

  { type: 'piperidine', label: 'Piperidina', name: 'Piperidina — anel saturado com N', group: 'Saturados com heteroátomo' },
  { type: 'oxolane', label: 'Oxolano', name: 'Oxolano (THF) — anel saturado com O', group: 'Saturados com heteroátomo' },
];

/** Palette entries bucketed by their `group`, preserving catalogue order. */
export function groupPalette<T>(entries: PaletteEntry<T>[]): { group: string; items: PaletteEntry<T>[] }[] {
  const buckets: { group: string; items: PaletteEntry<T>[] }[] = [];
  for (const entry of entries) {
    let bucket = buckets.find(candidate => candidate.group === entry.group);
    if (!bucket) {
      bucket = { group: entry.group, items: [] };
      buckets.push(bucket);
    }
    bucket.items.push(entry);
  }
  return buckets;
}
