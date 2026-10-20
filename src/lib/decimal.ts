/**
 * Valores monetários em string decimal, somados como inteiros de 18 casas.
 * Evita o erro de ponto flutuante que faz 0.1 + 0.2 dar 0.30000000000000004.
 */
const CASAS = 18n;
const ESCALA = 10n ** CASAS;

export function paraUnidades(valor: string): bigint {
  const [inteira, decimal = ''] = valor.trim().split('.');
  const preenchida = decimal.padEnd(Number(CASAS), '0').slice(0, Number(CASAS));
  const negativo = inteira.startsWith('-');
  const absoluta = BigInt((negativo ? inteira.slice(1) : inteira) + preenchida);
  return negativo ? -absoluta : absoluta;
}

export function paraTexto(unidades: bigint, casas = 4): string {
  const negativo = unidades < 0n;
  const absoluta = negativo ? -unidades : unidades;
  const inteira = absoluta / ESCALA;
  const resto = (absoluta % ESCALA).toString().padStart(Number(CASAS), '0');
  const decimal = resto.slice(0, casas).replace(/0+$/, '');
  const texto = decimal ? `${inteira}.${decimal}` : String(inteira);
  return negativo ? `-${texto}` : texto;
}

export const somar = (a: string, b: string) => paraTexto(paraUnidades(a) + paraUnidades(b));
export const subtrair = (a: string, b: string) => paraTexto(paraUnidades(a) - paraUnidades(b));
export const multiplicar = (a: string, n: number) => paraTexto(paraUnidades(a) * BigInt(n));

export function percentual(valor: string, pct: number): string {
  return paraTexto((paraUnidades(valor) * BigInt(Math.round(pct * 100))) / 10000n);
}

/** Exibição sempre com 2 a 4 casas: "2.8" vira "2.80", "0.0165" se mantém. */
export function formatarEth(valor: string): string {
  const texto = paraTexto(paraUnidades(valor), 4);
  const [inteira, decimal = ''] = texto.split('.');
  return `${inteira}.${decimal.padEnd(2, '0')} ETH`;
}
