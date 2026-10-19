import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const botao = cva(
  'inline-flex items-center justify-center gap-2 rounded-[3px] font-bold ' +
    'transition-colors disabled:pointer-events-none disabled:opacity-50 ' +
    'whitespace-nowrap',
  {
    variants: {
      variante: {
        primario: 'bg-primary text-primary-ink hover:bg-primary-hover',
        contorno:
          'border border-border-strong text-foreground hover:border-primary hover:text-primary',
        fantasma: 'text-muted hover:text-foreground',
        perigo: 'bg-danger text-ink hover:opacity-90',
      },
      tamanho: {
        pequeno: 'h-8 px-3 text-caption',
        medio: 'h-10 px-5 text-label',
        grande: 'h-12 px-7 text-label',
        icone: 'size-10',
      },
    },
    defaultVariants: { variante: 'primario', tamanho: 'medio' },
  },
);

type Props = ComponentProps<'button'> &
  VariantProps<typeof botao> & { asChild?: boolean };

export function Botao({ className, variante, tamanho, asChild, ...props }: Props) {
  const Componente = asChild ? Slot : 'button';
  return (
    <Componente className={cn(botao({ variante, tamanho }), className)} {...props} />
  );
}
