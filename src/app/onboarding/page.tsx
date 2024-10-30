import { OnboardingForm } from "@/components/auth/components/onboarding-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Flex AI",
};

export default function Onboarding() {
  return (
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[600px] lg:p-8">
        <div className="mb-4 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to FlexAI
          </h1>
          <p className="text-sm text-muted-foreground">
            Please tell us a bit about yourself to help us personalize your
            experience.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
