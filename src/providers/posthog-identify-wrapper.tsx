"use client";

import { useEffect, type PropsWithChildren } from "react";
import posthog from "posthog-js";
import useUser from "@/app/hook/useUser";

export function PostHogIdentifyWrapper({ children }: PropsWithChildren) {
  const { data: user } = useUser();

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
