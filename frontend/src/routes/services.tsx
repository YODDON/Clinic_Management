import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Armchair, Briefcase, Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/query-client";
import { servicesApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatCurrency } from "@/lib/format";
import type {
  DentalChair,
  DentalChairPayload,
  DentalService,
  DentalServicePayload,
} from "@/types/api";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({ meta: [{ title: "Dịch vụ & Ghế nha | DentalPro" }] }),
});

const serviceFields = [
  { name: "code", label: "Mã dịch vụ", required: true },
  { name: "name", label: "Tên dịch vụ", required: true },
  { name: "category", label: "Danh mục" },
  { name: "durationMinutes", label: "Thời lượng (phút)", type: "number" as const },
  { name: "price", label: "Giá", type: "number" as const },
  { name: "description", label: "Mô tả", type: "textarea" as const },
];

const chairFields = [
  { name: "chairNumber", label: "Số ghế", required: true },
  { name: "chairName", label: "Tên ghế" },
  { name: "room", label: "Phòng" },
];

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

function toChairValues(chair?: DentalChair) {
  return {
    chairNumber: chair?.chairNumber ?? "",
    chairName: chair?.chairName ?? "",
    room: chair?.room ?? "",
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

function toChairPayload(values: Record<string, string>): DentalChairPayload {
  return {
    chairNumber: values.chairNumber,
    chairName: values.chairName || null,
    room: values.room || null,
  };
}

export function ServicesPage() {
  const { can } = useRoleAccess();
  const [activeTab, setActiveTab] = useState("services");
  const pageSize = 10;
  const [servicesPage, setServicesPage] = useState(1);
  const [chairsPage, setChairsPage] = useState(1);
  const [editingService, setEditingService] = useState<DentalService | null>(null);
  const [detailService, setDetailService] = useState<DentalService | null>(null);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [deleteService, setDeleteService] = useState<DentalService | null>(null);
  const [toggleService, setToggleService] = useState<DentalService | null>(null);
  const [editingChair, setEditingChair] = useState<DentalChair | null>(null);
  const [detailChair, setDetailChair] = useState<DentalChair | null>(null);
  const [chairFormOpen, setChairFormOpen] = useState(false);
  const [deleteChair, setDeleteChair] = useState<DentalChair | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await servicesApi.list()).content,
  });
  const chairsQuery = useQuery({
    queryKey: ["chairs"],
    queryFn: servicesApi.chairs,
  });
  const services = servicesQuery.data || [];
  const chairs = chairsQuery.data || [];
  const servicesTotalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const chairsTotalPages = Math.max(1, Math.ceil(chairs.length / pageSize));
  const paginatedServices = services.slice((servicesPage - 1) * pageSize, servicesPage * pageSize);
  const paginatedChairs = chairs.slice((chairsPage - 1) * pageSize, chairsPage * pageSize);

  useEffect(() => {
    setServicesPage(1);
    setChairsPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (servicesPage > servicesTotalPages) {
      setServicesPage(servicesTotalPages);
    }
  }, [servicesPage, servicesTotalPages]);

  useEffect(() => {
    if (chairsPage > chairsTotalPages) {
      setChairsPage(chairsTotalPages);
    }
  }, [chairsPage, chairsTotalPages]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["services"] }),
      queryClient.invalidateQueries({ queryKey: ["chairs"] }),
    ]);
  };

  const saveServiceMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toServicePayload(values);
      return editingService
        ? servicesApi.update(editingService.id, payload)
        : servicesApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingService ? "Đã cập nhật dịch vụ" : "Đã tạo dịch vụ");
      setServiceFormOpen(false);
      setEditingService(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => servicesApi.delete(serviceId),
    onSuccess: async () => {
      toast.success("Đã xóa dịch vụ");
      setDeleteService(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleServiceMutation = useMutation({
    mutationFn: async (service: DentalService) =>
      servicesApi.update(service.id, { active: !service.active }),
    onSuccess: async (_, service) => {
      toast.success(service.active ? "Đã ngừng hoạt động dịch vụ" : "Đã kích hoạt dịch vụ");
      setToggleService(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveChairMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toChairPayload(values);
      return editingChair
        ? servicesApi.updateChair(editingChair.id, payload)
        : servicesApi.createChair(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingChair ? "Đã cập nhật ghế nha" : "Đã tạo ghế nha");
      setChairFormOpen(false);
      setEditingChair(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteChairMutation = useMutation({
    mutationFn: async (chairId: string) => servicesApi.deleteChair(chairId),
    onSuccess: async () => {
      toast.success("Đã xóa ghế nha");
      setDeleteChair(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell title="Dịch vụ & Ghế nha" allowedRoles={["admin", "dentist"]}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="services">Dịch vụ</TabsTrigger>
            <TabsTrigger value="chairs">Ghế nha</TabsTrigger>
          </TabsList>
          {((activeTab === "services" && can("services.write")) ||
            (activeTab === "chairs" && can("services.chairs.write"))) && (
            <Button
              size="sm"
              onClick={() => {
                if (activeTab === "services") {
                  setEditingService(null);
                  setServiceFormOpen(true);
                  return;
                }
                setEditingChair(null);
                setChairFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          )}
        </div>

        <TabsContent value="services" className="mt-0">
          <PageSection>
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
                        <div className="action-buttons flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Xem chi tiết"
                            title="Xem chi tiết"
                            onClick={() => setDetailService(service)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {can("services.write") && (
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Sửa dịch vụ"
                              title="Sửa dịch vụ"
                              onClick={() => {
                                setEditingService(service);
                                setServiceFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {can("services.write") && (
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={service.active ? "Ngừng hoạt động" : "Kích hoạt"}
                              title={service.active ? "Ngừng hoạt động" : "Kích hoạt"}
                              onClick={() => setToggleService(service)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          {can("services.write") && (
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Xóa dịch vụ"
                              title="Xóa dịch vụ"
                              onClick={() => setDeleteService(service)}
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
                page={servicesPage}
                totalItems={services.length}
                pageSize={pageSize}
                onPageChange={setServicesPage}
              />
            </QueryState>
          </PageSection>
        </TabsContent>

        <TabsContent value="chairs" className="mt-0">
          <PageSection>
            <QueryState
              isLoading={chairsQuery.isLoading}
              error={chairsQuery.error}
              isEmpty={(chairsQuery.data || []).length === 0}
              emptyIcon={Armchair}
              emptyTitle="Chưa có ghế nha"
              emptyDescription="Danh sách ghế nha sẽ hiển thị tại đây."
              onRetry={() => chairsQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số ghế</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedChairs.map((chair) => (
                    <TableRow key={chair.id}>
                      <TableCell>{chair.chairNumber}</TableCell>
                      <TableCell>{chair.chairName || "Chưa đặt tên"}</TableCell>
                      <TableCell>{chair.room || "Chưa gán phòng"}</TableCell>
                      <TableCell>
                        <StatusBadge value={chair.active} />
                      </TableCell>
                      <TableCell>
                        <div className="action-buttons flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Xem chi tiết"
                            title="Xem chi tiết"
                            onClick={() => setDetailChair(chair)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {can("services.chairs.write") && (
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Sửa ghế nha"
                              title="Sửa ghế nha"
                              onClick={() => {
                                setEditingChair(chair);
                                setChairFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {can("services.chairs.write") && (
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Xóa ghế nha"
                              title="Xóa ghế nha"
                              onClick={() => setDeleteChair(chair)}
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
                page={chairsPage}
                totalItems={chairs.length}
                pageSize={pageSize}
                onPageChange={setChairsPage}
              />
            </QueryState>
          </PageSection>
        </TabsContent>
      </Tabs>

      {can("services.write") && (
        <CrudFormDialog
          open={serviceFormOpen}
          onOpenChange={(open) => {
            setServiceFormOpen(open);
            if (!open) setEditingService(null);
          }}
          title={editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
          fields={serviceFields}
          initialValues={toServiceValues(editingService || undefined)}
          submitLabel={editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
          pending={saveServiceMutation.isPending}
          onSubmit={async (values) => saveServiceMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailService)}
        onOpenChange={(open) => !open && setDetailService(null)}
        title={detailService?.name || "Chi tiết dịch vụ"}
        description="Thông tin dịch vụ"
        items={
          detailService
            ? [
                { label: "Mã", value: detailService.code },
                { label: "Tên", value: detailService.name },
                { label: "Danh mục", value: detailService.category || "Chưa phân loại" },
                { label: "Thời lượng", value: `${detailService.durationMinutes} phút` },
                { label: "Giá", value: formatCurrency(detailService.price) },
                { label: "Mô tả", value: detailService.description || "Chưa cập nhật" },
                {
                  label: "Trạng thái",
                  value: detailService.active ? "Hoạt động" : "Ngừng hoạt động",
                },
              ]
            : []
        }
      />

      <DetailDialog
        open={Boolean(detailChair)}
        onOpenChange={(open) => !open && setDetailChair(null)}
        title={detailChair?.chairName || detailChair?.chairNumber || "Chi tiết ghế nha"}
        description="Thông tin ghế nha"
        items={
          detailChair
            ? [
                { label: "Số ghế", value: detailChair.chairNumber },
                { label: "Tên ghế", value: detailChair.chairName || "Chưa đặt tên" },
                { label: "Phòng", value: detailChair.room || "Chưa gán phòng" },
                {
                  label: "Trạng thái",
                  value: detailChair.active ? "Hoạt động" : "Ngừng hoạt động",
                },
              ]
            : []
        }
      />

      {can("services.chairs.write") && (
        <CrudFormDialog
          open={chairFormOpen}
          onOpenChange={(open) => {
            setChairFormOpen(open);
            if (!open) setEditingChair(null);
          }}
          title={editingChair ? "Cập nhật ghế nha" : "Thêm ghế nha"}
          fields={chairFields}
          initialValues={toChairValues(editingChair || undefined)}
          submitLabel={editingChair ? "Lưu thay đổi" : "Tạo ghế nha"}
          pending={saveChairMutation.isPending}
          onSubmit={async (values) => saveChairMutation.mutateAsync(values)}
        />
      )}

      {can("services.write") && (
        <ConfirmActionDialog
          open={Boolean(deleteService)}
          onOpenChange={(open) => !open && setDeleteService(null)}
          title="Xóa dịch vụ"
          description={`Bạn có chắc muốn xóa "${deleteService?.name}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteServiceMutation.isPending}
          onConfirm={async () => {
            if (deleteService) {
              await deleteServiceMutation.mutateAsync(deleteService.id);
            }
          }}
        />
      )}

      {can("services.write") && (
        <ConfirmActionDialog
          open={Boolean(toggleService)}
          onOpenChange={(open) => !open && setToggleService(null)}
          title={toggleService?.active ? "Ngừng hoạt động dịch vụ" : "Kích hoạt dịch vụ"}
          description={`Xác nhận thay đổi trạng thái của "${toggleService?.name}"?`}
          pending={toggleServiceMutation.isPending}
          onConfirm={async () => {
            if (toggleService) {
              await toggleServiceMutation.mutateAsync(toggleService);
            }
          }}
        />
      )}

      {can("services.chairs.write") && (
        <ConfirmActionDialog
          open={Boolean(deleteChair)}
          onOpenChange={(open) => !open && setDeleteChair(null)}
          title="Xóa ghế nha"
          description={`Bạn có chắc muốn xóa ghế "${deleteChair?.chairName || deleteChair?.chairNumber}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteChairMutation.isPending}
          onConfirm={async () => {
            if (deleteChair) {
              await deleteChairMutation.mutateAsync(deleteChair.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
