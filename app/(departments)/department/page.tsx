import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { ListDepartment } from "./_components/list-department";
import { getDepartment } from "./query/get-all-department";
import { AddDepartment } from "./_components/add-department";

export default async function DepartmentPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getDepartment());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-screen py-2 ps-3 mb-5 bg-blue-400 flex justify-center">
          <AddDepartment />
      </div>
        <ListDepartment />
    </HydrationBoundary>
  );
}
