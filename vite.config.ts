import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ddTrialApiPlugin } from "./vite.dd-api";

export default defineConfig({
  plugins: [react(), ddTrialApiPlugin()],
  resolve: {
    alias: {
      "@ai-demo": path.resolve(__dirname, "src/vendor/ai-demo"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ai: path.resolve(__dirname, "ai.html"),
      },
    },
  },
});
