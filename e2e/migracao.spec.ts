import { expect, test } from '@playwright/test';
import { adicionarPrimeiraPeca, aguardarCatalogo, cartoes, limparEstado } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

/**
 * Quem visitou antes da troca das artes tem o estado do mock salvo com
 * endereços .svg, que não existem mais. O catálogo precisa abrir sem imagem quebrada.
 */
test('estado salvo com as artes antigas abre sem imagem quebrada', async ({ page }) => {
  // o estado só é salvo depois de uma ação; o carrinho guarda a imagem da peça também
  await adicionarPrimeiraPeca(page);
  await page.goto('/');
  await aguardarCatalogo(page);

  // simula o visitante antigo: mesmo estado, endereços da versão anterior
  await page.evaluate(() => {
    const chave = 'kurio.mock.estado';
    const atual = localStorage.getItem(chave);
    if (!atual) throw new Error('estado do mock não foi salvo');
    localStorage.setItem(chave, atual.replace(/(\/nfts\/nft-\d{2})\.png/g, '$1.svg'));
  });

  await page.reload();
  await aguardarCatalogo(page);

  const imagens = cartoes(page).locator('img');
  await expect(imagens.first()).toBeVisible();
  const enderecos = await imagens.evaluateAll((lista) =>
    lista.map((img) => (img as HTMLImageElement).getAttribute('src') ?? ''),
  );
  expect(enderecos.length).toBeGreaterThan(0);
  expect(enderecos.every((src) => src.endsWith('.png'))).toBe(true);

  await expect
    .poll(() => imagens.evaluateAll((lista) =>
      lista.every((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);

  // a imagem guardada no carrinho também foi migrada
  await page.goto('/carrinho');
  const noCarrinho = page.locator('main img').first();
  await expect(noCarrinho).toHaveAttribute('src', /\.png$/);

});
