# QuímicaRush — Estado Atual do Projeto & Guia de Retomada

> **Data do Snapshot:** 01/09/2026 (Horário local: ~21:46)  
> **Commit Git de Segurança:** `92f529c` (`master`)  
> **Status dos Testes:** 156 / 156 testes aprovados (100% em 7 suítes)  
> **TypeScript:** 0 erros com `npm run typecheck` (modo estrito, zero `any`)  
> **Build de Produção:** Vite build concluído com sucesso (`npm run build`)  

---

## 1. O Que Já Foi Feito e Está 100% Operacional

O monorepo foi completamente construído do zero, estruturado e integrado em 5 pacotes autônomos sem dependências circulares:

### 1.1 `@quimicarush/chemistry-core` (Núcleo Químico & Avaliador)
- **`src/types.ts`**: Contratos centrais (`OrganicFunction`, `IUPACNameAST`, `SubstituentNode`, `BondNode`, `EvaluationResult`, `Molecule`).
- **`src/normalizer.ts`**: Tolerância a acentos, conversão bidirecional IUPAC 1993 $\leftrightarrow$ 2013 (`but-2-eno` $\leftrightarrow$ `2-buteno`), suporte ao Novo Acordo Ortográfico (hífen diante de 'h' como `ciclo-hexano` e aglutinação em `ciclobutano`), colapso de traços e hífens.
- **`src/lexer.ts`**: Tokenizador morfológico para radicais, infixos, sufixos, radicais complexos entre parênteses `(clorometil)`, multiplicadores `bis/tris`, localizadores aromáticos `o-`, `m-`, `p-` e conectivos fonéticos.
- **`src/parser.ts`**: Parser sintático recursivo que produz a AST canônica para todas as 16 funções orgânicas, anéis monocíclicos e aromáticos, com distinção estrita entre enóis ($C=C-OH$) e álcoois insaturados ($sp^3$).
- **`src/evaluator.ts`**: Motor de avaliação morfológica com pontuação ponderada de 4 pilares:
  $$\text{Score} = 0.35 \cdot \text{Função} + 0.25 \cdot \text{Cadeia} + 0.20 \cdot \text{Ligações} + 0.20 \cdot \text{Radicais}$$
  Inclui detecção de **Inversão de Prioridade IUPAC** (ex: nomear ácido como álcool), bloqueio de inputs vazios (nota zero) e macetes mnemônicos do ENEM.

### 1.2 `@quimicarush/chemistry-dataset` (Banco de Dados & Geradores)
- **`data/canonical-molecules.json`**: 560 moléculas canônicas curadas cobrindo 100% das 16 funções de `funcoes.pdf` (exatamente 35 moléculas curadas por função), com fórmulas, histórias sensoriais do cotidiano e contexto pedagógico.
- **`data/synonyms-dictionary.json`**: Mais de 360 sinônimos triviais, comerciais e históricos mapeados para nomes IUPAC canônicos (acetona, formol, aspirina, paracetamol, cafeína, nicotina, geraniol, etc.).
- **`src/procedural-generator.ts`**: Gerador combinatório com validação estrita de valências ($C=4, O=2, N=3, H=1, X=1$).
- **`src/chaos-synthesizer.ts`**: Sintetizador do "Modo Caos" (2 a 5 grupos funcionais concorrentes), aplicando a regra da coroa da IUPAC e gerando SMILES e nomes corretos com radicais ramificados complexos.
- **`src/dataset-provider.ts`**: Provedor com busca tolerante, filtros por função, dificuldade e amostragem randômica.

### 1.3 `@quimicarush/gamification-engine` (Áudio Procedural & Dopamina)
- **`src/sound-synth.ts`**: Sintetizador 100% procedural via Web Audio API (sem assets MP3 externos). Escala pentatônica ascendente para streaks, sobretons harmônicos, fanfarras triunfantes de acordes em subidas de nível, chimes de velocidade (< 4s), sub-bass contínuo em modo febre (120 bpm, streak $\ge 10$), clique tátil para chips e proteção contra memory leaks.
- **`src/combo-manager.ts`**: Multiplicadores progressivos (1x, 1.5x, 2x, 3x, 5x "AROMÁTICO ON FIRE 🔥"), speed blitz bonus, progressão de níveis 1 a 50 com títulos dinâmicos (*Calouro de Alquimia* $\dots$ *Mestre dos Orbitais* $\dots$ *Nobel da Química Orgânica*), e sistema de 10 conquistas/troféus (`ALL_BADGES`).
- **`src/fsrs-queue.ts`**: Fila adaptativa de repetição espaçada que reinclui questões erradas ou parciais (< 80%) no slot `atual + 3`.

### 1.4 `@quimicarush/smiles-renderer` (Visualização 2D de Alta Velocidade)
- **`src/theme.ts`**: Paleta atômica de alto contraste pedagógico (oxigênio vermelho, nitrogênio azul, halogênios verde esmeralda, enxofre âmbar, esqueleto de carbono claro sobre fundo obsidian).
- **`src/SmilesCanvas.tsx`**: Componente React memoizado (`React.memo`) com renderização sub-2ms sobre Canvas/SVG, suporte a High-DPI (`devicePixelRatio` para telas Retina), cache de AST de SMILES, eliminação de flickering entre questões e destaque de heteroátomos e carbonilas.

### 1.5 `@quimicarush/web-app` (PWA Completo com Interface de Alta Velocidade)
- **`src/stores/useGameStore.ts`**: Orquestrador Zustand integrado com IndexedDB (Dexie.js), áudio procedural, controle de abas, modo febre e pontuações.
- **`src/components/HUD.tsx`**: HUD de arcade com badges de combo, aura de fogo pulsante, barra animada de XP, títulos de nível, botão de conquistas e filtros de dificuldade/função.
- **`src/components/SpeedrunnerInput.tsx`**: Input para digitação livre em alta velocidade com auto-focus e normalização em tempo real.
- **`src/components/SlotBuilder.tsx`**: Construtor morfológico com chips coloridos (prefixo especial, radicais agrupados multiplicativamente com `di`/`tri`, anel `ciclo-`, prefixo de cadeia, infixo e sufixo).
- **`src/components/FeedbackCard.tsx`**: Decomposição em 4 pilares, alerta de inversão de prioridade, confetes em notas perfeitas e banner de encorajamento "Quase lá!" para notas entre 70% e 95%.
- **`src/components/TheoryHub.tsx`**: Compêndio teórico com 4 abas interativas completas:
  1. *As 16 Funções Canônicas* com SmilesCanvas interativo e histórias reais.
  2. *Batalha dos Localizadores* (comparações lado a lado de menor numeração).
  3. *Macetes e Dicas Quentes para o ENEM* (6 cards visuais).
  4. *Guia Sensorial & Cotidiano* (odores e sabores moleculares).
- **`src/components/AchievementsModal.tsx`**: Modal acessível com barra de progresso e galeria dos 10 troféus.
- **`src/db/historyDb.ts`**: Banco IndexedDB com histórico de tentativas, maestria por função e persistência de badges.

### 1.6 Documentação Canônica & Auditorias Concluídas
- **`IUPAC_CANONICAL_GUIDE_PTBR.md`**: 700+ linhas com todas as regras oficiais da IUPAC, SBQ e Novo Acordo Ortográfico.
- **Enxame de Auditoria em 3 Níveis Executado**:
  - Macro-Arquitetura: 12 achados mapeados.
  - Lógica Química: 14 achados mapeados.
  - UI/UX e Acessibilidade: 9 achados mapeados.
- **Remediações Aplicadas pelo Corretor Líder**: Trava de input vazio, correções de enol vs álcool insaturado, stem `benz-`, radicais no SMILES do Modo Caos, transações atômicas no Dexie, High-DPI no canvas, e eliminação de armadilhas de teclado.

---

## 2. O Que Falta Implementar (Próxima Sessão)

O usuário solicitou uma melhoria de usabilidade e imersão focada em **produtividade 100% via teclado ("estilo Neovim / modal productivity") no Construtor de Slots (`SlotBuilder`)**:

1. **Visual Keycap Badges nos Chips do `SlotBuilder`**:
   - Exibir badges estilizados de tecla em cada chip/bloco (ex: `[1]` a `[0]` nos carbonos met-dec, `[A/E/I/D]` nas ligações an/en/in/dien, `[O/L/H/K/C/T/N/M/R]` nos sufixos, `[C]` no ciclo, `[P]` no prefixo especial).
2. **Mecanismo de Inserção Rápida de Radicais via Teclado**:
   - Permitir adicionar radicais sem mouse via atalho modal: teclar `R` seguido do número do carbono e letra do radical (ex: `R` $\to$ `2` $\to$ `m` insere instantaneamente `2-metil`).
3. **Tecla de Desfazer/Remover Radicais**:
   - Teclar `Backspace` ou `X` (no modo SlotBuilder) remove a última ficha de radical adicionada.
4. **Som de Switch Mecânico**:
   - Som procedural tátil na Web Audio API simulando um switch mecânico para cada tecla pressionada.
5. **Cheatsheet / Painel de Atalhos Interativo (`?` ou `H`)**:
   - Overlay rápido que mostra todos os atalhos disponíveis de forma elegante.

---

## 3. Como Retomar e Finalizar (Instrução Pronta)

Ao abrir uma nova sessão no Antigravity CLI, basta enviar a mensagem:

```text
Olá! Por favor leia o arquivo ESTADO_DO_PROJETO_E_RETOMADA.md.
O monorepo QuímicaRush já está completamente implementado, com todos os 156 testes passando e build de produção verificado.
Continue exatamente de onde paramos implementando a funcionalidade pendente:
"Experiência de Navegação e Construção 100% via Teclado (Mouse-Free / Neovim-style) no SlotBuilder com keycap badges visuais, atalhos mnemônicos rápidos para blocos/radicais, som de switch mecânico procedural e cheatsheet de atalhos (?)".
```

---
*Snapshot de Estado registrado e preservado com sucesso.*
