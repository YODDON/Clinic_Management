import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageSection({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>{title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}</div>
          {actions}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
