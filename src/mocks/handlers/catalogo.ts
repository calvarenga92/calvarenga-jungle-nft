import { http, HttpResponse } from 'msw';
import type { FaixaPreco, Nft, NftResumo, Pagina } from '@/api/tipos';
import { paraUnidades } from '@/lib/decimal';
import { atrasar, cenarioEh } from '../cenarios';
import { falhaTransitoria, naoEncontrado, tokenDaRequisicao } from '../respostas';
import { contaDaSessao, estado, persistir } from '../store';
import { COLECOES } from '../dados/nfts';

function resumir(nft: Nft, favoritos: Set<string>): NftResumo {
  const precos = nft.edicoes.map((e) => e.precoEth);
  const minimo = precos.reduce((a, b) => (paraUnidades(a) <= paraUnidades(b) ? a : b));
  return {
    id: nft.id,
    slug: nft.slug,
    titulo: nft.titulo,
    imagemUrl: nft.imagemUrl,
    autor: nft.autor,
    colecao: nft.colecao,
    precoMinimoEth: minimo,
    favorito: favoritos.has(nft.id),
    versao: nft.versao,
  };
}

function disponivel(nft: Nft): boolean {
  return nft.edicoes.some((e) => e.disponivel > 0);
}

export const handlersCatalogo = [
  http.get('/api/colecoes', async () => {
    await atrasar();
    return HttpResponse.json(COLECOES);
  }),

  http.get('/api/nfts', async ({ request }) => {
    await atrasar();
    if (cenarioEh('erro-servidor')) return falhaTransitoria();

    const url = new URL(request.url);
    const conta = contaDaSessao(tokenDaRequisicao(request));
    const favoritos = conta?.favoritos ?? new Set<string>();

    const busca = (url.searchParams.get('busca') ?? '').trim().toLowerCase();
    const colecoes = url.searchParams.getAll('colecao');
    const precoMin = url.searchParams.get('precoMin');
    const precoMax = url.searchParams.get('precoMax');
    const somenteDisponiveis = url.searchParams.get('somenteDisponiveis') === 'true';
    const ordenacao = url.searchParams.get('ordenacao') ?? 'recentes';
    const pagina = Number(url.searchParams.get('pagina') ?? '1');
    const porPagina = Number(url.searchParams.get('porPagina') ?? '8');

    let itens = cenarioEh('lista-vazia') ? [] : [...estado.nfts];

    if (busca) {
      itens = itens.filter(
        (n) =>
          n.titulo.toLowerCase().includes(busca) ||
          n.autor.toLowerCase().includes(busca) ||
          n.colecao.nome.toLowerCase().includes(busca),
      );
    }
    if (colecoes.length > 0) itens = itens.filter((n) => colecoes.includes(n.colecao.id));
    if (somenteDisponiveis) itens = itens.filter(disponivel);

    const resumos = itens.map((n) => resumir(n, favoritos));
    let filtrados = resumos;
    if (precoMin) {
      filtrados = filtrados.filter(
        (n) => paraUnidades(n.precoMinimoEth) >= paraUnidades(precoMin),
      );
    }
    if (precoMax) {
      filtrados = filtrados.filter(
        (n) => paraUnidades(n.precoMinimoEth) <= paraUnidades(precoMax),
      );
    }

    filtrados.sort((a, b) => {
      if (ordenacao === 'preco-asc') {
        return Number(paraUnidades(a.precoMinimoEth) - paraUnidades(b.precoMinimoEth));
      }
      if (ordenacao === 'preco-desc') {
        return Number(paraUnidades(b.precoMinimoEth) - paraUnidades(a.precoMinimoEth));
      }
      if (ordenacao === 'populares') return a.titulo.localeCompare(b.titulo);
      return 0;
    });

    const total = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const inicio = (pagina - 1) * porPagina;

    const resposta: Pagina<NftResumo> = {
      itens: filtrados.slice(inicio, inicio + porPagina),
      pagina,
      porPagina,
      total,
      totalPaginas,
    };
    return HttpResponse.json(resposta);
  }),

  // precisa vir antes de /nfts/:id, senao "faixa" e tratado como id
  http.get('/api/nfts/faixa', async () => {
    await atrasar();

    const precos = estado.nfts.map((nft) =>
      nft.edicoes.map((e) => e.precoEth).reduce((a, b) =>
        paraUnidades(a) <= paraUnidades(b) ? a : b),
    );

    const ordenados = [...precos].sort((a, b) =>
      Number(paraUnidades(a) - paraUnidades(b)));

    return HttpResponse.json({
      minimo: ordenados.at(0) ?? '0',
      maximo: ordenados.at(-1) ?? '0',
    } satisfies FaixaPreco);
  }),

  http.get('/api/nfts/:id', async ({ params, request }) => {
    await atrasar();
    if (cenarioEh('erro-servidor')) return falhaTransitoria();

    const nft = estado.nfts.find((n) => n.id === params.id || n.slug === params.id);
    if (!nft) return naoEncontrado('NFT');

    const conta = contaDaSessao(tokenDaRequisicao(request));
    return HttpResponse.json({ ...nft, favorito: conta?.favoritos.has(nft.id) ?? false });
  }),

  http.get('/api/favoritos', async ({ request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return HttpResponse.json([]);
    const favoritos = estado.nfts
      .filter((n) => conta.favoritos.has(n.id))
      .map((n) => resumir(n, conta.favoritos));
    return HttpResponse.json(favoritos);
  }),

  http.put('/api/favoritos/:id', async ({ params, request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return HttpResponse.json({ codigo: 'NAO_AUTENTICADO' }, { status: 401 });
    if (cenarioEh('erro-servidor')) return falhaTransitoria();

    conta.favoritos.add(String(params.id));
    persistir();
    return HttpResponse.json({ favorito: true });
  }),

  http.delete('/api/favoritos/:id', async ({ params, request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return HttpResponse.json({ codigo: 'NAO_AUTENTICADO' }, { status: 401 });

    conta.favoritos.delete(String(params.id));
    persistir();
    return HttpResponse.json({ favorito: false });
  }),
];
