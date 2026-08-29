import { IconAlertCircle } from "@tabler/icons-react";
import { ContentLayout } from "@/components/content-layout";
import { getStudentDocumentUrls } from "./lib/action";
import { UpdateDocumentsClient } from "./_components/update-documents-client";

export default async function UpdateDocumentsPage() {
  const result = await getStudentDocumentUrls();

  if (!result.success || !result.data) {
    return (
      <ContentLayout title="Update Documents">
        <div className="max-w-xl mx-auto mt-12 bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse dark:bg-red-950 dark:text-red-400">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Unable to Load Documents
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {result.message ||
                "Could not fetch your document details. Please try again later or contact the administrator."}
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Update Documents">
      <UpdateDocumentsClient
        currentPhoto={result.data.photo}
        currentSignature={result.data.signature}
      />
    </ContentLayout>
  );
}
