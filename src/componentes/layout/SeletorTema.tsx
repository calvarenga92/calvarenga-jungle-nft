import { TEMAS, useTema } from '@/hooks/useTema';
import { cn } from '@/lib/utils';

/** Troca entre os três temas. Grupo de rádio: setas do teclado navegam entre as opções. */
export function SeletorTema({ className }: { className?: string }) {
  const { tema, definir } = useTema();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de cores"
      className={cn(
        'flex items-center gap-1 rounded-full border border-border-subtle bg-surface p-1',
        className,
      )}
    >
      {TEMAS.map((opcao, indice) => {
        const ativo = opcao.id === tema;
        return (
          <button
            key={opcao.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={opcao.nome}
            title={opcao.nome}
            tabIndex={ativo ? 0 : -1}
            onClick={() => definir(opcao.id)}
            onKeyDown={(evento) => {
              const passo = evento.key === 'ArrowRight' || evento.key === 'ArrowDown' ? 1
                : evento.key === 'ArrowLeft' || evento.key === 'ArrowUp' ? -1 : 0;
              if (!passo) return;
              evento.preventDefault();
              const proximo = TEMAS[(indice + passo + TEMAS.length) % TEMAS.length];
              definir(proximo.id);
              const grupo = evento.currentTarget.parentElement;
              grupo?.querySelector<HTMLButtonElement>(`[aria-label="${proximo.nome}"]`)?.focus();
            }}
            className={cn(
              'size-6 rounded-full ring-offset-2 ring-offset-surface transition-shadow',
              ativo ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border-strong',
            )}
            style={{ background: opcao.amostra }}
          />
        );
      })}
    </div>
  );
}
