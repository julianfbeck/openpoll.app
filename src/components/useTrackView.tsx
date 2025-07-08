import { trpc } from '@/lib/trpcs';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

const usePollViewTracker = (pollId: string) => {
  const { mutate } = useMutation(trpc.view.view.mutationOptions({
    onSuccess: () => {
      console.log('Viewed poll');
    },
    onError: (error) => {
      console.error('Error viewing poll', error);
    }
  }));

  useEffect(() => {
    if (!window) return;
    const viewedPolls = localStorage.getItem('viewedPolls');
    let viewedPollsArray = viewedPolls ? JSON.parse(viewedPolls) : [];

    if (!viewedPollsArray.includes(pollId)) {
      viewedPollsArray.push(pollId);
      localStorage.setItem('viewedPolls', JSON.stringify(viewedPollsArray));
      mutate(pollId);
    }
  }, [pollId, mutate]);
};

export default usePollViewTracker;
