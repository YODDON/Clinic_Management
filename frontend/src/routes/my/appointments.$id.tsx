import type { ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { customerPortalApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/my/appointments/$id")({
  component: AppointmentDetailPage,
  head: () => ({ meta: [{ title: "Chi tiết lịch hẹn | DentalPro" }] }),
});

function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();

  const appointmentQuery = useQuery({
    queryKey: ["my", "appointments", id],
    queryFn: () => customerPortalApi.getAppointment(id),
  });
  const cancelMutation = useMutation({
    mutationFn: () => customerPortalApi.cancelAppointment(id),
    onSuccess: async () => {
      toast.success("Đã huỷ lịch hẹn");
      await navigate({ to: "/my/appointments" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const appointment = appointmentQuery.data;

  return (
    <CustomerShell
      pathname={`/my/appointments/${id}`}
      title="Chi tiết lịch hẹn"
      subtitle="Trang này phản ánh đúng dữ liệu appointment của customer trong hệ thống dùng chung với V1."
      actions={
        appointment?.status === "pending" ? (
          <Button variant="destructive" onClick={() => void cancelMutation.mutateAsync()}>
            Huỷ lịch hẹn
          </Button>
        ) : undefined
      }
    >
      {appointment && (
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <StatusBadge value={appointment.status} />
                <span className="text-xs text-muted-foreground">#{appointment.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Thời gian" value={formatDateTime(appointment.appointmentDate)} />
                <InfoRow icon={<Clock className="h-4 w-4" />} label="Loại lịch hẹn" value={appointment.appointmentType} />
                <InfoRow icon={<Stethoscope className="h-4 w-4" />} label="Dịch vụ" value={appointment.serviceName || "Chưa cập nhật"} />
                <InfoRow icon={<Stethoscope className="h-4 w-4" />} label="Nha sĩ" value={appointment.dentistName || "Đang chờ phân công"} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Ghế nha" value={appointment.chairName || "Lễ tân sẽ gán khi confirm"} />
                <InfoRow icon={<Stethoscope className="h-4 w-4" />} label="Bệnh nhân" value={appointment.patientName} />
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Ghi chú</div>
                <div className="mt-2 text-sm text-foreground">{appointment.notes || "Không có ghi chú"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-primary/30 bg-accent/40">
            <CardContent className="space-y-4 p-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gợi ý nghiệp vụ
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Nếu lịch đang ở trạng thái `pending`, staff V1 sẽ tiếp nhận và xác nhận. Khi đã `confirmed`, customer không còn quyền huỷ theo rule V2.
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Giá dịch vụ
                </div>
                <div className="mt-1 text-2xl font-bold text-primary">
                  {appointment.serviceName ? "Xem theo service catalog" : formatCurrency(0)}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => void navigate({ to: "/my/appointments" })}>
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </CustomerShell>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span></div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
