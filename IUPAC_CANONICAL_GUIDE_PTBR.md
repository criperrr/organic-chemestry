# Guia Canônico de Nomenclatura Orgânica IUPAC em Língua Portuguesa (pt-BR)
## Referência Autoritativa Fundamental para o QuímicaRush

> **Status:** Canônico / Definitivo  
> **Versão:** 1.0.0  
> **Data:** 2026-09-01  
> **Autoridade Química:** IUPAC (*Nomenclature of Organic Chemistry — IUPAC Recommendations and Preferred Names 2013*, "Blue Book"; Recomendações IUPAC 1979/1993)  
> **Autoridade Nacional & Adaptação Linguística:** SBQ (Sociedade Brasileira de Química), ABQ (Associação Brasileira de Química) e ABL (Academia Brasileira de Letras — Acordo Ortográfico da Língua Portuguesa de 1990/2016)  
> **Fundamento Pedagógico & Escopo Curricular:** `funcoes.pdf` (Prof. Anderson Oliveira, CEASM / Fundação Cecierj) e Padrões dos Vestibulares Nacionais (ENEM, FUVEST, UNICAMP, UNESP, UERJ)  
> **Aplicação no Projeto:** Ground Truth para o compilador léxico/sintático (`chemistry-core`), banco de dados curricular (`chemistry-dataset`), gerador procedural de moléculas, módulo de tolerância ortográfica e compêndio teórico (`web-app`).

---

## Sumário Executivo

O presente documento estabelece a verdade química e normativa absoluta para todas as 16 funções orgânicas, regras de nomenclatura IUPAC (pt-BR), regras gramaticais do Novo Acordo Ortográfico, mapeamento duplo de localizadores (IUPAC 1993 vs. IUPAC 2013), precedência em compostos polifuncionais, radicais ramificados complexos e dicionário canônico de sinônimos triviais/históricos.

Nenhum módulo do ecossistema QuímicaRush pode divergir das especificações aqui firmadas.

---

## 1. A Hierarquia Canônica de Prioridade IUPAC (Compostos Polifuncionais)

### 1.1 Regra de Ouro da Prioridade (The Suffix Crown Rule)
Quando uma molécula orgânica apresenta **dois ou mais grupos funcionais distintos**, ela não possui múltiplos sufixos funcionais principais. Aplica-se rigorosamente a regra de precedência da IUPAC (Blue Book P-44.4.1):

1. **Apenas a função de maior prioridade** assume o **sufixo principal** do nome oficial (recebe a "coroa" do sufixo) e define a classe principal do composto.
2. **Todas as demais funções subordinadas** perdem o direito ao sufixo e **são compulsoriamente convertidas em prefixos (radicais substituintes)**.
3. A cadeia principal deve ser escolhida e numerada de modo a conferir o **menor localizador possível ao grupo funcional principal**, seguido pelas insaturações e, por fim, pelos substituintes/radicais em ordem alfabética.

### 1.2 Ordem Decrescente de Prioridade das 16 Funções Canônicas

$$\text{Ácido Carboxílico (16)} > \text{Anidrido (15)} > \text{Éster (14)} > \text{Haleto de Acila (13)} > \text{Amida (12)} > \text{Nitrila (11)} > \text{Aldeído (10)} > \text{Cetona (9)} > \text{Álcool (8)} > \text{Enol (7)} > \text{Fenol (6)} > \text{Amina (5)} > \text{Éter (4)} > \text{Haleto de Alquila (3)} > \text{Nitrocomposto (2)} > \text{Hidrocarboneto (1)}$$

> **Nota Crítica sobre Haletos de Alquila e Nitrocompostos:**
> Pelas regras da IUPAC e da SBQ, halogênios ligados a carbonos alifáticos ($-F, -Cl, -Br, -I$) e o grupo nitro ($-NO_2$) **NUNCA** recebem sufixo funcional na nomenclatura substitutiva sistemática. Eles são considerados formalmente substituintes subordinados permanentes (prefixos perpétuos).

---

### 1.3 Tabela Mestra de Transformação: Função Principal vs. Radical Subordinado

| Ranking | Classe Funcional | Grupo Característico | Sufixo IUPAC Principal (pt-BR) | Prefixo como Radical Subordinado (pt-BR) | Exemplo de Aplicação Subordinada |
|:---:|:---|:---|:---|:---|:---|
| **16** | **Ácido Carboxílico** | $-COOH$ / $-(C)OOH$ | `ácido ...-oico` / `ácido ...-carboxílico` | `carboxi-` | *ácido 2-(carboximetil)butanodioico* |
| **15** | **Anidrido de Ácido** | $-CO-O-CO-$ | `anidrido ...-oico` | `alcanoilóxi-` / `acilóxi-` | *ácido 4-(etanoilóxi)benzoico* |
| **14** | **Éster** | $-COOR$ / $-(C)OOR$ | `...-oato de [alquila]-ila` | `alcoxicarbonil-` (via C) / `acilóxi-` (via O) | *ácido 4-(metoxicarbonil)benzoico* / *ácido 2-acetoxibenzoico* |
| **13** | **Haleto de Acila** | $-COX$ ($X = F, Cl, Br, I$) | `[haleto] de ...-oíla` | `haloformil-` / `halocarbonil-` (`clorocarbonil-`) | *ácido 3-(clorocarbonil)propanoico* |
| **12** | **Amida** | $-CONH_2, -CONHR, -CONR_2$ | `...-amida` / `...-carboxamida` | `carbamoil-` (via C) / `alcanamido-` (via N) | *ácido 4-carbamoilbutanoico* / *4-acetamidofenol* |
| **11** | **Nitrila** | $-C \equiv N$ / $-(C) \equiv N$ | `...-nitrila` / `...-carbonitrila` | `ciano-` | *ácido 2-cianopropanoico* |
| **10** | **Aldeído** | $-CHO$ / $-(C)HO$ | `...-al` / `...-carbaldeído` | `oxo-` (no esqueleto) / `formil-` (ramificado fora) | *ácido 4-oxobutanoico* / *ácido 4-formilbenzoico* |
| **9** | **Cetona** | $>C=O$ | `...-ona` | `oxo-` | *ácido 3-oxobutanoico* |
| **8** | **Álcool** | $-OH$ ($C\ sp^3$) | `...-ol` | `hidróxi-` | *ácido 2-hidroxipropanoico* (ácido láctico) |
| **7** | **Enol** | $-C=C-OH$ ($C\ sp^2$) | `...-en-ol` | `hidróxi-` (com insaturação explicitada) | *ácido 3-hidroxibut-2-enoico* |
| **6** | **Fenol** | $Ar-OH$ (anel benzênico) | `...-fenol` / `hidroxibenzeno` | `hidróxi-` (no anel) / `(hidroxifenil)-` | *ácido 4-hidroxibenzoico* |
| **5** | **Amina** | $-NH_2, -NHR, -NR_2$ | `...-amina` | `amino-` (e `metilamino-`, `dimetilamino-`) | *ácido 2-aminopropanoico* (alanina) |
| **4** | **Éter** | $-O-$ ($C-O-C$) | `alcoxialcano` | `alcóxi-` (`metóxi-`, `etóxi-`, `fenóxi-`) | *ácido 2-metoxiacético* |
| **3** | **Haleto de Alquila** | $-F, -Cl, -Br, -I$ | *(Sem sufixo IUPAC)* | `flúor-`, `cloro-`, `bromo-`, `iodo-` | *2-cloroetanol* |
| **2** | **Nitrocomposto** | $-NO_2$ | *(Sem sufixo IUPAC)* | `nitro-` | *4-nitrofenol* |
| **1** | **Hidrocarboneto** | $C_n H_m$ | `-ano`, `-eno`, `-ino`, `-o` | `alquil-` (`metil-`, `etil-`), `aril-` (`fenil-`) | *2-metilbutano* |

---

## 2. As 16 Funções Orgânicas Canônicas: Perfis Técnicos Completos

Cada perfil traz: estrutura, fórmulas, sufixos/infixos canônicos, IUPAC 1993 vs 2013, histórias do cotidiano e vestibulares (baseadas 100% no `funcoes.pdf`), exemplos com SMILES e armadilhas comuns.

---

### F01. Hidrocarbonetos (Alcanos, Alcenos, Alquinos, Alcadienos)
- **Fórmula Geral / Grupo:**
  - Alcanos: $C_n H_{2n+2}$ (apenas ligações simples $C-C$).
  - Alcenos (Alquenos / Olefinas): $C_n H_{2n}$ (uma ligação dupla $C=C$).
  - Alquinos (Alquinos / Acetilenos): $C_n H_{2n-2}$ (uma ligação tripla $C \equiv C$).
  - Alcadienos (Dienos): $C_n H_{2n-2}$ (duas ligações duplas $C=C$).
- **Sufixo / Infixos Canônicos:** Infixos `-an-`, `-en-`, `-in-`, `-dien-`; Sufixo hidrocarbônico canônico: `-o`.
- **IUPAC 1993 vs. IUPAC 2013:**
  - 1993: `2-buteno`, `1-butino`, `1,3-butadieno`, `2-penteno`.
  - 2013: `but-2-eno`, `but-1-ino`, `buta-1,3-dieno`, `pent-2-eno`.
  - *Regra Fonética do 'a':* Em dienos e polienos sistemáticos IUPAC 2013, acrescenta-se a letra `a` após o prefixo carbônico antes do hífen para evitar o encontro consonantal áspero: `but` + `dieno` $\rightarrow$ `buta-1,3-dieno`; `hexa-1,3,5-trieno`.
- **Nomes Usuais / Cotidiano (`funcoes.pdf`):**
  - Gás Liquefeito de Petróleo (GLP): mistura de propano e butano.
  - Gás etileno (eteno): hormônio vegetal gasoso empregado por feirantes para acelerar o amadurecimento de bananas e tomates.
  - Gás acetileno (etino): combustível de alta temperatura para maçaricos de solda oxiacetilênica de metais.
  - Parafina: mistura de alcanos de cadeia longa ($C_{20}$ a $C_{40}$) usada na fabricação de velas.
  - Gasolina: fração rica em hidrocarbonetos ramificados de 8 carbonos (isooctano / 2,2,4-trimetilpentano).
- **Exemplos Canônicos:**
  - `butano` | SMILES: `CCCC` | Fórmula: $C_4H_{10}$
  - `but-2-eno` (IUPAC 1993: `2-buteno`) | SMILES: `CC=CC` | Fórmula: $C_4H_8$
  - `buta-1,3-dieno` (IUPAC 1993: `1,3-butadieno`) | SMILES: `C=CC=C` | Fórmula: $C_4H_6$
  - `propino` | SMILES: `CC#C` | Fórmula: $C_3H_4$
  - `2-metilpropano` (isobutano) | SMILES: `CC(C)C` | Fórmula: $C_4H_{10}$
- **Armadilhas Comuns:** Confundir alcadienos acumulados com alquinos (isômeros de função/compensação); esquecer a numeração iniciando da extremidade mais próxima da insaturação antes da ramificação.

---

### F02. Hidrocarbonetos Cíclicos e Aromáticos
- **Fórmula Geral / Grupo:** Anéis monocíclicos saturados ($C_n H_{2n}$), insaturados e anéis aromáticos de Huckel ($4n + 2$ elétrons $\pi$).
- **Sufixo / Prefixos Canônicos:** Prefixo `ciclo-` seguido do hidrocarboneto; terminação `-benzeno`, `tolueno`, `naftaleno`.
- **Regras do Novo Acordo Ortográfico (Hífen):**
  - Diante de 'h', o hífen é **estritamente obrigatório**: `ciclo-hexano`, `ciclo-hexeno`, `ciclo-heptano`.
  - Diante de outras consoantes e vogais diferentes, **aglutina-se sem hífen**: `ciclopropano`, `ciclobutano`, `ciclopentano`.
  - Tolerância de grafia pré-acordo: `ciclohexano` e `cicloexano` devem ser normalizados pelo lexer para a forma canônica `ciclo-hexano`.
- **Posições Aromáticas Tradicionais:**
  - Posição 1,2: prefixo *orto-* ($o$-). Ex: $o$-xileno (`1,2-dimetilbenzeno`).
  - Posição 1,3: prefixo *meta-* ($m$-). Ex: $m$-xileno (`1,3-dimetilbenzeno`).
  - Posição 1,4: prefixo *para-* ($p$-). Ex: $p$-xileno (`1,4-dimetilbenzeno`).
- **Nomes Usuais / Cotidiano (`funcoes.pdf`):**
  - Tolueno: metilbenzeno, solvente industrial de tintas e colas.
  - Naftaleno (naftalina): hidrocarboneto aromático policíclico de odor penetrante usado nos armários para afastar traças e baratas por sublimação.
  - Xilenos ($o, m, p$): solventes petroquímicos aromáticos.
- **Exemplos Canônicos:**
  - `ciclobutano` | SMILES: `C1CCC1`
  - `ciclo-hexano` (1993/tolerado: `ciclohexano`) | SMILES: `C1CCCCC1`
  - `metilbenzeno` (Tolueno) | SMILES: `Cc1ccccc1`
  - `1,2-dimetilbenzeno` ($o$-xileno) | SMILES: `Cc1ccccc1C`
  - `naftaleno` | SMILES: `c1ccc2ccccc2c1`

---

### F03. Álcoois
- **Definição Canônica (`funcoes.pdf`):** Compostos que apresentam uma ou mais hidroxilas ($-OH$) ligadas a **átomo de carbono saturado** ($sp^3$).
- **Sufixo Canônico:** `-ol` (polióis: `-diol`, `-triol`).
- **Nomenclatura Formal Secundária:** "Álcool [radical carbônico]ílico" (ex: álcool etílico, álcool metílico, álcool isopropílico).
- **IUPAC 1993 vs. IUPAC 2013:**
  - 1993: `2-propanol`, `2-butanol`, `1,2-etanodiol`.
  - 2013: `propan-2-ol`, `butan-2-ol`, `etano-1,2-diol`.
- **Quando Atua como Radical Subordinado:** Prefixo `hidróxi-` (com acento na grafia culta pt-BR; tolerado sem acento `hidroxi-`).
- **Nomes Usuais / Cotidiano (`funcoes.pdf`):**
  - Etanol: álcool de cana-de-açúcar (biocombustível veicular no Brasil), ingrediente das bebidas alcoólicas e antisséptico hospitalar a 70%.
  - Mentol: álcool terpênico encontrado nas folhas de hortelã (*Mentha*), utilizado em balas de menta, cremes dentais e cigarros mentolados por estimular termorreceptores de frio na boca.
  - Citronelol: álcool monoterpenoide responsável pelo odor agradável e ação repelente de insetos do óleo de eucalipto e citronela.
  - Glicerol (glicerina): `propano-1,2,3-triol`, subproduto da fabricação de sabão e do biodiesel, emoliente cosmético.
- **Exemplos Canônicos:**
  - `etanol` | SMILES: `CCO`
  - `propan-2-ol` (1993: `2-propanol`, usual: álcool isopropílico) | SMILES: `CC(O)C`
  - `propano-1,2,3-triol` (glicerol) | SMILES: `OCC(O)CO`
  - `2-metilpropan-2-ol` (álcool terc-butílico) | SMILES: `CC(C)(C)O`

---

### F04. Fenóis
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos que apresentam o grupo hidroxila ($-OH$) ligado **diretamente a um átomo de carbono de um anel aromático** (anel benzênico).
- **Distinção Crucial de Vestibular:** Se houver um carbono saturado entre o anel e a hidroxila (ex: $C_6H_5-CH_2-OH$), o composto é um **álcool aromático** (álcool benzílico / fenilmetanol), **JAMAIS** um fenol!
- **Sufixo / Prefixo IUPAC:** Prefixo `hidróxi-` antes do hidrocarboneto aromático (`hidroxibenzeno`) ou terminação `-fenol` (`benzenol`).
- **Propriedades e Cotidiano (`funcoes.pdf`):**
  - Fenol comum (hidroxibenzeno / ácido fênico / ácido carbólico): altamente cáustico e corrosivo à pele humana, mas historicamente revolucionário como primeiro antisséptico cirúrgico hospitalar usado por Joseph Lister em solução a 2%.
  - Cresóis ($o$-cresol, $m$-cresol, $p$-cresol / metilfenóis): desinfetantes rurais (creolina) derivados do alcatrão de hulha.
  - Naftóis (1-naftol e 2-naftol): empregados na indústria de corantes têxteis.
- **Exemplos Canônicos:**
  - `hidroxibenzeno` (Fenol comum) | SMILES: `Oc1ccccc1`
  - `2-metilfenol` ($o$-cresol / 1-hidróxi-2-metilbenzeno) | SMILES: `Cc1ccccc1O`
  - `naftalen-2-ol` (2-naftol / $\beta$-naftol) | SMILES: `Oc1ccc2ccccc2c1`

---

### F05. Enóis
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos que apresentam o grupo hidroxila ($-OH$) ligado diretamente a um **átomo de carbono insaturado com dupla ligação alifática** ($C=C-OH$).
- **Sufixo e Infixo Canônicos:** Infixo `-en-` + sufixo `-ol` (ex: `etenol`, `prop-1-en-1-ol`).
- **Instabilidade e Equilíbrio Ceto-Enólico (Tautomeria):**
  - Enóis são espécies termodinamicamente instáveis em solução aquosa e sofrem transposição prototrópica rápida estabelecendo equilíbrio químico dinâmico (tautomeria) com aldeídos ou cetonas:
    $$R-CH=CH-OH \rightleftharpoons R-CH_2-CHO \quad (\text{tautomeria aldo-enólica})$$
    $$R-C(OH)=CH_2 \rightleftharpoons R-CO-CH_3 \quad (\text{tautomeria ceto-enólica})$$
- **IUPAC 1993 vs. IUPAC 2013:**
  - 1993: `1-propen-1-ol`, `1-propen-2-ol`, `etenol`.
  - 2013: `prop-1-en-1-ol`, `prop-1-en-2-ol`, `etenol`.
- **Exemplos Canônicos:**
  - `etenol` (álcool vinílico) | SMILES: `C=CO`
  - `prop-1-en-2-ol` (tautômero enólico da acetona) | SMILES: `CC(=C)O`
  - `but-2-en-2-ol` | SMILES: `CC=C(C)O`

---

### F06. Éteres
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos que apresentam um **heteroátomo de oxigênio entre dois carbonos** ($R-O-R'$).
- **Nomenclatura IUPAC Oficial:** Prefixo do radical menor + `óxi` + nome do hidrocarboneto correspondente ao radical maior:
  - Ex: $CH_3-O-CH_2-CH_3 \rightarrow$ `metoxietano`.
- **Nomenclatura Usual / Comercial:** Palavra `éter` seguida dos dois radicais em ordem alfabética com terminação `-ílico` (ou `-ico`):
  - Ex: `éter etílico e metílico` ou `éter etil-metílico`.
  - Ex: `éter etílico` ou `éter dietílico` para $CH_3-CH_2-O-CH_2-CH_3$.
- **Quando Atua como Radical Subordinado:** Prefixo `alcóxi-` (`metóxi-`, `etóxi-`, `isopropóxi-`, `fenóxi-`).
- **Propriedades e Cotidiano (`funcoes.pdf`):**
  - Éter comum (etoxietano / éter dietílico): líquido extremamente volátil e inflamável, historicamente utilizado como primeiro anestésico por inalação em cirurgias a partir do século XIX.
  - Formação perigosa de peróxidos: expostos à luz e ao oxigênio do ar, éteres formam peróxidos orgânicos ($-O-O-$) altamente explosivos na destilação, exigindo manipulação criteriosa.
- **Exemplos Canônicos:**
  - `metoximetano` (éter dimetílico) | SMILES: `COC`
  - `metoxietano` (éter etil-metílico) | SMILES: `CCOCC`
  - `etoxietano` (éter dietílico) | SMILES: `CCOCC`
  - `metoxibenzeno` (anisol) | SMILES: `COc1ccccc1`

---

### F07. Aldeídos
- **Definição Canônica (`funcoes.pdf`):** Compostos que apresentam na extremidade da cadeia o **grupo formila** (ou formilo: $H-C=O$), onde a carbonila está ligada a pelo menos um hidrogênio ($R-CHO$). Etimologia: *álcool desidrogenado* (**al** + **deído**).
- **Sufixo Canônico:** `-al` (ou `-dial` quando nas duas extremidades; `-carbaldeído` quando ligado a ciclos).
- **Regra de Numeração:** O carbono da formila é **obrigatoriamente o carbono 1** da cadeia principal alifática. Não se indica o número 1 no nome systematically (`butanal`, e nunca `butan-1-al`).
- **Quando Atua como Radical Subordinado:**
  - Se o carbono da carbonila faz parte da contagem da cadeia principal: prefixo `oxo-`. Ex: *ácido 4-oxobutanoico*.
  - Se o grupo $-CHO$ está ramificado fora da cadeia principal ou preso a um anel: prefixo `formil-`. Ex: *ácido 4-formilbenzoico*.
- **Nomes Usuais / Cotidiano (`funcoes.pdf`):**
  - Metanal (formaldeído / formol): gás de odor irritante, vendido em solução aquosa a 37% como conservante de cadáveres e peças anatômicas devido à sua capacidade de desnaturar e polimerizar proteínas bacterianas.
  - Etanal (acetaldeído): metabólito tóxico da oxidação do etanol pelo fígado via álcool desidrogenase, responsável pelos sintomas da ressaca.
  - Benzaldeído: odor característico e amargo de amêndoas, usado em essências e aromatizantes.
  - Citral: mistura dos aldeídos isoméricos geométricos geranial (*trans*) e neral (*cis*), responsável pelo cheiro cítrico de limão empregado em balas e na perfumaria fina ("família aldeídica", notas olfativas de cabeça).
- **Exemplos Canônicos:**
  - `metanal` (formol / formaldeído) | SMILES: `C=O`
  - `etanal` (acetaldeído) | SMILES: `CC=O`
  - `butanal` | SMILES: `CCCC=O`
  - `benzaldeído` (benzenocarbaldeído) | SMILES: `O=Cc1ccccc1`
  - `3,7-dimetilocta-2,6-dienal` (Citral) | SMILES: `CC(C)=CCCC(C)=CC=O`

---

### F08. Cetonas
- **Definição Canônica (`funcoes.pdf`):** Compostos que apresentam o grupo **carbonila** ($C=O$) ligado a **dois átomos de carbono** ($R-CO-R'$). O grupo carbonila é obrigatoriamente secundário.
- **Sufixo Canônico:** `-ona` (policetonas: `-diona`, `-triona`).
- **Nomenclatura Usual:** Nome dos dois radicais hidrocarbônicos em ordem crescente de tamanho ou alfabética seguido do termo `cetona` (ex: `metil-etil-cetona`, `dimetilcetona`).
- **IUPAC 1993 vs. IUPAC 2013:**
  - 1993: `2-propanona` (ou propanona sem número), `2-butanona`, `2-pentanona`, `3-pentanona`.
  - 2013: `propan-2-ona` (ou `propanona`), `butan-2-ona`, `pentan-2-ona`, `pentan-3-ona`.
- **Quando Atua como Radical Subordinado:** Prefixo `oxo-`. Ex: *ácido 3-oxobutanoico*.
- **Nomes Usuais / Cotidiano (`funcoes.pdf`):**
  - Propanona (acetona / dimetilcetona): líquido solvente clássico de tintas, vernizes e esmaltes de unha. Teve sua venda pura controlada pela Polícia Federal por ser reagente químico precursor na purificação de cocaína.
  - Corpos cetônicos (acetona, acetoacetato e beta-hidroxibutirato): metabólitos solúveis sintetizados no fígado durante o jejum prolongado ou dieta cetogênica a partir da oxidação de ácidos graxos, servindo de fonte nobre de combustível para cérebro e coração.
- **Exemplos Canônicos:**
  - `propanona` (acetona / propan-2-ona) | SMILES: `CC(=O)C`
  - `butan-2-ona` (1993: `2-butanona`, usual: metil-etil-cetona) | SMILES: `CCC(=O)C`
  - `ciclo-hexanona` | SMILES: `O=C1CCCCC1`
  - `pentano-2,4-diona` (acetilacetona) | SMILES: `CC(=O)CC(=O)C`

---

### F09. Ácidos Carboxílicos
- **Definição Canônica (`funcoes.pdf`):** Compostos caracterizados pela presença do grupo **carboxila** ($-COOH$), que reúne no mesmo átomo de carbono uma carbonila ($C=O$) e uma hidroxila ($-OH$).
- **Sufixo Canônico:** Palavra `ácido` + hidrocarboneto + `-oico` (ou `-dioico`; `-carboxílico` quando ligado a anéis).
- **Regra de Prioridade Absoluta:** O ácido carboxílico possui a **maior prioridade** entre todas as funções orgânicas curriculares. Seu carbono é sempre o número 1.
- **Quando Atua como Radical Subordinado (Raríssimo):** Prefixo `carboxi-` (utilizado quando a carboxila está presa a uma cadeia principal com função de ainda maior precedência iônica ou em ácidos policarboxílicos assimétricos).
- **Nomes Usuais / Históricos / Cotidiano (`funcoes.pdf`):**
  - Ácido metanoico (ácido fórmico, do latim *formica*, formiga): líquido urticante injetado na picada de formigas e abelhas.
  - Ácido etanoico (ácido acético, do latim *acetum*, azedo): constituinte característico do vinagre (solução a cerca de 4 a 5%).
  - Ácido propanoico (ácido propiônico, do grego *protos pion*, primeira gordura).
  - Ácido butanoico (ácido butírico, do latim *butyrum*, manteiga): responsável pelo cheiro asqueroso e rançoso da manteiga estragada e do suor.
  - Ácido pentanoico (ácido valérico): isolado das raízes calmantes da planta *Valeriana officinalis*.
  - Ácido hexanoico (ácido caproico), octanoico (caprílico) e decanoico (cáprico): responsáveis pelo odor forte característico dos bodes e cabras (*Capra*).
  - Ácido 2-hidroxipropanoico (ácido láctico): azedamento do leite e fadiga muscular em anaerobiose.
  - Ácido acetilsalicílico (AAS / Aspirina): derivado carboxílico analgésico e anti-inflamatório.
- **Exemplos Canônicos:**
  - `ácido metanoico` (ácido fórmico) | SMILES: `OC=O`
  - `ácido etanoico` (ácido acético) | SMILES: `CC(=O)O`
  - `ácido butanoico` (ácido butírico) | SMILES: `CCCC(=O)O`
  - `ácido benzoico` (ácido benzenocarboxílico) | SMILES: `O=C(O)c1ccccc1`
  - `ácido etanodioico` (ácido oxálico) | SMILES: `OC(=O)C(=O)O`

---

### F10. Ésteres
- **Definição Canônica (`funcoes.pdf`):** Derivados de ácidos carboxílicos pela substituição do hidrogênio ionizável da hidroxila por um radical carbônico (alquila ou arila): $R-COO-R'$. Obtidos tipicamente pela **reação de esterificação** entre um ácido carboxílico e um álcool, com eliminação de água:
  $$\text{Ácido Carboxílico} + \text{Álcool} \xrightleftharpoons{\quad H^+ \quad} \text{Éster} + \text{Água}$$
- **Sufixo Canônico:** Nome do hidrocarboneto com `-oato` + preposição `de` + nome do radical derivado do álcool com terminação `-ila`:
  - Ex: $CH_3-COO-CH_2-CH_3 \rightarrow$ `etanoato de etila`.
- **Quando Atua como Radical Subordinado:**
  - Ligado pela carbonila à cadeia principal: `alcoxicarbonil-` (ex: `metoxicarbonil-`, `etoxicarbonil-`).
  - Ligado pelo oxigênio à cadeia principal: `acilóxi-` (ex: `acetóxi-` para $-O-CO-CH_3$).
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - Flavorizantes e aromatizantes artificiais: ésteres de baixa massa molar conferem sabor e aroma de frutas em chicletes, refrigerantes e balas:
    - Etanoato de butila: essência de maçã.
    - Etanoato de isopentila (ou isoamila): essência de banana.
    - Butanoato de etila: essência de morango e abacaxi.
  - Óleos e Gorduras (Lipídios): triésteres do glicerol chamados quimicamente de **triacilgliceróis** (antigamente triglicerídeos). Óleos vegetais são predominantemente insaturados e líquidos; gorduras animais são saturadas e sólidas.
  - Biodiesel: biocombustível obtido pela reação de transesterificação dos triacilgliceróis com álcoois de cadeia curta (metanol ou etanol) em meio catalítico básico, gerando ésteres de ácidos graxos e glicerol puro.
- **Exemplos Canônicos:**
  - `metanoato de metila` (formiato de metila) | SMILES: `COC=O`
  - `etanoato de etila` (acetato de etila) | SMILES: `CCOC(=O)C`
  - `butanoato de metila` | SMILES: `CCCC(=O)OC`
  - `benzoato de metila` | SMILES: `COC(=O)c1ccccc1`

---

### F11. Aminas
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos nitrogenados derivados formalmente da amônia ($NH_3$) pela substituição de um, dois ou três hidrogênios por grupos alquila ou arila:
  - Primária: $R-NH_2$ (um grupo R).
  - Secundária: $R-NH-R'$ (dois grupos R).
  - Terciária: $R-N(R')-R''$ (três grupos R).
- **Sufixo Canônico:** Nome do hidrocarboneto + `-amina` (ex: `metanamina`) ou radicais alquila em ordem alfabética agrupados seguidos da palavra `amina` (ex: `metilamina`, `dimetilamina`, `dietilmetilamina`).
- **Substituintes no Nitrogênio ($N$-alquil):** Para aminas secundárias e terciárias sistemáticas, usa-se o localizador em itálico $N-$ para indicar que o substituinte está ligado diretamente ao átomo de nitrogênio e não ao esqueleto carbônico principal:
  - Ex: $CH_3-NH-CH_2-CH_3 \rightarrow$ `N-metiletanamina`.
  - Ex: $CH_3-N(CH_3)-CH_2-CH_2-CH_3 \rightarrow$ `N,N-dimetilpropan-1-amina`.
- **Quando Atua como Radical Subordinado:** Prefixo `amino-` (e substituídos: `dimetilamino-`, `metilamino-`).
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - Anilina (fenilamina / aminobenzeno): base nitrogenada aromática fundamental na história da química sintética como matéria-prima para corantes industriais.
  - Trimetilamina: amina volátil responsável pelo cheiro característico de peixe em decomposição.
  - Alcaloides naturais: compostos heterocíclicos de caráter básico biossintetizados por plantas com potentes ações farmacológicas no sistema nervoso central: cafeína, nicotina, morfina, cocaína, pilocarpina.
- **Exemplos Canônicos:**
  - `metanamina` (metilamina) | SMILES: `CN`
  - `etanamina` (etilamina) | SMILES: `CCN`
  - `N-metiletanamina` | SMILES: `CCNC`
  - `fenilamina` (anilina / aminobenzeno) | SMILES: `Nc1ccccc1`
  - `trietilamina` | SMILES: `CCN(CC)CC`

---

### F12. Amidas
- **Definição Canônica (`funcoes.pdf`):** Compostos que apresentam o átomo de nitrogênio ligado diretamente a um grupo carbonila: $R-CO-NH_2$ (amida primária), $R-CO-NHR'$ (secundária), $R-CO-NR'R''$ (terciária). São derivadas formalmente de ácidos carboxílicos pela troca do grupo $-OH$ por $-NH_2$.
- **Sufixo Canônico:** Nome do hidrocarboneto + `-amida` (ex: `etanamida`).
- **Substituintes no Nitrogênio ($N$-substituição):** Radicais ligados ao nitrogênio amídico recebem o localizador $N-$:
  - Ex: $CH_3-CO-NH-CH_3 \rightarrow$ `N-metiletanamida`.
- **Quando Atua como Radical Subordinado:**
  - Ligado pela carbonila: `carbamoil-` (ex: `ácido 4-carbamoilbutanoico`).
  - Ligado pelo nitrogênio: `alcanamido-` (ex: `acetamido-` ou `etanoilamino-`, como no *4-acetamidofenol* / Paracetamol).
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - Ureia: diamida do ácido carbônico ($H_2N-CO-NH_2$), principal produto da excreção de compostos nitrogenados em mamíferos e fertilizante agrícola nitrogenado essencial.
  - Piperina: amida alcaloide lipofílica extraída da pimenta-do-reino (*Piper nigrum*), estimuladora de serotonina no SNC, anti-inflamatória e inseticida natural.
  - Capsaicina: amida pungente encontrada nas pimentas do gênero *Capsicum* (malagueta, dedo-de-moça). Provoca sensação de queimação intensa nas mucosas ao ativar termorreceptores TRPV1; é o agente ativo concentrado do gás de pimenta de controle de distúrbios policiais.
  - Ligação Peptídica: a união fundamental entre aminoácidos em todas as proteínas vivas é quimicamente uma ligação amídica.
- **Exemplos Canônicos:**
  - `metanamida` (formamida) | SMILES: `NC=O`
  - `etanamida` (acetamida) | SMILES: `CC(=O)N`
  - `N-metilpropanamida` | SMILES: `CCNC(=O)CC`
  - `N-fenilacetamida` (acetanilida) | SMILES: `CC(=O)Nc1ccccc1`

---

### F13. Nitrilas
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos nitrogenados que apresentam o grupo ciano, no qual o átomo de nitrogênio encontra-se ligado a um átomo de carbono por **ligação tripla** ($-C \equiv N$).
- **Sufixo Canônico:** Nome do hidrocarboneto completo + sufixo `-nitrila` (ex: `etanonitrila`). Nomenclatura secundária aceita: `cianeto de [alquila]-ila` (ex: `cianeto de metila`).
- **Regra de Numeração:** O carbono do grupo $-CN$ faz parte da cadeia principal e é **obrigatoriamente o carbono 1**.
- **Quando Atua como Radical Subordinado:** Prefixo `ciano-`. Ex: *ácido 2-cianopropanoico*.
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - Acrilonitrila (propenonitrila): nitrila insaturada monômero fundamental na indústria de polímeros para a produção da poliacrilonitrila (PAN, fibras têxteis sintéticas tipo lã e precursores de fibra de carbono) e do copolímero ABS (acrilonitrila-butadieno-estireno), utilizado em peças automotivas e blocos de LEGO pela alta resistência ao impacto.
  - Acetonitrila (etanonitrila): excelente solvente polar aprótico largamente empregado em laboratórios de cromatografia líquida de alta eficiência (HPLC).
- **Exemplos Canônicos:**
  - `etanonitrila` (acetonitrila / cianeto de metila) | SMILES: `CC#N`
  - `propanonitrila` | SMILES: `CCC#N`
  - `propenonitrila` (acrilonitrila) | SMILES: `C=CC#N`
  - `benzonitrila` (benzenocarbonitrila) | SMILES: `N#Cc1ccccc1`

---

### F14. Nitrocompostos
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos que apresentam o grupo funcional **nitro** ($-NO_2$) covalentemente ligado a um átomo de carbono da cadeia hidrocarbônica.
- **Prefixo Canônico:** O grupo nitro **não possui sufixo IUPAC**. É nomeado estritamente como o prefixo `nitro-` acrescido do nome do hidrocarboneto correspondente com a posição indicada por localizador:
  - Ex: $CH_3-CH(NO_2)-CH_3 \rightarrow$ `2-nitropropano`.
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - TNT (2,4,6-trinitrotolueno): explosivo industrial e militar de alto poder gerado pela trinitração do tolueno com mistura sulfonítrica.
  - Nitrometano: combustível de alta octanagem para carros de corrida (*dragsters*).
  - Intermediários sintéticos: nitrobenzeno é a etapa industrial primária para a produção de anilina por redução com ferro e ácido.
- **Exemplos Canônicos:**
  - `nitrometano` | SMILES: `C[N+](=O)[O-]`
  - `2-nitropropano` | SMILES: `CC(C)[N+](=O)[O-]`
  - `nitrobenzeno` | SMILES: `O=[N+]([O-])c1ccccc1`
  - `2-metil-1,3,5-trinitrobenzeno` (2,4,6-trinitrotolueno / TNT) | SMILES: `Cc1c([N+](=O)[O-])cc([N+](=O)[O-])cc1[N+](=O)[O-]`

---

### F15. Haletos de Alquila (Halogenetos de Alquila)
- **Definição Canônica (`funcoes.pdf`):** Compostos derivados de hidrocarbonetos pela substituição de um ou mais átomos de hidrogênio por átomos de halogênios ($X = F, Cl, Br, I$).
- **Prefixo Canônico:** Os halogênios não possuem sufixo na nomenclatura substitutiva da IUPAC. São nomeados como substituintes prefixais: `flúor-`, `cloro-`, `bromo-`, `iodo-` seguidos do nome do alcano principal.
  - *Acentuação Oficial pt-BR:* `flúor` possui acento agudo no vocábulo isolado. Em compostos contínuos, a grafia IUPAC/SBQ adota `fluor-` ou `flúor-` (o normalizador deve aceitar ambos).
- **Nomenclatura Funcional / Usual:** `[Haleto] de [alquila]-ila` (ex: `cloreto de etila`, `brometo de metila`).
- **Aplicações, Meio Ambiente e Cotidiano (`funcoes.pdf`):**
  - Clorofórmio (triclorometano / $CHCl_3$): líquido denso e volátil, historicamente empregado como anestésico cirúrgico no século XIX, mas abandonado devido à elevada toxicidade hepática e arritmias cardíacas.
  - CFCs (clorofluorocarbonetos, como o Freon-12 / diclorodifluorometano): gases propelentes de aerossóis e refrigeradores antigamente utilizados. Na estratosfera, a radiação UV cliva ligações $C-Cl$, liberando radicais livres de cloro ($Cl^\bullet$) que destroem cataliticamente o ozônio ($O_3$), gerando o buraco na camada de ozônio (Protocolo de Montreal).
  - DDT (diclorodifeniltricloroetano / 1,1,1-tricloro-2,2-bis(4-clorofenil)etano): inseticida organoclorado largamente empregado em campanhas de saúde pública contra mosquitos transmissores da malária e febre amarela; banido globalmente por causar bioacumulação e biomagnificação ao longo das cadeias tróficas.
- **Exemplos Canônicos:**
  - `clorometano` (cloreto de metila) | SMILES: `CCl`
  - `triclorometano` (clorofórmio) | SMILES: `ClC(Cl)Cl`
  - `2-bromobutano` | SMILES: `CCC(Br)C`
  - `diclorodifluorometano` (Freon-12 / CFC-12) | SMILES: `FC(F)(Cl)Cl`
  - `1,1,1-tricloro-2,2-bis(4-clorofenil)etano` (DDT) | SMILES: `Clc1ccc(C(c2ccc(Cl)cc2)C(Cl)(Cl)Cl)cc1`

---

### F16. Haletos de Acila
- **Definição Canônica (`funcoes.pdf`):** Derivados de ácidos carboxílicos formados pela substituição da hidroxila ($-OH$) por um halogênio ligado diretamente ao carbono carbonílico ($R-COX$, onde $X = F, Cl, Br, I$).
- **Sufixo Canônico:** Nome do haleto de ácido com a terminação `-eto` + preposição `de` + raiz hidrocarbônica + sufixo `-oíla` (ou `-ila`):
  - Ex: $CH_3-COCl \rightarrow$ `cloreto de etanoíla` (ou `cloreto de acetila`).
  - Ex: $C_6H_5-COCl \rightarrow$ `cloreto de benzoíla`.
- **Quando Atua como Radical Subordinado:** Prefixo `haloformil-` ou `halocarbonil-` (ex: `clorocarbonil-`).
- **Reatividade e Cotidiano:** Espécies extremamente reativas com eletrófilos fortes, usadas em síntese farmacológica avançada para transferir grupos acila gerando ésteres e amidas com liberação de $HX$.
- **Exemplos Canônicos:**
  - `cloreto de etanoíla` (cloreto de acetila) | SMILES: `CC(=O)Cl`
  - `brometo de propanoíla` | SMILES: `CCC(=O)Br`
  - `cloreto de benzoíla` | SMILES: `O=C(Cl)c1ccccc1`

---

### F17. Anidridos de Ácido
- **Definição Canônica (`funcoes.pdf`):** Compostos orgânicos derivados da **desidratação intermolecular (ou intramolecular)** de ácidos carboxílicos ($R-CO-O-CO-R'$), caracterizados por dois grupamentos acila unidos por uma ponte central de oxigênio.
- **Sufixo Canônico:** Palavra `anidrido` seguida dos nomes dos ácidos carboxílicos que o originaram (em ordem alfabética se assimétrico):
  - Simétrico: $CH_3-CO-O-CO-CH_3 \rightarrow$ `anidrido etanoico` (ou `anidrido acético`).
  - Assimétrico: $CH_3-CO-O-CO-CH_2-CH_3 \rightarrow$ `anidrido etanoico-propanoico` (ou `anidrido etanoico propanoico`).
- **Quando Atua como Radical Subordinado:** Prefixo `alcanoilóxi-` (ex: `acetilóxi-` / `etanoilóxi-`).
- **Aplicações e Cotidiano (`funcoes.pdf`):**
  - Anidrido acético (anidrido etanoico): reagente industrial indispensável na síntese da Aspirina (ácido acetilsalicílico) via esterificação da hidroxila fenólica do ácido salicílico.
- **Exemplos Canônicos:**
  - `anidrido etanoico` (anidrido acético) | SMILES: `CC(=O)OC(=O)C`
  - `anidrido metanoico-etanoico` | SMILES: `O=COC(=O)C`
  - `anidrido benzoico` | SMILES: `O=C(Oc1ccccc1)c1ccccc1`

---

## 3. Normas Gramaticais do Novo Acordo Ortográfico (Química pt-BR)

As regras de ortografia química no Brasil seguem as convenções conjuntas da **Sociedade Brasileira de Química (SBQ)** e da **Academia Brasileira de Letras (ABL)**, decorrentes do Acordo Ortográfico da Língua Portuguesa de 1990 (Base XVI — Do hífen nas palavras compostas e derivadas).

### 3.1 A Regra do Hífen Diante da Letra 'h' (Mandatória)
Sempre que um prefixo ou radical (terminado em qualquer letra) for justaposto a um vocábulo que se inicie com a letra **'h'**, o uso do hífen é **OBRIGATÓRIO**:
- $\text{ciclo} + \text{hexano} \rightarrow$ **`ciclo-hexano`** (com hífen).
- $\text{ciclo} + \text{heptano} \rightarrow$ **`ciclo-heptano`** (com hífen).
- $\text{ciclo} + \text{hexeno} \rightarrow$ **`ciclo-hexeno`** (com hífen).
- $\text{ciclo} + \text{hexanol} \rightarrow$ **`ciclo-hexanol`** (com hífen).
- $\text{metil} + \text{hexano} \rightarrow$ **`metil-hexano`** (ou `2-metil-hexano`, com hífen).
- $\text{dimetil} + \text{hexano} \rightarrow$ **`dimetil-hexano`** (ou `2,3-dimetil-hexano`, com hífen).
- $\text{etil} + \text{heptano} \rightarrow$ **`etil-heptano`** (com hífen).

> **Tolerância Pedagógica do Motor de Normalização:**  
> Embora a forma canônica culta seja `ciclo-hexano`, muitos livros didáticos e vestibulares antigos mantiveram as grafias `ciclohexano` (mantendo o 'h' sem hífen) e `cicloexano` (suprimindo o 'h'). O `chemistry-core` deve normalizar internamente todas essas variantes para uma única chave semântica.

### 3.2 A Regra da Aglutinação (Sem Hífen)
Quando o segundo elemento **não principia por 'h' nem por vogal idêntica**, os elementos devem ser **aglutinados diretamente**, sem nenhum hífen:
- $\text{ciclo} + \text{butano} \rightarrow$ **`ciclobutano`** (NUNCA `ciclo-butano`).
- $\text{ciclo} + \text{pentano} \rightarrow$ **`ciclopentano`** (NUNCA `ciclo-pentano`).
- $\text{ciclo} + \text{propano} \rightarrow$ **`ciclopropano`** (NUNCA `ciclo-propano`).
- $\text{metil} + \text{propano} \rightarrow$ **`metilpropano`** (NUNCA `metil-propano`).
- $\text{dimetil} + \text{butano} \rightarrow$ **`dimetilbutano`** (NUNCA `dimetil-butano`).
- $\text{etil} + \text{benzeno} \rightarrow$ **`etilbenzeno`** (NUNCA `etil-benzeno`).
- $\text{cloro} + \text{benzeno} \rightarrow$ **`clorobenzeno`** (NUNCA `cloro-benzeno`).
- $\text{nitro} + \text{benzeno} \rightarrow$ **`nitrobenzeno`** (NUNCA `nitro-benzeno`).

### 3.3 A Regra da Colisão Vocálica Idêntica
Quando o prefixo termina pela **mesma vogal** com que se inicia o radical seguinte, usa-se hífen:
- $\text{ciclo} + \text{octano} \rightarrow$ **`ciclo-octano`** (com hífen pela norma culta).  
  *Observação de Tolerância:* A forma arcaica `ciclooctano` também é comumente encontrada e aceita sem penalidade no Speedrunner Type.
- $\text{tetra} + \text{amina} \rightarrow$ admite-se elisão `tetramina` ou grafia com hífen `tetra-amina`.

### 3.4 Pontuação Canônica de Separadores (Hífens, Vírgulas e Espaços)
1. **Número e Letra:** Separados estritamente por **hífen**:
   - `butan-2-ol`, `2-metilpropano`, `but-2-eno`.
2. **Número e Número:** Separados estritamente por **vírgula sem espaço**:
   - `2,3-dimetilbutano`, `buta-1,3-dieno`, `1,2-dicloroetano`.
3. **Letras Locadoras Especiais:**
   - Locadores $N$ de aminas e amidas ligam-se por hífen: `N-metiletanamina`, `N,N-dimetilformamida`.
   - Locadores de isômeros posicionais e espaciais ligam-se por hífen: `o-xileno`, `m-cresol`, `p-nitrofenol`, `cis-but-2-eno`, `trans-pent-2-eno`.
4. **Espaçamento por Classes:**
   - Ácidos Carboxílicos: a palavra `ácido` é sempre separada por **espaço**: `ácido butanoico`.
   - Anidridos: a palavra `anidrido` é separada por **espaço**: `anidrido etanoico`.
   - Ésteres: divididos pela preposição `de`: `etanoato de etila`.
   - Haletos de Acila: divididos pela preposição `de`: `cloreto de etanoíla`.

---

## 4. O Sistema Duplo de Localizadores: IUPAC 1993 vs. IUPAC 2013

No Brasil, os vestibulares mais concorridos (FUVEST, UNICAMP, ENEM, UERJ) e os livros do PNLD (Marta Reis, Feltre, Usberco & Salvador) utilizam tanto a nomenclatura tradicional (recomendações IUPAC 1979/1993) quanto a moderna (IUPAC Blue Book 2013). O QuímicaRush adota paridade total entre ambas.

### 4.1 Anatomia da Diferença Estrutural
- **IUPAC 1993 (Tradicional):** O localizador numérico de insaturações e funções principais é colocado **antes do prefixo carbônico principal da cadeia**:
  $$\mathbf{2}\text{-buteno} \quad\mid\quad \mathbf{2}\text{-butanol} \quad\mid\quad \mathbf{2}\text{-butanona} \quad\mid\quad \mathbf{1,3}\text{-butadieno}$$
- **IUPAC 2013 (Blue Book P-14.3.2):** O localizador numérico é inserido **imediatamente antes da unidade morfológica que ele modifica** (infixo ou sufixo):
  $$\text{but-}\mathbf{2}\text{-eno} \quad\mid\quad \text{butan-}\mathbf{2}\text{-ol} \quad\mid\quad \text{butan-}\mathbf{2}\text{-ona} \quad\mid\quad \text{buta-}\mathbf{1,3}\text{-dieno}$$

### 4.2 Matriz de Correspondência Canônica

| Composto | IUPAC 2013 (Padrão Moderno) | IUPAC 1993 (Padrão Tradicional) | Status no QuímicaRush |
|:---|:---|:---|:---:|
| $CH_3-CH=CH-CH_3$ | `but-2-eno` | `2-buteno` | Ambos 100% Válidos |
| $CH_3-CH(OH)-CH_2-CH_3$ | `butan-2-ol` | `2-butanol` | Ambos 100% Válidos |
| $CH_3-CO-CH_2-CH_3$ | `butan-2-ona` | `2-butanona` | Ambos 100% Válidos |
| $CH_2=CH-CH=CH_2$ | `buta-1,3-dieno` | `1,3-butadieno` | Ambos 100% Válidos |
| $CH_3-C \equiv C-CH_3$ | `but-2-ino` | `2-butino` | Ambos 100% Válidos |
| $CH_2(OH)-CH_2(OH)$ | `etano-1,2-diol` | `1,2-etanodiol` | Ambos 100% Válidos |
| $CH_3-CH(CH_3)-CH_2-CH_2-OH$ | `3-metilbutan-1-ol` | `3-metil-1-butanol` | Ambos 100% Válidos |
| $CH_2=CH-CH(OH)-CH_3$ | `but-3-en-2-ol` | `3-buten-2-ol` | Ambos 100% Válidos |
| $CH_3-CH=CH-CO-CH_3$ | `pent-3-en-2-ona` | `3-penten-2-ona` | Ambos 100% Válidos |
| Cicloalceno de 6 carbonos | `ciclo-hexeno` | `ciclo-hexeno` | Idênticos (posição 1 implícita) |
| Cicloalcadieno de 6 carbonos | `ciclo-hexa-1,3-dieno` | `1,3-ciclo-hexadieno` | Ambos 100% Válidos |

---

## 5. Radicais Ramificados Complexos e Parênteses (Substituintes Compostos)

Pelas regras da IUPAC (Blue Book P-29 e P-44), quando um substituinte ramificado possui por sua vez outras ramificações, heteroátomos ou grupos funcionais subordinados, ele constitui um **radical complexo** e deve ser **enclausurado entre parênteses**.

### 5.1 Numeração Interna do Radical Complexo
1. O carbono do radical que se liga diretamente à cadeia principal recebe obrigatoriamente a numeração **1' (ou simplesmente 1 interno)**.
2. A cadeia do radical é numerada a partir desse ponto de ligação, e os grupos subordinados internos recebem seus respectivos localizadores.
3. Exemplos morfológicos:
   - `-CH2-Cl`: `(clorometil)-`
   - `-CH(Cl)-CH3`: `(1-cloroetil)-`
   - `-CH2-CH2-Cl`: `(2-cloroetil)-`
   - `-CH2-OH`: `(hidroximetil)-`
   - `-CH2-CH2-OH`: `(2-hidroxietil)-`
   - `-CH2-NH2`: `(aminometil)-`
   - `-CH2-CH2-NH2`: `(2-aminoetil)-`
   - `-N(CH3)2`: `(dimetilamino)-`
   - `-CH2-N(CH3)2`: `(dimetilaminometil)-`
   - `-CH2-CHO`: `(formilmetil)-` ou `(2-oxoetil)-`
   - `-CH2-CO-CH3`: `(2-oxopropil)-`
   - `-CF3`: `(trifluorometil)-`
   - `-C6H4-NO2` (em posição para): `(4-nitrofenil)-`
   - `-C6H4-OH` (em posição para): `(4-hidroxifenil)-`
   - `-CH2-O-CH3`: `(metoximetil)-`

### 5.2 Regras de Ordem Alfabética de Radicais
- **Prefixos Multiplicadores Simples:** Prefixos como `di-`, `tri-`, `tetra-`, `sec-` e `terc-` **NÃO** são considerados na ordem alfabética de radicais simples (ex: `dimetil` é ordenado pela letra **m**; `dietil` é ordenado pela letra **e**; `terc-butil` é ordenado pela letra **b**).
- **Prefixos Integrados (iso, neo, ciclo):** Os prefixos `iso`, `neo` e `ciclo` **SÃO** considerados na ordem alfabética (ex: `isopropil` é ordenado pela letra **i**; `ciclopropil` pela letra **c**).
- **Radicais Complexos Parênteses:** O nome completo do radical entre parênteses é ordenado pela sua **primeira letra gráfica interna**, inclusive multiplicadores (ex: `(dimetilamino)` é alfabetizado sob a letra **d**; `(clorometil)` sob a letra **c**).

### 5.3 Exemplos do Modo Caos (Moléculas Polifuncionais Bizzaras)
1. **`ácido 4-amino-5-(clorometil)-6-hidróxi-3-oxoheptanoico`**
   - Função Dominante (Sufixo): Ácido Carboxílico (`ácido ...-oico`) na ponta C1.
   - Funções Subordinadas:
     - Cetona no C3 $\rightarrow$ `3-oxo`
     - Amina no C4 $\rightarrow$ `4-amino`
     - Radical Halogenado no C5 $\rightarrow$ `5-(clorometil)`
     - Álcool no C6 $\rightarrow$ `6-hidróxi`
   - Ordem Alfabética: `amino` (a) < `(clorometil)` (c) < `hidróxi` (h) < `oxo` (o).

2. **`ácido 2-acetóxi-4-ciano-5-(dimetilamino)benzoico`**
   - Função Dominante: Ácido Carboxílico no anel benzênico (`ácido ...benzoico`).
   - Funções Subordinadas:
     - Éster ligado por oxigênio no C2 $\rightarrow$ `2-acetóxi`
     - Nitrila no C4 $\rightarrow$ `4-ciano`
     - Amina terciária no C5 $\rightarrow$ `5-(dimetilamino)`

3. **`cloreto de 4-(carbamoilmetil)-3-hidróxi-6-nitro-heptanoíla`**
   - Função Dominante: Haleto de Acila (`cloreto de ...-oíla`).
   - Funções Subordinadas:
     - Álcool $\rightarrow$ `3-hidróxi`
     - Amida em radical $\rightarrow$ `4-(carbamoilmetil)`
     - Nitrocomposto $\rightarrow$ `6-nitro`

---

## 6. O Dicionário Canônico de Sinônimos Triviais, Históricos e Comerciais

Tabela autoritativa com 50 compostos do ensino médio, vestibulares brasileiros e do `funcoes.pdf`.

| Nome Trivial / Comercial (pt-BR) | Nome IUPAC 2013 Canônico | Nome IUPAC 1993 Equivalente | Fórmula Molecular | SMILES | Função Primária | Contexto & Origem (`funcoes.pdf`) |
|:---|:---|:---|:---|:---|:---|:---|
| **Acetona** | `propan-2-ona` / `propanona` | `2-propanona` | $C_3H_6O$ | `CC(=O)C` | Cetona | Removedor de esmalte; corpo cetônico no jejum; controle pela PF na pasta-base. |
| **Formol / Formaldeído** | `metanal` | `metanal` | $CH_2O$ | `C=O` | Aldeído | Conservação cadavérica; desnaturação de proteínas bacterianas. |
| **Acetaldeído** | `etanal` | `etanal` | $C_2H_4O$ | `CC=O` | Aldeído | Toxina da oxidação hepática do etanol responsável pela ressaca. |
| **Ácido Fórmico** | `ácido metanoico` | `ácido metanoico` | $CH_2O_2$ | `OC=O` | Ácido Carboxílico | Picada dolorosa e ardida de formigas e abelhas (*formica*). |
| **Ácido Acético** | `ácido etanoico` | `ácido etanoico` | $C_2H_4O_2$ | `CC(=O)O` | Ácido Carboxílico | Vinagre de cozinha (solução a 4-5%); tempero culinário. |
| **Ácido Butírico** | `ácido butanoico` | `ácido butanoico` | $C_4H_8O_2$ | `CCCC(=O)O` | Ácido Carboxílico | Odor forte de manteiga rançosa e suor envelhecido (*butyrum*). |
| **Ácido Valérico** | `ácido pentanoico` | `ácido pentanoico` | $C_5H_{10}O_2$ | `CCCCC(=O)O` | Ácido Carboxílico | Isolado da raiz sedativa da planta medicinal *Valeriana*. |
| **Ácido Caproico** | `ácido hexanoico` | `ácido hexanoico` | $C_6H_{12}O_2$ | `CCCCCC(=O)O` | Ácido Carboxílico | Odor pungente característico de bodes e cabras (*Capra*). |
| **Ácido Salicílico** | `ácido 2-hidroxibenzoico` | `ácido 2-hidroxibenzoico` | $C_7H_6O_3$ | `O=C(O)c1ccccc1O` | Ácido Carboxílico | Precursor natural extraído da casca do salgueiro (*Salix*). |
| **Aspirina (AAS)** | `ácido 2-acetoxibenzoico` | `ácido 2-acetoxibenzoico` | $C_9H_8O_4$ | `CC(=O)Oc1ccccc1C(=O)O` | Ácido Carboxílico | Analgésico, antipirético e anticoagulante mais consumido. |
| **Ácido Láctico** | `ácido 2-hidroxipropanoico`| `ácido 2-hidroxipropanoico`| $C_3H_6O_3$ | `CC(O)C(=O)O` | Ácido Carboxílico | Fermentação láctica de queijos e iogurtes; fadiga muscular. |
| **Ácido Oxálico** | `ácido etanodioico` | `ácido etanodioico` | $C_2H_2O_4$ | `OC(=O)C(=O)O` | Ácido Carboxílico | Presente no espinafre e carambola; cálculo renal de oxalato. |
| **Álcool Etílico** | `etanol` | `etanol` | $C_2H_6O$ | `CCO` | Álcool | Álcool veicular renovável, cerveja, vinho e antisséptico 70%. |
| **Álcool Metílico** | `metanol` | `metanol` | $CH_4O$ | `CO` | Álcool | Combustível de aeromodelismo; altamente tóxico (cegueira e morte). |
| **Álcool Isopropílico** | `propan-2-ol` | `2-propanol` | $C_3H_8O$ | `CC(O)C` | Álcool | Limpeza de circuitos eletrônicos por rápida evaporação e pouca água. |
| **Álcool Benzílico** | `fenilmetanol` | `fenilmetanol` | $C_7H_8O$ | `OCc1ccccc1` | Álcool | Álcool aromático com carbono intermediário (NÃO é fenol!). |
| **Glicerol (Glicerina)**| `propano-1,2,3-triol` | `1,2,3-propanotriol` | $C_3H_8O_3$ | `OCC(O)CO` | Álcool | Subproduto do biodiesel e fabricação de sabonetes hidratantes. |
| **Etilenoglicol** | `etano-1,2-diol` | `1,2-etanodiol` | $C_2H_6O_2$ | `OCCO` | Álcool | Aditivo anticongelante/antiferver para radiadores de automóveis. |
| **Mentol** | `(1R,2S,5R)-2-isopropil-5-metilciclo-hexanol` | `2-isopropil-5-metilciclo-hexanol` | $C_{10}H_{20}O$ | `CC1CCC(C(O)C1)C(C)C` | Álcool | Sensação de refrescância em balas, pastas de dente e pomadas. |
| **Citronelol** | `3,7-dimetiloct-6-en-1-ol`| `3,7-dimetil-6-octen-1-ol` | $C_{10}H_{20}O$ | `CC(C)=CCCC(C)CCO` | Álcool | Óleo aromático de eucalipto com ação natural repelente. |
| **Fenol Comum / Ácido Fênico** | `hidroxibenzeno` | `hidroxibenzeno` | $C_6H_6O$ | `Oc1ccccc1` | Fenol | Antisséptico pioneiro de Joseph Lister; altamente corrosivo. |
| **o-Cresol** | `2-metilfenol` | `2-metilfenol` | $C_7H_8O$ | `Cc1ccccc1O` | Fenol | Constituinte da creolina de limpeza veterinária e desinfecção. |
| **Éter Etílico / Dietílico** | `etoxietano` | `etoxietano` | $C_4H_{10}O$ | `CCOCC` | Éter | Primeiro anestésico geral cirúrgico; formação de peróxidos. |
| **Éter Metil-Etílico** | `metoxietano` | `metoxietano` | $C_3H_8O$ | `COCC` | Éter | Éter assimétrico simples citado no `funcoes.pdf`. |
| **Anilina** | `fenilamina` / `benzenamina`| `aminobenzeno` | $C_6H_7N$ | `Nc1ccccc1` | Amina | Matéria-prima clássica de corantes industriais para tecidos. |
| **Trimetilamina** | `N,N-dimetilmetanamina` | `trimetilamina` | $C_3H_9N$ | `CN(C)C` | Amina | Cheiro repulsivo característico de peixe cru estragado. |
| **Acetamida** | `etanamida` | `etanamida` | $C_2H_5NO$ | `CC(=O)N` | Amida | Amida primária alifática de 2 carbonos. |
| **Formamida** | `metanamida` | `metanamida` | $CH_3NO$ | `NC=O` | Amida | Amida mais simples existente, solvente crioprotetor. |
| **Ureia** | `diamidometanal` / `ureia` | `ureia` | $CH_4N_2O$ | `NC(=O)N` | Amida | Síntese de Wöhler (1828) que derrubou a Teoria da Força Vital. |
| **Piperina** | *(Alcaloide amídico)* | *(Alcaloide amídico)* | $C_{17}H_{19}NO_3$ | `O=C(N1CCCCC1)/C=C/C=C/c2ccc3OCOc3c2` | Amida | Alcaloide da pimenta-do-reino; anti-inflamatório e inseticida. |
| **Capsaicina** | `(E)-N-(4-hidróxi-3-metoxibenzil)-8-metilnon-6-enamida` | — | $C_{18}H_{27}NO_3$ | `CC(C)/C=C/CCCCC(=O)NCc1ccc(O)c(OC)c1` | Amida | Princípio picante das pimentas; ingrediente do gás de pimenta. |
| **Acrilonitrila** | `propenonitrila` | `propenonitrila` | $C_3H_3N$ | `C=CC#N` | Nitrila | Monômero do plástico ABS de carros/LEGO e tecidos sintéticos. |
| **Acetonitrila** | `etanonitrila` | `etanonitrila` | $C_2H_3N$ | `CC#N` | Nitrila | Solvente polar aprótico industrial de cromatografia HPLC. |
| **TNT** | `2-metil-1,3,5-trinitrobenzeno` | `2,4,6-trinitrotolueno` | $C_7H_5N_3O_6$ | `Cc1c([N+](=O)[O-])cc([N+](=O)[O-])cc1[N+](=O)[O-]` | Nitrocomposto | Explosivo militar clássico de detonação rápida. |
| **Clorofórmio** | `triclorometano` | `triclorometano` | $CHCl_3$ | `ClC(Cl)Cl` | Haleto de Alquila | Anestésico inalatório arcaico; tóxico para coração e fígado. |
| **Cloreto de Metileno** | `diclorometano` | `diclorometano` | $CH_2Cl_2$ | `ClCCl` | Haleto de Alquila | Solvente industrial de descafeinação e decapagem de tintas. |
| **Tetracloreto de Carbono** | `tetraclorometano` | `tetraclorometano` | $CCl_4$ | `ClC(Cl)(Cl)Cl` | Haleto de Alquila | Antigo solvente de lavagem a seco e extintores de incêndio. |
| **Iodoforme** | `tri-iodometano` | `tri-iodometano` | $CHI_3$ | `IC(I)I` | Haleto de Alquila | Sólido amarelo antisséptico bucal hospitalar clássico. |
| **Freon-12 (CFC-12)** | `diclorodifluorometano` | `diclorodifluorometano` | $CCl_2F_2$ | `FC(F)(Cl)Cl` | Haleto de Alquila | Antigo gás de geladeira causador do buraco no ozônio. |
| **DDT** | `1,1,1-tricloro-2,2-bis(4-clorofenil)etano` | `DDT` | $C_{14}H_9Cl_5$ | `Clc1ccc(C(c2ccc(Cl)cc2)C(Cl)(Cl)Cl)cc1` | Haleto de Alquila | Inseticida banido por biomagnificação ao longo da cadeia alimentar. |
| **Acetato de Etila** | `etanoato de etila` | `etanoato de etila` | $C_4H_8O_2$ | `CCOC(=O)C` | Éster | Solvente industrial com odor agradável de frutas; removedores sem acetona. |
| **Formiato de Metila** | `metanoato de metila` | `metanoato de metila` | $C_2H_4O_2$ | `COC=O` | Éster | Éster mais simples derivado do ácido metanoico. |
| **Cloreto de Acetila** | `cloreto de etanoíla` | `cloreto de etanoíla` | $C_2H_3ClO$ | `CC(=O)Cl` | Haleto de Acila | Agente de acetilação muito reativo em química farmacêutica. |
| **Anidrido Acético** | `anidrido etanoico` | `anidrido etanoico` | $C_4H_6O_3$ | `CC(=O)OC(=O)C` | Anidrido | Desidratação do ácido acético; síntese industrial do AAS. |
| **Etileno** | `eteno` | `eteno` | $C_2H_4$ | `C=C` | Hidrocarboneto | Hormônio gasoso para amadurecimento artificial de bananas. |
| **Acetileno** | `etino` | `etino` | $C_2H_2$ | `C#C` | Hidrocarboneto | Chama de altíssima temperatura em maçaricos de metalúrgica. |
| **Tolueno** | `metilbenzeno` | `metilbenzeno` | $C_7H_8$ | `Cc1ccccc1` | Hidrocarboneto | Hidrocarboneto aromático usado como solvente de colas. |
| **o-Xileno** | `1,2-dimetilbenzeno` | `1,2-dimetilbenzeno` | $C_8H_{10}$ | `Cc1ccccc1C` | Hidrocarboneto | Derivado aromático com metilas em posições adjacentes (1,2). |
| **Naftaleno (Naftalina)**| `naftaleno` | `naftaleno` | $C_{10}H_8$ | `c1ccc2ccccc2c1` | Hidrocarboneto | Bolinhas brancas antitraça que sublimam lentamente no armário. |
| **Isooctano** | `2,2,4-trimetilpentano` | `2,2,4-trimetilpentano` | $C_8H_{18}$ | `CC(C)CC(C)(C)C` | Hidrocarboneto | Padrão 100 de octanagem de queima suave da gasolina. |

---

## 7. Especificação Formal de Regex e Padrões Morfológicos (pt-BR)

Para implementação no analisador léxico (`lexer.ts`), no analisador sintático (`parser.ts`) e no normalizador (`normalizer.ts`), devem ser adotados os seguintes blocos de expressões regulares:

### 7.1 Prefixos de Quantidade de Carbonos (Stems)
```regex
\b(met|et|prop|but|pent|hex|hept|oct|non|dec|undec|dodec)\b
```
*Tabela de Carbonos:* `met` (1), `et` (2), `prop` (3), `but` (4), `pent` (5), `hex` (6), `hept` (7), `oct` (8), `non` (9), `dec` (10), `undec` (11), `dodec` (12).

### 7.2 Infixos de Saturação de Ligações (Bonds)
```regex
(an|en|in|dien|diin|trien|triin)
```
- `an`: apenas ligações simples
- `en`: uma ligação dupla
- `in`: uma ligação tripla
- `dien`: duas ligações duplas
- `diin`: duas ligações triplas
- `trien`: três ligações duplas

### 7.3 Sufixos de Funções Principais
```regex
(o|ol|al|ona|oico|oato|amina|amida|nitrila|oila|carboxilico|carbaldeido|carbonitrila)
```

### 7.4 Radicais Alquilas e Arilas Simples
```regex
\b(metil|etil|propil|isopropil|butil|sec-butil|isobutil|terc-butil|pentil|isopentil|neopentil|hexil|heptil|octil|fenil|benzil|vinil|alil)\b
```

### 7.5 Prefixos de Funções Subordinadas
```regex
\b(carboxi|acetoxi|alcoxicarbonil|metoxicarbonil|etoxicarbonil|carbamoil|acetamido|ciano|formil|oxo|hidroxi|hidróxi|amino|dimetilamino|metilamino|metoxi|metóxi|etoxi|etóxi|propoxi|isopropoxi|fenoxi|fluor|flúor|cloro|bromo|iodo|nitro)\b
```

### 7.6 Radicais Complexos com Parênteses
```regex
\(([0-9,N]+-)?(cloro|bromo|hidroxi|hidróxi|amino|oxo|metoxi|metóxi|nitro|fenil)*[a-z]+\)
```

### 7.7 Localizadores Numéricos e Letras
```regex
[0-9]+(,[0-9]+)*|[Nn](,[Nn])*|[opm]-
```

### 7.8 Pipeline Algorítmico de Normalização Estrita
```typescript
/**
 * Pipeline Canônico de Tolerância e Normalização IUPAC pt-BR:
 * 1. stripDiacritics: ácido -> acido, hidróxi -> hidroxi, flúor -> fluor.
 * 2. normalizeHyphens: converte traços unicode (–, —, −) em ASCII '-'.
 * 3. normalizeCiclo: ciclo-hexano / cicloexano -> ciclohexano (chave única interna).
 * 4. convert1993To2013: 2-butanol -> butan-2-ol, 2-buteno -> but-2-eno.
 * 5. lookupSynonym: acetona -> propanona, formol -> metanal.
 */
```

---

## 8. Critérios de Avaliação e Detecção de Inversão de Prioridade

O motor pedagógico (`evaluator.ts`) deve avaliar as submissões dos estudantes gerando nota ponderada e diagnósticos formativos:

### 8.1 Ponderação de Créditos Parciais
$$\text{Nota Final} = 0{,}35 \cdot S_{\text{função}} + 0{,}25 \cdot S_{\text{cadeia}} + 0{,}20 \cdot S_{\text{insaturações}} + 0{,}20 \cdot S_{\text{radicais}}$$

- **Identificação da Função Principal ($S_{\text{função}} = 35\%$):** Reconheceu a função de maior prioridade pelo sufixo correto.
- **Cadeia Principal ($S_{\text{cadeia}} = 25\%$):** Contagem correta de carbonos (`met`, `et`, `prop`...) e anel (`ciclo`).
- **Insaturações ($S_{\text{insaturações}} = 20\%$):** Tipo e localização das ligações duplas/triplas (`-an-`, `-en-`, `-in-`).
- **Radicais e Localizadores ($S_{\text{radicais}} = 20\%$):** Presença correta dos substituintes e numeração mínima.

### 8.2 Diagnóstico Específico: Inversão de Prioridade IUPAC
Se um estudante submeter, por exemplo:
- **Alvo:** `ácido 3-hidroxibutanoico`
- **Submissão do Usuário:** `3-carboxibutan-1-ol`

O sistema deve disparar a regra:
```typescript
if (
  userPrimaryFunction === 'alcool' &&
  targetPrimaryFunction === 'acido_carboxilico' &&
  userAST.substituents.some(s => s.name === 'carboxi')
) {
  result.priorityInversionDetected = true;
  result.feedbackMessages.push(
    "⚠️ Inversão de Prioridade IUPAC: Você identificou a carboxila (-COOH) e a hidroxila (-OH), " +
    "mas os Ácidos Carboxílicos têm prioridade MÁXIMA sobre os Álcoois! " +
    "A carboxila deve receber o sufixo '-oico' e o álcool atua como radical 'hidróxi-'."
  );
}
```

---

## 9. Lista de Verificação e Garantia de Qualidade (QA Checklist)

Para todos os subagentes e pacotes do repositório:
- [x] **16 Funções Cobertas:** Todas as 16 funções orgânicas do `funcoes.pdf` estão catalogadas com rigor químico.
- [x] **Novo Acordo Ortográfico:** Regra do 'h' (`ciclo-hexano`, `dimetil-hexano`) e aglutinações (`ciclobutano`, `metilpentano`) documentadas com política de tolerância.
- [x] **IUPAC 1993 e 2013:** Mapeamento bidirecional garantindo aceitação de `2-butanol` e `butan-2-ol`.
- [x] **Hierarquia de Prioridade:** Matriz completa de ranking ordinal decrescente de 16 a 1 e nomes dos grupos como radicais subordinados.
- [x] **Radicais Complexos:** Regras de parênteses e numeração interna explicitadas para o Modo Caos.
- [x] **Dicionário de Sinônimos:** 50 moléculas de vestibulares e do `funcoes.pdf` mapeadas com fórmulas e SMILES.
- [x] **Regex Padronizadas:** Expressões regulares prontas para integração em TypeScript.

---
*Este documento é a referência canônica final e imutável para toda a base científica do QuímicaRush.*
