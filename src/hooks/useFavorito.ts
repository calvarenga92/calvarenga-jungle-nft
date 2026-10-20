import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cliente } from '@/api/cliente';
import { chaves } from '@/api/consultas';
import type { NftResumo, Pagina } from '@/api/tipos';

/**
 * Atualização otimista: a interface responde antes da rede e volta ao estado
 * anterior se o servidor recusar.
 */
export function useAlternarFavorito() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (nft: NftResumo) => {
      if (nft.favorito) await cliente.delete(`/favoritos/${nft.id}`);
      else await cliente.put(`/favoritos/${nft.id}`);
    },

    onMutate: async (nft) => {
      await qc.cancelQueries({ queryKey: ['nfts'] });
      const anterior = qc.getQueriesData<Pagina<NftResumo>>({ queryKey: ['nfts'] });

      qc.setQueriesData<Pagina<NftResumo>>({ queryKey: ['nfts'] }, (pagina) =>
        pagina
          ? {
              ...pagina,
              itens: pagina.itens.map((item) =>
                item.id === nft.id ? { ...item, favorito: !item.favorito } : item,
              ),
            }
          : pagina,
      );

      return { anterior };
    },

    onError: (_erro, _nft, contexto) => {
      contexto?.anterior.forEach(([chave, dados]) => qc.setQueryData(chave, dados));
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: chaves.favoritos });
    },
  });
}
