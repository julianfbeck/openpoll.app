"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const apiKeySchema = z.object({}); // As no fields are being validated, this is just a placeholder.

export function SettingsForm() {
  const { handleSubmit } = useForm({
    resolver: zodResolver(apiKeySchema),
  });

  const onGenerateApiKey = (data) => {
    // API key generation logic here
  };

  return (
    <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account.
            </CardDescription>
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
            <form onSubmit={handleSubmit(onGenerateApiKey)} className="flex flex-col gap-4">
              <Input
                defaultValue="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                disabled
                placeholder="API Key"
              />
              <Button type="submit">Rotate Key</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
