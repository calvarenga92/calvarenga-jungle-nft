import type { ConsultaNfts, OrdenacaoNft } from '@/api/tipos';
import { ORDENACOES } from './consultaNfts';

export interface BuscaCatalogo {
  busca?: string;
  /** Lista separada por vírgula: mantém a URL legível e editável à mão. */
  colecao?: string;
  precoMin?: number;
  precoMax?: number;
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
 * O limite vai como número na URL para o link ficar legível: string "1" seria
 * serializada pelo router como %221%22. A conversão para decimal acontece na
 * borda da API, onde a comparação é feita em bigint.
 */
function limiteValido(valor: unknown): number | undefined {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  if (typeof numero !== 'number' || !Number.isFinite(numero) || numero < 0) return undefined;
  return numero;
}

export function validarBusca(bruto: Record<string, unknown>): BuscaCatalogo {
  const pagina = Number(bruto.pagina);
  const ordenacao = String(bruto.ordenacao) as OrdenacaoNft;

  return {
    busca: typeof bruto.busca === 'string' && bruto.busca ? bruto.busca : undefined,
    colecao: typeof bruto.colecao === 'string' && bruto.colecao ? bruto.colecao : undefined,
    precoMin: limiteValido(bruto.precoMin),
    precoMax: limiteValido(bruto.precoMax),
    ordenacao: ORDENACOES_VALIDAS.includes(ordenacao) ? ordenacao : undefined,
    disponiveis: bruto.disponiveis === true || bruto.disponiveis === 'true' || undefined,
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.floor(pagina) : undefined,
  };
}

export function paraConsulta(busca: BuscaCatalogo, porPagina = 9): ConsultaNfts {
  return {
    busca: busca.busca,
    colecoes: listaDeColecoes(busca.colecao),
    precoMin: busca.precoMin?.toFixed(4),
    precoMax: busca.precoMax?.toFixed(4),
    ordenacao: busca.ordenacao ?? 'recentes',
    somenteDisponiveis: busca.disponiveis ?? false,
    pagina: busca.pagina ?? 1,
    porPagina,
  };
}
