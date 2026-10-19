const CHAVE = 'kurio.token';

/** sessionStorage pode lancar em navegacao privada: a sessao vive em memoria nesse caso. */
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
    // mantido apenas em memoria
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
