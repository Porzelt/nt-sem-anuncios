// Preferências de leitura (tema, fonte e diagramação), salvas no kv-store
// e compartilhadas por contexto para toda a árvore de telas.
import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useState, type ReactNode } from 'react';

export type Tema = 'sistema' | 'claro' | 'escuro' | 'sepia';
/** Família da fonte de leitura (ver FONTES_LEITURA em constants/theme). */
export type FamiliaFonte = 'serifada' | 'semSerifa' | 'sistema';
/** Versículos em parágrafo corrido ou um por linha. */
export type Diagramacao = 'paragrafo' | 'linhas';

export const FONTE_MIN = 14;
export const FONTE_MAX = 32;
export const FONTE_PADRAO = 19;

export type Preferencias = {
  tema: Tema;
  fonte: number;
  familia: FamiliaFonte;
  diagramacao: Diagramacao;
  justificar: boolean;
};

const CHAVE = 'preferencias';
const PADRAO: Preferencias = {
  tema: 'sistema',
  fonte: FONTE_PADRAO,
  familia: 'serifada',
  diagramacao: 'paragrafo',
  justificar: false,
};

function ler(): Preferencias {
  try {
    const bruto = Storage.getItemSync(CHAVE);
    if (!bruto) return PADRAO;
    const p = { ...PADRAO, ...JSON.parse(bruto) } as Preferencias;
    p.fonte = Math.min(Math.max(p.fonte, FONTE_MIN), FONTE_MAX);
    return p;
  } catch {
    return PADRAO;
  }
}

type Contexto = Preferencias & { alterar: (mudanca: Partial<Preferencias>) => void };

const PreferenciasContext = createContext<Contexto | null>(null);

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(ler);

  function alterar(mudanca: Partial<Preferencias>) {
    const novas = { ...prefs, ...mudanca };
    setPrefs(novas);
    Storage.setItemSync(CHAVE, JSON.stringify(novas));
  }

  return <PreferenciasContext value={{ ...prefs, alterar }}>{children}</PreferenciasContext>;
}

export function usePreferencias(): Contexto {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) throw new Error('usePreferencias fora do PreferenciasProvider');
  return ctx;
}
