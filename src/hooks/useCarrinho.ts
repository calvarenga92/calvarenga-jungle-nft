import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cliente } from '@/api/cliente';
import { chaves, consultaCarrinho } from '@/api/consultas';
import type { Cotacao } from '@/api/tipos';

export function useCarrinho() {
  return useQuery(consultaCarrinho);
}

/** Toda mutação devolve a cotação inteira: um único ponto de verdade para os totais. */
function useMutacaoCarrinho<V>(executar: (valor: V) => Promise<Cotacao>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: executar,
    onSuccess: (cotacao) => qc.setQueryData(chaves.carrinho, cotacao),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['nfts'] });
    },
  });
}

export function useAdicionarAoCarrinho() {
  return useMutacaoCarrinho(
    async (dados: { nftId: string; edicaoId: string; quantidade?: number }) =>
      (await cliente.post<Cotacao>('/carrinho/itens', dados)).data,
  );
}

export function useMudarQuantidade() {
  return useMutacaoCarrinho(
    async ({ id, quantidade }: { id: string; quantidade: number }) =>
      (await cliente.patch<Cotacao>(`/carrinho/itens/${id}`, { quantidade })).data,
  );
}

export function useRemoverItem() {
  return useMutacaoCarrinho(
    async (id: string) => (await cliente.delete<Cotacao>(`/carrinho/itens/${id}`)).data,
  );
}

export function useAplicarCupom() {
  return useMutacaoCarrinho(
    async (codigo: string) =>
      (await cliente.post<Cotacao>('/carrinho/cupom', { codigo })).data,
  );
}

export function useRemoverCupom() {
  return useMutacaoCarrinho(
    async () => (await cliente.delete<Cotacao>('/carrinho/cupom')).data,
  );
}
