import { AtSign, Globe, MessageCircle, Rss, Share2 } from 'lucide-react';

const COLUNAS = [
  {
    titulo: 'Meu perfil',
    itens: ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'],
  },
  {
    titulo: 'Central de ajuda',
    itens: ['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política de mercado', 'Denunciar item'],
  },
  {
    titulo: 'Coleções',
    itens: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'],
  },
];

// lucide-react removeu os ícones de marca; os nomes ficam no rótulo acessivel.
const REDES = [
  { Icone: Globe, nome: 'Facebook' },
  { Icone: AtSign, nome: 'Instagram' },
  { Icone: MessageCircle, nome: 'Twitter' },
  { Icone: Share2, nome: 'LinkedIn' },
  { Icone: Rss, nome: 'YouTube' },
];

export function Rodape() {
  return (
    <footer className="mt-16 bg-surface">
      <div className="conteudo">
        <div
          className="flex flex-col gap-4 border-b border-border-subtle bg-surface-2 px-6 py-5
                     text-caption text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-label tracking-[0.2em] text-foreground">KURIO</span>
          <span>Feito para colecionadores, criadores e cultura</span>
          <a href="mailto:contato@kurio.test" className="hover:text-primary">
            contato@kurio.test
          </a>
          <a href="tel:+551140028922" className="hover:text-primary">
            +55 11 4002 8922
          </a>
        </div>

        <div className="grid gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {COLUNAS.map((coluna) => (
            <nav key={coluna.titulo} aria-label={coluna.titulo}>
              <h2 className="mb-4 text-label text-foreground">{coluna.titulo}</h2>
              <ul className="flex flex-col gap-2">
                {coluna.itens.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-caption text-muted hover:text-primary">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="mb-4 text-label text-foreground">Redes sociais</h2>
            <ul className="flex flex-wrap gap-2">
              {REDES.map(({ Icone, nome }) => (
                <li key={nome}>
                  <a
                    href="#"
                    aria-label={nome}
                    className="flex size-8 items-center justify-center rounded-[3px]
                               bg-primary text-primary-ink hover:bg-primary-hover"
                  >
                    <Icone aria-hidden size={15} />
                  </a>
                </li>
              ))}
            </ul>

            <h2 className="mb-3 mt-8 text-label text-foreground">Carteiras compatíveis</h2>
            <ul className="flex flex-wrap gap-2">
              {['MetaMask', 'WalletConnect', 'Coinbase'].map((carteira) => (
                <li
                  key={carteira}
                  className="rounded-[3px] border border-border-strong px-2 py-1
                             text-[10px] uppercase tracking-wider text-secondary"
                >
                  {carteira}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-center gap-1 border-t border-border-subtle
                     px-6 py-6 text-center text-caption text-muted"
        >
          <p>© 2026 Kurio. Propriedade digital para todos.</p>
          <p>Desenvolvido por Claudio Alvarenga</p>
        </div>
      </div>
    </footer>
  );
}
