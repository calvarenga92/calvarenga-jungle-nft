import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends Omit<ComponentProps<'input'>, 'id'> {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  apoio?: ReactNode;
}

export function Campo({
  rotulo, obrigatorio, erro, apoio, className, ...props
}: Props) {
  const id = useId();
  const idErro = `${id}-erro`;
  const idApoio = `${id}-apoio`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-foreground">
        {rotulo}
        {obrigatorio && <span className="ml-1 text-primary">*</span>}
      </label>

      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={cn(erro && idErro, apoio && idApoio) || undefined}
        className={cn(
          'h-10 rounded-[3px] border bg-surface px-3 text-body text-foreground',
          'transition-colors focus:border-primary',
          erro ? 'border-danger' : 'border-border-subtle',
          className,
        )}
        {...props}
      />

      {apoio && !erro && (
        <p id={idApoio} className="text-caption text-muted">{apoio}</p>
      )}
      {erro && (
        <p id={idErro} className="text-caption text-danger">{erro}</p>
      )}
    </div>
  );
}
