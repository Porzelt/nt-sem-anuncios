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
- 04/10/2026: lista "Testadores NT" com 11 contas (e-mails ficam só na Play
  Console, não no repositório). Falta pelo menos 1 para chegar a 12.

## Próximos passos

1. Aguardar a aprovação da revisão.
2. Adicionar 12+ testadores (contas Google) à lista "Testadores NT" e enviar
   o link de inscrição; contar 14 dias com 12 inscritos.
3. Depois: solicitar acesso de produção na Play Console.

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
