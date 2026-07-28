"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminCertificateRequestsQuery } from "../query/get-certificate-requests";
import { CertificateReviewDialog } from "./certificate-review-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconSearch,
  IconDownload,
  IconCheck,
  IconClock,
  IconLoader2,
  IconEdit,
} from "@tabler/icons-react";

export function CertificateRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [collegeRollSearch, setCollegeRollSearch] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);

  const { data: requests, isLoading } = useQuery(
    getAdminCertificateRequestsQuery({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      collegeRoll: collegeRollSearch,
    }),
  );

  const handleDownload = (requestId: string, typeParam?: string) => {
    let url = `/api/certificates/download/${requestId}`;
    if (typeParam) {
      url += `?type=${typeParam}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR */}
      <Card className="border-border shadow-sm rounded-2xl">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs Filter */}
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-auto"
          >
            <TabsList className="rounded-xl h-10 p-1 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="ALL" className="rounded-lg text-xs font-bold px-4">
                ALL (PENDING & APPROVED)
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="rounded-lg text-xs font-bold px-4">
                PENDING
              </TabsTrigger>
              <TabsTrigger value="APPROVED" className="rounded-lg text-xs font-bold px-4">
                APPROVED
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search by College Roll */}
          <div className="relative w-full sm:w-72">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by College Roll..."
              value={collegeRollSearch}
              onChange={(e) => setCollegeRollSearch(e.target.value)}
              className="pl-9 rounded-xl h-10 text-xs font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* REQUESTS TABLE */}
      <Card className="border-border shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border py-4">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
            Certificate Requests List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              <span>Loading certificate requests...</span>
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No matching certificate requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableHead className="font-bold">Certificate No.</TableHead>
                    <TableHead className="font-bold">Student Name</TableHead>
                    <TableHead className="font-bold">College Roll</TableHead>
                    <TableHead className="font-bold">Certificate Type</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Purpose</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                        {req.certificate_No || "—"}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 dark:text-slate-100">
                        {req.student?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {req.student?.collegeRoll || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {req.certificate_type === "CLC"
                          ? "CLC + CHARACTER"
                          : req.certificate_type}
                      </TableCell>
                      <TableCell className="font-bold text-slate-700 dark:text-slate-200">
                        ₹{req.amount ?? req.certificate?.fee ?? 0}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-slate-500">
                        {req.purpose}
                      </TableCell>
                      <TableCell>
                        {req.status === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-bold text-[10px]"
                          >
                            <IconClock className="h-3 w-3" />
                            PENDING
                          </Badge>
                        )}
                        {req.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 font-bold text-[10px]"
                          >
                            <IconCheck className="h-3 w-3" />
                            APPROVED
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewDialogOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 text-xs font-bold gap-1"
                          >
                            <IconEdit className="h-3.5 w-3.5" />
                            Review & Approve
                          </Button>
                        )}

                        {req.status === "APPROVED" && (
                          <div className="flex items-center justify-end gap-2">
                            {req.certificate_type === "CLC" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleDownload(req.id, "CLC")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 text-xs font-bold gap-1"
                                >
                                  <IconDownload className="h-3.5 w-3.5" />
                                  CLC
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleDownload(req.id, "CHARACTER")
                                  }
                                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-8 text-xs font-bold gap-1"
                                >
                                  <IconDownload className="h-3.5 w-3.5" />
                                  CHARACTER
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleDownload(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 text-xs font-bold gap-1"
                              >
                                <IconDownload className="h-3.5 w-3.5" />
                                Download Certificate
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <CertificateReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        request={selectedRequest}
      />
    </div>
  );
}
