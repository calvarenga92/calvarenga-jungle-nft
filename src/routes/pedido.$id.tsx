import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { consultaPedido } from '@/api/consultas';
import { formatarEth } from '@/lib/decimal';
import { Botao } from '@/componentes/ui/Botao';
import { Trilha } from '@/componentes/Trilha';
import { Erro, Esqueleto } from '@/componentes/Estados';

export const Route = createFileRoute('/pedido/$id')({
  component: ConfirmacaoPedido,
});

function ConfirmacaoPedido() {
  const { id } = Route.useParams();
  const { data: pedido, isPending, isError, refetch } = useQuery(consultaPedido(id));

  if (isPending) {
    return (
      <div role="status" aria-label="Carregando pedido" className="conteudo py-16">
        <Esqueleto className="mx-auto h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="conteudo py-16">
        <Erro aoTentarDeNovo={() => void refetch()} />
      </div>
    );
  }

  const recusado = pedido.status === 'RECUSADO';
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(pedido.criadoEm));

  return (
    <>
      <Trilha
        passos={[
          { rotulo: 'Início', para: '/' },
          { rotulo: 'Mercado', para: '/mercado' },
          { rotulo: 'Confirmação' },
        ]}
      />

      <div className="conteudo py-8">
        <section
          aria-labelledby="pedido-titulo"
          className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl
                     border border-border-subtle bg-surface p-8"
        >
          <header className="flex flex-col items-center gap-3 text-center">
            {recusado ? (
              <XCircle aria-hidden size={40} className="text-danger" />
            ) : (
              <CheckCircle2 aria-hidden size={40} className="text-success" />
            )}

            <h1 id="pedido-titulo" className="text-title text-foreground">
              {recusado
                ? 'A transação foi recusada'
                : 'Seus NFTs agora estão na sua carteira'}
            </h1>

            <p className="text-caption text-muted">
              {recusado
                ? pedido.motivoRecusa
                : 'Transação confirmada na Ethereum. A propriedade foi transferida e registrada na rede.'}
            </p>
          </header>

          <dl className="grid gap-4 border-y border-border-subtle py-4 text-caption sm:grid-cols-4">
            <Dado termo="ID da transação" valor={pedido.id} />
            <Dado termo="Data" valor={dataFormatada} />
            <Dado termo="Total" valor={formatarEth(pedido.totalEth)} />
            <Dado termo="Carteira" valor={pedido.carteira.apelido} />
          </dl>

          <div>
            <h2 className="mb-3 text-label text-foreground">Detalhes da transação</h2>
            <ul className="flex flex-col gap-3">
              {pedido.itens.map((item) => (
                <li key={`${item.nftId}-${item.edicaoId}`} className="flex items-center gap-3">
                  <img
                    src={item.imagemUrl}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className="size-11 shrink-0 rounded-xl border border-border-subtle object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-caption text-foreground">{item.titulo}</span>
                    <span className="text-caption text-muted">
                      {item.rotuloEdicao} · {item.quantidade}x
                    </span>
                  </div>
                  <span className="text-caption font-bold text-primary">
                    {formatarEth(item.subtotalEth)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="flex flex-col gap-2 border-t border-border-subtle pt-4 text-caption">
            <Linha termo="Subtotal" valor={formatarEth(pedido.subtotalEth)} />
            {pedido.descontoEth !== '0' && (
              <Linha termo="Desconto" valor={`(-) ${formatarEth(pedido.descontoEth)}`} />
            )}
            <Linha termo="Taxa de rede" valor={formatarEth(pedido.taxaRedeEth)} />
            <div className="flex justify-between border-t border-border-subtle pt-2">
              <dt className="text-label text-foreground">Total</dt>
              <dd className="text-label font-bold text-primary">
                {formatarEth(pedido.totalEth)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap justify-center gap-3">
            {pedido.referenciaTransacao && (
              <Botao asChild>
                <a
                  href={`https://etherscan.io/tx/${pedido.referenciaTransacao}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Ver na Etherscan
                  <ExternalLink aria-hidden size={14} />
                </a>
              </Botao>
            )}
            <Botao variante="contorno" asChild>
              <Link to="/mercado">Continuar explorando</Link>
            </Botao>
          </div>
        </section>
      </div>
    </>
  );
}

function Dado({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted">{termo}</dt>
      <dd className="truncate text-foreground" title={valor}>{valor}</dd>
    </div>
  );
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{termo}</dt>
      <dd className="text-foreground">{valor}</dd>
    </div>
  );
}
