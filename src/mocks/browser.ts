import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { restaurar } from './store';

export async function iniciarMocks(): Promise<void> {
  restaurar();
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
}
