import { expect, test } from '@playwright/test';
import { aguardarCatalogo, limparEstado } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

test('atalho pular para o conteudo aparece no primeiro Tab', async ({ page }) => {
  await page.goto('/');
  // o Tab precisa vir depois da montagem, senao o foco fica no body
  await page.getByRole('link', { name: 'Kurio, pagina inicial' }).waitFor();
  await page.locator('body').press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteudo' })).toBeFocused();
});

test('cada pagina tem exatamente um h1', async ({ page }) => {
  for (const caminho of ['/', '/mercado', '/carrinho', '/entrar']) {
    await page.goto(caminho);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('imagens do catalogo tem texto alternativo', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);
  const imagens = page.locator('article img');
  const total = await imagens.count();

  for (let i = 0; i < total; i += 1) {
    await expect(imagens.nth(i)).toHaveAttribute('alt', /.+/);
  }
});

test('o catalogo e navegavel so pelo teclado ate a peca', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);
  await page.locator('article a').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/nft\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('botao de favorito expoe o estado por aria-pressed', async ({ page }) => {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('claudio@greenmint.test');
  await page.getByLabel('Senha').fill('senha12345');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('/');
  await aguardarCatalogo(page);

  const favorito = page.locator('article button[aria-pressed]').first();
  await expect(favorito).toHaveAttribute('aria-pressed', 'false');
  await favorito.click();
  await expect(favorito).toHaveAttribute('aria-pressed', 'true');
});
