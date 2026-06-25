"use client";

import { useState } from "react";
import { SearchIcon, PrinterIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMiscPayments } from "../query/use-get-misc-payments";
import { format } from "date-fns";

interface PaymentTableProps {
  onPrintReceipt: (payment: {
    id: string;
    invoiceNumber: string;
    reason: string;
    name: string;
    amount: number;
    address: string;
    purpose: string;
    createdAt: Date;
  }) => void;
}

export function PaymentTable({ onPrintReceipt }: PaymentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: payments, isPending, isError, error } = useGetMiscPayments(debouncedSearch);

  // Simple debounce with timeout
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // debounce the actual search
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
    return () => clearTimeout(timeout);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>
              Search by invoice number or browse all records.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice no..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error?.message ?? "Failed to load payments"}
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {debouncedSearch
              ? "No payments found for this invoice number."
              : "No payment records yet. Create your first one above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden lg:table-cell">Address</TableHead>
                  <TableHead className="hidden lg:table-cell">Purpose</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono font-medium">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {payment.reason}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[150px] truncate">
                      {payment.address}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[150px] truncate">
                      {payment.purpose}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrintReceipt(payment)}
                      >
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
