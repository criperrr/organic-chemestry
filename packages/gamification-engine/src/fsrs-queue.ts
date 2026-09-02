/**
 * Spaced repetition micro-queue for session learning in QuímicaRush.
 * Automatically re-inserts items scored < 0.80 at current_index + 3 (or at end if < 3 remain).
 * Includes deduplication, priority scheduling, and state serialization/restore.
 */

export interface FSRSHistoryEntry {
  score: number;
  timestamp: number;
}

export interface FSRSQueueItem<T> {
  id: string;
  data: T;
  lapses: number;
  repetitions: number;
  lastScore: number | null;
  priority: number;
  history: FSRSHistoryEntry[];
}

export interface FSRSReviewResult<T> {
  item: FSRSQueueItem<T>;
  score: number;
  passed: boolean;
  reinserted: boolean;
  insertIndex: number | null;
  currentIndex: number;
  remainingCount: number;
  isSessionComplete: boolean;
}

export interface FSRSQueueStats {
  totalReviews: number;
  passedReviews: number;
  failedReviews: number;
  passRate: number;
  averageScore: number;
  completedItemsCount: number;
  remainingItemsCount: number;
  totalItemsCount: number;
}

export interface FSRSQueueOptions<T> {
  getId?: (item: T) => string;
  passThreshold?: number; // default: 0.80
  reinsertOffset?: number; // default: 3
  deduplicate?: boolean; // default: true
  priorityScheduling?: boolean; // default: false
}

export interface FSRSQueueState<T> {
  items: Array<FSRSQueueItem<T>>;
  currentIndex: number;
  totalReviews: number;
  passedReviews: number;
  failedReviews: number;
  totalScoreSum?: number;
}

export const DEFAULT_PASS_THRESHOLD = 0.8;
export const DEFAULT_REINSERT_OFFSET = 3;

function defaultGetId<T>(item: T): string {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }
  if (item !== null && typeof item === 'object' && 'id' in item) {
    const candidate = (item as Record<string, unknown>).id;
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate);
    }
  }
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
}

export class FSRSQueue<T> {
  private queue: Array<FSRSQueueItem<T>> = [];
  private currentIndex: number = 0;
  private totalReviews: number = 0;
  private passedReviews: number = 0;
  private failedReviews: number = 0;
  private totalScoreSum: number = 0;

  private readonly getId: (item: T) => string;
  private readonly passThreshold: number;
  private readonly reinsertOffset: number;
  private readonly deduplicate: boolean;
  private readonly priorityScheduling: boolean;

  constructor(items: T[] = [], options: FSRSQueueOptions<T> = {}) {
    this.getId = options.getId ?? defaultGetId;
    this.passThreshold =
      options.passThreshold !== undefined
        ? Math.max(0, Math.min(1, options.passThreshold))
        : DEFAULT_PASS_THRESHOLD;
    this.reinsertOffset =
      options.reinsertOffset !== undefined
        ? Math.max(1, options.reinsertOffset)
        : DEFAULT_REINSERT_OFFSET;
    this.deduplicate = options.deduplicate ?? true;
    this.priorityScheduling = options.priorityScheduling ?? false;

    if (items.length > 0) {
      this.enqueue(items);
    }
  }

  /**
   * Adds one or more items to the queue.
   * If deduplication is enabled, skips items that are already in the upcoming queue.
   */
  public enqueue(items: T | T[]): void {
    const itemList = Array.isArray(items) ? items : [items];

    for (const data of itemList) {
      const id = this.getId(data);

      if (this.deduplicate) {
        const alreadyUpcoming = this.queue
          .slice(this.currentIndex)
          .some((item) => item.id === id);
        if (alreadyUpcoming) {
          continue;
        }
      }

      this.queue.push({
        id,
        data,
        lapses: 0,
        repetitions: 0,
        lastScore: null,
        priority: 0,
        history: [],
      });
    }

    if (this.priorityScheduling) {
      this.applyPriorityScheduling();
    }
  }

  /**
   * Gets the item at the current position, or null if the queue is finished.
   */
  public getCurrentItem(): FSRSQueueItem<T> | null {
    if (this.isFinished()) {
      return null;
    }
    return this.queue[this.currentIndex];
  }

  /**
   * Alias for getCurrentItem.
   */
  public current(): FSRSQueueItem<T> | null {
    return this.getCurrentItem();
  }

  /**
   * Peeks ahead by offset positions from current.
   */
  public peek(offset: number = 0): FSRSQueueItem<T> | null {
    const target = this.currentIndex + offset;
    if (target < 0 || target >= this.queue.length) {
      return null;
    }
    return this.queue[target];
  }

  /**
   * Current index in the queue.
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Whether all items in the queue have been reviewed and passed.
   */
  public isFinished(): boolean {
    return this.currentIndex >= this.queue.length;
  }

  /**
   * Number of items remaining to review.
   */
  public getRemainingCount(): number {
    return Math.max(0, this.queue.length - this.currentIndex);
  }

  /**
   * Number of items completed.
   */
  public getCompletedCount(): number {
    return Math.min(this.currentIndex, this.queue.length);
  }

  /**
   * Total items currently in the queue (including re-inserted items).
   */
  public getTotalCount(): number {
    return this.queue.length;
  }

  /**
   * Session progress stats.
   */
  public getProgress(): {
    completed: number;
    remaining: number;
    total: number;
    percent: number;
  } {
    const completed = this.getCompletedCount();
    const remaining = this.getRemainingCount();
    const total = this.queue.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 100;
    return { completed, remaining, total, percent };
  }

  /**
   * Records a user's review score for the current item.
   * - If score >= passThreshold (0.80): item is mastered for now; queue advances.
   * - If score < passThreshold (0.80): item is re-inserted at current_index + 3 (or at end if < 3 remain).
   */
  public recordReview(score: number): FSRSReviewResult<T> {
    if (this.isFinished()) {
      throw new Error('Cannot record review: FSRSQueue has already finished all items.');
    }

    const currentItem = this.queue[this.currentIndex];
    const clampedScore = Math.max(0, Math.min(1, score));
    const passed = clampedScore >= this.passThreshold;
    const now = Date.now();

    currentItem.repetitions += 1;
    currentItem.lastScore = clampedScore;
    currentItem.history.push({ score: clampedScore, timestamp: now });
    this.totalReviews += 1;
    this.totalScoreSum += clampedScore;

    let reinserted = false;
    let insertIndex: number | null = null;

    if (passed) {
      this.passedReviews += 1;
      // Item passed! Advance pointer to next
      this.currentIndex += 1;
    } else {
      this.failedReviews += 1;
      currentItem.lapses += 1;
      // Increase review urgency priority based on lapse count and missing score
      currentItem.priority += (1 - clampedScore) * 10 + currentItem.lapses * 2;
      reinserted = true;

      // Re-insert at current_index + 3 (or at end if fewer than 3 remain)
      // Note: currentIndex is still pointing at the current item being answered.
      // E.g. queue=[A, B, C, D], currentIndex=0.
      // currentIndex + 3 = 3.
      // Inserting at index 3: [A, B, C, A, D].
      // Then advancing currentIndex to 1 gives next=B(1), then C(2), then A(3).
      let targetIndex = Math.min(
        this.currentIndex + this.reinsertOffset,
        this.queue.length
      );

      // Handle deduplication if item is already scheduled in future
      if (this.deduplicate) {
        const futureDupIndex = this.queue.findIndex(
          (item, idx) => idx > this.currentIndex && item.id === currentItem.id
        );
        if (futureDupIndex !== -1) {
          // Remove future duplicate before inserting
          this.queue.splice(futureDupIndex, 1);
          if (futureDupIndex < targetIndex) {
            targetIndex -= 1;
          }
        }
      }

      const reinsertedItem: FSRSQueueItem<T> = {
        id: currentItem.id,
        data: currentItem.data,
        lapses: currentItem.lapses,
        repetitions: currentItem.repetitions,
        lastScore: currentItem.lastScore,
        priority: currentItem.priority,
        history: [...currentItem.history],
      };

      this.queue.splice(targetIndex, 0, reinsertedItem);
      insertIndex = targetIndex;

      // Advance currentIndex past the currently answered item
      this.currentIndex += 1;

      if (this.priorityScheduling) {
        this.applyPriorityScheduling();
      }
    }

    return {
      item: currentItem,
      score: clampedScore,
      passed,
      reinserted,
      insertIndex,
      currentIndex: this.currentIndex,
      remainingCount: this.getRemainingCount(),
      isSessionComplete: this.isFinished(),
    };
  }

  /**
   * Reorders upcoming queue items by priority descending (higher priority first).
   * Stable sort that maintains relative order among items with equal priority.
   */
  public applyPriorityScheduling(): void {
    if (this.currentIndex >= this.queue.length - 1) return;

    const completed = this.queue.slice(0, this.currentIndex);
    const upcoming = this.queue.slice(this.currentIndex);

    upcoming.sort((a, b) => b.priority - a.priority);

    this.queue = [...completed, ...upcoming];
  }

  /**
   * Custom reordering for upcoming items.
   */
  public reorderUpcoming(
    comparator: (a: FSRSQueueItem<T>, b: FSRSQueueItem<T>) => number
  ): void {
    if (this.currentIndex >= this.queue.length - 1) return;

    const completed = this.queue.slice(0, this.currentIndex);
    const upcoming = this.queue.slice(this.currentIndex);

    upcoming.sort(comparator);

    this.queue = [...completed, ...upcoming];
  }

  /**
   * Returns all upcoming items (from current_index to end).
   */
  public getUpcomingItems(): Array<FSRSQueueItem<T>> {
    return this.queue.slice(this.currentIndex);
  }

  /**
   * Returns all items completed so far.
   */
  public getCompletedItems(): Array<FSRSQueueItem<T>> {
    return this.queue.slice(0, this.currentIndex);
  }

  /**
   * Returns complete queue array.
   */
  public getAllItems(): Array<FSRSQueueItem<T>> {
    return [...this.queue];
  }

  /**
   * Computes comprehensive queue statistics.
   */
  public getStats(): FSRSQueueStats {
    return {
      totalReviews: this.totalReviews,
      passedReviews: this.passedReviews,
      failedReviews: this.failedReviews,
      passRate:
        this.totalReviews > 0 ? this.passedReviews / this.totalReviews : 1.0,
      averageScore:
        this.totalReviews > 0 ? this.totalScoreSum / this.totalReviews : 1.0,
      completedItemsCount: this.getCompletedCount(),
      remainingItemsCount: this.getRemainingCount(),
      totalItemsCount: this.queue.length,
    };
  }

  /**
   * Serializes queue state for persistence (e.g. Dexie.js or localStorage).
   */
  public serialize(): FSRSQueueState<T> {
    return {
      items: this.queue.map((item) => ({
        id: item.id,
        data: item.data,
        lapses: item.lapses,
        repetitions: item.repetitions,
        lastScore: item.lastScore,
        priority: item.priority,
        history: item.history.map((h) => ({ ...h })),
      })),
      currentIndex: this.currentIndex,
      totalReviews: this.totalReviews,
      passedReviews: this.passedReviews,
      failedReviews: this.failedReviews,
      totalScoreSum: this.totalScoreSum,
    };
  }

  /**
   * Restores queue state from serialized state.
   */
  public restore(state: FSRSQueueState<T>): void {
    this.queue = state.items.map((item) => ({
      id: item.id,
      data: item.data,
      lapses: item.lapses,
      repetitions: item.repetitions,
      lastScore: item.lastScore,
      priority: item.priority,
      history: item.history.map((h) => ({ ...h })),
    }));
    this.currentIndex = Math.max(0, Math.min(state.currentIndex, this.queue.length));
    this.totalReviews = Math.max(0, state.totalReviews);
    this.passedReviews = Math.max(0, state.passedReviews);
    this.failedReviews = Math.max(0, state.failedReviews);
    this.totalScoreSum = state.totalScoreSum ?? 0;
  }

  /**
   * Serializes state to JSON string.
   */
  public toJSON(): string {
    return JSON.stringify(this.serialize());
  }

  /**
   * Creates an FSRSQueue instance from a serialized JSON string.
   */
  public static fromJSON<T>(
    json: string,
    options: FSRSQueueOptions<T> = {}
  ): FSRSQueue<T> {
    const parsed = JSON.parse(json) as FSRSQueueState<T>;
    const queueInstance = new FSRSQueue<T>([], options);
    queueInstance.restore(parsed);
    return queueInstance;
  }

  /**
   * Creates an FSRSQueue instance from a state object.
   */
  public static fromState<T>(
    state: FSRSQueueState<T>,
    options: FSRSQueueOptions<T> = {}
  ): FSRSQueue<T> {
    const queueInstance = new FSRSQueue<T>([], options);
    queueInstance.restore(state);
    return queueInstance;
  }
}
