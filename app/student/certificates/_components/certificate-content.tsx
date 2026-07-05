"use client";

import { useQuery } from "@tanstack/react-query";
import { IconFileText } from "@tabler/icons-react";
import { certificateMetaQueryOptions } from "../query/use-get-certificate-meta";
import { certificateRequestsQueryOptions } from "../query/use-get-certificate-requests";
import { CertificateApplyForm } from "./certificate-apply-form";
import { CertificateTable } from "./certificate-table";
import { columns } from "./columns";

interface CertificateContentProps {
  studentId: string;
}

export function CertificateContent({ studentId }: CertificateContentProps) {
  const {
    data: meta,
    isPending: isMetaPending,
    isError: isMetaError,
    error: metaError,
  } = useQuery(certificateMetaQueryOptions());

  const {
    data: requests = [],
    isPending: isRequestsPending,
    isError: isRequestsError,
    error: requestsError,
  } = useQuery(certificateRequestsQueryOptions(studentId));

  if (isMetaPending) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading certificate configuration...
      </div>
    );
  }

  if (isMetaError) {
    return (
      <div className="text-center py-12 text-destructive text-sm">
        {metaError?.message || "Failed to load certificate fees"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Apply Form */}
      <CertificateApplyForm
        studentId={studentId}
        fees={{
          clcFee: meta.clcFee,
          characterFee: meta.characterFee,
          bonafideFee: meta.bonafideFee,
        }}
      />

      {/* Application Status Table */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
            <IconFileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Your Certificate Applications
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Track the status of your certificate requests
            </p>
          </div>
        </div>

        {isRequestsPending ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Loading applications...
          </div>
        ) : isRequestsError ? (
          <div className="text-center py-8 text-destructive text-sm">
            {requestsError?.message || "Failed to load applications"}
          </div>
        ) : (
          <CertificateTable columns={columns} data={requests} />
        )}
      </div>
    </div>
  );
}
