import { expect, test } from '@playwright/test';
import { adicionarPrimeiraPeca, entrar, limparEstado, url } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

test('carrinho vazio orienta o proximo passo', async ({ page }) => {
  await page.goto('/carrinho');
  await expect(page.getByText('Seu carrinho esta vazio')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar o mercado' })).toBeVisible();
});

test('adiciona peca, ajusta quantidade e ve o total acompanhar', async ({ page }) => {
  await adicionarPrimeiraPeca(page);
  await page.goto('/carrinho');

  const total = page.locator('dd').last();
  const antes = await total.textContent();

  await page.getByRole('button', { name: /Aumentar quantidade/ }).click();
  await expect(total).not.toHaveText(antes ?? '');
});

test('cupom valido desconta e cupom invalido avisa', async ({ page }) => {
  await adicionarPrimeiraPeca(page);
  await page.goto('/carrinho');

  await page.getByLabel('Codigo promocional').fill('GREENMINT10');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByText('10% de desconto')).toBeVisible();

  await page.getByRole('button', { name: /Remover cupom/ }).click();
  await page.getByLabel('Codigo promocional').fill('NAOEXISTE');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Cupom nao encontrado.');
});

test('cupom expirado tem mensagem propria', async ({ page }) => {
  await adicionarPrimeiraPeca(page);
  await page.goto('/carrinho');
  await page.getByLabel('Codigo promocional').fill('EXPIRADO50');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Este cupom expirou.');
});

test('compra completa leva ao recibo e esvazia o carrinho', async ({ page }) => {
  await entrar(page);
  await adicionarPrimeiraPeca(page);

  await page.goto('/pagamento');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();

  await page.waitForURL(/\/pedido\//);
  await expect(page.getByText('Seus NFTs agora estao na sua carteira')).toBeVisible();

  await page.goto('/carrinho');
  await expect(page.getByText('Seu carrinho esta vazio')).toBeVisible();
});

test('pagamento recusado mostra o motivo em vez de confirmar', async ({ page }) => {
  await entrar(page);
  await adicionarPrimeiraPeca(page);

  await page.goto(url('/pagamento', { cenario: 'pagamento-recusado' }));
  await page.getByRole('button', { name: 'Confirmar compra' }).click();

  await page.waitForURL(/\/pedido\//);
  await expect(page.getByText('A transacao foi recusada')).toBeVisible();
});

test('recibo continua acessivel ao recarregar', async ({ page }) => {
  await entrar(page);
  await adicionarPrimeiraPeca(page);
  await page.goto('/pagamento');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await page.waitForURL(/\/pedido\//);

  await page.reload();
  await expect(page.getByText('Seus NFTs agora estao na sua carteira')).toBeVisible();
});
