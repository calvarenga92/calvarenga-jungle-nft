# Kurio — Marketplace de NFTs

Desenvolvido por Claudio Alvarenga.

Desafio técnico de front-end. Marketplace completo com catálogo, carrinho, checkout, perfil e atualizações em tempo real, rodando inteiramente no navegador.

Não existe backend: a API é simulada com MSW, e os eventos de tempo real têm um simulador local por trás da mesma interface do `socket.io-client`. Com as variáveis de ambiente apontando para serviços reais, nada disso entra no bundle.

## Design e fluxo de UX

- [Telas no Figma](https://www.figma.com/design/uTnOgVhzcVUIGBXPrWHoCf?node-id=0-1)
- [Fluxo de UX no Figma](https://www.figma.com/design/uTnOgVhzcVUIGBXPrWHoCf?node-id=25-155): compra e pagamento, com os cinco cenários de rede e o retry idempotente

## Como rodar

Requer Node 20+.

```bash
npm install
npm run dev
```

Contas da simulação: `claudio@kurio.test` ou `marina@kurio.test`, senha `senha12345`.

```bash
npm run verificar    # typecheck + lint + build + testes
npm run test         # só os testes Playwright
npm run test:ui      # modo interativo
```

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · TanStack Router · TanStack Query · Axios · socket.io-client · MSW · Radix · Playwright

## O que está implementado

| Área | Entregue |
|---|---|
| Catálogo | Busca por texto, filtro por coleção, faixa de preço e disponibilidade, ordenação, paginação — tudo refletido na URL |
| Peça | Galeria, seleção de edição, atributos, favoritar, adicionar ao carrinho |
| Carrinho | Quantidade com limite por edição, cupom, cotação recalculada no servidor |
| Checkout | Seleção de carteira, cotação versionada, requisição idempotente |
| Pedido | Recibo imutável com snapshot dos itens |
| Conta | Entrada, cadastro, perfil, carteiras (principal, secundárias) |
| Tempo real | Preço e disponibilidade chegando por evento, com ordenação por versão |
| Temas | Três temas (gradiente quente, noturna neon, elétrica) sobre os mesmos tokens; escolha salva, acessível por teclado e compartilhável por `?tema=` |
| Telas | Carregando, erro, vazio e sem permissão tratados em cada rota |
| Responsivo | Layout de 390px a 1440px, com menu de navegação em sheet no mobile |

## Decisões técnicas

Quatro escolhas sustentam o resto. As outras estão no fim desta seção, em uma linha cada.

As regras de dinheiro, cotação e idempotência não moram neste repositório: vêm do pacote [`@calvarenga92/kurio-regras`](https://www.npmjs.com/package/@calvarenga92/kurio-regras), o mesmo usado pelo [app mobile](https://github.com/calvarenga92/kurio-mobile). Assim, web e mobile calculam o mesmo total e tratam o reenvio do pagamento do mesmo jeito.

### Dinheiro nunca passa por ponto flutuante

Valores em ETH trafegam como string decimal e são somados em `bigint` de 18 casas (pacote `kurio-regras`, reexportado em `src/lib/decimal.ts`). `0.1 + 0.2` em JavaScript dá `0.30000000000000004` — num carrinho, centavo errado que ninguém consegue explicar depois.

Medido: `0.42` mais `0.0042` de taxa dá exatamente `0.4242`; com cupom de 10%, `0.3822`. Com `Number`, o primeiro sairia `0.42419999999999997`.

### Eventos carregam versão, e o cliente a respeita

WebSocket não garante ordem de entrega. Se um evento antigo chega depois de um novo, o preço "volta" na tela e o usuário desconfia do sistema.

Todo evento traz `eventoId` e `versao`. O cliente descarta duplicata pelo id e só aplica se a versão for maior que a exibida (`src/hooks/useTempoReal.ts`). Usei versão em vez de timestamp porque timestamp depende de relógio sincronizado entre instâncias.

O cenário `fora-de-ordem` emite de propósito um evento atrasado antes do atual, e há teste medindo: atualizações aplicadas, zero regressões.

### Checkout idempotente

O pedido vai com header `Idempotency-Key`. A chave nasce com a tentativa e só é trocada quando o pedido é confirmado.

O detalhe que importa: se fosse gerada no clique, o retry após um timeout criaria chave nova e cobraria de novo — exatamente o que a idempotência deveria evitar. Chave repetida com conteúdo diferente é recusada com `CHAVE_IDEMPOTENCIA_CONFLITANTE`.

### A cotação é versionada e conferida na confirmação

O resumo do carrinho tem uma `versao` derivada de preço, quantidade e cupom. Se algo mudar entre ver o resumo e confirmar — e com tempo real isso muda sozinho — o servidor recusa com `COTACAO_DESATUALIZADA` e a interface oferece atualizar.

A alternativa seria cobrar o valor novo sem avisar.

### Mock como simulação, não como stub

O MSW não devolve resposta fixa: há estado em memória com carrinho por usuário, baixa de estoque, idempotência e sequência de eventos (`src/mocks/store.ts`). Comprar realmente decrementa estoque e dispara evento.

São 11 cenários acionáveis por `?cenario=` — `erro-servidor`, `lista-vazia`, `latencia-alta`, `fora-de-ordem`, `pagamento-recusado`, `sessao-expirada`, entre outros. Existem para que os caminhos infelizes sejam demonstráveis, não só imagináveis. Um aviso no topo indica quando há cenário ativo, com botão para voltar ao padrão.

### O caminho real do socket.io é demonstrável

O simulador local faz a demo rodar sem backend, mas não prova que a integração funciona. Por isso há um servidor de eventos de desenvolvimento:

```bash
npm run eventos:fora-de-ordem
VITE_SOCKET_URL=http://localhost:3001 npm run dev
```

A aplicação abre WebSocket de verdade e o chunk do `socket.io-client` (42 KB) é baixado sob demanda. Foi assim que verifiquei a proteção por versão contra frames reais, e não só contra o simulador. O servidor fica em `servidor/eventos.mjs` e não entra no build.

### As outras

- **Erro é identificado por código, nunca por texto.** Toda resposta tem `{ codigo, mensagem, campos? }`; a interface decide pelo `codigo`, então a mensagem pode mudar ou ser traduzida sem quebrar condicional. `campos` carrega erro por campo de formulário.
- **O estado da busca mora na URL.** Filtros, ordenação, busca e página são parâmetros validados na entrada (`src/lib/busca.ts`) — compartilhar o link reproduz a lista. As coleções vão separadas por vírgula e o limite de preço como número, para o link continuar legível em vez do `%5B%22...%22%5D` que o router produz por padrão.
- **Login responde igual para e-mail inexistente e senha errada.** Respostas diferentes permitem enumerar quem tem conta, insumo para phishing e força bruta.
- **Token em `sessionStorage`, com fallback em memória.** Morre ao fechar a aba; leituras em `try/catch` porque em navegação privada o acesso pode lançar.
- **Mock e socket carregados sob demanda.** Com `VITE_API_URL` e `VITE_SOCKET_URL` definidas, nenhum dos dois é baixado pelo usuário.
- **Quatro estados em cada tela.** Carregando, erro, vazio e sem permissão — não só o caminho feliz. Lista vazia e sessão expirada são os que mais escapam e viram tela branca em produção.

## Sobre as imagens

As peças do catálogo são **arte procedural gerada em SVG**, determinística por índice (12 peças, 84 KB no total).

Não tenho direito de uso sobre as imagens do Figma, e usar banco de imagem traria licença para dentro do repositório. Gerar a arte resolve os dois problemas, não adiciona peso de rede relevante, e combina com o tema.

Pelo mesmo motivo, os ícones de rede social são genéricos com o nome da plataforma no `aria-label`: o `lucide-react` removeu os ícones de marca, e vendorizar SVG de marca registrada por cinco ícones não se justifica.

## Acessibilidade

Atalho para pular ao conteúdo, foco visível em tudo que recebe teclado, `aria-live` nas regiões que mudam sozinhas, `aria-pressed` nos botões de estado, rótulo associado em todo campo, um `h1` por página e `prefers-reduced-motion` respeitado.

O catálogo é navegável só pelo teclado até a peça, e isso tem teste.

## Testes

78 testes Playwright, rodando em desktop e mobile:

| Arquivo | Cobre |
|---|---|
| `catalogo.spec.ts` | Listagem, busca, filtros (coleção e faixa de preço), ordenação, paginação, lista vazia, erro do servidor |
| `sessao.spec.ts` | Entrada, credenciais inválidas, validação de cadastro, rota protegida, sessão expirada |
| `compra.spec.ts` | Carrinho vazio, quantidade, cupom válido/inválido/expirado, compra completa, pagamento recusado, recibo após recarregar |
| `tempo-real.spec.ts` | Conexão ativa, preço mudando sozinho, evento atrasado não regride o preço |
| `acessibilidade.spec.ts` | Skip link, um `h1` por página, texto alternativo, navegação por teclado, `aria-pressed`, menu mobile |
| `layout.spec.ts` | Nenhuma rota rola na horizontal, aviso de cenário ativo, em desktop e mobile |

Três problemas reais apareceram nessa suíte e estão corrigidos no histórico:

- a página de entrada não tinha `h1`;
- o botão de favoritar ficava embaixo do link esticado do cartão, então clicar no coração levava para o detalhe;
- o menu de navegação sumia no mobile, deixando o catálogo inalcançável abaixo de 768px;
- a busca aberta estourava a largura do cabeçalho no mobile.

O último passou despercebido pelos testes funcionais, que acham e clicam em elemento fora da tela. Por isso o `layout.spec.ts` compara `scrollWidth` com `clientWidth` — teste que passa com layout quebrado não protege nada.

O teste de ordenação de eventos foi reescrito depois de falhar sob execução paralela. Ele amostrava em cadência fixa; agora observa até juntar evidência suficiente. Teste instável não serve de rede de proteção.

## O que deixei de fora de propósito

- **Virtualização da lista.** São 24 peças. Virtualizar aqui é peso sem contrapartida, e a resposta certa para "por que não virtualizou" é "porque medi e não precisa", não "porque é sofisticado".
- **Regressão visual por snapshot.** Baseline de pixel varia entre máquinas por renderização de fonte. Uma suíte que falha sem existir bug é pior que a ausência do teste — precisaria de ambiente fixo, e aí vira infraestrutura, não front-end.
- **Zod.** A validação de parâmetro de busca é uma função de quinze linhas. Zod resolveria, mas são 12 KB para validar cinco campos.
- **Gerenciador de estado global.** Estado de servidor está no TanStack Query e estado de navegação na URL. O que sobra é estado local de componente — não há o que gerenciar globalmente.

## O que faria com mais tempo

- **Testes de componente** para os estados do cartão e do resumo, hoje cobertos só de ponta a ponta. É o único item desta lista que ficou de fora por prazo, não por decisão.
