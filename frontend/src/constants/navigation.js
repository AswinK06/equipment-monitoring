import { LayoutGrid, Bell } from "lucide-react";

export const navigationItems = [
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
