const ARTIGOS = [
  {
    id: 'cunhagem',
    imagem: '/nfts/nft-03.svg',
    titulo: 'O que muda quando a cunhagem é aberta',
    resumo: 'Edição limitada, fila de espera e preço dinâmico: como cada formato afeta quem coleciona.',
    data: '12 de outubro',
  },
  {
    id: 'carteira',
    imagem: '/nfts/nft-06.svg',
    titulo: 'Carteira quente ou fria para começar',
    resumo: 'Onde guardar o que você comprou, e por que a resposta depende de quanto você movimenta.',
    data: '05 de outubro',
  },
  {
    id: 'royalties',
    imagem: '/nfts/nft-09.svg',
    titulo: 'Royalties de criador na prática',
    resumo: 'Como a porcentagem do autor é registrada no contrato e o que acontece na revenda.',
    data: '28 de setembro',
  },
  {
    id: 'raridade',
    imagem: '/nfts/nft-11.svg',
    titulo: 'Raridade não é só o atributo mais raro',
    resumo: 'A combinação entre traços importa mais que o traço isolado. Um exemplo com números.',
    data: '21 de setembro',
  },
];

export function Blog() {
  return (
    <section aria-labelledby="blog-titulo" className="conteudo mt-24">
      <header className="mb-8 flex flex-col gap-2 text-center">
        <h2 id="blog-titulo" className="text-display text-foreground">
          Diário da Cunhagem
        </h2>
        <p className="text-caption text-muted">
          Histórias, guias e leituras de mercado para quem coleciona arte digital.
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ARTIGOS.map((artigo) => (
          <li key={artigo.id}>
            <article className="group flex h-full flex-col gap-3">
              <div className="overflow-hidden rounded-[3px] border border-border-subtle bg-surface">
                <img
                  src={artigo.imagem}
                  alt=""
                  width={300}
                  height={180}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[5/3] w-full object-cover transition-transform
                             duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <time className="text-caption text-secondary">{artigo.data}</time>

              <h3 className="text-label text-foreground">
                <a href="#" className="hover:text-primary">{artigo.titulo}</a>
              </h3>

              <p className="text-caption text-muted">{artigo.resumo}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
