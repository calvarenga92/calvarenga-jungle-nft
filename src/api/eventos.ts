import type { Eth, StatusPedido } from './tipos';

/**
 * Eventos carregam identidade estavel, recurso afetado e versao.
 * O cliente descarta duplicatas e versoes anteriores a que ja aplicou.
 */
export interface EventoBase {
  eventoId: string;
  versao: number;
  emitidoEm: string;
}

export interface NftAtualizado extends EventoBase {
  nftId: string;
  edicoes: Array<{ id: string; precoEth: Eth; disponivel: number }>;
}

export interface PedidoAtualizado extends EventoBase {
  pedidoId: string;
  status: StatusPedido;
  referenciaTransacao: string | null;
  motivoRecusa: string | null;
}

export interface EventosServidor {
  'nft.updated': (evento: NftAtualizado) => void;
  'order.updated': (evento: PedidoAtualizado) => void;
}

export interface EventosCliente {
  'session.identify': (dados: { usuarioId: string | null }) => void;
}
