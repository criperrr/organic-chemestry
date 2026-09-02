import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { hidrocarbonetos } from './data-part1.js';
import { alcoois } from './data-part1.js';
import { fenois } from './data-part1.js';
import { enois } from './data-part1.js';
import { eteres } from './data-part2.js';
import { aldeidos } from './data-part2.js';
import { cetonas } from './data-part2.js';
import { acidosCarboxilicos } from './data-part2.js';
import { esteres } from './data-part3.js';
import { aminas } from './data-part3.js';
import { amidas } from './data-part3.js';
import { nitrilas } from './data-part3.js';
import { nitrocompostos } from './data-part4.js';
import { haletosAlquila } from './data-part4.js';
import { haletosAcila } from './data-part4.js';
import { anidridos } from './data-part4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../data/canonical-molecules.json');

const OrganicFunctionSchema = z.enum([
  'hidrocarboneto',
  'alcool',
  'fenol',
  'enol',
  'eter',
  'aldeido',
  'cetona',
  'acido_carboxilico',
  'ester',
  'amina',
  'amida',
  'nitrila',
  'nitrocomposto',
  'haleto_alquila',
  'haleto_acila',
  'anidrido',
]);

const MoleculeSchema = z.object({
  id: z.string().min(1),
  smiles: z.string().min(1),
  iupacName: z.string().min(1),
  commonNames: z.array(z.string()),
  primaryFunction: OrganicFunctionSchema,
  secondaryFunctions: z.array(OrganicFunctionSchema),
  difficulty: z.enum(['iniciante', 'intermediario', 'avancado', 'caos']),
  formula: z.string().min(1),
  realWorldStory: z.string().min(1),
  educationalContext: z.string().min(1),
});

const allGroups = [
  { name: 'hidrocarboneto', list: hidrocarbonetos },
  { name: 'alcool', list: alcoois },
  { name: 'fenol', list: fenois },
  { name: 'enol', list: enois },
  { name: 'eter', list: eteres },
  { name: 'aldeido', list: aldeidos },
  { name: 'cetona', list: cetonas },
  { name: 'acido_carboxilico', list: acidosCarboxilicos },
  { name: 'ester', list: esteres },
  { name: 'amina', list: aminas },
  { name: 'amida', list: amidas },
  { name: 'nitrila', list: nitrilas },
  { name: 'nitrocomposto', list: nitrocompostos },
  { name: 'haleto_alquila', list: haletosAlquila },
  { name: 'haleto_acila', list: haletosAcila },
  { name: 'anidrido', list: anidridos },
];

const masterList = [];
const seenIds = new Set();

for (const group of allGroups) {
  console.log(`Processing ${group.name}: ${group.list.length} molecules`);
  if (group.list.length < 20) {
    throw new Error(`Group ${group.name} has fewer than 20 molecules: ${group.list.length}`);
  }
  for (const mol of group.list) {
    if (seenIds.has(mol.id)) {
      throw new Error(`Duplicate id found: ${mol.id}`);
    }
    seenIds.add(mol.id);

    // Validate with Zod MoleculeSchema
    const parseRes = MoleculeSchema.safeParse(mol);
    if (!parseRes.success) {
      console.error(`Validation error in molecule ${mol.id}:`, parseRes.error.format());
      throw new Error(`Invalid molecule schema for ${mol.id}`);
    }

    masterList.push(mol);
  }
}

console.log(`Total validated molecules: ${masterList.length}`);
if (masterList.length < 500) {
  throw new Error(`Master list has fewer than 500 molecules: ${masterList.length}`);
}

fs.writeFileSync(outputPath, JSON.stringify(masterList, null, 2), 'utf-8');
console.log(`Successfully written canonical-molecules.json to ${outputPath}`);
