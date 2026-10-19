import { createFileRoute } from '@tanstack/react-router';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCarteiras, useDefinirPrincipal, useRemoverCarteira,
} from '@/hooks/useCarteiras';
import { Esqueleto, Vazio } from '@/componentes/Estados';
import { FormularioCarteira } from '@/componentes/carrinho/FormularioCarteira';

export const Route = createFileRoute('/perfil/carteiras')({
  component: Carteiras,
});

function Carteiras() {
  const { data: carteiras, isPending } = useCarteiras();
  const definirPrincipal = useDefinirPrincipal();
  const remover = useRemoverCarteira();

  return (
    <section aria-labelledby="carteiras-titulo" className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 id="carteiras-titulo" className="text-title text-foreground">
          Carteira principal
        </h1>
        <p className="text-caption text-muted">
          Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
        </p>
      </header>

      {isPending && <Esqueleto className="h-24 w-full max-w-2xl" />}

      {carteiras && carteiras.length === 0 && (
        <Vazio
          titulo="Nenhuma carteira cadastrada"
          descricao="Adicione uma carteira para conseguir finalizar compras."
        />
      )}

      {carteiras && carteiras.length > 0 && (
        <ul className="flex max-w-2xl flex-col gap-3">
          {carteiras.map((carteira) => (
            <li
              key={carteira.id}
              className={cn(
                'flex flex-wrap items-center justify-between gap-4 rounded-[3px] border px-4 py-3',
                carteira.principal ? 'border-primary/50 bg-primary/5' : 'border-border-subtle',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-label text-foreground">
                  {carteira.apelido}
                  {carteira.principal && (
                    <span className="rounded-[3px] bg-primary px-1.5 py-0.5 text-[10px]
                                     font-bold uppercase text-primary-ink">
                      Principal
                    </span>
                  )}
                </span>
                <span className="text-caption text-muted">{carteira.endereco}</span>
                <span className="text-caption uppercase text-secondary">{carteira.rede}</span>
              </div>

              <div className="flex items-center gap-1">
                {!carteira.principal && (
                  <button
                    type="button"
                    onClick={() => definirPrincipal.mutate(carteira.id)}
                    aria-label={`Tornar ${carteira.apelido} a carteira principal`}
                    className="flex size-9 items-center justify-center text-muted
                               transition-colors hover:text-primary"
                  >
                    <Star aria-hidden size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remover.mutate(carteira.id)}
                  aria-label={`Remover carteira ${carteira.apelido}`}
                  className="flex size-9 items-center justify-center text-muted
                             transition-colors hover:text-danger"
                >
                  <Trash2 aria-hidden size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="max-w-2xl rounded-[3px] border border-border-subtle bg-surface p-6">
        <h2 className="mb-5 text-label text-foreground">Adicionar carteira</h2>
        <FormularioCarteira />
      </div>
    </section>
  );
}
