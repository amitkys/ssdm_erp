"use client";

import { useState, useEffect, useCallback } from "react";
import { SecretGate } from "./_components/secret-gate";
import { AddPaymentForm } from "./_components/add-payment-form";
import { PaymentTable } from "./_components/payment-table";
import { ReceiptPrint } from "./_components/receipt-print";

type PaymentRecord = {
  id: string;
  invoiceNumber: string;
  reason: string;
  name: string;
  amount: number;
  address: string;
  purpose: string;
  createdAt: Date;
};

export default function MiscPaymentMain() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(
    null,
  );

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("misc-payment-auth");
    if (stored === "true") {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handlePaymentCreated = useCallback((payment: PaymentRecord) => {
    setReceiptPayment(payment);
  }, []);

  const handlePrintReceipt = useCallback((payment: PaymentRecord) => {
    setReceiptPayment(payment);
  }, []);

  const handleCloseReceipt = useCallback(() => {
    setReceiptPayment(null);
  }, []);

  // While checking sessionStorage, show nothing to avoid flash
  if (checkingAuth) {
    return null;
  }

  // Show secret gate if not authenticated
  if (!authenticated) {
    return <SecretGate onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Miscellaneous Payment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Record miscellaneous payments and generate receipts
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <AddPaymentForm onPaymentCreated={handlePaymentCreated} />
        <PaymentTable onPrintReceipt={handlePrintReceipt} />
      </main>

      {/* Receipt overlay */}
      {receiptPayment && (
        <ReceiptPrint payment={receiptPayment} onClose={handleCloseReceipt} />
      )}
    </div>
  );
}
