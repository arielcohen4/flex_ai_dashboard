import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import ScriptsWidget from "./ScriptsWidget";
import { CSPostHogProvider } from "@/providers/posthog";
import { PostHogIdentifyWrapper } from "@/providers/posthog-identify-wrapper";
import { LemonSqueezyWrapper } from "@/providers/lemonsqueezy-wrapper";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Flex AI | Serverless Finetune and Inference for Open Source LLMs",
  description:
    "Flex AI | Serverless Finetune and Inference for Open Source LLMs",
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
              <PostHogIdentifyWrapper>
                <LemonSqueezyWrapper> {children}</LemonSqueezyWrapper>
              </PostHogIdentifyWrapper>
              <ScriptsWidget />
              <Script
                src="//code.tidio.co/twaovsscmfx2shhmwo4zvq2bh4njwenm.js"
                strategy="lazyOnload"
              />
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
          <Script src="https://assets.lemonsqueezy.com/lemon.js" />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
