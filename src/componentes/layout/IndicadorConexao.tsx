import { useTempoReal } from '@/hooks/useTempoReal';
import { cn } from '@/lib/utils';

const ROTULOS = {
  conectando: 'Conectando ao tempo real',
  conectado: 'Tempo real ativo',
  desconectado: 'Sem conexao em tempo real',
} as const;

const CORES = {
  conectando: 'bg-secondary',
  conectado: 'bg-success',
  desconectado: 'bg-danger',
} as const;

export function IndicadorConexao() {
  const estado = useTempoReal();

  return (
    <span className="flex items-center gap-2" title={ROTULOS[estado]}>
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          CORES[estado],
          estado === 'conectando' && 'animate-pulse',
        )}
      />
      <span role="status" className="sr-only">{ROTULOS[estado]}</span>
    </span>
  );
}
