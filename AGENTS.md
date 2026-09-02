# AGENTS.md — Autonomous Agent Engineering Guidelines (QuímicaRush)

> **Project:** QuímicaRush — Hyper-Fast Organic Functions & IUPAC Nomenclature Training Platform  
> **Goal:** Guide autonomous orchestrators and parallel subagents for zero token waste, strict decoupled architecture, and rapid debugging.  
> **Language Rule:** All agent instructions and internal documentation must be in **English**. All end-user UI, chemical nomenclature, hints, and feedback must be implemented in **Portuguese (pt-BR)**.

---

## 1. Architectural Vision & Core Principles

This repository implements a high-velocity progressive web app for organic chemistry IUPAC training, featuring instantaneous 2D molecular rendering via **SmilesDrawer**, dual input modalities (Speedrunner Type & Interactive Slot Builder), morphological deconstructive correction with **granular partial credit**, and dopamine-driven arcade gamification ("Juice", procedural Web Audio API, and adaptive FSRS repetition).

### 1.1 Golden Rules for Agents (Token Efficiency & Zero Drift)
1. **Respect Package Boundaries:** The repository is divided into orthogonal packages. Only touch files within your assigned package scope.
2. **Context Economy:** NEVER dump entire JSON data files into the prompt context. Use `grep`, `head`, `jq`, or targeted test scripts.
3. **Strictly Typed Contracts:** All modules communicate via strict TypeScript interfaces and Zod schemas declared in `chemistry-core`. The use of `any` is strictly prohibited.
4. **No Hallucinated Review Gates:** There are no external release gates (Tessl, batch release skills, etc.). The only mandatory gate is passing automated `vitest` tests for the package under modification.
5. **Absolute Chemical Fidelity:** All chemical nomenclature rules must align with IUPAC guidelines (pt-BR) and the canonical source `funcoes.pdf`.

---

## 2. Modular Structure & Parallel Subagent Division of Labor

The repository supports up to **5 subagents working concurrently** without git merge conflicts or circular dependencies:

```
quimica-treino-organica/
├── PRD.md                             # Canonical product specification
├── funcoes.pdf                        # Theoretical source: 100% of organic functions
├── packages/
│   ├── chemistry-core/                # AGENT 1: IUPAC pt-BR Parser, AST, Partial Credit Evaluator
│   │   ├── src/
│   │   │   ├── types.ts               # CENTRAL CONTRACT: IUPACNameAST, EvaluationResult
│   │   │   ├── lexer.ts               # Tokenizer for radicals, prefixes, infixes, and suffixes
│   │   │   ├── parser.ts              # Recursive IUPAC morphological AST parser
│   │   │   ├── normalizer.ts          # Hyphen, accent, and case tolerance normalizer
│   │   │   └── evaluator.ts           # Weighted partial credit scoring engine
│   │   └── tests/                     # Unit test suite for the parser
│   ├── chemistry-dataset/             # AGENT 2: Canonical JSON Bank + Procedural Generator
│   │   ├── data/
│   │   │   ├── canonical-molecules.json  # 500+ curated molecules covering 100% of the PDF
│   │   │   └── synonyms-dictionary.json  # Common/trivial names (acetona, formol, ácido acético...)
│   │   ├── src/
│   │   │   ├── procedural-generator.ts   # Combinatorial generator with valence validation
│   │   │   ├── chaos-synthesizer.ts      # Bizarre polyfunctional molecule generator
│   │   │   └── dataset-provider.ts       # Difficulty and functional group filtering
│   │   └── tests/
│   ├── gamification-engine/           # AGENT 3: Procedural Web Audio API, FSRS, Combos & Multipliers
│   │   ├── src/
│   │   │   ├── sound-synth.ts         # Zero-latency procedural Web Audio synthesizer
│   │   │   ├── combo-manager.ts       # Streak scaling, multipliers (1x to 5x), and On Fire state
│   │   │   └── fsrs-queue.ts          # Adaptive repetition queue (+3 slots for immediate errors)
│   │   └── tests/
│   ├── smiles-renderer/               # AGENT 4: SmilesDrawer 2D React Wrapper
│   │   ├── src/
│   │   │   ├── SmilesCanvas.tsx       # 2D Canvas/SVG rendering component (<2ms latency)
│   │   │   └── theme.ts               # High-contrast atom palette (O red, N blue, Halogens green)
│   │   └── tests/
│   └── web-app/                       # AGENT 5: React 19 + Vite 6 + Tailwind CSS v4 PWA
│       ├── src/
│       │   ├── components/
│       │   │   ├── SpeedrunnerInput.tsx   # Fast keyboard typing interface
│       │   │   ├── SlotBuilder.tsx        # Morphological interactive chip builder
│       │   │   ├── FeedbackCard.tsx       # Deconstructive partial credit feedback card
│       │   │   ├── TheoryHub.tsx          # Dedicated Visual Codex & High-School Theory Tab
│       │   │   ├── HUD.tsx                # Streak counter, multiplier, timer, and XP bar
│       │   │   └── KeyboardShortcuts.tsx  # 100% keyboard navigation (1-9, Tab, Enter, Esc)
│       │   ├── stores/                    # Decoupled Zustand stores
│       │   └── db/                        # Dexie.js (local IndexedDB for offline history)
└── .agents/
    ├── AGENTS.md                      # Engineering guidelines (this document)
    └── skills/                        # Project-specific agent skills
```

---

## 3. Canonical Chemical Scope (Base `funcoes.pdf`)

Every agent working on questions, parser logic, or theory must implement 100% of these 16 functions:
1. **Hydrocarbons:** Alkanes (`-ano`), Alkenes (`-eno`), Alkynes (`-ino`), Alkadienes (`-dieno`), Cycloalkanes (`ciclo...ano`), Cycloalkenes (`ciclo...eno`), Aromatics (benzene, toluene, $o/m/p$-xylene, naphthalene).
2. **Alcohols:** Group $-OH$ on saturated C; suffix `-ol`; common: "álcool ...ílico" (ethanol, menthol, citronellol).
3. **Phenols:** Group $-OH$ attached directly to benzene ring; `hidroxibenzeno`, cresols ($o, m, p$), 1-naphthol, 2-naphthol.
4. **Enols:** Group $-OH$ on unsaturated C ($C=C$); suffix `-en-ol` (ethenol, prop-1-en-1-ol).
5. **Ethers:** Oxygen heteroatom bridging 2 carbons; `metoxietano` or "éter etil-metílico".
6. **Aldehydes:** Terminal carbonyl $H-C=O$; suffix `-al`; common: formaldeído, acetaldeído, citral (geranial & neral).
7. **Ketones:** Carbonyl $C=O$ between 2 carbons; suffix `-ona`; common: acetona (propanona), metil-etil-cetona.
8. **Carboxylic Acids:** Carboxyl group $-COOH$; `ácido ...-oico`; common: fórmico, acético, propiônico, butírico, valérico.
9. **Esters:** $-COO-$; `[hydrocarbon]-oato de [radical]-ila`; ethyl acetate, triacylglycerols, biodiesel.
10. **Amines:** Derived from $NH_3$; suffix `-amina` or radical+amine; primary, secondary, tertiary; $N$-alkyl notation; anilines.
11. **Amides:** Nitrogen bonded to carbonyl; suffix `-amida`; $N$-substituted; anilides, piperine, capsaicin.
12. **Nitriles:** $-C \equiv N$; suffix `-nitrila` (or cianeto de...); acrylonitrile, acetonitrile.
13. **Nitro Compounds:** Group $-NO_2$; prefix `nitro-` (e.g., 2-metil-1-nitropropano, TNT).
14. **Alkyl Halides:** $R-X$ ($F, Cl, Br, I$); halogen + hydrocarbon (chloromethane, DDT, chloroform).
15. **Acyl Halides:** $R-COX$; halide of `...oíla` (e.g., cloreto de etanoíla).
16. **Anhydrides:** Acid dehydration product; `anidrido ...oico` (acetic anhydride).

### 3.1 IUPAC Priority Order (Polyfunctional Compounds)
$$\text{Carboxylic Acid} > \text{Anhydride} > \text{Ester} > \text{Acyl Halide} > \text{Amide} > \text{Nitrile} > \text{Aldehyde} > \text{Ketone} > \text{Alcohol} > \text{Enol} > \text{Phenol} > \text{Amine} > \text{Ether} > \text{Halide} > \text{Nitro} > \text{Hydrocarbon}$$

### 3.2 Functions Acting as Radicals & Bizarre Molecules
In polyfunctional compounds, the dominant function takes the **suffix**, while all other functions become **radicals/prefixes**:
- Alcohol $\rightarrow$ `hidróxi-`
- Ketone / Aldehyde $\rightarrow$ `oxo-` / `formil-`
- Amine $\rightarrow$ `amino-`
- Nitrile $\rightarrow$ `ciano-`
- Halides $\rightarrow$ `flúor-`, `cloro-`, `bromo-`, `iodo-`
- Nitro $\rightarrow$ `nitro-`
- Ether $\rightarrow$ `metóxi-`, `etóxi-`
- Carboxylic Acid $\rightarrow$ `carboxi-` (when subordinated)
- Ester $\rightarrow$ `alcoxicarbonil-` or `acetóxi-`
- Amide $\rightarrow$ `carbamoil-`
- Complex branched radicals: `(clorometil)-`, `(hidroximetil)-`, `(2-aminoetil)-`, `(4-nitrofenil)-`.

---

## 4. Debugging Guide & Useful Commands

Commands for fast, low-token verification:

```bash
# Run all tests in the chemical core & parser
npm test -w packages/chemistry-core

# Test a specific test case in the evaluator
npx vitest run packages/chemistry-core/tests/evaluator.test.ts -t "ciclobenzeno"

# Validate JSON dataset integrity
node -e "const data = require('./packages/chemistry-dataset/data/canonical-molecules.json'); console.log('Total valid molecules:', data.length);"

# Start local web development server
npm run dev

# Production build and TypeScript type check
npm run build
```
