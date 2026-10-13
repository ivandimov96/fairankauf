import NotFound from "./(public)/not-found";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

// Catch-all 404 for URLs outside the (public) group, with the normal site chrome.
export default function GlobalNotFound() {
  return (
    <>
      <SiteHeader />
      <NotFound />
      <SiteFooter />
    </>
  );
}
