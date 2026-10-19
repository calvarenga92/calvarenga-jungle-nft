import type {
  Carrinho, Carteira, Cupom, ItemCarrinho, Nft, Pedido, Usuario,
} from '@/api/tipos';
import { NFTS, USUARIOS } from './dados/nfts';

export interface ContaSimulada {
  usuario: Usuario & { senha: string };
  favoritos: Set<string>;
  carrinho: Carrinho;
  carteiras: Carteira[];
}

export interface Estado {
  nfts: Nft[];
  contas: Record<string, ContaSimulada>;
  sessoes: Record<string, { usuarioId: string; expiraEm: number }>;
  carrinhoVisitante: Carrinho;
  pedidos: Record<string, Pedido>;
  idempotencia: Record<string, { pedidoId: string; impressao: string }>;
  sequenciaEvento: number;
}

const CHAVE = 'greenmint.mock.estado';

function carrinhoVazio(): Carrinho {
  return { itens: [], cupom: null };
}

function contaInicial(base: (typeof USUARIOS)[number]): ContaSimulada {
  return {
    usuario: { ...base },
    favoritos: new Set<string>(),
    carrinho: carrinhoVazio(),
    carteiras: [
      {
        id: `${base.id}-w1`,
        apelido: 'Principal',
        endereco: '0x7A3f9C21d4B8e5F06aC1b2E93D847fA50cB61d29',
        rede: 'ethereum',
        principal: true,
      },
    ],
  };
}

export function estadoInicial(): Estado {
  return {
    nfts: structuredClone(NFTS),
    contas: Object.fromEntries(USUARIOS.map((u) => [u.id, contaInicial(u)])),
    sessoes: {},
    carrinhoVisitante: carrinhoVazio(),
    pedidos: {},
    idempotencia: {},
    sequenciaEvento: 0,
  };
}

export let estado: Estado = estadoInicial();

/** Serializacao manual: Set nao sobrevive a JSON. */
function serializar(e: Estado): string {
  return JSON.stringify({
    ...e,
    contas: Object.fromEntries(
      Object.entries(e.contas).map(([id, c]) => [
        id, { ...c, favoritos: [...c.favoritos] },
      ]),
    ),
  });
}

function desserializar(texto: string): Estado {
  const bruto = JSON.parse(texto) as Estado & {
    contas: Record<string, Omit<ContaSimulada, 'favoritos'> & { favoritos: string[] }>;
  };
  return {
    ...bruto,
    contas: Object.fromEntries(
      Object.entries(bruto.contas).map(([id, c]) => [
        id, { ...c, favoritos: new Set(c.favoritos) },
      ]),
    ),
  };
}

export function persistir(): void {
  try {
    localStorage.setItem(CHAVE, serializar(estado));
  } catch {
    // storage indisponivel: o cenario vive apenas em memoria
  }
}

export function restaurar(): void {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (texto) estado = desserializar(texto);
  } catch {
    estado = estadoInicial();
  }
}

/** Reset restaura integralmente o cenario conhecido. */
export function resetar(): void {
  estado = estadoInicial();
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
}

export function proximaVersaoEvento(): number {
  estado.sequenciaEvento += 1;
  return estado.sequenciaEvento;
}

export function contaDaSessao(token: string | null): ContaSimulada | null {
  if (!token) return null;
  const sessao = estado.sessoes[token];
  if (!sessao || sessao.expiraEm < Date.now()) return null;
  return estado.contas[sessao.usuarioId] ?? null;
}

export function carrinhoDe(conta: ContaSimulada | null): Carrinho {
  return conta ? conta.carrinho : estado.carrinhoVisitante;
}

/** Itens do visitante sao preservados ao autenticar. */
export function mesclarCarrinhoVisitante(conta: ContaSimulada): void {
  for (const item of estado.carrinhoVisitante.itens) {
    const existente = conta.carrinho.itens.find(
      (i) => i.nftId === item.nftId && i.edicaoId === item.edicaoId,
    );
    if (existente) existente.quantidade += item.quantidade;
    else conta.carrinho.itens.push({ ...item });
  }
  if (!conta.carrinho.cupom && estado.carrinhoVisitante.cupom) {
    conta.carrinho.cupom = estado.carrinhoVisitante.cupom;
  }
  estado.carrinhoVisitante = carrinhoVazio();
}

export type { Carrinho, Cupom, ItemCarrinho };
