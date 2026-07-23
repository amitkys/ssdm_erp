import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProfileInfoRowProps {
  label: string;
  value: string | number | null | undefined;
  masked?: boolean;
  badge?: {
    variant: "default" | "destructive" | "secondary" | "outline";
    label: string;
  } | null;
  className?: string;
}

export function ProfileInfoRow({
  label,
  value,
  masked = false,
  badge,
  className,
}: ProfileInfoRowProps) {
  const displayValue =
    masked && typeof value === "string" && value.length >= 4
      ? `XXXX XXXX ${value.slice(-4)}`
      : value;

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(120px,_0.4fr)_1fr] items-baseline gap-4 border-b border-border/50 py-3 last:border-b-0",
        className,
      )}
    >
      <span className="text-xs font-semibold text-muted-foreground tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {badge ? (
          <Badge variant={badge.variant} className="text-[11px]">
            {badge.label}
          </Badge>
        ) : (
          displayValue || (
            <span className="text-muted-foreground/50 italic">—</span>
          )
        )}
      </span>
    </div>
  );
}

interface ProfileSectionHeaderProps {
  title: string;
  className?: string;
}

export function ProfileSectionHeader({
  title,
  className,
}: ProfileSectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 pt-2 pb-1", className)}>
      <div className="h-5 w-1 rounded-full bg-primary" />
      <h3 className="text-sm font-bold text-foreground tracking-tight">
        {title}
      </h3>
    </div>
  );
}
