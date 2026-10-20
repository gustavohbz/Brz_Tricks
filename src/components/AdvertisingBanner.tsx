import { ArrowUpRight } from "lucide-react";
import { advertisingBanner } from "@/data/site-messages";

export function AdvertisingBanner() {
  const content = (
    <div className="flex min-h-28 w-full items-center justify-between gap-4 border-y border-border bg-secondary px-4 py-5 sm:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <img src="/icon-192.png" alt="" className="hidden size-16 shrink-0 rounded-md sm:block" />
        <div className="min-w-0">
          <p className="text-xs uppercase text-primary">{advertisingBanner.label}</p>
          <p className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{advertisingBanner.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{advertisingBanner.action}</p>
        </div>
      </div>
      <ArrowUpRight className="size-7 shrink-0 text-primary" aria-hidden="true" />
    </div>
  );
  const className = "block w-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <aside aria-label="Banner de divulgação" className="w-full">
      {advertisingBanner.href.startsWith("https://") ? (
        <a href={advertisingBanner.href} target="_blank" rel="noopener noreferrer sponsored" className={className}>{content}</a>
      ) : (
        <a href={advertisingBanner.href} className={className}>{content}</a>
      )}
    </aside>
  );
}