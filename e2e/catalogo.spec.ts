import { expect, test } from '@playwright/test';
import { aguardarCatalogo, cartoes, limparEstado, url } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

test('lista as pecas da primeira pagina', async ({ page }) => {
  await page.goto('/');
  await expect(cartoes(page)).toHaveCount(9);
  await expect(page.getByRole('heading', { level: 1 }))
    .toHaveText(/Seja dono do futuro da arte digital/i);
});

test('filtro por colecao reflete na URL e sobrevive ao recarregar', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);
  await page.getByLabel('Golden Apes').check();

  await expect(page).toHaveURL(/colecao=apes/);
  await expect(cartoes(page)).toHaveCount(6);

  await page.reload();
  await expect(page.getByLabel('Golden Apes')).toBeChecked();
  await expect(cartoes(page)).toHaveCount(6);
});

test('ordenacao por menor preco coloca a peca mais barata primeiro', async ({ page }) => {
  await page.goto(url('/', { ordenacao: 'preco-asc' }));
  await aguardarCatalogo(page);
  const precos = await cartoes(page).locator('p.text-primary').allTextContents();
  const numeros = precos.map((p) => Number(p.replace(' ETH', '')));
  expect(numeros).toEqual([...numeros].sort((a, b) => a - b));
});

test('paginacao navega e mantem a pagina na URL', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);
  await page.getByRole('button', { name: 'Página 2' }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
});

test('filtro sem resultado mostra estado vazio, nao tela quebrada', async ({ page }) => {
  await page.goto(url('/', { cenario: 'lista-vazia' }));
  await expect(page.getByText('Nenhuma peça encontrada')).toBeVisible();
});

test('falha do servidor mostra erro com acao de repetir', async ({ page }) => {
  await page.goto(url('/', { cenario: 'erro-servidor' }));
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
});

test('busca pelo cabeçalho filtra o catálogo e aparece na URL', async ({ page }) => {
  await page.goto('/');
  await aguardarCatalogo(page);

  await page.getByRole('button', { name: 'Buscar NFTs' }).click();
  await page.getByLabel('Buscar por título, criador ou coleção').fill('Neon');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page).toHaveURL(/\/mercado\?busca=Neon/);
  await aguardarCatalogo(page);

  const titulos = await cartoes(page).locator('h3').allTextContents();
  expect(titulos.length).toBeGreaterThan(0);
  expect(titulos.every((t) => t.includes('Neon'))).toBe(true);
});

test('busca sem resultado explica o termo que falhou', async ({ page }) => {
  await page.goto(url('/mercado', { busca: 'zzzznaoexiste' }));

  const vazio = page.getByRole('status').filter({ hasText: 'Nenhuma peça encontrada' });
  await expect(vazio).toBeVisible();
  await expect(vazio).toContainText('zzzznaoexiste');

  // o termo tambem fica visivel no cabecalho da lista, com acao de limpar
  await expect(page.getByRole('button', { name: 'limpar busca' })).toBeVisible();
});
