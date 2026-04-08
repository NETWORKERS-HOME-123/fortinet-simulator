import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "up" | "down" | "valid" | "expired" | "warning" | "active" | "inactive" |
  "quarantined" | "isolated" | "monitoring" | "reserved" | "critical" | "high" | "medium" | "low" | "info" |
  "dropped" | "blocked" | "alert" | "allow" | "monitor" | "block";

const statusStyles: Record<string, string> = {
  up: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  down: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  valid: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  expired: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  warning: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  active: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  inactive: "bg-muted text-muted-foreground",
  quarantined: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  isolated: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  monitoring: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  reserved: "bg-secondary text-secondary-foreground",
  critical: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  high: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  medium: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  low: "bg-secondary text-secondary-foreground",
  info: "bg-secondary text-secondary-foreground",
  dropped: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  blocked: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  alert: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  allow: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  monitor: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  block: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
};

export function StatusBadge({ status }: { status: StatusType | string }) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground";
  return (
    <Badge className={cn("capitalize border-0 text-[10px]", style)}>
      {status}
    </Badge>
  );
}
