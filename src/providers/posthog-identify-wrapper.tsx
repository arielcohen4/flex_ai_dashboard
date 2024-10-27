"use client";

import { useEffect, type PropsWithChildren } from "react";
import posthog from "posthog-js";
import useUser from "@/app/hook/useUser";
import { useSearchParams } from "next/navigation";

export function PostHogIdentifyWrapper({ children }: PropsWithChildren) {
  const { data: user } = useUser();

  const searchParams = useSearchParams();

  useEffect(() => {
    const signin = searchParams.get("signin");
    if (signin === "true") {
      posthog.capture("user_signed_in", {
        source: "query_parameter",
      });

      // Remove the signin parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("signin");
      window.history.replaceState({}, "", url.toString());
    }

    const signup = searchParams.get("signup");
    if (signup === "true") {
      posthog.capture("user_signed_up", {
        source: "query_parameter",
      });

      // Remove the signup parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("signup");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.id) {
      console.log("user", user);
      posthog.identify(user.id, {
        email: user.email,
        name: user.display_name,

        // Add any other user properties you want to track
      });
    }
  }, [user]);

  return <>{children}</>;
}
