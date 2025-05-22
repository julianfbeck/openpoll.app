import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { queryClient, trpc } from '@/lib/trpcs';
import { useMutation, useQuery } from '@tanstack/react-query';

const apiKeySchema = z.object({}); // As no fields are being validated, this is just a placeholder.

export function SettingsForm() {
  const { data } = useQuery(trpc.api.get.queryOptions());
  const apiKeyQueryKey = trpc.api.get.queryKey();
  const { mutate: rotateKey } = useMutation(trpc.api.rotate.mutationOptions({
    onMutate: () => {
      queryClient.cancelQueries({queryKey: apiKeyQueryKey})
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: apiKeyQueryKey})
    }
  }))

  const { handleSubmit } = useForm({
    resolver: zodResolver(apiKeySchema)
  });

  const onGenerateApiKey = () => {
    rotateKey();
  };

  const copyToClipboard = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      alert('API Key copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  return (
    <div className="flex min-h-[calc(100vh-(--spacing(16)))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 max-w-lg mx-auto md:max-w-4xl lg:max-w-5xl">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>Permanently delete your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate API Key</CardTitle>
            <CardDescription>
              Generate a new API key for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onGenerateApiKey)}
              className="flex flex-col gap-4"
            >
              <Input
                defaultValue={data?.apiKey ?? ''}
                value={data?.apiKey ?? ''}
                disabled
                placeholder="API Key"
              />
              <div className="flex gap-2">
                <Button type="submit">Rotate Key</Button>

                <Button
                  type="button"
                  variant={'outline'}
                  onClick={() => copyToClipboard(data?.apiKey ?? '')}
                >
                  Copy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
