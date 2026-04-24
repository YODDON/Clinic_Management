import { useDeferredValue, useState } from "react";
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

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Toolbar } from "@/components/common/Toolbar";
import { useRoleAccess } from "@/hooks/use-role-access";
import { appointmentsApi, invoicesApi, patientsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, Invoice, InvoiceItemInput, PaymentPayload, Patient } from "@/types/api";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
  head: () => ({ meta: [{ title: "Hóa đơn | DentalPro" }] }),
});

const invoiceInitialValues = {
  patientId: "",
  appointmentId: "none",
  invoiceNumber: "",
  insuranceDiscount: "",
  dueDate: "",
  itemsJson: '[{"description":"","quantity":1,"unitPrice":0}]',
};

function buildInvoiceFields(patients: Patient[], appointments: Appointment[]) {
  return [
    {
      name: "patientId",
      label: "Bệnh nhân",
      type: "select" as const,
      required: true,
      options: patients.map((patient) => ({ label: patient.name, value: patient.id })),
    },
    {
      name: "appointmentId",
      label: "Lịch hẹn",
      type: "select" as const,
      options: [{ label: "Không gắn lịch hẹn", value: "none" }].concat(
        appointments.map((appointment) => ({
          label: `${appointment.patientName} - ${appointment.appointmentDate.slice(0, 10)}`,
          value: appointment.id,
        })),
      ),
    },
    { name: "invoiceNumber", label: "Số hóa đơn", required: true },
    { name: "insuranceDiscount", label: "Giảm trừ bảo hiểm", type: "number" as const },
    { name: "dueDate", label: "Hạn thanh toán", type: "date" as const },
    {
      name: "itemsJson",
      label: "Danh sách item (JSON)",
      type: "textarea" as const,
      required: true,
      description:
        'Nhập mảng JSON, ví dụ: [{"description":"Cạo vôi răng","quantity":1,"unitPrice":300000}]',
    },
  ];
}

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

function parseInvoiceItems(value: string): InvoiceItemInput[] {
  const parsed = JSON.parse(value) as InvoiceItemInput[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Danh sách item phải là một mảng JSON không rỗng.");
  }
  return parsed;
}

function InvoicesPage() {
  const { can } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceFormValues, setInvoiceFormValues] = useState(invoiceInitialValues);
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
  const paidCount = (invoicesQuery.data || []).filter((invoice) => invoice.status === "paid").length;
  const overdueCount = (invoicesQuery.data || []).filter(
    (invoice) => invoice.status === "overdue",
  ).length;
  const revenue = (invoicesQuery.data || [])
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const refreshInvoices = async () => {
    await queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async (values: Record<string, string>) =>
      invoicesApi.create({
        patientId: values.patientId,
        appointmentId: values.appointmentId === "none" ? null : values.appointmentId,
        invoiceNumber: values.invoiceNumber,
        insuranceDiscount: values.insuranceDiscount ? Number(values.insuranceDiscount) : null,
        dueDate: values.dueDate || null,
        items: parseInvoiceItems(values.itemsJson),
      }),
    onSuccess: async () => {
      toast.success("Đã tạo hóa đơn");
      setInvoiceFormOpen(false);
      setInvoiceFormValues(invoiceInitialValues);
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
      allowedRoles={["admin", "cashier"]}
      actions={
        can("invoices.write") ? (
          <Button
            size="sm"
            onClick={() => {
              setInvoiceFormValues(invoiceInitialValues);
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
              {invoices.map((invoice) => (
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
        </QueryState>
      </PageSection>

      {can("invoices.write") && (
        <CrudFormDialog
          open={invoiceFormOpen}
          onOpenChange={(open) => {
            setInvoiceFormOpen(open);
            if (!open) {
              setInvoiceFormValues(invoiceInitialValues);
            }
          }}
          title="Tạo hóa đơn"
          description="Khi chọn bệnh nhân, danh sách lịch hẹn chỉ hiển thị lịch của bệnh nhân đó."
          fields={buildInvoiceFields(patientsQuery.data || [], filteredAppointments)}
          initialValues={invoiceInitialValues}
          values={invoiceFormValues}
          onValuesChange={(values) => {
            const patientChanged = values.patientId !== invoiceFormValues.patientId;
            const nextValues = { ...values };

            if (patientChanged) {
              const appointmentBelongsToPatient = (appointmentsQuery.data || []).some(
                (appointment) =>
                  appointment.id === values.appointmentId &&
                  appointment.patientId === values.patientId,
              );

              if (!appointmentBelongsToPatient) {
                nextValues.appointmentId = "none";
              }
            }

            setInvoiceFormValues(nextValues);
          }}
          submitLabel="Tạo hóa đơn"
          pending={createInvoiceMutation.isPending}
          onSubmit={async (values) => createInvoiceMutation.mutateAsync(values)}
        />
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
