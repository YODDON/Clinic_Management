import { Badge } from "@/components/ui/badge";

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
      : normalized === "pending" ||
          normalized === "warning" ||
          normalized === "overdue" ||
          normalized === "off"
        ? "secondary"
        : normalized === "cancelled" || normalized === "inactive" || normalized === "urgent"
          ? "destructive"
          : "outline";

  const labelMap: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Ngừng hoạt động",
    planned: "Dự kiến",
    completed: "Hoàn tất",
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
    paid: "Đã thanh toán",
    overdue: "Quá hạn",
    off: "Nghỉ",
    urgent: "Khẩn cấp",
    warning: "Cảnh báo",
    unknown: "Không xác định",
  };

  return <Badge variant={variant}>{labelMap[normalized] ?? normalized}</Badge>;
}
