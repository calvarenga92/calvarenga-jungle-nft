import { useQuery } from '@tanstack/react-query';
import { consultaColecoes } from '@/api/consultas';
import { Esqueleto } from '@/componentes/Estados';
import { Botao } from '@/componentes/ui/Botao';
import { FiltroPreco } from './FiltroPreco';

interface Props {
  colecoesSelecionadas: string[];
  somenteDisponiveis: boolean;
  precoMin?: string;
  precoMax?: string;
  aoAplicarPreco: (faixa: { precoMin?: string; precoMax?: string }) => void;
  aoAlternarColecao: (id: string) => void;
  aoAlternarDisponiveis: (valor: boolean) => void;
  aoLimpar: () => void;
}

export function Filtros({
  colecoesSelecionadas,
  somenteDisponiveis,
  precoMin,
  precoMax,
  aoAplicarPreco,
  aoAlternarColecao,
  aoAlternarDisponiveis,
  aoLimpar,
}: Props) {
  const { data: colecoes, isPending } = useQuery(consultaColecoes);
  const temFiltro =
    colecoesSelecionadas.length > 0 || somenteDisponiveis || Boolean(precoMin || precoMax);

  return (
    <aside
      aria-label="Filtros do catálogo"
      className="flex h-fit flex-col gap-8 rounded-[3px] border border-border-subtle
                 bg-surface p-5 lg:sticky lg:top-6"
    >
      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 text-label text-foreground">Coleções</legend>

        {isPending
          ? Array.from({ length: 4 }, (_, i) => <Esqueleto key={i} className="h-5 w-full" />)
          : colecoes?.map((colecao) => (
              <label
                key={colecao.id}
                className="flex cursor-pointer items-center gap-3 text-caption text-muted
                           transition-colors hover:text-foreground has-checked:text-primary"
              >
                <input
                  type="checkbox"
                  checked={colecoesSelecionadas.includes(colecao.id)}
                  onChange={() => aoAlternarColecao(colecao.id)}
                  className="size-3.5 shrink-0 accent-[#d28a4c]"
                />
                {colecao.nome}
              </label>
            ))}
      </fieldset>

      <FiltroPreco precoMin={precoMin} precoMax={precoMax} aoAplicar={aoAplicarPreco} />

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 text-label text-foreground">Disponibilidade</legend>
        <label className="flex cursor-pointer items-center gap-3 text-caption text-muted
                          transition-colors hover:text-foreground has-checked:text-primary">
          <input
            type="checkbox"
            checked={somenteDisponiveis}
            onChange={(e) => aoAlternarDisponiveis(e.target.checked)}
            className="size-3.5 shrink-0 accent-[#d28a4c]"
          />
          Somente com unidades
        </label>
      </fieldset>

      {temFiltro && (
        <Botao variante="contorno" tamanho="pequeno" onClick={aoLimpar}>
          Limpar filtros
        </Botao>
      )}
    </aside>
  );
}
