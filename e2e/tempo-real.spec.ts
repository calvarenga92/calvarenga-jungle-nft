import { expect, test } from '@playwright/test';
import { aguardarCatalogo, limparEstado, url } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

const precos = (pagina: import('@playwright/test').Page) =>
  pagina.locator('article p.text-primary').allTextContents();

test('conexao em tempo real fica ativa', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Tempo real ativo')).toBeAttached();
});

test('preco do catalogo muda sozinho quando chega evento', async ({ page }) => {
  await page.goto(url('/', { eventos: 'rapido' }));
  await aguardarCatalogo(page);
  const antes = await precos(page);
  expect(antes.length).toBeGreaterThan(0);

  await expect
    .poll(async () => (await precos(page)).some((v, i) => v !== antes[i]), { timeout: 30_000 })
    .toBe(true);
});

/**
 * No cenario fora-de-ordem o servidor emite de proposito um evento com versao
 * anterior antes do atual. Um preco nunca pode voltar a um valor ja substituido.
 */
test('evento atrasado nao faz o preco regredir', async ({ page }) => {
  await page.goto(url('/', { eventos: 'rapido', cenario: 'fora-de-ordem' }));
  await aguardarCatalogo(page);

  const historico = new Map<string, string[]>();
  let regressoes = 0;
  let mudancas = 0;

  for (let i = 0; i < 20; i += 1) {
    const titulos = await page.locator('article h3').allTextContents();
    const valores = await precos(page);

    titulos.forEach((titulo, k) => {
      const anteriores = historico.get(titulo) ?? [];
      const atual = valores[k];
      if (anteriores.at(-1) !== atual) {
        if (anteriores.slice(0, -1).includes(atual)) regressoes += 1;
        anteriores.push(atual);
        mudancas += 1;
      }
      historico.set(titulo, anteriores);
    });

    await page.waitForTimeout(600);
  }

  expect(mudancas).toBeGreaterThan(0);
  expect(regressoes).toBe(0);
});
