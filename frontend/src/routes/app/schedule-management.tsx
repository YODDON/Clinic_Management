import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Eye,
  Plus,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { CrudFormDialog } from "@/components/common/CrudFormDialog";
import { PageSection } from "@/components/common/PageSection";
import { QueryState } from "@/components/common/QueryState";
import { StatCard } from "@/components/common/StatCard";
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
import { useRoleAccess } from "@/hooks/use-role-access";
import { appointmentsApi, dentistsApi, holidaysApi, patientsApi, shiftsApi } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import type {
  Appointment,
  ClinicHoliday,
  ClinicHolidayPayload,
  Dentist,
  DentistShift,
  DentistShiftPayload,
} from "@/types/api";

type SectionKey =
  | "holidays"
  | "shifts"
  | "roster"
  | "booking"
  | "tracking"
  | "patients";

type SectionItem = {
  key: SectionKey;
  title: string;
  description: string;
};

const sections: SectionItem[] = [
  {
    key: "holidays",
    title: "Thiết lập ngày nghỉ",
    description: "Quản lý ngày nghỉ của phòng khám.",
  },
  {
    key: "shifts",
    title: "Thiết lập ca làm việc",
    description: "Tạo và chỉnh sửa ca làm việc.",
  },
  {
    key: "roster",
    title: "Đăng ký lịch trực bác sĩ",
    description: "Quản lý lịch trực của bác sĩ.",
  },
  {
    key: "booking",
    title: "Đăng ký lịch khám",
    description: "Tạo lịch khám cho bệnh nhân.",
  },
  {
    key: "tracking",
    title: "Theo dõi lịch khám",
    description: "Theo dõi trạng thái lịch khám.",
  },
  {
    key: "patients",
    title: "Quản lý bệnh nhân",
    description: "Quản lý thông tin bệnh nhân.",
  },
];

const holidayFields = [
  { name: "holidayDate", label: "Ngày nghỉ", type: "date" as const, required: true },
  { name: "name", label: "Tên ngày nghỉ", required: true, placeholder: "Ví dụ: Giỗ Tổ Hùng Vương" },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea" as const,
    placeholder: "Ghi chú phạm vi nghỉ hoặc thông báo vận hành",
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
        { label: "Đã lên ca", value: "planned" },
        { label: "Đã hoàn tất", value: "completed" },
        { label: "Nghỉ / off", value: "off" },
      ],
    },
    { name: "notes", label: "Ghi chú", type: "textarea" as const },
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

export const Route = createFileRoute("/app/schedule-management")({
  component: ScheduleManagementPage,
  head: () => ({ meta: [{ title: "Quản lý lịch khám | DentalPro" }] }),
});

function ScheduleManagementPage() {
  const navigate = useNavigate();
  const { can, role } = useRoleAccess();
  const [section, setSection] = useState<SectionKey>("holidays");
  const [editingHoliday, setEditingHoliday] = useState<ClinicHoliday | null>(null);
  const [holidayFormOpen, setHolidayFormOpen] = useState(false);
  const [deleteHoliday, setDeleteHoliday] = useState<ClinicHoliday | null>(null);
  const [editingShift, setEditingShift] = useState<DentistShift | null>(null);
  const [shiftFormOpen, setShiftFormOpen] = useState(false);
  const [deleteShift, setDeleteShift] = useState<DentistShift | null>(null);

  const holidaysQuery = useQuery({
    queryKey: ["clinic-holidays"],
    queryFn: async () => (await holidaysApi.list()).content,
  });
  const shiftsQuery = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => (await shiftsApi.list()).content,
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

  const holidays = holidaysQuery.data || [];
  const shifts = shiftsQuery.data || [];
  const appointments = appointmentsQuery.data || [];
  const patients = patientsQuery.data || [];
  const dentists = dentistsQuery.data || [];

  const holidaySaveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toHolidayPayload(values);
      return editingHoliday
        ? holidaysApi.update(editingHoliday.id, payload)
        : holidaysApi.create(payload as Required<Pick<ClinicHolidayPayload, "holidayDate" | "name">> & ClinicHolidayPayload);
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
        : shiftsApi.create(payload as Required<Pick<DentistShiftPayload, "dentistId" | "shiftDate" | "startTime" | "endTime">> & DentistShiftPayload);
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

  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((item) => item.status === "pending").length;
    const confirmed = appointments.filter((item) => item.status === "confirmed").length;
    const completed = appointments.filter((item) => item.status === "completed").length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  const groupedRoster = useMemo(() => {
    return dentists
      .map((dentist) => ({
        dentist,
        shifts: shifts
          .filter((shift) => shift.dentistId === dentist.id)
          .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate))
          .slice(0, 4),
      }))
      .filter((item) => item.shifts.length > 0);
  }, [dentists, shifts]);

  const recentAppointments = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
        .slice(0, 8),
    [appointments],
  );

  const recentPatients = useMemo(() => patients.slice(0, 8), [patients]);
  const selectedSection = sections.find((item) => item.key === section) || sections[0];
  const canManageShiftRows = can("shifts.update") || can("shifts.delete");

  return (
    <AppShell
      title="Quản lý lịch khám"
      allowedRoles={["admin", "dentist"]}
      actions={
        section === "holidays" && can("holidays.write") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingHoliday(null);
              setHolidayFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm ngày nghỉ
          </Button>
        ) : section === "shifts" && can("shifts.create") ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingShift(null);
              setShiftFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm ca làm việc
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)]">
          <CardContent className="space-y-3">
            {sections.map((item) => {
              const active = item.key === section;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-sky-500 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => setSection(item.key)}
                >
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-[radial-gradient(circle_at_top_left,#eff8ff_0,#ffffff_50%,#f8fafc_100%)]">
            <CardHeader>
              <CardTitle className="text-xl">{selectedSection.title}</CardTitle>
              <CardDescription>{selectedSection.description}</CardDescription>
            </CardHeader>
          </Card>

          {section === "holidays" && (
            <PageSection
              title="Danh sách ngày nghỉ của phòng khám"
              description="Ngày nghỉ lễ có hiệu lực toàn hệ thống và sẽ chặn luồng đặt lịch."
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
                      {canManageShiftRows && <TableHead className="text-right">Thao tác</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>{formatDate(holiday.holidayDate)}</TableCell>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{holiday.description || "Không có"}</TableCell>
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
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </QueryState>
            </PageSection>
          )}

          {section === "shifts" && (
            <PageSection
              title="Ca làm việc"
              description="Trạng thái ca đã được chuẩn hóa lại theo backend: planned, completed, off."
              actions={
                <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/app/shifts" })}>
                  Mở trang chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            >
              <QueryState
                isLoading={shiftsQuery.isLoading}
                error={shiftsQuery.error}
                isEmpty={shifts.length === 0}
                emptyIcon={CalendarClock}
                emptyTitle="Chưa có ca làm việc"
                emptyDescription="Danh sách ca làm việc sẽ hiển thị tại đây."
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
                    {shifts.slice(0, 10).map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{formatDate(shift.shiftDate)}</TableCell>
                        <TableCell>{shift.dentistName}</TableCell>
                        <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
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
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
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

          {section === "roster" && (
            <div className="grid gap-4 xl:grid-cols-2">
              {groupedRoster.map(({ dentist, shifts: dentistShifts }) => (
                <Card key={dentist.id} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Stethoscope className="h-4 w-4" /> {dentist.name}
                    </CardTitle>
                    <CardDescription>{dentist.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dentistShifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <div className="font-medium">{formatDate(shift.shiftDate)}</div>
                          <div className="text-sm text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                        <StatusBadge value={shift.status} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === "booking" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Tổng lịch hẹn" value={String(appointmentStats.total)} icon={CalendarDays} />
                <StatCard label="Chờ xác nhận" value={String(appointmentStats.pending)} icon={CalendarDays} tone="warning" />
                <StatCard label="Đã xác nhận" value={String(appointmentStats.confirmed)} icon={CalendarDays} tone="success" />
              </div>
              <PageSection
                title="Đăng ký lịch khám của bệnh nhân"
                description={role === "admin" ? "Admin có thể mở ngay trang lịch hẹn đầy đủ để tạo mới." : "Bác sĩ xem nhanh tình hình đặt lịch hiện tại."}
                actions={
                  <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/app/appointments" })}>
                    Mở trang lịch hẹn <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              >
                <QueryState
                  isLoading={appointmentsQuery.isLoading}
                  error={appointmentsQuery.error}
                  isEmpty={recentAppointments.length === 0}
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
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                          <TableCell>{appointment.appointmentType}</TableCell>
                          <TableCell><StatusBadge value={appointment.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </QueryState>
              </PageSection>
            </>
          )}

          {section === "tracking" && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Tổng lịch" value={String(appointmentStats.total)} icon={ClipboardList} />
                <StatCard label="Pending" value={String(appointmentStats.pending)} icon={ClipboardList} tone="warning" />
                <StatCard label="Confirmed" value={String(appointmentStats.confirmed)} icon={ClipboardList} tone="success" />
                <StatCard label="Completed" value={String(appointmentStats.completed)} icon={ClipboardList} />
              </div>
              <PageSection
                title="Theo dõi lịch khám"
                description="Bảng này giúp rà nhanh lịch chờ xác nhận, đang xử lý và đã hoàn tất."
                actions={
                  <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/app/appointments" })}>
                    Xử lý tại trang lịch hẹn <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              >
                <QueryState
                  isLoading={appointmentsQuery.isLoading}
                  error={appointmentsQuery.error}
                  isEmpty={recentAppointments.length === 0}
                  emptyIcon={ClipboardList}
                  emptyTitle="Chưa có dữ liệu theo dõi"
                  emptyDescription="Khi có lịch hẹn, trạng thái sẽ hiển thị tại đây."
                  onRetry={() => appointmentsQuery.refetch()}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bệnh nhân</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Bác sĩ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                          <TableCell>{appointment.dentistName || "Chưa phân công"}</TableCell>
                          <TableCell><StatusBadge value={appointment.status} /></TableCell>
                          <TableCell>{appointment.notes || "Không có"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </QueryState>
              </PageSection>
            </>
          )}

          {section === "patients" && (
            <PageSection
              title="Quản lý bệnh nhân"
              description="Hiển thị nhanh bệnh nhân hiện có và mở sang trang quản lý đầy đủ khi cần."
              actions={
                <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/app/patients" })}>
                  Mở trang bệnh nhân <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            >
              <QueryState
                isLoading={patientsQuery.isLoading}
                error={patientsQuery.error}
                isEmpty={recentPatients.length === 0}
                emptyIcon={UserRound}
                emptyTitle="Chưa có bệnh nhân"
                emptyDescription="Dữ liệu bệnh nhân sẽ hiển thị ở đây."
                onRetry={() => patientsQuery.refetch()}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Mở</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{formatDate(patient.dob)}</TableCell>
                        <TableCell><StatusBadge value={patient.active} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/app/patients" })}>
                            <Eye className="mr-2 h-4 w-4" /> Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </QueryState>
            </PageSection>
          )}
        </div>
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
          onSubmit={async (values) => holidaySaveMutation.mutateAsync(values)}
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
          onSubmit={async (values) => shiftSaveMutation.mutateAsync(values)}
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
    </AppShell>
  );
}
