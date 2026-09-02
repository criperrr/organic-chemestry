# PRD — QuímicaRush (Hyper-Fast Organic Functions & IUPAC Nomenclature Training Platform)

> **Status:** Approved for Parallel Multi-Agent Implementation  
> **Version:** 2.0.0  
> **Author:** Antigravity AI Architecture Team  
> **Date:** 2026-09-01  
> **Theoretical Foundation:** `funcoes.pdf` (Prof. Anderson Oliveira, CEASM / Fundação Cecierj)  
> **Target Audience:** Brazilian High School (Ensino Médio), ENEM, and College Prep (Vestibulares) Students  
> **Application Language:** Portuguese (pt-BR) for all student-facing UI, nomenclature, and educational copy.  
> **Engineering Specification Language:** English (for maximum token efficiency and agent comprehension).

---

## 1. Executive Summary & Value Proposition

### 1.1 The Core Problem in Organic Chemistry Education
Mastering organic chemistry nomenclature and functional groups is universally plagued by four major bottlenecks:
1. **Monolithic Cognitive Overload:** Students attempt to memorize chemical names as monolithic strings without grasping their morphological syntax (`Prefix (Carbons)` + `Infix (Bonds)` + `Suffix (Function)` + `Radical Substituents` + `Locants`).
2. **Punitive Binary Feedback:** Traditional quiz software grades answers as either 0% or 100%. If a student enters `ciclobenzeno` instead of `ciclo-hexano` (or `ciclo-hexeno`), they receive zero credit, causing frustration and breaking learning flow.
3. **High Interaction Latency:** Academic web tools are bloated with multiple page reloads, spinners, and sluggish chemical sketchers that make high-volume active recall impossible.
4. **Disconnection from Real-World Context:** High school students memorize abstract Lewis structures without understanding that esters are the smell of banana, carboxylic acids cause ant sting pain, and amides make black pepper and tear gas pungent.

### 1.2 The Solution: QuímicaRush
QuímicaRush is a dual-engine progressive web application (PWA) built for:
- **Instantaneous 2D Molecular Visualization (< 2ms):** Ultra-lightweight rendering via *SmilesDrawer* over Canvas/SVG with high-contrast atom color palettes.
- **Dual Input Modality:**
  - *Speedrunner Type Mode:* High-speed freeform typing with automatic fuzzy normalization (hyphens, accents, IUPAC 1993 vs 2013 rules).
  - *Interactive Slot/Token Builder:* Visual morphological builder with chips for prefixes, infixes, functional suffixes, simple radicals, subordinated functional radicals, and complex parenthesized branches.
- **Deconstructive AST Correction & Granular Partial Credit:** An intelligent parser that evaluates sub-components and awards fractional scores with pinpoint morphological feedback (e.g., granting 70% partial credit for identifying cyclic structure and hydrocarbon function, while highlighting bond saturation errors).
- **Dopamine-Maxxing Arcade Flow ("Juice"):** Native procedural sound synthesizer via Web Audio API (ascending pentatonic scales on combo streaks, zero MP3 network latency), micro-shakes, particle effects, streak multipliers, and an adaptive FSRS flash repetition queue.
- **The "Bizarre" Polyfunctional Chaos Engine:** Full support for functional groups acting as **radicals/prefixes**, complex branched substituents, and multi-functional molecules with priority conflict resolution.
- **Dedicated Interactive Theory & Codex Tab ("Compêndio Visual"):** An isolated, high-yield study hub with clear visual nomenclature blueprints and rich real-world stories (100% based on `funcoes.pdf`) designed specifically for high school comprehension.
- **Parallel AI Multi-Agent Architecture:** Fully decoupled, spec-driven packages with zero circular dependencies, designed for multi-agent autonomous implementation with optimal token efficiency.

---

## 2. Complete Canonical Chemical Scope (100% of `funcoes.pdf`)

The application supports all 16 functional classes, systematic IUPAC nomenclature (pt-BR), and historical/common names established in `funcoes.pdf`:

| ID | Functional Class | General Structure | IUPAC Suffix / Infix (pt-BR) | Accepted Common Names & Trivial Variants | Textbook & Real-World Examples from PDF |
|---|---|---|---|---|---|
| **F01** | **Hydrocarbons (Acyclic)** | $R-H$ ($C_n H_{2n+2}, C_n H_{2n}, \dots$) | Infixes `-an-`, `-en-`, `-in-`, `-dien-`; Suffix `-o` | Ethene (ethylene), ethyne (acetylene) | But-2-ene, Propa-1,2-diene, 2-methylpropane |
| **F02** | **Cyclic & Aromatic Hydrocarbons** | Homocyclic rings and benzene rings | Prefix `ciclo-`, ending `-benzeno`, `tolueno` | Positions ortho ($o$-), meta ($m$-), para ($p$-); naphthalene | Cyclohexane, Methylcyclobutane, $p$-xylene, Naphthalene |
| **F03** | **Alcohols** | $R-OH$ on $sp^3$ saturated carbon | Suffix `-ol` (locants 1, 2... for $C \ge 3$) | "Álcool [radical]ílico" (ethyl alcohol, isopropyl alcohol) | Ethanol, Menthol, Citronellol, Propan-2-ol |
| **F04** | **Phenols** | $Ar-OH$ ($-OH$ attached directly to benzene ring) | Prefix `hidróxi-` + aromatic or suffix `-fenol` | Carbolic acid, Cresols ($o, m, p$), 1-naphthol, 2-naphthol | Hydroxybenzene (common phenol), $o$-cresol |
| **F05** | **Enols** | $R-C=C-OH$ ($-OH$ on $sp^2$ unsaturated carbon) | Infix `-en-` + suffix `-ol` | Keto-enol tautomerism equilibrium | Ethenol, Prop-1-en-1-ol, But-2-en-2-ol |
| **F06** | **Ethers** | $R-O-R'$ (oxygen heteroatom bridging 2 carbons) | Shorter radical prefix + `óxi` + longer alkane | "Éter [rad 1] [rad 2]ílico" (alphabetical) | Methoxyethane (ethyl methyl ether), Diethyl ether |
| **F07** | **Aldehydes** | $R-CHO$ (terminal formyl group $H-C=O$) | Suffix `-al`, `-dial` | Acid stem + `aldeído` or common prefix | Methanal (Formaldehyde), Ethanal (Acetaldehyde), Benzaldehyde, Citral (Geranial & Neral) |
| **F08** | **Ketones** | $R-CO-R'$ (carbonyl between 2 carbons) | Suffix `-ona`, `-diona` | "[Shorter rad]-[longer rad]-cetona" | Propanone (Acetone / Dimethyl ketone), Butan-2-one, Cyclohexanone |
| **F09** | **Carboxylic Acids** | $R-COOH$ (carboxyl group $C(=O)OH$) | Prefix `ácido` + stem + `-oico` | Formic (1C), Acetic (2C), Propionic (3C), Butyric (4C), Valeric (5C), Caproic (6C) | Methanoic acid, Ethanoic acid, Butanoic acid, Benzoic acid |
| **F10** | **Esters** | $R-COO-R'$ (carbonyl bonded to ether oxygen and alkyl) | Hydrocarbon stem-`-oato` de [alkyl]-`ila` | Derived from trivial acids (Ethyl acetate, Methyl formate) | Ethyl ethanoate, Triacylglycerols / Triglycerides, Biodiesel |
| **F11** | **Amines** | $R-NH_2, R-NHR', R-NR'R''$ (ammonia derivatives) | Radical alphabetical + `-amina` or stem-`-amina` (with $N$-alkyl) | Aniline (phenylamine), primary/sec/tert amines | Methanamine, $N$-methylethanamina, Aniline, Triethylamine |
| **F12** | **Amides** | $R-CONH_2, R-CONHR'$ | Hydrocarbon stem + `-amida` (with $N$-substituents) | Derived from acids; Anilides (from aniline) | Ethanamide (Acetamide), $N$-methylpropanamide, Piperine, Capsaicin |
| **F13** | **Nitriles** | $R-C \equiv N$ (triple bond carbon-nitrogen) | Hydrocarbon stem + `-nitrila` or alkyl cyanide | Trivial acid derivatives (`acrilonitrila`, `acetonitrila`) | Ethanenitrile (Acetonitrile), Acrylonitrile (Propenenitrile), Benzonitrile |
| **F14** | **Nitro Compounds** | $R-NO_2$ (nitro group on carbon chain) | Prefix `nitro-` with carbon locants | Mono, di, and trinitro compounds | 2-Methyl-1-nitropropane, 2-Nitrohexane, 3-Methyl-1,2-dinitrocyclohexane, TNT |
| **F15** | **Alkyl Halides** | $R-X$ ($X = F, Cl, Br, I$) | `flúor-`, `cloro-`, `bromo-`, `iodo-` + alkane | Alkyl halide (e.g. ethyl chloride, methyl bromide) | Chloromethane, DDT, Chloroform, Freons/CFCs |
| **F16** | **Acyl Halides** | $R-COX$ ($-OH$ of acid replaced by halogen) | Halide de [stem]-`oíla` | Acetyl chloride, Benzoyl bromide | Ethanoyl chloride, Propanoyl fluoride |
| **F17** | **Acid Anhydrides** | $R-CO-O-CO-R'$ (acid dehydration product) | Word `anidrido` + parent acid stems | Acetic anhydride | Ethanoic anhydride, Ethanoic propanoic anhydride |

---

## 3. Advanced Polyfunctionality, Functional Radicals & "Bizarre" Molecules

### 3.1 IUPAC Priority Hierarchy (Master Rule)
When a molecule contains multiple functional groups, **only one group** (the highest in priority) acts as the principal functional group and dictates the **suffix**. **All other functional groups are subordinated and must be named as substituent radicals (prefixes)**:

$$\text{Carboxylic Acid} > \text{Anhydride} > \text{Ester} > \text{Acyl Halide} > \text{Amide} > \text{Nitrile} > \text{Aldehyde} > \text{Ketone} > \text{Alcohol} > \text{Enol} > \text{Phenol} > \text{Amine} > \text{Ether} > \text{Halide} > \text{Nitro} > \text{Hydrocarbon}$$

### 3.2 Complete Functional Group as Radicals Mapping Table

| Functional Group | Chemical Moiety | When Principal Function (Suffix) | When Acting as Subordinated Radical (Prefix) |
|---|---|---|---|
| **Carboxylic Acid** | $-COOH$ | `-oico` (e.g., ácido butanoico) | `carboxi-` (when outside main chain) |
| **Anhydride** | $-CO-O-CO-$ | `anidrido ...oico` | `alcanoilóxi-` (e.g., acetilóxi-) |
| **Ester** | $-COO-R$ | `-oato de ...ila` | `alcoxicarbonil-` (`metoxicarbonil-`) or `acilóxi-` (`acetóxi-`) |
| **Acyl Halide** | $-COX$ ($X=Cl, Br\dots$) | `-oíla` | `haloformil-` or `halocarbonil-` (`clorocarbonil-`) |
| **Amide** | $-CONH_2, -CONHR$ | `-amida` | `carbamoil-` (via C) or `alcanamido-` (`acetamido-`, via N) |
| **Nitrile** | $-C \equiv N$ | `-nitrila` | `ciano-` |
| **Aldehyde** | $-CHO$ | `-al` | `oxo-` (in main chain) or `formil-` (as branched radical) |
| **Ketone** | $-CO-$ | `-ona` | `oxo-` |
| **Alcohol** | $-OH$ (saturated) | `-ol` | `hidróxi-` |
| **Phenol** | $Ar-OH$ | `-fenol` / `hidroxibenzeno` | `hidróxi-` (on ring) or `(hidroxifenil)-` |
| **Amine** | $-NH_2, -NR_2$ | `-amina` | `amino-` (or substituted: `dimetilamino-`) |
| **Ether** | $-O-R$ | `alcoxialcano` | `alcóxi-` (`metóxi-`, `etóxi-`, `isopropóxi-`, `fenóxi-`) |
| **Halides** | $-F, -Cl, -Br, -I$ | *(Always prefix)* | `flúor-`, `cloro-`, `bromo-`, `iodo-` |
| **Nitro** | $-NO_2$ | *(Always prefix)* | `nitro-` |

### 3.3 Complex Branched Radicals with Embedded Functions
The system supports nested, parenthesized branched substituents:
- **Haloalkyls:** `(clorometil)-`, `(2-cloroetil)-`, `(trifluorometil)-`, `(1,2-dicloropropil)-`
- **Hydroxyalkyls:** `(hidroximetil)-`, `(2-hidroxietil)-`, `(1-hidroxipropil)-`
- **Aminoalkyls:** `(aminometil)-`, `(2-aminoetil)-`, `(dimetilaminometil)-`
- **Oxoalkyls (Keto/Formyl):** `(formilmetil)-`, `(2-oxopropil)-`, `(3-oxobutil)-`
- **Functionalized Aromatics as Radicals:** `(4-nitrofenil)-`, `(2-clorobenzil)-`, `(4-hidroxifenil)-`
- **Alkoxyalkyls:** `(metoximetil)-`, `(2-etoxietil)-`

### 3.4 Bizarre Polyfunctional Molecules (Chaos Mode)
The procedural generation engine includes a dedicated "Chaos Mode" synthesizing molecules with 2 to 5 concurrent functional groups:
1. `ácido 4-amino-5-(clorometil)-6-hidróxi-3-oxoheptanoico`
2. `ácido 2-acetóxi-4-ciano-5-(dimetilamino)benzoico`
3. `cloreto de 4-(carbamoilmetil)-3-hidróxi-6-nitro-heptanoíla`
4. `4-amino-3-cloro-2-(metoximetil)-5-oxohexanonitrila`
5. `5-(clorometil)-4-hidróxi-2-oxociclo-hex-3-enocarbaldeído`

---

## 4. Dedicated Learning Hub: "Compêndio Visual & Teoria das Funções"

### 4.1 Concept & Architecture
To cater to comprehensive high-school learning, the app features an **independent, isolated Tab / View** dedicated strictly to conceptual mastery, accessible anytime without resetting the user's arcade score or streak.

```
+-------------------------------------------------------------------------+
| [⚡ MODO ARCADE / TREINO RÁPIDO]     |    [📚 COMPÊNDIO VISUAL & TEORIA] |
+-------------------------------------------------------------------------+
```

### 4.2 Pedagogical Design Principles for High School Students
1. **Plain Language & Vivid Analogies:** No unexplained chemical jargon. Explanations connect molecular polarity and intermolecular forces to relatable sensory phenomena (why fish smells bad, why ants burn, why nail polish dissolves).
2. **Interactive 2D Structure Explorer:** Each function card features live SmilesDrawer 2D diagrams with interactive hover states highlighting:
   - Pink/Red: Carbonyl group ($C=O$)
   - Blue: Nitrogenous groups ($-NH_2, -CONH_2, -CN$)
   - Green: Halogen atoms ($-Cl, -Br, -F, -I$)
   - Yellow: Carbon skeleton and branch points
3. **The "Anatomy of the IUPAC Name" Breakdown:** An exploded, color-coded visual guide showing how the name is assembled:
   ```
   [ 3,3-dimetil ]  +  [ but ]  +  [ -1-en- ]  +  [ -2-ol ]
      Radicais           Cadeia        Ligação         Função
      (Amarelo)          (Ciano)       (Roxo)          (Verde)
   ```
4. **Numbering Logic (Left-to-Right vs Right-to-Left Battle):** Side-by-side molecular comparisons showing the rule of lowest locants in action, highlighting why `butan-2-ol` is valid and `butan-3-ol` is illegal.
5. **Suffix vs Prefix Rule Explanation:** Visual "Crown" icon showing which function has the highest IUPAC rank and wears the suffix crown, while other groups become radical prefixes.

### 4.3 Deep Content Matrix for All 16 Functions (Curated from `funcoes.pdf`)

#### 1. Hidrocarbonetos (Alcanos, Alcenos, Alquinos, Aromáticos)
- **High-School Everyday Story:** Cooking gas (LPG = propane + butane), gasoline, candles (paraffin), acetylene torches for metal welding, ethylene gas used by fruit markets to ripen bananas and tomatoes. Naphthalene balls in grandmother's closet to repel moths.
- **How to Identify:** Made *strictly* of Carbon and Hydrogen atoms.
- **Nomenclature Blueprint:**
  - Prefixes: 1C = *met-*, 2C = *et-*, 3C = *prop-*, 4C = *but-*, 5C = *pent-*, 6C = *hex-*, 7C = *hept-*, 8C = *oct-*, 9C = *non-*, 10C = *dec-*.
  - Infixes: single bond = *-an-*, double bond = *-en-*, triple bond = *-in-*, two doubles = *-dien-*.
  - Suffix: *-o*.
- **Common Mistakes:** Forgetting that cyclic rings require the prefix `ciclo-` (e.g., *ciclobutano* vs *butano*).

#### 2. Álcoois
- **High-School Everyday Story:** Ethanol in car fuel and hand sanitizer; Menthol in mint chewing gums and toothpaste (producing a cold sensation on tongue receptors); Citronellol producing the characteristic mosquito-repelling scent of eucalyptus.
- **How to Identify:** Grupo hidroxila ($-OH$) bonded strictly to a **saturated carbon** (a carbon with single bonds only).
- **Nomenclature Blueprint:** Stem + Infix + `-ol`. When chain has 3 or more carbons, specify the position of $-OH$ with the lowest number: *propan-1-ol* vs *propan-2-ol*.
- **When it Acts as a Radical:** Becomes `hidróxi-` (e.g., *ácido 2-hidroxipropanoico* / lactic acid).

#### 3. Fenóis
- **High-School Everyday Story:** The historic carbolic acid used by Joseph Lister to revolutionize surgical sterilization; Cresols found in creosote wood preservatives; Naphthols used in textile dyes. Highly corrosive to human skin.
- **How to Identify:** Grupo hidroxila ($-OH$) bonded **directly** to a benzene aromatic ring. If there is a $-CH_2-$ between them, it's an aromatic alcohol (benzyl alcohol), NOT a phenol!
- **Nomenclature Blueprint:** `hidróxibenzeno` or suffix `-fenol`. Positional prefixes: *orto-* (1,2), *meta-* (1,3), *para-* (1,4).

#### 4. Enóis
- **High-School Everyday Story:** Unstable fleeting molecules in continuous chemical dance (keto-enol tautomerism) with ketones and aldehydes.
- **How to Identify:** Grupo hidroxila ($-OH$) bonded to an **unsaturated carbon with a double bond** ($C=C-OH$).
- **Nomenclature Blueprint:** Infix `-en-` + suffix `-ol` (e.g., *etenol*, *prop-1-en-1-ol*).

#### 5. Éteres
- **High-School Everyday Story:** Diethyl ether was the miraculous gas that enabled painless surgeries in the 19th century. Highly volatile and inflammable.
- **How to Identify:** Oxygen atom as a "bridge" (heteroatom) between two separate carbons ($C-O-C$).
- **Nomenclature Blueprint:**
  - Official IUPAC: Prefix of shorter chain + `óxi` + name of longer alkane (*metoxietano*).
  - Common: "Éter" + smaller radical + larger radical + `ico` (*éter etil-metílico*).
- **When it Acts as a Radical:** `alcóxi-` (`metóxi-`, `etóxi-`).

#### 6. Aldeídos
- **High-School Everyday Story:** Formalin (formol / formaldehyde) used to preserve biological specimens in jars; Acetaldehyde responsible for terrible hangover headaches; Benzaldehyde giving the smell of bitter almonds; Citral (mixture of geranial and neral) in lemon drops and perfumes.
- **How to Identify:** Carbonyl group ($C=O$) located at the **very end of a carbon chain**, bonded to at least one Hydrogen ($H-C=O$).
- **Nomenclature Blueprint:** Suffix `-al`. Always position 1, so no number is needed for the $-CHO$ group.
- **When it Acts as a Radical:** `oxo-` (if carbon is in chain) or `formil-` (if attached as branch).

#### 7. Cetonas
- **High-School Everyday Story:** Acetone (propanone) in nail polish remover; Ketone bodies produced by the human liver as emergency brain fuel during prolonged fasting or ketogenic diet.
- **How to Identify:** Carbonyl group ($C=O$) trapped **between two carbon atoms** ($C-CO-C$).
- **Nomenclature Blueprint:** Suffix `-ona`. Numbering starts from the end closest to the carbonyl: *butan-2-ona*, *pentan-3-ona*.
- **When it Acts as a Radical:** `oxo-`.

#### 8. Ácidos Carboxílicos
- **High-School Everyday Story:** Formic acid in stinging ant bites; Acetic acid in salad vinegar; Butyric acid in rancid butter; Valeric acid in soothing valerian root; Caproic/Caprylic/Capric acids responsible for the distinct pungent smell of goats.
- **How to Identify:** Carboxyl group ($-COOH$), combining a carbonyl ($C=O$) and a hydroxyl ($-OH$) on the same terminal carbon.
- **Nomenclature Blueprint:** Word `ácido` + stem + `-oico` (e.g., *ácido etanoico*).
- **Priority King:** Carboxylic acid has **highest priority** among common organic functions.

#### 9. Ésteres
- **High-School Everyday Story:** Artificial fruit flavorings (banana, pineapple, strawberry in gummies); Vegetable cooking oils and animal fats (triacylglycerols / triglycerides); Biodiesel fuel powering modern clean buses.
- **How to Identify:** Carbonyl bonded to an oxygen that bridges to another carbon ($R-COO-R'$).
- **Nomenclature Blueprint:** Acid stem + `-oato de` + alcohol radical + `-ila` (e.g., *etanoato de etila*).

#### 10. Aminas
- **High-School Everyday Story:** Trimethylamine creating the smell of decaying fish; Powerful plant alkaloids like caffeine in coffee, nicotine in tobacco, and morphine in medicine; Aniline dyes revolutionizing colorful clothing.
- **How to Identify:** Nitrogen atom derived from ammonia ($NH_3$), bonded to 1, 2, or 3 alkyl/aryl chains (primary, secondary, tertiary).
- **Nomenclature Blueprint:** Radicals in alphabetical order + `-amina`, or hydrocarbon + `-amina` using $N$-prefix for substituents on nitrogen (e.g., *$N$-metiletanamina*).
- **When it Acts as a Radical:** `amino-` or `(dimetilamino)-`.

#### 11. Amidas
- **High-School Everyday Story:** Capsaicin making chili peppers spicy and powering police defense pepper spray; Piperine giving black pepper its sharp kick; Paracetamol / Acetaminophen relieving fevers; Proteins and nylon polymers held together by amide peptide bonds.
- **How to Identify:** Nitrogen atom bonded **directly to a carbonyl carbon** ($R-CO-NH_2$).
- **Nomenclature Blueprint:** Stem + `-amida` (e.g., *etanamida*).
- **When it Acts as a Radical:** `carbamoil-` or `acetamido-`.

#### 12. Nitrilas
- **High-School Everyday Story:** Acrylonitrile used to manufacture ABS plastic in LEGO bricks, car bumpers, and acrylic textiles; Cyanide group in synthetic organic chemistry.
- **How to Identify:** Carbon atom with a **triple bond to nitrogen** ($-C \equiv N$).
- **Nomenclature Blueprint:** Hydrocarbon + `-nitrila` (*propanonitrila*) or alkyl cyanide (*cianeto de etila*).
- **When it Acts as a Radical:** `ciano-`.

#### 13. Nitrocompostos
- **High-School Everyday Story:** TNT (trinitrotoluene) industrial explosive; synthetic intermediates for medicines and vibrant dyes.
- **How to Identify:** Group $-NO_2$ attached to a carbon chain.
- **Nomenclature Blueprint:** Prefix `nitro-` with position locants (*2-nitropropano*).

#### 14. Haletos de Alquila (Halogenetos)
- **High-School Everyday Story:** Historic chloroform anesthetic; DDT agricultural insecticide used to combat malaria; CFC refrigerants that caused the Antarctic ozone hole.
- **How to Identify:** Halogen atom ($F, Cl, Br, I$) bonded to an alkane.
- **Nomenclature Blueprint:** Halogen name as prefix (*clorometano*, *1,2-dibromoetano*) or alkyl halide (*brometo de etila*).

#### 15. Haletos de Acila
- **High-School Everyday Story:** Highly reactive organic reagents used in pharmaceutical synthesis to make esters and amides.
- **How to Identify:** Carbonyl bonded directly to a halogen atom ($R-COX$).
- **Nomenclature Blueprint:** Halide name + `de` + stem + `-oíla` (e.g., *cloreto de etanoíla*).

#### 16. Anidridos de Ácido
- **High-School Everyday Story:** Acetic anhydride used industrially in the mass synthesis of Aspirin (acetylsalicylic acid).
- **How to Identify:** Two carbonyl groups sharing a central oxygen bridge ($R-CO-O-CO-R'$).
- **Nomenclature Blueprint:** `anidrido` + names of parent carboxylic acids (*anidrido etanoico*).

---

## 5. Dual Input Modality & Interactive Name Builder

Students switch between typing and clicking with a single click or by pressing `Tab`.

### 5.1 Mode A: Speedrunner Type (High-Velocity Keyboard Entry)
- Single input bar auto-focused on each new question.
- Normalizer strips non-essential accents (`acido` $\rightarrow$ `ácido`, `hidroxi` $\rightarrow$ `hidróxi`).
- Accepts IUPAC 1993 and IUPAC 2013 hyphen rules (`ciclo-hexano` = `ciclohexano`, `but-2-eno` = `2-buteno`).
- Automatically recognizes registered common synonyms (`acetona` = `propanona` = `dimetilcetona`).

### 5.2 Mode B: Interactive Slot/Token Builder
Drawer-based UI breaking down organic syntax into clear, clickable chips:

```
[ Class Prefix ] + [ Radicals & Subordinated Functions ] + [ Ring ] + [ Stem ] + [ Infix ] + [ Suffix ]
(e.g., "Ácido")     (e.g., "4-amino-2-(clorometil)-5-hidróxi")  (e.g., "ciclo-") (e.g., "hex") (e.g., "-2-en-") (e.g., "-oico")
```

- **Dynamic Alphabetical Ordering:** As chips are selected, the Live Preview automatically re-orders substituents alphabetically (`amino-` before `cloro-`, `hidróxi-` before `metil-`).
- **Semantic Morpheme Color Coding:**
  - Yellow: Alkyl radicals & locants
  - Orange: Subordinated functional radicals (`hidróxi`, `oxo`, `amino`)
  - Cyan: Main chain carbon prefix ($C_1 \dots C_{10}$)
  - Purple: Infix / bond saturation
  - Green: Principal functional suffix

---

## 6. Deconstructive AST Engine & Granular Partial Credit

### 6.1 Recursive AST Representation
```typescript
export interface SubstituentNode {
  locants: number[];
  multiplier?: number; // 2 = di, 3 = tri, 4 = tetra
  type: 'simple_alkyl' | 'functional_substituent' | 'complex_radical';
  name: string;        // 'metil', 'hidróxi', 'oxo', 'cloro', '(2-aminoetil)'
  subordinateFunction?: OrganicFunction;
  nestedRadical?: {
    subLocants: number[];
    subFunction?: string;
    alkylBase: string;
  };
}

export interface IUPACNameAST {
  isSpecialPrefix?: 'acido' | 'anidrido' | 'eter';
  isRing: boolean;
  ringType?: 'ciclo' | 'benzeno' | 'naftaleno';
  substituents: SubstituentNode[];
  mainChainPrefix: string;
  carbonCount: number;
  bonds: Array<{
    type: 'an' | 'en' | 'in' | 'dien' | 'trien';
    locants?: number[];
  }>;
  functionSuffix: string;
  esterAlkylPart?: string;
  nitrogenSubstituents?: string[];
  rawNormalized: string;
}
```

### 6.2 Granular Scoring & Priority Inversion Diagnostic
$$\text{Score} = 0.35 \cdot S_{\text{function}} + 0.25 \cdot S_{\text{chain}} + 0.20 \cdot S_{\text{bonds}} + 0.20 \cdot S_{\text{radicals}}$$

- **Priority Inversion Case:** If target is `ácido 3-hidroxibutanoico` and user inputs `3-carboxibutan-1-ol`, the system awards 65% partial credit and displays the educational tip:
  > `[⚠️ Inversão de Prioridade IUPAC]`  
  > *"Você identificou corretamente a carboxila (-COOH) e a hidroxila (-OH), mas os ácidos carboxílicos têm prioridade MÁXIMA sobre os álcoois. O sufixo principal deve ser '-oico' e o álcool atua como radical 'hidróxi-'!"*

---

## 7. Dopamine-Maxxing Arcade Gamification Engine

1. **Procedural Web Audio Synthesizer:**
   - 0ms network latency, zero MP3 assets.
   - Dynamic pentatonic C-major scale ($C_4 \rightarrow D_4 \rightarrow E_4 \rightarrow G_4 \rightarrow A_4 \rightarrow C_5$) ascending with consecutive streak counts.
   - Soft damped low-frequency sine wave on errors (non-punitive, inviting instant retry).
   - Crisp 10ms micro-clicks on token snapping.
2. **Juice Visuals:**
   - Frame micro-punch and confetti bursts on perfect answers.
   - Dynamic streak multipliers: `1x -> 1.5x -> 2x -> 3x -> 5x AROMÁTICO ON FIRE 🔥`.
   - Continuous Flow: Correct answers auto-advance after 600ms, maintaining a frictionless short-video rhythm.
3. **FSRS Flash Repetition Queue:**
   - Missed or partially scored questions ($< 80\%$) reappear automatically in `current_index + 3` to solidify short-term recall before saving to Dexie.js daily spaced repetition.

---

## 8. Technology Stack & Multi-Agent Parallel Architecture

| Package Directory | Subagent Scope | Core Responsibilities & Technologies |
|---|---|---|
| `packages/chemistry-core` | Agent 1 | Pure TS IUPAC pt-BR lexer, recursive AST parser, priority resolver, and partial credit scoring. |
| `packages/chemistry-dataset` | Agent 2 | 500+ canonical molecules (100% PDF coverage) + Tier 2 Procedural Generator + Chaos Mode Bizarre Synthesizer. |
| `packages/gamification-engine`| Agent 3 | Native Web Audio API procedural synthesizer, combo manager, and FSRS micro-queue. |
| `packages/smiles-renderer` | Agent 4 | SmilesDrawer 2.x 2D canvas wrapper, dark mode atom color palette, sub-2ms rendering. |
| `packages/web-app` | Agent 5 | React 19 + Vite 6 + Tailwind CSS v4 PWA, dual input HUD, Theory Codex Tab, Dexie.js IndexedDB. |

---

## 9. Verification & Acceptance Criteria

1. **Pedagogical Parity:** 100% of all 16 functions, real-world examples, and common names from `funcoes.pdf` present in both the Practice Arcade and the Theory Hub.
2. **Deconstruction Accuracy:** Vitest test suite with $\ge 200$ test cases covering all edge cases (polyfunctional priority inversions, complex parenthesized radicals, cis/trans, and common synonyms).
3. **Performance Budget:** SmilesDrawer rendering time $\le 3\text{ms}$; sound synthesis latency $\le 5\text{ms}$; bundle size $\le 150\text{KB}$ gzip.
4. **Offline Capability:** Complete PWA functionality with zero network requests after initial service worker installation.
