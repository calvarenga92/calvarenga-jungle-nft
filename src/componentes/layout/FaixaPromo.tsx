import { useState, type FormEvent } from 'react';
import { BellRing, ShieldCheck, Sparkles } from 'lucide-react';
import { Botao } from '@/componentes/ui/Botao';

const DESTAQUES = [
  {
    Icone: ShieldCheck,
    titulo: 'Segurança da carteira',
    texto: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    Icone: Sparkles,
    titulo: 'Criadores em destaque',
    texto: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    Icone: BellRing,
    titulo: 'Alertas de lançamentos',
    texto: 'Receba o calendário de cunhagem, novidades de coleções e análises de mercado.',
  },
];

export function FaixaPromo() {
  const [enviado, definirEnviado] = useState(false);

  function assinar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    evento.currentTarget.reset();
    definirEnviado(true);
  }

  return (
    <section
      aria-labelledby="promo-titulo"
      className="conteudo mt-24 grid gap-8 rounded-xl bg-surface px-6 py-10
                 lg:grid-cols-[2fr_1fr] lg:gap-12"
    >
      <h2 id="promo-titulo" className="sr-only">
        Destaques do marketplace
      </h2>

      <ul className="grid gap-8 sm:grid-cols-3">
        {DESTAQUES.map(({ Icone, titulo, texto }) => (
          <li key={titulo} className="flex flex-col gap-3">
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full
                         bg-primary text-primary-ink"
            >
              <Icone size={18} />
            </span>
            <h3 className="text-label text-foreground">{titulo}</h3>
            <p className="text-caption text-muted">{texto}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-border-subtle lg:border-l lg:pl-12">
        <h3 className="text-label text-foreground">
          Antecipe-se ao próximo lançamento
        </h3>

        <form onSubmit={assinar} className="flex gap-2">
          <label htmlFor="newsletter" className="sr-only">
            Endereço para receber lançamentos
          </label>
          <input
            id="newsletter"
            type="email"
            required
            placeholder="seu endereço de contato"
            className="h-10 min-w-0 flex-1 rounded-xl border border-border-strong
                       bg-ink px-3 text-caption text-foreground focus:border-primary"
          />
          <Botao type="submit">Enviar</Botao>
        </form>

        <p aria-live="polite" className="text-caption text-muted">
          {enviado
            ? 'Pronto. Você receberá os próximos lançamentos.'
            : 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.'}
        </p>
      </div>
    </section>
  );
}
