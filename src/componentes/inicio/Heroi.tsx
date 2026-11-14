import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Botao } from '@/componentes/ui/Botao';

export function Heroi() {
  return (
    <section className="conteudo py-8 lg:py-12">
      <div
        className="fundo-topo relative grid items-center gap-10 overflow-hidden rounded-[2rem]
                   p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-64 -left-32 size-[32rem] rounded-full
                     bg-[radial-gradient(circle,var(--topo-brilho),transparent_70%)]"
        />

        <div className="relative flex flex-col gap-6">
          <p className="text-caption font-bold uppercase tracking-[0.12em] opacity-85">
            Bem-vindo à Kurio
          </p>

          <h1 className="text-display lg:text-display-lg">
            Seja dono do futuro da arte digital.
          </h1>

          <p className="max-w-lg text-body opacity-90">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <Botao variante="claro" tamanho="grande" className="self-start" asChild>
            <Link to="/mercado">
              Explorar o mercado
              <ArrowRight aria-hidden size={16} />
            </Link>
          </Botao>
        </div>

        <div
          className="relative overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgb(20_0_40/0.8)]
                     mx-auto w-full max-w-[420px]"
        >
          <img
            src="/nfts/nft-01.png"
            alt="Emerald Ape #042, peça em destaque da semana"
            width={480}
            height={480}
            fetchPriority="high"
            decoding="async"
            className="aspect-square w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
