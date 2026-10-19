import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, LogIn } from 'lucide-react';
import { consultaCarrinho } from '@/api/consultas';
import { useSessao } from '@/hooks/useSessao';
import { Botao } from '@/componentes/ui/Botao';
import { IndicadorConexao } from './IndicadorConexao';

const NAVEGACAO = [
  { para: '/', rotulo: 'Início' },
  { para: '/mercado', rotulo: 'Mercado' },
  { para: '/criadores', rotulo: 'Criadores' },
  { para: '/aprenda', rotulo: 'Aprenda' },
] as const;

export function Cabecalho() {
  const { autenticado, usuario } = useSessao();
  const { data: carrinho } = useQuery(consultaCarrinho);
  const quantidade = carrinho?.itens.reduce((t, i) => t + i.quantidade, 0) ?? 0;

  return (
    <header className="border-b border-border-subtle">
      <div className="conteudo flex h-20 items-center justify-between gap-6">
        <Link
          to="/"
          className="text-title tracking-[0.2em] text-foreground"
          aria-label="Kurio, página inicial"
        >
          KURIO
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAVEGACAO.map((item) => (
              <li key={item.para}>
                <Link
                  to={item.para}
                  className="block py-6 text-label text-muted transition-colors hover:text-foreground"
                  activeProps={{
                    className:
                      'text-primary border-b-2 border-primary [&]:text-primary',
                  }}
                  activeOptions={{ exact: item.para === '/' }}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <IndicadorConexao />

          <Botao variante="fantasma" tamanho="icone" aria-label="Buscar NFTs">
            <Search aria-hidden size={18} />
          </Botao>

          <Botao variante="fantasma" tamanho="icone" asChild>
            <Link
              to="/carrinho"
              aria-label={
                quantidade > 0
                  ? `Carrinho com ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`
                  : 'Carrinho vazio'
              }
              className="relative"
            >
              <ShoppingCart aria-hidden size={18} />
              {quantidade > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center
                             justify-center rounded-full bg-primary text-[10px]
                             font-bold text-primary-ink"
                >
                  {quantidade > 9 ? '9+' : quantidade}
                </span>
              )}
            </Link>
          </Botao>

          {autenticado ? (
            <Botao variante="contorno" asChild>
              <Link to="/perfil">{usuario?.nome.split(' ')[0]}</Link>
            </Botao>
          ) : (
            <Botao asChild>
              <Link to="/entrar">
                <LogIn aria-hidden size={16} />
                Entrar
              </Link>
            </Botao>
          )}
        </div>
      </div>
    </header>
  );
}
