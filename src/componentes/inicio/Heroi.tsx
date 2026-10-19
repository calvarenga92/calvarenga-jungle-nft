import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Botao } from '@/componentes/ui/Botao';

export function Heroi() {
  return (
    <section className="conteudo grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <p className="text-label text-secondary">Bem-vindo a Kurio</p>

        <h1 className="text-display uppercase text-foreground lg:text-display-lg">
          Seja dono do futuro da arte digital
        </h1>

        <p className="max-w-lg text-body text-muted">
          Descubra NFTs selecionados de criadores emergentes e consagrados.
          Colecione arte digital rara, apoie artistas e tenha uma parte da
          cultura da internet.
        </p>

        <Botao tamanho="grande" className="self-start uppercase tracking-wider" asChild>
          <Link to="/mercado">
            Explorar
            <ArrowRight aria-hidden size={16} />
          </Link>
        </Botao>
      </div>

      <div
        className="overflow-hidden rounded-[3px] border border-border-subtle bg-surface
                   lg:mx-auto lg:max-w-[400px]"
      >
        <img
          src="/nfts/nft-01.svg"
          alt="Peca em destaque da colecao Golden Apes"
          width={400}
          height={400}
          fetchPriority="high"
          decoding="async"
          className="aspect-square w-full object-cover"
        />
      </div>
    </section>
  );
}
