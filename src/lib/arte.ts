/**
 * Cor dominante de cada arte em public/nfts. O cartão mistura essa cor com a
 * superfície do tema ativo (utilitário `tingido`), então a interface puxa a
 * cor da peça sem perder o contraste do texto em nenhum dos três temas.
 */
const TINTAS: Record<string, string> = {
  'nft-01': '#2fd39a',
  'nft-02': '#b9c27a',
  'nft-03': '#ff3d9e',
  'nft-04': '#ff7a59',
  'nft-05': '#7b5cff',
  'nft-06': '#e0915f',
  'nft-07': '#ffb800',
  'nft-08': '#e8b54a',
  'nft-09': '#00c2b8',
  'nft-10': '#ff9a2e',
  'nft-11': '#5b6bff',
  'nft-12': '#ff2e4d',
};

export function tintaDaArte(imagemUrl: string): string | undefined {
  const nome = imagemUrl.match(/nft-\d{2}/)?.[0];
  return nome ? TINTAS[nome] : undefined;
}
