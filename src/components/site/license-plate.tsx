import { cn } from "@/lib/utils";

/**
 * Decorative German-style number plate: EU strip, letters, the two round stickers
 * (HU and state seal) and numbers. Purely visual, hidden from screen readers.
 */
export function LicensePlate({
  left = "FA",
  right = "IR 100",
  className,
}: {
  left?: string;
  right?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "inline-flex h-16 items-stretch overflow-hidden rounded-lg border-[3px] border-neutral-900 bg-white shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)] select-none",
        className,
      )}
    >
      <div className="flex w-9 flex-col items-center justify-between bg-[#1f3fa8] py-1.5 text-white">
        <svg viewBox="0 0 20 20" className="size-5">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={10 + Math.cos(a) * 7} cy={10 + Math.sin(a) * 7} r="1.1" fill="#ffd400" />;
          })}
        </svg>
        <span className="text-sm leading-none font-bold">D</span>
      </div>
      <div className="flex items-center gap-2.5 px-3.5 font-display text-[2.1rem] leading-none font-bold tracking-wide text-neutral-900">
        <span>{left}</span>
        <span className="flex flex-col gap-1">
          <span className="size-3.5 rounded-full border border-neutral-400 bg-signal" />
          <span className="size-3.5 rounded-full border border-neutral-400 bg-neutral-200" />
        </span>
        <span className="whitespace-nowrap">{right}</span>
      </div>
    </div>
  );
}
