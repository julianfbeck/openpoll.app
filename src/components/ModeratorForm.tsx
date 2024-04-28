import { Button } from './ui/button';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
import { PollOptionEditDialog } from './PollOptionEditDialog';
import { toast } from './ui/use-toast';

export function ModeratorForm({ poll }: { poll: Poll }) {
  const utils = trpcReact.useUtils();
  const { data, refetch } = trpcReact.poll.get.useQuery(poll.shortId, {
    initialData: poll
  });

  const setAsCurrentMutation =
    trpcReact.poll.selectCurrentPollOption.useMutation({
      onMutate: () => {
        utils.poll.get.cancel();
      },
      onSettled: () => {
        utils.poll.get.invalidate();
      }
    });
  const deleteOptionMutation = trpcReact.poll.deletePollOption.useMutation({
    onMutate: () => {
      utils.poll.get.cancel();
    },
    onSettled: () => {
      utils.poll.get.invalidate();
    }
  });

  async function handleSetAsCurrent(optionId: number) {
    try {
      await setAsCurrentMutation.mutateAsync({
        shortId: poll.shortId,
        optionId: optionId
      });
      toast({
        title: 'Option updated successfully',
        description: 'The poll option has been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error updating option',
        description: `An error occurred while updating the poll option. ${error}`,
        variant: 'destructive'
      });
    }
  }

  async function handleDeleteOption(optionId: number) {
    try {
      await deleteOptionMutation.mutateAsync({
        shortId: poll.shortId,
        optionId: optionId
      });
      toast({
        title: 'Option deleted successfully',
        description: 'The poll option has been deleted.'
      });
    } catch (error) {
      toast({
        title: 'Error deleting option',
        description: `An error occurred while deleting the poll option. ${error}`,
        variant: 'destructive'
      });
    }
  }

  return (
    <div>
      {data?.options.map((item: PollOption) => (
        <div
          className={`flex flex-wrap items-start justify-between p-4 shadow ${data.selectedPollOptionId === item.id ? 'bg-green-100 border border-green-500' : ''}`}
          key={item.id}
        >
          <div className="text-sm font-normal break-words flex-auto min-w-0 mb-2 sm:mb-0">
            {item.option}
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
