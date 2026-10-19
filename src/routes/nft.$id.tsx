import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/nft/$id')({
  component: DetalheNft,
});

function DetalheNft() {
  return null;
}
