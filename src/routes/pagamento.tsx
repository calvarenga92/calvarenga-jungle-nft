import { useEffect, useState } from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { ErroApi } from '@/api/cliente';
import { consultaSessao } from '@/api/consultas';
import { cn } from '@/lib/utils';
import { useCarrinho } from '@/hooks/useCarrinho';
import { useCarteiras } from '@/hooks/useCarteiras';
import { useFinalizarPedido } from '@/hooks/usePedido';
import { Botao } from '@/componentes/ui/Botao';
import { Trilha } from '@/componentes/Trilha';
import { Erro, Esqueleto, Vazio } from '@/componentes/Estados';
import { ResumoCotacao } from '@/componentes/carrinho/ResumoCotacao';
import { FormularioCarteira } from '@/componentes/carrinho/FormularioCarteira';

export const Route = createFileRoute('/pagamento')({
  beforeLoad: async ({ context }) => {
    const sessao = await context.queryClient.ensureQueryData(consultaSessao).catch(() => null);
    if (!sessao) throw redirect({ to: '/entrar', search: { destino: '/pagamento' } });
  },
  component: Pagamento,
});

function Pagamento() {
  const { data: cotacao, isPending, isError, refetch } = useCarrinho();
  const { data: carteiras, isPending: carregandoCarteiras } = useCarteiras();
  const finalizar = useFinalizarPedido();
  const navegar = useNavigate();

  const [carteiraId, definirCarteiraId] = useState<string | null>(null);

  useEffect(() => {
    if (!carteiraId && carteiras?.length) {
      definirCarteiraId((carteiras.find((c) => c.principal) ?? carteiras[0]).id);
    }
  }, [carteiras, carteiraId]);

  async function confirmar() {
    if (!cotacao || !carteiraId) return;
    try {
      const pedido = await finalizar.mutateAsync({
        versaoCotacao: cotacao.versao,
        carteiraId,
      });
      void navegar({ to: '/pedido/$id', params: { id: pedido.id } });
    } catch {
      // o erro aparece na interface a partir de finalizar.error
    }
  }

  const erro = finalizar.error instanceof ErroApi ? finalizar.error : null;
  const cotacaoVelha = erro?.codigo === 'COTACAO_DESATUALIZADA';

  return (
    <>
      <Trilha
        passos={[
          { rotulo: 'Início', para: '/' },
          { rotulo: 'Carrinho', para: '/carrinho' },
          { rotulo: 'Pagamento' },
        ]}
      />

      <div className="conteudo py-8">
        <h1 className="mb-8 text-display text-foreground">Pagamento</h1>

        {isPending && <Esqueleto className="h-64 w-full" />}
        {isError && <Erro aoTentarDeNovo={() => void refetch()} />}

        {cotacao && cotacao.itens.length === 0 && (
          <Vazio
            titulo="Não há nada para pagar"
            descricao="Seu carrinho está vazio. Adicione peças antes de finalizar."
            acao={<Botao asChild><Link to="/mercado">Explorar o mercado</Link></Botao>}
          />
        )}

        {cotacao && cotacao.itens.length > 0 && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <section aria-labelledby="carteira-titulo" className="flex flex-col gap-6">
              <h2 id="carteira-titulo" className="text-title text-foreground">
                Carteira e rede
              </h2>

              {carregandoCarteiras && <Esqueleto className="h-24 w-full" />}

              {carteiras && carteiras.length > 0 && (
                <fieldset className="flex flex-col gap-3 border-0 p-0">
                  <legend className="sr-only">Escolha a carteira de destino</legend>
                  {carteiras.map((carteira) => (
                    <label
                      key={carteira.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-4 rounded-[3px]',
                        'border px-4 py-3 transition-colors',
                        carteira.id === carteiraId
                          ? 'border-primary bg-primary/10'
                          : 'border-border-subtle hover:border-secondary',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="carteira"
                          value={carteira.id}
                          checked={carteira.id === carteiraId}
                          onChange={() => definirCarteiraId(carteira.id)}
                          className="accent-[#d28a4c]"
                        />
                        <span className="flex flex-col">
                          <span className="text-label text-foreground">{carteira.apelido}</span>
                          <span className="text-caption text-muted">
                            {carteira.endereco.slice(0, 10)}…{carteira.endereco.slice(-4)}
                          </span>
                        </span>
                      </span>
                      <span className="text-caption uppercase text-secondary">
                        {carteira.rede}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}

              {carteiras && carteiras.length === 0 && (
                <div className="rounded-[3px] border border-border-subtle bg-surface p-6">
                  <h3 className="mb-1 text-label text-foreground">
                    Cadastre uma carteira
                  </h3>
                  <p className="mb-5 text-caption text-muted">
                    Os NFTs comprados são enviados para o endereço informado aqui.
                  </p>
                  <FormularioCarteira />
                </div>
              )}
            </section>

            <ResumoCotacao
              cotacao={cotacao}
              acao={
                <div className="flex flex-col gap-3">
                  {erro && (
                    <p
                      role="alert"
                      className="flex items-start gap-2 rounded-[3px] border border-danger/40
                                 bg-danger/10 px-3 py-2 text-caption text-danger"
                    >
                      <AlertTriangle aria-hidden size={14} className="mt-0.5 shrink-0" />
                      <span>
                        {erro.message}
                        {cotacaoVelha && (
                          <>
                            {' '}
                            <button
                              type="button"
                              onClick={() => void refetch()}
                              className="underline hover:text-foreground"
                            >
                              Atualizar resumo
                            </button>
                          </>
                        )}
                      </span>
                    </p>
                  )}

                  <Botao
                    tamanho="grande"
                    disabled={!carteiraId || finalizar.isPending}
                    onClick={() => void confirmar()}
                  >
                    {finalizar.isPending ? 'Confirmando...' : 'Confirmar compra'}
                  </Botao>

                  <Link
                    to="/carrinho"
                    className="text-center text-caption text-muted hover:text-primary"
                  >
                    Voltar ao carrinho
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
