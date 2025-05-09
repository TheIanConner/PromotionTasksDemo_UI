import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    css: {
      postcss: "./postcss.config.js",
    },
    build: {
      outDir: "build",
    },
    base: "/",
    server: {
      port: 5174,
      strictPort: true, // Don't try other ports if 5174 is taken
    },
    preview: {
      port: 5174,
      strictPort: true, // Don't try other ports if 5174 is taken
    },
  };
});
