import type { ConsultaNfts, OrdenacaoNft } from '@/api/tipos';

export const ORDENACOES: Array<{ valor: OrdenacaoNft; rotulo: string }> = [
  { valor: 'recentes', rotulo: 'Listados recentemente' },
  { valor: 'preco-asc', rotulo: 'Menor preco' },
  { valor: 'preco-desc', rotulo: 'Maior preco' },
  { valor: 'populares', rotulo: 'Em alta' },
];

export const PADRAO: ConsultaNfts = { pagina: 1, porPagina: 9 };

/** A consulta mora na URL: compartilhar o link reproduz a mesma lista. */
export function paraParametros(consulta: ConsultaNfts): URLSearchParams {
  const p = new URLSearchParams();
  if (consulta.busca) p.set('busca', consulta.busca);
  consulta.colecoes?.forEach((c) => p.append('colecao', c));
  if (consulta.precoMin) p.set('precoMin', consulta.precoMin);
  if (consulta.precoMax) p.set('precoMax', consulta.precoMax);
  if (consulta.somenteDisponiveis) p.set('somenteDisponiveis', 'true');
  if (consulta.ordenacao) p.set('ordenacao', consulta.ordenacao);
  p.set('pagina', String(consulta.pagina));
  p.set('porPagina', String(consulta.porPagina));
  return p;
}
