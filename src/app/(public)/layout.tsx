import { Logo } from "@/components/site/logo";
import { SiteFooter } from "@/components/site/site-footer";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Logo />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </>
  );
}
