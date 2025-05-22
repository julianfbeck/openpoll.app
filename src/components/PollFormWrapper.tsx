import {  QueryClientProvider } from '@tanstack/react-query';
import type { Poll } from '@/models/types';
import { PollForm } from './PollForm';
import type { User } from '@auth/core/types';
import { queryClient } from '@/lib/trpcs';

const PollFormWrapper = ({
  poll: poll,
  user: user
}: {
  poll: Poll;
  user: User | undefined;
}) => {
  
  return (
    <QueryClientProvider client={queryClient}>
        <PollForm poll={poll} user={user} />
    </QueryClientProvider>
  );
};

export default PollFormWrapper;