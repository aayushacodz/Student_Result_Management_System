import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ command }) => ({
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    ...tanstackStart({ server: { entry: "server" } }),
    ...(command === "build" ? [(await import("nitro/vite")).nitro({ defaultPreset: "cloudflare-module" })] : []),
    react(),
  ],
}));
