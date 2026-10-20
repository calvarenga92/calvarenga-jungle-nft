import type { Page } from '@playwright/test';

export const CONTA = {
  email: 'claudio@kurio.test',
  senha: 'senha12345',
};

export function url(caminho: string, parametros: Record<string, string> = {}) {
  const busca = new URLSearchParams(parametros).toString();
  return busca ? `${caminho}?${busca}` : caminho;
}

export async function entrar(pagina: Page) {
  await pagina.goto('/entrar');
  await pagina.getByLabel('E-mail').fill(CONTA.email);
  await pagina.getByLabel('Senha').fill(CONTA.senha);
  await pagina.getByRole('button', { name: 'Entrar' }).click();
  await pagina.waitForURL('/');
}

/** Cada teste parte de um estado limpo: o mock guarda tudo em localStorage. */
export async function limparEstado(pagina: Page) {
  await pagina.goto('/');
  await pagina.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // storage indisponivel
    }
  });
}

/**
 * O blog da home tambem usa <article>, entao o catalogo precisa de escopo
 * proprio — senao a contagem mistura peca com post.
 */
export const cartoes = (pagina: Page) =>
  pagina.locator('section[aria-labelledby="titulo-catalogo"] article');

/** allTextContents e count nao esperam: a grade precisa estar montada antes. */
export async function aguardarCatalogo(pagina: Page) {
  await cartoes(pagina).first().waitFor();
}

export async function adicionarPrimeiraPeca(pagina: Page) {
  await pagina.goto('/');
  await aguardarCatalogo(pagina);
  await cartoes(pagina).locator('a').first().click();
  await pagina.waitForURL(/\/nft\//);
  await pagina.getByRole('button', { name: /Comprar/ }).click();
  await pagina.getByText('Adicionado ao carrinho.').waitFor();
}
