import { useEffect, useRef } from 'react';
import type { Poll, PollOption } from '@/models/types';
import { useVotedPolls } from './useVotedPolls';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import usePollViewTracker from './useTrackView';
import type { User } from '@auth/core/types';
import { parseMarkdownLinks } from '@/utils/links';
import { trpc } from '@/lib/trpcs';
import { useQuery } from '@tanstack/react-query';

export function PollForm({
  poll: poll,
  user: user
}: {
  poll: Poll;
  user: User | undefined;
}) {
  const { markPollAsVoted, hasVotedOnPoll } = useVotedPolls(poll.shortId);
  const wsRef = useRef<WebSocket | null>(null);

  usePollViewTracker(poll.shortId);

  const { data, refetch } = useQuery(trpc.poll.get.queryOptions(poll.shortId, {
    initialData: poll,
    refetchInterval: 10000
  }));

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live/${poll.shortId}`;
        
        console.log('Connecting to WebSocket:', wsUrl);
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected for poll:', poll.shortId);
        };

        wsRef.current.onmessage = (event) => {
          console.log('WebSocket message received:', event.data);
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'poll_update') {
              console.log('Poll update received, refetching data...');
              refetch();
            }
          } catch (error) {
            console.log('Non-JSON message received, refetching data...');
            refetch();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              console.log('Attempting to reconnect WebSocket...');
              connectWebSocket();
            }
          }, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        console.log('Closing WebSocket connection');
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [poll.shortId, refetch]);

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
        <Button asChild variant={'secondary'}>
          <a href={`/poll/${poll.shortId}/moderator`}>Edit</a>
        </Button>
      );
    }
  };
  const copyToClipboard = async (apiKey: string) => {
    try {
      const url = `${window.location.origin}/poll/${apiKey}/vote`;
      await navigator.clipboard.writeText(url);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
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
            <div className="text-2xl font-bold">{data?.votes}</div>
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
        <Card
          onClick={() => copyToClipboard(data?.shortId ?? '')}
          className="cursor-pointer"
        >
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
            <div className="text-sm text-gray-700">Click to share</div>
          </CardContent>
        </Card>
      </div>
      <div className="border-b border-gray-200 mb-6"></div>
      <PollOptions
        options={data?.options ?? []}
        selectedPollOptionId={data?.selectedPollOptionId ?? undefined}
      />
      <div className="flex justify-between">
        <HasVotedButton hasVotedOnPoll={hasVotedOnPoll} />
        <EditButton />
      </div>
    </div>
  );
}

function PollOptions({
  options,
  selectedPollOptionId
}: {
  options: PollOption[];
  selectedPollOptionId?: number;
}) {
  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0);
  const maxVotes = Math.max(...options.map((option) => option.votes));
  const sortedOptions = options.sort((a, b) => {
    if (a.id === selectedPollOptionId) return -1;
    if (b.id === selectedPollOptionId) return 1;
    return b.votes - a.votes;
  });

  return (
    <>
      {sortedOptions.map((option, _) => {
        // Calculate the width of the progress bar relative to the option with the most votes.
        const widthPercentage =
          maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
        // Calculate the vote percentage of this option relative to total votes.
        const votePercentage =
          totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        const optionText = parseMarkdownLinks(option.option);
        return (
          <div
            className={`border-2 rounded-md mb-5 shadow shadow-secondary  ${option.id === selectedPollOptionId ? 'border-green-500' : 'border-gray-200'}`}
            key={option.id}
          >
            <div className="relative rounded-md bg-white h-auto">
              <div
                className="h-10 rounded-md bg-slate-300 border"
                style={{ width: `${widthPercentage}%` }}
              ></div>
              <div className="absolute inset-0 flex justify-between items-center h-full mx-4">
                <span className="text-black break-words">{optionText}</span>
                <span className="text-gray-800 font-semibold">
                  {votePercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
