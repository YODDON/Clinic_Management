import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  Eye,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { DetailDialog } from "@/components/common/DetailDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { Toolbar } from "@/components/common/Toolbar";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inventoryApi } from "@/lib/api";
import { useRoleAccess } from "@/hooks/use-role-access";
import { formatCurrency } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type { InventoryItem, InventoryItemPayload } from "@/types/api";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
  head: () => ({ meta: [{ title: "Kho vật tư | DentalPro" }] }),
});

const inventoryFields = [
  { name: "code", label: "Mã vật tư", required: true },
  { name: "name", label: "Tên vật tư", required: true },
  { name: "category", label: "Danh mục", required: true },
  { name: "unit", label: "Đơn vị", required: true },
  { name: "stock", label: "Tồn kho", type: "number" as const },
  { name: "minStock", label: "Mức tối thiểu", type: "number" as const },
  { name: "price", label: "Đơn giá", type: "number" as const },
];

const stockAdjustmentFields = [
  {
    name: "quantityDelta",
    label: "Số lượng điều chỉnh",
    type: "number" as const,
    required: true,
    description: "Nhập số âm để giảm kho.",
  },
];

const batchFields = [
  { name: "batchNumber", label: "Số lô", required: true },
  { name: "quantity", label: "Số lượng", type: "number" as const, required: true },
  { name: "expiryDate", label: "Ngày hết hạn", type: "date" as const, required: true },
  { name: "supplier", label: "Nhà cung cấp" },
];

function toInventoryValues(item?: InventoryItem) {
  return {
    code: item?.code ?? "",
    name: item?.name ?? "",
    category: item?.category ?? "",
    unit: item?.unit ?? "",
    stock: item?.stock?.toString() ?? "",
    minStock: item?.minStock?.toString() ?? "",
    price: item?.price?.toString() ?? "",
  };
}

function toInventoryPayload(values: Record<string, string>): InventoryItemPayload {
  return {
    code: values.code,
    name: values.name,
    category: values.category,
    unit: values.unit,
    stock: values.stock ? Number(values.stock) : null,
    minStock: values.minStock ? Number(values.minStock) : null,
    price: values.price ? Number(values.price) : null,
  };
}

function getInventoryLevel(item: InventoryItem) {
  if (item.stock <= 0) {
    return {
      value: 2,
      barClassName: "bg-slate-300",
      labelClassName: "text-slate-500",
    };
  }

  if (item.stock <= item.minStock) {
    return {
      value: Math.max(12, Math.min(48, (item.stock / Math.max(item.minStock, 1)) * 48)),
      barClassName: "bg-rose-500",
      labelClassName: "text-rose-600",
    };
  }

  if (item.stock <= item.minStock * 1.5) {
    return {
      value: Math.max(45, Math.min(72, (item.stock / Math.max(item.minStock * 2, 1)) * 100)),
      barClassName: "bg-amber-500",
      labelClassName: "text-amber-600",
    };
  }

  return {
    value: Math.max(58, Math.min(100, (item.stock / Math.max(item.minStock * 2, 1)) * 100)),
    barClassName: "bg-blue-600",
    labelClassName: "text-blue-700",
  };
}

function InventoryTube({ item }: { item: InventoryItem }) {
  const level = getInventoryLevel(item);

  return (
    <div className="min-w-[170px]">
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${level.barClassName}`}
          style={{ width: `${level.value}%` }}
        />
      </div>
      <div className={`text-sm font-medium tabular-nums ${level.labelClassName}`}>
        {item.stock} / min {item.minStock}
      </div>
    </div>
  );
}

function InventoryStatusBadge({ item }: { item: InventoryItem }) {
  if (item.stock <= 0) {
    return <Badge variant="destructive">Hết hàng</Badge>;
  }

  if (item.stock <= item.minStock) {
    return <Badge variant="destructive">Sắp hết</Badge>;
  }

  return (
    <Badge className="border-transparent bg-teal-600 text-white shadow hover:bg-teal-600">
      Đủ hàng
    </Badge>
  );
}

export function InventoryPage() {
  const { can } = useRoleAccess();
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [batchItem, setBatchItem] = useState<InventoryItem | null>(null);
  const deferredSearch = useDeferredValue(search);

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => (await inventoryApi.list()).content,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const items = (inventoryQuery.data || []).filter((item) => {
    if (!deferredSearch) return true;
    const keyword = deferredSearch.toLowerCase();
    return item.code.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword);
  });
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  const lowStock = items.filter((item) => item.stock <= item.minStock);
  const outOfStock = items.filter((item) => item.stock === 0);
  const healthyStock = items.filter((item) => item.stock > item.minStock);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshInventory = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toInventoryPayload(values);
      return editingItem
        ? inventoryApi.update(editingItem.id, payload)
        : inventoryApi.create(payload as never);
    },
    onSuccess: async () => {
      toast.success(editingItem ? "Đã cập nhật vật tư" : "Đã tạo vật tư");
      setItemFormOpen(false);
      setEditingItem(null);
      await refreshInventory();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => inventoryApi.delete(itemId),
    onSuccess: async () => {
      toast.success("Đã xóa vật tư");
      setDeleteItem(null);
      await refreshInventory();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const adjustMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!adjustItem) throw new Error("Chưa chọn vật tư cần điều chỉnh.");
      return inventoryApi.adjustStock(adjustItem.id, Number(values.quantityDelta));
    },
    onSuccess: async () => {
      toast.success("Đã điều chỉnh tồn kho");
      setAdjustItem(null);
      await refreshInventory();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const batchMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!batchItem) throw new Error("Chưa chọn vật tư cần nhập lô.");
      return inventoryApi.createBatch({
        inventoryId: batchItem.id,
        batchNumber: values.batchNumber,
        quantity: Number(values.quantity),
        expiryDate: values.expiryDate,
        supplier: values.supplier || null,
      });
    },
    onSuccess: async () => {
      toast.success("Đã nhập lô mới");
      setBatchItem(null);
      await refreshInventory();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Kho vật tư"
      allowedRoles={["admin", "dentist"]}
      actions={
        <>
          {can("inventory.batches") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBatchItem({} as InventoryItem)}
              disabled={items.length === 0}
            >
              <Boxes className="mr-2 h-4 w-4" /> Nhập lô mới
            </Button>
          )}
          {can("inventory.write") && (
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setItemFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm vật tư
            </Button>
          )}
        </>
      }
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng mặt hàng" value={String(items.length)} icon={Package} />
        <StatCard
          label="Đủ tồn kho"
          value={String(healthyStock.length)}
          icon={PackageCheck}
          tone="success"
        />
        <StatCard
          label="Sắp hết"
          value={String(lowStock.length)}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Đã hết"
          value={String(outOfStock.length)}
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <PageSection>
        <Toolbar
          placeholder="Tìm theo mã, tên vật tư..."
          value={search}
          onValueChange={setSearch}
        />
        <QueryState
          isLoading={inventoryQuery.isLoading}
          error={inventoryQuery.error}
          isEmpty={items.length === 0}
          emptyIcon={Package}
          emptyTitle="Chưa có vật tư"
          emptyDescription="Danh sách vật tư sẽ hiển thị sau khi backend trả dữ liệu."
          onRetry={() => inventoryQuery.refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <InventoryTube item={item} />
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>
                    <InventoryStatusBadge item={item} />
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        onClick={() => setDetailItem(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can("inventory.write") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Sửa vật tư"
                          title="Sửa vật tư"
                          onClick={() => {
                            setEditingItem(item);
                            setItemFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("inventory.adjust") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Điều chỉnh tồn kho"
                          title="Điều chỉnh tồn kho"
                          onClick={() => setAdjustItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("inventory.batches") && (
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Nhập lô"
                          title="Nhập lô"
                          onClick={() => setBatchItem(item)}
                        >
                          <Boxes className="h-4 w-4" />
                        </Button>
                      )}
                      {can("inventory.delete") && (
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Xóa vật tư"
                          title="Xóa vật tư"
                          onClick={() => setDeleteItem(item)}
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
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </QueryState>
      </PageSection>

      {can("inventory.write") && (
        <CrudFormDialog
          open={itemFormOpen}
          onOpenChange={(open) => {
            setItemFormOpen(open);
            if (!open) setEditingItem(null);
          }}
          title={editingItem ? "Cập nhật vật tư" : "Thêm vật tư"}
          fields={inventoryFields}
          initialValues={toInventoryValues(editingItem || undefined)}
          submitLabel={editingItem ? "Lưu thay đổi" : "Tạo vật tư"}
          pending={saveMutation.isPending}
          onSubmit={async (values) => saveMutation.mutateAsync(values)}
        />
      )}

      <DetailDialog
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailItem(null)}
        title={detailItem?.name || "Chi tiết vật tư"}
        description="Thông tin vật tư"
        items={
          detailItem
            ? [
                { label: "Mã", value: detailItem.code },
                { label: "Tên", value: detailItem.name },
                { label: "Danh mục", value: detailItem.category },
                { label: "Đơn vị", value: detailItem.unit },
                { label: "Tồn kho", value: String(detailItem.stock) },
                { label: "Tồn tối thiểu", value: String(detailItem.minStock) },
                { label: "Đơn giá", value: formatCurrency(detailItem.price) },
              ]
            : []
        }
      />

      {can("inventory.adjust") && (
        <CrudFormDialog
          open={Boolean(adjustItem)}
          onOpenChange={(open) => !open && setAdjustItem(null)}
          title={`Điều chỉnh tồn kho${adjustItem ? `: ${adjustItem.name}` : ""}`}
          fields={stockAdjustmentFields}
          initialValues={{ quantityDelta: "" }}
          submitLabel="Cập nhật tồn kho"
          pending={adjustMutation.isPending}
          onSubmit={async (values) => adjustMutation.mutateAsync(values)}
        />
      )}

      {can("inventory.batches") && (
        <CrudFormDialog
          open={Boolean(batchItem)}
          onOpenChange={(open) => !open && setBatchItem(null)}
          title={`Nhập lô mới${batchItem && batchItem.name ? `: ${batchItem.name}` : ""}`}
          description={
            batchItem && !batchItem.id
              ? "Chọn thao tác Nhập lô từ một dòng vật tư cụ thể để gắn đúng mặt hàng."
              : undefined
          }
          fields={batchFields}
          initialValues={{ batchNumber: "", quantity: "", expiryDate: "", supplier: "" }}
          submitLabel="Tạo lô"
          pending={batchMutation.isPending}
          onSubmit={async (values) => {
            if (!batchItem?.id) {
              throw new Error("Hãy chọn vật tư từ bảng rồi nhập lô.");
            }
            await batchMutation.mutateAsync(values);
          }}
        />
      )}

      {can("inventory.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteItem)}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          title="Xóa vật tư"
          description={`Bạn có chắc muốn xóa "${deleteItem?.name}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={deleteMutation.isPending}
          onConfirm={async () => {
            if (deleteItem) {
              await deleteMutation.mutateAsync(deleteItem.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
