import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-self-center h-screen gap-6">
      Please wait...
      <Spinner className="size-8" />
    </div>
  );
}
