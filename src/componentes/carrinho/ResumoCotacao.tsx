import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Cotacao } from '@/api/tipos';
import { ErroApi } from '@/api/cliente';
import { formatarEth } from '@/lib/decimal';
import { useAplicarCupom, useRemoverCupom } from '@/hooks/useCarrinho';
import { Botao } from '@/componentes/ui/Botao';

interface Props {
  cotacao: Cotacao;
  acao: React.ReactNode;
}

export function ResumoCotacao({ cotacao, acao }: Props) {
  const [codigo, definirCodigo] = useState('');
  const [erroCupom, definirErroCupom] = useState<string | null>(null);
  const aplicar = useAplicarCupom();
  const remover = useRemoverCupom();

  async function enviarCupom(evento: FormEvent) {
    evento.preventDefault();
    definirErroCupom(null);
    try {
      await aplicar.mutateAsync(codigo);
      definirCodigo('');
    } catch (erro) {
      definirErroCupom(erro instanceof ErroApi ? erro.message : 'Cupom inválido.');
    }
  }

  return (
    <section
      aria-labelledby="resumo-titulo"
      className="flex h-fit flex-col gap-5 rounded-[3px] border border-border-subtle
                 bg-surface p-6 lg:sticky lg:top-6"
    >
      <h2 id="resumo-titulo" className="text-title text-foreground">
        Resumo da carteira
      </h2>

      {cotacao.cupom ? (
        <div className="flex items-center justify-between gap-3 rounded-[3px]
                        border border-primary/40 bg-primary/10 px-3 py-2">
          <span className="text-caption text-foreground">
            {cotacao.cupom.codigo} — {cotacao.cupom.descricaoDesconto}
          </span>
          <button
            type="button"
            onClick={() => remover.mutate()}
            aria-label={`Remover cupom ${cotacao.cupom.codigo}`}
            className="text-muted transition-colors hover:text-danger"
          >
            <X aria-hidden size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void enviarCupom(e)} className="flex flex-col gap-2">
          <label htmlFor="cupom" className="text-caption text-muted">
            Código promocional
          </label>
          <div className="flex gap-2">
            <input
              id="cupom"
              value={codigo}
              onChange={(e) => definirCodigo(e.target.value)}
              placeholder="Digite o código"
              aria-invalid={erroCupom ? true : undefined}
              aria-describedby={erroCupom ? 'cupom-erro' : undefined}
              className="h-10 min-w-0 flex-1 rounded-[3px] border border-border-subtle
                         bg-ink px-3 text-caption text-foreground focus:border-primary"
            />
            <Botao type="submit" disabled={!codigo.trim() || aplicar.isPending}>
              {aplicar.isPending ? '...' : 'Aplicar'}
            </Botao>
          </div>
          {erroCupom && (
            <p id="cupom-erro" role="alert" className="text-caption text-danger">
              {erroCupom}
            </p>
          )}
        </form>
      )}

      <dl className="flex flex-col gap-2 border-t border-border-subtle pt-4 text-caption">
        <Linha termo="Subtotal" valor={formatarEth(cotacao.subtotalEth)} />
        {cotacao.descontoEth !== '0' && (
          <Linha
            termo="Desconto"
            valor={`(-) ${formatarEth(cotacao.descontoEth)}`}
            destaque
          />
        )}
        <Linha termo="Taxa de rede" valor={formatarEth(cotacao.taxaRedeEth)} />
      </dl>

      <dl className="flex items-baseline justify-between border-t border-border-subtle pt-4">
        <dt className="text-label text-foreground">Total</dt>
        <dd className="text-title font-bold text-primary">
          {formatarEth(cotacao.totalEth)}
        </dd>
      </dl>

      {acao}
    </section>
  );
}

function Linha({ termo, valor, destaque }: { termo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{termo}</dt>
      <dd className={destaque ? 'text-success' : 'text-foreground'}>{valor}</dd>
    </div>
  );
}
