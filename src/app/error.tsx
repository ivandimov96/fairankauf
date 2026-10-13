"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid w-full max-w-xl flex-1 content-center justify-items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Da ist etwas schiefgelaufen.</h1>
      <p className="text-muted-foreground">
        Bitte versuchen Sie es noch einmal. Ihre Eingaben im Formular bleiben gespeichert.
      </p>
      <Button size="lg" className="mt-2" onClick={reset}>
        Erneut versuchen
      </Button>
    </main>
  );
}
