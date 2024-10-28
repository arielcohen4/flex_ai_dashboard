"use client";

import { useEffect, type PropsWithChildren } from "react";
import posthog from "posthog-js";
import useUser from "@/app/hook/useUser";

export function PostHogIdentifyWrapper({ children }: PropsWithChildren) {
  const { data: user } = useUser();

  useEffect(() => {
    // Check URL parameters on mount
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("signin") === "true") {
      posthog.capture("user_signed_in", {
        source: "query_parameter",
      });
      urlParams.delete("signin");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${
          urlParams.toString() ? "?" + urlParams.toString() : ""
        }`
      );
    }

    if (urlParams.get("signup") === "true") {
      posthog.capture("user_signed_up", {
        source: "query_parameter",
      });
      urlParams.delete("signup");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${
          urlParams.toString() ? "?" + urlParams.toString() : ""
        }`
      );
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.display_name,
      });
    }
  }, [user]);

  return <>{children}</>;
}
