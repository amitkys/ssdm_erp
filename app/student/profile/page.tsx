import { IconAlertCircle } from "@tabler/icons-react";
import { ContentLayout } from "@/components/content-layout";
import { ProfileSidebar } from "./_components/profile-sidebar";
import { ProfileTabs } from "./_components/profile-tabs";
import { fetchStudentProfile } from "./query/fetch-student-profile";

export default async function StudentProfilePage() {
  const result = await fetchStudentProfile();

  if (!result.success || !result.data) {
    return (
      <ContentLayout title="My Profile">
        <div className="max-w-xl mx-auto mt-12 bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse dark:bg-red-950 dark:text-red-400">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Profile Not Found
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {result.message ||
                "Your login credentials are not currently linked with any active student record. Please contact the college administrator."}
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  const student = result.data;

  return (
    <ContentLayout title="My Profile">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <ProfileSidebar student={student} />
          <ProfileTabs student={student} />
        </div>
      </div>
    </ContentLayout>
  );
}
