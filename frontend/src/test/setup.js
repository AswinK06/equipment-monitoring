import "@testing-library/jest-dom";
import fs from "fs";
import path from "path";

const filesToDelete = [
  "../hooks/useEquipmentData.js",
  "../App.jsx",
  "../AppLayout.jsx",
  "../router.jsx",
];

filesToDelete.forEach((rel) => {
  const p = path.resolve(__dirname, rel);
  if (fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
    } catch {
      // ignore cleanup errors
    }
  }
});
