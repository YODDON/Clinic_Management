import { createFileRoute } from "@tanstack/react-router";

import { AppointmentsPage } from "@/routes/appointments";

export const Route = createFileRoute("/app/appointments")({
  component: AppointmentsPage,
  head: () => ({ meta: [{ title: "Lich hen | DentalPro" }] }),
});
