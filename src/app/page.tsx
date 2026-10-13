import { Button } from "@/components/ui/button";

// Placeholder until the landing page lands in Phase 2.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">FairAnkauf</h1>
      <p className="text-muted-foreground">
        Hier entsteht die neue Website. Verkaufen Sie Ihr Auto bald schnell und fair.
      </p>
      <Button size="lg" disabled>
        Auto verkaufen
      </Button>
    </main>
  );
}
