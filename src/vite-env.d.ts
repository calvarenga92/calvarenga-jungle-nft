/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do servidor Socket.IO. Sem ela, o simulador local assume. */
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
