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

- `src/app/index.tsx`: lista de livros + "Continuar lendo".
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

## Estado atual (26/09/2026)

- Esqueleto pronto: lista de livros, grade de capítulos, leitura com
  deslize e "continuar lendo". `tsc` e `lint` passam. O conversor foi
  testado no Node. **Ainda não foi visto rodando no celular.**
- Ícone e splash ainda são os do template do Expo e precisam ser trocados por arte própria.

## Próximos passos

1. Validar o esqueleto no celular via Expo Go.
2. Preferências (tamanho da fonte, tema claro/escuro/sépia), tela que não apaga, copiar/compartilhar versículo, tela "Sobre".
3. Ícone próprio, política de privacidade, build de teste interno.

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
