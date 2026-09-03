# QuímicaRush — Design System Specification (DESIGN.md)

> **Aesthetic Architecture & UI/UX Guidelines: Minimalist Material You (Slate Edition)**  
> **Design Philosophy:** Clean, Distraction-Free Material 3 with Distributed Side-Rails  
> **Language Rule:** English for architectural documentation; Brazilian Portuguese (**pt-BR**) for all user-facing labels, chemical nomenclature, hints, and feedback.  
> **Chemical Fidelity:** Strict alignment with IUPAC (pt-BR) and canonical reference `funcoes.pdf`. Molecule atom colors in SmilesCanvas remain canonical IUPAC colors.

---

## 1. Core Vision & Aesthetic Thesis: Minimalist Material You (Slate)

### 1.1 The Layout Revolution: Distributed Side-Rails & 100% Center Focus
Instead of a massive top header pushing down the molecular depiction, the interface distributes controls to the lateral boundaries of the viewport:

- **Left Navigation Rail (Desktop):** Segmented buttons for `[Treino]` / `[Compêndio]`, tool controls (Modo de Entrada, Conquistas, Áudio, Atalhos), and academic attribution at the bottom.
- **Center Stage (The Star):** 100% focused on the chemical structure, with zero vertical header clutter. The 2D molecular graph rests inside a clean, spacious Material 3 card (`rounded-3xl`, `surface-container`) directly followed by the interactive input.
- **Right Telemetry Rail (Desktop):** Live combo streaks, multipliers, score, level/XP progress, and difficulty/function filters.
- **Mobile Top Bar (< lg):** Ultra-compact 48px single-line bar without brand clutter, preserving maximum vertical screen real estate for the molecule.

### 1.2 Absolute Brand Cleanliness
- **Brandmark & Logo Eradicated:** The brand text and chemical symbols are completely omitted. No logos, no fake versions, no artificial jargon.
- **Pure Slate/Grey Palette:** A single, refined neutral slate Material 3 palette is active across the system. All colored theme switchers have been eliminated to ensure pure visual serenity and maximum contrast for molecular bonds and heteroatoms.
- **Untouched Molecule Atoms:** The 2D depiction in SmilesCanvas preserves canonical IUPAC heteroatom colors (Oxygen crimson red, Nitrogen electric blue, Halogens emerald green, Carbon slate).

---

### 3.2 Complete M3 Token Specifications (Dark & Light Modes)

All tokens follow the official **Material Design 3 Token Taxonomy** (`--md-sys-color-*`). The application supports both Dark (default) and Light modes via `[data-theme="..."][data-mode="..."]`.

```css
/* ==========================================================================
   QuímicaRush Monet Dynamic Theming Tokens
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CLOROFILA (Verde Menta / Sage) — Seed: #10B981
   -------------------------------------------------------------------------- */
[data-theme="clorofila"] {
  /* Dark Mode (Default) */
  --md-sys-color-primary: #6ee7b7;
  --md-sys-color-on-primary: #064e3b;
  --md-sys-color-primary-container: #065f46;
  --md-sys-color-on-primary-container: #a7f3d0;
  
  --md-sys-color-secondary: #a7f3d0;
  --md-sys-color-on-secondary: #064e3b;
  --md-sys-color-secondary-container: #134e4a;
  --md-sys-color-on-secondary-container: #ccfbf1;

  --md-sys-color-tertiary: #99f6e4;
  --md-sys-color-on-tertiary: #115e59;
  --md-sys-color-tertiary-container: #134e4a;
  --md-sys-color-on-tertiary-container: #ccfbf1;

  --md-sys-color-surface: #0c1410;
  --md-sys-color-surface-dim: #090f0c;
  --md-sys-color-surface-bright: #1c2a23;
  --md-sys-color-surface-container-lowest: #060a08;
  --md-sys-color-surface-container-low: #101a15;
  --md-sys-color-surface-container: #14201b;
  --md-sys-color-surface-container-high: #1c2b24;
  --md-sys-color-surface-container-highest: #24362e;

  --md-sys-color-on-surface: #e1ede6;
  --md-sys-color-on-surface-variant: #8ea89a;
  --md-sys-color-outline: #526b5e;
  --md-sys-color-outline-variant: #2d3f36;

  --md-sys-color-error: #fca5a5;
  --md-sys-color-on-error: #7f1d1d;
  --md-sys-color-error-container: #991b1b;
  --md-sys-color-on-error-container: #fee2e2;
}

[data-theme="clorofila"][data-mode="light"] {
  --md-sys-color-primary: #059669;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #d1fae5;
  --md-sys-color-on-primary-container: #064e3b;

  --md-sys-color-secondary: #0d9488;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #ccfbf1;
  --md-sys-color-on-secondary-container: #115e59;

  --md-sys-color-surface: #f7faf8;
  --md-sys-color-surface-dim: #ede3dd;
  --md-sys-color-surface-bright: #ffffff;
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f0f5f2;
  --md-sys-color-surface-container: #e6efe9;
  --md-sys-color-surface-container-high: #dde8e1;
  --md-sys-color-surface-container-highest: #d2e0d7;

  --md-sys-color-on-surface: #14201b;
  --md-sys-color-on-surface-variant: #42574c;
  --md-sys-color-outline: #728c7f;
  --md-sys-color-outline-variant: #c0d4ca;
}

/* --------------------------------------------------------------------------
   2. OCEANO (Azul Pixel / Deep Sky) — Seed: #0284C7
   -------------------------------------------------------------------------- */
[data-theme="oceano"] {
  --md-sys-color-primary: #7dd3fc;
  --md-sys-color-on-primary: #082f49;
  --md-sys-color-primary-container: #0369a1;
  --md-sys-color-on-primary-container: #e0f2fe;

  --md-sys-color-secondary: #bae6fd;
  --md-sys-color-on-secondary: #075985;
  --md-sys-color-secondary-container: #0c4a6e;
  --md-sys-color-on-secondary-container: #e0f2fe;

  --md-sys-color-surface: #0a1118;
  --md-sys-color-surface-dim: #070c12;
  --md-sys-color-surface-bright: #152230;
  --md-sys-color-surface-container-lowest: #04080c;
  --md-sys-color-surface-container-low: #0e1722;
  --md-sys-color-surface-container: #131e2b;
  --md-sys-color-surface-container-high: #1a2838;
  --md-sys-color-surface-container-highest: #233448;

  --md-sys-color-on-surface: #e0ecf7;
  --md-sys-color-on-surface-variant: #8ea4bb;
  --md-sys-color-outline: #4f6880;
  --md-sys-color-outline-variant: #283a4c;
}

/* --------------------------------------------------------------------------
   3. AMETISTA (Iris / Lavanda) — Seed: #7C3AED
   -------------------------------------------------------------------------- */
[data-theme="ametista"] {
  --md-sys-color-primary: #c4b5fd;
  --md-sys-color-on-primary: #2e1065;
  --md-sys-color-primary-container: #5b21b6;
  --md-sys-color-on-primary-container: #ede9fe;

  --md-sys-color-secondary: #ddd6fe;
  --md-sys-color-on-secondary: #4c1d95;
  --md-sys-color-secondary-container: #3b0764;
  --md-sys-color-on-secondary-container: #f5f3ff;

  --md-sys-color-surface: #120d1c;
  --md-sys-color-surface-dim: #0d0914;
  --md-sys-color-surface-bright: #241b36;
  --md-sys-color-surface-container-lowest: #08050e;
  --md-sys-color-surface-container-low: #171124;
  --md-sys-color-surface-container: #1f1730;
  --md-sys-color-surface-container-high: #281f3d;
  --md-sys-color-surface-container-highest: #34294f;

  --md-sys-color-on-surface: #f1edfa;
  --md-sys-color-on-surface-variant: #aba0c2;
  --md-sys-color-outline: #6d6185;
  --md-sys-color-outline-variant: #3b324d;
}

/* --------------------------------------------------------------------------
   4. TERRACOTA (Warm Sunset / Mel) — Seed: #EA580C
   -------------------------------------------------------------------------- */
[data-theme="terracota"] {
  --md-sys-color-primary: #fdba74;
  --md-sys-color-on-primary: #431407;
  --md-sys-color-primary-container: #9a3412;
  --md-sys-color-on-primary-container: #ffedd5;

  --md-sys-color-secondary: #fed7aa;
  --md-sys-color-on-secondary: #7c2d12;
  --md-sys-color-secondary-container: #451a03;
  --md-sys-color-on-secondary-container: #ffedd5;

  --md-sys-color-surface: #18110b;
  --md-sys-color-surface-dim: #110c07;
  --md-sys-color-surface-bright: #2d2118;
  --md-sys-color-surface-container-lowest: #0c0805;
  --md-sys-color-surface-container-low: #201710;
  --md-sys-color-surface-container: #291e15;
  --md-sys-color-surface-container-high: #34271c;
  --md-sys-color-surface-container-highest: #423225;

  --md-sys-color-on-surface: #faefe7;
  --md-sys-color-on-surface-variant: #baa497;
  --md-sys-color-outline: #7c685b;
  --md-sys-color-outline-variant: #49392e;
}

/* --------------------------------------------------------------------------
   5. PEÔNIA (Flamingo / Rose) — Seed: #E11D48
   -------------------------------------------------------------------------- */
[data-theme="peonia"] {
  --md-sys-color-primary: #fda4af;
  --md-sys-color-on-primary: #4c0519;
  --md-sys-color-primary-container: #9f1239;
  --md-sys-color-on-primary-container: #ffe4e6;

  --md-sys-color-secondary: #fecdd3;
  --md-sys-color-on-secondary: #881337;
  --md-sys-color-secondary-container: #4c0519;
  --md-sys-color-on-secondary-container: #ffe4e6;

  --md-sys-color-surface: #1a0e13;
  --md-sys-color-surface-dim: #12090d;
  --md-sys-color-surface-bright: #2f1b23;
  --md-sys-color-surface-container-lowest: #0d0609;
  --md-sys-color-surface-container-low: #221319;
  --md-sys-color-surface-container: #2b1921;
  --md-sys-color-surface-container-high: #38212b;
  --md-sys-color-surface-container-highest: #472b38;

  --md-sys-color-on-surface: #faebf0;
  --md-sys-color-on-surface-variant: #bfa5af;
  --md-sys-color-outline: #826a74;
  --md-sys-color-outline-variant: #4d3841;
}

/* --------------------------------------------------------------------------
   6. TITÂNIO (Slate / Grafite) — Seed: #475569
   -------------------------------------------------------------------------- */
[data-theme="titanio"] {
  --md-sys-color-primary: #cbd5e1;
  --md-sys-color-on-primary: #0f172a;
  --md-sys-color-primary-container: #334155;
  --md-sys-color-on-primary-container: #f1f5f9;

  --md-sys-color-secondary: #94a3b8;
  --md-sys-color-on-secondary: #1e293b;
  --md-sys-color-secondary-container: #1e293b;
  --md-sys-color-on-secondary-container: #f8fafc;

  --md-sys-color-surface: #101317;
  --md-sys-color-surface-dim: #0b0d10;
  --md-sys-color-surface-bright: #21262d;
  --md-sys-color-surface-container-lowest: #08090b;
  --md-sys-color-surface-container-low: #15191f;
  --md-sys-color-surface-container: #1b2027;
  --md-sys-color-surface-container-high: #242a33;
  --md-sys-color-surface-container-highest: #2f3642;

  --md-sys-color-on-surface: #f1f5f9;
  --md-sys-color-on-surface-variant: #94a3b8;
  --md-sys-color-outline: #64748b;
  --md-sys-color-outline-variant: #334155;
}
```

---

## 4. Typography System: Expressive, Human & Precise

Material Design 3 emphasizes expressive typography that balances friendly readability with rigorous technical utility.

### 4.1 Typeface Families
- **Display & Interface Sans:** `Outfit` (fallback: `Inter`, `system-ui`, `sans-serif`)
  - Warm geometric shapes with open apertures and rounded counters that feel native to Android 14+ Material You.
  - Used for: Brandmark, section headings, action buttons, difficulty labels, feedback messages.
- **Chemical & Telemetry Mono:** `Fira Code` (fallback: `JetBrains Mono`, `ui-monospace`, `monospace`)
  - **Mandatory IUPAC Rule:** Ligatures are explicitly disabled (`font-variant-ligatures: none;`) so locants and hyphens like `1,2-dimetil` or `->` remain distinct characters.
  - Used for: IUPAC names, molecular formulas ($C_4H_{10}O$), SMILES strings, keyboard hotkey tags (`[Enter]`, `[Tab]`), and speedrun timers.

### 4.2 Material 3 Type Scale

| M3 Token | Size | Line Height | Weight | Family | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | 32px (`2.0rem`) | 1.15 | 800 | Sans | Level-up dialogs, streak celebrations |
| **Headline Medium** | 22px (`1.375rem`)| 1.25 | 700 | Sans | Question prompt: *"Qual é a nomenclatura IUPAC?"* |
| **Title Medium** | 16px (`1.0rem`) | 1.3 | 600 | Sans | Section titles, modal headers, card labels |
| **Body Large (Mono)**| 18px (`1.125rem`)| 1.4 | 600 | Mono | User input text, active assembled IUPAC name |
| **Body Medium** | 14px (`0.875rem`)| 1.4 | 400 | Sans | Explanations, feedback hints, compendium descriptions |
| **Label Large** | 13px (`0.8125rem`)| 1.2 | 600 | Sans | Filter chips, button labels, tab switcher items |
| **Label Small (Mono)**| 11px (`0.6875rem`)| 1.2 | 500 | Mono | Formula pills (`C4H10O`), hotkey badges (`[1]`), stats |

---

## 5. Geometry, Elevation & Shape System

Material You uses intentional corner radii and tonal elevation rather than heavy drop shadows:

```
        SHAPE TAXONOMY
   Full Pill (9999px)   ───  Buttons, Segmented Switchers, Assist Chips, Theme Dots
   Extra-Large (28px)   ───  Molecule Presentation Card, Feedback Modal, Sheet
   Large (16px–20px)    ───  Input Field Container, SlotBuilder Category Bins
   Medium (12px)        ───  Morpheme Selector Chips, Cheatsheet Keys
```

### 5.1 The Tonal Elevation Hierarchy
Surfaces are elevated by stepping up the lightness and saturation of the container background token:

```
Lowest:  --md-sys-color-surface-container-lowest  (0dp  - Screen backdrop base)
Low:     --md-sys-color-surface-container-low     (1dp  - Subtle panel recesses)
Default: --md-sys-color-surface-container         (2dp  - Hero Molecule Card)
High:    --md-sys-color-surface-container-high    (3dp  - Text input well, modals)
Highest: --md-sys-color-surface-container-highest (4dp  - Active chips, floating menus)
```

---

## 6. Material 3 Component Specifications

```
+-----------------------------------------------------------------------------------------+
| TOP APP BAR (Material You Clean Header)                                                |
| [⚗️ QuímicaRush]  [ ⚡ Treino | 📖 Compêndio ]  [● ● ● ● ● ●]  [🔥 3] [⚡ 2.0x] [🔊] [⌨️]  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
| HERO MOLECULE CARD (Surface-Container, rounded-3xl, No Lasers!)                        |
| +-------------------------------------------------------------------------------------+ |
| | ( C4H10O )                                                      [ Intermediário ]   | |
| |                                                                                     | |
| |                     SMILESDRAWER 2D MOLECULAR CANVAS                                | |
| |                          (Crisp High-Contrast Bonds)                                | |
| |                                                                                     | |
| | Qual é a nomenclatura IUPAC oficial desta estrutura?                                | |
| | Digite a resposta ou utilize os blocos morfológicos abaixo                           | |
| +-------------------------------------------------------------------------------------+ |
|                                                                                         |
| DUAL INPUT SYSTEM                                                                       |
| Mode A: Speedrunner Input Field                                                         |
|   [ propan-2-ol                                                        ] [ Confirmar ↵] |
|   (i) Forma canônica reconhecida: propan-2-ol                                           |
|                                                                                         |
| Mode B: SlotBuilder Morphological Shelf                                                 |
|   Cadeia:     ( met ) ( et ) [ prop ] ( but ) ( pent ) ( hex )                          |
|   Infixo:     [ an ] ( en ) ( in ) ( dien )                                             |
|   Sufixo:     ( -o ) [ -ol ] ( -ona ) ( -al ) ( -oico ) ( -amina )                      |
|                                                                                         |
| FEEDBACK CARD (Tonal Deconstructive Card, Granular Progress Indicators)                |
+-----------------------------------------------------------------------------------------+
```

### 6.1 Top App Bar & Clean Brandmark
The header is clean, focused, and free of confusing sci-fi clutter:
- **Brandmark:**
  - Icon: Clean rounded squircle (`rounded-2xl`) with `primary-container` fill housing an organic chemistry flask or atom symbol.
  - Title: **QuímicaRush** in bold geometric sans (`Outfit`).
  - Subtitle: **Química Orgânica** in small muted `on-surface-variant`.
  - **REMOVED:** Fake version numbers (`v2.0`), sci-fi text (`ESPECTROMETRIA`), and laser glows.
- **Segmented Button Navigation:**
  - Material 3 Segmented Pill (`rounded-full`) switching between **Treino** (`activeTab === 'arcade'`) and **Compêndio** (`activeTab === 'theory'`).
  - Active segment fills with `primary-container` and `on-primary-container` text.
- **Monet Dynamic Palette Selector:**
  - A compact pill container (`surface-container-low`, `rounded-full`) displaying 6 circular color dots corresponding to the 6 seed themes (Clorofila, Oceano, Ametista, Terracota, Peônia, Titânio).
  - Clicking any dot instantly sets `document.documentElement.setAttribute('data-theme', themeName)` and persists it to `localStorage`.
  - The active palette dot is highlighted with a 2px offset ring in `primary`.
- **Tonal Status Chips:**
  - *Streak:* Soft amber tonal chip with flame icon (`🔥 3`).
  - *Multiplier:* Soft primary tonal chip (`⚡ 2.0x`).
  - *Score & Level:* Compact readable pills (`🏆 450` · `Nível 2`).
  - *Sound & Input Toggles:* Friendly circular icon buttons with subtle hover/pressed ripple states.

---

### 6.2 Molecule Presentation Card (Hero Stage)
The centerpiece of the entire learning experience:
- **Container:** Material 3 `surface-container` card with `rounded-3xl` (28px border-radius) and 1px `outline-variant` border.
- **Zero Distractions Guarantee:**
  - ❌ **NO laser scanning line** sweeping across the bonds.
  - ❌ **NO camera reticle L-brackets** in the corners.
  - ❌ **NO spinning conic border beams**.
  - ❌ **NO screen shake animations** on the molecule itself.
- **Top Row Context:**
  - Left: Formula Pill (`C4H10O`) in `surface-container-high` with `rounded-full` and monospace typography.
  - Right: Difficulty Chip (`Iniciante`, `Intermediário`, `Avançado`, `Caos`) in appropriate tonal pill.
- **Molecular Canvas:** SmilesDrawer renders with generous padding:
  - Background: Fully transparent to inherit the soft `surface-container`.
  - Bonds: Crisp high-contrast white/light-gray in dark mode (`#F1F5F9`), dark slate in light mode (`#0F172A`).
  - Canonical Heteroatoms: Oxygen in soft rose/red (`#F87171`), Nitrogen in sky/indigo (`#60A5FA`), Halogens in mint green (`#34D399`).
- **Prompt:** Friendly centered question headline: *"Qual é a nomenclatura IUPAC oficial desta estrutura?"* with clear, helpful guidance.

---

### 6.3 Speedrunner Input Field
Designed for rapid typing and zero keyboard friction:
- **Container:** Material 3 filled text field styling.
  - Background: `surface-container-high` (soft, inviting, non-glaring).
  - Border: 1px subtle `outline-variant` transitioning smoothly to 2px solid `primary` on focus.
  - Radius: `rounded-2xl` (16px) or `rounded-full` (24px).
  - Typography: Monospace (`Fira Code`), 18px size, ligatures disabled.
- **Normalizer Assist Pill:**
  - Below the input, a discreet assist badge shows the live canonical form as the student types (e.g. `2-propanol` $\rightarrow$ `propan-2-ol`), giving reassurance without interrupting flow.
- **Action Button:**
  - Integrated right-aligned Filled Button: *"Confirmar ↵"* with `primary` background and `on-primary` text (`rounded-xl`).

---

### 6.4 SlotBuilder (Interactive Morphological Shelf)
When students switch to morphological assembly mode, the interface presents Material 3 Filter & Assist Chips:
- **Clean Tonal Shelves:** Each morpheme class is grouped inside a soft `surface-container-low` shelf with a clear category title (`Classe`, `Cadeia Principal`, `Insaturação`, `Função Principal`, `Radicais`).
- **M3 Filter Chips:**
  - Shape: `rounded-full` or `rounded-xl`.
  - Unselected: `surface-container-high` background, `on-surface-variant` text, 1px `outline-variant` border.
  - Selected: `primary-container` fill, `on-primary-container` bold text, subtle checkmark or tonal ring.
  - Interaction: Gentle 100ms scale/spring transition (no harsh 3D bevels or fake skeuomorphism).
- **Assembled Name Preview:**
  - A prominent `surface-container-highest` pill at the top of the shelf displaying the live assembled IUPAC name with action buttons to clear or backspace.

---

### 6.5 Deconstructive Feedback Card (Partial Credit)
When an answer is submitted, the student receives instant, encouraging, and pedagogically clear feedback:
- **Card Shell:** Material 3 `surface-container-high` container with `rounded-3xl` and generous padding.
- **Tonal Score Badge:**
  - A large, friendly circular or pill badge displaying the percentage (`100% Excelente!`, `70% Quase lá!`, `40% Continue tentando`).
  - Tinted with semantic containers (`success-container`, `tertiary-container`, `error-container`).
- **4 Granular Linear Progress Bars:**
  - Rather than all-or-nothing grading, 4 rounded Material 3 progress bars display the deconstructed score:
    1. *Função Principal (40%):* Correct functional suffix identification.
    2. *Cadeia Principal (30%):* Carbon count and stem prefix (`met-`, `et-`, `prop-`, `but-`).
    3. *Insaturação (20%):* Bonds and infix (`-an-`, `-en-`, `-in-`, `-dien-`).
    4. *Radicais & Localizadores (10%):* Substituents and numbering.
- **Token Comparison:** Side-by-side comparison chips showing what the user typed versus the official IUPAC name, highlighting exactly where the difference lies.
- **Next Question Button:** Prominent M3 Filled Button (`primary` background, `rounded-full`, generous touch target) to immediately advance (`Próxima Molécula [Enter]`).

---

## 7. Concrete Implementation Guide for Web App

The following CSS utilities and Tailwind configuration implement this Material You design system directly.

### 7.1 Tailwind CSS Utility Class Mapping
When styling components in `packages/web-app/src/`:

```tsx
// Surface Backgrounds
className="bg-[var(--md-sys-color-surface)]"
className="bg-[var(--md-sys-color-surface-container)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]"
className="bg-[var(--md-sys-color-surface-container-high)] rounded-2xl"

// Primary Actions & Chips
className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-medium"
className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full"

// Muted Typography
className="text-[var(--md-sys-color-on-surface)]"
className="text-[var(--md-sys-color-on-surface-variant)]"
```

### 7.2 Monet Palette Switcher React Component Spec
A clean, accessible color dot selector for the top navigation bar:

```tsx
interface PaletteOption {
  id: 'clorofila' | 'oceano' | 'ametista' | 'terracota' | 'peonia' | 'titanio';
  label: string;
  seedColor: string;
}

const PALETTES: PaletteOption[] = [
  { id: 'clorofila', label: 'Clorofila', seedColor: '#10B981' },
  { id: 'oceano', label: 'Oceano', seedColor: '#0284C7' },
  { id: 'ametista', label: 'Ametista', seedColor: '#7C3AED' },
  { id: 'terracota', label: 'Terracota', seedColor: '#EA580C' },
  { id: 'peonia', label: 'Peônia', seedColor: '#E11D48' },
  { id: 'titanio', label: 'Titânio', seedColor: '#475569' },
];
```

---

## 8. Design Verification & Quality Gates

Before merging any UI changes, autonomous subagents and developers must verify:
1. **Zero Laser/Scanline Artifacts:** Does the molecule card contain any scanning lines, corner brackets, or spinning border animations? *If yes, reject immediately.*
2. **Palette Responsiveness:** Does switching `data-theme` cleanly re-tint all surfaces, text fields, chips, and progress bars without unstyled flashes?
3. **No Muddy Shadows:** Are surfaces elevated by their tonal container color (`surface-container-*`) rather than heavy diffuse black drop shadows?
4. **IUPAC Typography Rule:** Are all IUPAC names, formulas, and locants displayed in `font-mono` with `font-variant-ligatures: none;`?
5. **Reduced Motion:** If `prefers-reduced-motion` is active, all transitions are instant or gentle opacity fades.
6. **Mobile Ergonomics:** Are all touch targets on chips and segmented buttons at least 44px high with comfortable spacing on small screens?

---
*Authored by the QuímicaRush Material Design Architect. Maintained under Google Material Design 3 & Monet standards.*
