import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const filesToDelete = [
  "src/hooks/useEquipmentData.js",
  "src/App.jsx",
  "src/AppLayout.jsx",
  "src/router.jsx",
];

filesToDelete.forEach((rel) => {
  const p = path.resolve(__dirname, rel);
  if (fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
    } catch {}
  }
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
