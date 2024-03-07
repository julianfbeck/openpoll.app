import React, { useEffect } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
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

  const HasVotedButton = ({ hasVotedOnPoll }: { hasVotedOnPoll: boolean }) => {
    if (hasVotedOnPoll) {
      return <Button disabled={true}>You have voted</Button>;
    } else {
      return (
        <Button>
          <a href={`/poll/${poll.shortId}/vote`}>Vote</a>
        </Button>
      );
    }
  };

  return (
    <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md mx-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {data?.question}
      </h1>
      <PollOptions options={data?.options ?? []} />
      <HasVotedButton hasVotedOnPoll={hasVotedOnPoll} />
    </div>
  );
}

function PollOptions({ options }: { options: PollOption[] }) {
  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0);
  const maxVotes = Math.max(...options.map((option) => option.votes));

  return (
    <>
      {options.map((option, index) => {
        // Calculate the width of the progress bar relative to the option with the most votes.
        const widthPercentage =
          maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
        // Calculate the vote percentage of this option relative to total votes.
        const votePercentage =
          totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

        return (
          <div
            key={option.id}
            className="relative mb-5 rounded-md bg-white h-10 shadow-2xl border"
          >
            <div
              className="h-10 rounded-md bg-slate-300 border"
              style={{ width: `${widthPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex justify-between items-center h-10 mx-4">
              <span className="text-black">{option.option}</span>
              <span className="text-gray-800 font-semibold">
                {votePercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
