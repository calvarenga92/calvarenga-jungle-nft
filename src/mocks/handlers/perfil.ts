import { http, HttpResponse } from 'msw';
import type { Carteira, RedeCarteira } from '@/api/tipos';
import { atrasar } from '../cenarios';
import { erro, naoAutenticado, naoEncontrado, tokenDaRequisicao } from '../respostas';
import { contaDaSessao, persistir } from '../store';

const ENDERECO = /^0x[a-fA-F0-9]{40}$/;
const REDES: RedeCarteira[] = ['ethereum', 'polygon', 'arbitrum'];

export const handlersPerfil = [
  http.patch('/api/perfil', async ({ request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const { nome } = (await request.json()) as { nome?: string };
    if (!nome?.trim()) {
      return erro(422, 'DADOS_INVALIDOS', 'Revise os campos destacados.', {
        nome: 'Informe seu nome.',
      });
    }

    conta.usuario.nome = nome.trim();
    persistir();
    const { senha: _senha, ...usuario } = conta.usuario;
    return HttpResponse.json(usuario);
  }),

  http.get('/api/carteiras', async ({ request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();
    return HttpResponse.json(conta.carteiras);
  }),

  http.post('/api/carteiras', async ({ request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const { apelido, endereco, rede } = (await request.json()) as Record<string, string>;
    const campos: Record<string, string> = {};
    if (!apelido?.trim()) campos.apelido = 'Informe um apelido.';
    if (!ENDERECO.test(endereco ?? '')) campos.endereco = 'Endereço deve ter 0x e mais 40 caracteres.';
    if (!REDES.includes(rede as RedeCarteira)) campos.rede = 'Selecione uma rede.';
    if (conta.carteiras.some((c) => c.endereco.toLowerCase() === endereco?.toLowerCase())) {
      campos.endereco = 'Esta carteira já está cadastrada.';
    }
    if (Object.keys(campos).length > 0) {
      return erro(422, 'DADOS_INVALIDOS', 'Revise os campos destacados.', campos);
    }

    const carteira: Carteira = {
      id: `w-${crypto.randomUUID().slice(0, 8)}`,
      apelido: apelido.trim(),
      endereco,
      rede: rede as RedeCarteira,
      principal: conta.carteiras.length === 0,
    };
    conta.carteiras.push(carteira);
    persistir();
    return HttpResponse.json(carteira, { status: 201 });
  }),

  http.put('/api/carteiras/:id/principal', async ({ params, request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const alvo = conta.carteiras.find((c) => c.id === params.id);
    if (!alvo) return naoEncontrado('Carteira');

    conta.carteiras.forEach((c) => { c.principal = c.id === alvo.id; });
    persistir();
    return HttpResponse.json(conta.carteiras);
  }),

  http.delete('/api/carteiras/:id', async ({ params, request }) => {
    await atrasar();
    const conta = contaDaSessao(tokenDaRequisicao(request));
    if (!conta) return naoAutenticado();

    const removida = conta.carteiras.find((c) => c.id === params.id);
    if (!removida) return naoEncontrado('Carteira');

    conta.carteiras = conta.carteiras.filter((c) => c.id !== params.id);
    if (removida.principal && conta.carteiras.length > 0) {
      conta.carteiras[0].principal = true;
    }
    persistir();
    return HttpResponse.json(conta.carteiras);
  }),
];
