/**
 * Servidor de eventos para desenvolvimento.
 *
 * Existe para provar que o caminho real do socket.io-client funciona, e não só
 * o simulador local. Rodo com `npm run eventos` e aponto a aplicação com
 * VITE_SOCKET_URL=http://localhost:3001.
 *
 * Emite o mesmo contrato de `src/api/eventos.ts`. Com --fora-de-ordem manda
 * de propósito um evento com versão anterior antes do atual, para a proteção
 * por versão do cliente ser exercitada contra frames de verdade.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';

const PORTA = Number(process.env.PORTA ?? 3001);
const INTERVALO_MS = Number(process.env.INTERVALO ?? 4000);
const FORA_DE_ORDEM = process.argv.includes('--fora-de-ordem');

const IDS = Array.from({ length: 24 }, (_, i) => `nft-${String(i + 1).padStart(3, '0')}`);

// começa alto de propósito: um servidor real está sempre à frente do cliente
let versao = 1000;

const precos = new Map(IDS.map((id, i) => [id, (0.2 + i * 0.21).toFixed(2)]));

const http = createServer();
const io = new Server(http, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`[eventos] cliente conectado: ${socket.id}`);

  socket.on('session.identify', ({ usuarioId }) => {
    if (usuarioId) socket.join(`usuario:${usuarioId}`);
    console.log(`[eventos] identificado como ${usuarioId ?? 'visitante'}`);
  });

  socket.on('disconnect', (motivo) => {
    console.log(`[eventos] desconectado: ${socket.id} (${motivo})`);
  });
});

function proximoEvento() {
  const nftId = IDS[Math.floor(Math.random() * IDS.length)];

  const atual = Number(precos.get(nftId));
  const novo = Math.max(0.01, atual * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2);
  precos.set(nftId, novo);

  versao += 1;

  return {
    eventoId: randomUUID(),
    versao,
    emitidoEm: new Date().toISOString(),
    nftId,
    edicoes: [
      { id: `${Number(nftId.slice(4))}-padrao`, precoEth: novo, disponivel: 3 },
      { id: `${Number(nftId.slice(4))}-rara`, precoEth: (Number(novo) * 2.5).toFixed(2), disponivel: 1 },
    ],
  };
}

setInterval(() => {
  const evento = proximoEvento();

  if (FORA_DE_ORDEM) {
    const atrasado = { ...evento, eventoId: randomUUID(), versao: evento.versao - 3 };
    io.emit('nft.updated', atrasado);
    setTimeout(() => io.emit('nft.updated', evento), 120);
    console.log(`[eventos] ${evento.nftId} -> ${evento.edicoes[0].precoEth} ETH ` +
      `(v${atrasado.versao} atrasado, depois v${evento.versao})`);
    return;
  }

  io.emit('nft.updated', evento);
  console.log(`[eventos] ${evento.nftId} -> ${evento.edicoes[0].precoEth} ETH (v${evento.versao})`);
}, INTERVALO_MS);

http.listen(PORTA, () => {
  console.log(`[eventos] ouvindo em http://localhost:${PORTA}`);
  console.log(`[eventos] intervalo ${INTERVALO_MS}ms${FORA_DE_ORDEM ? ', emitindo fora de ordem' : ''}`);
  console.log('[eventos] aponte a aplicação com VITE_SOCKET_URL=http://localhost:' + PORTA);
});
