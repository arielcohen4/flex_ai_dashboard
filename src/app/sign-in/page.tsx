import { UserAuthForm } from "@/components/auth/components/user-auth-form";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Flex AI",
};

export default function SignIn() {
  return (
    <>
      <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            FlexAI
          </div>

          <img
            src="/logo.svg"
            className="relative m-auto"
            width={301}
            height={60}
            alt="Vite"
          />

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Since using FlexAI, every developer can work with LLMs in
                our startup.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight flex items-center">
                Join FlexAI{" "}
                <img
                  src="/logo.svg"
                  className="inline-block ml-2"
                  width={24}
                  height={24}
                  alt="FlexAI Logo"
                />
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with your github or google account <br />
                enjoy open source LLMs
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <UserAuthForm />
            </Suspense>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking login, you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
