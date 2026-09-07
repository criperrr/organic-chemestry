# Estado do Projeto — 07/09/2026

> Sessão anterior (Antigravity CLI, conversa "Construtor Molecular Interativo IUPAC",
> 03/09) morreu com `RESOURCE_EXHAUSTED` no meio da tarefa e deixou o motor de
> nomeação e o canvas pela metade. Este documento fecha aquele estado e descreve o
> que ficou por fazer.

**Verificação atual:** 217 testes passando · `npm run typecheck` sem erros · build OK
nos dois apps · **98,0% de round-trip IUPAC medido** (`npm run audit:names`).

---

## 1. Estrutura dos pacotes (mudou)

```
packages/
  chemistry-core/      motor de nomenclatura + avaliador + tabela das 16 funções
  chemistry-dataset/   acervo curado, gerador procedural, modo caos
  gamification-engine/ áudio, combo, FSRS
  smiles-renderer/     render 2D (SmilesDrawer)
  molecule-canvas/     [NOVO] editor de fórmula estrutural, isolado e reutilizável
  molecule-studio/     [NOVO] site separado, só o construtor (porta 5174)
  web-app/             QuímicaRush (porta 5173)
```

`molecule-canvas` foi extraído de `web-app/src/components/sandbox/` justamente para
poder ser trabalhado isoladamente. Os dois apps consomem o mesmo canvas.

Comandos: `npm run dev` (web-app) · `npm run dev:studio` (studio) · `npm test` ·
`npm run typecheck`.

---

## 2. O que foi corrigido no motor (`graph-namer.ts`)

Estava com 15 testes falhando e 7 erros de typecheck. Bugs de raiz encontrados:

| Bug | Sintoma | Causa |
|---|---|---|
| Grupo do sufixo citado 2× | `1-hidroxietanol`, `2-oxopropanona` | `identifySubstituents` não sabia quais átomos o sufixo já consumira |
| Hidrocarboneto como função principal | `but-3-ino` em vez de `but-1-ino` | pseudo-grupo entrava na minimização de localizadores |
| Ordem dos critérios de cadeia principal | `2,4,4-trimetilpentano` | comprimento estava abaixo de insaturações |
| Aromaticidade de SMILES minúsculo | benzeno virava `ciclo-hexano`, `C6H12` | flag `aromatic` do parser ignorada na percepção de anel |
| Naftaleno | virava benzeno + 2 fenilas | anéis fundidos não uniam perímetro |
| **Heterociclos** | piridina → `ciclo-hexanamina` | anel com heteroátomo contado como todo-carbono |
| **Serializador SMILES** | `C1CNC1` → `C(CNC1)C2` (inválido) | lista de vizinhos não revalidada + dígito de anel só numa ponta |

Correções notáveis:

- Heteroátomo de anel **não** é mais detectado como amina/éter — é esqueleto.
- Tabela de nomes retidos (`HETEROCYCLES`): azetidina, pirrolidina, oxolano, oxano,
  piperidina, piridina, furano, tiofeno, pirrol, pirazol, imidazol, pirimidina,
  pirazina, piridazina, morfolina, piperazina, 1,4-dioxano, oxirano, aziridina, tiirano.
- Heteroátomo é forçado à **posição 1** (por isso `piperidin-4-ol`, não `-1-ol`).
- Anel heterocíclico fora da tabela → `analyzeMolecularGraph` devolve
  `isNameable: false` com `code: 'unsupported_ring'`. **Regra adotada: nunca emitir
  um nome errado com confiança.**
- Parser de SMILES agora entende `s` e `p` aromáticos (tiofeno estava virando ciclopentano).

### API nova em `chemistry-core`

- `analyzeMolecularGraph(graph)` → nome 2013/1993, fórmula, SMILES, funções,
  localizadores por átomo, lista de problemas e **derivação em 6 passos** ("Por que
  esse nome?").
- `validateMolecularGraph(graph)` → átomos soltos, valência estourada, sem carbono.
- `function-guide.ts` → `FUNCTION_GUIDE` (as 16 funções com sufixo, prefixo, regra de
  reconhecimento, mnemônico, exemplo), `checkNomenclatureAnswer`, `gradeFunctionHunt`.

---

## 3. Funcionalidades novas no web-app

- **Construtor ao vivo** (aba Laboratório → modo Construtor): o `SkeletalCanvas`
  finalmente ligado ao motor. Nome atualiza a cada traço. Tem "Modo desafio" que
  esconde o nome. *Antes disso o SandboxHub era só um navegador de presets — o
  canvas existia mas nunca fora conectado.*
- **Caça-Funções** (aba 2): identifica quais funções aparecem na molécula (16 chips,
  1 tecla cada) + rodada bônus opcional "como se nomeia?" que aceita `-al`, `al`,
  `sufixo -al`, `termina em AL`.
- **Camada de dopamina**: janela turbo que drena visivelmente (4 s), molécula dourada
  (1 em 12, XP ×3), baú de sessão progressivo (5→6→7...). `awardModeResult` no store
  reaproveita todo o pipeline de XP/combo/badges.
- Abas renumeradas: `1` Treino · `2` Caçada · `3` Compêndio · `4` Laboratório.
- Rail lateral virou lista vertical (4 abas não cabiam em 216 px e o `aside` com
  `overflow-y:auto` virava scroll horizontal, decapitando "Treino").

---

## 4. Molecule Studio (site separado)

Tela cheia, canvas ocupa tudo, **tudo o mais flutua e pode ser ocultado**:

- Barra no topo: 6 ferramentas + desfazer/refazer/centralizar/limpar, com segunda
  linha contextual só quando a ferramenta exige escolha.
- Balão de informação **arrastável** e recolhível com nome, fórmula, SMILES, funções
  e derivação.
- `T` oculta barra · `I` oculta balão · `H` oculta os dois · `B E G A X V` trocam ferramenta.
- 105 KB gzip (não carrega dataset nem SmilesDrawer).

### Trackpad (no canvas compartilhado, vale para os dois apps)

| Gesto | Ação |
|---|---|
| Pinça | Zoom ancorado nos dedos |
| Dois dedos | Pan nos dois eixos |
| Shift + scroll | Pan horizontal |
| Cmd/Ctrl + scroll | Zoom |

Dois detalhes que fazem funcionar: navegadores reportam pinça de trackpad como
evento `wheel` com `ctrlKey` forçado (único jeito confiável de distinguir de scroll
de dois dedos); e o listener é nativo com `passive: false`, porque o handler
sintético do React é passivo e `preventDefault` nele não impede a página de rolar.
Eventos `gesturestart/gesturechange` do Safari também tratados.

O canvas ganhou `ref` imperativo (`SkeletalCanvasHandle`) e `onStateChange`, para o
host desenhar a própria barra sem possuir o estado.

---

## 5. Pesquisa: o que existe pronto (resultado dos agentes)

**Conclusão dura: não existe biblioteca JS/WASM open-source que gere nome IUPAC a
partir da estrutura.** Reescrever o motor não era evitável.

- `RDKit.js` — **não** faz nomenclatura (confirmado pela equipe do RDKit).
- `OpenChemLib-JS`, `Kekule.js`, `Ketcher/Indigo` — não fazem.
- **Python:** STOUT v2 (transformer, ~98%) e NISPO (RDKit, 98,1% em 103M do PubChem).
  Ambos exigiriam backend.
- **Comercial:** ChemDoodle, ChemAxon Marvin, ACD/Labs.
- **API de rede grátis:** PubChem PUG-REST
  (`/rest/pug/compound/smiles/{SMILES}/property/IUPACName/JSON`) e CACTUS/NCI.
- **Não existe corpus de nomenclatura IUPAC em português.** Nenhum. Os grandes
  (PubChem 124M pares SMILES↔IUPAC, CC0) são em inglês.

### O achado que resolve o problema: OPSIN como oráculo

**OPSIN** (Artistic 2.0, Java) faz o caminho inverso — nome → estrutura. Já está
baixado e funcionando localmente:

```
tools-opsin-2.9.0.jar   (14 MB, no .gitignore)
java -jar tools-opsin-2.9.0.jar -o smi nomes.txt
```

Testado: `but-2-ene → CC=CC`, `piperidin-4-ol → N1CCC(CC1)O`, `morpholine → N1CCOCC1`.
Confirmado também que ele **rejeita português** (`but-2-eno` → FAILURE), o que prova
que a ponte pt-BR↔EN é obrigatória.

---

## 6. O QUE FALTA — em ordem de prioridade

### 6.1 Harness de validação — FEITO

`npm run audit:names` roda o ciclo completo:

```
SMILES → motor → nome pt-BR → tradutor pt-BR→EN → OPSIN → SMILES → compara
```

Peças:
- `packages/chemistry-core/src/ptbr-to-english.ts` — tokenizador com backtracking
  sobre uma tabela de morfemas. Devolve `null` quando não sabe traduzir, para
  separar "tradutor incompleto" de "motor errado".
- `tools/nomenclature.audit.ts` + `vitest.audit.config.ts` — roda contra as 560
  moléculas do acervo, uma única invocação do OPSIN em lote.
- Comparação por impressão digital Weisfeiler-Leman (invariante à ordem dos
  átomos e à forma aromática vs. Kekulé), não por string de SMILES.

**Evolução medida nesta sessão:** 76,3% → 88,6% → 92,3% → 93,9% → 95,4% → **98,0%**.
Para referência, o NISPO (ferramenta acadêmica dedicada, Python + RDKit) reporta
98,1% em 103M de moléculas do PubChem.

Cada bug abaixo foi encontrado **pela auditoria**, não por inspeção, e está travado
em `packages/chemistry-core/tests/audit-regressions.test.ts`:

| Bug | Sintoma |
|---|---|
| Fenol com múltiplas hidroxilas | catecol e hidroquinona viravam `hidroxibenzeno` |
| Anéis fundidos sem localizador | naftol virava `hidroxibenzeno` |
| Substituinte cíclico | ciclopropil nomeado como `isopropil` |
| Anel com heteroátomo como substituinte | pirrolidina da nicotina virava `ciclopentil` |
| Anel com grupo exocíclico | localizadores omitidos indevidamente |
| Alquila ramificada ≥5 C | isopentila virava `pentila` |
| Éster: anéis não repassados | benzila virava `heptila` |
| Diéster | uma das metades sumia |
| Contração de alcóxi | `benzoxi` em vez de `benziloxi` |
| Radical composto sem parênteses | `2-2-cloroetiloxi...` |
| **Anidrido: metade perdida** | mistos nomeados como se fossem simétricos |
| **Anidrido: substituintes perdidos** | anidrido cloroacético virava `anidrido etanoico` |
| **Anidrido cíclico** | succínico virava `anidrido oxolanodioico` |
| **Anidrido: cadeia entrava no anel** | benzoico virava `heptanoico` |

**Próximo passo do harness:** ampliar o corpus para além das 560 curadas, puxando
uma amostra do PubChem (`hheiden/PubChem-124M-SMILES-SELFIES-InChI-IUPAC`, CC0).
O acervo atual é o que o app serve, mas é pequeno e enviesado para o vestibular.

### 6.1b Os 11 casos que ainda falham

Rodar `npm run audit:names` e ler `tools/audit-output/report.json`. Classes:

- **Amidas N-aril / N-alquil complexas** (paracetamol, capsaicina): o substituinte
  do nitrogênio é nomeado errado.
- **Ureia** (`NC(=O)N`) → `aminometanamida`; o nome retido é "ureia".
- **Lactama** (`O=C1CCCN1`) → `pirrolidinamida`; deveria ser `pirrolidin-2-ona`.
- **Anidrido naftálico** (posições peri, 1,8) — as duas acilas ficam em anéis
  diferentes do SSSR e o caso não é detectado.
- **Cafeína** — purina fundida com dois nitrogênios; totalmente fora do alcance.
- **Radical muito ramificado** (DDT) — numeração do substituinte complexo.

### 6.2 Buracos conhecidos do motor

- **Estereoquímica**: `E/Z` e `R/S` não são detectados nem nomeados. O canvas tem
  ligação cunha/tracejada mas o motor ignora.
- **Heterociclos fora da tabela** → recusa nomear (correto, mas limitado).
- **Anéis fundidos** além do naftaleno (indol, quinolina, antraceno) não suportados.
- **Nomenclatura multiplicativa** (bifenil, `-diila`) ausente.
- **Numeração de naftaleno** usa perímetro 1-8 + 9/10 para os carbonos de fusão, não
  o esquema oficial 4a/8a. Substituintes em 1-8 saem certos.
- Ácido em anel só cobre benzeno (`ácido benzoico`) e o genérico `...carboxílico`.

### 6.3 Produto

- Rever se "Laboratório" é bom nome para a aba do construtor.
- Microcopy de acerto/erro ainda é genérica — é onde o app ganha personalidade.
- Faltou verificação visual do Studio (sem ferramenta de browser nesta sessão).

---

## 7. Como acessar

Ambos os servidores escutam em todas as interfaces (`host: true` no vite.config):

- QuímicaRush: `http://192.168.1.248:5173`
- Molecule Studio: `http://192.168.1.248:5174`

O `ufw` da máquina está **desligado** — não é ele que bloqueia acesso remoto. Se der
`connection refused`, o servidor não está rodando ou perdeu o `host: true`.
