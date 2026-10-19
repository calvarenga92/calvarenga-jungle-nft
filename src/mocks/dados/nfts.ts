import type { Nft } from '@/api/tipos';

const COLECOES = [
  { id: 'apes', nome: 'Golden Apes' },
  { id: 'punks', nome: 'Neon Punks' },
  { id: 'relics', nome: 'Ancient Relics' },
  { id: 'voxels', nome: 'Voxel Dreams' },
] as const;

const AUTORES = ['0xLumen', 'MintaStudio', 'Kael', 'Nova Works'];

/** Precos em string decimal: nunca passam por ponto flutuante. */
const PRECOS = [
  '0.42', '1.15', '2.80', '0.09', '3.50', '0.75',
  '1.90', '0.33', '5.20', '0.68', '2.05', '0.17',
];

function imagem(indice: number): string {
  return `/nfts/nft-${String((indice % 12) + 1).padStart(2, "0")}.svg`;
}

export const NFTS: Nft[] = Array.from({ length: 24 }, (_, i) => {
  const colecao = COLECOES[i % COLECOES.length];
  const preco = PRECOS[i % PRECOS.length];
  const esgotado = i === 7 || i === 18;

  return {
    id: `nft-${String(i + 1).padStart(3, '0')}`,
    slug: `${colecao.id}-${i + 1}`,
    titulo: `${colecao.nome.split(' ')[0]} #${100 + i}`,
    imagemUrl: imagem(i),
    autor: AUTORES[i % AUTORES.length],
    colecao: { ...colecao },
    precoMinimoEth: preco,
    favorito: false,
    versao: 1,
    descricao:
      'Peca original da colecao, cunhada em edicao limitada com metadados verificados na simulacao.',
    galeria: [imagem(i), imagem(i + 1), imagem(i + 2)],
    edicoes: [
      {
        id: `${i + 1}-padrao`,
        rotulo: 'Padrao',
        precoEth: preco,
        disponivel: esgotado ? 0 : 3 + (i % 5),
        limitePorPedido: 3,
      },
      {
        id: `${i + 1}-rara`,
        rotulo: 'Rara',
        precoEth: (Number(preco) * 2.5).toFixed(2),
        disponivel: esgotado ? 0 : 1 + (i % 2),
        limitePorPedido: 1,
      },
    ],
    atributos: [
      { nome: 'Raridade', valor: i % 3 === 0 ? 'Lendaria' : 'Comum' },
      { nome: 'Fundo', valor: ['Ambar', 'Carvao', 'Esmeralda'][i % 3] },
      { nome: 'Cunhagem', valor: `2026-0${(i % 9) + 1}` },
    ],
  };
});

export const CUPONS: Record<string, { percentual: number; expirado: boolean }> = {
  GREENMINT10: { percentual: 10, expirado: false },
  COLECIONADOR20: { percentual: 20, expirado: false },
  EXPIRADO50: { percentual: 50, expirado: true },
};

export const USUARIOS = [
  {
    id: 'usr-1',
    nome: 'Claudio Alvarenga',
    email: 'claudio@greenmint.test',
    senha: 'senha12345',
    avatarUrl: null,
  },
  {
    id: 'usr-2',
    nome: 'Marina Rocha',
    email: 'marina@greenmint.test',
    senha: 'senha12345',
    avatarUrl: null,
  },
];

export { COLECOES };
