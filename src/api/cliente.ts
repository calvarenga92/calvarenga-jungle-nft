import axios, { AxiosError } from 'axios';
import type { CodigoErro, CorpoErro } from './tipos';
import { lerToken, limparToken } from '@/lib/token';

export const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 12000,
});

cliente.interceptors.request.use((config) => {
  const token = lerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Erro de aplicação: o front decide pelo código, nunca pelo texto da mensagem. */
export class ErroApi extends Error {
  readonly codigo: CodigoErro;
  readonly status: number;
  readonly campos?: Record<string, string>;

  constructor(corpo: CorpoErro, status: number) {
    super(corpo.mensagem);
    this.name = 'ErroApi';
    this.codigo = corpo.codigo;
    this.status = status;
    this.campos = corpo.campos;
  }
}

function normalizar(erro: unknown): ErroApi {
  const axiosErro = erro as AxiosError<CorpoErro>;

  if (axiosErro.response?.data?.codigo) {
    return new ErroApi(axiosErro.response.data, axiosErro.response.status);
  }
  if (axiosErro.code === 'ECONNABORTED' || !axiosErro.response) {
    return new ErroApi(
      { codigo: 'SEM_CONEXAO', mensagem: 'Não foi possível falar com o servidor.' },
      0,
    );
  }
  return new ErroApi(
    { codigo: 'ERRO_DESCONHECIDO', mensagem: 'Algo deu errado. Tente de novo.' },
    axiosErro.response.status,
  );
}

cliente.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const normalizado = normalizar(erro);
    if (normalizado.codigo === 'SESSAO_EXPIRADA') limparToken();
    return Promise.reject(normalizado);
  },
);
