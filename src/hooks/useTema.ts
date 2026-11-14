import { useCallback, useSyncExternalStore } from 'react';

export const TEMAS = [
  { id: 'quente', nome: 'Gradiente quente', amostra: 'linear-gradient(135deg, #6b4dff, #ff5a36)' },
  { id: 'neon', nome: 'Noturna neon', amostra: 'linear-gradient(135deg, #15121f 45%, #c8f05a 46%)' },
  { id: 'eletrica', nome: 'Elétrica', amostra: 'linear-gradient(135deg, #2b45ff 50%, #d4ff3a 51%)' },
] as const;

export type Tema = (typeof TEMAS)[number]['id'];

const CHAVE = 'kurio:tema';
const PADRAO: Tema = 'quente';
const ouvintes = new Set<() => void>();

function valido(valor: string | null): valor is Tema {
  return TEMAS.some((t) => t.id === valor);
}

function lerTema(): Tema {
  const atual = document.documentElement.dataset.tema ?? null;
  return valido(atual) ? atual : PADRAO;
}

/** Aplica o tema no <html>; o index.html faz o mesmo antes da primeira pintura. */
function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // Navegação privada sem storage: o tema vale só para esta visita.
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function useTema() {
  const tema = useSyncExternalStore(assinar, lerTema, () => PADRAO);
  const definir = useCallback((novo: Tema) => aplicarTema(novo), []);
  return { tema, definir };
}
