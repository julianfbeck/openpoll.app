import { useState, useEffect } from 'react';

type UseVotedPolls = (pollId: string) => {
  markPollAsVoted: () => void;
  hasVotedOnPoll: boolean;
};

export const useVotedPolls: UseVotedPolls = (pollId) => {
  const [votedPolls, setVotedPolls] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedPolls = localStorage.getItem('votedPolls');
    return savedPolls ? JSON.parse(savedPolls) : [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
  }, [votedPolls]);

  // Mark a poll as voted
  const markPollAsVoted = () => {
    if (!votedPolls.includes(pollId)) {
      setVotedPolls((currentPolls) => [...currentPolls, pollId]);
    }
  };

  const hasVotedOnPoll = votedPolls.includes(pollId);

  return { markPollAsVoted, hasVotedOnPoll };
};
