"use client";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "../query/get-all-department";
import { DetailsCard } from "./details-carad";

export function ListDepartment() {
  const { data, isLoading, error } = useQuery(getDepartment());

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data?.length) {
    return <div>No department found</div>;
  }
  return (
    <>
      {/* <h1>Department List</h1> */}
      <ul className="grid grid-cols-3 gap-2">
        {data.map((item) => (
          // <li key={item.id}>{item.name}</li>
          <DetailsCard key={item.id} id={item.id} name={item.name} code={item.code} description={item.description} />
        ))}
      </ul>
    </>
  );
}
