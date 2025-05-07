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
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5110",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
