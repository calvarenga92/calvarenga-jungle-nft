import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Os tamanhos de texto do tema (text-label, text-caption...) não são do Tailwind
 * padrão; sem registrar, o tailwind-merge os confunde com cor e descarta a cor.
 */
const mesclar = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-lg', 'display', 'title', 'body', 'label', 'caption'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return mesclar(clsx(inputs));
}
