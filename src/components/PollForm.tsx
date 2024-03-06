import React, { useEffect } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { useVotedPolls } from './useVotedPolls';
import { Button } from './ui/button';

export function PollForm({ poll: poll }: { poll: Poll }) {
  const { markPollAsVoted, hasVotedOnPoll } = useVotedPolls(poll.shortId);

  const { data, refetch } = trpcReact.poll.get.useQuery(poll.shortId, {
    initialData: poll,
    refetchInterval: 10000
  });

  useEffect(() => {
    const source = new EventSource(`/api/live/${poll.id}`);

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

  function HasVotedButton({ hasVotedOnPoll }: { hasVotedOnPoll: boolean }) {
    if (hasVotedOnPoll) {
      return <Button disabled>You have voted</Button>;
    } else {
      return (
        <Button>
          <a href={`/poll/${poll.shortId}/vote`}>Vote</a>
        </Button>
      );
    }
  }

  return (
    <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md mx-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {data?.question}
      </h1>

      <div className="relative mb-5 rounded-md bg-white h-10 shadow-2xl">
        <div
          className="h-10 rounded-md bg-slate-300"
          style={{ width: '50%' }}
        ></div>
        <div className="absolute inset-0 flex justify-between items-center h-10 mx-4">
          <span className="text-black">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Natus
            alias odio ullam, giat rem recusandae?
          </span>
          <span className="text-gray-800 font-semibold">11.37%</span>
        </div>
      </div>

      <HasVotedButton hasVotedOnPoll={hasVotedOnPoll} />
    </div>
  );
}
