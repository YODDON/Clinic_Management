import { createFileRoute } from "@tanstack/react-router";

import { StaffDashboardPage } from "@/pages/staff/DashboardPage";

export const Route = createFileRoute("/app/")({
  component: StaffDashboardPage,
  head: () => ({ meta: [{ title: "Tong quan | DentalPro" }] }),
});
