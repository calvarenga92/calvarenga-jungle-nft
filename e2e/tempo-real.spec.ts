import { expect, test } from '@playwright/test';
import { aguardarCatalogo, cartoes, limparEstado, url } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

const precos = (pagina: import('@playwright/test').Page) =>
  cartoes(pagina).getByTestId('preco').allTextContents();

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

  // amostra ate juntar evidencia suficiente, sem depender de cadencia fixa
  const limite = Date.now() + 45_000;
  while (mudancas < 3 && Date.now() < limite) {
    const titulos = await cartoes(page).locator('h3').allTextContents();
    const valores = await precos(page);

    titulos.forEach((titulo, k) => {
      const anteriores = historico.get(titulo) ?? [];
      const atual = valores[k];
      if (atual && anteriores.at(-1) !== atual) {
        // voltar a um valor ja substituido significaria aplicar evento antigo
        if (anteriores.slice(0, -1).includes(atual)) regressoes += 1;
        if (anteriores.length > 0) mudancas += 1;
        anteriores.push(atual);
      }
      historico.set(titulo, anteriores);
    });

    await page.waitForTimeout(400);
  }

  expect(mudancas, 'nenhum evento aplicado na janela observada').toBeGreaterThan(0);
  expect(regressoes, 'preco voltou a um valor ja superado').toBe(0);
});
