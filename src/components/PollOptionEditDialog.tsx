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
import { toast } from '@/components/ui/use-toast';
import { trpcReact } from '@/lib/trpc/client';
import type { PollOption } from '@/models/types';

// Define your PollOption type (assuming structure)

// Form schema using Zod
const editOptionSchema = z.object({
  optionText: z.string().min(1, 'Option text must not be empty.')
});

// Props for the PollOptionEditDialog component
type PollOptionEditDialogProps = {
  option: PollOption;
  onClose: () => void;
};

export const PollOptionEditDialog: React.FC<PollOptionEditDialogProps> = ({
  option,
  onClose
}) => {
  //   const updateOptionMutation = trpcReact.poll.updateOption.useMutation();
  const form = useForm<z.infer<typeof editOptionSchema>>({
    resolver: zodResolver(editOptionSchema),
    defaultValues: {
      optionText: option.option // Pre-fill the form with the current option text
    }
  });

  const onSubmit = async (data: { optionText: string }) => {
    try {
      //   await updateOptionMutation.mutateAsync({
      //     shortId: option.shortId,
      //     optionId: option.id,
      //     optionText: data.optionText
      //   });
      toast({
        title: 'Option updated successfully',
        description: 'The poll option has been updated.'
      });
      onClose(); // Close the dialog after successful update
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error updating option',
        description: 'An error occurred while updating the poll option.'
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
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
