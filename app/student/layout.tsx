import StudentPanelLayout from "./_components/student-panel-layout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentPanelLayout>{children}</StudentPanelLayout>;
}
