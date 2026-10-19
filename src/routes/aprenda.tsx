import { createFileRoute } from '@tanstack/react-router';
import { EmBreve } from '@/componentes/EmBreve';

export const Route = createFileRoute('/aprenda')({
  component: () => <EmBreve titulo="Aprenda" />,
});
