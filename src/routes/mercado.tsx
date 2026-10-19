import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Catalogo } from '@/componentes/catalogo/Catalogo';
import { validarBusca, type BuscaCatalogo } from '@/lib/busca';

export const Route = createFileRoute('/mercado')({
  validateSearch: validarBusca,
  component: Mercado,
});

function Mercado() {
  const busca = Route.useSearch();
  const navegar = useNavigate({ from: '/mercado' });

  function aoMudarBusca(parcial: Partial<BuscaCatalogo>) {
    void navegar({ search: (atual) => ({ ...atual, ...parcial }), replace: true });
  }

  return (
    <>
      <div className="conteudo pt-10">
        <h1 className="text-display text-foreground">Mercado</h1>
        <p className="mt-2 text-body text-muted">
          Todas as pecas disponiveis, com filtros e ordenacao refletidos na URL.
        </p>
      </div>
      <Catalogo busca={busca} aoMudarBusca={aoMudarBusca} />
    </>
  );
}
