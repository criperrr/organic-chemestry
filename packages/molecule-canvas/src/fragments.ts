import type { MolecularGraphData } from '@quimicarush/chemistry-core';

/**
 * Atom ids that are not part of the largest connected fragment.
 *
 * A click on empty canvas starts a new atom, so it is easy to leave one
 * stranded — and once it drifts to the edge it is invisible while still
 * counting in the formula. That is how a propanol drawing reports C4H12O with
 * "5 átomos · 3 ligações" and refuses to be named, with nothing on screen
 * saying why.
 *
 * Ties are broken by taking the first fragment found, which follows the atom
 * order: with two fragments of equal size the earlier-drawn one is treated as
 * the molecule and the later one as the leftover.
 */
export function findStrandedAtoms(graph: MolecularGraphData): Set<string> {
  if (graph.atoms.length < 2) return new Set<string>();

  const adjacency = new Map<string, string[]>();
  for (const atom of graph.atoms) adjacency.set(atom.id, []);
  for (const bond of graph.bonds) {
    adjacency.get(bond.source)?.push(bond.target);
    adjacency.get(bond.target)?.push(bond.source);
  }

  const seen = new Set<string>();
  const fragments: string[][] = [];
  for (const atom of graph.atoms) {
    if (seen.has(atom.id)) continue;
    const fragment: string[] = [];
    const queue = [atom.id];
    seen.add(atom.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      fragment.push(current);
      for (const neighbour of adjacency.get(current) ?? []) {
        if (seen.has(neighbour)) continue;
        seen.add(neighbour);
        queue.push(neighbour);
      }
    }
    fragments.push(fragment);
  }

  if (fragments.length < 2) return new Set<string>();

  let largest = 0;
  for (let i = 1; i < fragments.length; i++) {
    if (fragments[i].length > fragments[largest].length) largest = i;
  }
  return new Set(fragments.filter((_, i) => i !== largest).flat());
}
