import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarPlus, ChevronRight, Clock, Inbox, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";

import { customerPortalApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Appointment } from "@/types/api";

export const Route = createFileRoute("/my/appointments/")({
  component: MyAppointmentsPage,
  head: () => ({ meta: [{ title: "Lịch hẹn của tôi | DentalPro" }] }),
});

function MyAppointmentsPage() {
  const appointmentsQuery = useQuery({
    queryKey: ["my", "appointments"],
    queryFn: async () => (await customerPortalApi.listAppointments()).content,
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => customerPortalApi.cancelAppointment(id),
    onSuccess: async () => {
      toast.success("Đã huỷ lịch hẹn");
      setCancelTarget(null);
      await appointmentsQuery.refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const appointments = appointmentsQuery.data || [];
  const upcoming = appointments.filter((item) => item.status === "pending" || item.status === "confirmed");
  const history = appointments.filter((item) => item.status === "completed" || item.status === "cancelled");

  return (
    <CustomerShell
      pathname="/my/appointments"
      title="Lịch hẹn của tôi"
      actions={
        <Button asChild>
          <Link to="/my/appointments/new">
            <CalendarPlus className="h-4 w-4" /> Đặt lịch mới
          </Link>
        </Button>
      }
    >
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Sắp tới
            <span className="ml-2 rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
              {upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">
            Lịch sử
            <span className="ml-2 rounded-full bg-muted-foreground/15 px-1.5 text-[10px] font-bold text-muted-foreground">
              {history.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-5 space-y-4">
          {appointmentsQuery.isLoading && <ListSkeleton />}
          {!appointmentsQuery.isLoading && upcoming.length === 0 && (
            <EmptyState title="Chưa có lịch hẹn sắp tới" description="Đặt lịch ngay." />
          )}
          {upcoming.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={() => setCancelTarget(appointment)}
            />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-5 space-y-4">
          {appointmentsQuery.isLoading && <ListSkeleton />}
          {!appointmentsQuery.isLoading && history.length === 0 && (
            <EmptyState title="Chưa có lịch sử" description="Các lịch đã hoàn thành hoặc huỷ sẽ hiển thị tại đây." />
          )}
          {history.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ lịch hẹn?</AlertDialogTitle>
            <AlertDialogDescription>
              Lịch hẹn lúc <strong>{cancelTarget ? formatDateTime(cancelTarget.appointmentDate) : ""}</strong> sẽ bị huỷ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTarget && void cancelMutation.mutateAsync(cancelTarget.id)}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận huỷ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CustomerShell>
  );
}

function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel?: () => void;
}) {
  return (
    <Card className="transition-all hover:shadow-[0_18px_60px_-26px_rgba(13,148,136,0.18)]">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge value={appointment.status} />
              <span className="text-xs text-muted-foreground">#{appointment.id.slice(-6).toUpperCase()}</span>
            </div>
            <p className="text-base font-bold capitalize">{formatDateTime(appointment.appointmentDate)}</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{appointment.dentistName || "Chưa phân bác sĩ"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{appointment.serviceName || appointment.appointmentType}</span>
              </div>
            </div>
            {appointment.notes && (
              <p className="mt-3 line-clamp-2 rounded-md bg-secondary/60 p-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Ghi chú: </span>
                {appointment.notes}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
          {onCancel && appointment.status === "pending" && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" /> Huỷ lịch
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link to="/my/appointments/$id" params={{ id: appointment.id }}>
              Chi tiết <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-5">
          <Link to="/my/appointments/new">
            <CalendarPlus className="h-4 w-4" /> Đặt lịch ngay
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <>
      {[1, 2].map((item) => (
        <Card key={item}>
          <CardContent className="space-y-3 p-5">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
