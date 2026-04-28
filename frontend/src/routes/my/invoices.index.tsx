import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, Inbox, Receipt } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { customerPortalApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/types/api";

export const Route = createFileRoute("/my/invoices/")({
  component: MyInvoicesPage,
  head: () => ({ meta: [{ title: "Hóa đơn của tôi | DentalPro" }] }),
});

function MyInvoicesPage() {
  const invoicesQuery = useQuery({
    queryKey: ["my", "invoices"],
    queryFn: async () => (await customerPortalApi.listInvoices()).content,
  });

  const invoices = invoicesQuery.data || [];

  return (
    <CustomerShell pathname="/my/invoices" title="Hóa đơn của tôi">
      <div className="space-y-4">
        {invoicesQuery.isLoading && <ListSkeleton />}
        {!invoicesQuery.isLoading && invoices.length === 0 && (
          <EmptyState
            title="Chưa có hóa đơn"
            description="Hóa đơn sẽ xuất hiện sau khi bác sĩ hoàn tất hồ sơ điều trị và phòng khám phát hành."
          />
        )}
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </CustomerShell>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <Card className="transition-all hover:shadow-[0_18px_60px_-26px_rgba(13,148,136,0.18)]">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge value={invoice.status} />
              <span className="text-xs text-muted-foreground">#{invoice.invoiceNumber}</span>
            </div>
            <p className="text-base font-bold">{invoice.patientName}</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="h-4 w-4 shrink-0 text-primary" />
                <span>Phát hành: {formatDate(invoice.issuedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>Hạn thanh toán: {formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng tiền</p>
            <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/my/invoices/$id" params={{ id: invoice.id }}>
              Chi tiết <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <>
      {[1, 2].map((item) => (
        <Card key={item}>
          <CardContent className="space-y-3 p-5">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
