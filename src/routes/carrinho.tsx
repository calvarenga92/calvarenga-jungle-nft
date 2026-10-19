import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/carrinho')({
  component: Carrinho,
});

function Carrinho() {
  return null;
}
