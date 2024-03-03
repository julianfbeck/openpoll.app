import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { trpcReact } from '@/lib/trpc/client';
import type { PollOption } from '@/models/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const FormSchema = z.object({
  votes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.'
  })
});

export function VoteForm({ pollId: shortId }: { pollId: string }) {
  const { data: poll, isLoading } = trpcReact.poll.get.useQuery(shortId);
  const vote = trpcReact.poll.vote.useMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      votes: []
    }
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // const selectedOptions = Object.entries(data.votes)
    //   .filter(([_, value]) => value)
    //   .map(([key, _]) => key);

    // try {
    //   await vote.mutateAsync({
    //     shortId: shortId,
    //     optionIds: selectedOptions
    //   });
    //   // Handle success, e.g., show a success message or redirect
    // } catch (error) {
    //   console.log(error);
    //   // Handle error, e.g., show an error message
    // }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="votes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Sidebar</FormLabel>
                <FormDescription>
                  Select the items you want to display in the sidebar.
                </FormDescription>
              </div>
              {poll!.options.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="votes"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(String(item.id))}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== String(item.id)
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.option}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
