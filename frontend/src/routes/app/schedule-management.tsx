import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { ClientPagination } from "@/components/common/ClientPagination";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoleAccess } from "@/hooks/use-role-access";
import {
  appointmentsApi,
  dentistsApi,
  dutiesApi,
  holidaysApi,
  patientsApi,
  shiftsApi,
} from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  Appointment,
  ClinicHoliday,
  ClinicHolidayPayload,
  Dentist,
  DentistDuty,
  DentistDutyPayload,
  DentistShift,
  DentistShiftPayload,
  Patient,
} from "@/types/api";

type SectionKey = "holidays" | "shifts" | "roster" | "booking" | "tracking" | "patients";

const sections: SectionKey[] = ["holidays", "shifts", "roster", "booking", "tracking", "patients"];
const defaultSection: SectionKey = "holidays";
const shiftPageSize = 10;
const appointmentPageSize = 8;
const patientPageSize = 8;

const holidayFields = [
  { name: "holidayDate", label: "Ngày nghỉ", type: "date" as const, required: true },
  { name: "name", label: "Tên ngày nghỉ", required: true, placeholder: "Ví dụ: Nghỉ lễ quốc gia" },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea" as const,
    placeholder: "Ghi chú thêm nếu cần",
  },
];

function buildShiftFields(dentists: Dentist[]) {
  return [
    {
      name: "dentistId",
      label: "Bác sĩ",
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
        { label: "Dự kiến", value: "planned" },
        { label: "Hoàn tất", value: "completed" },
        { label: "Nghỉ", value: "off" },
      ],
    },
    { name: "notes", label: "Ghi chú", type: "textarea" as const },
  ];
}

function buildDutyFields(dentists: Dentist[], hasSelectedDate: boolean) {
  return [
    { name: "dutyDate", label: "Ngày trực", type: "date" as const, required: true },
    {
      name: "dentistId",
      label: "Bác sĩ trực chính",
      type: "select" as const,
      required: true,
      options: dentists.map((dentist) => ({ label: dentist.name, value: dentist.id })),
      description: hasSelectedDate
        ? "Chỉ hiển thị các bác sĩ có ca làm việc trong ngày đã chọn."
        : "Hãy chọn ngày trực trước, sau đó hệ thống sẽ lọc bác sĩ đang có ca làm việc.",
    },
    {
      name: "notes",
      label: "Ghi chú",
      type: "textarea" as const,
      placeholder: "Ví dụ: phụ trách tiếp nhận bệnh nhân vãng lai hoặc bàn giao cuối ngày",
    },
  ];
}

function toHolidayValues(holiday?: ClinicHoliday) {
  return {
    holidayDate: holiday?.holidayDate?.slice(0, 10) ?? "",
    name: holiday?.name ?? "",
    description: holiday?.description ?? "",
  };
}

function toHolidayPayload(values: Record<string, string>): ClinicHolidayPayload {
  return {
    holidayDate: values.holidayDate,
    name: values.name,
    description: values.description || null,
  };
}

function toShiftValues(shift?: DentistShift) {
  return {
    dentistId: shift?.dentistId ?? "",
    shiftDate: shift?.shiftDate?.slice(0, 10) ?? "",
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

function toDutyValues(duty?: DentistDuty) {
  return {
    dutyDate: duty?.dutyDate?.slice(0, 10) ?? "",
    dentistId: duty?.dentistId ?? "",
    notes: duty?.notes ?? "",
  };
}

function toDutyPayload(values: Record<string, string>): DentistDutyPayload {
  return {
    dutyDate: values.dutyDate,
    dentistId: values.dentistId,
    notes: values.notes || null,
  };
}

function getTodayDateValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function shiftDateByDays(dateValue: string, amount: number) {
  const base = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  base.setDate(base.getDate() + amount);
  const local = new Date(base.getTime() - base.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/app/schedule-management")({
  validateSearch: (search: Record<string, unknown>) => {
    const section =
      typeof search.section === "string" && sections.includes(search.section as SectionKey)
        ? (search.section as SectionKey)
        : defaultSection;

    return { section };
  },
  component: ScheduleManagementPage,
  head: () => ({ meta: [{ title: "Quản lý lịch khám | DentalPro" }] }),
});

function ScheduleManagementPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { can } = useRoleAccess();
  const section = search.section;

  const [editingHoliday, setEditingHoliday] = useState<ClinicHoliday | null>(null);
  const [holidayFormOpen, setHolidayFormOpen] = useState(false);
  const [deleteHoliday, setDeleteHoliday] = useState<ClinicHoliday | null>(null);

  const [editingShift, setEditingShift] = useState<DentistShift | null>(null);
  const [shiftFormOpen, setShiftFormOpen] = useState(false);
  const [deleteShift, setDeleteShift] = useState<DentistShift | null>(null);
  const [shiftFilterDate, setShiftFilterDate] = useState(getTodayDateValue);
  const [shiftPage, setShiftPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [trackingPage, setTrackingPage] = useState(1);
  const [patientPage, setPatientPage] = useState(1);

  const [editingDuty, setEditingDuty] = useState<DentistDuty | null>(null);
  const [dutyFormOpen, setDutyFormOpen] = useState(false);
  const [deleteDuty, setDeleteDuty] = useState<DentistDuty | null>(null);
  const [dutyFormValues, setDutyFormValues] = useState<Record<string, string>>(toDutyValues());

  const holidaysQuery = useQuery({
    queryKey: ["clinic-holidays"],
    queryFn: async () => (await holidaysApi.list()).content,
  });
  const shiftsQuery = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => (await shiftsApi.list()).content,
  });
  const dutiesQuery = useQuery({
    queryKey: ["dentist-duties"],
    queryFn: async () => (await dutiesApi.list()).content,
  });
  const dentistsQuery = useQuery({
    queryKey: ["dentists", "options"],
    queryFn: async () => (await dentistsApi.list()).content,
  });
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await appointmentsApi.list()).content,
  });
  const patientsQuery = useQuery({
    queryKey: ["patients", "schedule-preview"],
    queryFn: async () => (await patientsApi.list()).content,
  });

  const holidays = useMemo(() => holidaysQuery.data ?? [], [holidaysQuery.data]);
  const shifts = useMemo(() => shiftsQuery.data ?? [], [shiftsQuery.data]);
  const duties = useMemo(() => dutiesQuery.data ?? [], [dutiesQuery.data]);
  const dentists = useMemo(() => dentistsQuery.data ?? [], [dentistsQuery.data]);
  const appointments = useMemo(() => appointmentsQuery.data ?? [], [appointmentsQuery.data]);
  const patients = useMemo(() => patientsQuery.data ?? [], [patientsQuery.data]);

  const holidaySaveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toHolidayPayload(values);
      return editingHoliday
        ? holidaysApi.update(editingHoliday.id, payload)
        : holidaysApi.create(
            payload as Required<Pick<ClinicHolidayPayload, "holidayDate" | "name">> &
              ClinicHolidayPayload,
          );
    },
    onSuccess: async () => {
      toast.success(editingHoliday ? "Đã cập nhật ngày nghỉ" : "Đã thêm ngày nghỉ");
      setHolidayFormOpen(false);
      setEditingHoliday(null);
      await queryClient.invalidateQueries({ queryKey: ["clinic-holidays"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const holidayDeleteMutation = useMutation({
    mutationFn: async (holidayId: string) => holidaysApi.delete(holidayId),
    onSuccess: async () => {
      toast.success("Đã xóa ngày nghỉ");
      setDeleteHoliday(null);
      await queryClient.invalidateQueries({ queryKey: ["clinic-holidays"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const shiftSaveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toShiftPayload(values);
      return editingShift
        ? shiftsApi.update(editingShift.id, payload)
        : shiftsApi.create(
            payload as Required<
              Pick<DentistShiftPayload, "dentistId" | "shiftDate" | "startTime" | "endTime">
            > &
              DentistShiftPayload,
          );
    },
    onSuccess: async () => {
      toast.success(editingShift ? "Đã cập nhật ca làm việc" : "Đã tạo ca làm việc");
      setShiftFormOpen(false);
      setEditingShift(null);
      await queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const shiftDeleteMutation = useMutation({
    mutationFn: async (shiftId: string) => shiftsApi.delete(shiftId),
    onSuccess: async () => {
      toast.success("Đã xóa ca làm việc");
      setDeleteShift(null);
      await queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dutySaveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toDutyPayload(values);
      return editingDuty
        ? dutiesApi.update(editingDuty.id, payload)
        : dutiesApi.create(
            payload as Required<Pick<DentistDutyPayload, "dutyDate" | "dentistId">> &
              DentistDutyPayload,
          );
    },
    onSuccess: async () => {
      toast.success(editingDuty ? "Đã cập nhật lịch trực" : "Đã tạo lịch trực");
      setDutyFormOpen(false);
      setEditingDuty(null);
      await queryClient.invalidateQueries({ queryKey: ["dentist-duties"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dutyDeleteMutation = useMutation({
    mutationFn: async (dutyId: string) => dutiesApi.delete(dutyId),
    onSuccess: async () => {
      toast.success("Đã xóa lịch trực");
      setDeleteDuty(null);
      await queryClient.invalidateQueries({ queryKey: ["dentist-duties"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((item) => item.status === "pending").length;
    const confirmed = appointments.filter((item) => item.status === "confirmed").length;
    const completed = appointments.filter((item) => item.status === "completed").length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  const appointmentRows = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
        .slice(0, 50),
    [appointments],
  );

  const patientRows = useMemo(() => patients.slice(0, 50), [patients]);
  const rosterRows = useMemo(
    () => [...duties].sort((a, b) => a.dutyDate.localeCompare(b.dutyDate)),
    [duties],
  );

  const eligibleDutyDentists = useMemo(() => {
    if (!dutyFormValues.dutyDate) {
      return [];
    }

    const dentistIds = new Set(
      shifts
        .filter(
          (shift) =>
            shift.shiftDate.slice(0, 10) === dutyFormValues.dutyDate && shift.status !== "off",
        )
        .map((shift) => shift.dentistId),
    );

    return dentists.filter((dentist) => dentistIds.has(dentist.id));
  }, [dentists, dutyFormValues.dutyDate, shifts]);

  useEffect(() => {
    if (!dutyFormOpen || !dutyFormValues.dentistId) {
      return;
    }

    const isStillEligible = eligibleDutyDentists.some(
      (dentist) => dentist.id === dutyFormValues.dentistId,
    );
    if (!isStillEligible) {
      setDutyFormValues((current) => ({ ...current, dentistId: "" }));
    }
  }, [dutyFormOpen, dutyFormValues.dentistId, eligibleDutyDentists]);

  const shiftRows = useMemo(
    () =>
      shifts
        .filter((shift) => shift.shiftDate.slice(0, 10) === shiftFilterDate)
        .sort((a, b) => {
          const nameCompare = a.dentistName.localeCompare(b.dentistName);
          if (nameCompare !== 0) return nameCompare;
          return a.startTime.localeCompare(b.startTime);
        }),
    [shiftFilterDate, shifts],
  );

  const shiftTotalPages = Math.max(1, Math.ceil(shiftRows.length / shiftPageSize));
  const paginatedShiftRows = useMemo(
    () => shiftRows.slice((shiftPage - 1) * shiftPageSize, shiftPage * shiftPageSize),
    [shiftPage, shiftRows],
  );
  const bookingTotalPages = Math.max(1, Math.ceil(appointmentRows.length / appointmentPageSize));
  const paginatedBookingRows = useMemo(
    () =>
      appointmentRows.slice(
        (bookingPage - 1) * appointmentPageSize,
        bookingPage * appointmentPageSize,
      ),
    [appointmentRows, bookingPage],
  );
  const trackingTotalPages = Math.max(1, Math.ceil(appointmentRows.length / appointmentPageSize));
  const paginatedTrackingRows = useMemo(
    () =>
      appointmentRows.slice(
        (trackingPage - 1) * appointmentPageSize,
        trackingPage * appointmentPageSize,
      ),
    [appointmentRows, trackingPage],
  );
  const patientTotalPages = Math.max(1, Math.ceil(patientRows.length / patientPageSize));
  const paginatedPatientRows = useMemo(
    () => patientRows.slice((patientPage - 1) * patientPageSize, patientPage * patientPageSize),
    [patientPage, patientRows],
  );

  useEffect(() => {
    setShiftPage(1);
  }, [shiftFilterDate]);

  useEffect(() => {
    if (shiftPage > shiftTotalPages) {
      setShiftPage(shiftTotalPages);
    }
  }, [shiftPage, shiftTotalPages]);
  useEffect(() => {
    if (bookingPage > bookingTotalPages) {
      setBookingPage(bookingTotalPages);
    }
  }, [bookingPage, bookingTotalPages]);
  useEffect(() => {
    if (trackingPage > trackingTotalPages) {
      setTrackingPage(trackingTotalPages);
    }
  }, [trackingPage, trackingTotalPages]);
  useEffect(() => {
    if (patientPage > patientTotalPages) {
      setPatientPage(patientTotalPages);
    }
  }, [patientPage, patientTotalPages]);

  const canManageHolidayRows = can("holidays.write") || can("holidays.delete");
  const canManageShiftRows = can("shifts.update") || can("shifts.delete");
  const canManageDutyRows = can("duties.update") || can("duties.delete");

  return (
    <AppShell title="Quản lý lịch khám" allowedRoles={["admin", "dentist"]}>
      <div className="space-y-6">
        {section === "holidays" && (
          <PageSection
            title="Thiết lập ngày nghỉ"
            actions={
              can("holidays.write") ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingHoliday(null);
                    setHolidayFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm ngày nghỉ
                </Button>
              ) : undefined
            }
          >
            <QueryState
              isLoading={holidaysQuery.isLoading}
              error={holidaysQuery.error}
              isEmpty={holidays.length === 0}
              emptyIcon={CalendarDays}
              emptyTitle="Chưa có ngày nghỉ"
              emptyDescription="Khi admin thêm ngày nghỉ, danh sách sẽ hiển thị tại đây."
              onRetry={() => holidaysQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày nghỉ</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mô tả</TableHead>
                    {canManageHolidayRows && <TableHead className="text-right">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>{formatDate(holiday.holidayDate)}</TableCell>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{holiday.description || "Không có"}</TableCell>
                      {canManageHolidayRows && (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {can("holidays.write") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingHoliday(holiday);
                                  setHolidayFormOpen(true);
                                }}
                              >
                                Chỉnh sửa
                              </Button>
                            )}
                            {can("holidays.delete") && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteHoliday(holiday)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </QueryState>
          </PageSection>
        )}

        {section === "shifts" && (
          <PageSection
            title="Thiết lập ca làm việc"
            actions={
              can("shifts.create") ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingShift(null);
                    setShiftFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm ca làm việc
                </Button>
              ) : undefined
            }
          >
            <div className="mb-4 flex flex-col gap-3">
              <div className="w-full max-w-xs space-y-2">
                <div className="text-sm font-medium text-slate-700">Lọc theo ngày</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShiftFilterDate((current) => shiftDateByDays(current, -1))}
                    aria-label="Lùi 1 ngày"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="date"
                    value={shiftFilterDate}
                    onChange={(event) => setShiftFilterDate(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShiftFilterDate((current) => shiftDateByDays(current, 1))}
                    aria-label="Tới 1 ngày"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mặc định đang ưu tiên hiển thị toàn bộ bác sĩ có ca làm việc hôm nay.
                </p>
              </div>
            </div>
            <QueryState
              isLoading={shiftsQuery.isLoading}
              error={shiftsQuery.error}
              isEmpty={shiftRows.length === 0}
              emptyIcon={CalendarClock}
              emptyTitle="Không có ca làm việc trong ngày này"
              emptyDescription="Hãy chọn một ngày khác để xem bác sĩ nào đang có ca làm việc."
              onRetry={() => shiftsQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    {canManageShiftRows && <TableHead className="text-right">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedShiftRows.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{formatDate(shift.shiftDate)}</TableCell>
                      <TableCell>{shift.dentistName}</TableCell>
                      <TableCell>
                        {shift.startTime} - {shift.endTime}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={shift.status} />
                      </TableCell>
                      <TableCell>{shift.notes || "Không có"}</TableCell>
                      {canManageShiftRows && (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {can("shifts.update") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingShift(shift);
                                  setShiftFormOpen(true);
                                }}
                              >
                                Chỉnh sửa
                              </Button>
                            )}
                            {can("shifts.delete") && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteShift(shift)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ClientPagination
                page={shiftPage}
                totalItems={shiftRows.length}
                pageSize={shiftPageSize}
                onPageChange={setShiftPage}
              />
            </QueryState>
          </PageSection>
        )}

        {section === "roster" && (
          <PageSection
            title="Đăng ký lịch trực bác sĩ"
            actions={
              can("duties.create") ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDuty(null);
                    setDutyFormValues(toDutyValues());
                    setDutyFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm lịch trực
                </Button>
              ) : undefined
            }
          >
            <QueryState
              isLoading={dutiesQuery.isLoading || shiftsQuery.isLoading}
              error={dutiesQuery.error || shiftsQuery.error}
              isEmpty={rosterRows.length === 0}
              emptyIcon={ShieldCheck}
              emptyTitle="Chưa có lịch trực"
              emptyDescription="Khi admin phân công bác sĩ trực chính, danh sách sẽ hiển thị tại đây."
              onRetry={() => {
                void dutiesQuery.refetch();
                void shiftsQuery.refetch();
              }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày trực</TableHead>
                    <TableHead>Bác sĩ trực chính</TableHead>
                    <TableHead>Chuyên môn</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    {canManageDutyRows && <TableHead className="text-right">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rosterRows.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{formatDate(duty.dutyDate)}</TableCell>
                      <TableCell className="font-medium">{duty.dentistName}</TableCell>
                      <TableCell>{duty.specialization || "Không có"}</TableCell>
                      <TableCell>{duty.notes || "Không có"}</TableCell>
                      {canManageDutyRows && (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {can("duties.update") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingDuty(duty);
                                  setDutyFormValues(toDutyValues(duty));
                                  setDutyFormOpen(true);
                                }}
                              >
                                Chỉnh sửa
                              </Button>
                            )}
                            {can("duties.delete") && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteDuty(duty)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </QueryState>
          </PageSection>
        )}

        {section === "booking" && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Tổng lịch hẹn"
                value={String(appointmentStats.total)}
                icon={CalendarDays}
              />
              <StatCard
                label="Chờ xác nhận"
                value={String(appointmentStats.pending)}
                icon={CalendarDays}
                tone="warning"
              />
              <StatCard
                label="Đã xác nhận"
                value={String(appointmentStats.confirmed)}
                icon={CalendarDays}
                tone="success"
              />
            </div>
            <PageSection title="Đăng ký lịch khám">
              <QueryState
                isLoading={appointmentsQuery.isLoading}
                error={appointmentsQuery.error}
                isEmpty={appointmentRows.length === 0}
                emptyIcon={CalendarDays}
                emptyTitle="Chưa có lịch khám"
                emptyDescription="Lịch khám mới sẽ xuất hiện tại đây."
                onRetry={() => appointmentsQuery.refetch()}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Bệnh nhân</TableHead>
                      <TableHead>Bác sĩ</TableHead>
                      <TableHead>Loại lịch</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookingRows.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                        <TableCell>{appointment.appointmentType}</TableCell>
                        <TableCell>
                          <StatusBadge value={appointment.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ClientPagination
                  page={bookingPage}
                  totalItems={appointmentRows.length}
                  pageSize={appointmentPageSize}
                  onPageChange={setBookingPage}
                />
              </QueryState>
            </PageSection>
          </>
        )}

        {section === "tracking" && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Tổng lịch"
                value={String(appointmentStats.total)}
                icon={ClipboardList}
              />
              <StatCard
                label="Chờ xác nhận"
                value={String(appointmentStats.pending)}
                icon={ClipboardList}
                tone="warning"
              />
              <StatCard
                label="Đã xác nhận"
                value={String(appointmentStats.confirmed)}
                icon={ClipboardList}
                tone="success"
              />
              <StatCard
                label="Hoàn tất"
                value={String(appointmentStats.completed)}
                icon={ClipboardList}
              />
            </div>
            <PageSection title="Theo dõi lịch khám">
              <QueryState
                isLoading={appointmentsQuery.isLoading}
                error={appointmentsQuery.error}
                isEmpty={appointmentRows.length === 0}
                emptyIcon={ClipboardList}
                emptyTitle="Chưa có dữ liệu theo dõi"
                emptyDescription="Khi có lịch hẹn, trạng thái sẽ hiển thị tại đây."
                onRetry={() => appointmentsQuery.refetch()}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bệnh nhân</TableHead>
                      <TableHead>Bác sĩ</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTrackingRows.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                        <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                        <TableCell>
                          <StatusBadge value={appointment.status} />
                        </TableCell>
                        <TableCell>{appointment.notes || "Không có"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ClientPagination
                  page={trackingPage}
                  totalItems={appointmentRows.length}
                  pageSize={appointmentPageSize}
                  onPageChange={setTrackingPage}
                />
              </QueryState>
            </PageSection>
          </>
        )}

        {section === "patients" && (
          <PageSection title="Quản lý bệnh nhân">
            <QueryState
              isLoading={patientsQuery.isLoading}
              error={patientsQuery.error}
              isEmpty={patientRows.length === 0}
              emptyIcon={UserRound}
              emptyTitle="Chưa có bệnh nhân"
              emptyDescription="Danh sách bệnh nhân sẽ hiển thị tại đây."
              onRetry={() => patientsQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatientRows.map((patient: Patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.gender || "Không có"}</TableCell>
                      <TableCell>{patient.phone || "Không có"}</TableCell>
                      <TableCell>{patient.active ? "Đang hoạt động" : "Ngừng hoạt động"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ClientPagination
                page={patientPage}
                totalItems={patientRows.length}
                pageSize={patientPageSize}
                onPageChange={setPatientPage}
              />
            </QueryState>
          </PageSection>
        )}
      </div>

      {can("holidays.write") && (
        <CrudFormDialog
          open={holidayFormOpen}
          onOpenChange={(open) => {
            setHolidayFormOpen(open);
            if (!open) setEditingHoliday(null);
          }}
          title={editingHoliday ? "Cập nhật ngày nghỉ" : "Thêm ngày nghỉ"}
          description="Ngày nghỉ có hiệu lực toàn phòng khám và sẽ chặn đặt lịch trong ngày đó."
          fields={holidayFields}
          initialValues={toHolidayValues(editingHoliday || undefined)}
          submitLabel={editingHoliday ? "Lưu thay đổi" : "Tạo ngày nghỉ"}
          pending={holidaySaveMutation.isPending}
          onSubmit={async (values) => {
            await holidaySaveMutation.mutateAsync(values);
          }}
        />
      )}

      {can("holidays.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteHoliday)}
          onOpenChange={(open) => !open && setDeleteHoliday(null)}
          title="Xóa ngày nghỉ"
          description={`Bạn có chắc muốn xóa ngày nghỉ "${deleteHoliday?.name}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={holidayDeleteMutation.isPending}
          onConfirm={async () => {
            if (deleteHoliday) {
              await holidayDeleteMutation.mutateAsync(deleteHoliday.id);
            }
          }}
        />
      )}

      {can("shifts.create") && (
        <CrudFormDialog
          open={shiftFormOpen}
          onOpenChange={(open) => {
            setShiftFormOpen(open);
            if (!open) setEditingShift(null);
          }}
          title={editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc"}
          description="Ca làm việc hỗ trợ 3 trạng thái chuẩn: planned, completed và off."
          fields={buildShiftFields(dentists)}
          initialValues={toShiftValues(editingShift || undefined)}
          submitLabel={editingShift ? "Lưu thay đổi" : "Tạo ca"}
          pending={shiftSaveMutation.isPending}
          onSubmit={async (values) => {
            await shiftSaveMutation.mutateAsync(values);
          }}
        />
      )}

      {can("shifts.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteShift)}
          onOpenChange={(open) => !open && setDeleteShift(null)}
          title="Xóa ca làm việc"
          description={`Bạn có chắc muốn xóa ca của "${deleteShift?.dentistName}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={shiftDeleteMutation.isPending}
          onConfirm={async () => {
            if (deleteShift) {
              await shiftDeleteMutation.mutateAsync(deleteShift.id);
            }
          }}
        />
      )}

      {can("duties.create") && (
        <CrudFormDialog
          open={dutyFormOpen}
          onOpenChange={(open) => {
            setDutyFormOpen(open);
            if (!open) {
              setEditingDuty(null);
              setDutyFormValues(toDutyValues());
            }
          }}
          title={editingDuty ? "Cập nhật lịch trực" : "Thêm lịch trực"}
          description="Lịch trực xác định bác sĩ chịu trách nhiệm chính trong ngày, và bác sĩ đó phải có ca làm việc."
          fields={buildDutyFields(eligibleDutyDentists, Boolean(dutyFormValues.dutyDate))}
          initialValues={toDutyValues(editingDuty || undefined)}
          values={dutyFormValues}
          onValuesChange={setDutyFormValues}
          submitLabel={editingDuty ? "Lưu thay đổi" : "Tạo lịch trực"}
          pending={dutySaveMutation.isPending}
          onSubmit={async (values) => {
            await dutySaveMutation.mutateAsync(values);
          }}
        />
      )}

      {can("duties.delete") && (
        <ConfirmActionDialog
          open={Boolean(deleteDuty)}
          onOpenChange={(open) => !open && setDeleteDuty(null)}
          title="Xóa lịch trực"
          description={`Bạn có chắc muốn xóa lịch trực của "${deleteDuty?.dentistName}" không?`}
          actionLabel="Xóa"
          variant="destructive"
          pending={dutyDeleteMutation.isPending}
          onConfirm={async () => {
            if (deleteDuty) {
              await dutyDeleteMutation.mutateAsync(deleteDuty.id);
            }
          }}
        />
      )}
    </AppShell>
  );
}
