const CHAVE = 'kurio.token';

/** sessionStorage pode lançar em navegação privada: a sessão vive em memória nesse caso. */
let memoria: string | null = null;

export function lerToken(): string | null {
  if (memoria) return memoria;
  try {
    return sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function gravarToken(token: string): void {
  memoria = token;
  try {
    sessionStorage.setItem(CHAVE, token);
  } catch {
    // mantido apenas em memória
  }
}

export function limparToken(): void {
  memoria = null;
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
}
