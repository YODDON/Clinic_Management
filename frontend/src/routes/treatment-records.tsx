import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Eye, Package, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { Toolbar } from "@/components/common/Toolbar";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  appointmentsApi,
  dentistsApi,
  inventoryApi,
  invoicesApi,
  patientsApi,
  treatmentRecordsApi,
} from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatDateTime } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  Appointment,
  Dentist,
  InventoryItem,
  Invoice,
  Patient,
  TreatmentMaterial,
  TreatmentMaterialPayload,
  TreatmentRecord,
  TreatmentRecordPayload,
} from "@/types/api";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/treatment-records")({
  component: TreatmentRecordsPage,
  head: () => ({ meta: [{ title: "Hồ sơ điều trị | DentalPro" }] }),
});

function buildRecordFields(
  patients: Patient[],
  dentists: Dentist[],
  appointments: Appointment[],
  includeDentistField: boolean,
) {
  const fields = [
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
      required: true,
      options: appointments.map((appointment) => ({
        label: `${appointment.patientName} - ${appointment.appointmentDate.slice(0, 16)}`,
        value: appointment.id,
      })),
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

  if (includeDentistField) {
    fields.splice(2, 0, {
      name: "dentistId",
      label: "Nha sĩ",
      type: "select" as const,
      required: true,
      options: dentists.map((dentist) => ({ label: dentist.name, value: dentist.id })),
    });
  }

  return fields;
}

function buildMaterialFields(items: InventoryItem[]) {
  return [
    {
      name: "inventoryId",
      label: "Vật tư",
      type: "select" as const,
      required: true,
      options: items.map((item) => ({
        label: `${item.name} · tồn ${item.stock} ${item.unit}`,
        value: item.id,
      })),
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number" as const,
      required: true,
      validate: (value) => {
        const quantity = Number(value);
        return Number.isFinite(quantity) && quantity > 0 ? undefined : "Số lượng phải lớn hơn 0.";
      },
    },
    { name: "usageNote", label: "Ghi chú sử dụng", type: "textarea" as const },
  ];
}

function toRecordValues(record?: TreatmentRecord, fallbackDentistId = "") {
  return {
    patientId: record?.patientId ?? "",
    appointmentId: record?.appointmentId ?? "",
    dentistId: record?.dentistId ?? fallbackDentistId,
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
    appointmentId: values.appointmentId,
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
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const { can, role, session } = useRoleAccess();
  const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<TreatmentRecord | null>(null);
  const [materialRecord, setMaterialRecord] = useState<TreatmentRecord | null>(null);
  const [materialsRecord, setMaterialsRecord] = useState<TreatmentRecord | null>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<{
    record: TreatmentRecord;
    material: TreatmentMaterial;
  } | null>(null);
  const [invoiceRecord, setInvoiceRecord] = useState<TreatmentRecord | null>(null);
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
  const inventoryQuery = useQuery({
    queryKey: ["inventory", "options"],
    queryFn: async () => (await inventoryApi.list()).content,
  });
  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await invoicesApi.list()).content,
  });
  const materialsQuery = useQuery({
    queryKey: ["treatment-record-materials", materialsRecord?.id],
    queryFn: async () => treatmentRecordsApi.materials(materialsRecord?.id || ""),
    enabled: Boolean(materialsRecord),
  });

  const invoiceByRecordId = new Map<string, Invoice>();
  for (const invoice of invoicesQuery.data || []) {
    if (invoice.treatmentRecordId) {
      invoiceByRecordId.set(invoice.treatmentRecordId, invoice);
    }
  }

  const records = (recordsQuery.data || []).filter((record) => {
    if (!deferredSearch) return true;
    const keyword = deferredSearch.toLowerCase();
    return (
      record.patientName.toLowerCase().includes(keyword) ||
      (record.diagnosis || "").toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const paginatedRecords = records.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
      await Promise.all([
        refreshRecords(),
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["appointments", "options"] }),
      ]);
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

  const addMaterialMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!materialRecord) throw new Error("Chưa chọn hồ sơ điều trị.");
      const payload: TreatmentMaterialPayload = {
        inventoryId: values.inventoryId,
        quantity: Number(values.quantity),
        usageNote: values.usageNote || null,
      };
      return treatmentRecordsApi.addMaterial(materialRecord.id, payload);
    },
    onSuccess: async () => {
      toast.success("Đã thêm vật tư điều trị");
      setMaterialRecord(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["treatment-record-materials"] }),
        queryClient.invalidateQueries({ queryKey: ["treatment-records"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async ({
      record,
      material,
    }: {
      record: TreatmentRecord;
      material: TreatmentMaterial;
    }) => treatmentRecordsApi.deleteMaterial(record.id, material.id),
    onSuccess: async () => {
      toast.success("Đã xóa vật tư khỏi hồ sơ và hoàn lại tồn kho");
      setDeleteMaterial(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["treatment-record-materials"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (recordId: string) => invoicesApi.createFromTreatmentRecord(recordId),
    onSuccess: async () => {
      toast.success("Đã tạo hóa đơn từ hồ sơ điều trị");
      setInvoiceRecord(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["treatment-records"] }),
      ]);
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
                <TableHead>Hóa đơn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record) => {
                const invoice = invoiceByRecordId.get(record.id);

                return (
                  <TableRow key={record.id}>
                    <TableCell>{formatDateTime(record.visitDate)}</TableCell>
                    <TableCell>{record.patientName}</TableCell>
                    <TableCell>{record.dentistName}</TableCell>
                    <TableCell>{record.diagnosis || "Chưa cập nhật"}</TableCell>
                    <TableCell>{record.treatmentDone || "Chưa cập nhật"}</TableCell>
                    <TableCell>
                      {invoice ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">{invoice.invoiceNumber}</div>
                          <StatusBadge value={invoice.status} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Chưa tạo</span>
                      )}
                    </TableCell>
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
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Xem vật tư"
                          title="Xem vật tư đã dùng"
                          onClick={() => setMaterialsRecord(record)}
                        >
                          <Package className="h-4 w-4" />
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
                        {can("treatmentRecords.write") && !invoice && (
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Thêm vật tư"
                            title="Thêm vật tư"
                            onClick={() => setMaterialRecord(record)}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                        {can("invoices.fromTreatment") && !invoice && (
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Tạo hóa đơn"
                            title="Tạo hóa đơn từ hồ sơ điều trị"
                            onClick={() => setInvoiceRecord(record)}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                        {can("invoices.fromTreatment") && invoice && (
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Hồ sơ đã có hóa đơn"
                            title={`Đã có hóa đơn ${invoice.invoiceNumber}`}
                            disabled
                          >
                            <Receipt className="h-4 w-4" />
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
                );
              })}
            </TableBody>
          </Table>
          <ClientPagination
            page={page}
            totalItems={records.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
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
            role === "admin",
          )}
          initialValues={toRecordValues(editingRecord || undefined, session?.user.id ?? "")}
          submitLabel={editingRecord ? "Lưu thay đổi" : "Tạo hồ sơ"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <Dialog
        open={Boolean(materialsRecord)}
        onOpenChange={(open) => {
          if (!open) setMaterialsRecord(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {materialsRecord
                ? `Vật tư điều trị · ${materialsRecord.patientName}`
                : "Vật tư điều trị"}
            </DialogTitle>
            <DialogDescription>
              {materialsRecord && invoiceByRecordId.has(materialsRecord.id)
                ? "Hồ sơ đã có hóa đơn nên vật tư được khóa để tránh lệch chi phí."
                : "Danh sách vật tư đã dùng cho hồ sơ này."}
            </DialogDescription>
          </DialogHeader>
          <QueryState
            isLoading={materialsQuery.isLoading}
            error={materialsQuery.error}
            isEmpty={(materialsQuery.data || []).length === 0}
            emptyIcon={Package}
            emptyTitle="Chưa có vật tư"
            emptyDescription="Bấm nút thêm vật tư ở bảng hồ sơ để ghi nhận vật tư đã dùng."
            onRetry={() => materialsQuery.refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(materialsQuery.data || []).map((material) => {
                  const locked = materialsRecord ? invoiceByRecordId.has(materialsRecord.id) : true;

                  return (
                    <TableRow key={material.id}>
                      <TableCell>{material.inventoryName}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>{material.usageNote || "Không có"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {can("treatmentRecords.write") && (
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Xóa vật tư"
                              title={
                                locked
                                  ? "Hồ sơ đã có hóa đơn nên không thể xóa vật tư"
                                  : "Xóa vật tư"
                              }
                              disabled={locked}
                              onClick={() => {
                                if (materialsRecord) {
                                  setDeleteMaterial({ record: materialsRecord, material });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </QueryState>
        </DialogContent>
      </Dialog>

      {can("treatmentRecords.write") && (
        <CrudFormDialog
          open={Boolean(materialRecord)}
          onOpenChange={(open) => !open && setMaterialRecord(null)}
          title={materialRecord ? `Thêm vật tư · ${materialRecord.patientName}` : "Thêm vật tư"}
          description="Vật tư được trừ kho ngay và sẽ được dùng khi tạo hóa đơn từ hồ sơ điều trị."
          fields={buildMaterialFields(inventoryQuery.data || [])}
          initialValues={{ inventoryId: "", quantity: "1", usageNote: "" }}
          submitLabel="Thêm vật tư"
          pending={addMaterialMutation.isPending}
          onSubmit={async (values) => addMaterialMutation.mutateAsync(values)}
        />
      )}

      {can("treatmentRecords.write") && (
        <ConfirmActionDialog
          open={Boolean(deleteMaterial)}
          onOpenChange={(open) => !open && setDeleteMaterial(null)}
          title="Xóa vật tư khỏi hồ sơ"
          description={`Bạn có chắc muốn xóa "${deleteMaterial?.material.inventoryName}" khỏi hồ sơ này không? Tồn kho sẽ được hoàn lại.`}
          actionLabel="Xóa vật tư"
          variant="destructive"
          pending={deleteMaterialMutation.isPending}
          onConfirm={async () => {
            if (deleteMaterial) {
              await deleteMaterialMutation.mutateAsync(deleteMaterial);
            }
          }}
        />
      )}

      {can("invoices.fromTreatment") && (
        <ConfirmActionDialog
          open={Boolean(invoiceRecord)}
          onOpenChange={(open) => !open && setInvoiceRecord(null)}
          title="Tạo hóa đơn từ hồ sơ điều trị"
          description={`Hệ thống sẽ lấy dịch vụ của lịch hẹn, điều trị đã thực hiện và vật tư đã dùng để tạo hóa đơn cho "${invoiceRecord?.patientName}".`}
          actionLabel="Tạo hóa đơn"
          pending={createInvoiceMutation.isPending}
          onConfirm={async () => {
            if (invoiceRecord) {
              await createInvoiceMutation.mutateAsync(invoiceRecord.id);
            }
          }}
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
