import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chaves, consultaSessao } from '@/api/consultas';
import { cliente } from '@/api/cliente';
import type { Sessao } from '@/api/tipos';
import { gravarToken, limparToken } from '@/lib/token';

type RespostaSessao = Sessao & { token: string };

export function useSessao() {
  const { data, isPending } = useQuery(consultaSessao);
  return {
    usuario: data?.usuario ?? null,
    autenticado: Boolean(data),
    carregando: isPending,
  };
}

export function useEntrar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: { email: string; senha: string }) =>
      (await cliente.post<RespostaSessao>('/sessao', dados)).data,
    onSuccess: ({ token }) => {
      gravarToken(token);
      void qc.invalidateQueries();
    },
  });
}

export function useCriarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: { nome: string; email: string; senha: string }) =>
      (await cliente.post<RespostaSessao>('/contas', dados)).data,
    onSuccess: ({ token }) => {
      gravarToken(token);
      void qc.invalidateQueries();
    },
  });
}

export function useSair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await cliente.delete('/sessao'); },
    onSettled: () => {
      limparToken();
      qc.setQueryData(chaves.sessao, null);
      void qc.invalidateQueries();
    },
  });
}
