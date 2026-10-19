import { io, type Socket } from 'socket.io-client';
import type { EventosCliente, EventosServidor } from '@/api/eventos';
import type { Conexao, EstadoConexao } from './tipos';

type SocketTipado = Socket<EventosServidor, EventosCliente>;

export function criarSocket(url: string): Conexao {
  const socket: SocketTipado = io(url, {
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  const observadores = new Set<(estado: EstadoConexao) => void>();
  let estadoAtual: EstadoConexao = 'conectando';

  function definirEstado(proximo: EstadoConexao) {
    estadoAtual = proximo;
    observadores.forEach((o) => o(proximo));
  }

  socket.on('connect', () => definirEstado('conectado'));
  socket.on('disconnect', () => definirEstado('desconectado'));
  socket.io.on('reconnect_attempt', () => definirEstado('conectando'));

  return {
    escutar(evento, ouvinte) {
      socket.on(evento, ouvinte as never);
      return () => { socket.off(evento, ouvinte as never); };
    },
    observarEstado(ouvinte) {
      observadores.add(ouvinte);
      ouvinte(estadoAtual);
      return () => observadores.delete(ouvinte);
    },
    identificar(usuarioId) {
      socket.emit('session.identify', { usuarioId });
    },
    encerrar() {
      observadores.clear();
      socket.disconnect();
    },
  };
}
