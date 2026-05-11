import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  Briefcase,
  Clock3,
  Eye,
  Pencil,
  Plus,
  Power,
  ShieldUser,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dentistsApi, servicesApi, usersApi } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, titleCase } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  DentalService,
  DentalServicePayload,
  Dentist,
  DentistPayload,
  ServicePriceHistory,
  SystemUser,
  SystemUserPayload,
} from "@/types/api";

type SystemSection = "users" | "dentists" | "services" | "pricing";

const sections: Array<{
  id: SystemSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "users", label: "Người dùng", icon: ShieldUser },
  { id: "dentists", label: "Bác sĩ", icon: Stethoscope },
  { id: "services", label: "Danh mục dịch vụ", icon: Briefcase },
  { id: "pricing", label: "Bảng giá", icon: BadgeDollarSign },
];

const userFields = (isEditing: boolean) => [
  { name: "name", label: "Họ và tên", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true },
  {
    name: "password",
    label: "Mật khẩu",
    required: !isEditing,
    description: isEditing ? "Để trống nếu không đổi mật khẩu." : "Bắt buộc khi tạo người dùng mới.",
  },
  { name: "phone", label: "Số điện thoại" },
  {
    name: "role",
    label: "Vai trò",
    required: true,
    type: "select" as const,
    options: [
      { label: "Admin", value: "admin" },
    ],
  },
  {
    name: "active",
    label: "Trạng thái",
    type: "select" as const,
    options: [
      { label: "Đang hoạt động", value: "true" },
      { label: "Ngừng hoạt động", value: "false" },
    ],
  },
];

const dentistFields = (isEditing: boolean) => [
  { name: "employeeCode", label: "Mã bác sĩ" },
  { name: "name", label: "Họ và tên", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true },
  {
    name: "password",
    label: "Mật khẩu",
    required: !isEditing,
    description: isEditing ? "Để trống nếu không đổi mật khẩu." : "Bắt buộc khi tạo bác sĩ mới.",
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
  {
    name: "active",
    label: "Trạng thái tài khoản",
    type: "select" as const,
    options: [
      { label: "Đang hoạt động", value: "true" },
      { label: "Ngừng hoạt động", value: "false" },
    ],
  },
];

const serviceFields = [
  { name: "code", label: "Mã dịch vụ", required: true },
  { name: "name", label: "Tên dịch vụ", required: true },
  { name: "category", label: "Danh mục" },
  { name: "durationMinutes", label: "Thời lượng (phút)", type: "number" as const },
  { name: "price", label: "Giá hiện tại", type: "number" as const },
  { name: "description", label: "Mô tả", type: "textarea" as const },
];

const priceFields = [
  { name: "price", label: "Giá mới", required: true, type: "number" as const },
  { name: "changeNote", label: "Ghi chú thay đổi", type: "textarea" as const },
];

function toUserValues(user?: SystemUser) {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    phone: user?.phone ?? "",
    role: user?.role ?? "admin",
    active: user ? String(user.active) : "true",
  };
}

function toUserPayload(values: Record<string, string>): SystemUserPayload {
  return {
    name: values.name,
    email: values.email,
    password: values.password || undefined,
    phone: values.phone || null,
    role: values.role as SystemUserPayload["role"],
    active: values.active === "true",
  };
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
    active: dentist ? String(dentist.active) : "true",
  };
}

function toDentistPayload(values: Record<string, string>): DentistPayload {
  return {
    employeeCode: values.employeeCode || undefined,
    name: values.name,
    email: values.email,
    password: values.password || undefined,
    phone: values.phone || null,
    dob: values.dob || null,
    workplace: values.workplace || null,
    degree: values.degree || null,
    specialization: values.specialization,
    licenseNumber: values.licenseNumber,
    yearsExperience: values.yearsExperience ? Number(values.yearsExperience) : null,
    consultationFee: values.consultationFee ? Number(values.consultationFee) : null,
    bio: values.bio || null,
    available: values.available === "true",
    active: values.active === "true",
  };
}

function toServiceValues(service?: DentalService) {
  return {
    code: service?.code ?? "",
    name: service?.name ?? "",
    category: service?.category ?? "",
    durationMinutes: service?.durationMinutes?.toString() ?? "",
    price: service?.price?.toString() ?? "",
    description: service?.description ?? "",
  };
}

function toServicePayload(values: Record<string, string>): DentalServicePayload {
  return {
    code: values.code,
    name: values.name,
    category: values.category || null,
    durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
    price: values.price ? Number(values.price) : null,
    description: values.description || null,
  };
}

function isManagedUser(user: SystemUser) {
  return user.role === "admin";
}

export const Route = createFileRoute("/app/system")({
  validateSearch: (search: Record<string, unknown>) => {
    const section =
      typeof search.section === "string" &&
      ["users", "dentists", "services", "pricing"].includes(search.section)
        ? (search.section as SystemSection)
        : "users";

    return { section };
  },
  component: SystemManagementPage,
  head: () => ({ meta: [{ title: "Quản lý hệ thống | DentalPro" }] }),
});

function SystemManagementPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const section = search.section;
  const selectedSection = sections.find((item) => item.id === section) || sections[0];
  const setSection = (nextSection: SystemSection) => {
    void navigate({ to: "/app/system", search: { section: nextSection } });
  };

  return (
    <AppShell title="Quản lý hệ thống" allowedRoles={["admin"]}>
      <div className="space-y-6">
        <Card className="border-slate-200 bg-[radial-gradient(circle_at_top_left,#eff8ff_0,#ffffff_55%,#f8fafc_100%)]">
          <CardHeader>
            <CardTitle className="text-base">Chức năng</CardTitle>
            <CardDescription className="text-base">
              Chọn chức năng từ menu xổ xuống ở thanh bên trái để chuyển nhanh giữa các phần quản trị.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="min-w-0">
          {section === "users" && <UsersSection />}
          {section === "dentists" && <DentistsSection />}
          {section === "services" && <ServicesSection />}
          {section === "pricing" && <PricingSection />}
        </div>
      </div>
    </AppShell>
  );
}

function UsersSection() {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [detailUser, setDetailUser] = useState<SystemUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<SystemUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["system", "users"],
    queryFn: async () => (await usersApi.list()).content,
  });
  const users = usersQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["system", "users"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toUserPayload(values);
      return editingUser ? usersApi.update(editingUser.id, payload) : usersApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingUser ? "Đã cập nhật người dùng" : "Đã tạo người dùng");
      setFormOpen(false);
      setEditingUser(null);
      await refreshUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (user: SystemUser) => (user.active ? usersApi.deactivate(user.id) : usersApi.activate(user.id)),
    onSuccess: async (_, user) => {
      toast.success(user.active ? "Đã ngừng hoạt động người dùng" : "Đã kích hoạt người dùng");
      setStatusUser(null);
      await refreshUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PageSection title="Quản lý người dùng">
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>
      <QueryState
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        isEmpty={(usersQuery.data || []).length === 0}
        emptyIcon={Users}
        emptyTitle="Chưa có người dùng"
        emptyDescription="Danh sách tài khoản sẽ hiển thị tại đây."
        onRetry={() => usersQuery.refetch()}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{titleCase(user.role)}</TableCell>
                <TableCell>{user.phone || "Chưa cập nhật"}</TableCell>
                <TableCell>
                  <StatusBadge value={user.active} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="icon" onClick={() => setDetailUser(user)} title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isManagedUser(user) && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingUser(user);
                            setFormOpen(true);
                          }}
                          title="Sửa người dùng"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setStatusUser(user)}
                          title={user.active ? "Ngừng hoạt động" : "Kích hoạt"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ClientPagination
          page={page}
          totalItems={users.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </QueryState>

      <CrudFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
        fields={userFields(Boolean(editingUser))}
        initialValues={toUserValues(editingUser || undefined)}
        submitLabel={editingUser ? "Lưu thay đổi" : "Tạo người dùng"}
        pending={saveMutation.isPending}
        onSubmit={async (values) => saveMutation.mutateAsync(values)}
      />

      <DetailDialog
        open={Boolean(detailUser)}
        onOpenChange={(open) => !open && setDetailUser(null)}
        title={detailUser?.name || "Chi tiết người dùng"}
        description="Thông tin tài khoản"
        items={
          detailUser
            ? [
                { label: "Email", value: detailUser.email },
                { label: "Vai trò", value: titleCase(detailUser.role) },
                { label: "Số điện thoại", value: detailUser.phone || "Chưa cập nhật" },
                { label: "Trạng thái", value: detailUser.active ? "Đang hoạt động" : "Ngừng hoạt động" },
              ]
            : []
        }
      />

      <ConfirmActionDialog
        open={Boolean(statusUser)}
        onOpenChange={(open) => !open && setStatusUser(null)}
        title={statusUser?.active ? "Ngừng hoạt động người dùng" : "Kích hoạt người dùng"}
        description={`Xác nhận thay đổi trạng thái của "${statusUser?.name}"?`}
        pending={statusMutation.isPending}
        onConfirm={async () => {
          if (statusUser) {
            await statusMutation.mutateAsync(statusUser);
          }
        }}
      />
    </PageSection>
  );
}

function DentistsSection() {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);
  const [detailDentist, setDetailDentist] = useState<Dentist | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusDentist, setStatusDentist] = useState<Dentist | null>(null);

  const dentistsQuery = useQuery({
    queryKey: ["system", "dentists"],
    queryFn: async () => (await dentistsApi.list()).content,
  });
  const dentists = dentistsQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(dentists.length / pageSize));
  const paginatedDentists = dentists.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshDentists = async () => {
    await queryClient.invalidateQueries({ queryKey: ["system", "dentists"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toDentistPayload(values);
      return editingDentist ? dentistsApi.update(editingDentist.id, payload) : dentistsApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingDentist ? "Đã cập nhật bác sĩ" : "Đã tạo bác sĩ");
      setFormOpen(false);
      setEditingDentist(null);
      await refreshDentists();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (dentist: Dentist) =>
      dentist.active ? dentistsApi.deactivate(dentist.id) : dentistsApi.activate(dentist.id),
    onSuccess: async (_, dentist) => {
      toast.success(dentist.active ? "Đã ngừng hoạt động bác sĩ" : "Đã kích hoạt bác sĩ");
      setStatusDentist(null);
      await refreshDentists();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PageSection title="Quản lý bác sĩ">
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingDentist(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm bác sĩ
        </Button>
      </div>
      <QueryState
        isLoading={dentistsQuery.isLoading}
        error={dentistsQuery.error}
        isEmpty={(dentistsQuery.data || []).length === 0}
        emptyIcon={Stethoscope}
        emptyTitle="Chưa có bác sĩ"
        emptyDescription="Danh sách bác sĩ sẽ hiển thị tại đây."
        onRetry={() => dentistsQuery.refetch()}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Bằng cấp</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead>Phí tư vấn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDentists.map((dentist) => (
              <TableRow key={dentist.id}>
                <TableCell>{dentist.employeeCode}</TableCell>
                <TableCell>
                  <div className="font-medium">{dentist.name}</div>
                  <div className="text-xs text-muted-foreground">{dentist.email}</div>
                </TableCell>
                <TableCell>{formatDate(dentist.dob)}</TableCell>
                <TableCell>{dentist.degree || "Chưa cập nhật"}</TableCell>
                <TableCell>{dentist.specialization}</TableCell>
                <TableCell>{formatCurrency(dentist.consultationFee)}</TableCell>
                <TableCell>
                  <StatusBadge value={dentist.active && dentist.available ? "active" : "inactive"} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="icon" onClick={() => setDetailDentist(dentist)} title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingDentist(dentist);
                        setFormOpen(true);
                      }}
                      title="Sửa bác sĩ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setStatusDentist(dentist)}
                      title={dentist.active ? "Ngừng hoạt động" : "Kích hoạt"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
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

      <CrudFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDentist(null);
        }}
        title={editingDentist ? "Cập nhật bác sĩ" : "Thêm bác sĩ"}
        fields={dentistFields(Boolean(editingDentist))}
        initialValues={toDentistValues(editingDentist || undefined)}
        submitLabel={editingDentist ? "Lưu thay đổi" : "Tạo bác sĩ"}
        pending={saveMutation.isPending}
        onSubmit={async (values) => saveMutation.mutateAsync(values)}
      />

      <DetailDialog
        open={Boolean(detailDentist)}
        onOpenChange={(open) => !open && setDetailDentist(null)}
        title={detailDentist?.name || "Chi tiết bác sĩ"}
        description="Hồ sơ bác sĩ"
        items={
          detailDentist
            ? [
                { label: "Mã bác sĩ", value: detailDentist.employeeCode },
                { label: "Email", value: detailDentist.email },
                { label: "Số điện thoại", value: detailDentist.phone || "Chưa cập nhật" },
                { label: "Ngày sinh", value: formatDate(detailDentist.dob) },
                { label: "Nơi công tác", value: detailDentist.workplace || "Chưa cập nhật" },
                { label: "Bằng cấp", value: detailDentist.degree || "Chưa cập nhật" },
                { label: "Chuyên môn", value: detailDentist.specialization },
                { label: "Số chứng chỉ", value: detailDentist.licenseNumber },
                { label: "Kinh nghiệm", value: `${detailDentist.yearsExperience} năm` },
                { label: "Phí tư vấn", value: formatCurrency(detailDentist.consultationFee) },
                { label: "Tiểu sử", value: detailDentist.bio || "Chưa cập nhật" },
              ]
            : []
        }
      />

      <ConfirmActionDialog
        open={Boolean(statusDentist)}
        onOpenChange={(open) => !open && setStatusDentist(null)}
        title={statusDentist?.active ? "Ngừng hoạt động bác sĩ" : "Kích hoạt bác sĩ"}
        description={`Xác nhận thay đổi trạng thái của "${statusDentist?.name}"?`}
        pending={statusMutation.isPending}
        onConfirm={async () => {
          if (statusDentist) {
            await statusMutation.mutateAsync(statusDentist);
          }
        }}
      />
    </PageSection>
  );
}

function ServicesSection() {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [editingService, setEditingService] = useState<DentalService | null>(null);
  const [detailService, setDetailService] = useState<DentalService | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusService, setStatusService] = useState<DentalService | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["system", "services"],
    queryFn: async () => (await servicesApi.list()).content,
  });
  const services = servicesQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const paginatedServices = services.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshServices = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["system", "services"] }),
      queryClient.invalidateQueries({ queryKey: ["services"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toServicePayload(values);
      return editingService ? servicesApi.update(editingService.id, payload) : servicesApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingService ? "Đã cập nhật dịch vụ" : "Đã tạo dịch vụ");
      setFormOpen(false);
      setEditingService(null);
      await refreshServices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (service: DentalService) =>
      service.active ? servicesApi.deactivate(service.id) : servicesApi.activate(service.id),
    onSuccess: async (_, service) => {
      toast.success(service.active ? "Đã ngừng hoạt động dịch vụ" : "Đã kích hoạt dịch vụ");
      setStatusService(null);
      await refreshServices();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PageSection title="Quản lý danh mục dịch vụ">
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingService(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm dịch vụ
        </Button>
      </div>
      <QueryState
        isLoading={servicesQuery.isLoading}
        error={servicesQuery.error}
        isEmpty={(servicesQuery.data || []).length === 0}
        emptyIcon={Briefcase}
        emptyTitle="Chưa có dịch vụ"
        emptyDescription="Danh sách dịch vụ sẽ hiển thị tại đây."
        onRetry={() => servicesQuery.refetch()}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.code}</TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.category || "Chưa phân loại"}</TableCell>
                <TableCell>{service.durationMinutes} phút</TableCell>
                <TableCell>{formatCurrency(service.price)}</TableCell>
                <TableCell>
                  <StatusBadge value={service.active} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="icon" onClick={() => setDetailService(service)} title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingService(service);
                        setFormOpen(true);
                      }}
                      title="Sửa dịch vụ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setStatusService(service)}
                      title={service.active ? "Ngừng hoạt động" : "Kích hoạt"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ClientPagination
          page={page}
          totalItems={services.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </QueryState>

      <CrudFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingService(null);
        }}
        title={editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
        fields={serviceFields}
        initialValues={toServiceValues(editingService || undefined)}
        submitLabel={editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
        pending={saveMutation.isPending}
        onSubmit={async (values) => saveMutation.mutateAsync(values)}
      />

      <DetailDialog
        open={Boolean(detailService)}
        onOpenChange={(open) => !open && setDetailService(null)}
        title={detailService?.name || "Chi tiết dịch vụ"}
        description="Thông tin danh mục dịch vụ"
        items={
          detailService
            ? [
                { label: "Mã", value: detailService.code },
                { label: "Danh mục", value: detailService.category || "Chưa phân loại" },
                { label: "Thời lượng", value: `${detailService.durationMinutes} phút` },
                { label: "Giá", value: formatCurrency(detailService.price) },
                { label: "Mô tả", value: detailService.description || "Chưa cập nhật" },
              ]
            : []
        }
      />

      <ConfirmActionDialog
        open={Boolean(statusService)}
        onOpenChange={(open) => !open && setStatusService(null)}
        title={statusService?.active ? "Ngừng hoạt động dịch vụ" : "Kích hoạt dịch vụ"}
        description={`Xác nhận thay đổi trạng thái của "${statusService?.name}"?`}
        pending={statusMutation.isPending}
        onConfirm={async () => {
          if (statusService) {
            await statusMutation.mutateAsync(statusService);
          }
        }}
      />
    </PageSection>
  );
}

function PricingSection() {
  const pageSize = 10;
  const [servicesPage, setServicesPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);
  const [pricingFormOpen, setPricingFormOpen] = useState(false);

  const servicesQuery = useQuery({
    queryKey: ["system", "services"],
    queryFn: async () => (await servicesApi.list()).content,
  });

  const priceHistoryQuery = useQuery({
    queryKey: ["service-price-history", selectedService?.id],
    queryFn: () => servicesApi.priceHistory(selectedService!.id),
    enabled: Boolean(selectedService?.id),
  });

  const updatePriceMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!selectedService) {
        throw new Error("Vui lòng chọn dịch vụ cần cập nhật giá.");
      }

      return servicesApi.updatePrice(selectedService.id, {
        price: Number(values.price),
        changeNote: values.changeNote || null,
      });
    },
    onSuccess: async () => {
      toast.success("Đã cập nhật giá dịch vụ");
      setPricingFormOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system", "services"] }),
        queryClient.invalidateQueries({ queryKey: ["services"] }),
        queryClient.invalidateQueries({ queryKey: ["service-price-history", selectedService?.id] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const initialPriceValues = useMemo(
    () => ({
      price: selectedService?.price?.toString() ?? "",
      changeNote: "",
    }),
    [selectedService],
  );
  const services = servicesQuery.data || [];
  const priceHistory = priceHistoryQuery.data || [];
  const servicesTotalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const historyTotalPages = Math.max(1, Math.ceil(priceHistory.length / pageSize));
  const paginatedServices = services.slice((servicesPage - 1) * pageSize, servicesPage * pageSize);
  const paginatedPriceHistory = priceHistory.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  useEffect(() => {
    setHistoryPage(1);
  }, [selectedService?.id]);

  useEffect(() => {
    if (servicesPage > servicesTotalPages) {
      setServicesPage(servicesTotalPages);
    }
  }, [servicesPage, servicesTotalPages]);

  useEffect(() => {
    if (historyPage > historyTotalPages) {
      setHistoryPage(historyTotalPages);
    }
  }, [historyPage, historyTotalPages]);

  return (
    <PageSection title="Thiết lập bảng giá dịch vụ">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách giá</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={servicesQuery.isLoading}
              error={servicesQuery.error}
              isEmpty={(servicesQuery.data || []).length === 0}
              emptyIcon={BadgeDollarSign}
              emptyTitle="Chưa có bảng giá"
              emptyDescription="Giá dịch vụ sẽ hiển thị tại đây."
              onRetry={() => servicesQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead className="text-right">Thiết lập</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className={selectedService?.id === service.id ? "bg-muted/50" : undefined}
                    >
                      <TableCell>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.code}</div>
                      </TableCell>
                      <TableCell>{service.category || "Chưa phân loại"}</TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>{service.durationMinutes} phút</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => setSelectedService(service)}>
                            Xem lịch sử
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setPricingFormOpen(true);
                            }}
                          >
                            Cập nhật giá
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ClientPagination
                page={servicesPage}
                totalItems={services.length}
                pageSize={pageSize}
                onPageChange={setServicesPage}
              />
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedService ? `Lịch sử giá · ${selectedService.name}` : "Lịch sử giá"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedService ? (
              <div className="text-sm text-muted-foreground">Chọn một dịch vụ để xem lịch sử điều chỉnh giá.</div>
            ) : (
              <QueryState
                isLoading={priceHistoryQuery.isLoading}
                error={priceHistoryQuery.error as Error | null}
                isEmpty={(priceHistoryQuery.data || []).length === 0}
                emptyIcon={Clock3}
                emptyTitle="Chưa có lịch sử giá"
                emptyDescription="Lịch sử cập nhật giá sẽ hiển thị tại đây."
                onRetry={() => priceHistoryQuery.refetch()}
              >
                <div className="space-y-3">
                  {paginatedPriceHistory.map((entry: ServicePriceHistory) => (
                    <div key={entry.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{formatCurrency(entry.newPrice)}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Từ {formatCurrency(entry.oldPrice)} sang {formatCurrency(entry.newPrice)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.changedBy || "Hệ thống"}
                        {entry.changeNote ? ` · ${entry.changeNote}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
                <ClientPagination
                  page={historyPage}
                  totalItems={priceHistory.length}
                  pageSize={pageSize}
                  onPageChange={setHistoryPage}
                />
              </QueryState>
            )}
          </CardContent>
        </Card>
      </div>

      <CrudFormDialog
        open={pricingFormOpen}
        onOpenChange={setPricingFormOpen}
        title={selectedService ? `Cập nhật giá · ${selectedService.name}` : "Cập nhật giá"}
        fields={priceFields}
        initialValues={initialPriceValues}
        submitLabel="Lưu giá mới"
        pending={updatePriceMutation.isPending}
        onSubmit={async (values) => updatePriceMutation.mutateAsync(values)}
      />
    </PageSection>
  );
}
