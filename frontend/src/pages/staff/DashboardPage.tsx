import { useQuery } from "@tanstack/react-query";
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

export function StaffDashboardPage() {
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
    <AppShell title="Tong quan" allowedRoles={["admin", "dentist"]}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lich hen hom nay"
          value={String(statsQuery.data?.todayAppointments ?? 0)}
          hint="Tu /dashboard/stats"
          icon={CalendarDays}
        />
        <StatCard
          label="Benh nhan active"
          value={String(statsQuery.data?.patientCount ?? 0)}
          hint="Tong ho so dang su dung"
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Doanh thu thang"
          value={formatCurrency(statsQuery.data?.monthlyRevenue ?? 0)}
          hint="Hóa đơn đã thanh toán"
          icon={Receipt}
          tone="warning"
        />
        <StatCard
          label="Vat tu canh bao"
          value={String(statsQuery.data?.lowStockCount ?? 0)}
          hint="So mat hang sap het"
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <PageSection className="lg:col-span-2" title="Lich hen sap toi">
          <QueryState
            isLoading={appointmentsQuery.isLoading}
            error={appointmentsQuery.error}
            isEmpty={upcomingAppointments.length === 0}
            emptyIcon={CalendarDays}
            emptyTitle="Chua co lich hen"
            emptyDescription="Lich hen tu backend se hien thi tai day."
            onRetry={() => appointmentsQuery.refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thoi gian</TableHead>
                  <TableHead>Benh nhan</TableHead>
                  <TableHead>Nha si</TableHead>
                  <TableHead>Dich vu</TableHead>
                  <TableHead>Trang thai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.dentistName || "Chua phan cong"}</TableCell>
                    <TableCell>{appointment.serviceName || "Khong co"}</TableCell>
                    <TableCell>
                      <StatusBadge value={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </QueryState>
        </PageSection>

        <PageSection title="Ton kho thap">
          <QueryState
            isLoading={lowStockQuery.isLoading}
            error={lowStockQuery.error}
            isEmpty={lowStockItems.length === 0}
            emptyIcon={Package}
            emptyTitle="Tat ca o muc an toan"
            emptyDescription="Khong co vat tu nao duoi nguong ton kho."
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
        <PageSection title="Tai chinh nhanh">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Hoa don pending"
              value={String(statsQuery.data?.unpaidInvoices ?? 0)}
              hint="Can thu tien"
              icon={TrendingUp}
            />
            <StatCard
              label="Benh nhan active"
              value={String(statsQuery.data?.patientCount ?? 0)}
              hint="Dong bo voi patients"
              icon={Users}
              tone="success"
            />
            <StatCard
              label="Canh bao kho"
              value={String(statsQuery.data?.lowStockCount ?? 0)}
              hint="Dong bo voi inventory"
              icon={Package}
              tone="warning"
            />
          </div>
          {statsQuery.isError && (
            <div className="mt-4">
              <EmptyState
                icon={AlertTriangle}
                title="Khong tai duoc KPI"
                description={statsQuery.error.message}
              />
            </div>
          )}
        </PageSection>
      </div>
    </AppShell>
  );
}
