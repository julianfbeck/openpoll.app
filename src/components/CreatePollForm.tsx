import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { useToast } from './ui/use-toast';
import { Toast } from './ui/toast';
import { Toaster } from './ui/toaster';
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
  const upToDateCommentsQuery = trpcReact.getCommentProcedure.useQuery();

  const { toast } = useToast();

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
    // Create a FormData instance to build the form-data payload
    const formData = new FormData();
    formData.append('question', data.question);
    data.options.forEach((option, index) => {
      // Append each option to the form data
      formData.append(`options[${index}]`, option.label);
    });

    try {
      // Use the Fetch API to make a POST request to the server endpoint
      const response = await fetch('/new', {
        method: 'POST',
        body: formData
      });
      console.log('response', response)

      // Check if the request was successful
      if (response.ok) {
        const jsonResponse = await response.json();
        // Handle the response data as needed
        toast({
          title: 'Poll created successfully',
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          )
        });
        console.log('Poll created:', jsonResponse);
      } else {
        // Handle HTTP errors
        throw new Error('Network response was not ok.');
      }
    } catch (error) {
      // Handle errors (network or otherwise)
      toast({
        title: 'Error creating poll',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        )
      });
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  return (
    <Form {...form}>
      <Toaster />
      {upToDateCommentsQuery.data?.[0]?.creatorId}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Your Poll" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
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
                <FormControl>
                  <Input placeholder={`Option ${index + 1}`} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove Option
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

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
      </form>
    </Form>
  );
}
