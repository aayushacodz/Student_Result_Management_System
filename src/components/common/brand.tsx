import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-border",
        className,
      )}
      aria-hidden="true"
    >
      <img
        src="/assets/Reliance-College-Logo.webp"
        alt=""
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

export function BrandLockup({
  title = "Student Result",
  subtitle = "Management System",
  className,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandMark />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
        <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
