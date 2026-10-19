import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import type { NftResumo } from '@/api/tipos';
import { formatarEth } from '@/lib/decimal';
import { cn } from '@/lib/utils';

interface Props {
  nft: NftResumo;
  aoAlternarFavorito?: (nft: NftResumo) => void;
}

export function CartaoNft({ nft, aoAlternarFavorito }: Props) {
  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[3px] border border-border-subtle bg-surface">
        <img
          src={nft.imagemUrl}
          alt={nft.titulo}
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          className="aspect-square w-full object-cover transition-transform
                     duration-300 group-hover:scale-[1.03]"
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
            // z-10 mantem o botao acima do link esticado que cobre o cartao
            className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center
                       rounded-full bg-ink/70 text-foreground backdrop-blur
                       transition-colors hover:text-primary"
          >
            <Heart
              aria-hidden
              size={15}
              className={cn(nft.favorito && 'fill-primary text-primary')}
            />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-label text-foreground">
          <Link
            to="/nft/$id"
            params={{ id: nft.slug }}
            className="after:absolute after:inset-0 hover:text-primary"
          >
            {nft.titulo}
          </Link>
        </h3>
        <p className="text-label font-bold text-primary">
          {formatarEth(nft.precoMinimoEth)}
        </p>
        <p className="text-caption text-muted">{nft.autor}</p>
      </div>
    </article>
  );
}
