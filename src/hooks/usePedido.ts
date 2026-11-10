import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CABECALHO_IDEMPOTENCIA, criarTentativaPagamento } from '@calvarenga92/kurio-regras';
import { cliente, ErroApi } from '@/api/cliente';
import { chaves } from '@/api/consultas';
import type { Pedido } from '@/api/tipos';

interface Entrada {
  versaoCotacao: string;
  carteiraId: string;
}

/**
 * Gero a chave na montagem da tentativa e só troco quando o pedido é confirmado.
 * Reenviar após timeout reaproveita o pedido em vez de cobrar duas vezes.
 * A tentativa também fixa o corpo até a resposta chegar: se a cotação for recarregada
 * no meio (ao voltar o foco para a aba, por exemplo), o reenvio não vira conflito de chave.
 */
export function useFinalizarPedido() {
  const qc = useQueryClient();
  const chave = useRef(criarTentativaPagamento<Entrada>(() => crypto.randomUUID()));

  const mutacao = useMutation({
    mutationFn: async (entrada: Entrada) => {
      const tentativa = chave.current.preparar(entrada);
      const { data } = await cliente.post<Pedido>('/pedidos', tentativa.entrada, {
        headers: { [CABECALHO_IDEMPOTENCIA]: tentativa.chave },
      });
      return data;
    },
    onSuccess: (pedido) => {
      chave.current.registrarDesfecho('pedido-criado');
      qc.setQueryData(chaves.pedido(pedido.id), pedido);
      void qc.invalidateQueries({ queryKey: chaves.carrinho });
      void qc.invalidateQueries({ queryKey: ['nfts'] });
      void qc.invalidateQueries({ queryKey: chaves.pedidos });
    },
    onError: (erro) => {
      const semResposta = !(erro instanceof ErroApi) || erro.status === 0;
      chave.current.registrarDesfecho(semResposta ? 'sem-resposta' : 'erro-do-servidor');
    },
  });

  return mutacao;
}
