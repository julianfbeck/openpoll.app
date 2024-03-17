import React, { useEffect } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
import { useVotedPolls } from './useVotedPolls';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';

export function PollForm({ poll: poll }: { poll: Poll }) {
  const { markPollAsVoted, hasVotedOnPoll } = useVotedPolls(poll.shortId);

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
        <Button>
          <a href={`/poll/${poll.shortId}/vote`}>Vote</a>
        </Button>
      );
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
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
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
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
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

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
