import NotFound from "./(public)/not-found";
import { Logo } from "@/components/site/logo";
import { SiteFooter } from "@/components/site/site-footer";

// Catch-all 404 for URLs outside the (public) group, with the normal site chrome.
export default function GlobalNotFound() {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Logo />
        </div>
      </header>
      <NotFound />
      <SiteFooter />
    </>
  );
}
