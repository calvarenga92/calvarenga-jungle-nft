import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { LogOut, Users, Wallet } from 'lucide-react';
import { consultaSessao } from '@/api/consultas';
import { useSair } from '@/hooks/useSessao';

export const Route = createFileRoute('/perfil')({
  beforeLoad: async ({ context }) => {
    const sessao = await context.queryClient.ensureQueryData(consultaSessao).catch(() => null);
    if (!sessao) throw redirect({ to: '/entrar', search: { destino: '/perfil' } });
  },
  component: PerfilLayout,
});

const SECOES = [
  { para: '/perfil', rotulo: 'Dados do perfil', Icone: Users, exato: true },
  { para: '/perfil/carteiras', rotulo: 'Carteiras', Icone: Wallet, exato: false },
] as const;

function PerfilLayout() {
  const sair = useSair();

  return (
    <div className="conteudo grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Secoes do perfil" className="h-fit">
        <h2 className="mb-4 text-label text-foreground">Meu perfil</h2>

        <ul className="flex flex-col">
          {SECOES.map(({ para, rotulo, Icone, exato }) => (
            <li key={para}>
              <Link
                to={para}
                activeOptions={{ exact: exato }}
                className="flex items-center gap-3 border-l-2 border-transparent py-2 pl-3
                           text-caption text-muted transition-colors hover:text-foreground"
                activeProps={{ className: 'border-primary text-primary [&]:text-primary' }}
              >
                <Icone aria-hidden size={15} />
                {rotulo}
              </Link>
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={() => sair.mutate()}
              className="flex w-full items-center gap-3 border-l-2 border-transparent py-2
                         pl-3 text-caption text-muted transition-colors hover:text-danger"
            >
              <LogOut aria-hidden size={15} />
              Sair
            </button>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
