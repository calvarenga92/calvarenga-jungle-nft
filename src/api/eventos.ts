import type { Eth, StatusPedido } from './tipos';

/**
 * Todo evento carrega identidade, recurso afetado e versão. O cliente descarta
 * duplicata pelo id e versão anterior à que já aplicou.
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
