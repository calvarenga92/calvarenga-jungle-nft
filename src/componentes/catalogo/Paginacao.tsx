import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}

export function Paginacao({ pagina, totalPaginas, aoMudar }: Props) {
  if (totalPaginas <= 1) return null;
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginação do catálogo" className="flex justify-center">
      <ul className="flex items-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => aoMudar(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="flex size-9 items-center justify-center rounded-xl
                       border border-border-subtle text-muted transition-colors
                       hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft aria-hidden size={16} />
          </button>
        </li>

        {paginas.map((numero) => (
          <li key={numero}>
            <button
              type="button"
              onClick={() => aoMudar(numero)}
              aria-current={numero === pagina ? 'page' : undefined}
              aria-label={`Página ${numero}`}
              className={cn(
                'size-9 rounded-xl text-label transition-colors',
                numero === pagina
                  ? 'bg-primary font-bold text-primary-ink'
                  : 'border border-border-subtle text-muted hover:text-foreground',
              )}
            >
              {numero}
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => aoMudar(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Próxima página"
            className="flex size-9 items-center justify-center rounded-xl
                       border border-border-subtle text-muted transition-colors
                       hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight aria-hidden size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
