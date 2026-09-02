import { describe, it, expect } from 'vitest';
import {
  FSRSQueue,
  DEFAULT_PASS_THRESHOLD,
  DEFAULT_REINSERT_OFFSET,
} from '../src/fsrs-queue.js';

interface TestChallenge {
  id: string;
  name: string;
}

describe('FSRS Micro-Queue Core Functionality', () => {
  it('should initialize queue and provide current item', () => {
    const items = ['etanol', 'metanal', 'propanona'];
    const queue = new FSRSQueue<string>(items);

    expect(DEFAULT_PASS_THRESHOLD).toBe(0.8);
    expect(DEFAULT_REINSERT_OFFSET).toBe(3);
    expect(queue.getTotalCount()).toBe(3);
    expect(queue.getRemainingCount()).toBe(3);
    expect(queue.getCompletedCount()).toBe(0);
    expect(queue.isFinished()).toBe(false);

    const current = queue.getCurrentItem();
    expect(current).not.toBeNull();
    expect(current?.data).toBe('etanol');
    expect(current?.repetitions).toBe(0);
    expect(current?.lapses).toBe(0);
  });

  it('should advance without re-insertion when score >= 0.80 (pass)', () => {
    const items = ['etanol', 'metanal', 'propanona'];
    const queue = new FSRSQueue<string>(items);

    // Review etanol with score 0.85 (>= 0.80 threshold)
    const result = queue.recordReview(0.85);

    expect(result.passed).toBe(true);
    expect(result.reinserted).toBe(false);
    expect(result.insertIndex).toBeNull();
    expect(result.currentIndex).toBe(1);
    expect(queue.getRemainingCount()).toBe(2);
    expect(queue.getCompletedCount()).toBe(1);

    // Current item is now metanal
    const current = queue.getCurrentItem();
    expect(current?.data).toBe('metanal');
  });

  it('should re-insert item at current_index + 3 when score < 0.80', () => {
    // Initial queue: [A, B, C, D, E]
    const items = ['A', 'B', 'C', 'D', 'E'];
    const queue = new FSRSQueue<string>(items);

    // Current index is 0 (item A).
    // User scores 0.60 (< 0.80 threshold)
    const result = queue.recordReview(0.6);

    expect(result.passed).toBe(false);
    expect(result.reinserted).toBe(true);
    expect(result.insertIndex).toBe(3); // 0 + 3 = 3
    expect(result.currentIndex).toBe(1);

    // The queue should now have 6 items: [A (done), B, C, A (reinserted), D, E]
    expect(queue.getTotalCount()).toBe(6);
    expect(queue.getRemainingCount()).toBe(5);

    // 1st upcoming item: B
    const item1 = queue.getCurrentItem();
    expect(item1?.data).toBe('B');
    queue.recordReview(1.0); // B passes -> index 2

    // 2nd upcoming item: C
    const item2 = queue.getCurrentItem();
    expect(item2?.data).toBe('C');
    queue.recordReview(1.0); // C passes -> index 3

    // 3rd upcoming item: A again! (re-encountered after B and C)
    const item3 = queue.getCurrentItem();
    expect(item3?.data).toBe('A');
    expect(item3?.lapses).toBe(1);
    expect(item3?.repetitions).toBe(1);
    expect(item3?.lastScore).toBe(0.6);

    // Now user gets A right
    const passResult = queue.recordReview(1.0);
    expect(passResult.passed).toBe(true);
    expect(passResult.reinserted).toBe(false);
    expect(item3?.repetitions).toBe(2);
    expect(item3?.lapses).toBe(1);
  });

  it('should place failed item at the end if fewer than 3 items remain', () => {
    // Queue with 2 items: [A, B]
    const queue = new FSRSQueue<string>(['A', 'B']);

    // Current index is 0 (item A). Only 1 item remains after A (< 3).
    const result = queue.recordReview(0.5);

    expect(result.passed).toBe(false);
    expect(result.reinserted).toBe(true);
    // targetIndex = min(0 + 3, 2) = 2 (end of queue)
    expect(result.insertIndex).toBe(2);

    // Queue order: [A (done), B, A (reinserted)]
    expect(queue.getTotalCount()).toBe(3);

    // Next is B
    expect(queue.getCurrentItem()?.data).toBe('B');
    queue.recordReview(1.0);

    // Next is A
    expect(queue.getCurrentItem()?.data).toBe('A');
    queue.recordReview(1.0);

    expect(queue.isFinished()).toBe(true);
  });

  it('should re-insert single item queue at end (immediately next)', () => {
    const queue = new FSRSQueue<string>(['solitary']);
    const result = queue.recordReview(0.7);

    expect(result.passed).toBe(false);
    expect(result.reinserted).toBe(true);
    expect(result.insertIndex).toBe(1);
    expect(queue.getCurrentItem()?.data).toBe('solitary');
    expect(queue.getCurrentItem()?.lapses).toBe(1);
  });

  it('should strictly observe the 0.80 boundary threshold', () => {
    const queue = new FSRSQueue<string>(['item1', 'item2', 'item3']);

    // Score 0.79 -> fail
    const resFail = queue.recordReview(0.79);
    expect(resFail.passed).toBe(false);
    expect(resFail.reinserted).toBe(true);

    // Score 0.80 -> pass
    const resPass = queue.recordReview(0.8);
    expect(resPass.passed).toBe(true);
    expect(resPass.reinserted).toBe(false);
  });

  it('should track lapses, repetitions, and history correctly', () => {
    const queue = new FSRSQueue<string>(['quiz1']);

    queue.recordReview(0.5); // fail
    const itemAfterFail = queue.getCurrentItem();
    expect(itemAfterFail?.lapses).toBe(1);
    expect(itemAfterFail?.repetitions).toBe(1);
    expect(itemAfterFail?.history.length).toBe(1);
    expect(itemAfterFail?.history[0].score).toBe(0.5);

    queue.recordReview(0.75); // fail again
    const itemAfterFail2 = queue.getCurrentItem();
    expect(itemAfterFail2?.lapses).toBe(2);
    expect(itemAfterFail2?.repetitions).toBe(2);
    expect(itemAfterFail2?.history.length).toBe(2);

    queue.recordReview(0.95); // pass
    expect(queue.isFinished()).toBe(true);
  });
});

describe('Deduplication & Custom ID extraction', () => {
  it('should extract object ID automatically if present', () => {
    const challenges: TestChallenge[] = [
      { id: 'mol-1', name: 'Metano' },
      { id: 'mol-2', name: 'Etano' },
    ];
    const queue = new FSRSQueue<TestChallenge>(challenges);

    expect(queue.getCurrentItem()?.id).toBe('mol-1');
  });

  it('should deduplicate items upon initial enqueue', () => {
    const challenges: TestChallenge[] = [
      { id: 'mol-1', name: 'Metano' },
      { id: 'mol-1', name: 'Metano Duplicate' },
      { id: 'mol-2', name: 'Etano' },
    ];
    const queue = new FSRSQueue<TestChallenge>(challenges, { deduplicate: true });

    expect(queue.getTotalCount()).toBe(2);
  });

  it('should avoid duplicate upcoming instances when deduplicate is enabled', () => {
    const queue = new FSRSQueue<string>(['A', 'B', 'C', 'D'], { deduplicate: true });

    // Fail A -> reinserted at 3: [A, B, C, A, D]
    queue.recordReview(0.5);

    // Fail B -> reinserted at min(1+3, 5)=4: [A, B, C, A, B, D]
    queue.recordReview(0.4);

    expect(queue.getTotalCount()).toBe(6);
  });
});

describe('Priority Scheduling', () => {
  it('should prioritize items with lower scores and higher lapses', () => {
    const queue = new FSRSQueue<string>(['A', 'B', 'C', 'D', 'E'], {
      priorityScheduling: true,
    });

    // Fail A with score 0.2 (low score = high priority boost)
    queue.recordReview(0.2);

    // The upcoming queue should have A sorted towards the front based on priority
    const upcoming = queue.getUpcomingItems();
    const hasA = upcoming.some((item) => item.data === 'A');
    expect(hasA).toBe(true);

    const aItem = upcoming.find((item) => item.data === 'A');
    expect(aItem?.priority).toBeGreaterThan(0);
  });

  it('should allow custom reordering of upcoming items', () => {
    const queue = new FSRSQueue<string>(['A', 'B', 'C']);
    queue.recordReview(1.0); // A finished, upcoming is [B, C]

    queue.reorderUpcoming((a, b) => b.data.localeCompare(a.data));

    const current = queue.getCurrentItem();
    expect(current?.data).toBe('C');
  });
});

describe('Serialization and Persistence', () => {
  it('should serialize and restore queue state completely', () => {
    const queue = new FSRSQueue<string>(['eteno', 'etino', 'benzeno']);
    queue.recordReview(0.5); // eteno fails, reinserted
    queue.recordReview(1.0); // etino passes

    const serialized = queue.serialize();
    expect(serialized.currentIndex).toBe(2);
    expect(serialized.totalReviews).toBe(2);
    expect(serialized.failedReviews).toBe(1);
    expect(serialized.passedReviews).toBe(1);

    const restoredQueue = FSRSQueue.fromState<string>(serialized);
    expect(restoredQueue.getCurrentIndex()).toBe(2);
    expect(restoredQueue.getTotalCount()).toBe(queue.getTotalCount());
    expect(restoredQueue.getRemainingCount()).toBe(queue.getRemainingCount());
    expect(restoredQueue.getCurrentItem()?.data).toBe(queue.getCurrentItem()?.data);
  });

  it('should serialize to JSON and reconstruct from JSON', () => {
    const queue = new FSRSQueue<string>(['fenol', 'anisol']);
    queue.recordReview(0.9);

    const json = queue.toJSON();
    expect(typeof json).toBe('string');

    const reconstructed = FSRSQueue.fromJSON<string>(json);
    expect(reconstructed.getCurrentIndex()).toBe(1);
    expect(reconstructed.getCurrentItem()?.data).toBe('anisol');
    expect(reconstructed.getRemainingCount()).toBe(1);
  });

  it('should calculate comprehensive stats', () => {
    const queue = new FSRSQueue<string>(['A', 'B']);
    queue.recordReview(0.5); // Fail
    queue.recordReview(1.0); // Pass

    const stats = queue.getStats();
    expect(stats.totalReviews).toBe(2);
    expect(stats.passedReviews).toBe(1);
    expect(stats.failedReviews).toBe(1);
    expect(stats.passRate).toBe(0.5);
    expect(stats.averageScore).toBe(0.75);
  });
});
