import { HeaderCta } from "@/components/site/header-cta";
import { Logo } from "@/components/site/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <HeaderCta />
      </div>
    </header>
  );
}
