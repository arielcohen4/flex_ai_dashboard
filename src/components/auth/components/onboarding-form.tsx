"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const roles = [
  "Founder/CTO",
  "Data Scientist",
  "MLOps",
  "VP/Head of Engineering",
  "AI Researcher",
  "AI Consultant",
  "AI/ML Engineer",
  "Software Developer",
  "Other",
] as const;

const companySizes = [
  "Indie-hacker (1)",
  "2 - 10",
  "11 - 50",
  "50 - 100",
  "100 - 200",
  "200+",
] as const;

const productionModels = [
  "OpenAI",
  "Claude",
  "Llama",
  "Mistral / Mixtral",
  "CodeLlama",
  "Gemini",
  "Gemma",
  "Other",
] as const;

const llmGoals = [
  "Security and Privacy",
  "Higher Accuracy",
  "Lower costs",
  "Speed",
  "Many examples",
  "Structured Output",
  "Other",
] as const;

const fineTuningMethods = [
  "Custom code",
  "Axolot",
  "Unsloth",
  "OpenAI",
  "TogetherAI",
  "Other",
] as const;

const referralSources = [
  "LinkedIn",
  "Twitter",
  "YouTube",
  "Google",
  "Other",
] as const;

const formSchema = z.object({
  role: z.enum(roles),
  companySize: z.enum(companySizes),
  companyName: z.string().min(1, "Company name is required"),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
  productionModels: z.array(z.enum(productionModels)).optional(),
  llmGoals: z.array(z.enum(llmGoals)).optional(),
  fineTuningMethods: z.array(z.enum(fineTuningMethods)).optional(),
  referralSource: z.enum(referralSources),
});

export function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionModels: undefined,
      llmGoals: undefined,
      fineTuningMethods: undefined,
      referralSource: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const supabase = supabaseBrowser();

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No user session found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          role: data.role,
          company_size: data.companySize,
          company_name: data.companyName,
          linkedin_url: data.linkedinUrl,
          production_models: data.productionModels?.join(","),
          llm_goals: data.llmGoals?.join(","),
          fine_tuning_methods: data.fineTuningMethods?.join(","),
          referral_source: data.referralSource,
          onboarding_completed: true,
        })
        .eq("id", session.session.user.id);

      if (error) throw error;

      toast({
        title: "Onboarding completed!",
        description: "Thank you for providing your information.",
      });

      router.push("/schedule-call");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save onboarding information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your LinkedIn</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What best describes your role?*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referralSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you find us?*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {referralSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many people work at your company?*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company/Organization*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productionModels"
            render={() => (
              <FormItem>
                <FormLabel>
                  Which model(s) are you using in production?
                </FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {productionModels.map((model) => (
                    <FormField
                      key={model}
                      control={form.control}
                      name="productionModels"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(model)}
                              onCheckedChange={(checked) => {
                                const value = field.value || [];
                                if (checked) {
                                  field.onChange([...value, model]);
                                } else {
                                  field.onChange(
                                    value.filter((val) => val !== model)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{model}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="llmGoals"
            render={() => (
              <FormItem>
                <FormLabel>
                  What do you hope to achieve by using/fine-tuning open-source
                  LLMs?
                </FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {llmGoals.map((goal) => (
                    <FormField
                      key={goal}
                      control={form.control}
                      name="llmGoals"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(goal)}
                              onCheckedChange={(checked) => {
                                const value = field.value || [];
                                if (checked) {
                                  field.onChange([...value, goal]);
                                } else {
                                  field.onChange(
                                    value.filter((val) => val !== goal)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{goal}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fineTuningMethods"
            render={() => (
              <FormItem>
                <FormLabel>How do you fine-tune and inference today?</FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {fineTuningMethods.map((method) => (
                    <FormField
                      key={method}
                      control={form.control}
                      name="fineTuningMethods"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(method)}
                              onCheckedChange={(checked) => {
                                const value = field.value || [];
                                if (checked) {
                                  field.onChange([...value, method]);
                                } else {
                                  field.onChange(
                                    value.filter((val) => val !== method)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {method}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
    </Card>
  );
}
