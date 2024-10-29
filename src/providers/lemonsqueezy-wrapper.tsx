"use client";

import { useEffect, type PropsWithChildren } from "react";
import posthog from "posthog-js";
import useUser from "@/app/hook/useUser";

export function LemonSqueezyWrapper({ children }: PropsWithChildren) {
  const { data: user } = useUser();

  useEffect(() => {
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.display_name,
      });

      // Check URL parameters on mount
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("payment_id") && urlParams.get("amount")) {
        posthog.capture("checkout_completed", {
          amount: parseFloat(urlParams.get("amount") as string),
          payment_id: urlParams.get("payment_id"),
        });

        urlParams.delete("payment_id");
        urlParams.delete("amount");
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${
            urlParams.toString() ? "?" + urlParams.toString() : ""
          }`
        );
      }
    }
  }, [user]);

  return <>{children}</>;
}
