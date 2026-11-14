import { useQuery } from '@tanstack/react-query';
import { consultaNfts } from '@/api/consultas';
import { ORDENACOES } from '@/lib/consultaNfts';
import { colecoesParaBusca, listaDeColecoes, paraConsulta, type BuscaCatalogo } from '@/lib/busca';
import { useAlternarFavorito } from '@/hooks/useFavorito';
import { useSessao } from '@/hooks/useSessao';
import { Erro, GradeCarregando, Vazio } from '@/componentes/Estados';
import { CartaoNft } from './CartaoNft';
import { Filtros } from './Filtros';
import { Paginacao } from './Paginacao';

interface Props {
  busca: BuscaCatalogo;
  aoMudarBusca: (parcial: Partial<BuscaCatalogo>) => void;
}

export function Catalogo({ busca, aoMudarBusca }: Props) {
  const consulta = paraConsulta(busca);
  const { data, isPending, isError, refetch, isFetching } = useQuery(consultaNfts(consulta));
  const { autenticado } = useSessao();
  const alternarFavorito = useAlternarFavorito();

  const colecoes = listaDeColecoes(busca.colecao);

  function alternarColecao(id: string) {
    const proximas = colecoes.includes(id)
      ? colecoes.filter((c) => c !== id)
      : [...colecoes, id];
    aoMudarBusca({ colecao: colecoesParaBusca(proximas), pagina: undefined });
  }

  return (
    <section aria-labelledby="titulo-catalogo" className="conteudo py-8">
      <h2 id="titulo-catalogo" className="sr-only">Catálogo de NFTs</h2>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <Filtros
          colecoesSelecionadas={colecoes}
          somenteDisponiveis={busca.disponiveis ?? false}
          precoMin={busca.precoMin}
          precoMax={busca.precoMax}
          aoAplicarPreco={(faixa) => aoMudarBusca({ ...faixa, pagina: undefined })}
          aoAlternarColecao={alternarColecao}
          aoAlternarDisponiveis={(valor) =>
            aoMudarBusca({ disponiveis: valor || undefined, pagina: undefined })
          }
          aoLimpar={() =>
            aoMudarBusca({
              colecao: undefined,
              disponiveis: undefined,
              precoMin: undefined,
              precoMax: undefined,
              pagina: undefined,
            })
          }
        />

        <div className="flex flex-col gap-6">
          {busca.busca && (
            <p className="flex flex-wrap items-center gap-2 text-caption text-muted">
              Resultados para
              <span className="text-foreground">&ldquo;{busca.busca}&rdquo;</span>
              <button
                type="button"
                onClick={() => aoMudarBusca({ busca: undefined, pagina: undefined })}
                className="rounded-xl border border-border-subtle px-2 py-0.5
                           text-caption text-muted transition-colors hover:text-primary"
              >
                limpar busca
              </button>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="text-caption text-muted">
              {isPending
                ? 'Carregando catálogo...'
                : `${data?.total ?? 0} ${data?.total === 1 ? 'peça' : 'peças'}`}
            </p>

            <label className="flex items-center gap-2 text-caption text-muted">
              Ordenar por
              <select
                value={busca.ordenacao ?? 'recentes'}
                onChange={(e) =>
                  aoMudarBusca({
                    ordenacao: e.target.value as BuscaCatalogo['ordenacao'],
                    pagina: undefined,
                  })
                }
                className="h-9 rounded-xl border border-border-subtle bg-surface
                           px-2 text-caption text-foreground"
              >
                {ORDENACOES.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                ))}
              </select>
            </label>
          </div>

          {isPending && <GradeCarregando />}

          {isError && !isPending && (
            <Erro
              descricao="O catálogo não respondeu. Isso costuma ser temporário."
              aoTentarDeNovo={() => void refetch()}
            />
          )}

          {data && data.itens.length === 0 && (
            <Vazio
              titulo="Nenhuma peça encontrada"
              descricao={
                busca.busca
                  ? `Nada corresponde a "${busca.busca}". Tente outro termo ou remova os filtros.`
                  : 'Nenhum NFT corresponde aos filtros atuais. Tente remover alguma restrição.'
              }
            />
          )}

          {data && data.itens.length > 0 && (
            <>
              <div
                className="grid grid-cols-2 gap-6 lg:grid-cols-3"
                style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 150ms' }}
              >
                {data.itens.map((nft) => (
                  <CartaoNft
                    key={nft.id}
                    nft={nft}
                    aoAlternarFavorito={
                      autenticado ? (alvo) => alternarFavorito.mutate(alvo) : undefined
                    }
                  />
                ))}
              </div>

              <Paginacao
                pagina={data.pagina}
                totalPaginas={data.totalPaginas}
                aoMudar={(pagina) => aoMudarBusca({ pagina: pagina > 1 ? pagina : undefined })}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
