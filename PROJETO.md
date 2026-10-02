# NT Sem Anúncios

Contexto do projeto para retomar o trabalho de qualquer máquina. Este
arquivo é carregado automaticamente pelo Claude Code (via `CLAUDE.md`).

## O que é

App Android gratuito de leitura do Novo Testamento (Mateus a
Apocalipse, 27 livros). Sem anúncios, sem login, sem rastreamento,
100% offline. O foco é uma leitura limpa e agradável. Motivo: não havia
app assim sem anúncio. Quem quiser ler só parte escolhe o livro na lista.

## Decisões (não reabrir sem motivo forte)

- **Tradução:** Bíblia Livre (BLIVRE), versão TR, sob a licença CC BY 3.0 BR.
  Fonte, licença e atribuição estão em `CREDITOS.md`, e o crédito
  aparece dentro do app. Traduções protegidas (ARC, ARA, NAA, NVI, NTLH,
  ACF...) só com autorização por escrito do detentor.
- **Nome/pacote:** "NT Sem Anúncios", `com.porzelt.ntsemanuncios`. Sem
  vínculo sugerido com igreja ou editora; ícone e imagens são arte própria.
- **Sem permissão de internet:** `android.blockedPermissions` no
  `app.json` remove `INTERNET`. Consequência: o perfil `development`
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
- **v1.1:** busca de texto (com `KeyboardAvoidingView behavior="padding"`).
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

## Próximos passos

1. Validar no celular os itens acima.
3. Política de privacidade, build de teste interno (EAS, pedir confirmação).

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
