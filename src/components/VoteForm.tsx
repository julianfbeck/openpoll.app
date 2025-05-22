import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import type { Poll } from '@/models/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVotedPolls } from './useVotedPolls';
import usePollViewTracker from './useTrackView';
import { parseMarkdownLinks } from '@/utils/links';

const FormSchema = z.object({
  votes: z.array(z.number()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.'
  })
});

export function VoteForm({ poll: poll }: { poll: Poll }) {
  usePollViewTracker(poll.shortId);
  const { markPollAsVoted, hasVotedOnPoll } = useVotedPolls(poll.shortId);
  const { data: pollData, isLoading } = trpc.poll.get.useQuery(
    poll.shortId,
    {
      initialData: poll
    }
  );
  const vote = trpc.poll.vote.useMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      votes: []
    }
  });
  useEffect(() => {
    if (hasVotedOnPoll) {
      window.location.href = `/poll/${poll.shortId}`;
    }
  }, [hasVotedOnPoll]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await vote.mutateAsync({
        shortId: poll.shortId,
        optionIds: data.votes
      });
      pollData && markPollAsVoted();
      window.location.href = `/poll/${poll.shortId}`;
    } catch (error) {
      toast({
        title: 'Error voting',
        description: 'An error occurred while voting.',
        variant: 'destructive'
      });
    }
  }
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="votes"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-2xl font-bold text-gray-900">
                    {poll.question}
                  </FormLabel>
                </div>
                {pollData!.options.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="votes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"
                        >
                          <div className="space-y-1 leading-none">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormLabel className="text-sm font-normal">
                            {parseMarkdownLinks(item.option)}
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
    </div>
  );
}
