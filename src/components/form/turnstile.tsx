"use client";

import * as React from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Cloudflare Turnstile widget. Renders nothing when no site key is configured. */
export function Turnstile({ onToken }: { onToken: (token: string | undefined) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const onTokenRef = React.useRef(onToken);
  React.useEffect(() => {
    onTokenRef.current = onToken;
  });

  React.useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current || !(loaded || window.turnstile)) return;
    const id = window.turnstile!.render(ref.current, {
      sitekey: TURNSTILE_SITE_KEY,
      language: "de",
      "refresh-expired": "auto",
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(undefined),
      "error-callback": () => onTokenRef.current(undefined),
    });
    return () => window.turnstile?.remove(id);
  }, [loaded]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
