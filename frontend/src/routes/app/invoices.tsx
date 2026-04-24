import { createFileRoute } from "@tanstack/react-router";

import { InvoicesPage } from "@/routes/invoices";

export const Route = createFileRoute("/app/invoices")({
  component: InvoicesPage,
  head: () => ({ meta: [{ title: "Hoa don | DentalPro" }] }),
});
