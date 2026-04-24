import { createFileRoute } from "@tanstack/react-router";

import { ShiftsPage } from "@/routes/shifts";

export const Route = createFileRoute("/app/shifts")({
  component: ShiftsPage,
  head: () => ({ meta: [{ title: "Ca truc | DentalPro" }] }),
});
