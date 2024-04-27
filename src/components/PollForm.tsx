import { useEffect } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
import { useVotedPolls } from './useVotedPolls';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import usePollViewTracker from './useTrackView';
import type { User } from '@auth/core/types';

export function PollForm({
  poll: poll,
  user: user
}: {
  poll: Poll;
  user: User | undefined;
}) {
  const { markPollAsVoted, hasVotedOnPoll } = useVotedPolls(poll.shortId);

  usePollViewTracker(poll.shortId);
  const { data, refetch } = trpcReact.poll.get.useQuery(poll.shortId, {
    initialData: poll,
    refetchInterval: 10000
  });

  useEffect(() => {
    const source = new EventSource(`/api/live/${poll.shortId}`);

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
        <Button asChild>
          <a href={`/poll/${poll.shortId}/vote`}>Vote</a>
        </Button>
      );
    }
  };

  const EditButton = () => {
    if (poll.creatorId == user?.id) {
      return (
        <Button asChild>
          <a href={`/poll/${poll.shortId}/edit`}>Edit</a>
        </Button>
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {data?.question}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {/* calculate 32 bit */}
            <div className="text-2xl font-bold">
              {data?.options.reduce((acc, option) => acc + option.votes, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"> Total Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"> Share Poll</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-1xl font-bold">{data?.shortId}</div>
          </CardContent>
        </Card>
      </div>
      <div className="border-b border-gray-200 mb-6"></div>
      <PollOptions options={data?.options ?? []} />
      <HasVotedButton hasVotedOnPoll={hasVotedOnPoll} />
      <EditButton />
    </div>
  );
}

function PollOptions({ options }: { options: PollOption[] }) {
  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0);
  const maxVotes = Math.max(...options.map((option) => option.votes));

  return (
    <>
      {options.map((option, _) => {
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
