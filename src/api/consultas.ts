import { queryOptions } from '@tanstack/react-query';
import { cliente } from './cliente';
import { paraParametros } from '@/lib/consultaNfts';
import type {
  Carteira, Colecao, ConsultaNfts, Cotacao, FaixaPreco, Nft, NftResumo, Pagina, Pedido, Sessao,
} from './tipos';

export const chaves = {
  nfts: (consulta: ConsultaNfts) => ['nfts', consulta] as const,
  nft: (id: string) => ['nft', id] as const,
  colecoes: ['colecoes'] as const,
  faixaPreco: ['faixa-preco'] as const,
  favoritos: ['favoritos'] as const,
  sessao: ['sessao'] as const,
  carrinho: ['carrinho'] as const,
  pedidos: ['pedidos'] as const,
  pedido: (id: string) => ['pedido', id] as const,
  carteiras: ['carteiras'] as const,
};

export const consultaNfts = (consulta: ConsultaNfts) =>
  queryOptions({
    queryKey: chaves.nfts(consulta),
    queryFn: async () => {
      const { data } = await cliente.get<Pagina<NftResumo>>('/nfts', {
        params: paraParametros(consulta),
      });
      return data;
    },
  });

export const consultaNft = (id: string) =>
  queryOptions({
    queryKey: chaves.nft(id),
    queryFn: async () => (await cliente.get<Nft>(`/nfts/${id}`)).data,
  });

export const consultaColecoes = queryOptions({
  queryKey: chaves.colecoes,
  queryFn: async () => (await cliente.get<Colecao[]>('/colecoes')).data,
  staleTime: 5 * 60 * 1000,
});

export const consultaFaixaPreco = queryOptions({
  queryKey: chaves.faixaPreco,
  queryFn: async () => (await cliente.get<FaixaPreco>('/nfts/faixa')).data,
  staleTime: 5 * 60 * 1000,
});

export const consultaSessao = queryOptions({
  queryKey: chaves.sessao,
  queryFn: async () => (await cliente.get<Sessao | null>('/sessao')).data ?? null,
  retry: false,
  staleTime: 60 * 1000,
});

export const consultaCarrinho = queryOptions({
  queryKey: chaves.carrinho,
  queryFn: async () => (await cliente.get<Cotacao>('/carrinho')).data,
});

export const consultaFavoritos = queryOptions({
  queryKey: chaves.favoritos,
  queryFn: async () => (await cliente.get<NftResumo[]>('/favoritos')).data,
});

export const consultaPedidos = queryOptions({
  queryKey: chaves.pedidos,
  queryFn: async () => (await cliente.get<Pedido[]>('/pedidos')).data,
});

export const consultaPedido = (id: string) =>
  queryOptions({
    queryKey: chaves.pedido(id),
    queryFn: async () => (await cliente.get<Pedido>(`/pedidos/${id}`)).data,
  });

export const consultaCarteiras = queryOptions({
  queryKey: chaves.carteiras,
  queryFn: async () => (await cliente.get<Carteira[]>('/carteiras')).data,
});
