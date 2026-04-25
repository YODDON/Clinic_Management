import { useDeferredValue, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Filter, Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
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
import { patientsApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatDate } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type { Patient, PatientPayload } from "@/types/api";

export const Route = createFileRoute("/patients")({
  component: PatientsPage,
  head: () => ({ meta: [{ title: "Bệnh nhân | DentalPro" }] }),
});

const patientFields = [
  { name: "name", label: "Họ và tên", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true },
  { name: "phone", label: "Số điện thoại", required: true },
  { name: "dob", label: "Ngày sinh", type: "date" as const },
  {
    name: "gender",
    label: "Giới tính",
    type: "select" as const,
    options: [
      { label: "Nam", value: "male" },
      { label: "Nữ", value: "female" },
      { label: "Khác", value: "other" },
    ],
  },
  { name: "bloodType", label: "Nhóm máu" },
  { name: "idNumber", label: "Số CCCD" },
  { name: "address", label: "Địa chỉ" },
  { name: "allergyNotes", label: "Ghi chú dị ứng", type: "textarea" as const },
  { name: "dentalNotes", label: "Ghi chú nha khoa", type: "textarea" as const },
];

function toPatientValues(patient?: Patient) {
  return {
    name: patient?.name ?? "",
    email: patient?.email ?? "",
    phone: patient?.phone ?? "",
    dob: patient?.dob ? patient.dob.slice(0, 10) : "",
    gender: patient?.gender ?? "",
    bloodType: patient?.bloodType ?? "",
    idNumber: patient?.idNumber ?? "",
    address: patient?.address ?? "",
    allergyNotes: patient?.allergyNotes ?? "",
    dentalNotes: patient?.dentalNotes ?? "",
  };
}

function toPatientPayload(values: Record<string, string>): PatientPayload {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    dob: values.dob || null,
    gender: values.gender || null,
    address: values.address || null,
    idNumber: values.idNumber || null,
    bloodType: values.bloodType || null,
    allergyNotes: values.allergyNotes || null,
    dentalNotes: values.dentalNotes || null,
  };
}

export function PatientsPage() {
  const { can } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [statusPatient, setStatusPatient] = useState<Patient | null>(null);
  const deferredSearch = useDeferredValue(search);

  const patientsQuery = useQuery({
    queryKey: ["patients", deferredSearch],
    queryFn: async () => (await patientsApi.list(deferredSearch)).content,
  });

  const refreshPatients = async () => {
    await queryClient.invalidateQueries({ queryKey: ["patients"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toPatientPayload(values);
      return editingPatient
        ? patientsApi.update(editingPatient.id, payload)
        : patientsApi.create(payload);
    },
    onSuccess: async () => {
      toast.success(editingPatient ? "Đã cập nhật bệnh nhân" : "Đã tạo bệnh nhân");
      setFormOpen(false);
      setEditingPatient(null);
      await refreshPatients();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (patientId: string) => patientsApi.delete(patientId),
    onSuccess: async () => {
      toast.success("Đã xóa bệnh nhân");
      setDeletePatient(null);
      await refreshPatients();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (patient: Patient) =>
      patient.active ? patientsApi.deactivate(patient.id) : patientsApi.activate(patient.id),
    onSuccess: async (_, patient) => {
      toast.success(patient.active ? "Đã ngừng hoạt động bệnh nhân" : "Đã kích hoạt bệnh nhân");
      setStatusPatient(null);
      await refreshPatients();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const exportPatients = async () => {
    try {
      const csv = await patientsApi.exportCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "patients.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xuất danh sách");
    }
  };

  return (
    <AppShell
      title="Bệnh nhân"
      allowedRoles={["admin", "dentist", "receptionist"]}
      actions={
        <>
          {can("patients.export") && (
            <Button variant="outline" size="sm" onClick={exportPatients}>
              <Download className="mr-2 h-4 w-4" /> Xuất danh sách
            </Button>
          )}
          {can("patients.write") && (
            <Button
              size="sm"
              onClick={() => {
                setEditingPatient(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm bệnh nhân
            </Button>
          )}
        </>
      }
    >
      <PageSection>
        <Toolbar
          placeholder="Tìm theo tên, số điện thoại..."
          value={search}
          onValueChange={setSearch}
        >
          <Button variant="outline" size="sm" className="h-10" disabled>
            <Filter className="mr-2 h-4 w-4" /> Bộ lọc
          </Button>
        </Toolbar>
        <QueryState
          isLoading={patientsQuery.isLoading}
          error={patientsQuery.error}
          isEmpty={(patientsQuery.data || []).length === 0}
          emptyIcon={Users}
          emptyTitle="Chưa có bệnh nhân"
          emptyDescription="Khi backend có dữ liệu, bảng này sẽ hiển thị."
          onRetry={() => patientsQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Nhóm máu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(patientsQuery.data || []).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.email}</div>
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{formatDate(patient.dob)}</TableCell>
                  <TableCell>{patient.gender || "Chưa cập nhật"}</TableCell>
                  <TableCell>{patient.bloodType || "Chưa cập nhật"}</TableCell>
                  <TableCell>
                    <StatusBadge value={patient.active} />
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailPatient(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("patients.write") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa bệnh nhân"
                          title="Sửa bệnh nhân"
                          onClick={() => {
                            setEditingPatient(patient);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("patients.status") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={patient.active ? "Ngừng hoạt động" : "Kích hoạt"}
                          title={patient.active ? "Ngừng hoạt động" : "Kích hoạt"}
                          onClick={() => setStatusPatient(patient)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                      {can("patients.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa bệnh nhân"
                          title="Xóa bệnh nhân"
                          onClick={() => setDeletePatient(patient)}
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

      {can("patients.write") && (
        <CrudFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingPatient(null);
          }}
          title={editingPatient ? "Cập nhật bệnh nhân" : "Thêm bệnh nhân"}
          description="Các trường có thể để trống nếu backend cho phép."
          fields={patientFields}
          initialValues={toPatientValues(editingPatient || undefined)}
          submitLabel={editingPatient ? "Lưu thay đổi" : "Tạo bệnh nhân"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailPatient)}
        onOpenChange={(open) => !open && setDetailPatient(null)}
        title={detailPatient?.name || "Chi tiết bệnh nhân"}
        description="Thông tin bệnh nhân"
        items={
          detailPatient
            ? [
                { label: "Email", value: detailPatient.email },
                { label: "Số điện thoại", value: detailPatient.phone },
                { label: "Ngày sinh", value: formatDate(detailPatient.dob) },
                { label: "Giới tính", value: detailPatient.gender || "Chưa cập nhật" },
                { label: "Nhóm máu", value: detailPatient.bloodType || "Chưa cập nhật" },
                { label: "CCCD", value: detailPatient.idNumber || "Chưa cập nhật" },
                { label: "Địa chỉ", value: detailPatient.address || "Chưa cập nhật" },
                { label: "Dị ứng", value: detailPatient.allergyNotes || "Chưa cập nhật" },
                {
                  label: "Ghi chú nha khoa",
                  value: detailPatient.dentalNotes || "Chưa cập nhật",
                },
                {
                  label: "Trạng thái",
                  value: detailPatient.active ? "Đang hoạt động" : "Ngừng hoạt động",
                },
              ]
            : []
        }
      />

      {can("patients.delete") && (
        <ConfirmActionDialog
          open={Boolean(deletePatient)}
          onOpenChange={(open) => !open && setDeletePatient(null)}
          title="Xóa bệnh nhân"
          description={`Bạn có chắc muốn xóa "${deletePatient?.name}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deletePatient) {
              await deleteMutation.mutateAsync(deletePatient.id);
            }
          }}
        />
      )}

      {can("patients.status") && (
        <ConfirmActionDialog
          open={Boolean(statusPatient)}
          onOpenChange={(open) => !open && setStatusPatient(null)}
          title={statusPatient?.active ? "Ngừng hoạt động bệnh nhân" : "Kích hoạt bệnh nhân"}
          description={`Xác nhận thay đổi trạng thái của "${statusPatient?.name}"?`}
          actionLabel="Xác nhận"
          pending={statusMutation.isPending}
          onConfirm={async () => {
            if (statusPatient) {
              await statusMutation.mutateAsync(statusPatient);
            }
          }}
        />
      )}
    </AppShell>
  );
}
