import { Client, Connection } from '@temporalio/client';

let clientPromise: Promise<Client> | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
      const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
      const connection = await Connection.connect({ address });
      return new Client({ connection, namespace });
    })();
  }
  return clientPromise;
}
