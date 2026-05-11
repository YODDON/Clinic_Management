import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Eye,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Toolbar } from "@/components/common/Toolbar";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRoleAccess } from "@/hooks/use-role-access";
import { appointmentsApi, invoicesApi, patientsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type { Appointment, Invoice, InvoiceItemInput, PaymentPayload, Patient } from "@/types/api";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
  head: () => ({ meta: [{ title: "Hóa đơn | DentalPro" }] }),
});

type InvoiceFormValues = {
  patientId: string;
  appointmentId: string;
  invoiceNumber: string;
  insuranceDiscount: string;
  dueDate: string;
};

type InvoiceDraftItem = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const invoiceInitialValues: InvoiceFormValues = {
  patientId: "",
  appointmentId: "none",
  invoiceNumber: "",
  insuranceDiscount: "",
  dueDate: "",
};

const createEmptyInvoiceItem = (): InvoiceDraftItem => ({
  description: "",
  quantity: "1",
  unitPrice: "0",
});

const statusFields = [
  {
    name: "status",
    label: "Trạng thái",
    type: "select" as const,
    required: true,
    options: [
      { label: "Chờ thanh toán", value: "pending" },
      { label: "Đã thanh toán", value: "paid" },
      { label: "Quá hạn", value: "overdue" },
      { label: "Đã hủy", value: "cancelled" },
    ],
  },
];

const paymentFields = [
  { name: "amount", label: "Số tiền", type: "number" as const, required: true },
  {
    name: "paymentMethod",
    label: "Phương thức thanh toán",
    type: "select" as const,
    required: true,
    options: [
      { label: "Tiền mặt", value: "cash" },
      { label: "Chuyển khoản", value: "bank_transfer" },
      { label: "Thẻ", value: "card" },
    ],
  },
  { name: "notes", label: "Ghi chú", type: "textarea" as const },
];

function buildInvoiceItems(items: InvoiceDraftItem[]): InvoiceItemInput[] {
  const normalizedItems = items
    .map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }))
    .filter((item) => item.description.length > 0);

  if (normalizedItems.length === 0) {
    throw new Error("Hóa đơn phải có ít nhất 1 dòng dịch vụ hoặc vật tư.");
  }

  for (const item of normalizedItems) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error("Số lượng mỗi dòng phải lớn hơn 0.");
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new Error("Đơn giá mỗi dòng không hợp lệ.");
    }
  }

  return normalizedItems;
}
export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const { can } = useRoleAccess();
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceFormValues, setInvoiceFormValues] = useState(invoiceInitialValues);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceDraftItem[]>([createEmptyInvoiceItem()]);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const deferredSearch = useDeferredValue(search);

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await invoicesApi.list()).content,
  });
  const patientsQuery = useQuery({
    queryKey: ["patients", "options"],
    queryFn: async () => (await patientsApi.list()).content,
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "options"],
    queryFn: async () => (await appointmentsApi.list()).content,
  });

  const filteredAppointments = (appointmentsQuery.data || []).filter((appointment) => {
    if (!invoiceFormValues.patientId) return false;
    return appointment.patientId === invoiceFormValues.patientId;
  });

  const invoices = (invoicesQuery.data || []).filter((invoice) => {
    const keyword = deferredSearch.toLowerCase();
    const matchesSearch =
      !deferredSearch ||
      invoice.invoiceNumber.toLowerCase().includes(keyword) ||
      invoice.patientName.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = (invoicesQuery.data || []).filter(
    (invoice) => invoice.status === "pending",
  ).length;
  const paidCount = (invoicesQuery.data || []).filter(
    (invoice) => invoice.status === "paid",
  ).length;
  const overdueCount = (invoicesQuery.data || []).filter(
    (invoice) => invoice.status === "overdue",
  ).length;
  const revenue = (invoicesQuery.data || [])
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
  const paginatedInvoices = invoices.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const invoiceItemsPreviewTotal = invoiceItems.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return sum;
    return sum + quantity * unitPrice;
  }, 0);

  const refreshInvoices = async () => {
    await queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: {
      patientId: string;
      appointmentId: string | null;
      invoiceNumber: string;
      insuranceDiscount: number | null;
      dueDate: string | null;
      items: InvoiceItemInput[];
    }) =>
      invoicesApi.create({
        patientId: payload.patientId,
        appointmentId: payload.appointmentId,
        invoiceNumber: payload.invoiceNumber,
        insuranceDiscount: payload.insuranceDiscount,
        dueDate: payload.dueDate,
        items: payload.items,
      }),
    onSuccess: async () => {
      toast.success("Đã tạo hóa đơn");
      setInvoiceFormOpen(false);
      setInvoiceFormValues(invoiceInitialValues);
      setInvoiceItems([createEmptyInvoiceItem()]);
      await refreshInvoices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!statusInvoice) throw new Error("Chưa chọn hóa đơn.");
      return invoicesApi.updateStatus(statusInvoice.id, values.status);
    },
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái hóa đơn");
      setStatusInvoice(null);
      await refreshInvoices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!paymentInvoice) throw new Error("Chưa chọn hóa đơn.");
      const payload: PaymentPayload = {
        invoiceId: paymentInvoice.id,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
        notes: values.notes || null,
      };
      return invoicesApi.createPayment(payload);
    },
    onSuccess: async () => {
      toast.success("Đã ghi nhận thanh toán");
      setPaymentInvoice(null);
      await refreshInvoices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => invoicesApi.delete(invoiceId),
    onSuccess: async () => {
      toast.success("Đã xóa hóa đơn");
      setDeleteInvoice(null);
      await refreshInvoices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Hóa đơn"
      subtitle="Danh sách hóa đơn đồng bộ từ backend"
      allowedRoles={["admin", "dentist"]}
      actions={
        can("invoices.write") ? (
          <Button
            size="sm"
            onClick={() => {
              setInvoiceFormValues(invoiceInitialValues);
              setInvoiceItems([createEmptyInvoiceItem()]);
              setInvoiceFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo hóa đơn
          </Button>
        ) : undefined
      }
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu đã thu"
          value={formatCurrency(revenue)}
          icon={CircleDollarSign}
          tone="success"
        />
        <StatCard
          label="Đã thanh toán"
          value={String(paidCount)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Chờ thanh toán" value={String(pendingCount)} icon={Clock} tone="warning" />
        <StatCard label="Quá hạn" value={String(overdueCount)} icon={Receipt} tone="destructive" />
      </div>

      <PageSection>
        <div className="mb-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ thanh toán</TabsTrigger>
              <TabsTrigger value="paid">Đã thanh toán</TabsTrigger>
              <TabsTrigger value="overdue">Quá hạn</TabsTrigger>
              <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Toolbar
          placeholder="Tìm theo số hóa đơn, bệnh nhân..."
          value={search}
          onValueChange={setSearch}
        />
        <QueryState
          isLoading={invoicesQuery.isLoading}
          error={invoicesQuery.error}
          isEmpty={invoices.length === 0}
          emptyIcon={Receipt}
          emptyTitle="Chưa có hóa đơn"
          emptyDescription="Khi backend có dữ liệu hóa đơn, bảng sẽ hiển thị tại đây."
          onRetry={() => invoicesQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số HĐ</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Ngày phát hành</TableHead>
                <TableHead>Hạn thanh toán</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.patientName}</TableCell>
                  <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge value={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("invoices.status") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Cập nhật trạng thái"
                          title="Cập nhật trạng thái"
                          onClick={() => setStatusInvoice(invoice)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("invoices.payment") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Ghi nhận thanh toán"
                          title="Ghi nhận thanh toán"
                          onClick={() => setPaymentInvoice(invoice)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      {can("invoices.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa hóa đơn"
                          title="Xóa hóa đơn"
                          onClick={() => setDeleteInvoice(invoice)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ClientPagination
            page={page}
            totalItems={invoices.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </QueryState>
      </PageSection>

      {can("invoices.write") && (
        <Dialog
          open={invoiceFormOpen}
          onOpenChange={(open) => {
            setInvoiceFormOpen(open);
            if (!open) {
              setInvoiceFormValues(invoiceInitialValues);
              setInvoiceItems([createEmptyInvoiceItem()]);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn</DialogTitle>
              <DialogDescription>
                Chọn bệnh nhân, lịch hẹn liên quan và nhập từng dòng chi phí thực tế. Không cần nhập
                JSON.
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-6"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!invoiceFormValues.patientId) {
                  toast.error("Vui lòng chọn bệnh nhân.");
                  return;
                }

                if (!invoiceFormValues.invoiceNumber.trim()) {
                  toast.error("Vui lòng nhập số hóa đơn.");
                  return;
                }

                try {
                  await createInvoiceMutation.mutateAsync({
                    patientId: invoiceFormValues.patientId,
                    appointmentId:
                      invoiceFormValues.appointmentId === "none"
                        ? null
                        : invoiceFormValues.appointmentId,
                    invoiceNumber: invoiceFormValues.invoiceNumber.trim(),
                    insuranceDiscount: invoiceFormValues.insuranceDiscount
                      ? Number(invoiceFormValues.insuranceDiscount)
                      : null,
                    dueDate: invoiceFormValues.dueDate || null,
                    items: buildInvoiceItems(invoiceItems),
                  });
                } catch {
                  // mutation and validation already report the error
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice-patient">Bệnh nhân *</Label>
                  <Select
                    value={invoiceFormValues.patientId}
                    onValueChange={(value) => {
                      setInvoiceFormValues((current) => {
                        const hasMatchingAppointment = (appointmentsQuery.data || []).some(
                          (appointment) =>
                            appointment.id === current.appointmentId &&
                            appointment.patientId === value,
                        );

                        return {
                          ...current,
                          patientId: value,
                          appointmentId: hasMatchingAppointment ? current.appointmentId : "none",
                        };
                      });
                    }}
                  >
                    <SelectTrigger id="invoice-patient">
                      <SelectValue placeholder="Chọn bệnh nhân" />
                    </SelectTrigger>
                    <SelectContent>
                      {(patientsQuery.data || []).map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-appointment">Lịch hẹn</Label>
                  <Select
                    value={invoiceFormValues.appointmentId}
                    onValueChange={(value) =>
                      setInvoiceFormValues((current) => ({ ...current, appointmentId: value }))
                    }
                  >
                    <SelectTrigger id="invoice-appointment">
                      <SelectValue placeholder="Chọn lịch hẹn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không gắn lịch hẹn</SelectItem>
                      {filteredAppointments.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id}>
                          {appointment.patientName} - {appointment.appointmentDate.slice(0, 10)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Số hóa đơn *</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceFormValues.invoiceNumber}
                    onChange={(event) =>
                      setInvoiceFormValues((current) => ({
                        ...current,
                        invoiceNumber: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: INV-20260428-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-discount">Giảm trừ bảo hiểm</Label>
                  <Input
                    id="invoice-discount"
                    type="number"
                    min="0"
                    value={invoiceFormValues.insuranceDiscount}
                    onChange={(event) =>
                      setInvoiceFormValues((current) => ({
                        ...current,
                        insuranceDiscount: event.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-due-date">Hạn thanh toán</Label>
                  <Input
                    id="invoice-due-date"
                    type="date"
                    value={invoiceFormValues.dueDate}
                    onChange={(event) =>
                      setInvoiceFormValues((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">Danh sách item</h3>
                    <p className="text-sm text-muted-foreground">
                      Nhập từng dòng dịch vụ hoặc vật tư thực tế trên hóa đơn.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setInvoiceItems((current) => [...current, createEmptyInvoiceItem()])
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Thêm dòng
                  </Button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, index) => (
                    <div
                      key={`item-${index}`}
                      className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_120px_160px_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`invoice-item-description-${index}`}>Mô tả *</Label>
                        <Textarea
                          id={`invoice-item-description-${index}`}
                          value={item.description}
                          onChange={(event) =>
                            setInvoiceItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, description: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          placeholder="Ví dụ: Cạo vôi răng, Vật liệu composite..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`invoice-item-quantity-${index}`}>Số lượng *</Label>
                        <Input
                          id={`invoice-item-quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            setInvoiceItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, quantity: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`invoice-item-unit-price-${index}`}>Đơn giá *</Label>
                        <Input
                          id={`invoice-item-unit-price-${index}`}
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(event) =>
                            setInvoiceItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, unitPrice: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={invoiceItems.length === 1}
                          onClick={() =>
                            setInvoiceItems((current) =>
                              current.filter((_, entryIndex) => entryIndex !== index),
                            )
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">Tạm tính theo các dòng đã nhập</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-900">
                    {formatCurrency(invoiceItemsPreviewTotal)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createInvoiceMutation.isPending}
                  onClick={() => setInvoiceFormOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? "Đang lưu..." : "Tạo hóa đơn"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <DetailDialog
        open={Boolean(detailInvoice)}
        onOpenChange={(open) => !open && setDetailInvoice(null)}
        title={detailInvoice?.invoiceNumber || "Chi tiết hóa đơn"}
        description="Thông tin hóa đơn"
        items={
          detailInvoice
            ? [
                { label: "Số hóa đơn", value: detailInvoice.invoiceNumber },
                { label: "Bệnh nhân", value: detailInvoice.patientName },
                { label: "Ngày phát hành", value: formatDate(detailInvoice.issuedAt) },
                { label: "Hạn thanh toán", value: formatDate(detailInvoice.dueDate) },
                { label: "Tạm tính", value: formatCurrency(detailInvoice.subtotal) },
                {
                  label: "Giảm trừ bảo hiểm",
                  value: formatCurrency(detailInvoice.insuranceDiscount),
                },
                { label: "Tổng tiền", value: formatCurrency(detailInvoice.totalAmount) },
                { label: "Trạng thái", value: detailInvoice.status },
              ]
            : []
        }
      />

      {can("invoices.status") && (
        <CrudFormDialog
          open={Boolean(statusInvoice)}
          onOpenChange={(open) => !open && setStatusInvoice(null)}
          title={`Cập nhật trạng thái${statusInvoice ? `: ${statusInvoice.invoiceNumber}` : ""}`}
          fields={statusFields}
          initialValues={{ status: statusInvoice?.status ?? "pending" }}
          submitLabel="Cập nhật"
          pending={updateStatusMutation.isPending}
          onSubmit={async (values) => updateStatusMutation.mutateAsync(values)}
        />
      )}

      {can("invoices.payment") && (
        <CrudFormDialog
          open={Boolean(paymentInvoice)}
          onOpenChange={(open) => !open && setPaymentInvoice(null)}
          title={`Ghi nhận thanh toán${paymentInvoice ? `: ${paymentInvoice.invoiceNumber}` : ""}`}
          fields={paymentFields}
          initialValues={{ amount: "", paymentMethod: "cash", notes: "" }}
          submitLabel="Lưu thanh toán"
          pending={createPaymentMutation.isPending}
          onSubmit={async (values) => createPaymentMutation.mutateAsync(values)}
        />
      )}

      {can("invoices.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteInvoice)}
          onOpenChange={(open) => !open && setDeleteInvoice(null)}
          title="Xóa hóa đơn"
          description={`Bạn có chắc muốn xóa hóa đơn "${deleteInvoice?.invoiceNumber}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteInvoice) {
              await deleteMutation.mutateAsync(deleteInvoice.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
