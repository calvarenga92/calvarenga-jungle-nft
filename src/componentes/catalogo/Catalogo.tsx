import { useQuery } from '@tanstack/react-query';
import { consultaNfts } from '@/api/consultas';
import { ORDENACOES } from '@/lib/consultaNfts';
import { paraConsulta, type BuscaCatalogo } from '@/lib/busca';
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

  const colecoes = busca.colecao ?? [];

  function alternarColecao(id: string) {
    const proximas = colecoes.includes(id)
      ? colecoes.filter((c) => c !== id)
      : [...colecoes, id];
    aoMudarBusca({ colecao: proximas.length > 0 ? proximas : undefined, pagina: undefined });
  }

  return (
    <section aria-labelledby="titulo-catalogo" className="conteudo py-8">
      <h2 id="titulo-catalogo" className="sr-only">Catalogo de NFTs</h2>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <Filtros
          colecoesSelecionadas={colecoes}
          somenteDisponiveis={busca.disponiveis ?? false}
          aoAlternarColecao={alternarColecao}
          aoAlternarDisponiveis={(valor) =>
            aoMudarBusca({ disponiveis: valor || undefined, pagina: undefined })
          }
          aoLimpar={() =>
            aoMudarBusca({ colecao: undefined, disponiveis: undefined, pagina: undefined })
          }
        />

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="text-caption text-muted">
              {isPending
                ? 'Carregando catalogo...'
                : `${data?.total ?? 0} ${data?.total === 1 ? 'peca' : 'pecas'}`}
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
                className="h-9 rounded-[3px] border border-border-subtle bg-surface
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
              descricao="O catalogo nao respondeu. Isso costuma ser temporario."
              aoTentarDeNovo={() => void refetch()}
            />
          )}

          {data && data.itens.length === 0 && (
            <Vazio
              titulo="Nenhuma peca encontrada"
              descricao="Nenhum NFT corresponde aos filtros atuais. Tente remover alguma restricao."
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
