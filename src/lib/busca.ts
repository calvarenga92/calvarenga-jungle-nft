import type { ConsultaNfts, OrdenacaoNft } from '@/api/tipos';
import { ORDENACOES } from './consultaNfts';

export interface BuscaCatalogo {
  busca?: string;
  /** Lista separada por vírgula: mantém a URL legível e editável à mão. */
  colecao?: string;
  precoMin?: string;
  precoMax?: string;
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

/**
 * O router faz parsing tipo JSON do search, então "1.00" chega como número.
 * Aceito os dois e normalizo para string decimal, que é o formato do contrato.
 */
function decimalValido(valor: unknown): string | undefined {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) && valor >= 0 ? String(valor) : undefined;
  }
  return typeof valor === 'string' && /^\d+(\.\d{1,4})?$/.test(valor) ? valor : undefined;
}

export function validarBusca(bruto: Record<string, unknown>): BuscaCatalogo {
  const pagina = Number(bruto.pagina);
  const ordenacao = String(bruto.ordenacao) as OrdenacaoNft;

  return {
    busca: typeof bruto.busca === 'string' && bruto.busca ? bruto.busca : undefined,
    colecao: typeof bruto.colecao === 'string' && bruto.colecao ? bruto.colecao : undefined,
    precoMin: decimalValido(bruto.precoMin),
    precoMax: decimalValido(bruto.precoMax),
    ordenacao: ORDENACOES_VALIDAS.includes(ordenacao) ? ordenacao : undefined,
    disponiveis: bruto.disponiveis === true || bruto.disponiveis === 'true' || undefined,
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.floor(pagina) : undefined,
  };
}

export function paraConsulta(busca: BuscaCatalogo, porPagina = 9): ConsultaNfts {
  return {
    busca: busca.busca,
    colecoes: listaDeColecoes(busca.colecao),
    precoMin: busca.precoMin,
    precoMax: busca.precoMax,
    ordenacao: busca.ordenacao ?? 'recentes',
    somenteDisponiveis: busca.disponiveis ?? false,
    pagina: busca.pagina ?? 1,
    porPagina,
  };
}
