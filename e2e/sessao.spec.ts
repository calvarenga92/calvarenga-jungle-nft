import { expect, test } from '@playwright/test';
import { CONTA, entrar, limparEstado } from './apoio';

test.beforeEach(async ({ page }) => { await limparEstado(page); });

test('entra com credenciais validas e mostra o usuario no cabecalho', async ({ page }) => {
  await entrar(page);
  await expect(page.getByRole('link', { name: 'Claudio' })).toBeVisible();
});

test('credenciais invalidas mostram erro sem revelar se o e-mail existe', async ({ page }) => {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(CONTA.email);
  await page.getByLabel('Senha').fill('senhaerrada');
  await page.getByRole('button', { name: 'Entrar' }).click();

  const alerta = page.getByRole('alert');
  await expect(alerta).toHaveText('E-mail ou senha incorretos.');

  // e-mail inexistente devolve exatamente a mesma mensagem
  await page.getByLabel('E-mail').fill('ninguem@greenmint.test');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(alerta).toHaveText('E-mail ou senha incorretos.');
});

test('cadastro valida os campos e devolve erro por campo', async ({ page }) => {
  await page.goto('/entrar');
  await page.getByRole('tab', { name: 'Criar conta' }).click();

  await page.getByLabel('Nome').fill('Teste');
  await page.getByLabel('E-mail').fill('invalido');
  await page.getByLabel('Senha').fill('123');
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page.getByText('E-mail inválido.')).toBeVisible();
  await expect(page.getByText('Use ao menos 8 caracteres.')).toBeVisible();
});

test('rota protegida redireciona para entrar e preserva o destino', async ({ page }) => {
  await page.goto('/perfil');
  await expect(page).toHaveURL(/\/entrar\?destino=%2Fperfil/);
});

test('sessao expirada nao deixa o usuario preso numa tela logada', async ({ page }) => {
  // o cenario faz a sessao nascer ja vencida, como acontece ao voltar horas depois
  await page.goto('/entrar?cenario=sessao-expirada');
  await page.getByLabel('E-mail').fill(CONTA.email);
  await page.getByLabel('Senha').fill(CONTA.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/perfil');
  await expect(page).toHaveURL(/\/entrar/);
});
