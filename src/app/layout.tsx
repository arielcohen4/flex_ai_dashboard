import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import ScriptsWidget from "./ScriptsWidget";
import { CSPostHogProvider } from "@/providers/posthog";
import { PostHogIdentifyWrapper } from "@/providers/posthog-identify-wrapper";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FlexAI",
  description: "Serverless Finetune and Inference for Open Source LLMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="logo.svg" sizes="any" type="image/svg+xml" />
      <CSPostHogProvider>
        <body className={GeistSans.className}>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <PostHogIdentifyWrapper>{children}</PostHogIdentifyWrapper>
              <ScriptsWidget />
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
          <Script src="https://assets.lemonsqueezy.com/lemon.js" />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
