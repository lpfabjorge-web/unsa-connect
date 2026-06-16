import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: { functions: 80, lines: 80, branches: 80 },
      include: ["src/lib/free-slots.ts", "src/lib/recommendations.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
