import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Heroi } from '@/componentes/inicio/Heroi';
import { Catalogo } from '@/componentes/catalogo/Catalogo';
import { validarBusca, type BuscaCatalogo } from '@/lib/busca';

export const Route = createFileRoute('/')({
  validateSearch: validarBusca,
  component: Inicio,
});

function Inicio() {
  const busca = Route.useSearch();
  const navegar = useNavigate({ from: '/' });

  function aoMudarBusca(parcial: Partial<BuscaCatalogo>) {
    void navegar({ search: (atual) => ({ ...atual, ...parcial }), replace: true });
  }

  return (
    <>
      <Heroi />
      <Catalogo busca={busca} aoMudarBusca={aoMudarBusca} />
    </>
  );
}
