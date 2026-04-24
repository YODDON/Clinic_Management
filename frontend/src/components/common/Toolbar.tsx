import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function Toolbar({
  placeholder = "Tìm kiếm...",
  value,
  onValueChange,
  children,
}: {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          className="bg-card h-10 pl-9"
        />
      </div>
      {children}
    </div>
  );
}
