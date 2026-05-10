import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

export function StatusBadge({ value }: { value: string | boolean | null | undefined }) {
  const normalized =
    typeof value === "boolean"
      ? value
        ? "active"
        : "inactive"
      : (value || "unknown").toLowerCase();

  const variant =
    normalized === "paid" ||
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "planned" ||
    normalized === "active"
      ? "default"
      : normalized === "pending" || normalized === "warning" || normalized === "overdue" || normalized === "off"
        ? "secondary"
        : normalized === "cancelled" || normalized === "inactive" || normalized === "urgent"
          ? "destructive"
          : "outline";

  return <Badge variant={variant}>{titleCase(normalized)}</Badge>;
}
