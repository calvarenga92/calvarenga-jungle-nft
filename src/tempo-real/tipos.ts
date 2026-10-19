import type { EventosServidor } from '@/api/eventos';

export type EstadoConexao = 'conectando' | 'conectado' | 'desconectado';

/**
 * Interface minima que a aplicacao consome. O socket.io-client e o simulador
 * local implementam a mesma coisa, entao nenhuma tela sabe qual esta ativo.
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
