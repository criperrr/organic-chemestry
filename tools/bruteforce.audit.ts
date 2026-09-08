/**
 * Brute-force nomenclature audit.
 *
 * The existing audit (tools/nomenclature.audit.ts) runs the round trip over the
 * 560 curated molecules the app actually serves — a small, vestibular-biased
 * corpus. This one *generates* molecules from a seeded grammar so the engine
 * meets shapes nobody curated: deep branching, many substituents, rings with
 * awkward substitution, several functions at once.
 *
 * Round trip: SMILES -> engine -> pt-BR name -> translator -> OPSIN -> SMILES,
 * compared by Weisfeiler-Leman fingerprint (order- and Kekule-invariant).
 *
 * A passing round trip only proves the name is *unambiguous*, not that it is the
 * preferred IUPAC name: "but-3-yne" and "but-1-yne" both round-trip to the same
 * structure. So a second, independent pass lints the produced name against rules
 * checkable from the string alone (locant minimality on a chain, alphabetical
 * order of prefixes, multiplying prefix vs. locant count, bracket balance).
 */
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

const OPSIN_JAR = resolve(process.cwd(), 'tools-opsin-2.9.0.jar');
const OUT_DIR = resolve(process.cwd(), 'tools/audit-output');
const COUNT = Number(process.env.BRUTE_COUNT ?? 3000);
// A fixed seed keeps the corpus reproducible; override it to check that a clean
// run is the engine being right, not the harness having been tuned to one draw.
const SEED = Number(process.env.BRUTE_SEED ?? 20260908);

// --------------------------------------------------------------------------
// Seeded RNG — the corpus must be identical from run to run, or a regression
// caught today is unreproducible tomorrow.
// --------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------------------------------------------------------
// SMILES generator
// --------------------------------------------------------------------------
type Rand = () => number;
const pick = <T,>(r: Rand, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const chance = (r: Rand, p: number) => r() < p;

/** Substituents that attach through a single bond and never need a ring index. */
const SIDE_GROUPS = [
  'C', 'CC', 'CCC', 'C(C)C', 'CCCC', 'C(C)(C)C', 'CC(C)C',
  'F', 'Cl', 'Br', 'I',
  'O', 'N', 'OC', 'OCC', 'N(C)C', 'NC',
  'C=O', 'C(=O)O', 'C(=O)C', 'C(=O)N', 'C(=O)Cl', 'C#N', '[N+](=O)[O-]',
  'c1ccccc1', 'C1CC1', 'C1CCC1', 'C1CCCCC1',
] as const;

/** Groups valid only at a chain terminus (they cap the chain). */
const TERMINAL_GROUPS = ['C=O', 'C(=O)O', 'C#N', 'C(=O)N', 'C(=O)Cl', 'C(=O)OC'] as const;

const RINGS = [
  'c1ccccc1', 'C1CCCCC1', 'C1CCCC1', 'C1CCC1', 'C1CC1',
  'c1ccncc1', 'C1CCNCC1', 'C1CCOCC1', 'C1CCOC1', 'C1CCNC1',
  'c1ccsc1', 'c1ccoc1', 'c1cc[nH]c1',
] as const;

/** Open ring template into a substituted one, e.g. c1ccccc1 + [Cl] -> Clc1ccccc1. */
function substituteRing(r: Rand, ring: string, groups: string[]): string {
  let out = '';
  let placed = 0;
  for (let i = 0; i < ring.length; i++) {
    const ch = ring[i];
    out += ch;
    // Only insert after a plain ring atom that carries no ring-closure digit and
    // is not the bracketed [nH]; anything else would corrupt the SMILES.
    const next = ring[i + 1];
    const isPlainAtom = /[Cc]/.test(ch);
    const nextIsDigit = next !== undefined && /\d/.test(next);
    if (placed < groups.length && isPlainAtom && !nextIsDigit && chance(r, 0.55)) {
      out += `(${groups[placed++]})`;
    }
  }
  return out;
}

function randomChain(r: Rand, len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    if (i > 0) {
      // Unsaturation, but never between two atoms that already carry one.
      const prevUnsat = /[=#]C?\)?$/.test(out.slice(-3));
      if (!prevUnsat && chance(r, 0.15)) out += '=';
      else if (!prevUnsat && chance(r, 0.06)) out += '#';
    }
    out += 'C';
    if (i > 0 && i < len - 1 && chance(r, 0.3)) {
      out += `(${pick(r, SIDE_GROUPS)})`;
    }
  }
  return out;
}

/**
 * Rejects SMILES where a ring-closure digit is reopened while still open.
 * The engine's parser accepts those silently and names the resulting garbage,
 * which is a finding of its own — but it must not be counted as a naming error.
 */
function ringDigitsAreSane(smiles: string): boolean {
  const open = new Set<string>();
  for (let i = 0; i < smiles.length; i++) {
    const ch = smiles[i];
    if (ch === '[') { while (i < smiles.length && smiles[i] !== ']') i++; continue; }
    if (!/\d/.test(ch)) continue;
    if (open.has(ch)) open.delete(ch);
    else open.add(ch);
  }
  return open.size === 0;
}

function generate(r: Rand): string {
  const family = Math.floor(r() * 6);

  switch (family) {
    case 0: // pure branched alkane / alkene / alkyne
      return randomChain(r, 3 + Math.floor(r() * 8));

    case 1: { // chain with a terminal function
      const chain = randomChain(r, 2 + Math.floor(r() * 7));
      return chain + pick(r, TERMINAL_GROUPS);
    }

    case 2: { // substituted ring
      const ring = pick(r, RINGS);
      const n = 1 + Math.floor(r() * 3);
      const groups = Array.from({ length: n }, () => pick(r, SIDE_GROUPS));
      return substituteRing(r, ring, groups);
    }

    case 3: { // ring joined to a chain
      const ring = pick(r, RINGS);
      const chain = randomChain(r, 1 + Math.floor(r() * 5));
      return chance(r, 0.5)
        ? `${chain}${ring}`
        : `${chain}${pick(r, TERMINAL_GROUPS)}`.replace(/^C/, `${ring}C`);
    }

    case 4: { // polyfunctional chain
      const chain = randomChain(r, 4 + Math.floor(r() * 5));
      return chain + pick(r, TERMINAL_GROUPS);
    }

    default: { // ester / ether / amide bridges
      const a = randomChain(r, 1 + Math.floor(r() * 4));
      const b = randomChain(r, 1 + Math.floor(r() * 4));
      return pick(r, [`${a}C(=O)O${b}`, `${a}O${b}`, `${a}C(=O)N${b}`, `${a}C(=O)${b}`]);
    }
  }
}

// --------------------------------------------------------------------------
// Fingerprint (same scheme as the curated audit)
// --------------------------------------------------------------------------
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
          const bond = graph.bonds.get(edge.bondId);
          const order = bond?.aromatic ? 'a' : String(edge.order);
          return `${order}:${labels.get(edge.neighborId) ?? ''}`;
        })
        .sort()
        .join('|');
      next.set(atom.id, `${labels.get(atom.id)}(${neighbours})`);
    }
    const pool = [...new Set(next.values())].sort();
    labels = new Map([...next].map(([id, label]) => [id, String(pool.indexOf(label))]));
  }
  return [...labels.values()].sort().join(',');
}

// --------------------------------------------------------------------------
// Name linters — independent of OPSIN, they judge the *form* of the pt-BR name
// --------------------------------------------------------------------------
const CHAIN_STEMS: Record<string, number> = {
  met: 1, et: 2, prop: 3, but: 4, pent: 5, hex: 6, hept: 7, oct: 8, non: 9, dec: 10,
  undec: 11, dodec: 12, tridec: 13, tetradec: 14, pentadec: 15,
};
const MULTIPLIERS: Record<string, number> = { di: 2, tri: 3, tetra: 4, penta: 5, hexa: 6 };

function lintName(name: string): string[] {
  const problems: string[] = [];
  if (!name) return ['nome vazio'];

  // Bracket balance.
  let depth = 0;
  for (const ch of name) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) problems.push('parênteses desbalanceados');

  // Cosmetic defects that mean the assembler concatenated blindly.
  if (/--|,,|-,|,-/.test(name)) problems.push('pontuação duplicada');
  if (/^-|-$/.test(name)) problems.push('hífen solto na borda');
  if (/\d[a-zA-Z]/.test(name.replace(/\d(?=[a-z])/g, m => m))) {
    // number glued to a letter without a hyphen, e.g. "2metil"
    if (/\d(?![,\-\d])/.test(name)) problems.push('localizador colado ao morfema');
  }

  // Multiplying prefix must agree with the number of locants in front of it.
  // "penta"/"hexa" are also chain stems ("4-pentanoiloxi…"), so a following
  // "no" means we are looking at a stem, not at a multiplier.
  for (const m of name.matchAll(/((?:\d+|N'*)(?:,(?:\d+|N'*))*)-(di|tri|tetra|penta|hexa)(?!no)(?=[a-z])/g)) {
    const locants = m[1].split(',').length;
    const expected = MULTIPLIERS[m[2]];
    if (locants !== expected) {
      problems.push(`"${m[2]}" com ${locants} localizador(es)`);
    }
  }

  // Locant minimality on an acyclic parent.
  //
  // Reflecting a chain of n atoms (l -> n+1-l) is the only alternative numbering
  // it has, so if the reflected locant set is lower the numbering was wrong.
  // The comparison must respect the IUPAC hierarchy — principal suffix first,
  // then unsaturation, then substituent prefixes — otherwise "5-cloro-heptanal"
  // reads as a defect when C1 is in fact pinned by the aldehyde.
  const isRingish =
    /ciclo|benzeno|fenil|naftal|piri|pirr|furan|tiofen|oxan|oxolan|piperi|morfolin|imidazol|pirazol|anidrido|azetidin|aziridin|oxiran|tiiran|tiolan|pirazin/.test(
      name
    );
  const stemRe =
    /(met|et|prop|but|pent|hex|hept|oct|non|dec|undec|dodec|tridec|tetradec|pentadec)(?=(an|en|in)[\-aoi])/;
  const headline = name.split(' de ')[0];
  // Parenthesised radicals carry stems and locants of their own; they belong to
  // the substituent, not to the parent, and reading them as the parent's made
  // "1-(eteniloxi)but-2-eno" look like an ethane numbered wrong. Blanking them
  // keeps every index aligned with `headline`, so the stem found here still
  // points at the right place in the real name.
  const skeleton = headline.replace(/\([^()]*\)/g, m => ' '.repeat(m.length));
  const stemMatch = skeleton.match(stemRe);
  // Terminal suffixes pin C1 by definition — there is nothing to minimise.
  const hasTerminalSuffix = /(al|onitrila|nitrila|oico|oato|oíla|amida)\b/.test(name);

  // prop-1-ene is written "propeno": with the locant omitted there is nothing
  // to compare, so the minimality test would read the substituent locant alone.
  const unsatLocantOmitted =
    /(?:en|in)(?:o|a|il)/.test(skeleton) && !/-\d(?:,\d+)*-a?(?:di|tri)?(?:en|in)/.test(skeleton);
  if (stemMatch && !isRingish && !hasTerminalSuffix && !unsatLocantOmitted) {
    const n = CHAIN_STEMS[stemMatch[1]];
    const head = skeleton.slice(0, stemMatch.index);
    const tail = skeleton.slice(stemMatch.index!);

    const nums = (s: string) => [...s.matchAll(/\d+/g)].map(m => Number(m[0]));
    // In the tail, locants sitting in front of "en"/"in" are unsaturation;
    // whatever remains belongs to the principal suffix.
    const unsat: number[] = [];
    for (const m of tail.matchAll(/-(\d(?:,\d+)*)-a?(?:di|tri|tetra)?(?:en|in)/g)) {
      unsat.push(...m[1].split(',').map(Number));
    }
    const suffixLoc = nums(tail).filter(x => {
      const idx = unsat.indexOf(x);
      if (idx >= 0) { unsat.splice(idx, 1); unsat.push(x); return false; }
      return true;
    });
    for (const m of tail.matchAll(/-(\d(?:,\d+)*)-a?(?:di|tri|tetra)?(?:en|in)/g)) void m;
    const unsatLoc: number[] = [];
    for (const m of tail.matchAll(/-(\d(?:,\d+)*)-a?(?:di|tri|tetra)?(?:en|in)/g)) {
      unsatLoc.push(...m[1].split(',').map(Number));
    }
    const substLoc = nums(head);

    const tiers = [suffixLoc, unsatLoc, substLoc];
    const all = tiers.flat();
    if (n && all.length > 0 && all.every(l => l >= 1 && l <= n)) {
      const cmp = (a: number[], b: number[]) => {
        const A = [...a].sort((x, y) => x - y);
        const B = [...b].sort((x, y) => x - y);
        for (let i = 0; i < Math.min(A.length, B.length); i++) {
          if (A[i] !== B[i]) return A[i] - B[i];
        }
        return 0;
      };
      for (const tier of tiers) {
        if (tier.length === 0) continue;
        const c = cmp(tier.map(l => n + 1 - l), tier);
        if (c < 0) {
          problems.push(`localizadores nao minimos (${tier} em C${n})`);
          break;
        }
        if (c > 0) break;
      }
    }
  }

  // Substituent prefixes must be cited in alphanumerical order (P-14.5.2):
  // compared on the complete substituent name, ignoring multiplying prefixes
  // and the italicised "terc"/"sec"/"n" markers.
  let head = stemMatch ? headline.slice(0, stemMatch.index) : '';
  head = head.replace(/^(ácido|anidrido)\s+/, '').replace(/^\w+\s+de\s+/, '').split(' de ')[0];
  if (head) {
    // A new citation begins only after a locant, so split on top-level hyphens
    // that are followed by one.
    const segments: string[] = [];
    let depth = 0;
    let buf = '';
    for (let i = 0; i < head.length; i++) {
      const ch = head[i];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === '-' && depth === 0 && /[\dN]/.test(head[i + 1] ?? '')) {
        segments.push(buf);
        buf = '';
        continue;
      }
      buf += ch;
    }
    segments.push(buf);

    const keys = segments
      .map(seg =>
        seg
          .replace(/^(?:\d+|N'*)(?:,(?:\d+|N'*))*-?/, '')   // leading locants
          .replace(/^(di|tri|tetra|penta|hexa|bis|tris)(?=[a-zà-ú(])/, '') // multipliers
          .replace(/[()\d,-]/g, '')                      // punctuation, inner locants
          .replace(/^(terc|sec|iso)?/, m => (m === 'iso' ? 'iso' : ''))    // italics ignored
      )
      .filter(k => k.length > 2);

    for (let i = 1; i < keys.length; i++) {
      if (keys[i - 1].localeCompare(keys[i], 'pt-BR') > 0) {
        problems.push(`prefixos fora de ordem alfabetica (${keys[i - 1]} antes de ${keys[i]})`);
        break;
      }
    }
  }

  return problems;
}

type Verdict =
  | 'ok'
  | 'engine_refused'
  | 'engine_threw'
  | 'not_translated'
  | 'opsin_rejected'
  | 'structure_mismatch';

interface Row {
  smiles: string;
  ptName: string;
  enName: string | null;
  opsinSmiles: string | null;
  verdict: Verdict;
  lint: string[];
  refusal?: string;
}

describe('Brute-force nomenclature audit', () => {
  it('generates molecules and round-trips every produced name', () => {
    if (!existsSync(OPSIN_JAR)) {
      console.log(`OPSIN jar não encontrado em ${OPSIN_JAR} — auditoria ignorada.`);
      return;
    }

    const r = mulberry32(SEED);
    const corpus = new Set<string>();
    let guard = 0;
    while (corpus.size < COUNT && guard++ < COUNT * 30) {
      const smiles = generate(r);
      try {
        // Only keep what our own parser accepts; a generator typo must not be
        // reported as an engine failure.
        if (!ringDigitsAreSane(smiles)) continue;
        const g = createGraphFromSMILES(smiles);
        if (g.atoms.size < 2 || g.atoms.size > 40) continue;
        corpus.add(smiles);
      } catch {
        /* discard malformed generation */
      }
    }
    console.log(`Corpus gerado: ${corpus.size} moléculas\n`);

    const rows: Row[] = [];
    const pending: { index: number; enName: string }[] = [];

    for (const smiles of corpus) {
      const row: Row = {
        smiles, ptName: '', enName: null, opsinSmiles: null, verdict: 'ok', lint: [],
      };
      let analysis;
      try {
        analysis = analyzeMolecularGraph(createGraphFromSMILES(smiles));
      } catch (err) {
        row.verdict = 'engine_threw';
        row.ptName = String((err as Error).message).slice(0, 120);
        rows.push(row);
        continue;
      }
      row.ptName = analysis.iupacName2013;

      if (!analysis.isNameable) {
        row.verdict = 'engine_refused';
        row.refusal = (analysis.problems ?? []).map((p: { code?: string }) => p.code ?? '?').join(',');
        rows.push(row);
        continue;
      }

      row.lint = lintName(analysis.iupacName2013);

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

    const opsinOut = execFileSync(
      'java',
      ['-jar', OPSIN_JAR, '-o', 'smi'],
      { input: pending.map(p => p.enName).join('\n') + '\n', encoding: 'utf8', maxBuffer: 1 << 28 }
    ).split('\n');

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
    const linted = rows.filter(x => x.lint.length > 0);

    console.log('=== RESULTADO ===');
    console.log(`total                ${total}`);
    console.log(`round-trip OK        ${ok}  (${((ok / total) * 100).toFixed(1)}%)`);
    for (const v of [
      'structure_mismatch', 'opsin_rejected', 'not_translated', 'engine_refused', 'engine_threw',
    ] as Verdict[]) {
      console.log(`${v.padEnd(20)} ${tally.get(v) ?? 0}`);
    }
    console.log(`lint reprovado       ${linted.length}`);

    const lintTally = new Map<string, number>();
    for (const row of linted) {
      for (const p of row.lint) {
        const key = p.replace(/\(.*\)/, '(...)');
        lintTally.set(key, (lintTally.get(key) ?? 0) + 1);
      }
    }
    if (lintTally.size > 0) {
      console.log('\n=== LINT ===');
      for (const [k, v] of [...lintTally].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${String(v).padStart(4)}  ${k}`);
      }
    }

    console.log('\n=== AMOSTRAS ===');
    for (const v of ['structure_mismatch', 'opsin_rejected', 'not_translated', 'engine_threw'] as Verdict[]) {
      const sample = rows.filter(x => x.verdict === v).slice(0, 15);
      if (!sample.length) continue;
      console.log(`\n-- ${v} (${tally.get(v)}) --`);
      for (const row of sample) {
        console.log(`  ${row.smiles}\n    pt: ${row.ptName}\n    en: ${row.enName ?? '-'}\n    opsin: ${row.opsinSmiles ?? '-'}`);
      }
    }
    const lintSample = linted.slice(0, 15);
    if (lintSample.length) {
      console.log(`\n-- lint (${linted.length}) --`);
      for (const row of lintSample) {
        console.log(`  ${row.smiles}\n    pt: ${row.ptName}\n    ! ${row.lint.join(' | ')}`);
      }
    }

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(resolve(OUT_DIR, 'bruteforce-report.json'), JSON.stringify(rows, null, 2));
    console.log('\nRelatório: tools/audit-output/bruteforce-report.json');
  });
});
