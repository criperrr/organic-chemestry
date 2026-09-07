import { describe, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  MolecularGraph,
  analyzeMolecularGraph,
  createGraphFromSMILES,
  translateIupacToEnglish,
} from '../packages/chemistry-core/src/index.js';
import { datasetProvider } from '../packages/chemistry-dataset/src/index.js';

const OPSIN_JAR = resolve(process.cwd(), 'tools-opsin-2.9.0.jar');
const OUT_DIR = resolve(process.cwd(), 'tools/audit-output');

/**
 * Weisfeiler-Leman style canonical fingerprint.
 *
 * Comparing SMILES strings directly is useless here — ours and OPSIN's
 * canonicalisations differ. This refines each atom's label from its neighbourhood
 * until stable, then hashes the sorted multiset, which is invariant to atom
 * ordering and strong enough to separate any two molecules of this size.
 */
function fingerprint(graph: MolecularGraph): string {
  let labels = new Map<string, string>();
  for (const atom of graph.atoms.values()) {
    labels.set(atom.id, `${atom.element}${atom.charge}h${atom.implicitH}`);
  }

  for (let round = 0; round < 4; round++) {
    const next = new Map<string, string>();
    for (const atom of graph.atoms.values()) {
      const neighbours = graph
        .getNeighbors(atom.id)
        .map(edge => {
          // Aromatic rings reach us either delocalised (our "c1ccccc1") or in
          // Kekule form (OPSIN's "C1=CC=CC=C1"). Collapsing every perceived
          // aromatic bond to one symbol makes the two comparable; without it
          // toluene reads as a mismatch against itself.
          const bond = graph.bonds.get(edge.bondId);
          const order = bond?.aromatic ? 'a' : String(edge.order);
          return `${order}:${labels.get(edge.neighborId) ?? ''}`;
        })
        .sort()
        .join('|');
      next.set(atom.id, `${labels.get(atom.id)}(${neighbours})`);
    }
    // Compress to keep the strings from growing exponentially.
    const pool = [...new Set(next.values())].sort();
    labels = new Map([...next].map(([id, label]) => [id, String(pool.indexOf(label))]));
  }

  return [...labels.values()].sort().join(',');
}

type Verdict =
  | 'ok'
  | 'engine_refused'
  | 'not_translated'
  | 'opsin_rejected'
  | 'structure_mismatch';

interface Row {
  smiles: string;
  ptName: string;
  enName: string | null;
  opsinSmiles: string | null;
  verdict: Verdict;
}

describe('Nomenclature round-trip audit (SMILES -> pt-BR -> EN -> OPSIN -> SMILES)', () => {
  it('measures how many generated names survive a structural round trip', () => {
    if (!existsSync(OPSIN_JAR)) {
      console.log(`OPSIN jar não encontrado em ${OPSIN_JAR} — auditoria ignorada.`);
      return;
    }

    // Corpus: the curated dataset is the ground truth the app actually serves.
    const corpus = [...new Set(datasetProvider.getAllMolecules().map(m => m.smiles))];
    console.log(`Corpus: ${corpus.length} moléculas\n`);

    const rows: Row[] = [];
    const pending: { index: number; enName: string }[] = [];

    for (const smiles of corpus) {
      let graph: MolecularGraph;
      try {
        graph = createGraphFromSMILES(smiles);
      } catch {
        continue;
      }

      const analysis = analyzeMolecularGraph(graph);
      const row: Row = {
        smiles,
        ptName: analysis.iupacName2013,
        enName: null,
        opsinSmiles: null,
        verdict: 'ok',
      };

      if (!analysis.isNameable) {
        row.verdict = 'engine_refused';
        rows.push(row);
        continue;
      }

      const enName = translateIupacToEnglish(analysis.iupacName2013);
      row.enName = enName;
      if (!enName) {
        row.verdict = 'not_translated';
        rows.push(row);
        continue;
      }

      rows.push(row);
      pending.push({ index: rows.length - 1, enName });
    }

    // One OPSIN invocation for the whole batch: per-name JVM startup would take hours.
    const opsinOut = execFileSync(
      'java',
      ['-jar', OPSIN_JAR, '-o', 'smi'],
      { input: pending.map(p => p.enName).join('\n') + '\n', encoding: 'utf8', maxBuffer: 1 << 28 }
    )
      .split('\n');

    pending.forEach((entry, i) => {
      const produced = (opsinOut[i] ?? '').trim();
      const row = rows[entry.index];
      row.opsinSmiles = produced || null;

      if (!produced) {
        row.verdict = 'opsin_rejected';
        return;
      }

      try {
        const ours = fingerprint(createGraphFromSMILES(row.smiles));
        const theirs = fingerprint(createGraphFromSMILES(produced));
        row.verdict = ours === theirs ? 'ok' : 'structure_mismatch';
      } catch {
        row.verdict = 'opsin_rejected';
      }
    });

    const tally = new Map<Verdict, number>();
    for (const row of rows) tally.set(row.verdict, (tally.get(row.verdict) ?? 0) + 1);

    const total = rows.length;
    const ok = tally.get('ok') ?? 0;
    console.log('=== RESULTADO ===');
    console.log(`total analisado      ${total}`);
    console.log(`round-trip OK        ${ok}  (${((ok / total) * 100).toFixed(1)}%)`);
    for (const verdict of [
      'structure_mismatch',
      'opsin_rejected',
      'not_translated',
      'engine_refused',
    ] as Verdict[]) {
      console.log(`${verdict.padEnd(20)} ${tally.get(verdict) ?? 0}`);
    }

    console.log('\n=== AMOSTRA DE DIVERGÊNCIAS ===');
    for (const verdict of ['structure_mismatch', 'opsin_rejected', 'not_translated'] as Verdict[]) {
      const sample = rows.filter(r => r.verdict === verdict).slice(0, 12);
      if (sample.length === 0) continue;
      console.log(`\n-- ${verdict} --`);
      for (const row of sample) {
        console.log(
          `  ${row.smiles}\n    pt: ${row.ptName}\n    en: ${row.enName ?? '-'}\n    opsin: ${row.opsinSmiles ?? '-'}`
        );
      }
    }

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(resolve(OUT_DIR, 'report.json'), JSON.stringify(rows, null, 2));
    console.log(`\nRelatório completo: tools/audit-output/report.json`);
  });
});
