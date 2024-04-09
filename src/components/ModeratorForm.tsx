import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
import { Form, FormField, FormItem, FormLabel } from './ui/form';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { PollOptionEditDialog } from './PollOptionEditDialog';
import { toast } from './ui/use-toast';

const EditOptionSchema = z.object({
  optionText: z.string().min(1, 'The option text must not be empty.')
});

export function ModeratorForm({ poll }: { poll: Poll }) {
  const utils = trpcReact.useUtils();
  const { data, refetch } = trpcReact.poll.get.useQuery(poll.shortId, {
    initialData: poll,
    refetchInterval: 10000
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
      utils.api.get.cancel();
    },
    onSettled: () => {
      utils.api.get.invalidate();
    }
  });
  //   const updateOptionMutation = trpcReact.poll.updateOption.useMutation();
  const form = useForm<z.infer<typeof EditOptionSchema>>({
    resolver: zodResolver(EditOptionSchema)
  });

  const { register, handleSubmit, reset } = form;

  const handleEditOption = async (
    data: { optionText: string },
    optionId: number
  ) => {
    // await updateOptionMutation.mutateAsync({
    //   shortId: poll.shortId,
    //   optionId: optionId,
    //   optionText: data.optionText
    // });
    reset(); // Reset the form after submission
    // Optionally, refresh data or show a success message
  };

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
      <Form {...form}>
        <form className="space-y-8">
          {data?.options.map((item: PollOption) => (
            <FormItem
              className="flex flex-row items-center justify-between space-x-3 p-4 shadow"
              key={item.id}
            >
              <FormLabel className="text-sm font-normal">
                {item.option}
              </FormLabel>
              <div>
                <Button
                  type="button"
                  onClick={() => handleSetAsCurrent(item.id)}
                >
                  Set as Current
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDeleteOption(item.id)}
                  style={{ marginLeft: '10px' }}
                >
                  Delete
                </Button>
                <PollOptionEditDialog option={item} onClose={refetch} />
              </div>
            </FormItem>
          ))}
        </form>
      </Form>
    </div>
  );
}
