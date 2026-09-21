import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ddTrialApiPlugin } from "./vite.dd-api";

/** Dev/preview: /ai → ai.html（本番は vercel.json の rewrite） */
function aiPageRewrite(): Plugin {
  return {
    name: "ai-page-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/ai" || req.url?.startsWith("/ai?")) {
          req.url = req.url.replace(/^\/ai/, "/ai.html");
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/ai" || req.url?.startsWith("/ai?")) {
          req.url = req.url.replace(/^\/ai/, "/ai.html");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ddTrialApiPlugin(), aiPageRewrite()],
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
