import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { trpc } from '@/lib/trpc/client';

// Define your form schema using zod
const pollFormSchema = z.object({
  eventName: z.string().min(1, { message: 'Please name your Event' }),
  question: z.string().min(1, { message: 'Please enter a poll question.' }),
  options: z.array(
    z.object({
      label: z.string().min(1, { message: 'Option text is required.' })
    })
  )
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export function CreatePollForm() {
  const createPoll = trpc.poll.create.useMutation();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      eventName: '',
      question: '',
      options: [{ label: '' }, { label: '' }] // Start with two empty options
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'options',
    control: form.control
  });

  async function onSubmit(data: PollFormValues) {
    const shortId = await createPoll.mutateAsync({
      eventName: data.eventName,
      question: data.question,
      options: data.options.map((option) => option.label)
    });
    if (shortId) {
      window.location.href = `/poll/${shortId}`;
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="Event Name" {...field} />
                </FormControl>
                <FormDescription>
                  Name of the event where the poll will be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poll Question</FormLabel>
                <FormControl>
                  <Input placeholder="Your Poll" {...field} />
                </FormControl>
                <FormDescription>
                  What would you like to ask your audience?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic poll options fields */}
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`options.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option {index + 1}</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input placeholder={`Option ${index + 1}`} {...field} />
                    </FormControl>
                    <Button
                      className="ml-3"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="ß" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex item-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => append({ label: '' })}
            >
              + Add Option
            </Button>

            {/* Submit button */}
            <Button type="submit">Create Poll</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
