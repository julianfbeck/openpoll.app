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

const EditOptionSchema = z.object({
  optionText: z.string().min(1, 'The option text must not be empty.')
});

export function ModeratorForm({ poll }: { poll: Poll }) {
  //   const setAsCurrentMutation = trpcReact.poll.setAsCurrent.useMutation();
  //   const deleteOptionMutation = trpcReact.poll.deleteOption.useMutation();
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
      //   await setAsCurrentMutation.mutateAsync({
      //     shortId: poll.shortId,
      //     optionId: optionId,
      //   });
      // Optionally refresh data or indicate success to the user
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }

  async function handleDeleteOption(optionId: number) {
    try {
      //   await deleteOptionMutation.mutateAsync({
      //     shortId: poll.shortId,
      //     optionId: optionId,
      //   });
      // Optionally refresh data or indicate success to the user
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }

  return (
    <div>
      <Form {...form}>
        <form className="space-y-8">
          {poll.options.map((item: PollOption) => (
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Poll Option</DialogTitle>
                      <DialogClose>Close</DialogClose>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={handleSubmit((data) =>
                          handleEditOption(data, item.id)
                        )}
                      >
                        <FormField 
						control={form.control}
						>
                          <input
                            {...register('optionText', { required: true })}
                            className="form-input"
                            placeholder="Option text"
                            defaultValue={item.option} // Pre-fill with current option text
                          />
                        </FormField>
                        <Button type="submit">Save Changes</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </FormItem>
          ))}
        </form>
      </Form>
    </div>
  );
}
