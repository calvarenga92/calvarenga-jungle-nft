import { http, HttpResponse } from 'msw';
import type { ItemPedido, Pedido } from '@/api/tipos';
import { atrasar, cenarioEh } from '../cenarios';
import { erro, naoAutenticado, naoEncontrado, tokenDaRequisicao } from '../respostas';
import { contaDaSessao, estado, persistir, proximaVersaoEvento } from '../store';
import { cotacaoAtual } from './carrinho';

function baixarEstoque(itens: ItemPedido[]): void {
  for (const item of itens) {
    const nft = estado.nfts.find((n) => n.id === item.nftId);
    const edicao = nft?.edicoes.find((e) => e.id === item.edicaoId);
    if (!nft || !edicao) continue;
    edicao.disponivel = Math.max(0, edicao.disponivel - item.quantidade);
    nft.versao = proximaVersaoEvento();
  }
}

export const handlersPedidos = [
  http.post('/api/pedidos', async ({ request }) => {
    const token = tokenDaRequisicao(request);
    const conta = contaDaSessao(token);
    if (!conta) return naoAutenticado();

    const chave = request.headers.get('Idempotency-Key');
    if (!chave) {
      return erro(422, 'DADOS_INVALIDOS', 'Idempotency-Key e obrigatoria.');
    }

    const corpo = (await request.json()) as {
      versaoCotacao: string; carteiraId: string;
    };

    const impressao = JSON.stringify(corpo);
    const registrado = estado.idempotencia[chave];
    if (registrado) {
      // Mesma chave e mesmo corpo: devolve o pedido original em vez de criar outro.
      if (registrado.impressao !== impressao) {
        return erro(
          409, 'CHAVE_IDEMPOTENCIA_CONFLITANTE',
          'Esta chave foi usada com outro conteudo.',
        );
      }
      await atrasar();
      return HttpResponse.json(estado.pedidos[registrado.pedidoId]);
    }

    if (cenarioEh('timeout-pedido')) {
      await new Promise((r) => setTimeout(r, 15000));
    }
    await atrasar();

    const cotacao = cotacaoAtual(token);
    if (cotacao.itens.length === 0) {
      return erro(422, 'DADOS_INVALIDOS', 'O carrinho esta vazio.');
    }
    if (corpo.versaoCotacao !== cotacao.versao) {
      return erro(
        409, 'COTACAO_DESATUALIZADA',
        'Os valores do carrinho mudaram. Confira o resumo antes de confirmar.',
      );
    }

    const indisponivel = cotacao.itens.find((i) => i.disponivel < i.quantidade);
    if (indisponivel) {
      return erro(
        409, 'DISPONIBILIDADE_INSUFICIENTE',
        `"${indisponivel.titulo}" nao tem a quantidade pedida.`,
      );
    }

    const carteira = conta.carteiras.find((c) => c.id === corpo.carteiraId)
      ?? conta.carteiras.find((c) => c.principal);
    if (!carteira) {
      return erro(422, 'DADOS_INVALIDOS', 'Cadastre uma carteira para concluir.');
    }

    const recusado = cenarioEh('pagamento-recusado');
    const agora = new Date().toISOString();
    const id = `ped-${crypto.randomUUID().slice(0, 8)}`;

    const itens: ItemPedido[] = cotacao.itens.map((i) => ({
      nftId: i.nftId, edicaoId: i.edicaoId, titulo: i.titulo,
      imagemUrl: i.imagemUrl, rotuloEdicao: i.rotuloEdicao,
      quantidade: i.quantidade, precoUnitarioEth: i.precoUnitarioEth,
      subtotalEth: i.subtotalEth,
    }));

    const pedido: Pedido = {
      id,
      status: recusado ? 'RECUSADO' : 'CONFIRMADO',
      itens,
      subtotalEth: cotacao.subtotalEth,
      descontoEth: cotacao.descontoEth,
      taxaRedeEth: cotacao.taxaRedeEth,
      totalEth: cotacao.totalEth,
      cupom: cotacao.cupom,
      carteira: {
        apelido: carteira.apelido, endereco: carteira.endereco, rede: carteira.rede,
      },
      referenciaTransacao: recusado ? null : `0x${crypto.randomUUID().replace(/-/g, '')}`,
      motivoRecusa: recusado ? 'A carteira recusou a transacao.' : null,
      criadoEm: agora,
      atualizadoEm: agora,
      versao: proximaVersaoEvento(),
    };

    estado.pedidos[id] = pedido;
    estado.idempotencia[chave] = { pedidoId: id, impressao };

    if (!recusado) {
      baixarEstoque(itens);
      conta.carrinho = { itens: [], cupom: null };
    }
    persistir();

    return HttpResponse.json(pedido, { status: 201 });
  }),

  http.get('/api/pedidos', async ({ request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const lista = Object.values(estado.pedidos)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return HttpResponse.json(lista);
  }),

  http.get('/api/pedidos/:id', async ({ params, request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const pedido = estado.pedidos[String(params.id)];
    if (!pedido) return naoEncontrado('Pedido');
    return HttpResponse.json(pedido);
  }),
];
