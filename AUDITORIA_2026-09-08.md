# Auditoria de bugs e de nomenclatura — 08/09/2026

Duas frentes, na ordem pedida: (1) leitura do código atrás de falhas lógicas;
(2) força bruta contra o OPSIN para medir a nomenclatura.

Ponto de partida: 217 testes passando, `npm run audit:names` = 98,0% sobre as 560
moléculas curadas. **Esse número não se sustenta fora do acervo**: no corpus gerado
a taxa cai para **82,2%**, e as classes que falham são estruturais, não de borda.

**Situação:** todos os achados abaixo foram corrigidos. Cada seção conserva a
descrição do defeito (é o que explica o teste de regressão que o trava) e termina
com o estado atual. O placar depois das correções está na seção final.

---

## Parte 1 — Bugs e falhas lógicas encontrados por leitura

Severidade: 🔴 nomeia errado com confiança · 🟡 erra em caso menos comum · ⚪ robustez.
**Todos corrigidos.**

### 🔴 B1. Decalina vira "naftaleno"
`perceiveRingsAndAromaticity`, detecção de anéis fundidos: exige apenas dois anéis
de 6 com 2 átomos em comum e **todos carbonos** — nunca checa aromaticidade. Depois
força `aromatic = true` em todos os 10 átomos e em todas as ligações.

```
C1CCC2CCCCC2C1  ->  "naftaleno"      (é decalina, C10H18)
```
A fórmula sai certa (C10H18) e o nome afirma C10H8. O serializador ainda devolve
SMILES aromático (`c1cc2c(cc1)cccc2`), ou seja, o erro contamina o render.

### 🔴 B2. Biciclo em ponte produz nome inventado
O mesmo bloco não exige que os 2 átomos compartilhados sejam **adjacentes** (o
comentário diz "adjacent", o código não verifica). E o caminho de anel-substituinte
trata cada anel do SSSR isoladamente:

```
C1CC2CCC1CC2   (biciclo[2.2.2]octano, C8H14)  ->  "1,4-diciclo-hexilciclo-hexano"
```
Um nome que descreve C18. Qualquer sistema em ponte cai aqui.

### 🔴 B3. `[nH]` perde o elemento no parser
Átomo entre colchetes com hidrogênio explícito: o nitrogênio some.

```
c1cc[nH]c1        ->  "ciclopentano",  fórmula C5H6   (é pirrol, C4H5N)
c1c(N(C)C)c[nH]c1 ->  "N,N-dimetilciclopentanamina"
```
Grave porque `pirrol` está na tabela `HETEROCYCLES` e no acervo — a tabela nunca é
alcançada para esse SMILES. Foi responsável por 42 divergências na força bruta.

### 🔴 B4. Cadeia com mais de 12 carbonos vira "carbano"
`STEM_NAMES` vai só até 12 e o fallback é `?? 'carb'`:

```
CCCCCCCCCCCCCCC1CCCCCCCCCCCCCC1  ->  "carbano"
```
Também aparece como `carbil`/`alqu` em radicais. Palmítico/esteárico (C16/C18),
que são exatamente os exemplos de ácido graxo de vestibular, caem nisso.

### 🔴 B5. Heterociclo-pai perde o localizador
`assembleIupacNames` decide omitir localizadores com `ringPositionsInterchangeable`,
que **não exclui heterociclos** — ao contrário de `allPositionsEquivalent` dentro de
`assembleParent`, que exclui (`!heterocycleName`). As duas funções discordam, e quem
decide o prefixo é a que está errada.

```
Cc1ccncc1  ->  "metilpiridina"   (deveria ser 4-metilpiridina; o OPSIN lê como 2-)
CC1CCNC1   ->  "metilpirrolidina"
```
Um heteroátomo fixa a numeração; a posição nunca é indiferente. Correção provável:
repetir a condição `!heterocycleName` em `ringPositionsInterchangeable`.

### 🔴 B6. Heteroaromático como substituinte vira "fenil"
`nameBranch` testa `if (rootAtom.aromatic) return 'fenil'` **antes** do bloco
`rootAtom.inRing` que consulta `HETEROCYCLES`. Todo anel aromático substituinte é
benzeno:

```
CC(O)Cc1ccncc1  ->  "1-fenilpropan-2-ol"      (é piridin-4-il)
c1ccsc1CC(=O)N  ->  "2-feniletanamida"        (é tiofen-2-il)
```
Maior classe isolada de erro na força bruta: **158 casos**. Basta inverter a ordem
dos dois blocos.

### 🔴 B7. Radical cíclico sem ponto de ligação
Mesmo depois de identificado, o radical é montado como `nome + il` sem localizador:
`pirrolidinil`, `oxanil`, `piperidinil`. O OPSIN então liga pelo nitrogênio.

```
CC(O)CC1CCNC1  ->  "1-pirrolidinilpropan-2-ol"   (é pirrolidin-3-il, ligado por C)
```
97 casos. Vale para carbociclos substituídos também.

### 🔴 B8. Substituintes do anel somem quando o anel é o substituinte
Quando o benzeno é citado como `fenil`, `nameBranch` retorna a string constante e
descarta o resto do anel:

```
c1c(C(C)C)c(CC(C)C)ccc1  ->  "1-fenil-2-metilpropano"   (C13H20; o nome cobre C9)
C1C([N+](=O)[O-])C(C(=O)C)C1 -> "1-ciclobutiletanona"   (o nitro desaparece)
```
O mesmo vale para o retorno constante `ciclo…il`. A fórmula continua certa, o nome
não. 59 casos.

### 🔴 B9. Cadeia do radical entra dentro do anel
`nameBranch` cai em `longestBranchChain`, que caminha pelo `branchSet` sem excluir
átomos de anel:

```
C1CCCCC1CC(CC)CC(=O)O  ->  "ácido 3-(heptil)pentanoico"
```
`heptil` é o ciclo-hexilmetil linearizado. 49 casos. (O relatório da sessão anterior
registra esse bug como corrigido para ésteres; a correção não é geral.)

### 🔴 B10. Ligação dupla exocíclica à cadeia principal é descartada em silêncio
Quando a dupla liga a cadeia escolhida a um carbono de ramificação, ela some do nome:

```
CCC=C(CCCC)CCCC  ->  "5-propilnonano"        (falta o ilideno; C12H24 vs C12H26)
CCC(C(C)(C)C)=C  ->  "2,2,3-trimetilpentano" (o alceno some)
```
O parser está certo (a ligação existe no grafo); quem perde é a montagem, porque
`assembleParent` só varre pares consecutivos da cadeia-pai. Ou a seleção de cadeia
deveria preferir a insaturação, ou é preciso emitir `-ilideno`. Do jeito atual o
aluno recebe um alcano no lugar de um alceno.

### 🟡 B11. Ordem alfabética dos prefixos
`formatGroupedSubstituents` ordena por `sortKey.localeCompare`, o que erra em três
frentes:
- **`terc-`/`sec-` entram na comparação** — `terc-butil` deve alfabetizar em "b".
  `4-ciclobutil-5-terc-butil…` sai com ciclobutil antes de butil.
- **substituintes em N são todos emitidos antes** dos de carbono (`nPrefix` é
  concatenado à frente), em vez de intercalados: `N-metil-3-etil…` deveria ser
  `3-etil-N-metil…`.
- radicais compostos comparam pela `sortKey` sem parênteses, o que às vezes inverte
  (`(2-metoxi-2-oxoetil)` citado antes de `amino`).

94 nomes reprovados pelo linter, em 4000.

### 🟡 B12. `isHydroxylOrOxide` aceita oxigênio de carbonila
`neighbors.length === 1 → true` não olha a ordem da ligação, então um `=O` conta
como hidroxila. Hoje é mascarado por `processedCarbons`, mas basta um carbonilo que
não se encaixe em nenhuma das 8 categorias da seção 1 para virar álcool fantasma.

### 🟡 B13. Valência máxima usa `|carga|`
`validateMolecularGraph`: `limit = maxValence[el] + Math.abs(atom.charge)`. Para
`[N+]` isso dá 5 (base já é 4) e aceita nitrogênio pentavalente; para `[O-]` dá 3.
Deveria somar só carga positiva. No mesmo lugar, `N(=O)=O` — grafia de nitro comum
em datasets públicos — é rejeitada como valência estourada (o acervo só usa
`[N+](=O)[O-]`, então não dói hoje, mas dói ao ampliar o corpus, como prevê o item
6.1 do estado do projeto).

### ⚪ B14. Anel com mais de 12 átomos não é percebido
`computeSSSR` filtra `path.length <= 12`. Um macrociclo não recebe `inRing`, e daí
seus átomos entram na seleção de cadeia acíclica como se fossem lineares.

### ⚪ B15. SMILES inválido é aceito e nomeado
`createGraphFromSMILES` não reclama de dígito de anel reaberto sem fechar. Entrada
corrompida sai como nome confiante em vez de erro. (Foi o que sujou meu gerador na
primeira rodada; hoje o harness filtra antes de acusar o motor.)

### ⚪ B16. `findAllSimplePaths` é exponencial
Enumera **todos** os caminhos simples a partir de **cada** carbono acíclico, sem
memoização ou poda por comprimento. Cai em pé com 40 átomos, mas é a peça que trava
o construtor ao vivo se alguém desenhar algo grande e muito ramificado.

---

## Parte 2 — Força bruta contra o OPSIN

### O harness

`tools/bruteforce.audit.ts` (`npx vitest run --config vitest.audit.config.ts
tools/bruteforce.audit.ts`, `BRUTE_COUNT` controla o tamanho).

Gera moléculas a partir de uma gramática semeada (`mulberry32`, seed fixa — o corpus
é idêntico entre execuções, senão uma regressão de hoje é irreproduzível amanhã) em
6 famílias: alcanos ramificados, cadeia com função terminal, anel substituído, anel
ligado a cadeia, cadeia polifuncional e pontes éster/éter/amida. Descarta o que o
próprio parser recusa e o que tem dígito de anel malformado, para não acusar o motor
de erro do gerador.

Ciclo, idêntico ao da auditoria curada: `SMILES → motor → nome pt-BR → tradutor →
OPSIN → SMILES`, comparado por impressão digital Weisfeiler-Leman.

**Segunda passagem, independente do OPSIN:** um linter sobre a *forma* do nome. O
round-trip só prova que o nome é inequívoco, não que é o preferido — `but-3-ino` e
`but-1-ino` levam à mesma estrutura. O linter checa minimalidade de localizadores na
cadeia (comparando com a numeração refletida, respeitando a hierarquia
sufixo > insaturação > prefixo), ordem alfabética dos prefixos, concordância entre
prefixo multiplicativo e número de localizadores, e balanceamento de parênteses.

### Resultado (4000 moléculas geradas)

| | |
|---|---|
| geradas | 4000 |
| recusadas pelo motor | 446 (408 valência de fato inválida vinda do gerador, 38 `unsupported_ring`) |
| **efetivamente nomeadas** | **3554** |
| **round-trip OK** | **2923 — 82,2%** |
| divergência estrutural | 557 |
| sem tradução pt→en | 73 |
| rejeitado pelo OPSIN | 1 |
| reprovado no linter | 106 |

Contra 98,0% no acervo curado. A diferença não é ruído: o acervo é pequeno e
enviesado para o vestibular, e não contém heterociclo como substituinte, anel
substituído em posição de radical, nem cadeia longa.

### As 557 divergências, por causa

| casos | causa | bug |
|---:|---|---|
| 158 | heteroaromático nomeado como fenil/benzil | B6 |
| 97 | radical heterocíclico sem localizador de ligação | B7 |
| 59 | substituintes do anel sumiram do nome | B8 |
| 49 | cadeia do radical invadiu o anel | B9 |
| 42 | `[nH]` perdido no parser | B3 |
| 40 | heterociclo-pai sem localizador | B5 |
| 112 | outros (inclui B10, B2, B4) | vários |

Três bugs (B6, B7, B5 — todos de heterociclo) respondem por **53%** das divergências,
e os três são localizados: ordem de dois blocos em `nameBranch`, localizador de
ligação no radical, e uma condição que ficou faltando em `ringPositionsInterchangeable`.

### Linter

| casos | achado |
|---:|---|
| 94 | prefixos fora de ordem alfabética (B11) |
| 12 | localizadores não mínimos |

Os 12 de localizadores são **falso positivo conhecido** do linter: são todos éteres
de propeno/propino (`3-etoxipropeno`), onde o localizador da insaturação é omitido
legitimamente para C3 e o linter não tem como recuperá-lo. Os 94 alfabéticos foram
conferidos por amostragem e são reais.

### Limites desta medição

- O OPSIN prova **estrutura**, não preferência. Um nome não-preferido mas inequívoco
  passa. O linter cobre parte disso, não tudo.
- 73 nomes não chegam ao OPSIN por falta de tradução pt→en; podem esconder erros.
- A gramática do gerador não produz estereoquímica, anéis fundidos além de naftaleno,
  nem sais — todos já listados como buracos conhecidos no estado do projeto.

---

## Resultado das correções

### Placar

| | antes | depois |
|---|---:|---:|
| acervo curado (560) | 98,0% | **99,3%** — 0 divergências, 4 recusas honestas |
| força bruta, moléculas nomeadas | 82,2% | **100,0%** |
| divergências estruturais (4000 geradas) | 557 | **0** |
| sem tradução pt→en | 73 | **0** |
| reprovadas no linter | 106 | **0** |
| testes | 217 | 228 |

Medido em 5 seeds (20 000 moléculas geradas, 17 355 nomeadas): **zero divergência
estrutural, zero falha de tradução, zero achado de linter** em todas elas. Quatro
das cinco seeds nunca tinham sido rodadas durante as correções, então o número não
é ajuste ao corpus.

As ~530 recusas por rodada continuam sendo lixo do próprio gerador: ~405 são
valência genuinamente impossível (carbono com tripla em posição ramificada) e o
resto são SMILES com dígito de anel reaberto, que produzem sistemas fundidos
incoerentes. O motor as recusa em vez de nomeá-las — que é a regra da casa.

As 4 recusas do acervo curado são honestas e conhecidas: 1,3-benzodioxol e cafeína
(sistemas fundidos fora do vocabulário), anidrido metilftálico e anidrido naftálico
(o montador de anidridos não sabe citar substituintes do anel fundido).

### Defeitos adicionais achados durante a correção

A força bruta continuou entregando causas-raiz novas a cada rodada — estas não
estavam no inventário original:

| | defeito |
|---|---|
| B17 | `Ring.isAromatic` só era calculado para anéis de 6, então todo aromático de 5 casava com a entrada saturada da tabela: tiofeno respondia por `tiolano` |
| B18 | aromaticidade não era percebida em notação Kekulé (`C1=CC=NC=C1` era um dieno), que é justamente o que o OPSIN devolve e o que o aluno desenha |
| B19 | a percepção de anel dependia da ordem dos ciclos: o primeiro anel do naftaleno em Kekulé era julgado antes de o segundo existir |
| B20 | uma dupla ligação para um anel *fundido* era contada como exocíclica e derrubava a aromaticidade |
| B21 | radical com dupla **e** tripla ligação perdia a tripla (`else if`) |
| B22 | `nameSimpleAlkyl` chamava de `pentil` um ramo de 5 carbonos ligado pelo carbono do meio |
| B23 | nitrila citada como prefixo entrava na cadeia principal e seu N virava `amino` |
| B24 | haleto de acila como prefixo virava `formil`, perdendo o halogênio |
| B25 | `carbamoil` respondia por qualquer acila no nitrogênio (propanoilamino virava ureia) |
| B26 | lactama era nomeada como amida (`pirrolidinamida` em vez de `pirrolidin-2-ona`) |
| B27 | ureia saía como `aminometanamida`, que o OPSIN lê como H2N-NH-CHO |
| B28 | heterociclo com sufixo plural saía `piridinodiamina` em vez de `piridina-2,5-diamina` |
| B29 | `-carboxílico`/`-carbonila` em heterociclo sem localizador de ligação |
| B30 | ramo estirila em benzeno respondia por `benzilbenzeno` |
| B31 | diamina rotulava os dois nitrogênios como `N`, em vez de `N` e `N'` |

Todos travados em `packages/chemistry-core/tests/audit-regressions.test.ts`.

### O tradutor pt→EN também foi ampliado

Corrigir o motor moveu o problema para a ponte: nomes novos e certos que o
tradutor não conhecia subiram de 73 para 222 falhas antes de o table ser
estendido. Foram acrescentados os radicais heterocíclicos com localizador,
`-ilideno`/`-ilidino`, `-amido`, `-oxi`, os haletos de carbonila, `ureia` e os
prefixos de cadeia de 13 a 30 carbonos.

### Nota sobre o linter

Duas limitações do linter foram consertadas junto (eram falsos positivos, não bugs
do motor): ele lia localizadores de dentro de radicais entre parênteses como se
fossem do composto-pai, e não aceitava o localizador itálico `N`/`N'`. A
minimalidade de localizadores não é testada quando o nome omite o localizador da
insaturação (`3-etoxipropeno`), porque aí não há o que comparar.

---

## Ordem original de ataque

1. **B6, B5, B7** — 53% das divergências, correções pequenas e localizadas.
2. **B3** (`[nH]`) — parser, e destrava a tabela de heterociclos que já existe.
3. **B8, B9** — anel como substituinte; exigem repensar o retorno constante de
   `nameBranch` para algo que carregue os substituintes do anel.
4. **B1, B2** — percepção de anéis fundidos/em ponte. B1 é uma condição a mais
   (`isAromatic`); B2 é maior: sistema em ponte não tem nome no motor e deveria
   cair na recusa explícita, como já se faz com `unsupported_ring`.
5. **B4** — estender `STEM_NAMES` e trocar todo fallback `?? 'carb'` por recusa.
   Nome inventado é pior que nome ausente, que é a regra já adotada no projeto.
6. **B10, B11** — ilideno e ordem alfabética.

Cada correção deve entrar com seu caso em `packages/chemistry-core/tests/audit-regressions.test.ts`,
como já se fez na sessão anterior, e a força bruta re-rodada para medir o efeito.


---

## Parte 3 — O que a auditoria de round-trip NÃO consegue ver

Depois de zerar as duas auditorias, sondei o motor com moléculas reais nomeadas
(fármacos, ácidos graxos, açúcares). Apareceram defeitos que **nenhuma das duas
auditorias podia detectar**, e o motivo importa mais que os defeitos:

> **O parser está nas duas pontas do ciclo.** Se ele corrompe a molécula na
> entrada, o nome sai errado, e ao reinterpretar esse nome ele comete o mesmo erro
> — a impressão digital bate e o round-trip aprova. Um oráculo que compartilha
> um componente com o sistema testado é cego para os defeitos desse componente.

| | defeito | por que passou batido |
|---|---|---|
| B32 | `/` e `\` (marcadores de configuração) eram lidos como **átomos de carbono**: cinamaldeído C9H8O parseava como C11H12O e virava `5-fenilpent-3-enal` | corrupção simétrica nas duas pontas |
| B33 | qualquer token desconhecido virava carbono silenciosamente — a causa-raiz de B32 | idem |
| B34 | E/Z não era atribuído: geranial e neral, fumárico e maleico recebiam **o mesmo nome** | o gerador de força bruta não produzia estereoquímica |
| B35 | acila-oxi saía `1-oxoetoxi` (aspirina) — estruturalmente certo, reprovado em prova | round-trip só testa estrutura, não preferência |
| B36 | ânion carboxilato era chamado de ácido (`benzoato` → `ácido benzoico`) | o acervo não tem carboxilatos |

Correções: os marcadores viraram propriedade da ligação (`BondEdge.direction`),
token desconhecido agora é erro de parse, e o E/Z é atribuído com uma comparação
CIP (esferas de números atômicos com duplicação por ligação múltipla). O
assinalador foi validado contra o OPSIN nos dois sentidos em 15 casos.

Uma armadilha durante essa correção vale registro: a primeira versão do CIP
somava os hidrogênios implícitos na esfera do próprio átomo, e não na seguinte.
Com isso uma metila (C + 3H) vencia uma cadeia (C + 2H) e **todo** descritor de
geranial saía invertido — com o motor parecendo funcionar. Foi o OPSIN, usado
como árbitro contra o gabarito do acervo, que apontou o lado certo.

### Limites que permanecem (conhecidos e explícitos)

- **R/S não é atribuído.** O canvas tem ligação em cunha, o motor a ignora.
  Moléculas quirais recebem o nome da estrutura plana.
- **Anéis fundidos além do naftaleno** são recusados: indol, quinolina,
  antraceno, purina (cafeína), esteroides (colesterol), penicilina.
- **Sistemas em ponte e espiro** são recusados.
- **Heterociclos fora da tabela de 20 nomes** são recusados.
- **Cadeias e anéis acima de 30 átomos** são recusados.
- Em todos esses casos `isNameable` é `false` e a UI não mostra nome — mas o
  campo `iupacName2013` ainda carrega uma tentativa parcial. Quem consumir a API
  precisa checar `isNameable`; os três componentes do app já checam.
