import { createFileRoute } from "@tanstack/react-router";

import { ServicesPage } from "@/routes/services";

export const Route = createFileRoute("/app/services")({
  component: ServicesPage,
  head: () => ({ meta: [{ title: "Dich vu | DentalPro" }] }),
});
