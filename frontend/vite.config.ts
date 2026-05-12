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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@tanstack")) return "tanstack";
              if (id.includes("@radix-ui")) return "radix";
              if (id.includes("recharts")) return "charts";
              if (id.includes("react-day-picker") || id.includes("date-fns")) return "calendar";
              if (id.includes("lucide-react")) return "icons";
              return "vendor";
            }
          },
        },
      },
    },
  };
});
