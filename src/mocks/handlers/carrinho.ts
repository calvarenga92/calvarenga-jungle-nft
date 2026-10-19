import { http, HttpResponse } from 'msw';
import type { Cotacao, ItemCarrinho } from '@/api/tipos';
import { multiplicar, paraTexto, paraUnidades, percentual, somar, subtrair } from '@/lib/decimal';
import { atrasar, cenarioEh } from '../cenarios';
import { erro, falhaTransitoria, naoEncontrado, tokenDaRequisicao } from '../respostas';
import { carrinhoDe, contaDaSessao, estado, persistir } from '../store';
import { CUPONS } from '../dados/nfts';

const TAXA_REDE = '0.0042';

function localizar(nftId: string, edicaoId: string) {
  const nft = estado.nfts.find((n) => n.id === nftId);
  const edicao = nft?.edicoes.find((e) => e.id === edicaoId);
  return nft && edicao ? { nft, edicao } : null;
}

/** Reprojeta o item a partir do catalogo atual: preco e disponibilidade nunca ficam velhos. */
function sincronizar(item: ItemCarrinho): ItemCarrinho {
  const alvo = localizar(item.nftId, item.edicaoId);
  if (!alvo) return item;
  const { nft, edicao } = alvo;
  const quantidade = Math.min(item.quantidade, Math.max(edicao.disponivel, 0));
  return {
    ...item,
    titulo: nft.titulo,
    imagemUrl: nft.imagemUrl,
    rotuloEdicao: edicao.rotulo,
    quantidade,
    precoUnitarioEth: edicao.precoEth,
    subtotalEth: multiplicar(edicao.precoEth, quantidade),
    disponivel: edicao.disponivel,
    versaoNft: nft.versao,
  };
}

export function cotacaoAtual(token: string | null): Cotacao {
  const conta = contaDaSessao(token);
  const carrinho = carrinhoDe(conta);
  carrinho.itens = carrinho.itens.map(sincronizar);

  const subtotal = carrinho.itens.reduce(
    (acc, i) => somar(acc, i.subtotalEth), '0',
  );

  const regra = carrinho.cupom ? CUPONS[carrinho.cupom.codigo] : undefined;
  const desconto = regra && !regra.expirado ? percentual(subtotal, regra.percentual) : '0';
  const temItens = carrinho.itens.length > 0;
  const taxa = temItens ? TAXA_REDE : '0';
  const total = somar(subtrair(subtotal, desconto), taxa);

  // A versao resume preco, quantidade e cupom: qualquer mudanca invalida a cotacao no checkout.
  const impressao = [
    ...carrinho.itens.map((i) => `${i.edicaoId}:${i.quantidade}:${i.precoUnitarioEth}`),
    carrinho.cupom?.codigo ?? '-',
    cenarioEh('preco-alterado') ? 'alterado' : '-',
  ].join('|');

  return {
    itens: carrinho.itens,
    subtotalEth: paraTexto(paraUnidades(subtotal), 4),
    descontoEth: paraTexto(paraUnidades(desconto), 4),
    taxaRedeEth: taxa,
    totalEth: paraTexto(paraUnidades(total), 4),
    cupom: carrinho.cupom,
    versao: btoa(impressao).slice(0, 24),
    expiraEm: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}

export const handlersCarrinho = [
  http.get('/api/carrinho', async ({ request }) => {
    await atrasar();
    if (cenarioEh('erro-servidor')) return falhaTransitoria();
    return HttpResponse.json(cotacaoAtual(tokenDaRequisicao(request)));
  }),

  http.post('/api/carrinho/itens', async ({ request }) => {
    await atrasar();
    if (cenarioEh('erro-servidor')) return falhaTransitoria();

    const { nftId, edicaoId, quantidade = 1 } = (await request.json()) as {
      nftId: string; edicaoId: string; quantidade?: number;
    };

    const alvo = localizar(nftId, edicaoId);
    if (!alvo) return naoEncontrado('Edicao');
    const { nft, edicao } = alvo;

    const token = tokenDaRequisicao(request);
    const carrinho = carrinhoDe(contaDaSessao(token));
    const existente = carrinho.itens.find(
      (i) => i.nftId === nftId && i.edicaoId === edicaoId,
    );
    const total = (existente?.quantidade ?? 0) + quantidade;

    if (edicao.disponivel < total) {
      return erro(
        409, 'DISPONIBILIDADE_INSUFICIENTE',
        edicao.disponivel === 0
          ? 'Esta edição esgotou.'
          : `Restam ${edicao.disponivel} unidades desta edição.`,
      );
    }
    if (total > edicao.limitePorPedido) {
      return erro(
        422, 'DADOS_INVALIDOS',
        `Limite de ${edicao.limitePorPedido} unidades por pedido.`,
      );
    }

    if (existente) existente.quantidade = total;
    else {
      carrinho.itens.push(sincronizar({
        id: `it-${crypto.randomUUID().slice(0, 8)}`,
        nftId, edicaoId,
        titulo: nft.titulo, imagemUrl: nft.imagemUrl, rotuloEdicao: edicao.rotulo,
        quantidade, precoUnitarioEth: edicao.precoEth, subtotalEth: '0',
        disponivel: edicao.disponivel, versaoNft: nft.versao,
      }));
    }
    persistir();
    return HttpResponse.json(cotacaoAtual(token), { status: 201 });
  }),

  http.patch('/api/carrinho/itens/:id', async ({ params, request }) => {
    await atrasar();
    const { quantidade } = (await request.json()) as { quantidade: number };
    const token = tokenDaRequisicao(request);
    const carrinho = carrinhoDe(contaDaSessao(token));

    const item = carrinho.itens.find((i) => i.id === params.id);
    if (!item) return naoEncontrado('Item');

    const alvo = localizar(item.nftId, item.edicaoId);
    if (alvo && alvo.edicao.disponivel < quantidade) {
      return erro(
        409, 'DISPONIBILIDADE_INSUFICIENTE',
        `Restam ${alvo.edicao.disponivel} unidades desta edição.`,
      );
    }

    if (quantidade <= 0) {
      carrinho.itens = carrinho.itens.filter((i) => i.id !== params.id);
    } else {
      item.quantidade = quantidade;
    }
    persistir();
    return HttpResponse.json(cotacaoAtual(token));
  }),

  http.delete('/api/carrinho/itens/:id', async ({ params, request }) => {
    await atrasar();
    const token = tokenDaRequisicao(request);
    const carrinho = carrinhoDe(contaDaSessao(token));
    carrinho.itens = carrinho.itens.filter((i) => i.id !== params.id);
    persistir();
    return HttpResponse.json(cotacaoAtual(token));
  }),

  http.post('/api/carrinho/cupom', async ({ request }) => {
    await atrasar();
    const { codigo } = (await request.json()) as { codigo: string };
    const normalizado = (codigo ?? '').trim().toUpperCase();

    const regra = CUPONS[normalizado];
    if (!regra || cenarioEh('cupom-invalido')) {
      return erro(422, 'CUPOM_INVALIDO', 'Cupom não encontrado.');
    }
    if (regra.expirado) {
      return erro(422, 'CUPOM_EXPIRADO', 'Este cupom expirou.');
    }

    const token = tokenDaRequisicao(request);
    carrinhoDe(contaDaSessao(token)).cupom = {
      codigo: normalizado,
      descricaoDesconto: `${regra.percentual}% de desconto`,
    };
    persistir();
    return HttpResponse.json(cotacaoAtual(token));
  }),

  http.delete('/api/carrinho/cupom', async ({ request }) => {
    await atrasar();
    const token = tokenDaRequisicao(request);
    carrinhoDe(contaDaSessao(token)).cupom = null;
    persistir();
    return HttpResponse.json(cotacaoAtual(token));
  }),
];
