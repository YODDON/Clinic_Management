import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Power, Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
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
import { dentistsApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatCurrency } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type { Dentist, DentistPayload } from "@/types/api";

export const Route = createFileRoute("/dentists")({
  component: DentistsPage,
  head: () => ({ meta: [{ title: "Nha sĩ | DentalPro" }] }),
});

function buildDentistFields(isEditing: boolean) {
  return [
    { name: "employeeCode", label: "Mã bác sĩ" },
    { name: "name", label: "Họ và tên", required: true },
    { name: "email", label: "Email", type: "email" as const, required: true },
    {
      name: "password",
      label: "Mật khẩu",
      required: !isEditing,
      description: isEditing ? "Để trống nếu không đổi mật khẩu." : "Bắt buộc khi tạo mới nha sĩ.",
    },
    { name: "phone", label: "Số điện thoại" },
    { name: "dob", label: "Ngày sinh", type: "date" as const },
    { name: "workplace", label: "Nơi công tác" },
    { name: "degree", label: "Bằng cấp / học vị" },
    { name: "specialization", label: "Chuyên môn", required: true },
    { name: "licenseNumber", label: "Số chứng chỉ", required: true },
    { name: "yearsExperience", label: "Số năm kinh nghiệm", type: "number" as const },
    { name: "consultationFee", label: "Phí tư vấn", type: "number" as const },
    { name: "bio", label: "Tiểu sử", type: "textarea" as const },
    {
      name: "available",
      label: "Sẵn sàng nhận lịch",
      type: "select" as const,
      options: [
        { label: "Có", value: "true" },
        { label: "Không", value: "false" },
      ],
    },
  ];
}

function toDentistValues(dentist?: Dentist) {
  return {
    employeeCode: dentist?.employeeCode ?? "",
    name: dentist?.name ?? "",
    email: dentist?.email ?? "",
    password: "",
    phone: dentist?.phone ?? "",
    dob: dentist?.dob ? dentist.dob.slice(0, 10) : "",
    workplace: dentist?.workplace ?? "",
    degree: dentist?.degree ?? "",
    specialization: dentist?.specialization ?? "",
    licenseNumber: dentist?.licenseNumber ?? "",
    yearsExperience: dentist?.yearsExperience?.toString() ?? "",
    consultationFee: dentist?.consultationFee?.toString() ?? "",
    bio: dentist?.bio ?? "",
    available: dentist ? String(dentist.available) : "true",
  };
}

function toDentistPayload(values: Record<string, string>, editing: boolean): DentistPayload {
  return {
    employeeCode: values.employeeCode || undefined,
    name: values.name,
    email: values.email,
    password: values.password || (editing ? undefined : ""),
    phone: values.phone || null,
    dob: values.dob || null,
    workplace: values.workplace || null,
    degree: values.degree || null,
    specialization: values.specialization,
    licenseNumber: values.licenseNumber,
    yearsExperience: values.yearsExperience ? Number(values.yearsExperience) : null,
    consultationFee: values.consultationFee ? Number(values.consultationFee) : null,
    bio: values.bio || null,
    available: values.available ? values.available === "true" : undefined,
  };
}
export function DentistsPage() {
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const { can } = useRoleAccess();
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);
  const [detailDentist, setDetailDentist] = useState<Dentist | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDentist, setDeleteDentist] = useState<Dentist | null>(null);
  const [statusDentist, setStatusDentist] = useState<Dentist | null>(null);
  const deferredSearch = useDeferredValue(search);

  const dentistsQuery = useQuery({
    queryKey: ["dentists"],
    queryFn: async () => (await dentistsApi.list()).content,
  });

  const dentists = (dentistsQuery.data || []).filter((dentist) => {
    if (!deferredSearch) return true;
    const keyword = deferredSearch.toLowerCase();
    return (
      dentist.name.toLowerCase().includes(keyword) ||
      dentist.specialization.toLowerCase().includes(keyword) ||
      dentist.licenseNumber.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.max(1, Math.ceil(dentists.length / pageSize));
  const paginatedDentists = dentists.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshDentists = async () => {
    await queryClient.invalidateQueries({ queryKey: ["dentists"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const isEditing = Boolean(editingDentist);
      const payload = toDentistPayload(values, isEditing);
      if (!isEditing && !payload.password) {
        throw new Error("Mật khẩu là bắt buộc khi tạo mới nha sĩ.");
      }
      return editingDentist
        ? dentistsApi.update(editingDentist.id, payload)
        : dentistsApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingDentist ? "Đã cập nhật nha sĩ" : "Đã tạo nha sĩ");
      setFormOpen(false);
      setEditingDentist(null);
      await refreshDentists();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (dentistId: string) => dentistsApi.delete(dentistId),
    onSuccess: async () => {
      toast.success("Đã xóa nha sĩ");
      setDeleteDentist(null);
      await refreshDentists();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (dentist: Dentist) =>
      dentist.active ? dentistsApi.deactivate(dentist.id) : dentistsApi.activate(dentist.id),
    onSuccess: async (_, dentist) => {
      toast.success(dentist.active ? "Đã ngừng hoạt động nha sĩ" : "Đã kích hoạt nha sĩ");
      setStatusDentist(null);
      await refreshDentists();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Nha sĩ"
      allowedRoles={["admin", "dentist"]}
      actions={
        can("dentists.write") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingDentist(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm nha sĩ
          </Button>
        ) : undefined
      }
    >
      <PageSection>
        <Toolbar
          placeholder="Tìm theo tên, chuyên môn..."
          value={search}
          onValueChange={setSearch}
        />
        <QueryState
          isLoading={dentistsQuery.isLoading}
          error={dentistsQuery.error}
          isEmpty={dentists.length === 0}
          emptyIcon={Stethoscope}
          emptyTitle="Chưa có nha sĩ"
          emptyDescription="Danh sách nha sĩ sẽ hiển thị tại đây."
          onRetry={() => dentistsQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nha sĩ</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Chuyên môn</TableHead>
                <TableHead>Bằng cấp</TableHead>
                <TableHead>Số chứng chỉ</TableHead>
                <TableHead>Kinh nghiệm</TableHead>
                <TableHead>Phí tư vấn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDentists.map((dentist) => (
                <TableRow key={dentist.id}>
                  <TableCell>
                    <div className="font-medium">{dentist.name}</div>
                    <div className="text-xs text-muted-foreground">{dentist.email}</div>
                  </TableCell>
                  <TableCell>{dentist.employeeCode}</TableCell>
                  <TableCell>{dentist.dob ? dentist.dob.slice(0, 10) : "Chưa cập nhật"}</TableCell>
                  <TableCell>{dentist.specialization}</TableCell>
                  <TableCell>{dentist.degree || "Chưa cập nhật"}</TableCell>
                  <TableCell>{dentist.licenseNumber}</TableCell>
                  <TableCell>{dentist.yearsExperience} năm</TableCell>
                  <TableCell>{formatCurrency(dentist.consultationFee)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      value={dentist.active && dentist.available ? "active" : "inactive"}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailDentist(dentist)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("dentists.write") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa nha sĩ"
                          title="Sửa nha sĩ"
                          onClick={() => {
                            setEditingDentist(dentist);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("dentists.status") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={dentist.active ? "Ngừng hoạt động" : "Kích hoạt"}
                          title={dentist.active ? "Ngừng hoạt động" : "Kích hoạt"}
                          onClick={() => setStatusDentist(dentist)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                      {can("dentists.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa nha sĩ"
                          title="Xóa nha sĩ"
                          onClick={() => setDeleteDentist(dentist)}
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
            totalItems={dentists.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </QueryState>
      </PageSection>

      {can("dentists.write") && (
        <CrudFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingDentist(null);
          }}
          title={editingDentist ? "Cập nhật nha sĩ" : "Thêm nha sĩ"}
          description="Nếu để trống mật khẩu khi sửa, hệ thống sẽ giữ nguyên mật khẩu cũ."
          fields={buildDentistFields(Boolean(editingDentist))}
          initialValues={toDentistValues(editingDentist || undefined)}
          submitLabel={editingDentist ? "Lưu thay đổi" : "Tạo nha sĩ"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailDentist)}
        onOpenChange={(open) => !open && setDetailDentist(null)}
        title={detailDentist?.name || "Chi tiết nha sĩ"}
        description="Thông tin nha sĩ"
        items={
          detailDentist
            ? [
                { label: "Email", value: detailDentist.email },
                { label: "Mã bác sĩ", value: detailDentist.employeeCode },
                {
                  label: "Số điện thoại",
                  value: detailDentist.phone || "Chưa cập nhật",
                },
                { label: "Ngày sinh", value: detailDentist.dob || "Chưa cập nhật" },
                { label: "Nơi công tác", value: detailDentist.workplace || "Chưa cập nhật" },
                { label: "Bằng cấp", value: detailDentist.degree || "Chưa cập nhật" },
                { label: "Chuyên môn", value: detailDentist.specialization },
                { label: "Số chứng chỉ", value: detailDentist.licenseNumber },
                { label: "Kinh nghiệm", value: `${detailDentist.yearsExperience} năm` },
                { label: "Phí tư vấn", value: formatCurrency(detailDentist.consultationFee) },
                { label: "Tiểu sử", value: detailDentist.bio || "Chưa cập nhật" },
                { label: "Nhận lịch", value: detailDentist.available ? "Có" : "Không" },
                {
                  label: "Trạng thái",
                  value: detailDentist.active ? "Đang hoạt động" : "Ngừng hoạt động",
                },
              ]
            : []
        }
      />

      {can("dentists.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteDentist)}
          onOpenChange={(open) => !open && setDeleteDentist(null)}
          title="Xóa nha sĩ"
          description={`Bạn có chắc muốn xóa "${deleteDentist?.name}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteDentist) {
              await deleteMutation.mutateAsync(deleteDentist.id);
            }
          }}
        />
      )}

      {can("dentists.status") && (
        <ConfirmActionDialog
          open={Boolean(statusDentist)}
          onOpenChange={(open) => !open && setStatusDentist(null)}
          title={statusDentist?.active ? "Ngừng hoạt động nha sĩ" : "Kích hoạt nha sĩ"}
          description={`Xác nhận thay đổi trạng thái của "${statusDentist?.name}"?`}
          pending={statusMutation.isPending}
          onConfirm={async () => {
            if (statusDentist) {
              await statusMutation.mutateAsync(statusDentist);
            }
          }}
        />
      )}
    </AppShell>
  );
}
