import { criarSimulador } from './simulador';
import { criarSocket } from './socket';
import type { Conexao } from './tipos';

let conexao: Conexao | null = null;

/**
 * Com VITE_SOCKET_URL definida a aplicacao fala com o servidor de verdade.
 * Sem ela, cai no simulador local: o contrato e o mesmo, entao as telas
 * nao mudam e a demo roda sem backend.
 */
export function obterConexao(): Conexao {
  if (!conexao) {
    const url = import.meta.env.VITE_SOCKET_URL;
    conexao = url ? criarSocket(url) : criarSimulador();
  }
  return conexao;
}

export function encerrarConexao(): void {
  conexao?.encerrar();
  conexao = null;
}

export type { Conexao, EstadoConexao } from './tipos';
