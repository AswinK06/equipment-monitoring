import { LayoutGrid, Bell } from "lucide-react";

export const NAVIGATION_ITEMS = [
  {
    label: "Equipment",
    to: "/",
    icon: LayoutGrid,
    end: true,
  },
  {
    label: "Active alerts",
    to: "/alerts",
    icon: Bell,
    end: false,
  },
];
