import { createFileRoute, Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { formatarEth } from '@/lib/decimal';
import { useCarrinho, useMudarQuantidade, useRemoverItem } from '@/hooks/useCarrinho';
import { useSessao } from '@/hooks/useSessao';
import { Botao } from '@/componentes/ui/Botao';
import { Trilha } from '@/componentes/Trilha';
import { Erro, Esqueleto, Vazio } from '@/componentes/Estados';
import { Quantidade } from '@/componentes/carrinho/Quantidade';
import { ResumoCotacao } from '@/componentes/carrinho/ResumoCotacao';

export const Route = createFileRoute('/carrinho')({
  component: Carrinho,
});

function Carrinho() {
  const { data: cotacao, isPending, isError, refetch } = useCarrinho();
  const { autenticado } = useSessao();
  const mudarQuantidade = useMudarQuantidade();
  const remover = useRemoverItem();

  return (
    <>
      <Trilha
        passos={[
          { rotulo: 'Início', para: '/' },
          { rotulo: 'Mercado', para: '/mercado' },
          { rotulo: 'Carrinho' },
        ]}
      />

      <div className="conteudo py-8">
        <h1 className="mb-8 text-display text-foreground">Carrinho</h1>

        {isPending && (
          <div role="status" aria-label="Carregando carrinho" className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, i) => <Esqueleto key={i} className="h-24 w-full" />)}
          </div>
        )}

        {isError && <Erro aoTentarDeNovo={() => void refetch()} />}

        {cotacao && cotacao.itens.length === 0 && (
          <Vazio
            titulo="Seu carrinho está vazio"
            descricao="Explore o mercado e adicione peças para continuar."
            acao={
              <Botao asChild>
                <Link to="/mercado">Explorar o mercado</Link>
              </Botao>
            }
          />
        )}

        {cotacao && cotacao.itens.length > 0 && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Itens no carrinho, com preço, quantidade e total por peça
              </caption>
              <thead>
                <tr className="border-b border-border-subtle text-caption text-muted">
                  <th scope="col" className="pb-3 font-normal">NFT</th>
                  <th scope="col" className="pb-3 font-normal">Preço</th>
                  <th scope="col" className="pb-3 font-normal">Edições</th>
                  <th scope="col" className="pb-3 text-right font-normal">Total</th>
                  <th scope="col" className="pb-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {cotacao.itens.map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle align-middle">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imagemUrl}
                          alt=""
                          width={56}
                          height={56}
                          loading="lazy"
                          className="size-14 shrink-0 rounded-[3px] border border-border-subtle object-cover"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-label text-foreground">{item.titulo}</span>
                          <span className="text-caption text-muted">{item.rotuloEdicao}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-caption text-foreground">
                      {formatarEth(item.precoUnitarioEth)}
                    </td>

                    <td className="py-4">
                      <Quantidade
                        valor={item.quantidade}
                        maximo={item.disponivel}
                        rotulo={item.titulo}
                        desabilitado={mudarQuantidade.isPending}
                        aoMudar={(quantidade) =>
                          mudarQuantidade.mutate({ id: item.id, quantidade })
                        }
                      />
                    </td>

                    <td className="py-4 text-right text-label font-bold text-primary">
                      {formatarEth(item.subtotalEth)}
                    </td>

                    <td className="py-4 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => remover.mutate(item.id)}
                        aria-label={`Remover ${item.titulo} do carrinho`}
                        className="text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 aria-hidden size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ResumoCotacao
              cotacao={cotacao}
              acao={
                <div className="flex flex-col gap-3">
                  <Botao tamanho="grande" asChild>
                    <Link to={autenticado ? '/pagamento' : '/entrar'}>
                      {autenticado ? 'Conectar e finalizar' : 'Entrar para finalizar'}
                    </Link>
                  </Botao>
                  <Link
                    to="/mercado"
                    className="text-center text-caption text-muted hover:text-primary"
                  >
                    Continuar explorando
                  </Link>
                </div>
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
