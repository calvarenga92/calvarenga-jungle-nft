import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cliente } from '@/api/cliente';
import { chaves, consultaCarteiras } from '@/api/consultas';
import type { Carteira, RedeCarteira } from '@/api/tipos';

export function useCarteiras() {
  return useQuery(consultaCarteiras);
}

export function useCriarCarteira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: { apelido: string; endereco: string; rede: RedeCarteira }) =>
      (await cliente.post<Carteira>('/carteiras', dados)).data,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: chaves.carteiras }); },
  });
}

export function useDefinirPrincipal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await cliente.put<Carteira[]>(`/carteiras/${id}/principal`)).data,
    onSuccess: (carteiras) => qc.setQueryData(chaves.carteiras, carteiras),
  });
}

export function useRemoverCarteira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await cliente.delete<Carteira[]>(`/carteiras/${id}`)).data,
    onSuccess: (carteiras) => qc.setQueryData(chaves.carteiras, carteiras),
  });
}
