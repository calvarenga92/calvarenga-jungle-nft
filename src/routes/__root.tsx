import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Cabecalho } from '@/componentes/layout/Cabecalho';
import { Rodape } from '@/componentes/layout/Rodape';
import { FaixaPromo } from '@/componentes/layout/FaixaPromo';
import { AvisoCenario } from '@/componentes/layout/AvisoCenario';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Layout,
});

function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4
                   focus:z-50 focus:rounded-[3px] focus:bg-primary focus:px-4
                   focus:py-2 focus:text-primary-ink"
      >
        Pular para o conteúdo
      </a>

      <AvisoCenario />
      <Cabecalho />

      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>

      <FaixaPromo />
      <Rodape />
      <ScrollRestoration />
    </div>
  );
}
