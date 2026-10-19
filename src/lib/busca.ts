import type { ConsultaNfts, OrdenacaoNft } from '@/api/tipos';
import { ORDENACOES } from './consultaNfts';

export interface BuscaCatalogo {
  busca?: string;
  colecao?: string[];
  ordenacao?: OrdenacaoNft;
  disponiveis?: boolean;
  pagina?: number;
}

const ORDENACOES_VALIDAS = ORDENACOES.map((o) => o.valor);

function comoLista(valor: unknown): string[] | undefined {
  if (Array.isArray(valor)) return valor.map(String).filter(Boolean);
  if (typeof valor === 'string' && valor) return [valor];
  return undefined;
}

/** Validacao defensiva: a URL e editavel pelo usuario e nao pode derrubar a tela. */
export function validarBusca(bruto: Record<string, unknown>): BuscaCatalogo {
  const pagina = Number(bruto.pagina);
  const ordenacao = String(bruto.ordenacao) as OrdenacaoNft;

  return {
    busca: typeof bruto.busca === 'string' && bruto.busca ? bruto.busca : undefined,
    colecao: comoLista(bruto.colecao),
    ordenacao: ORDENACOES_VALIDAS.includes(ordenacao) ? ordenacao : undefined,
    disponiveis: bruto.disponiveis === true || bruto.disponiveis === 'true' || undefined,
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.floor(pagina) : undefined,
  };
}

export function paraConsulta(busca: BuscaCatalogo, porPagina = 9): ConsultaNfts {
  return {
    busca: busca.busca,
    colecoes: busca.colecao,
    ordenacao: busca.ordenacao ?? 'recentes',
    somenteDisponiveis: busca.disponiveis ?? false,
    pagina: busca.pagina ?? 1,
    porPagina,
  };
}
