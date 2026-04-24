import type { ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDescription: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (isLoading) {
    return <div className="py-10 text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Không tải được dữ liệu"
        description={error.message}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          ) : null
        }
      />
    );
  }

  if (isEmpty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
