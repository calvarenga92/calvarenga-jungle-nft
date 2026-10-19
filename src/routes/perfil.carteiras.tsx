import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/perfil/carteiras')({
  component: Carteiras,
});

function Carteiras() {
  return null;
}
