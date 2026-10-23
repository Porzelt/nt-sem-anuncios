# Expo muda rápido — confira a versão antes de seguir doc de memória

Este projeto está no **Expo SDK 58** (veja `package.json` — é a fonte de
verdade, não este arquivo). Antes de usar qualquer API do Expo que ainda
não apareça no código do projeto, confira o comportamento real em
`node_modules/<pacote>` (README, `.d.ts`) ou nos docs versionados em
https://docs.expo.dev/versions/v58.0.0/ — não assuma a doc mais recente.

## Comandos

```bash
npx expo install <pacote>   # sempre, em vez de npm install (versão compatível com o SDK)
npx expo start              # servidor de desenvolvimento (Expo Go)
npx tsc --noEmit            # checagem de tipos
npx expo lint               # lint
node scripts/converter-blivre.mjs   # regenera assets/texto/ a partir de fonte/
```

## Regras

- Rotas ficam em `src/app/` (expo-router); código que não é tela fica fora.
- `android/` e `ios/` são gerados (CNG). Nunca edite à mão; configure no `app.json`.
