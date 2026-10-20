/**
 * Seleciono o cenário por query param (?cenario=) ou localStorage, para a mesma
 * build servir desenvolvimento, demonstração e teste.
 */
export const CENARIOS = {
  padrao: 'Resposta rápida e consistente',
  'latencia-alta': 'Latência de 1,2s a 2,5s em toda consulta',
  'fora-de-ordem': 'Respostas chegam fora da ordem de emissão',
  'lista-vazia': 'Catálogo sem resultados',
  'falha-conexao': 'Sem resposta da rede',
  'erro-servidor': 'Respostas 500 nas consultas',
  'sessao-expirada': 'Sessão inválida após o primeiro uso',
  'cupom-invalido': 'Qualquer cupom é recusado',
  'preco-alterado': 'Preço muda durante o checkout',
  'timeout-pedido': 'Pedido criado, resposta perdida',
  'pagamento-recusado': 'Pagamento sempre recusado',
} as const;

export type Cenario = keyof typeof CENARIOS;

const CHAVE = 'kurio.mock.cenario';

export function cenarioAtual(): Cenario {
  try {
    const daUrl = new URLSearchParams(location.search).get('cenario');
    if (daUrl && daUrl in CENARIOS) {
      localStorage.setItem(CHAVE, daUrl);
      return daUrl as Cenario;
    }
    const salvo = localStorage.getItem(CHAVE);
    if (salvo && salvo in CENARIOS) return salvo as Cenario;
  } catch {
    // storage bloqueado: cai no padrão
  }
  return 'padrao';
}

export function definirCenario(cenario: Cenario): void {
  try {
    localStorage.setItem(CHAVE, cenario);
  } catch {
    // nada a fazer
  }
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Latencia aplicada antes de responder, conforme o cenario ativo. */
export async function atrasar(): Promise<void> {
  const cenario = cenarioAtual();
  if (cenario === 'latencia-alta') {
    await espera(1200 + Math.random() * 1300);
    return;
  }
  if (cenario === 'fora-de-ordem') {
    await espera(Math.random() < 0.5 ? 1500 : 120);
    return;
  }
  await espera(80 + Math.random() * 120);
}

export const cenarioEh = (...quais: Cenario[]) => quais.includes(cenarioAtual());
