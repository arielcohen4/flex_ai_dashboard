import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import useUser from "@/app/hook/useUser";
import { Copy } from "lucide-react";
import TrackService from "@/lib/client-services/track";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const defaultValues: Partial<AccountFormValues> = {};

export function AccountForm() {
  const user = useUser();
  const [copied, setCopied] = useState(false);
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  const copyToClipboard = async () => {
    if (user.data?.api_key) {
      try {
        await navigator.clipboard.writeText(user.data.api_key);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "API key copied to clipboard",
        });
        TrackService.send({ name: "copy_api_key" });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Your API key"
                    {...field}
                    value={user.data?.api_key || ""}
                    readOnly
                    className="pr-10" // Add padding to the right to make space for the icon
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Copy
                      className={copied ? "text-green-500" : ""}
                      size={16}
                    />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Do not share this key with anyone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Re-Generate</Button>
      </form>
    </Form>
  );
}
