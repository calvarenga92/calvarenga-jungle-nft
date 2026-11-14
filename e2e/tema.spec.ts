import { expect, test } from '@playwright/test';
import { limparEstado } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

test('troca de tema aplica no documento e sobrevive ao recarregar', async ({ page, isMobile }) => {
  await page.goto('/');

  if (isMobile) await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  const grupo = page.getByRole('radiogroup', { name: 'Tema de cores' });

  await expect(grupo.getByRole('radio', { name: 'Gradiente quente' })).toHaveAttribute('aria-checked', 'true');
  await grupo.getByRole('radio', { name: 'Noturna neon' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-tema', 'neon');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'neon');
});

test('tema vindo da URL vale para quem abre o link', async ({ page }) => {
  await page.goto('/?tema=eletrica');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'eletrica');
});

test('setas do teclado percorrem os temas', async ({ page, isMobile }) => {
  test.skip(isMobile, 'o seletor do celular fica no menu; a navegação por teclado é a mesma');
  await page.goto('/');

  const grupo = page.getByRole('radiogroup', { name: 'Tema de cores' });
  await grupo.getByRole('radio', { name: 'Gradiente quente' }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(page.locator('html')).toHaveAttribute('data-tema', 'neon');
  await expect(grupo.getByRole('radio', { name: 'Noturna neon' })).toBeFocused();
});
