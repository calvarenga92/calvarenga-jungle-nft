import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/pedido/$id')({
  component: ConfirmacaoPedido,
});

function ConfirmacaoPedido() {
  return null;
}
