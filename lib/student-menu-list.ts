import {
  IconCalendarEvent,
  IconCertificate,
  IconClipboardCheck,
  IconDashboard,
  IconFileText,
  IconReceipt,
  IconUser,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type Submenu = { href: string; label: string; active?: boolean };

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
  submenus?: Submenu[];
};

type Group = { groupLabel: string; menus: Menu[] };

export function getStudentMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "/student/dashboard",
          label: "Dashboard",
          icon: IconDashboard,
          active: pathname === "/student/dashboard",
        },
        {
          href: "/student/profile",
          label: "My Profile",
          icon: IconUser,
          active: pathname.startsWith("/student/profile"),
        },
        {
          href: "/student/fee-history",
          label: "Fee History",
          icon: IconReceipt,
          active: pathname.startsWith("/student/fee-history"),
        },
      ],
    },
    {
      groupLabel: "Academics",
      menus: [
        
        {
          href: "/student/certificates",
          label: "Certificates",
          icon: IconCertificate,
          active: pathname.startsWith("/student/certificates"),
        },
        {
          href: "/student/schedule",
          label: "Schedule",
          icon: IconCalendarEvent,
          active: pathname.startsWith("/student/schedule"),
        },
      ],
    },
  ];
}
