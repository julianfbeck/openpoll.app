import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll, PollOption } from '@/models/types';
import { Form, FormField, FormItem, FormLabel } from './ui/form';

const AdminFormSchema = z.object({
  // Assuming the schema is similar since primarily admin actions are being added
});

export function ModeratorForm({ poll }: { poll: Poll }) {
  //   const setAsCurrentMutation = trpcReact.poll.setAsCurrent.useMutation();
  //   const deleteOptionMutation = trpcReact.poll.deleteOption.useMutation();

  const form = useForm<z.infer<typeof AdminFormSchema>>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      // Define default values if needed
    }
  });

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
            <FormItem className="flex flex-row items-center justify-between space-x-3 p-4 shadow">
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
              </div>
            </FormItem>
          ))}
        </form>
      </Form>
    </div>
  );
}
