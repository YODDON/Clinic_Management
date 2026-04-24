import { createFileRoute } from "@tanstack/react-router";

import { PatientsPage } from "@/routes/patients";

export const Route = createFileRoute("/app/patients")({
  component: PatientsPage,
  head: () => ({ meta: [{ title: "Benh nhan | DentalPro" }] }),
});
