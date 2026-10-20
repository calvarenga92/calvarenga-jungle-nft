import type { Conexao } from './tipos';

let conexao: Conexao | null = null;
let pendente: Promise<Conexao> | null = null;

/**
 * Carrego sob demanda: só entra no bundle o lado que vai ser usado.
 * Com VITE_SOCKET_URL falo com o servidor; sem ela, uso o simulador local.
 */
export function obterConexao(): Promise<Conexao> {
  if (conexao) return Promise.resolve(conexao);

  if (!pendente) {
    const url = import.meta.env.VITE_SOCKET_URL;

    pendente = (url
      ? import('./socket').then((m) => m.criarSocket(url))
      : import('./simulador').then((m) => m.criarSimulador())
    ).then((criada) => {
      conexao = criada;
      return criada;
    });
  }

  return pendente;
}

export function encerrarConexao(): void {
  conexao?.encerrar();
  conexao = null;
  pendente = null;
}

export type { Conexao, EstadoConexao } from './tipos';
