import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import useUser from "@/app/hook/useUser";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "@/components/ui/use-toast";

const wandbForm = z.object({
  wandbKey: z
    .string()
    .min(15, {
      message: "Weights and Biases key must be 15 minimum",
    })
    .max(30, {
      message: "Weights and Biases key must be 30 maximum",
    }),
});

type WandBFormValues = z.infer<typeof wandbForm>;

export function WandBForm() {
  const user = useUser();
  const form = useForm<WandBFormValues>({
    resolver: zodResolver(wandbForm),
    defaultValues: {
      wandbKey: user.data?.wandb_key ?? ""
    }
  });

  useEffect(() => {
    // reset form with user data
    if (user.data?.wandb_key && form)
      form.reset({wandbKey: user?.data?.wandb_key});
}, [user.data?.wandb_key, form]);

  const onSubmit = useCallback(async (values: z.infer<typeof wandbForm>) => {
    const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        
        const response = await supabase
        .from("profiles")
        .update({
          wandb_key: values.wandbKey,
        })
        .eq("id", user.data?.id ?? "");
      }

      toast({
        title: "You successfully updated your Weights and Biases key!",
      });
  }, [])

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="wandbKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="Weights and Biases key"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your Weights and Biases key
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <Button disabled={!form.formState.isDirty} type="submit">Update</Button>
      </form>
    </Form>
  );
}
