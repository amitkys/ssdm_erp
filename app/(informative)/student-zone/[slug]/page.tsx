import { notFound } from "next/navigation";
import { getCollegeConfig } from "@/lib/college-config";
import StudentZoneClient from "./student-zone-client";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug !== "holidays" && slug !== "syllabus") {
    notFound();
  }

  const config = getCollegeConfig();

  return <StudentZoneClient slug={slug} config={config} />;
}
