import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/trpcs';
import type { Poll } from '@/models/types';
import { VoteForm } from './VoteForm';
import { Toaster } from './ui/sonner';

const VoteFormWrapper = ({ poll }: { poll: Poll }) => {

  return (
      <QueryClientProvider client={queryClient}>
        <VoteForm poll={poll}></VoteForm>
        <Toaster />
      </QueryClientProvider>
  );
};
export default VoteFormWrapper;
