import {
  DifficultyTier,
  Molecule,
  OrganicFunction,
} from '@quimicarush/chemistry-core';

import canonicalMoleculesData from '../data/canonical-molecules.json' with { type: 'json' };
import synonymsData from '../data/synonyms-dictionary.json' with { type: 'json' };

/**
 * Normalizes text for comparison (lowercasing, trimming, removing diacritics).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Provider service for querying and filtering the canonical chemistry dataset.
 */
export class DatasetProvider {
  private molecules: Molecule[];
  private synonyms: Record<string, string>;
  private normalizedSynonyms: Map<string, string>;

  constructor(
    molecules?: Molecule[],
    synonyms?: Record<string, string>
  ) {
    this.molecules = molecules ?? (canonicalMoleculesData as Molecule[]);
    this.synonyms = synonyms ?? (synonymsData as Record<string, string>);

    this.normalizedSynonyms = new Map();
    for (const [key, val] of Object.entries(this.synonyms)) {
      this.normalizedSynonyms.set(key.toLowerCase().trim(), val);
      this.normalizedSynonyms.set(normalizeText(key), val);
    }
  }

  /**
   * Returns all canonical molecules in the dataset.
   */
  public getAllMolecules(): Molecule[] {
    return [...this.molecules];
  }

  /**
   * Returns molecules filtered by primary organic function.
   */
  public getByFunction(func: OrganicFunction): Molecule[] {
    return this.molecules.filter((m) => m.primaryFunction === func);
  }

  /**
   * Returns molecules filtered by difficulty tier.
   */
  public getByDifficulty(difficulty: DifficultyTier): Molecule[] {
    return this.molecules.filter((m) => m.difficulty === difficulty);
  }

  /**
   * Returns a random molecule matching an optional filter.
   * If the filter yields no results, falls back to any random molecule in the dataset.
   */
  public getRandomMolecule(filter?: {
    function?: OrganicFunction;
    difficulty?: DifficultyTier;
  }): Molecule {
    let pool = this.molecules;

    if (filter?.function) {
      pool = pool.filter((m) => m.primaryFunction === filter.function);
    }
    if (filter?.difficulty) {
      pool = pool.filter((m) => m.difficulty === filter.difficulty);
    }

    if (pool.length === 0) {
      pool = this.molecules;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  /**
   * Searches molecules matching query in IUPAC name, common names, formula, id, or context.
   */
  public searchMolecules(query: string): Molecule[] {
    const normQ = normalizeText(query);
    if (!normQ) return [];

    return this.molecules.filter((m) => {
      if (normalizeText(m.id).includes(normQ)) return true;
      if (normalizeText(m.iupacName).includes(normQ)) return true;
      if (normalizeText(m.formula).includes(normQ)) return true;
      if (normalizeText(m.primaryFunction).includes(normQ)) return true;
      if (m.commonNames.some((c) => normalizeText(c).includes(normQ))) return true;
      if (normalizeText(m.realWorldStory).includes(normQ)) return true;
      if (normalizeText(m.educationalContext).includes(normQ)) return true;
      return false;
    });
  }

  /**
   * Returns the full trivial-to-IUPAC synonyms dictionary.
   */
  public getSynonymsDictionary(): Record<string, string> {
    return { ...this.synonyms };
  }

  /**
   * Looks up the canonical pt-BR IUPAC name for a Brazilian Portuguese trivial or common name.
   */
  public getCanonicalIUPACForSynonym(synonym: string): string | undefined {
    const exactKey = synonym.toLowerCase().trim();
    if (this.synonyms[exactKey]) {
      return this.synonyms[exactKey];
    }
    const normKey = normalizeText(synonym);
    return this.normalizedSynonyms.get(normKey);
  }
}

export const datasetProvider = new DatasetProvider();

export function getAllMolecules(): Molecule[] {
  return datasetProvider.getAllMolecules();
}

export function getByFunction(func: OrganicFunction): Molecule[] {
  return datasetProvider.getByFunction(func);
}

export function getByDifficulty(difficulty: DifficultyTier): Molecule[] {
  return datasetProvider.getByDifficulty(difficulty);
}

export function getRandomMolecule(filter?: {
  function?: OrganicFunction;
  difficulty?: DifficultyTier;
}): Molecule {
  return datasetProvider.getRandomMolecule(filter);
}

export function searchMolecules(query: string): Molecule[] {
  return datasetProvider.searchMolecules(query);
}

export function getSynonymsDictionary(): Record<string, string> {
  return datasetProvider.getSynonymsDictionary();
}

export function getCanonicalIUPACForSynonym(synonym: string): string | undefined {
  return datasetProvider.getCanonicalIUPACForSynonym(synonym);
}
