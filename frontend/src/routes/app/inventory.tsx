import { createFileRoute } from "@tanstack/react-router";

import { InventoryPage } from "@/routes/inventory";

export const Route = createFileRoute("/app/inventory")({
  component: InventoryPage,
  head: () => ({ meta: [{ title: "Kho vat tu | DentalPro" }] }),
});
