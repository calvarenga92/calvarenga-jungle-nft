import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { NftResumo } from '@/api/tipos';
import { formatarEth } from '@/lib/decimal';
import { tintaDaArte } from '@/lib/arte';
import { cn } from '@/lib/utils';

interface Props {
  nft: NftResumo;
  aoAlternarFavorito?: (nft: NftResumo) => void;
}

export function CartaoNft({ nft, aoAlternarFavorito }: Props) {
  const tinta = tintaDaArte(nft.imagemUrl);

  return (
    <article
      className="tingido group relative flex flex-col gap-3 rounded-3xl border border-border-subtle p-2
                 transition-[transform,box-shadow] duration-300 hover:-translate-y-1
                 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]"
      style={{ '--tinta': tinta } as CSSProperties}
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-2">
        <img
          src={nft.imagemUrl}
          alt={nft.titulo}
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          className="aspect-square w-full object-cover transition-transform
                     duration-500 group-hover:scale-[1.04]"
        />

        {aoAlternarFavorito && (
          <button
            type="button"
            onClick={() => aoAlternarFavorito(nft)}
            aria-pressed={nft.favorito}
            aria-label={
              nft.favorito
                ? `Remover ${nft.titulo} dos favoritos`
                : `Adicionar ${nft.titulo} aos favoritos`
            }
            // z-10 mantém o botão acima do link esticado que cobre o cartão
            className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center
                       rounded-full bg-surface/85 text-foreground backdrop-blur
                       transition-colors hover:text-primary"
          >
            <Heart
              aria-hidden
              size={16}
              className={cn(nft.favorito && 'fill-primary text-primary')}
            />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-2 pb-2">
        <h3 className="text-label font-bold text-foreground">
          <Link
            to="/nft/$id"
            params={{ id: nft.slug }}
            className="after:absolute after:inset-0 hover:text-primary"
          >
            {nft.titulo}
          </Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-caption text-muted">{nft.autor}</p>
          <p
            data-testid="preco"
            className="shrink-0 rounded-full bg-preco px-2.5 py-1 font-mono text-caption
                       font-bold text-preco-ink"
          >
            {formatarEth(nft.precoMinimoEth)}
          </p>
        </div>
      </div>
    </article>
  );
}
