import { useEffect, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { NftAtualizado, PedidoAtualizado } from '@/api/eventos';
import { chaves } from '@/api/consultas';
import type { Nft, NftResumo, Pagina, Pedido } from '@/api/tipos';
import { obterConexao, type EstadoConexao } from '@/tempo-real';
import { useSessao } from './useSessao';

/** Eventos já aplicados: a mesma entrega repetida não é processada de novo. */
const aplicados = new Set<string>();

function menorPrecoDe(evento: NftAtualizado) {
  return evento.edicoes
    .map((e) => e.precoEth)
    .reduce((a, b) => (Number(a) <= Number(b) ? a : b));
}

/**
 * A entrega não garante ordem. Só aplico o evento se a versão dele for maior
 * que a exibida, senão um pacote atrasado faria o preço regredir.
 */
function aplicarNft(qc: QueryClient, evento: NftAtualizado) {
  const menorPreco = menorPrecoDe(evento);

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
}

function aplicarPedido(qc: QueryClient, evento: PedidoAtualizado) {
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
}

function umaVez<E extends { eventoId: string }>(aplicar: (evento: E) => void) {
  return (evento: E) => {
    if (aplicados.has(evento.eventoId)) return;
    aplicados.add(evento.eventoId);
    aplicar(evento);
  };
}

export function useTempoReal() {
  const qc = useQueryClient();
  const { usuario } = useSessao();
  const [estado, definirEstado] = useState<EstadoConexao>('conectando');

  useEffect(() => {
    // a conexão chega de forma assíncrona; o componente pode sair antes disso
    let ativo = true;
    const encerrar: Array<() => void> = [];

    void obterConexao().then((conexao) => {
      if (!ativo) {
        return;
      }

      encerrar.push(
        conexao.observarEstado(definirEstado),
        conexao.escutar('nft.updated', umaVez<NftAtualizado>((e) => aplicarNft(qc, e))),
        conexao.escutar('order.updated', umaVez<PedidoAtualizado>((e) => aplicarPedido(qc, e))),
      );
    });

    return () => {
      ativo = false;
      encerrar.forEach((parar) => parar());
    };
  }, [qc]);

  useEffect(() => {
    void obterConexao().then((conexao) => conexao.identificar(usuario?.id ?? null));
  }, [usuario?.id]);

  return estado;
}
