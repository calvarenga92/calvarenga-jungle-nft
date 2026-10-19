import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NftAtualizado, PedidoAtualizado } from '@/api/eventos';
import { chaves } from '@/api/consultas';
import type { Nft, NftResumo, Pagina, Pedido } from '@/api/tipos';
import { obterConexao, type EstadoConexao } from '@/tempo-real';
import { useSessao } from './useSessao';

/** Eventos ja aplicados: a mesma entrega repetida nao e processada de novo. */
const aplicados = new Set<string>();

export function useTempoReal() {
  const qc = useQueryClient();
  const { usuario } = useSessao();
  const [estado, definirEstado] = useState<EstadoConexao>('conectando');

  useEffect(() => {
    const conexao = obterConexao();
    const pararEstado = conexao.observarEstado(definirEstado);

    const pararNft = conexao.escutar('nft.updated', (evento: NftAtualizado) => {
      if (aplicados.has(evento.eventoId)) return;
      aplicados.add(evento.eventoId);

      const menorPreco = evento.edicoes
        .map((e) => e.precoEth)
        .reduce((a, b) => (Number(a) <= Number(b) ? a : b));

      // Listas: so aplica se o evento for mais novo que a versao ja exibida.
      qc.setQueriesData<Pagina<NftResumo>>({ queryKey: ['nfts'] }, (pagina) =>
        pagina
          ? {
              ...pagina,
              itens: pagina.itens.map((item) =>
                item.id === evento.nftId && evento.versao > item.versao
                  ? { ...item, precoMinimoEth: menorPreco, versao: evento.versao }
                  : item,
              ),
            }
          : pagina,
      );

      // Detalhe: mesma regra de versao, aplicada tambem as edicoes.
      qc.setQueriesData<Nft>({ queryKey: ['nft'] }, (nft) => {
        if (!nft || nft.id !== evento.nftId || evento.versao <= nft.versao) return nft;
        return {
          ...nft,
          versao: evento.versao,
          precoMinimoEth: menorPreco,
          edicoes: nft.edicoes.map((edicao) => {
            const atualizada = evento.edicoes.find((e) => e.id === edicao.id);
            return atualizada
              ? { ...edicao, precoEth: atualizada.precoEth, disponivel: atualizada.disponivel }
              : edicao;
          }),
        };
      });
    });

    const pararPedido = conexao.escutar('order.updated', (evento: PedidoAtualizado) => {
      if (aplicados.has(evento.eventoId)) return;
      aplicados.add(evento.eventoId);

      qc.setQueryData<Pedido>(chaves.pedido(evento.pedidoId), (pedido) =>
        pedido && evento.versao > pedido.versao
          ? {
              ...pedido,
              status: evento.status,
              referenciaTransacao: evento.referenciaTransacao,
              motivoRecusa: evento.motivoRecusa,
              versao: evento.versao,
              atualizadoEm: evento.emitidoEm,
            }
          : pedido,
      );
    });

    return () => { pararEstado(); pararNft(); pararPedido(); };
  }, [qc]);

  useEffect(() => {
    obterConexao().identificar(usuario?.id ?? null);
  }, [usuario?.id]);

  return estado;
}
