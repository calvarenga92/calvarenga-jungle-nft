/**
 * Valores monetários em string decimal, somados como inteiros de 18 casas.
 * A regra vive no pacote compartilhado com o app mobile; este arquivo só a reexporta
 * para que nenhum import do app precise mudar.
 */
export {
  paraUnidades, paraTexto, somar, subtrair, multiplicar, percentual, comparar, menor, formatarEth,
} from '@calvarenga92/kurio-regras';
