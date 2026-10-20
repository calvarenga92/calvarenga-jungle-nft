import type { EventosServidor } from '@/api/eventos';

export type EstadoConexao = 'conectando' | 'conectado' | 'desconectado';

/**
 * Interface mínima que a aplicação consome. O socket.io-client e o simulador
 * implementam a mesma coisa, então nenhuma tela sabe qual está ativo.
 */
export interface Conexao {
  escutar<E extends keyof EventosServidor>(
    evento: E,
    ouvinte: EventosServidor[E],
  ): () => void;
  observarEstado(ouvinte: (estado: EstadoConexao) => void): () => void;
  identificar(usuarioId: string | null): void;
  encerrar(): void;
}
