import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ddTrialApiPlugin } from "./vite.dd-api";

function rewriteToAiHtml(url?: string) {
  if (!url) return url;
  const q = url.indexOf("?");
  const path = q >= 0 ? url.slice(0, q) : url;
  const search = q >= 0 ? url.slice(q) : "";
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (params.get("embed") === "intro" && (path === "/" || path === "/index.html")) {
    return `/ai.html${search}`;
  }
  if (path === "/ai") {
    return `/ai.html${search}`;
  }
  return url;
}

/** Dev/preview: /ai → ai.html（本番は vercel.json の rewrite） */
function aiPageRewrite(): Plugin {
  return {
    name: "ai-page-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewriteToAiHtml(req.url);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewriteToAiHtml(req.url);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ddTrialApiPlugin(), aiPageRewrite()],
  server: { port: 4210, strictPort: true, host: "127.0.0.1" },
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
