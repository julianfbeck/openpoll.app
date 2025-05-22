import {  QueryClientProvider } from '@tanstack/react-query';
import { CreatePollForm } from './CreatePollForm';
import { Toaster } from './ui/sonner';
import { queryClient } from '@/lib/trpcs';

// Create tRPC context

const CreatePollFormWrapper = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <CreatePollForm />
      <Toaster />
    </QueryClientProvider>
  );
};

export default CreatePollFormWrapper;