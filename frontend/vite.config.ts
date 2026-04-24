import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");

  return {
    envDir: "..",
    server: {
      host: env.VITE_FRONTEND_HOST || "0.0.0.0",
      port: Number(env.VITE_FRONTEND_PORT || 5173),
    },
  };
});
