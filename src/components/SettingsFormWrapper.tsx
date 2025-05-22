import { QueryClientProvider } from '@tanstack/react-query';
import { SettingsForm } from './settingsForm';
import { queryClient } from '@/lib/trpcs';
import { Toaster } from './ui/sonner';

const VoteFormWrapper = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <SettingsForm></SettingsForm>
        <Toaster />
      </QueryClientProvider>
  );
};
export default VoteFormWrapper;
