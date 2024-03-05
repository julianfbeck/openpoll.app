import React, { useEffect } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';

export function PollForm({ poll: poll }: { poll: Poll }) {
  const { data, refetch } = trpcReact.poll.get.useQuery(poll.shortId, {
    initialData: poll,
    refetchInterval: 10000
  });

  useEffect(() => {
    const source = new EventSource(`http://localhost:4650/dashboard`);

    source.addEventListener('open', () => {
      console.log('SSE opened!');
    });

    source.addEventListener('message', (e) => {
      console.log('Message: ', e);
      refetch();
    });

    source.addEventListener('error', (e) => {
      console.error('Error: ', e);
    });

    return () => {
      source.close();
    };
  }, []);

  
}
