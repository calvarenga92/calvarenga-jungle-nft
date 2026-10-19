# Kurio — Marketplace de NFTs

Desafio técnico de front-end. Marketplace completo com catálogo, carrinho, checkout, perfil e atualizações em tempo real, rodando inteiramente no navegador.

Não existe backend: a API é simulada com MSW, e os eventos de tempo real têm um simulador local por trás da mesma interface do `socket.io-client`. Com as variáveis de ambiente apontando para serviços reais, nada disso entra no bundle.

## Como rodar

Requer Node 20+.

```bash
npm install
npm run dev
```

Contas da simulação: `claudio@greenmint.test` ou `marina@greenmint.test`, senha `senha12345`.

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
| Catálogo | Filtro por coleção e disponibilidade, ordenação, paginação — tudo refletido na URL |
| Peça | Galeria, seleção de edição, atributos, favoritar, adicionar ao carrinho |
| Carrinho | Quantidade com limite por edição, cupom, cotação recalculada no servidor |
| Checkout | Seleção de carteira, cotação versionada, requisição idempotente |
| Pedido | Recibo imutável com snapshot dos itens |
| Conta | Entrada, cadastro, perfil, carteiras (principal, secundárias) |
| Tempo real | Preço e disponibilidade chegando por evento, com ordenação por versão |
| Telas | Carregando, erro, vazio e sem permissão tratados em cada rota |

## Decisões técnicas

### Dinheiro nunca passa por ponto flutuante

Valores em ETH trafegam como string decimal e são somados em `bigint` com 18 casas (`src/lib/decimal.ts`). `0.1 + 0.2` em JavaScript dá `0.30000000000000004`; num carrinho isso vira um total errado que ninguém consegue explicar depois.

O efeito é visível: `0.42` mais `0.0042` de taxa de rede dá exatamente `0.4242`, e com cupom de 10% dá `0.3822`. Com `Number` o primeiro já sairia como `0.42419999999999997`.

### Eventos carregam versão, e o cliente respeita a versão

Entrega de WebSocket não garante ordem. Se um evento antigo chegar depois de um novo, o preço "volta" na tela — o usuário vê piscar e desconfia do sistema.

Todo evento traz `versao` e `eventoId`. O cliente descarta duplicatas pelo id e só aplica o evento se a versão for maior que a já exibida (`src/hooks/useTempoReal.ts`). O cenário `fora-de-ordem` emite de propósito um evento atrasado antes do atual, e existe teste medindo isso: as atualizações são aplicadas e nenhuma regressão acontece.

### Checkout idempotente

A requisição de pedido vai com header `Idempotency-Key`. A chave nasce com a tentativa e só é trocada quando o pedido é confirmado.

Isso resolve o caso real de o usuário perder a conexão depois do servidor já ter processado: ao reenviar, a mesma chave devolve o pedido original em vez de cobrar de novo. Chave repetida com conteúdo diferente é recusada com `CHAVE_IDEMPOTENCIA_CONFLITANTE`.

### A cotação é versionada e conferida na hora de confirmar

O resumo do carrinho tem uma `versao` derivada de preço, quantidade e cupom. Se qualquer coisa mudar entre ver o resumo e clicar em confirmar — e com tempo real isso muda sozinho — o servidor recusa com `COTACAO_DESATUALIZADA` e a interface oferece atualizar o resumo.

O alternativo seria cobrar pelo valor novo sem avisar. Ninguém gosta de descobrir isso na fatura.

### Erro é identificado por código, nunca por texto

Toda resposta de erro tem a forma `{ codigo, mensagem, campos? }`. A interface decide o que fazer pelo `codigo`; o texto é só para exibir. Assim a mensagem pode mudar no servidor, ou ser traduzida, sem quebrar nenhuma condicional.

`campos` carrega erro por campo de formulário, que é como o usuário consegue consertar o que errou.

### O estado da busca mora na URL

Filtros, ordenação e página são parâmetros de rota validados na entrada (`src/lib/busca.ts`). Compartilhar o link reproduz a lista exata, o botão voltar funciona, e recarregar não perde nada.

As coleções vão como lista separada por vírgula (`?colecao=apes,punks`) em vez da serialização JSON padrão do router. `?colecao=%5B%22apes%22%5D` funciona, mas não é um link que alguém consiga ler ou editar à mão.

A validação é defensiva de propósito: a URL é editável pelo usuário e um valor inválido não pode derrubar a tela.

### Mock como simulação, não como stub

O MSW aqui não devolve resposta fixa. Existe um estado em memória com carrinho por usuário, controle de estoque, idempotência e sequência de eventos (`src/mocks/store.ts`). Comprar baixa o estoque de verdade e dispara evento.

Além disso há 11 cenários selecionáveis por `?cenario=` — `latencia-alta`, `fora-de-ordem`, `erro-servidor`, `sessao-expirada`, `cupom-invalido`, `preco-alterado`, `pagamento-recusado`, entre outros. Eles existem para que os caminhos infelizes sejam demonstráveis e testáveis, não só imagináveis.

### Login responde igual para e-mail inexistente e senha errada

Respostas diferentes permitem descobrir quem tem conta no sistema, o que vira insumo para phishing e força bruta direcionada.

### Token em sessionStorage, com fallback em memória

A sessão morre quando a aba fecha, o que reduz a janela de exposição. Todas as leituras e escritas estão em `try/catch`: em navegação privada o acesso pode lançar, e nesse caso a sessão simplesmente vive em memória (`src/lib/token.ts`).

### Mock e socket carregados sob demanda

`socket.io-client` só entra no bundle se `VITE_SOCKET_URL` estiver definida; o MSW só é carregado se `VITE_API_URL` estiver vazia. Em um deploy com backend real, nenhum dos dois é baixado pelo usuário.

### Quatro estados em cada tela

Carregando, erro, vazio e sem permissão são tratados explicitamente, não só o caminho feliz. Lista vazia e sessão expirada são os dois que mais escapam e viram tela branca em produção.

## Sobre as imagens

As peças do catálogo são **arte procedural gerada em SVG**, determinística por índice (12 peças, 84 KB no total).

Não tenho direito de uso sobre as imagens do Figma, e usar banco de imagem traria licença para dentro do repositório. Gerar a arte resolve os dois problemas, não adiciona peso de rede relevante, e combina com o tema.

Pelo mesmo motivo, os ícones de rede social são genéricos com o nome da plataforma no `aria-label`: o `lucide-react` removeu os ícones de marca, e vendorizar SVG de marca registrada por cinco ícones não se justifica.

## Acessibilidade

Atalho para pular ao conteúdo, foco visível em tudo que recebe teclado, `aria-live` nas regiões que mudam sozinhas, `aria-pressed` nos botões de estado, rótulo associado em todo campo, um `h1` por página e `prefers-reduced-motion` respeitado.

O catálogo é navegável só pelo teclado até a peça, e isso tem teste.

## Testes

52 testes Playwright, rodando em desktop e mobile:

| Arquivo | Cobre |
|---|---|
| `catalogo.spec.ts` | Listagem, filtro na URL, ordenação, paginação, lista vazia, erro do servidor |
| `sessao.spec.ts` | Entrada, credenciais inválidas, validação de cadastro, rota protegida, sessão expirada |
| `compra.spec.ts` | Carrinho vazio, quantidade, cupom válido/inválido/expirado, compra completa, pagamento recusado, recibo após recarregar |
| `tempo-real.spec.ts` | Conexão ativa, preço mudando sozinho, evento atrasado não regride o preço |
| `acessibilidade.spec.ts` | Skip link, um `h1` por página, texto alternativo, navegação por teclado, `aria-pressed` |

Dois bugs reais apareceram nessa suíte e estão corrigidos no histórico: a página de entrada não tinha `h1`, e o botão de favoritar ficava embaixo do link esticado do cartão — clicar no coração levava para o detalhe.

## O que eu faria com mais tempo

- **Servidor Socket.IO de verdade.** A interface `Conexao` já isola isso; trocar o simulador pelo cliente real é uma variável de ambiente.
- **Busca por texto na interface.** O endpoint e o parâmetro de URL já aceitam `busca`; falta o campo no cabeçalho.
- **Faixa de preço nos filtros.** O backend simulado já aceita `precoMin` e `precoMax`.
- **Virtualização da lista** se o catálogo crescer muito além das 24 peças atuais.
- **Testes de componente** para os estados do cartão e do resumo, hoje cobertos só de ponta a ponta.
- **Regressão visual** com snapshot do Playwright, que exige um baseline estável de ambiente.
