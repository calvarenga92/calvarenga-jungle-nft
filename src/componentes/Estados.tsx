import { AlertTriangle, Lock, PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { Botao } from '@/componentes/ui/Botao';
import { cn } from '@/lib/utils';

interface EstadoProps {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

function Moldura({ icone, titulo, descricao, acao }: EstadoProps & { icone: ReactNode }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-[3px]
                 border border-border-subtle bg-surface px-6 py-16 text-center"
    >
      <span aria-hidden className="text-secondary">{icone}</span>
      <h2 className="text-title text-foreground">{titulo}</h2>
      <p className="max-w-sm text-body text-muted">{descricao}</p>
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}

export function Vazio(props: EstadoProps) {
  return <Moldura icone={<PackageOpen size={28} />} {...props} />;
}

export function SemPermissao(props: EstadoProps) {
  return <Moldura icone={<Lock size={28} />} {...props} />;
}

export function Erro({
  titulo = 'Nao foi possivel carregar',
  descricao = 'Algo falhou no caminho. Tente de novo em instantes.',
  aoTentarDeNovo,
}: Partial<EstadoProps> & { aoTentarDeNovo?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-[3px]
                 border border-danger/40 bg-surface px-6 py-16 text-center"
    >
      <AlertTriangle aria-hidden size={28} className="text-danger" />
      <h2 className="text-title text-foreground">{titulo}</h2>
      <p className="max-w-sm text-body text-muted">{descricao}</p>
      {aoTentarDeNovo && (
        <Botao variante="contorno" onClick={aoTentarDeNovo} className="mt-2">
          Tentar de novo
        </Botao>
      )}
    </div>
  );
}

export function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-[3px] bg-surface-2', className)}
    />
  );
}

export function GradeCarregando({ quantidade = 9 }: { quantidade?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando NFTs"
      className="grid grid-cols-2 gap-6 lg:grid-cols-3"
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Esqueleto className="aspect-square w-full" />
          <Esqueleto className="h-4 w-3/5" />
          <Esqueleto className="h-4 w-2/5" />
        </div>
      ))}
    </div>
  );
}
