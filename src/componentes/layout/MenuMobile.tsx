import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';

interface Props {
  itens: ReadonlyArray<{ para: '/' | '/mercado' | '/criadores' | '/aprenda'; rotulo: string }>;
}

export function MenuMobile({ itens }: Props) {
  const [aberto, definirAberto] = useState(false);

  return (
    <Dialog.Root open={aberto} onOpenChange={definirAberto}>
      <Dialog.Trigger
        className="flex size-10 items-center justify-center text-muted
                   transition-colors hover:text-foreground md:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu aria-hidden size={20} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col
                     gap-2 border-l border-border-subtle bg-surface p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-label tracking-[0.2em] text-foreground">
              KURIO
            </Dialog.Title>
            <Dialog.Close
              className="flex size-9 items-center justify-center text-muted
                         transition-colors hover:text-foreground"
              aria-label="Fechar menu"
            >
              <X aria-hidden size={18} />
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Navegação principal do marketplace
          </Dialog.Description>

          <nav aria-label="Navegação principal (mobile)">
            <ul className="flex flex-col">
              {itens.map((item) => (
                <li key={item.para}>
                  <Link
                    to={item.para}
                    onClick={() => definirAberto(false)}
                    className="block border-b border-border-subtle py-3 text-label
                               text-muted transition-colors hover:text-foreground"
                    activeProps={{ className: 'text-primary [&]:text-primary' }}
                    activeOptions={{ exact: item.para === '/' }}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
