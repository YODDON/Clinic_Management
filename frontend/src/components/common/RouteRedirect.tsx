import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function RouteRedirect({ to }: { to: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: to as never });
  }, [navigate, to]);

  return null;
}
