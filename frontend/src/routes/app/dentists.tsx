import { createFileRoute } from "@tanstack/react-router";

import { DentistsPage } from "@/routes/dentists";

export const Route = createFileRoute("/app/dentists")({
  component: DentistsPage,
  head: () => ({ meta: [{ title: "Nha si | DentalPro" }] }),
});
