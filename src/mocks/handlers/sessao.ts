import { http, HttpResponse } from 'msw';
import type { Sessao } from '@/api/tipos';
import { atrasar, cenarioEh } from '../cenarios';
import { erro, falhaTransitoria, sessaoExpirada, tokenDaRequisicao } from '../respostas';
import {
  contaDaSessao, estado, mesclarCarrinhoVisitante, persistir,
} from '../store';

const DURACAO_MS = 60 * 60 * 1000;

function novaSessao(usuarioId: string): { token: string; sessao: Sessao } {
  const token = `tok-${crypto.randomUUID()}`;
  const expiraEm = Date.now() + (cenarioEh('sessao-expirada') ? -1000 : DURACAO_MS);
  estado.sessoes[token] = { usuarioId, expiraEm };
  persistir();

  const { senha: _senha, ...usuario } = estado.contas[usuarioId].usuario;
  return { token, sessao: { usuario, expiraEm: new Date(expiraEm).toISOString() } };
}

export const handlersSessao = [
  http.post('/api/sessao', async ({ request }) => {
    await atrasar();
    if (cenarioEh('erro-servidor')) return falhaTransitoria();

    const { email, senha } = (await request.json()) as { email?: string; senha?: string };
    const campos: Record<string, string> = {};
    if (!email?.trim()) campos.email = 'Informe o e-mail.';
    if (!senha) campos.senha = 'Informe a senha.';
    if (Object.keys(campos).length > 0) {
      return erro(422, 'DADOS_INVALIDOS', 'Revise os campos destacados.', campos);
    }

    const conta = Object.values(estado.contas).find(
      (c) => c.usuario.email.toLowerCase() === email!.trim().toLowerCase(),
    );

    // Resposta identica para e-mail inexistente e senha errada: nao revela quem tem conta.
    if (!conta || conta.usuario.senha !== senha) {
      return erro(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }

    mesclarCarrinhoVisitante(conta);
    const { token, sessao } = novaSessao(conta.usuario.id);
    return HttpResponse.json({ token, ...sessao });
  }),

  http.post('/api/contas', async ({ request }) => {
    await atrasar();
    const { nome, email, senha } = (await request.json()) as Record<string, string>;

    const campos: Record<string, string> = {};
    if (!nome?.trim()) campos.nome = 'Informe seu nome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? '')) campos.email = 'E-mail inválido.';
    if ((senha ?? '').length < 8) campos.senha = 'Use ao menos 8 caracteres.';
    if (Object.keys(campos).length > 0) {
      return erro(422, 'DADOS_INVALIDOS', 'Revise os campos destacados.', campos);
    }

    const existe = Object.values(estado.contas).some(
      (c) => c.usuario.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (existe) return erro(409, 'EMAIL_JA_CADASTRADO', 'Já existe conta com esse e-mail.');

    const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
    estado.contas[id] = {
      usuario: { id, nome: nome.trim(), email: email.trim(), avatarUrl: null, senha },
      favoritos: new Set<string>(),
      carrinho: { itens: [], cupom: null },
      carteiras: [],
    };

    mesclarCarrinhoVisitante(estado.contas[id]);
    const { token, sessao } = novaSessao(id);
    return HttpResponse.json({ token, ...sessao }, { status: 201 });
  }),

  http.get('/api/sessao', async ({ request }) => {
    await atrasar();
    const token = tokenDaRequisicao(request);
    if (!token) return HttpResponse.json(null, { status: 204 });

    const registro = estado.sessoes[token];
    if (registro && registro.expiraEm < Date.now()) return sessaoExpirada();

    const conta = contaDaSessao(token);
    if (!conta) return sessaoExpirada();

    const { senha: _senha, ...usuario } = conta.usuario;
    return HttpResponse.json({
      usuario,
      expiraEm: new Date(registro.expiraEm).toISOString(),
    } satisfies Sessao);
  }),

  http.delete('/api/sessao', async ({ request }) => {
    await atrasar();
    const token = tokenDaRequisicao(request);
    if (token) delete estado.sessoes[token];
    persistir();
    return new HttpResponse(null, { status: 204 });
  }),
];
