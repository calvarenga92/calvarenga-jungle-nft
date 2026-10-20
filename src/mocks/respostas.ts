import { HttpResponse } from 'msw';
import type { CodigoErro } from '@/api/tipos';

export function erro(
  status: number,
  codigo: CodigoErro,
  mensagem: string,
  campos?: Record<string, string>,
) {
  return HttpResponse.json({ codigo, mensagem, campos }, { status });
}

export const naoAutenticado = () =>
  erro(401, 'NAO_AUTENTICADO', 'Entre na sua conta para continuar.');

export const sessaoExpirada = () =>
  erro(401, 'SESSAO_EXPIRADA', 'Sua sessão expirou. Entre novamente.');

export const naoEncontrado = (o: string) =>
  erro(404, 'NAO_ENCONTRADO', `${o} não encontrado.`);

export const falhaTransitoria = () =>
  erro(500, 'FALHA_TRANSITORIA', 'Serviço indisponível no momento.');

export function tokenDaRequisicao(req: Request): string | null {
  const header = req.headers.get('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}
