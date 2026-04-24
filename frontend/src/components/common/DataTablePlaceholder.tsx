import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import type { LucideIcon } from "lucide-react";

export function DataTablePlaceholder({
  columns,
  icon,
  title,
  description,
}: {
  columns: string[];
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((c) => (
              <TableHead key={c} className="text-muted-foreground text-xs uppercase tracking-wide">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="p-0">
              <EmptyState icon={icon} title={title} description={description} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
