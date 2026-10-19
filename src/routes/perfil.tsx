import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/perfil')({
  component: PerfilLayout,
});

function PerfilLayout() {
  return null;
}
