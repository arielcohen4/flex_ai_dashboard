// components/ChatWidget.tsx
"use client"; // Only this component is client-side

import { useEffect } from "react";

// Add this at the top of the file
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const ScriptsWidget = () => {
  useEffect(() => {
    // Run only on the client
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "eebd99d8-869e-4160-a196-ad793cd3cff2";

    (function () {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }, []); // Empty dependency array ensures it runs only once

  return null; // No UI component needed
};

export default ScriptsWidget;
