import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Slider from '@radix-ui/react-slider';
import { consultaFaixaPreco } from '@/api/consultas';
import { Esqueleto } from '@/componentes/Estados';
import { Botao } from '@/componentes/ui/Botao';

interface Props {
  precoMin?: number;
  precoMax?: number;
  aoAplicar: (faixa: { precoMin?: number; precoMax?: number }) => void;
}

/** O slider trabalha em centésimos para evitar float no passo. */
const ESCALA = 100;
const paraPasso = (eth: string | number) => Math.round(Number(eth) * ESCALA);
const paraEth = (passo: number) => passo / ESCALA;
const exibir = (passo: number) => paraEth(passo).toFixed(2);

export function FiltroPreco({ precoMin, precoMax, aoAplicar }: Props) {
  const { data: faixa, isPending } = useQuery(consultaFaixaPreco);

  const minimo = faixa ? paraPasso(faixa.minimo) : 0;
  const maximo = faixa ? paraPasso(faixa.maximo) : 100;

  const [valor, definirValor] = useState<[number, number]>([minimo, maximo]);

  // o filtro mora na URL: ao chegar por link, o controle precisa refletir o que veio
  useEffect(() => {
    if (!faixa) return;
    definirValor([
      precoMin ? paraPasso(precoMin) : minimo,
      precoMax ? paraPasso(precoMax) : maximo,
    ]);
  }, [faixa, precoMin, precoMax, minimo, maximo]);

  if (isPending || !faixa) {
    return (
      <div className="flex flex-col gap-3">
        <Esqueleto className="h-4 w-28" />
        <Esqueleto className="h-5 w-full" />
      </div>
    );
  }

  const [inicio, fim] = valor;
  const alterado = inicio !== minimo || fim !== maximo;
  const temFiltroAtivo = precoMin !== undefined || precoMax !== undefined;

  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0">
      <legend className="mb-1 text-label text-foreground">Faixa de preço</legend>

      <Slider.Root
        value={valor}
        min={minimo}
        max={maximo}
        step={1}
        minStepsBetweenThumbs={1}
        onValueChange={(proximo) => definirValor(proximo as [number, number])}
        className="relative flex h-5 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1 w-full grow rounded-full bg-border-subtle">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>

        <Slider.Thumb
          aria-label="Preço mínimo em ETH"
          className="block size-4 rounded-full border-2 border-primary bg-ink"
        />
        <Slider.Thumb
          aria-label="Preço máximo em ETH"
          className="block size-4 rounded-full border-2 border-primary bg-ink"
        />
      </Slider.Root>

      <p aria-live="polite" className="text-caption text-muted">
        Preço: <span className="text-foreground">{exibir(inicio)}</span> —{' '}
        <span className="text-foreground">{exibir(fim)}</span> ETH
      </p>

      <div className="flex gap-2">
        <Botao
          tamanho="pequeno"
          disabled={!alterado && !temFiltroAtivo}
          onClick={() =>
            aoAplicar({
              precoMin: inicio === minimo ? undefined : paraEth(inicio),
              precoMax: fim === maximo ? undefined : paraEth(fim),
            })
          }
        >
          Aplicar
        </Botao>

        {temFiltroAtivo && (
          <Botao
            variante="contorno"
            tamanho="pequeno"
            onClick={() => aoAplicar({ precoMin: undefined, precoMax: undefined })}
          >
            Limpar
          </Botao>
        )}
      </div>
    </fieldset>
  );
}
