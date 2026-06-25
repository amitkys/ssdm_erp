import { notFound } from "next/navigation";
import { getCollegeConfig } from "@/lib/college-config";
import GalleryClient from "./gallery-client";

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (type !== "photo" && type !== "video") {
    notFound();
  }

  const config = getCollegeConfig();

  return <GalleryClient type={type} config={config} />;
}
