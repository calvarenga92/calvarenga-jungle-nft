import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/entrar')({
  component: Entrar,
});

function Entrar() {
  return null;
}
