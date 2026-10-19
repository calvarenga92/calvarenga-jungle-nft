import type { NftAtualizado } from '@/api/eventos';
import { cenarioEh } from '@/mocks/cenarios';
import { estado, proximaVersaoEvento } from '@/mocks/store';
import type { Conexao, EstadoConexao } from './tipos';

const INTERVALO_PADRAO_MS = 7000;
const INTERVALO_RAPIDO_MS = 1200;

/** ?eventos=rapido acelera a cadencia para demonstrar e testar o tempo real. */
function intervalo(): number {
  try {
    const parametro = new URLSearchParams(location.search).get('eventos');
    return parametro === 'rapido' ? INTERVALO_RAPIDO_MS : INTERVALO_PADRAO_MS;
  } catch {
    return INTERVALO_PADRAO_MS;
  }
}

/**
 * Sem servidor disponivel, o mesmo contrato e produzido localmente.
 * No cenario "fora-de-ordem" os eventos chegam embaralhados de proposito,
 * para a protecao por versao do cliente ficar observavel.
 */
export function criarSimulador(): Conexao {
  const ouvintes = new Map<string, Set<(evento: never) => void>>();
  const observadores = new Set<(estado: EstadoConexao) => void>();
  let estadoAtual: EstadoConexao = 'conectando';

  function definirEstado(proximo: EstadoConexao) {
    estadoAtual = proximo;
    observadores.forEach((o) => o(proximo));
  }

  function emitir(evento: NftAtualizado) {
    ouvintes.get('nft.updated')?.forEach((o) => (o as (e: NftAtualizado) => void)(evento));
  }

  function sortearEvento(): NftAtualizado | null {
    const candidatos = estado.nfts.filter((n) => n.edicoes.some((e) => e.disponivel > 0));
    if (candidatos.length === 0) return null;

    const nft = candidatos[Math.floor(Math.random() * candidatos.length)];
    const versao = proximaVersaoEvento();
    nft.versao = versao;

    return {
      eventoId: crypto.randomUUID(),
      versao,
      emitidoEm: new Date().toISOString(),
      nftId: nft.id,
      edicoes: nft.edicoes.map((edicao) => {
        const variacao = 1 + (Math.random() * 0.1 - 0.05);
        const novoPreco = (Number(edicao.precoEth) * variacao).toFixed(2);
        edicao.precoEth = novoPreco;
        return { id: edicao.id, precoEth: novoPreco, disponivel: edicao.disponivel };
      }),
    };
  }

  const abertura = setTimeout(() => definirEstado('conectado'), 400);

  const relogio = setInterval(() => {
    if (estadoAtual !== 'conectado') return;

    const evento = sortearEvento();
    if (!evento) return;

    if (cenarioEh('fora-de-ordem')) {
      const atrasado: NftAtualizado = {
        ...evento,
        eventoId: crypto.randomUUID(),
        versao: Math.max(1, evento.versao - 2),
      };
      emitir(atrasado);
      setTimeout(() => emitir(evento), 120);
      return;
    }

    emitir(evento);
  }, intervalo());

  return {
    escutar(evento, ouvinte) {
      const conjunto = ouvintes.get(evento) ?? new Set();
      conjunto.add(ouvinte as (evento: never) => void);
      ouvintes.set(evento, conjunto);
      return () => conjunto.delete(ouvinte as (evento: never) => void);
    },
    observarEstado(ouvinte) {
      observadores.add(ouvinte);
      ouvinte(estadoAtual);
      return () => observadores.delete(ouvinte);
    },
    identificar() {
      // sem servidor nao ha sala por usuario
    },
    encerrar() {
      clearTimeout(abertura);
      clearInterval(relogio);
      ouvintes.clear();
      observadores.clear();
      definirEstado('desconectado');
    },
  };
}
