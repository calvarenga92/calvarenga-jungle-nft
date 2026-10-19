/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do backend REST. Sem ela, o MSW assume e nem e carregado em producao com backend. */
  readonly VITE_API_URL?: string;
  /** URL do servidor Socket.IO. Sem ela, o simulador local assume. */
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
