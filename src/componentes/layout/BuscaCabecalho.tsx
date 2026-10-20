import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';

export function BuscaCabecalho() {
  const [aberta, definirAberta] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const navegar = useNavigate();

  useEffect(() => {
    if (aberta) campo.current?.focus();
  }, [aberta]);

  function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const termo = campo.current?.value.trim();

    void navegar({
      to: '/mercado',
      search: termo ? { busca: termo } : {},
    });
    definirAberta(false);
  }

  if (!aberta) {
    return (
      <button
        type="button"
        onClick={() => definirAberta(true)}
        aria-label="Buscar NFTs"
        aria-expanded={false}
        className="flex size-10 items-center justify-center text-muted
                   transition-colors hover:text-foreground"
      >
        <Search aria-hidden size={18} />
      </button>
    );
  }

  return (
    <form
      role="search"
      onSubmit={buscar}
      onKeyDown={(e) => { if (e.key === 'Escape') definirAberta(false); }}
      className="flex items-center gap-1"
    >
      <label htmlFor="busca-catalogo" className="sr-only">
        Buscar por título, criador ou coleção
      </label>
      <input
        id="busca-catalogo"
        ref={campo}
        type="search"
        placeholder="título, criador, coleção"
        className="h-10 w-40 rounded-[3px] border border-border-subtle bg-surface
                   px-3 text-caption text-foreground focus:border-primary sm:w-56"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="flex size-10 items-center justify-center text-primary
                   transition-colors hover:text-primary-hover"
      >
        <Search aria-hidden size={18} />
      </button>
      <button
        type="button"
        onClick={() => definirAberta(false)}
        aria-label="Fechar busca"
        className="flex size-10 items-center justify-center text-muted
                   transition-colors hover:text-foreground"
      >
        <X aria-hidden size={16} />
      </button>
    </form>
  );
}
