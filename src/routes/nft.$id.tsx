import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart } from 'lucide-react';
import { consultaNft } from '@/api/consultas';
import { ErroApi } from '@/api/cliente';
import { formatarEth } from '@/lib/decimal';
import { cn } from '@/lib/utils';
import { useAdicionarAoCarrinho } from '@/hooks/useCarrinho';
import { useAlternarFavorito } from '@/hooks/useFavorito';
import { useSessao } from '@/hooks/useSessao';
import { Botao } from '@/componentes/ui/Botao';
import { Trilha } from '@/componentes/Trilha';
import { Erro, Esqueleto, Vazio } from '@/componentes/Estados';
import { Galeria } from '@/componentes/nft/Galeria';
import { SeletorEdicao } from '@/componentes/nft/SeletorEdicao';

export const Route = createFileRoute('/nft/$id')({
  component: DetalheNft,
});

function DetalheNft() {
  const { id } = Route.useParams();
  const { data: nft, isPending, isError, error, refetch } = useQuery(consultaNft(id));
  const [edicaoId, definirEdicao] = useState<string | null>(null);
  const [aviso, definirAviso] = useState<string | null>(null);

  const { autenticado } = useSessao();
  const adicionar = useAdicionarAoCarrinho();
  const alternarFavorito = useAlternarFavorito();

  if (isPending) return <EsqueletoDetalhe />;

  if (isError) {
    const naoEncontrado = error instanceof ErroApi && error.codigo === 'NAO_ENCONTRADO';
    return (
      <div className="conteudo py-16">
        {naoEncontrado ? (
          <Vazio
            titulo="Peca nao encontrada"
            descricao="Este NFT nao existe ou saiu do catalogo."
            acao={
              <Botao variante="contorno" asChild>
                <Link to="/mercado">Voltar ao mercado</Link>
              </Botao>
            }
          />
        ) : (
          <Erro aoTentarDeNovo={() => void refetch()} />
        )}
      </div>
    );
  }

  const selecionada = edicaoId ?? nft.edicoes.find((e) => e.disponivel > 0)?.id ?? nft.edicoes[0].id;
  const edicao = nft.edicoes.find((e) => e.id === selecionada)!;
  const esgotado = nft.edicoes.every((e) => e.disponivel === 0);

  async function adicionarAoCarrinho(nftId: string) {
    definirAviso(null);
    try {
      await adicionar.mutateAsync({ nftId, edicaoId: selecionada, quantidade: 1 });
      definirAviso('Adicionado ao carrinho.');
    } catch (erro) {
      definirAviso(erro instanceof ErroApi ? erro.message : 'Nao foi possivel adicionar.');
    }
  }

  return (
    <>
      <Trilha
        passos={[
          { rotulo: 'Inicio', para: '/' },
          { rotulo: 'Mercado', para: '/mercado' },
          { rotulo: nft.titulo },
        ]}
      />

      <article className="conteudo grid gap-12 py-8 lg:grid-cols-2">
        <Galeria imagens={nft.galeria} titulo={nft.titulo} />

        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <p className="text-caption text-secondary">{nft.colecao.nome}</p>
            <h1 className="text-display text-foreground">{nft.titulo}</h1>
            <p className="text-caption text-muted">
              Criado por <span className="text-foreground">{nft.autor}</span>
            </p>
          </header>

          <p className="text-title font-bold text-primary">
            {formatarEth(edicao.precoEth)}
          </p>

          <p className="max-w-prose text-body text-muted">{nft.descricao}</p>

          <SeletorEdicao
            edicoes={nft.edicoes}
            selecionada={selecionada}
            aoSelecionar={(valor) => { definirEdicao(valor); definirAviso(null); }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Botao
              tamanho="grande"
              disabled={esgotado || edicao.disponivel === 0 || adicionar.isPending}
              onClick={() => void adicionarAoCarrinho(nft.id)}
            >
              <ShoppingCart aria-hidden size={16} />
              {esgotado ? 'Esgotado' : adicionar.isPending ? 'Adicionando...' : 'Comprar'}
            </Botao>

            {autenticado && (
              <Botao
                variante="contorno"
                tamanho="grande"
                aria-pressed={nft.favorito}
                onClick={() => alternarFavorito.mutate(nft)}
              >
                <Heart
                  aria-hidden
                  size={16}
                  className={cn(nft.favorito && 'fill-primary text-primary')}
                />
                {nft.favorito ? 'Favoritado' : 'Favoritar'}
              </Botao>
            )}
          </div>

          <p
            aria-live="polite"
            className={cn(
              'min-h-5 text-caption',
              adicionar.isError ? 'text-danger' : 'text-success',
            )}
          >
            {aviso}
          </p>

          <dl className="grid gap-4 border-t border-border-subtle pt-6 sm:grid-cols-3">
            {nft.atributos.map((atributo) => (
              <div key={atributo.nome} className="flex flex-col gap-1">
                <dt className="text-caption text-muted">{atributo.nome}</dt>
                <dd className="text-label text-foreground">{atributo.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </>
  );
}

function EsqueletoDetalhe() {
  return (
    <div role="status" aria-label="Carregando peca" className="conteudo grid gap-12 py-16 lg:grid-cols-2">
      <Esqueleto className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="h-9 w-2/3" />
        <Esqueleto className="h-5 w-32" />
        <Esqueleto className="h-24 w-full" />
        <Esqueleto className="h-20 w-2/3" />
        <Esqueleto className="h-12 w-48" />
      </div>
    </div>
  );
}
