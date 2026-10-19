import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/pagamento')({
  component: Pagamento,
});

function Pagamento() {
  return null;
}
