import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Package, Receipt, TrendingUp, Users } from "lucide-react";

import { appointmentsApi, dashboardApi, inventoryApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppShell } from "@/components/layout/AppShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Tổng quan | DentalPro" }] }),
});

function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await appointmentsApi.list()).content,
  });
  const lowStockQuery = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: inventoryApi.lowStock,
  });

  const upcomingAppointments = (appointmentsQuery.data || []).slice(0, 5);
  const lowStockItems = lowStockQuery.data || [];

  return (
    <AppShell
      title="Tổng quan"
      subtitle="Số liệu dashboard đang được đồng bộ trực tiếp từ backend"
      allowedRoles={["admin", "dentist"]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lịch hẹn hôm nay"
          value={String(statsQuery.data?.todayAppointments ?? 0)}
          hint="Từ /dashboard/stats"
          icon={CalendarDays}
        />
        <StatCard
          label="Bệnh nhân active"
          value={String(statsQuery.data?.patientCount ?? 0)}
          hint="Tổng hồ sơ đang sử dụng"
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Doanh thu tháng"
          value={formatCurrency(statsQuery.data?.monthlyRevenue ?? 0)}
          hint="Invoices đã paid"
          icon={Receipt}
          tone="warning"
        />
        <StatCard
          label="Vật tư cảnh báo"
          value={String(statsQuery.data?.lowStockCount ?? 0)}
          hint="Số mặt hàng sắp hết"
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <PageSection
          className="lg:col-span-2"
          title="Lịch hẹn sắp tới"
          description="Preview endpoint /appointments"
        >
          <QueryState
            isLoading={appointmentsQuery.isLoading}
            error={appointmentsQuery.error}
            isEmpty={upcomingAppointments.length === 0}
            emptyIcon={CalendarDays}
            emptyTitle="Chưa có lịch hẹn"
            emptyDescription="Lịch hẹn từ backend sẽ hiển thị tại đây."
            onRetry={() => appointmentsQuery.refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Nha sĩ</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                    <TableCell>{appointment.serviceName || "Không có"}</TableCell>
                    <TableCell>
                      <StatusBadge value={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </QueryState>
        </PageSection>

        <PageSection title="Tồn kho thấp" description="Preview endpoint /inventory/low-stock">
          <QueryState
            isLoading={lowStockQuery.isLoading}
            error={lowStockQuery.error}
            isEmpty={lowStockItems.length === 0}
            emptyIcon={Package}
            emptyTitle="Tất cả ở mức an toàn"
            emptyDescription="Không có vật tư nào dưới ngưỡng tồn kho."
            onRetry={() => lowStockQuery.refetch()}
          >
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.stock}</div>
                    <div className="text-xs text-muted-foreground">Min {item.minStock}</div>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </PageSection>
      </div>

      <div className="mt-6">
        <PageSection title="Tài chính nhanh" description="Số liệu tổng hợp từ dashboard endpoint">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Hóa đơn pending"
              value={String(statsQuery.data?.unpaidInvoices ?? 0)}
              hint="Cần thu tiền"
              icon={TrendingUp}
            />
            <StatCard
              label="Bệnh nhân active"
              value={String(statsQuery.data?.patientCount ?? 0)}
              hint="Đồng bộ với patients"
              icon={Users}
              tone="success"
            />
            <StatCard
              label="Cảnh báo kho"
              value={String(statsQuery.data?.lowStockCount ?? 0)}
              hint="Đồng bộ với inventory"
              icon={Package}
              tone="warning"
            />
          </div>
          {statsQuery.isError && (
            <div className="mt-4">
              <EmptyState
                icon={AlertTriangle}
                title="Không tải được KPI"
                description={statsQuery.error.message}
              />
            </div>
          )}
        </PageSection>
      </div>
    </AppShell>
  );
}
