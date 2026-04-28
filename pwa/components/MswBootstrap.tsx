"use client";

import { useEffect, useState } from "react";

const MOCK_ENABLED = process.env.NEXT_PUBLIC_API_MOCK === "1";

export function MswBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCK_ENABLED);

  useEffect(() => {
    if (!MOCK_ENABLED || typeof window === "undefined") return;
    let cancelled = false;
    void (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
