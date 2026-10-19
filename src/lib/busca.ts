import type { ConsultaNfts, OrdenacaoNft } from '@/api/tipos';
import { ORDENACOES } from './consultaNfts';

export interface BuscaCatalogo {
  busca?: string;
  /** Lista separada por virgula: mantem a URL legivel e editavel a mao. */
  colecao?: string;
  ordenacao?: OrdenacaoNft;
  disponiveis?: boolean;
  pagina?: number;
}

const ORDENACOES_VALIDAS = ORDENACOES.map((o) => o.valor);

export function listaDeColecoes(valor: string | undefined): string[] {
  return valor ? valor.split(',').filter(Boolean) : [];
}

export function colecoesParaBusca(lista: string[]): string | undefined {
  return lista.length > 0 ? lista.join(',') : undefined;
}

/** Validacao defensiva: a URL e editavel pelo usuario e nao pode derrubar a tela. */
export function validarBusca(bruto: Record<string, unknown>): BuscaCatalogo {
  const pagina = Number(bruto.pagina);
  const ordenacao = String(bruto.ordenacao) as OrdenacaoNft;

  return {
    busca: typeof bruto.busca === 'string' && bruto.busca ? bruto.busca : undefined,
    colecao: typeof bruto.colecao === 'string' && bruto.colecao ? bruto.colecao : undefined,
    ordenacao: ORDENACOES_VALIDAS.includes(ordenacao) ? ordenacao : undefined,
    disponiveis: bruto.disponiveis === true || bruto.disponiveis === 'true' || undefined,
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.floor(pagina) : undefined,
  };
}

export function paraConsulta(busca: BuscaCatalogo, porPagina = 9): ConsultaNfts {
  return {
    busca: busca.busca,
    colecoes: listaDeColecoes(busca.colecao),
    ordenacao: busca.ordenacao ?? 'recentes',
    somenteDisponiveis: busca.disponiveis ?? false,
    pagina: busca.pagina ?? 1,
    porPagina,
  };
}
