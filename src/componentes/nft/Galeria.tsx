import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  imagens: string[];
  titulo: string;
}

export function Galeria({ imagens, titulo }: Props) {
  const [ativa, definirAtiva] = useState(0);
  const lista = imagens.length > 0 ? imagens : [''];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {lista.length > 1 && (
        <ul className="flex gap-3 sm:flex-col" aria-label="Miniaturas da peca">
          {lista.map((imagem, indice) => (
            <li key={imagem + indice}>
              <button
                type="button"
                onClick={() => definirAtiva(indice)}
                aria-label={`Ver imagem ${indice + 1} de ${lista.length}`}
                aria-current={indice === ativa}
                className={cn(
                  'size-16 overflow-hidden rounded-[3px] border transition-colors',
                  indice === ativa ? 'border-primary' : 'border-border-subtle hover:border-secondary',
                )}
              >
                <img
                  src={imagem}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex-1 overflow-hidden rounded-[3px] border border-border-subtle bg-surface">
        <img
          src={lista[ativa]}
          alt={titulo}
          width={520}
          height={520}
          fetchPriority="high"
          className="aspect-square w-full object-cover"
        />
      </div>
    </div>
  );
}
