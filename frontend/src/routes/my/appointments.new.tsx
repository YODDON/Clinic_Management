import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Check,
  Clock,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import { customerPortalApi, publicApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { DentalService, Dentist } from "@/types/api";

type Step = 1 | 2 | 3;

const STEP_LABELS = ["Chọn dịch vụ", "Chọn nha sĩ & thời gian", "Xác nhận"];

export const Route = createFileRoute("/my/appointments/new")({
  component: NewAppointmentPage,
  head: () => ({ meta: [{ title: "Đặt lịch mới | DentalPro" }] }),
});

function NewAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState("");
  const [dentistId, setDentistId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["public", "services"],
    queryFn: () => publicApi.services(),
  });
  const dentistsQuery = useQuery({
    queryKey: ["public", "dentists"],
    queryFn: publicApi.dentists,
  });
  const slotsQuery = useQuery({
    queryKey: ["public", "slots", dentistId, date ? format(date, "yyyy-MM-dd") : ""],
    queryFn: () => publicApi.availableSlots(dentistId, format(date as Date, "yyyy-MM-dd")),
    enabled: Boolean(dentistId && date),
  });

  useEffect(() => {
    setSlot("");
  }, [dentistId, date]);

  const selectedService = useMemo(
    () => (servicesQuery.data || []).find((service) => service.id === serviceId),
    [serviceId, servicesQuery.data],
  );
  const selectedDentist = useMemo(
    () => (dentistsQuery.data || []).find((dentist) => dentist.id === dentistId),
    [dentistId, dentistsQuery.data],
  );
  const canNext = step === 1 ? !!serviceId : step === 2 ? !!dentistId && !!date && !!slot : true;

  const createMutation = useMutation({
    mutationFn: customerPortalApi.createAppointment,
    onSuccess: async () => {
      toast.success("Đặt lịch thành công, lễ tân sẽ xác nhận sớm.");
      await navigate({ to: "/my/appointments" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = async () => {
    if (!selectedService || !selectedDentist || !date || !slot) return;

    await createMutation.mutateAsync({
      serviceId: selectedService.id,
      dentistId: selectedDentist.id,
      appointmentType: selectedService.name,
      appointmentDate: `${format(date, "yyyy-MM-dd")}T${slot}:00`,
      notes: note || null,
    });
  };

  return (
    <CustomerShell
      pathname="/my/appointments/new"
      title="Đặt lịch mới"
      subtitle="Hoàn thành 3 bước để tạo lịch hẹn online. Lịch sẽ vào trạng thái pending theo đúng business rule V2."
    >
      <div className="mb-7">
        <Stepper step={step} />
      </div>

      {step === 1 && (
        <ServiceStep
          services={servicesQuery.data || []}
          loading={servicesQuery.isLoading}
          value={serviceId}
          onChange={setServiceId}
        />
      )}

      {step === 2 && (
        <DentistDateStep
          dentists={dentistsQuery.data || []}
          dentistId={dentistId}
          onDentistChange={setDentistId}
          date={date}
          onDateChange={setDate}
          slots={slotsQuery.data?.slots ?? null}
          loadingSlots={slotsQuery.isLoading}
          slot={slot}
          onSlotChange={setSlot}
        />
      )}

      {step === 3 && selectedService && selectedDentist && date && (
        <ConfirmStep
          service={selectedService}
          dentist={selectedDentist}
          date={date}
          slot={slot}
          note={note}
          onNoteChange={setNote}
        />
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 1 ? void navigate({ to: "/my/appointments" }) : setStep((step - 1) as Step))}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Huỷ" : "Quay lại"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => canNext && setStep((step + 1) as Step)} disabled={!canNext}>
            Tiếp tục <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => void submit()} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Xác nhận đặt lịch
          </Button>
        )}
      </div>
    </CustomerShell>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEP_LABELS.map((label, index) => {
        const current = (index + 1) as Step;
        const active = step === current;
        const done = step > current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !active && !done && "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : current}
            </div>
            <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {index < STEP_LABELS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function ServiceStep({
  services,
  loading,
  value,
  onChange,
}: {
  services: DentalService[];
  loading: boolean;
  value: string;
  onChange: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton key={item} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const selected = value === service.id;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onChange(service.id)}
            className={cn(
              "rounded-lg border-2 bg-card p-5 text-left transition-all hover:border-primary",
              selected ? "border-primary shadow-[0_18px_60px_-26px_rgba(13,148,136,0.24)]" : "border-border",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">
                {service.category || "Tổng quát"}
              </Badge>
              {selected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            <h3 className="font-bold">{service.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-xs text-muted-foreground">{service.durationMinutes} phút</span>
              <span className="font-bold text-primary">{formatCurrency(service.price)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DentistDateStep({
  dentists,
  dentistId,
  onDentistChange,
  date,
  onDateChange,
  slots,
  loadingSlots,
  slot,
  onSlotChange,
}: {
  dentists: Dentist[];
  dentistId: string;
  onDentistChange: (id: string) => void;
  date?: Date;
  onDateChange: (date?: Date) => void;
  slots: string[] | null;
  loadingSlots: boolean;
  slot: string;
  onSlotChange: (slot: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">1. Chọn nha sĩ</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {dentists.map((dentist) => {
            const selected = dentistId === dentist.id;

            return (
              <button
                key={dentist.id}
                type="button"
                onClick={() => onDentistChange(dentist.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border-2 bg-card p-4 text-left transition-all hover:border-primary",
                  selected ? "border-primary shadow-[0_18px_60px_-26px_rgba(13,148,136,0.24)]" : "border-border",
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                  {dentist.name
                    .split(" ")
                    .slice(-2)
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{dentist.name}</p>
                  <p className="truncate text-xs text-primary">{dentist.specialization}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{dentist.yearsExperience} năm kinh nghiệm</p>
                </div>
                {selected && <Check className="h-5 w-5 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {dentistId && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold">2. Chọn ngày</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chọn ngày hẹn"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  disabled={(day) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return day < today;
                  }}
                  initialFocus
                  locale={vi}
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
            <p className="mt-2 text-xs text-muted-foreground">Không thể đặt ngày trong quá khứ.</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">3. Khung giờ trống</h3>
            {!date && (
              <div className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
                Vui lòng chọn ngày trước
              </div>
            )}
            {date && loadingSlots && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <Skeleton key={item} className="h-9" />
                ))}
              </div>
            )}
            {date && !loadingSlots && slots !== null && slots.length === 0 && (
              <div className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
                Nha sĩ không có lịch trống ngày này. Vui lòng chọn ngày khác.
              </div>
            )}
            {date && !loadingSlots && slots && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((value) => {
                  const selected = slot === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onSlotChange(value)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary hover:text-primary",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmStep({
  service,
  dentist,
  date,
  slot,
  note,
  onNoteChange,
}: {
  service: DentalService;
  dentist: Dentist;
  date: Date;
  slot: string;
  note: string;
  onNoteChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="space-y-4 p-5">
          <h3 className="text-base font-bold">Tóm tắt lịch hẹn</h3>
          <SummaryRow icon={<Stethoscope className="h-4 w-4" />} label="Dịch vụ" value={service.name} sub={service.category || undefined} />
          <SummaryRow icon={<Stethoscope className="h-4 w-4" />} label="Nha sĩ" value={dentist.name} sub={dentist.specialization} />
          <SummaryRow icon={<CalendarIcon className="h-4 w-4" />} label="Ngày hẹn" value={format(date, "EEEE, dd/MM/yyyy", { locale: vi })} />
          <SummaryRow icon={<Clock className="h-4 w-4" />} label="Giờ hẹn" value={slot} sub={`${service.durationMinutes} phút`} />

          <div className="border-t border-border pt-4">
            <label className="mb-2 block text-sm font-medium">Ghi chú triệu chứng</label>
            <Textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Ví dụ: Tôi bị ê buốt răng cửa khi uống nước lạnh..."
              rows={4}
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit border-primary/30 bg-accent/40">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá dự kiến</p>
          <p className="mt-1 text-3xl font-bold text-primary">{formatCurrency(service.price)}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Lịch hẹn sẽ ở trạng thái <strong>Chờ xác nhận</strong>. Lễ tân sẽ liên hệ và gán ghế nha trước giờ hẹn.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
