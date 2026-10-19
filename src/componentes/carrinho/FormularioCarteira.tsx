import { useState, type FormEvent } from 'react';
import type { RedeCarteira } from '@/api/tipos';
import { ErroApi } from '@/api/cliente';
import { useCriarCarteira } from '@/hooks/useCarteiras';
import { Botao } from '@/componentes/ui/Botao';
import { Campo } from '@/componentes/ui/Campo';

const REDES: Array<{ valor: RedeCarteira; rotulo: string }> = [
  { valor: 'ethereum', rotulo: 'Ethereum' },
  { valor: 'polygon', rotulo: 'Polygon' },
  { valor: 'arbitrum', rotulo: 'Arbitrum' },
];

export function FormularioCarteira({ aoCriar }: { aoCriar?: () => void }) {
  const criar = useCriarCarteira();
  const [erro, definirErro] = useState<ErroApi | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirErro(null);
    const dados = new FormData(evento.currentTarget);
    const formulario = evento.currentTarget;

    try {
      await criar.mutateAsync({
        apelido: String(dados.get('apelido') ?? ''),
        endereco: String(dados.get('endereco') ?? ''),
        rede: String(dados.get('rede') ?? 'ethereum') as RedeCarteira,
      });
      formulario.reset();
      aoCriar?.();
    } catch (e) {
      definirErro(e instanceof ErroApi ? e : null);
    }
  }

  return (
    <form onSubmit={(e) => void enviar(e)} className="flex flex-col gap-4" noValidate>
      <Campo
        rotulo="Apelido da carteira"
        name="apelido"
        obrigatorio
        erro={erro?.campos?.apelido}
      />
      <Campo
        rotulo="Endereço da carteira"
        name="endereco"
        placeholder="0x seguido de 40 caracteres"
        obrigatorio
        erro={erro?.campos?.endereco}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="rede" className="text-label text-foreground">
          Rede<span className="ml-1 text-primary">*</span>
        </label>
        <select
          id="rede"
          name="rede"
          defaultValue="ethereum"
          className="h-10 rounded-[3px] border border-border-subtle bg-surface
                     px-3 text-body text-foreground focus:border-primary"
        >
          {REDES.map((rede) => (
            <option key={rede.valor} value={rede.valor}>{rede.rotulo}</option>
          ))}
        </select>
      </div>

      {erro && !erro.campos && (
        <p role="alert" className="text-caption text-danger">{erro.message}</p>
      )}

      <Botao type="submit" disabled={criar.isPending} className="self-start">
        {criar.isPending ? 'Salvando...' : 'Salvar carteira'}
      </Botao>
    </form>
  );
}
