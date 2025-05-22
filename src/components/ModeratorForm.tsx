import { Button } from './ui/button';
import type { Poll, PollOption } from '@/models/types';
import { PollOptionEditDialog } from './PollOptionEditDialog';
import { parseMarkdownLinks } from '@/utils/links';
import { toast } from 'sonner';
import { queryClient, trpc } from '@/lib/trpcs';
import { useMutation, useQuery } from '@tanstack/react-query';

export function ModeratorForm({ poll }: { poll: Poll }) {
  const { data, refetch } = useQuery(trpc.poll.get.queryOptions(poll.shortId, {
    initialData: poll
  }))
  const pollKey = trpc.poll.get.queryKey(poll.shortId)

  const setAsCurrentMutation = useMutation(trpc.poll.selectCurrentPollOption.mutationOptions({
      onMutate: () => {
        queryClient.cancelQueries({ queryKey: pollKey });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: pollKey });
      }
    }))

  const deleteOptionMutation = useMutation(trpc.poll.deletePollOption.mutationOptions({
    onMutate: () => {
      queryClient.cancelQueries({ queryKey: pollKey });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pollKey });
    }
  }))

  async function handleSetAsCurrent(optionId: number) {
    try {
      await setAsCurrentMutation.mutateAsync({
        shortId: poll.shortId,
        optionId: optionId
      });
      toast.success('Option updated successfully', {
        description: 'The poll option has been updated.'
      });
    } catch (error) {
      toast.error('Error updating option', {
        description: `An error occurred while updating the poll option. ${error}`
      });
    }
  }

  async function handleDeleteOption(optionId: number) {
    try {
      await deleteOptionMutation.mutateAsync({
        shortId: poll.shortId,
        optionId: optionId
      });
      toast.success('Option deleted successfully', {
        description: 'The poll option has been deleted.'
      });
    } catch (error) {
      toast.error('Error deleting option', {
        description: `An error occurred while deleting the poll option. ${error}`
      });
    }
  }

  return (
    <div>
      <div className="mb-3">
        <span className="relative flex h-3 w-3 ">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>
      {data?.options.sort((a, b) => {
        if (a.id === poll.selectedPollOptionId) return -1;
        if (b.id === poll.selectedPollOptionId) return 1;
        return b.votes - a.votes;
      }).map((item: PollOption) => (
        <div
          className={`flex flex-wrap items-start justify-between p-4 shadow ${data.selectedPollOptionId === item.id ? 'bg-green-100 border border-green-500' : ''}`}
          key={item.id}
        >
          <div className="text-sm font-normal break-words flex-auto min-w-0 mb-2 sm:mb-0">
            {parseMarkdownLinks(item.option)} - {item.votes} votes
          </div>
          <div className="flex flex-row space-x-2 self-end">
            <Button onClick={() => handleSetAsCurrent(item.id)}>
              Set as Current
            </Button>
            <Button
              onClick={() => handleDeleteOption(item.id)}
              className="ml-2"
            >
              Delete
            </Button>
            <PollOptionEditDialog poll={poll} option={item} onClose={refetch} />
          </div>
        </div>
      ))}
      <div className="flex flex-row items-center justify-between py-3">
        <div className="space-x-3">
          <Button>Add Option</Button>
          <Button variant="outline" asChild>
            <a href={`/poll/${poll.shortId}`}>View Poll</a>
          </Button>
        </div>
        <Button variant="destructive">Delete Poll</Button>
      </div>
    </div>
  );
}
