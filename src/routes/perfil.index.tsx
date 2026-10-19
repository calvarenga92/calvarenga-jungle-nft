import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cliente, ErroApi } from '@/api/cliente';
import { chaves } from '@/api/consultas';
import { useSessao } from '@/hooks/useSessao';
import { Botao } from '@/componentes/ui/Botao';
import { Campo } from '@/componentes/ui/Campo';

export const Route = createFileRoute('/perfil/')({
  component: DadosDoPerfil,
});

function DadosDoPerfil() {
  const { usuario } = useSessao();
  const qc = useQueryClient();
  const [erro, definirErro] = useState<ErroApi | null>(null);
  const [salvo, definirSalvo] = useState(false);

  const salvar = useMutation({
    mutationFn: async (nome: string) => (await cliente.patch('/perfil', { nome })).data,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: chaves.sessao }); },
  });

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirErro(null);
    definirSalvo(false);
    const dados = new FormData(evento.currentTarget);

    try {
      await salvar.mutateAsync(String(dados.get('nome') ?? ''));
      definirSalvo(true);
    } catch (e) {
      definirErro(e instanceof ErroApi ? e : null);
    }
  }

  return (
    <section aria-labelledby="perfil-titulo" className="flex flex-col gap-6">
      <h1 id="perfil-titulo" className="text-title text-foreground">
        Perfil do colecionador
      </h1>

      <form
        onSubmit={(e) => void enviar(e)}
        className="grid max-w-2xl gap-5 sm:grid-cols-2"
        noValidate
      >
        <Campo
          rotulo="Nome de exibicao"
          name="nome"
          defaultValue={usuario?.nome ?? ''}
          obrigatorio
          erro={erro?.campos?.nome}
        />
        <Campo
          rotulo="E-mail"
          name="email"
          type="email"
          defaultValue={usuario?.email ?? ''}
          readOnly
          apoio="O e-mail da conta nao pode ser alterado na simulacao."
          className="opacity-60"
        />

        <div className="flex items-center gap-4 sm:col-span-2">
          <Botao type="submit" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </Botao>

          <p aria-live="polite" className="text-caption text-success">
            {salvo && 'Perfil atualizado.'}
          </p>
        </div>
      </form>
    </section>
  );
}
