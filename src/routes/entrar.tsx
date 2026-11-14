import { useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ErroApi } from '@/api/cliente';
import { useCriarConta, useEntrar, useSessao } from '@/hooks/useSessao';
import { Botao } from '@/componentes/ui/Botao';
import { Campo } from '@/componentes/ui/Campo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/entrar')({
  // destino opcional: preserva para onde o usuário queria ir antes do login
  validateSearch: (bruto: Record<string, unknown>): { destino?: string } =>
    typeof bruto.destino === 'string' ? { destino: bruto.destino } : {},
  component: Entrar,
});

type Aba = 'entrar' | 'criar';

function Entrar() {
  const [aba, definirAba] = useState<Aba>('entrar');
  const { autenticado } = useSessao();
  const navegar = useNavigate();

  if (autenticado) {
    void navegar({ to: '/', replace: true });
  }

  return (
    <div className="conteudo flex justify-center py-16">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface p-8">
        <h1 className="mb-6 text-title text-foreground">
          {aba === 'entrar' ? 'Entrar na Kurio' : 'Criar conta na Kurio'}
        </h1>

        <div
          role="tablist"
          aria-label="Entrar ou criar conta"
          className="mb-6 flex gap-6 border-b border-border-subtle"
        >
          {([['entrar', 'Entrar'], ['criar', 'Criar conta']] as const).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              id={`aba-${valor}`}
              aria-selected={aba === valor}
              aria-controls={`painel-${valor}`}
              onClick={() => definirAba(valor)}
              className={cn(
                'pb-3 text-label transition-colors',
                aba === valor
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted hover:text-foreground',
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {aba === 'entrar' ? <FormularioEntrar /> : <FormularioCriar />}

        <p className="mt-6 border-t border-border-subtle pt-4 text-caption text-muted">
          Contas da simulação: <span className="text-foreground">claudio@kurio.test</span> ou{' '}
          <span className="text-foreground">marina@kurio.test</span>, senha{' '}
          <span className="text-foreground">senha12345</span>.
        </p>
      </div>
    </div>
  );
}

function useErroFormulario() {
  const [erro, definirErro] = useState<ErroApi | null>(null);
  return {
    erro,
    campo: (nome: string) => erro?.campos?.[nome],
    geral: erro && !erro.campos ? erro.message : null,
    capturar: (e: unknown) => definirErro(e instanceof ErroApi ? e : null),
    limpar: () => definirErro(null),
  };
}

function FormularioEntrar() {
  const entrar = useEntrar();
  const navegar = useNavigate();
  const { destino } = Route.useSearch();
  const f = useErroFormulario();

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    f.limpar();
    const dados = new FormData(evento.currentTarget);

    try {
      await entrar.mutateAsync({
        email: String(dados.get('email') ?? ''),
        senha: String(dados.get('senha') ?? ''),
      });
      void navegar({ to: destino ?? '/', replace: true });
    } catch (erro) {
      f.capturar(erro);
    }
  }

  return (
    <form
      id="painel-entrar"
      role="tabpanel"
      aria-labelledby="aba-entrar"
      onSubmit={(e) => void enviar(e)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        obrigatorio
        erro={f.campo('email')}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        obrigatorio
        erro={f.campo('senha')}
      />

      {f.geral && (
        <p role="alert" className="text-caption text-danger">{f.geral}</p>
      )}

      <Botao type="submit" tamanho="grande" disabled={entrar.isPending} className="mt-2">
        {entrar.isPending ? 'Entrando...' : 'Entrar'}
      </Botao>
    </form>
  );
}

function FormularioCriar() {
  const criar = useCriarConta();
  const navegar = useNavigate();
  const f = useErroFormulario();

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    f.limpar();
    const dados = new FormData(evento.currentTarget);

    try {
      await criar.mutateAsync({
        nome: String(dados.get('nome') ?? ''),
        email: String(dados.get('email') ?? ''),
        senha: String(dados.get('senha') ?? ''),
      });
      void navegar({ to: '/', replace: true });
    } catch (erro) {
      f.capturar(erro);
    }
  }

  return (
    <form
      id="painel-criar"
      role="tabpanel"
      aria-labelledby="aba-criar"
      onSubmit={(e) => void enviar(e)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Campo rotulo="Nome" name="nome" autoComplete="name" obrigatorio erro={f.campo('nome')} />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        obrigatorio
        erro={f.campo('email')}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        obrigatorio
        apoio="Mínimo de 8 caracteres."
        erro={f.campo('senha')}
      />

      {f.geral && (
        <p role="alert" className="text-caption text-danger">{f.geral}</p>
      )}

      <Botao type="submit" tamanho="grande" disabled={criar.isPending} className="mt-2">
        {criar.isPending ? 'Criando...' : 'Criar conta'}
      </Botao>
    </form>
  );
}
