import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Receipt } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerPortalApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/my/invoices/$id")({
  component: MyInvoiceDetailPage,
  head: () => ({ meta: [{ title: "Chi tiết hóa đơn | DentalPro" }] }),
});

function MyInvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();

  const invoiceQuery = useQuery({
    queryKey: ["my", "invoices", id],
    queryFn: () => customerPortalApi.getInvoice(id),
  });
  const itemsQuery = useQuery({
    queryKey: ["my", "invoices", id, "items"],
    queryFn: () => customerPortalApi.getInvoiceItems(id),
  });
  const paymentsQuery = useQuery({
    queryKey: ["my", "invoices", id, "payments"],
    queryFn: () => customerPortalApi.getInvoicePayments(id),
  });

  const invoice = invoiceQuery.data;
  const items = itemsQuery.data || [];
  const payments = paymentsQuery.data || [];

  return (
    <CustomerShell
      pathname={`/my/invoices/${id}`}
      title="Chi tiết hóa đơn"
      actions={
        <Button variant="outline" onClick={() => void navigate({ to: "/my/invoices" })}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
      }
    >
      {invoice && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge value={invoice.status} />
                      <span className="text-xs text-muted-foreground">#{invoice.invoiceNumber}</span>
                    </div>
                    <h2 className="text-xl font-bold">{invoice.patientName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Phát hành {formatDate(invoice.issuedAt)}
                      {invoice.issuedByName ? ` bởi ${invoice.issuedByName}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng tiền</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Receipt className="h-4 w-4 text-primary" /> Dòng hóa đơn
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="w-24 text-right">SL</TableHead>
                      <TableHead className="w-36 text-right">Đơn giá</TableHead>
                      <TableHead className="w-36 text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <CreditCard className="h-4 w-4 text-primary" /> Thanh toán
                </h3>
                {payments.length === 0 ? (
                  <p className="rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">
                    Chưa ghi nhận thanh toán.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{payment.paymentMethod}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                          </div>
                          <p className="font-bold text-primary">{formatCurrency(payment.amount)}</p>
                        </div>
                        {payment.notes && <p className="mt-2 text-xs text-muted-foreground">{payment.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardContent className="space-y-3 p-5">
              <InfoLine label="Tạm tính" value={formatCurrency(invoice.subtotal)} />
              <InfoLine label="Giảm trừ" value={formatCurrency(invoice.insuranceDiscount)} />
              <InfoLine label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
              <div className="border-t border-border pt-3">
                <InfoLine label="Tổng tiền" value={formatCurrency(invoice.totalAmount)} strong />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </CustomerShell>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
