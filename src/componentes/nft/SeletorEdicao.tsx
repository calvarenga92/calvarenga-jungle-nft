import type { Edicao } from '@/api/tipos';
import { formatarEth } from '@/lib/decimal';
import { cn } from '@/lib/utils';

interface Props {
  edicoes: Edicao[];
  selecionada: string;
  aoSelecionar: (id: string) => void;
}

export function SeletorEdicao({ edicoes, selecionada, aoSelecionar }: Props) {
  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0">
      <legend className="mb-1 text-label text-foreground">Edicao</legend>

      <div className="flex flex-wrap gap-3">
        {edicoes.map((edicao) => {
          const esgotada = edicao.disponivel === 0;
          const ativa = edicao.id === selecionada;

          return (
            <label
              key={edicao.id}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-[3px] border px-4 py-3 transition-colors',
                ativa ? 'border-primary bg-primary/10' : 'border-border-subtle hover:border-secondary',
                esgotada && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                name="edicao"
                value={edicao.id}
                checked={ativa}
                disabled={esgotada}
                onChange={() => aoSelecionar(edicao.id)}
                className="sr-only"
              />
              <span className="text-label text-foreground">{edicao.rotulo}</span>
              <span className="text-label font-bold text-primary">
                {formatarEth(edicao.precoEth)}
              </span>
              <span className="text-caption text-muted">
                {esgotada ? 'Esgotada' : `${edicao.disponivel} disponiveis`}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
