import { trpc } from '@/lib/trpc/client';
import { useEffect } from 'react';

const usePollViewTracker = (pollId: string) => {
  const { mutate } = trpc.view.view.useMutation();

  useEffect(() => {
    if (!window) return;
    const viewedPolls = localStorage.getItem('viewedPolls');
    let viewedPollsArray = viewedPolls ? JSON.parse(viewedPolls) : [];

    if (!viewedPollsArray.includes(pollId)) {
      mutate(pollId);

      viewedPollsArray.push(pollId);
      localStorage.setItem('viewedPolls', JSON.stringify(viewedPollsArray));
    }
  }, [pollId, mutate]);
};

export default usePollViewTracker;
