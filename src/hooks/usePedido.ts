import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cliente } from '@/api/cliente';
import { chaves } from '@/api/consultas';
import type { Pedido } from '@/api/tipos';

interface Entrada {
  versaoCotacao: string;
  carteiraId: string;
}

/**
 * A chave de idempotencia nasce com a tentativa e so e trocada quando o pedido
 * e confirmado. Reenviar apos timeout reaproveita o mesmo pedido em vez de cobrar duas vezes.
 */
export function useFinalizarPedido() {
  const qc = useQueryClient();
  const chave = useRef(crypto.randomUUID());

  const mutacao = useMutation({
    mutationFn: async (entrada: Entrada) => {
      const { data } = await cliente.post<Pedido>('/pedidos', entrada, {
        headers: { 'Idempotency-Key': chave.current },
      });
      return data;
    },
    onSuccess: (pedido) => {
      qc.setQueryData(chaves.pedido(pedido.id), pedido);
      void qc.invalidateQueries({ queryKey: chaves.carrinho });
      void qc.invalidateQueries({ queryKey: ['nfts'] });
      void qc.invalidateQueries({ queryKey: chaves.pedidos });
      chave.current = crypto.randomUUID();
    },
  });

  return mutacao;
}
