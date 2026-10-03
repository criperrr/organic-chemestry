import type {
  DifficultyTier,
  IsomerPairQuestion,
  ChiralCenterQuestion,
  GeometricConditionQuestion,
  IsomerismType,
  IsomerismCategory,
} from '@quimicarush/chemistry-core';
import { ISOMERISM_TYPES_META } from '@quimicarush/chemistry-core';
import {
  CANONICAL_ISOMER_PAIRS,
  CANONICAL_CHIRAL_QUESTIONS,
  CANONICAL_GEOMETRIC_QUESTIONS,
} from './isomerism-data.js';

export interface IsomerPairFilter {
  type?: IsomerismType | 'todos';
  category?: IsomerismCategory | 'todas';
  difficulty?: DifficultyTier | 'todas';
}

export interface ChiralFilter {
  difficulty?: DifficultyTier | 'todas';
  minChiralCount?: number;
}

export interface GeometricFilter {
  difficulty?: DifficultyTier | 'todas';
  systemType?: 'alqueno' | 'ciclo' | 'todos';
}

export class IsomerismProvider {
  private pairs: IsomerPairQuestion[] = CANONICAL_ISOMER_PAIRS;
  private chiralQuestions: ChiralCenterQuestion[] = CANONICAL_CHIRAL_QUESTIONS;
  private geometricQuestions: GeometricConditionQuestion[] = CANONICAL_GEOMETRIC_QUESTIONS;

  /**
   * Retrieves all pair questions, optionally filtered by type, category, or difficulty.
   */
  public getPairQuestions(filter: IsomerPairFilter = {}): IsomerPairQuestion[] {
    return this.pairs.filter(pair => {
      if (filter.type && filter.type !== 'todos') {
        if (pair.relation !== filter.type) return false;
      }
      if (filter.category && filter.category !== 'todas') {
        const meta = ISOMERISM_TYPES_META[pair.relation];
        if (meta.category !== filter.category) return false;
      }
      if (filter.difficulty && filter.difficulty !== 'todas') {
        if (pair.difficulty !== filter.difficulty) return false;
      }
      return true;
    });
  }

  /**
   * Retrieves a random pair question according to the given filter.
   */
  public getRandomPairQuestion(filter: IsomerPairFilter = {}): IsomerPairQuestion {
    const list = this.getPairQuestions(filter);
    const pool = list.length > 0 ? list : this.pairs;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  /**
   * Retrieves chiral center questions.
   */
  public getChiralQuestions(filter: ChiralFilter = {}): ChiralCenterQuestion[] {
    return this.chiralQuestions.filter(q => {
      if (filter.difficulty && filter.difficulty !== 'todas') {
        if (q.difficulty !== filter.difficulty) return false;
      }
      if (typeof filter.minChiralCount === 'number') {
        if (q.chiralCarbonCount < filter.minChiralCount) return false;
      }
      return true;
    });
  }

  public getRandomChiralQuestion(filter: ChiralFilter = {}): ChiralCenterQuestion {
    const list = this.getChiralQuestions(filter);
    const pool = list.length > 0 ? list : this.chiralQuestions;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  /**
   * Retrieves geometric isomerism condition questions.
   */
  public getGeometricQuestions(filter: GeometricFilter = {}): GeometricConditionQuestion[] {
    return this.geometricQuestions.filter(q => {
      if (filter.difficulty && filter.difficulty !== 'todas') {
        if (q.difficulty !== filter.difficulty) return false;
      }
      if (filter.systemType && filter.systemType !== 'todos') {
        if (q.systemType !== filter.systemType) return false;
      }
      return true;
    });
  }

  public getRandomGeometricQuestion(filter: GeometricFilter = {}): GeometricConditionQuestion {
    const list = this.getGeometricQuestions(filter);
    const pool = list.length > 0 ? list : this.geometricQuestions;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  /**
   * Retrieves counts of questions available across all modes.
   */
  public getStats() {
    return {
      pairCount: this.pairs.length,
      chiralCount: this.chiralQuestions.length,
      geometricCount: this.geometricQuestions.length,
      totalCount:
        this.pairs.length + this.chiralQuestions.length + this.geometricQuestions.length,
    };
  }
}

export const isomerismProvider = new IsomerismProvider();
