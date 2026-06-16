import {
  IconBook,
  IconBook2,
  IconCalendarEvent,
  IconClipboardCheck,
  IconFileText,
  IconHierarchy2,
  IconSchool,
  IconUserCheck,
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

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Academic Setup",
      menus: [
        {
          href: "/college",
          label: "Colleges",
          icon: IconSchool,
          active: pathname.startsWith("/college"),
        },
        {
          href: "/department",
          label: "Departments",
          icon: IconHierarchy2,
          active: pathname.startsWith("/department"),
        },
        {
          href: "/course",
          label: "Courses",
          icon: IconBook,
          active: pathname.startsWith("/course"),
        },
        {
          href: "/subjects",
          label: "Subjects",
          icon: IconBook2,
          active: pathname.startsWith("/subjects"),
        },
        {
          href: "/academic-session",
          label: "Academic Sessions",
          icon: IconCalendarEvent,
          active: pathname.startsWith("/academic-session"),
        },
        {
          href: "/admission-open",
          label: "Admission Opens",
          icon: IconUserCheck,
          active: pathname.startsWith("/admission-open"),
        },
        {
          href: "/verify/payment",
          label: "Verify Payment",
          icon: IconUserCheck,
          active: pathname.startsWith("/verify/payment"),
        },
        {
          href: "/tender",
          label: "Tenders",
          icon: IconFileText,
          active: pathname.startsWith("/tender"),
        },
      ],
    },
    {
      groupLabel: "Student Operations",
      menus: [
        {
          href: "/admission",
          label: "Admission",
          icon: IconUserCheck,
          active: pathname.startsWith("/admission"),
        },
        {
          href: "/examination",
          label: "Examination",
          icon: IconClipboardCheck,
          active: pathname.startsWith("/examination"),
        },
      ],
    },
  ];
}
