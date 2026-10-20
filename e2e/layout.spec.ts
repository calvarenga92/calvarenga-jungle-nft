import { expect, test } from '@playwright/test';
import { aguardarCatalogo, limparEstado } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

/**
 * Teste funcional passa com layout quebrado: o Playwright acha e clica em
 * elemento que transborda a tela. Estas verificações olham a largura.
 */
const transborda = (pagina: import('@playwright/test').Page) =>
  pagina.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

test('nenhuma rota rola na horizontal', async ({ page }) => {
  for (const caminho of ['/', '/mercado', '/carrinho', '/entrar', '/pedido/inexistente']) {
    await page.goto(caminho);
    expect(await transborda(page), `rolagem horizontal em ${caminho}`).toBe(false);
  }
});

test('busca aberta no cabeçalho não estoura a largura', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);

  await page.getByRole('button', { name: 'Buscar NFTs' }).click();
  await page.getByLabel('Buscar por título, criador ou coleção').waitFor();

  expect(await transborda(page), 'cabeçalho transborda com a busca aberta').toBe(false);
});

test('catálogo com filtros aplicados continua dentro da tela', async ({ page }) => {
  await page.goto('/?colecao=arte-digital,musica&ordenacao=preco-desc');
  await aguardarCatalogo(page);

  expect(await transborda(page)).toBe(false);
});

/**
 * O cenário é gravado para sobreviver à navegação. Sem aviso visível, quem
 * abrisse um cenário de falha ficaria preso nele achando que o app quebrou.
 */
test('cenário de simulação ativo fica visível e tem volta', async ({ page }) => {
  await page.goto('/?cenario=lista-vazia');
  await expect(page.getByText(/Cenário de simulação ativo/)).toBeVisible();

  // persiste ao navegar, que é justamente o risco
  await page.goto('/mercado');
  await expect(page.getByText(/Cenário de simulação ativo/)).toBeVisible();

  await page.getByRole('button', { name: 'voltar ao padrão' }).click();

  await expect(page.getByText(/Cenário de simulação ativo/)).toBeHidden();
  await aguardarCatalogo(page);
});

test('sem cenário ativo o aviso não aparece', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);
  await expect(page.getByText(/Cenário de simulação ativo/)).toBeHidden();
});
