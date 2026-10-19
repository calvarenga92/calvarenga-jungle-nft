import { handlersCarrinho } from './carrinho';
import { handlersCatalogo } from './catalogo';
import { handlersPedidos } from './pedidos';
import { handlersPerfil } from './perfil';
import { handlersSessao } from './sessao';

export const handlers = [
  ...handlersSessao,
  ...handlersCatalogo,
  ...handlersCarrinho,
  ...handlersPedidos,
  ...handlersPerfil,
];
