import { CENARIOS, cenarioAtual, definirCenario } from '@/mocks/cenarios';

/**
 * O cenário fica gravado para sobreviver à navegação. Sem este aviso, quem
 * abrisse um cenário de falha continuaria nele sem entender o motivo.
 */
export function AvisoCenario() {
  const cenario = cenarioAtual();
  if (cenario === 'padrao') return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1
                 bg-primary px-6 py-2 text-center text-caption text-primary-ink"
    >
      <span>
        <strong className="font-bold">Cenário de simulação ativo:</strong>{' '}
        {cenario} — {CENARIOS[cenario]}
      </span>

      <button
        type="button"
        onClick={() => {
          definirCenario('padrao');
          window.location.search = '';
        }}
        className="rounded-[3px] border border-primary-ink/40 px-2 py-0.5
                   font-bold transition-colors hover:bg-primary-ink/10"
      >
        voltar ao padrão
      </button>
    </div>
  );
}
