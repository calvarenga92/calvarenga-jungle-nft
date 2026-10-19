import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

type Passo = { rotulo: string; para?: '/' | '/mercado' | '/carrinho' };

export function Trilha({ passos }: { passos: Passo[] }) {
  return (
    <nav aria-label="Trilha de navegacao" className="conteudo pt-8">
      <ol className="flex flex-wrap items-center gap-2 text-caption text-muted">
        {passos.map((passo, indice) => (
          <li key={passo.rotulo} className="flex items-center gap-2">
            {indice > 0 && <ChevronRight aria-hidden size={12} />}
            {passo.para ? (
              <Link to={passo.para} className="hover:text-primary">{passo.rotulo}</Link>
            ) : (
              <span aria-current="page" className="text-foreground">{passo.rotulo}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
