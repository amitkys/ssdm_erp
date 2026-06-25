import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { DepartmentContent } from "./_components/department-content";
import { fetchDepartments } from "./lib/action";
import { getDepartment } from "./query/get-all-department";
import { getCoursesByDepartment } from "./query/get-courses-by-department";

export default async function DepartmentPage() {
  const queryClient = new QueryClient();

  // Prefetch departments first
  await queryClient.prefetchQuery(getDepartment());

  // Prefetch courses for each department so the sheet opens instantly
  const departmentsResult = await fetchDepartments();
  if (departmentsResult.success && departmentsResult.data) {
    await Promise.all(
      departmentsResult.data.map((dept) =>
        queryClient.prefetchQuery(getCoursesByDepartment(dept.id)),
      ),
    );
  }

  return (
    <ContentLayout title="Departments">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DepartmentContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
