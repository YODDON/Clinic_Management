import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my/appointments")({
  component: AppointmentsLayout,
});

function AppointmentsLayout() {
  return <Outlet />;
}
