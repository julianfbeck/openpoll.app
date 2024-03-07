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
import { trpcReact } from '@/lib/trpc/client';

// Define your form schema using zod
const pollFormSchema = z.object({
  question: z.string().min(1, { message: 'Please enter a poll question.' }),
  options: z.array(
    z.object({
      label: z.string().min(1, { message: 'Option text is required.' })
    })
  )
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export function CreatePollForm() {
  const createPoll = trpcReact.poll.create.useMutation();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: 'test',
      options: [{ label: 'test1' }, { label: 'test2' }] // Start with two empty options
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'options',
    control: form.control
  });

  async function onSubmit(data: PollFormValues) {
    const shortId = await createPoll.mutateAsync({
      question: data.question,
      options: data.options.map((option) => option.label)
    });

    if (shortId) {
      window.location.href = `/poll/${shortId}`;
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg border p-8 shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
                  Header for your poll. Example: "What's your favorite color?"
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
                      type="button"
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
              type="button"
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
