import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ClipboardCheck, Eye, Filter, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Toolbar } from "@/components/common/Toolbar";
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
import { appointmentsApi, dentistsApi, patientsApi, servicesApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatDateTime } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  Appointment,
  AppointmentPayload,
  DentalChair,
  DentalService,
  Dentist,
  Patient,
} from "@/types/api";

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPage,
  head: () => ({ meta: [{ title: "Lịch hẹn | DentalPro" }] }),
});

function toAppointmentValues(appointment?: Appointment) {
  return {
    patientId: appointment?.patientId ?? "",
    dentistId: appointment?.dentistId ?? "none",
    serviceId: appointment?.serviceId ?? "none",
    chairId: appointment?.chairId ?? "none",
    appointmentDate: appointment?.appointmentDate ? appointment.appointmentDate.slice(0, 16) : "",
    appointmentType: appointment?.appointmentType ?? "",
    status: appointment?.status ?? "pending",
    notes: appointment?.notes ?? "",
  };
}

function buildAppointmentFields(
  patients: Patient[],
  dentists: Dentist[],
  services: DentalService[],
  chairs: DentalChair[],
) {
  return [
    {
      name: "patientId",
      label: "Bệnh nhân",
      type: "select" as const,
      required: true,
      options: patients.map((patient) => ({ label: patient.name, value: patient.id })),
    },
    {
      name: "dentistId",
      label: "Nha sĩ",
      type: "select" as const,
      required: true,
      validate: (value) => (value === "none" ? "Nha sĩ không được để trống." : undefined),
      options: [{ label: "Chưa phân công", value: "none" }].concat(
        dentists.map((dentist) => ({ label: dentist.name, value: dentist.id })),
      ),
    },
    {
      name: "serviceId",
      label: "Dịch vụ",
      type: "select" as const,
      required: true,
      validate: (value) => (value === "none" ? "Dịch vụ không được để trống." : undefined),
      options: [{ label: "Chưa chọn", value: "none" }].concat(
        services.map((service) => ({ label: service.name, value: service.id })),
      ),
    },
    {
      name: "chairId",
      label: "Ghế nha",
      type: "select" as const,
      required: true,
      validate: (value) => (value === "none" ? "Ghế nha không được để trống." : undefined),
      options: [{ label: "Chưa chọn", value: "none" }].concat(
        chairs.map((chair) => ({ label: chair.chairName || chair.chairNumber, value: chair.id })),
      ),
    },
    {
      name: "appointmentDate",
      label: "Thời gian hẹn",
      type: "datetime-local" as const,
      required: true,
    },
    {
      name: "appointmentType",
      label: "Loại lịch hẹn",
      required: true,
      placeholder: "Khám tổng quát, tái khám...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select" as const,
      options: [
        { label: "Chờ xác nhận", value: "pending" },
        { label: "Đã xác nhận", value: "confirmed" },
        { label: "Hoàn thành", value: "completed" },
        { label: "Đã hủy", value: "cancelled" },
        { label: "Khẩn cấp", value: "urgent" },
      ],
    },
    { name: "notes", label: "Ghi chú", type: "textarea" as const },
  ];
}

function toAppointmentPayload(values: Record<string, string>): AppointmentPayload {
  return {
    patientId: values.patientId,
    dentistId: values.dentistId === "none" ? null : values.dentistId,
    serviceId: values.serviceId === "none" ? null : values.serviceId,
    chairId: values.chairId === "none" ? null : values.chairId,
    appointmentDate: values.appointmentDate,
    appointmentType: values.appointmentType,
    status: values.status || null,
    notes: values.notes || null,
  };
}
export function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const { can, role } = useRoleAccess();
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);
  const deferredSearch = useDeferredValue(search);

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await appointmentsApi.list()).content,
  });
  const patientsQuery = useQuery({
    queryKey: ["patients", "options"],
    queryFn: async () => (await patientsApi.list()).content,
  });
  const dentistsQuery = useQuery({
    queryKey: ["dentists", "options"],
    queryFn: async () => (await dentistsApi.list()).content,
  });
  const servicesQuery = useQuery({
    queryKey: ["services", "options"],
    queryFn: async () => (await servicesApi.list()).content,
  });
  const chairsQuery = useQuery({
    queryKey: ["chairs", "options"],
    queryFn: servicesApi.chairs,
  });

  const appointmentFields = buildAppointmentFields(
    patientsQuery.data || [],
    dentistsQuery.data || [],
    servicesQuery.data || [],
    chairsQuery.data || [],
  );

  const appointments = (appointmentsQuery.data || []).filter((item) => {
    const keyword = deferredSearch.toLowerCase();
    const matchesSearch =
      !deferredSearch ||
      item.patientName.toLowerCase().includes(keyword) ||
      (item.dentistName || "").toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = (appointmentsQuery.data || []).filter((item) =>
    item.appointmentDate.startsWith(today),
  ).length;
  const confirmedCount = (appointmentsQuery.data || []).filter(
    (item) => item.status === "confirmed",
  ).length;
  const pendingCount = (appointmentsQuery.data || []).filter(
    (item) => item.status === "pending",
  ).length;
  const urgentCount = (appointmentsQuery.data || []).filter(
    (item) => item.status === "urgent",
  ).length;
  const totalPages = Math.max(1, Math.ceil(appointments.length / pageSize));
  const paginatedAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshAppointments = async () => {
    await queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toAppointmentPayload(values);
      return editingAppointment
        ? appointmentsApi.update(editingAppointment.id, payload)
        : appointmentsApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingAppointment ? "Đã cập nhật lịch hẹn" : "Đã tạo lịch hẹn");
      setFormOpen(false);
      setEditingAppointment(null);
      await refreshAppointments();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái lịch hẹn");
      await refreshAppointments();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (appointmentId: string) => appointmentsApi.delete(appointmentId),
    onSuccess: async () => {
      toast.success("Đã xóa lịch hẹn");
      setDeleteAppointment(null);
      await refreshAppointments();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Lịch hẹn"
      allowedRoles={["admin", "dentist"]}
      actions={
        can("appointments.create") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingAppointment(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Đặt lịch hẹn
          </Button>
        ) : undefined
      }
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hôm nay"
          value={String(todayCount)}
          hint="Tổng lịch hẹn"
          icon={CalendarDays}
        />
        <StatCard
          label="Đã xác nhận"
          value={String(confirmedCount)}
          icon={CalendarDays}
          tone="success"
        />
        <StatCard
          label="Chờ xác nhận"
          value={String(pendingCount)}
          icon={CalendarDays}
          tone="warning"
        />
        <StatCard
          label="Khẩn cấp"
          value={String(urgentCount)}
          icon={CalendarDays}
          tone="destructive"
        />
      </div>

      <PageSection>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
              <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
              <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
              <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Toolbar
          placeholder="Tìm theo bệnh nhân, nha sĩ..."
          value={search}
          onValueChange={setSearch}
        >
          <Button variant="outline" size="sm" className="h-10" disabled>
            <Filter className="mr-2 h-4 w-4" /> Lọc theo ngày
          </Button>
        </Toolbar>
        <QueryState
          isLoading={appointmentsQuery.isLoading}
          error={appointmentsQuery.error}
          isEmpty={appointments.length === 0}
          emptyIcon={CalendarDays}
          emptyTitle="Chưa có lịch hẹn"
          emptyDescription="Khi backend có dữ liệu, bảng này sẽ hiển thị."
          onRetry={() => appointmentsQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Nha sĩ</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Ghế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                  <TableCell>{appointment.serviceName || "Chưa chọn"}</TableCell>
                  <TableCell>{appointment.chairName || "Chưa chọn"}</TableCell>
                  <TableCell>
                    <StatusBadge value={appointment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailAppointment(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("appointments.update") && appointment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Xác nhận lịch hẹn"
                          title="Xác nhận lịch hẹn"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: appointment.id, status: "confirmed" })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {can("appointments.update") && appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Ghi nhận đã khám"
                          title="Ghi nhận đã khám"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: appointment.id, status: "completed" })
                          }
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {can("appointments.update") && role !== "dentist" && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa lịch hẹn"
                          title="Sửa lịch hẹn"
                          onClick={() => {
                            setEditingAppointment(appointment);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("appointments.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa lịch hẹn"
                          title="Xóa lịch hẹn"
                          onClick={() => setDeleteAppointment(appointment)}
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
            totalItems={appointments.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </QueryState>
      </PageSection>

      {can("appointments.update") && (
        <CrudFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingAppointment(null);
          }}
          title={editingAppointment ? "Cập nhật lịch hẹn" : "Đặt lịch hẹn"}
          description="Các danh mục lựa chọn được lấy trực tiếp từ dữ liệu hiện có."
          fields={appointmentFields}
          initialValues={toAppointmentValues(editingAppointment || undefined)}
          submitLabel={editingAppointment ? "Lưu thay đổi" : "Tạo lịch hẹn"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailAppointment)}
        onOpenChange={(open) => !open && setDetailAppointment(null)}
        title={detailAppointment?.patientName || "Chi tiết lịch hẹn"}
        description="Thông tin lịch hẹn"
        items={
          detailAppointment
            ? [
                { label: "Bệnh nhân", value: detailAppointment.patientName },
                { label: "Nha sĩ", value: detailAppointment.dentistName || "Chưa phân công" },
                { label: "Dịch vụ", value: detailAppointment.serviceName || "Chưa chọn" },
                { label: "Ghế", value: detailAppointment.chairName || "Chưa chọn" },
                { label: "Thời gian", value: formatDateTime(detailAppointment.appointmentDate) },
                { label: "Loại lịch", value: detailAppointment.appointmentType },
                { label: "Trạng thái", value: detailAppointment.status },
                { label: "Ghi chú", value: detailAppointment.notes || "Không có" },
              ]
            : []
        }
      />

      {can("appointments.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteAppointment)}
          onOpenChange={(open) => !open && setDeleteAppointment(null)}
          title="Xóa lịch hẹn"
          description={`Bạn có chắc muốn xóa lịch hẹn của "${deleteAppointment?.patientName}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteAppointment) {
              await deleteMutation.mutateAsync(deleteAppointment.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
