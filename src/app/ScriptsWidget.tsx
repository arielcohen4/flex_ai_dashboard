// components/ChatWidget.tsx
"use client"; // Only this component is client-side

// Add this type declaration at the top of the file
declare global {
  interface Window {
    tidioChatApi: any;
  }
}

import { useEffect } from "react";
import useUser from "./hook/useUser";

const ScriptsWidget = () => {
  const user = useUser();

  useEffect(() => {
    if (user) {
      // Check if Tidio API is available
      if (window.tidioChatApi) {
        window.tidioChatApi.setVisitorData({
          email: user.data?.email,
          name: user.data?.display_name,
        });
      }
    }

    return () => {}; // No cleanup needed
  }, [user]);

  return null; // No UI component needed
};

export default ScriptsWidget;
