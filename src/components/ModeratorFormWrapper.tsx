import { QueryClientProvider } from '@tanstack/react-query';
import type { Poll } from '@/models/types';
import { ModeratorForm } from './ModeratorForm';
import { Toaster } from './ui/sonner';
import { queryClient } from '@/lib/trpcs';

const ModeratorFormWrapper = ({ poll }: { poll: Poll }) => {
  return (
    <QueryClientProvider client={queryClient}>
        <ModeratorForm poll={poll}></ModeratorForm>
        <Toaster />
    </QueryClientProvider>
  );
};

export default ModeratorFormWrapper;