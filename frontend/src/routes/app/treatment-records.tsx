import { createFileRoute } from "@tanstack/react-router";

import { TreatmentRecordsPage } from "@/routes/treatment-records";

export const Route = createFileRoute("/app/treatment-records")({
  component: TreatmentRecordsPage,
  head: () => ({ meta: [{ title: "Ho so dieu tri | DentalPro" }] }),
});
