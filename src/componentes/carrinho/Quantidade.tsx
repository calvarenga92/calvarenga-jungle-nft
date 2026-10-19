import { Minus, Plus } from 'lucide-react';

interface Props {
  valor: number;
  maximo: number;
  rotulo: string;
  desabilitado?: boolean;
  aoMudar: (valor: number) => void;
}

export function Quantidade({ valor, maximo, rotulo, desabilitado, aoMudar }: Props) {
  return (
    <div className="inline-flex items-center rounded-[3px] border border-border-subtle">
      <button
        type="button"
        onClick={() => aoMudar(valor - 1)}
        disabled={desabilitado || valor <= 1}
        aria-label={`Diminuir quantidade de ${rotulo}`}
        className="flex size-8 items-center justify-center text-muted
                   transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Minus aria-hidden size={14} />
      </button>

      <span
        aria-live="polite"
        aria-label={`Quantidade de ${rotulo}`}
        className="w-8 text-center text-label text-foreground"
      >
        {valor}
      </span>

      <button
        type="button"
        onClick={() => aoMudar(valor + 1)}
        disabled={desabilitado || valor >= maximo}
        aria-label={`Aumentar quantidade de ${rotulo}`}
        className="flex size-8 items-center justify-center text-muted
                   transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Plus aria-hidden size={14} />
      </button>
    </div>
  );
}
