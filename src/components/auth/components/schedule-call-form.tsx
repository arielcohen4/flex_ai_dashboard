"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/custom/button";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import JSConfetti from "js-confetti";

export default function ScheduleCallForm() {
  const router = useRouter();
  return (
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[600px] lg:p-8">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <CalendarDays className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Unlock the Full Potential of Your AI Models
            </h1>
            <p className="text-muted-foreground max-w-[500px]">
              Join a personalized 30-minute session with FlexAI's founders to
              discover how leading companies are achieving 40%+ better model
              performance. We'll analyze your specific use case and share
              battle-tested strategies for LLM fine-tuning and deployment.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mt-2">
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Free Credits
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Expert tips on model optimization & cost reduction
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Free technical consultation worth $500
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px] mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                <a
                  href="https://app.apollo.io/#/meet/ariel/30-min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  Reserve Your Free Strategy Session
                </a>
              </Button>
              <Button
                onClick={() => {
                  const jsConfetti = new JSConfetti();
                  jsConfetti.addConfetti({
                    emojis: ["🤗", "⚡️", "🎉"],
                  });
                  router.push("/");
                }}
                variant="outline"
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              &quot;The insights from our call with FlexAI helped us improve our
              model&apos;s accuracy by 43% while cutting inference costs in
              half.&quot; - Leading AI Team
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
