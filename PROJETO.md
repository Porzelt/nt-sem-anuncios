# Novo Testamento Sem Anúncios

Contexto do projeto para retomar o trabalho de qualquer máquina. Este
arquivo é carregado automaticamente pelo Claude Code (via `CLAUDE.md`).

## O que é

App Android gratuito de leitura do Novo Testamento (Mateus a
Apocalipse, 27 livros). Sem anúncios, sem login, sem rastreamento,
100% offline. O foco é uma leitura limpa e agradável. Motivo: não havia
app assim sem anúncio. Quem quiser ler só parte escolhe o livro na lista.

Repositório: https://github.com/Porzelt/nt-sem-anuncios (privado, branch `master`).

## Decisões (não reabrir sem motivo forte)

- **Tradução:** Bíblia Livre (BLIVRE), versão TR, sob a licença CC BY 3.0 BR.
  Fonte, licença e atribuição estão em `CREDITOS.md`, e o crédito
  aparece dentro do app. Traduções protegidas (ARC, ARA, NAA, NVI, NTLH,
  ACF...) só com autorização por escrito do detentor.
- **Nome/pacote:** loja "Novo Testamento Sem Anúncios"; no celular e no app
  "Novo Testamento" (nome curto sob o ícone). Antes era "NT Sem Anúncios" —
  trocado porque "NT" não era claro. Pacote `com.porzelt.ntsemanuncios`
  (não muda). Sem
  vínculo sugerido com igreja ou editora; ícone e imagens são arte própria.
- **Sem permissões:** `android.permissions: []` e `android.blockedPermissions`
  no `app.json` removem `INTERNET` e as permissões padrão que o Expo inclui
  (armazenamento, SYSTEM_ALERT_WINDOW, VIBRATE, ACCESS_NETWORK_STATE, DUMP).
  O build 2 (versionCode 2) ainda saiu com as padrão; corrigido a partir do 3. Consequência: o perfil `development`
  do EAS (dev client) não conectaria ao Metro. Usamos Expo Go no
  desenvolvimento, então não há problema. Se um dia precisarmos de dev
  client, removemos o bloqueio só nesse perfil.
- **Texto empacotado:** um JSON por livro em `assets/texto/<id>.json`
  (`string[][]`: capítulos → versículos), carregado sob demanda por
  `src/lib/texto.ts`. É gerado por `node scripts/converter-blivre.mjs`
  a partir de `fonte/bliv-tr_vpl.txt`, e o script confere 27 livros,
  a quantidade de capítulos e 7957 versículos. Os `id` são os códigos
  do VPL em minúsculas (mat, mar, luk, joh... rev).
- Colchetes do texto (acréscimos do tradutor) são exibidos em itálico
  (`separarAcrescimos` em `src/lib/livros.ts`).
- Estado simples (posição de leitura e, depois, preferências) fica em
  `expo-sqlite/kv-store`. Tabelas SQLite de verdade só quando chegarem
  destaques/favoritos (e aí testar a migração com `node:sqlite`).

## Estrutura

- `src/app/index.tsx`: início — destaque "Continuar lendo" (ou "Comece
  por aqui: Mateus 1" na primeira abertura), progresso geral do NT
  (% e x/260 capítulos) e livros agrupados em seções (Evangelhos,
  Histórico, Cartas de Paulo, Cartas gerais, Profecia; `GRUPOS` em
  `livros.ts`) com barra de progresso por livro.
- Na leitura, tocar no título do topo ("Mateus 5 ▾") volta/abre a grade
  de capítulos do livro (`router.dismissTo`).
- `src/app/[livro]/index.tsx`: grade de capítulos (livros de 1 capítulo pulam direto para a leitura).
- `src/app/[livro]/[cap].tsx`: leitura com deslize lateral entre capítulos e botão "próximo" (no último capítulo, vai para o próximo livro).
- `src/lib/`: `livros.ts` (metadados, lógica pura), `texto.ts`, `posicao.ts`.

## Escopo

- **v1:** lista de livros, capítulos com deslize, versículos numerados,
  continuar de onde parei, tamanho da fonte, tema claro/escuro/sépia,
  fonte serifada, copiar/compartilhar versículo, tela que não apaga
  (`expo-keep-awake`), tela "Sobre" com créditos.
- **v1.1:** busca de texto — feita (ver Estado atual).
- **Depois:** destaques/favoritos (SQLite), plano de leitura.

## Estado atual (02/10/2026)

- Esqueleto validado no celular via Expo Go (lista, capítulos, deslize, continuar lendo).
- Feito, **ainda não validado no celular**: tela de Ajustes (botão "Aa" no
  topo) com tema Sistema/Claro/Sépia/Escuro e tamanho da letra (14–32,
  salvos no kv-store via `src/lib/preferencias.tsx`); tela que não apaga na
  leitura (`useKeepAwake`); tocar em versículos seleciona → barra com
  Copiar/Compartilhar (texto + "— Livro cap:v (BLIVRE)", lógica pura em
  `src/lib/citacao.ts`, testada no Node); tela Sobre com créditos.
- Ajustes, copiar/compartilhar validados no celular.
- **Capítulos lidos** (ainda não validado no celular): o botão no fim do
  capítulo ("Capítulo X →", "Livro 1 →", "Concluir leitura ✓" em Ap 22)
  é a confirmação de leitura — marca o capítulo como lido (`src/lib/lidos.ts`,
  kv-store) e só ele atualiza o "Continuar lendo" (para o capítulo
  seguinte). Abrir ou deslizar não muda mais a posição. Cartão lido fica
  verde suave com ✓ (cores `lido`/`lidoTexto` por tema); segurar o cartão
  alterna lido/não lido (livros de 1 capítulo: segurar o livro na lista).
  Desmarcar um capítulo anterior ao "Continuar lendo" (mesmo livro) volta
  a posição para ele; marcar o capítulo da posição avança
  (`ajustarPosicaoAoAlternar` em `src/lib/posicao.ts`).
  A lista de livros mostra "3/28 lidos" ou "lido ✓".
- Ícone: livro aberto com "NT" (arte em `assets/icone/origem.webp`, feita
  pelo Henrique num gerador de imagem externo). `node scripts/gerar-icones.mjs`
  gera ícone, adaptativo (fundo #365478), monocromático, splash e favicon.
  Só aparece no celular depois de um build (o Expo Go mostra o ícone dele).
- Lint: único erro é do template em `src/hooks/use-color-scheme.web.ts` (só web, igual ao MPA).

- Política de privacidade: `docs/privacidade.html`, publicada como Artifact
  em https://claude.ai/artifact/B6Dm3A688tKrD5evdcoGAU (precisa estar
  compartilhada como "qualquer pessoa com o link" para a Play Console aceitar).
  Para atualizar: editar o HTML e republicar no mesmo endereço.
- EAS plano gratuito: 15 builds Android/mês, fila de baixa prioridade.

- Play Console: app criado (`com.porzelt.ntsemanuncios`); todas as
  declarações de Conteúdo do app preenchidas (classificação: 12 anos no BR,
  referências textuais a violência/sexualidade/álcool; público 13+; sem
  coleta de dados). versionCode 2 publicado em **Teste interno**
  (opt-in: https://play.google.com/apps/internaltest/4701550953762157666).

- Página da loja preenchida (descrições, ícone 512, destaque 1024x500 e 4
  capturas em `assets/loja/`), categoria Livros e referências, contato.

- versionCode 3 (sem permissões, com Literata) no **Teste fechado – Alpha**
  (Brasil, lista "Testadores NT", feedback no e-mail do Henrique). Em 03/10/2026
  as 14 mudanças (loja, declarações, teste fechado) foram **enviadas para
  revisão do Google** (até ~7 dias).

- **Busca** (ainda não validada no celular): barra "Buscar no Novo
  Testamento…" no início abre `src/app/busca.tsx`. Lógica pura em
  `src/lib/busca.ts` (testada no Node com o texto real): ignora acentos e
  maiúsculas, exige todas as palavras, frase exata primeiro, até 300
  resultados com destaque. Tocar num resultado abre o capítulo com `?v=N`:
  a leitura rola até o versículo (via `onTextLayout`) e o destaca por 3 s.

- 03/10/2026: revisão **aprovada**; 1.0.0 (3) disponível no teste fechado.
  Link de inscrição dos testadores: https://play.google.com/apps/testing/com.porzelt.ntsemanuncios
  (cada testador precisa estar na lista "Testadores NT").
- versionCode 4 (busca + nome "Novo Testamento"), nome da loja e nova imagem
  de destaque aprovados em 03/10/2026; 1.0.0 (4) é a versão do teste fechado.
- 04/10/2026: lista "Testadores NT" com 14 contas (e-mails ficam só na Play
  Console, não no repositório). Margem ideal: 14-15 (1 ainda é @hotmail).

- **v1.1 (1.1.0)**, ainda não validada no celular: botão "✓ Marcar como lido"
  no fim do capítulo (marca sem sair; tocar de novo desmarca); Ajustes com
  fonte (Serifada = Literata, Sem serifa = Atkinson Hyperlegible, Do celular),
  versículos em parágrafo ou um por linha, e texto justificado; "Pesquisar"
  na barra do versículo abre o Google no navegador. Sugestões dos testadores
  avaliadas: v1.2 = versículos por tema + destaques/favoritos/notas;
  fora do escopo = AT, apócrifos, traduções protegidas, comentários.

- **Versículos por tema** (v1.1, aguardando revisão do Henrique): seção
  "Para momentos de…" no início com 11 temas → `src/app/tema/[id].tsx`.
  Curadoria em `src/lib/temas.ts`; `node scripts/conferir-temas.mjs` valida as
  referências e gera `docs/revisao-temas.md` com o texto completo.

- 05/10/2026: 12 testadores atingidos; contagem de 14 dias iniciada
  (produção liberável por volta de 19/10). versionCode 5 (1.1.0) enviado
  para revisão no teste fechado.

- 05/10/2026: 1.1.0 (5) aprovada no teste fechado. 15/10: 12 testadores
  há 10 dias (produção ~19/10).
- **v1.2 (1.2.0, versionCode 7 — o autoIncrement do EAS pulou o 6)**, ainda não validada no celular:
  - **Ofensiva** (`src/lib/ofensiva.ts`, lógica pura testada no Node): dias
    seguidos com algum capítulo marcado; 1 folga por semana; recorde. Cartão
    🔥 no início (toque → Ajustes). Tom acolhedor, sem cobrança.
    Marcos 7/30/100/365 dias (`MARCOS`): borda e rótulo coloridos no cartão
    e uma mensagem única ao atingir cada um. Em dev, segurar o cartão simula.
  - **Lembrete diário** (`src/lib/lembrete.ts`, expo-notifications local):
    desligado por padrão, 21h; convite único ao marcar o 1º capítulo (o
    Android 13+ exige pedir permissão, então não dá para vir ligado).
    Agenda 14 dias à frente, pula hoje se já leu; reagenda ao abrir e ao marcar.
    Novas permissões: POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED (e WAKE_LOCK
    do Firebase). Bloqueadas: c2dm RECEIVE e AD_ID. Conferir o manifesto do build.
  - Ideia recusada: silhueta de Jesus nos capítulos lidos.

## Backlog (ordem de execução; riscar/mover ao concluir)

App publicado em produção (1.2.0 (8), Brasil, 23-24/10/2026). Sem retorno
financeiro; o objetivo é alcance orgânico (sem dinheiro).

### Divulgação orgânica (decidido em 28/10/2026 — fazer uma a uma)
1. [x] **Texto da loja com a palavra "Bíblia"** (feito 28/10: curta + completa, enviadas para revisão; textos em `docs/loja-textos.md`) (título/descrição curta/longa):
   as pessoas pesquisam "bíblia offline/sem anúncios". Exige confirmação do
   Henrique antes de aplicar na Play Console.
2. [~] (feito 28/10, falta validar no celular e build) **Compartilhar versículo com o nome do app + link** (só no Compartilhar,
   não no Copiar; desligável nos Ajustes) e **botão "Compartilhar o app"**.
3. [~] (feito 28/10: junto da comemoração do 1º marco, 7 dias; "Agora não" dá 1 convite a mais no marco seguinte; link market://, sem biblioteca; falta validar) **Pedido de avaliação no app** depois de vários dias de leitura (conferir
   que cabe na promessa de privacidade/sem permissões antes).
4. [ ] **QR code** com o link da loja + mensagens de divulgação por tipo de grupo.
5. [ ] **Roteiros de vídeos curtos** (Reels/TikTok/Shorts): "Bíblia sem anúncios",
   ofensiva, versículos por tema.
6. [ ] **Medir canais** (Play Console > Desempenho na loja; links diretos com
   origem) e abandonar o que não rende.
- Mensagem de WhatsApp já feita (longa e curta). Link da loja:
  https://play.google.com/store/apps/details?id=com.porzelt.ntsemanuncios
- Nunca avaliações falsas nem troca por avaliação (risco de banimento).

### Ideias de alcance na Play Console (a avaliar com o Henrique)
- [x] (28/10: enviado p/ revisão — Portugal, Angola, Moçambique, Cabo Verde, Guiné-Bissau, EUA, Japão, Reino Unido; Timor-Leste e São Tomé e Príncipe não existem na lista da Google Play; Portugal = UE: aviso informativo de bloqueio geográfico, ver se pedem declaração de comerciante). Liberar **outros países de língua portuguesa** (era só Brasil): Portugal,
  Angola, Moçambique, Cabo Verde etc. e diáspora (EUA, Japão, Reino Unido...).
- **Capturas em marketing** (1080x1920, com legenda) e **capturas de tablet**:
  o Google pede 4+ capturas com 1080 px de lado para elegibilidade a promoção.
- Experimentos de página (A/B), páginas personalizadas, links diretos.

### Produto
- [ ] **Destaques, favoritos e anotações** — ADIADO (28/10): só implementar quando algum usuário pedir. Desenho proposto: 4 cores, destacar = salvar, anotação por versículo, tela "Meus versículos" (SQLite).
- [ ] Monitorar Android vitals (falhas/ANRs) nos primeiros dias da 1.2.0 (8).
- [ ] Aviso "APIs descontinuadas de ponta a ponta" (vem das bibliotecas; some
  quando React Native/Expo atualizarem). Reavaliar a cada SDK.
- [ ] Narrador (áudio) e segunda tradução livre — talvez, no futuro.
- Fora do escopo: AT, apócrifos, traduções protegidas, comentários teológicos.

### Pendências técnicas pequenas
- [ ] Aparelho de um conhecido que não mostrou "Instalar" (provável país da
  conta/versão do Android): só investigar se pedirem; precisa de modelo.
- [ ] Capturas da loja ainda 723x1446 (ok, mas abaixo de 1080 px).
- [ ] Re-testar o lembrete diário em build real quando houver nova versão.

## Publicação (lembretes)

- Cada `versionCode` só pode ser enviado uma vez, mesmo em rascunho
  descartado. Suba em **Teste interno** e conclua o fluxo sem sair da tela.
- Conta pessoal: é provável que exija teste fechado com 12 testadores
  por 14 dias antes da produção (confirmar na Play Console).
- Vai precisar de política de privacidade em URL pública, formulário de
  segurança de dados ("não coleta"), classificação de conteúdo,
  "não contém anúncios" e declaração de ID de publicidade ("não usa").

## Convenções

- Sempre `npx tsc --noEmit` e `npx expo lint` antes de considerar pronto.
- Pedir confirmação antes de `git push`, build do EAS e mudanças de
  configuração na Play Console além de preencher formulários.
- Segredos nunca vão para o git.

- 15/10/2026: 1.2.0 (7) enviada para revisão no teste fechado. Pendente para a
  próxima versão que já precise de build (cota de builds apertada — o MPA usa
  a mesma conta): bloquear permissões de badge (Samsung/Huawei/Sony/HTC/Oppo,
  `READ_APP_BADGE` etc.) que vêm com o expo-notifications.
- 20/10/2026: 14 dias cumpridos; **pedido de acesso de produção enviado**
  (resposta por e-mail em até ~7 dias). Depois: promover 1.2.0 (7) do teste
  fechado para produção (sem novo build).
- 21/10/2026: acesso de produção **aprovado**. 1.2.0 (7) promovida do teste
  fechado para **Produção** (só Brasil, 100%) e enviada para revisão do Google.
  Quando aprovar, o app fica público na Play Store. O teste fechado continua
  ativo (útil para testar versões antes de produção).
- 21/10/2026: capturas da loja refeitas (5, com o cabeçalho "Novo Testamento",
  ofensiva e temas) em `assets/loja/`; trocadas na Play Console como
  **rascunho** da página de detalhes (ainda não enviado para revisão —
  falta a "Declaração de recursos de IA", decisão do Henrique, pois o ícone
  veio de um gerador de imagens externo).
- 23/10/2026: **app publicado em produção** (1.2.0 (7), Brasil). Capturas
  novas enviadas para revisão.
- **Próximo build (ainda não gerado)** — correções pedidas pela Play Console:
  - R8 ligado (`expo-build-properties`: minify + shrinkResources) — aviso
    "otimização DEX abaixo do limite", prazo fev/2027. **Testar bem no teste
    fechado antes da produção** (R8 pode quebrar código que usa reflexão).
  - `orientation: default` (gira a tela; pedido para telas grandes). Leitura
    realinha a página ao girar, coluna de texto limitada a 720 px, e todas as
    telas respeitam as margens laterais seguras (recorte da câmera deitado).
  - Permissões de contador no ícone (badge) bloqueadas.
  - Aviso "APIs descontinuadas de ponta a ponta": vem das bibliotecas
    (React Native/Expo), não do nosso código; some quando elas atualizarem.
  - Início: grupos de livros (Evangelhos, Histórico...) **recolhidos** ao abrir
    o app; cabeçalho tocável com seta ▾, nº de livros e capítulos lidos do
    grupo + barrinha. Estado só em memória (não lembra entre aberturas).
- 23/10/2026: atualizado para **Expo SDK 58** (RN 0.88, React 19.3). Feito
  editando o package.json + instalação limpa (o `expo install --fix` travava
  num conflito de peer do expo-symbols). expo-doctor 20/20. Tipos do RN 0.88:
  `ScrollViewInstance` e `TextLayoutEvent`. Ainda não validado no celular.
- 24/10/2026: build **1.2.0 (8)** enviado ao EAS (SDK 58, R8, rotação de tela,
  grupos recolhíveis, sem permissões de badge). Id do build:
  ebb20c0c-057d-41de-b1ce-9b587cbdca6f. Plano: ao terminar, conferir permissões
  no .aab, subir no **teste fechado** primeiro (R8 pode quebrar algo), validar
  e só então promover para produção. Página pública da loja aberta (navegador
  sem login mostra "Instalar", 10+ downloads); capturas novas já aparecem.
- 24/10/2026: **1.2.0 (8) enviada para revisão no teste fechado** (permissões do
  .aab conferidas: sem INTERNET/AD_ID/badges). Produção segue na 1.2.0 (7).
  Fluxo de homologação: aprovar no teste fechado -> testadores instalam e usam
  alguns dias -> promover a MESMA versão para produção (sem novo build).
- 24/10/2026: 1.2.0 (8) validada pelo Henrique no teste fechado (tudo ok) e
  **promovida para Produção** (Brasil, 100%), enviada para revisão do Google.
  Ao aprovar, a produção sai da 1.2.0 (7) para a (8).
