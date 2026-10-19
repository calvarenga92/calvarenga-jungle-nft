import { createFileRoute } from '@tanstack/react-router';
import { EmBreve } from '@/componentes/EmBreve';

export const Route = createFileRoute('/criadores')({
  component: () => <EmBreve titulo="Criadores" />,
});
