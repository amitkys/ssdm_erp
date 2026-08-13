import {
	IconBell,
	IconBook,
	IconBook2,
	IconCalendarEvent,
	IconCertificate,
	IconClipboardCheck,
	IconCurrencyRupee,
	IconFileText,
	IconHierarchy2,
	IconSchool,
	IconTrendingUp,
	IconUserCheck,
	IconUserPlus,
	IconUsersGroup,
	IconUserUp,
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
			groupLabel: "DCR",
			menus: [
				{
					href: "/admission-dcr",
					label: "Admission DCR",
					icon: IconFileText,
					active: pathname.startsWith("/admission-dcr"),
				},
				{
					href: "/certificate-dcr",
					label: "Certificate DCR",
					icon: IconCertificate,
					active: pathname.startsWith("/certificate-dcr"),
				},
				{
					href: "/admission-overview",
					label: "Admission Overview",
					icon: IconTrendingUp,
					active: pathname.startsWith("/admission-overview"),
				},
				{
					href: "/fee-collection",
					label: "Fee Collection",
					icon: IconClipboardCheck,
					active: pathname.startsWith("/fee-collection"),
				},
			],
		},
		{
			groupLabel: "Admission",
			menus: [
				{
					href: "/admission-open",
					label: "Sem-I Admission",
					icon: IconUsersGroup,
					active: pathname.startsWith("/admission-open"),
				},
				{
					href: "/semester-admission-open",
					label: "Sem: II-VIII Admission",
					icon: IconUserUp,
					active: pathname.startsWith("/semester-admission-open"),
				},
				{
					href: "/enrolled-student",
					label: "Insert Sem-I Merit List",
					icon: IconUserPlus,
					active: pathname.startsWith("/enrolled-student"),
				},

			],
		},
		{
			groupLabel: "Management",
			menus: [
				{
					href: "/certificate-requests",
					label: "Certificate Requests",
					icon: IconCertificate,
					active: pathname.startsWith("/certificate-requests"),
				},
				{
					href: "/student-records",
					label: "Student Records",
					icon: IconSchool,
					active: pathname.startsWith("/student-records"),
				},
				{
					href: "/verify/payment",
					label: "Verify Payment",
					icon: IconCurrencyRupee,
					active: pathname.startsWith("/verify/payment"),
				},
				{
					href: "/department",
					label: "Departments",
					icon: IconHierarchy2,
					active: pathname.startsWith("/department"),
				},
				{
					href: "/academic-session",
					label: "Academic Sessions",
					icon: IconCalendarEvent,
					active: pathname.startsWith("/academic-session"),
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
			],
		},
		{
			groupLabel: "Notifications",
			menus: [
				{
					href: "/notice",
					label: "Notices",
					icon: IconBell,
					active: pathname.startsWith("/notice"),
				},
				{
					href: "/tender",
					label: "Tenders",
					icon: IconFileText,
					active: pathname.startsWith("/tender"),
				},
			]
		}
	];
}
