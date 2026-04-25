import { useDeferredValue, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
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
import { appointmentsApi, dentistsApi, patientsApi, treatmentRecordsApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatDateTime } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  Appointment,
  Dentist,
  Patient,
  TreatmentRecord,
  TreatmentRecordPayload,
} from "@/types/api";

export const Route = createFileRoute("/treatment-records")({
  component: TreatmentRecordsPage,
  head: () => ({ meta: [{ title: "Hồ sơ điều trị | DentalPro" }] }),
});

function buildRecordFields(patients: Patient[], dentists: Dentist[], appointments: Appointment[]) {
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
          label: `${appointment.patientName} - ${appointment.appointmentDate.slice(0, 16)}`,
          value: appointment.id,
        })),
      ),
    },
    {
      name: "dentistId",
      label: "Nha sĩ",
      type: "select" as const,
      required: true,
      options: dentists.map((dentist) => ({ label: dentist.name, value: dentist.id })),
    },
    { name: "visitDate", label: "Ngày khám", type: "datetime-local" as const },
    { name: "chiefComplaint", label: "Lý do đến khám", type: "textarea" as const },
    { name: "diagnosis", label: "Chẩn đoán", type: "textarea" as const },
    { name: "treatmentPlan", label: "Kế hoạch điều trị", type: "textarea" as const },
    { name: "treatmentDone", label: "Điều trị đã thực hiện", type: "textarea" as const },
    {
      name: "toothChart",
      label: "Sơ đồ răng",
      type: "textarea" as const,
      placeholder: "Ví dụ:\n11: gingivitis\n26: caries",
      description: "Mỗi dòng theo định dạng: số răng: ghi chú.",
      validate: (value) => validateToothChartInput(value),
    },
    { name: "nextVisitNote", label: "Ghi chú tái khám", type: "textarea" as const },
    { name: "notes", label: "Ghi chú thêm", type: "textarea" as const },
  ];
}

function toRecordValues(record?: TreatmentRecord) {
  return {
    patientId: record?.patientId ?? "",
    appointmentId: record?.appointmentId ?? "none",
    dentistId: record?.dentistId ?? "",
    visitDate: record?.visitDate ? record.visitDate.slice(0, 16) : "",
    chiefComplaint: record?.chiefComplaint ?? "",
    diagnosis: record?.diagnosis ?? "",
    treatmentPlan: record?.treatmentPlan ?? "",
    treatmentDone: record?.treatmentDone ?? "",
    toothChart: formatToothChartForForm(record?.toothChart),
    nextVisitNote: record?.nextVisitNote ?? "",
    notes: record?.notes ?? "",
  };
}

function toRecordPayload(values: Record<string, string>): TreatmentRecordPayload {
  return {
    patientId: values.patientId,
    appointmentId: values.appointmentId === "none" ? null : values.appointmentId,
    dentistId: values.dentistId,
    visitDate: values.visitDate || null,
    chiefComplaint: values.chiefComplaint || null,
    diagnosis: values.diagnosis || null,
    treatmentPlan: values.treatmentPlan || null,
    treatmentDone: values.treatmentDone || null,
    toothChart: parseToothChartForPayload(values.toothChart),
    nextVisitNote: values.nextVisitNote || null,
    notes: values.notes || null,
  };
}

function formatToothChartForForm(value?: string | null) {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([tooth, note]) => `${tooth}: ${String(note)}`)
        .join("\n");
    }
  } catch {
    // Keep legacy/plain-text values editable.
  }

  return value;
}

function parseToothChartForPayload(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return null;

  if (normalized.startsWith("{")) {
    const parsed = JSON.parse(normalized) as Record<string, unknown>;
    return JSON.stringify(parsed);
  }

  const entries = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex <= 0 || separatorIndex === line.length - 1) {
        throw new Error("Sơ đồ răng phải theo định dạng 'số răng: ghi chú'.");
      }

      const tooth = line.slice(0, separatorIndex).trim();
      const note = line.slice(separatorIndex + 1).trim();

      if (!tooth || !note) {
        throw new Error("Sơ đồ răng phải theo định dạng 'số răng: ghi chú'.");
      }

      return [tooth, note] as const;
    });

  return JSON.stringify(Object.fromEntries(entries));
}

function validateToothChartInput(value?: string) {
  const normalized = value?.trim();
  if (!normalized) return undefined;

  try {
    parseToothChartForPayload(normalized);
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : "Sơ đồ răng không hợp lệ.";
  }
}

export function TreatmentRecordsPage() {
  const { can } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<TreatmentRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<TreatmentRecord | null>(null);
  const deferredSearch = useDeferredValue(search);

  const recordsQuery = useQuery({
    queryKey: ["treatment-records"],
    queryFn: async () => (await treatmentRecordsApi.list()).content,
  });
  const patientsQuery = useQuery({
    queryKey: ["patients", "options"],
    queryFn: async () => (await patientsApi.list()).content,
  });
  const dentistsQuery = useQuery({
    queryKey: ["dentists", "options"],
    queryFn: async () => (await dentistsApi.list()).content,
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "options"],
    queryFn: async () => (await appointmentsApi.list()).content,
  });

  const records = (recordsQuery.data || []).filter((record) => {
    if (!deferredSearch) return true;
    const keyword = deferredSearch.toLowerCase();
    return (
      record.patientName.toLowerCase().includes(keyword) ||
      (record.diagnosis || "").toLowerCase().includes(keyword)
    );
  });

  const refreshRecords = async () => {
    await queryClient.invalidateQueries({ queryKey: ["treatment-records"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toRecordPayload(values);
      return editingRecord
        ? treatmentRecordsApi.update(editingRecord.id, payload)
        : treatmentRecordsApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingRecord ? "Đã cập nhật hồ sơ điều trị" : "Đã tạo hồ sơ điều trị");
      setFormOpen(false);
      setEditingRecord(null);
      await refreshRecords();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => treatmentRecordsApi.delete(recordId),
    onSuccess: async () => {
      toast.success("Đã xóa hồ sơ điều trị");
      setDeleteRecord(null);
      await refreshRecords();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Hồ sơ điều trị"
      allowedRoles={["admin", "dentist"]}
      actions={
        can("treatmentRecords.write") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo hồ sơ
          </Button>
        ) : undefined
      }
    >
      <PageSection>
        <Toolbar
          placeholder="Tìm theo bệnh nhân, chẩn đoán..."
          value={search}
          onValueChange={setSearch}
        />
        <QueryState
          isLoading={recordsQuery.isLoading}
          error={recordsQuery.error}
          isEmpty={records.length === 0}
          emptyIcon={ClipboardList}
          emptyTitle="Chưa có hồ sơ điều trị"
          emptyDescription="Khi backend có dữ liệu, bảng này sẽ hiển thị."
          onRetry={() => recordsQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày khám</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Nha sĩ</TableHead>
                <TableHead>Chẩn đoán</TableHead>
                <TableHead>Điều trị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDateTime(record.visitDate)}</TableCell>
                  <TableCell>{record.patientName}</TableCell>
                  <TableCell>{record.dentistName}</TableCell>
                  <TableCell>{record.diagnosis || "Chưa cập nhật"}</TableCell>
                  <TableCell>{record.treatmentDone || "Chưa cập nhật"}</TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailRecord(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("treatmentRecords.write") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa hồ sơ điều trị"
                          title="Sửa hồ sơ điều trị"
                          onClick={() => {
                            setEditingRecord(record);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("treatmentRecords.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa hồ sơ điều trị"
                          title="Xóa hồ sơ điều trị"
                          onClick={() => setDeleteRecord(record)}
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

      {can("treatmentRecords.write") && (
        <CrudFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingRecord(null);
          }}
          title={editingRecord ? "Cập nhật hồ sơ điều trị" : "Tạo hồ sơ điều trị"}
          fields={buildRecordFields(
            patientsQuery.data || [],
            dentistsQuery.data || [],
            appointmentsQuery.data || [],
          )}
          initialValues={toRecordValues(editingRecord || undefined)}
          submitLabel={editingRecord ? "Lưu thay đổi" : "Tạo hồ sơ"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailRecord)}
        onOpenChange={(open) => !open && setDetailRecord(null)}
        title={detailRecord?.patientName || "Chi tiết hồ sơ điều trị"}
        description="Thông tin hồ sơ điều trị"
        items={
          detailRecord
            ? [
                { label: "Bệnh nhân", value: detailRecord.patientName },
                { label: "Nha sĩ", value: detailRecord.dentistName },
                { label: "Ngày khám", value: formatDateTime(detailRecord.visitDate) },
                {
                  label: "Lý do khám",
                  value: detailRecord.chiefComplaint || "Chưa cập nhật",
                },
                { label: "Chẩn đoán", value: detailRecord.diagnosis || "Chưa cập nhật" },
                { label: "Điều trị", value: detailRecord.treatmentDone || "Chưa cập nhật" },
                {
                  label: "Kế hoạch",
                  value: detailRecord.treatmentPlan || "Chưa cập nhật",
                },
                {
                  label: "Sơ đồ răng",
                  value: formatToothChartForForm(detailRecord.toothChart) || "Chưa cập nhật",
                },
                { label: "Ghi chú", value: detailRecord.notes || "Không có" },
              ]
            : []
        }
      />

      {can("treatmentRecords.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteRecord)}
          onOpenChange={(open) => !open && setDeleteRecord(null)}
          title="Xóa hồ sơ điều trị"
          description={`Bạn có chắc muốn xóa hồ sơ của "${deleteRecord?.patientName}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteRecord) {
              await deleteMutation.mutateAsync(deleteRecord.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
