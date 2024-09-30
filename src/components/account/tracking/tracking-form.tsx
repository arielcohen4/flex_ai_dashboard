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
import useUser, { USER_QUERY } from "@/app/hook/useUser";
import { useCallback, useEffect } from "react";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const trackingForm = z.object({
  wandbKey: z
    .string()
    .min(40, {
      message: "Weights and Biases key must be 40 characters",
    })
    .max(40, {
      message: "Weights and Biases key must be 40 characters",
    }),
});

type TrackingFormValues = z.infer<typeof trackingForm>;

export function TrackingForm() {
  const user = useUser();
  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingForm),
    defaultValues: {
      wandbKey: user.data?.wandb_key ?? ""
    }
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    // reset form with user data
    if (user.data?.wandb_key && form)
      form.reset({wandbKey: user?.data?.wandb_key});
}, [user.data?.wandb_key, form]);

  const onSubmit = useCallback(async (values: z.infer<typeof trackingForm>) => {
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

      queryClient.invalidateQueries({
        queryKey: [USER_QUERY]
      })

      toast({
        title: "You successfully updated your Weights and Biases key!",
      });
  }, [user.data?.id, queryClient])

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
