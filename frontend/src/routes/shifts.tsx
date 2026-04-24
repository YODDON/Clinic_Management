import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { dentistsApi, shiftsApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatDate } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type { Dentist, DentistShift, DentistShiftPayload } from "@/types/api";

export const Route = createFileRoute("/shifts")({
  component: ShiftsPage,
  head: () => ({ meta: [{ title: "Ca trực | DentalPro" }] }),
});

function buildShiftFields(dentists: Dentist[]) {
  return [
    {
      name: "dentistId",
      label: "Nha sĩ",
      type: "select" as const,
      required: true,
      options: dentists.map((dentist) => ({ label: dentist.name, value: dentist.id })),
    },
    { name: "shiftDate", label: "Ngày", type: "date" as const, required: true },
    { name: "startTime", label: "Bắt đầu", type: "time" as const, required: true },
    { name: "endTime", label: "Kết thúc", type: "time" as const, required: true },
    {
      name: "status",
      label: "Trạng thái",
      type: "select" as const,
      options: [
        { label: "Planned", value: "planned" },
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { name: "notes", label: "Ghi chú", type: "textarea" as const },
  ];
}

function toShiftValues(shift?: DentistShift) {
  return {
    dentistId: shift?.dentistId ?? "",
    shiftDate: shift?.shiftDate ? shift.shiftDate.slice(0, 10) : "",
    startTime: shift?.startTime ?? "",
    endTime: shift?.endTime ?? "",
    status: shift?.status ?? "planned",
    notes: shift?.notes ?? "",
  };
}

function toShiftPayload(values: Record<string, string>): DentistShiftPayload {
  return {
    dentistId: values.dentistId,
    shiftDate: values.shiftDate,
    startTime: values.startTime,
    endTime: values.endTime,
    status: values.status || null,
    notes: values.notes || null,
  };
}

function ShiftsPage() {
  const { can, session } = useRoleAccess();
  const [editingShift, setEditingShift] = useState<DentistShift | null>(null);
  const [detailShift, setDetailShift] = useState<DentistShift | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteShift, setDeleteShift] = useState<DentistShift | null>(null);

  const shiftsQuery = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => (await shiftsApi.list()).content,
  });
  const dentistsQuery = useQuery({
    queryKey: ["dentists", "options"],
    queryFn: async () => (await dentistsApi.list()).content,
    enabled: can("shifts.create"),
  });

  const dentistOptions =
    dentistsQuery.data ||
    (shiftsQuery.data || [])
      .map((shift) => ({ id: shift.dentistId, name: shift.dentistName } as Dentist))
      .filter(
        (dentist, index, dentists) =>
          dentists.findIndex((item) => item.id === dentist.id) === index,
      );

  const refreshShifts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toShiftPayload(values);
      return editingShift
        ? shiftsApi.update(editingShift.id, payload)
        : shiftsApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingShift ? "Đã cập nhật ca trực" : "Đã tạo ca trực");
      setFormOpen(false);
      setEditingShift(null);
      await refreshShifts();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (shiftId: string) => shiftsApi.delete(shiftId),
    onSuccess: async () => {
      toast.success("Đã xóa ca trực");
      setDeleteShift(null);
      await refreshShifts();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Ca trực"
      subtitle="Lịch làm việc nha sĩ đang được đồng bộ từ backend"
      allowedRoles={["admin", "dentist"]}
      actions={
        can("shifts.create") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingShift(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo ca trực
          </Button>
        ) : undefined
      }
    >
      <PageSection>
        <QueryState
          isLoading={shiftsQuery.isLoading}
          error={shiftsQuery.error}
          isEmpty={(shiftsQuery.data || []).length === 0}
          emptyIcon={CalendarClock}
          emptyTitle="Chưa có ca trực"
          emptyDescription="Danh sách ca trực sẽ hiển thị tại đây."
          onRetry={() => shiftsQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Nha sĩ</TableHead>
                <TableHead>Bắt đầu</TableHead>
                <TableHead>Kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(shiftsQuery.data || []).map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{formatDate(shift.shiftDate)}</TableCell>
                  <TableCell>{shift.dentistName}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell>
                    <StatusBadge value={shift.status} />
                  </TableCell>
                  <TableCell>{shift.notes || "Không có"}</TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailShift(shift)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("shifts.update") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa ca trực"
                          title="Sửa ca trực"
                          onClick={() => {
                            setEditingShift(shift);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("shifts.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa ca trực"
                          title="Xóa ca trực"
                          onClick={() => setDeleteShift(shift)}
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

      {can("shifts.update") && (
        <CrudFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingShift(null);
          }}
          title={editingShift ? "Cập nhật ca trực" : "Tạo ca trực"}
          fields={buildShiftFields(dentistOptions)}
          initialValues={{
            ...toShiftValues(editingShift || undefined),
            dentistId: editingShift?.dentistId ?? session?.user.id ?? "",
          }}
          submitLabel={editingShift ? "Lưu thay đổi" : "Tạo ca trực"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailShift)}
        onOpenChange={(open) => !open && setDetailShift(null)}
        title={detailShift?.dentistName || "Chi tiết ca trực"}
        description="Thông tin ca trực"
        items={
          detailShift
            ? [
                { label: "Nha sĩ", value: detailShift.dentistName },
                { label: "Ngày", value: formatDate(detailShift.shiftDate) },
                { label: "Bắt đầu", value: detailShift.startTime },
                { label: "Kết thúc", value: detailShift.endTime },
                { label: "Trạng thái", value: detailShift.status },
                { label: "Ghi chú", value: detailShift.notes || "Không có" },
              ]
            : []
        }
      />

      {can("shifts.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteShift)}
          onOpenChange={(open) => !open && setDeleteShift(null)}
          title="Xóa ca trực"
          description={`Bạn có chắc muốn xóa ca trực của "${deleteShift?.dentistName}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteShift) {
              await deleteMutation.mutateAsync(deleteShift.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
