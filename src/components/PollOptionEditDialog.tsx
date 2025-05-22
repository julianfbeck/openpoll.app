// PollOptionEditDialog.tsx
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Poll, PollOption } from '@/models/types';
import { queryClient, trpc } from '@/lib/trpcs';
import { useMutation } from '@tanstack/react-query';

const editOptionSchema = z.object({
  optionText: z.string().min(1, 'Option text must not be empty.')
});

type PollOptionEditDialogProps = {
  option: PollOption;
  poll: Poll;
  onClose: () => void;
};

export const PollOptionEditDialog: React.FC<PollOptionEditDialogProps> = ({
  poll,
  option,
  onClose
}) => {
  const updateOptionMutation = useMutation(trpc.poll.editPollOption.mutationOptions({
    onMutate: () => {
      queryClient.cancelQueries({ queryKey: trpc.poll.get.queryKey(poll.shortId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trpc.poll.get.queryKey(poll.shortId) });
    }
  }))
  const form = useForm<z.infer<typeof editOptionSchema>>({
    resolver: zodResolver(editOptionSchema),
    defaultValues: {
      optionText: option.option
    }
  });

  const onSubmit = async (data: { optionText: string }) => {
    try {
      console.log('Updating option', data);
      await updateOptionMutation.mutateAsync({
        shortId: poll.shortId,
        optionId: option.id,
        optionText: data.optionText
      });
      toast.success('Option updated successfully', {
        description: 'The poll option has been updated.'
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error updating option', {
        description: 'An error occurred while updating the poll option.'
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="ml-2">
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Poll Option</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="optionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option Text</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogClose asChild className="mt-3">
              <Button type="submit">Save Changes</Button>
            </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
